"""Phone scroll regression: Chromium trusted drag; WebKit native-listener contract.

Run: python3 tests/phone-paint-scroll.py [--webkit]
Playwright WebKit only exposes touch taps, not trusted touch drags. Its separate
contract check cannot establish physical iPhone scrolling/bounce behavior.
"""
import argparse
import asyncio
import os
from pathlib import Path
from playwright.async_api import async_playwright


async def main():
    args = argparse.ArgumentParser()
    args.add_argument('--webkit', action='store_true')
    options = args.parse_args()
    screenshots = Path('/tmp/browser/phone-paint-scroll')
    screenshots.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as p:
        browser = await (p.webkit if options.webkit else p.chromium).launch(headless=True)
        for width in [320, 390]:
            context = await browser.new_context(viewport={'width': width, 'height': 844}, has_touch=True, is_mobile=True)
            page = await context.new_page()
            await page.goto(os.environ.get('DABBLE_TEST_URL', 'http://localhost:8080'), wait_until='domcontentloaded')
            await page.get_by_role('button', name='Start painting', exact=True).tap(timeout=15000)
            canvas = page.locator('.dabble-canvas')
            await canvas.scroll_into_view_if_needed()
            await page.wait_for_timeout(300)
            box = await canvas.bounding_box()
            assert box
            x, y = box['x'] + 8, box['y'] + box['height'] - 15
            assert await page.evaluate('([x,y]) => document.elementFromPoint(x,y)?.classList.contains("dabble-paint")', [x, y])
            assert await page.locator('.dabble-paint').evaluate('e => getComputedStyle(e).touchAction === "none"')
            if options.webkit:
                # Dispatch actual TouchEvent objects to test cancelability, not
                # browser scrolling: synthetic events have no default scroll.
                result = await page.locator('.dabble-paint').evaluate('''e => {
                    const t = new Touch({identifier: 1, target: e, clientX: 8, clientY: 8});
                    const fire = type => { const event = new TouchEvent(type, {bubbles:true, cancelable:true, changedTouches:[t], touches:type === 'touchend' ? [] : [t]}); e.dispatchEvent(event); return event.defaultPrevented; };
                    const start = fire('touchstart'), move = fire('touchmove');
                    const locked = getComputedStyle(document.body).overscrollBehavior;
                    fire('touchend'); return {start, move, locked, restored:getComputedStyle(document.body).overscrollBehavior};
                }''')
                assert result['start'] and result['move'] and result['locked'] == 'none' and result['restored'] != 'none', result
                print(f'WebKit {width}: native touch cancellation contract passed; trusted dragging is unavailable')
            else:
                session = await context.new_cdp_session(page)

                async def drag(start_x, start_y, delta):
                    await session.send('Input.dispatchTouchEvent', {'type': 'touchStart', 'touchPoints': [{'x': start_x, 'y': start_y}]})
                    for step in range(1, 16):
                        await session.send('Input.dispatchTouchEvent', {'type': 'touchMove', 'touchPoints': [{'x': start_x, 'y': start_y + delta * step / 15}]})
                        await page.wait_for_timeout(20)
                    await session.send('Input.dispatchTouchEvent', {'type': 'touchEnd', 'touchPoints': []})
                    await page.wait_for_timeout(300)

                before_scroll = await page.evaluate('window.scrollY')
                before_count = int(await canvas.get_attribute('data-stroke-count'))
                await drag(x, y, 150)
                assert await page.evaluate('window.scrollY') == before_scroll
                assert int(await canvas.get_attribute('data-stroke-count')) == before_count + 1
                saved = await page.evaluate('Object.keys(localStorage).filter(k => k.startsWith("dabble-painting")).map(k => JSON.parse(localStorage.getItem(k)))')
                assert any(len(painting.get('strokes', [])) == before_count + 1 for painting in saved), saved
                assert await page.evaluate('getComputedStyle(document.body).overscrollBehavior') != 'none'
                await page.screenshot(path=str(screenshots / f'{width}-painted.png'))
                # Left page gutter, outside the canvas and all player controls.
                assert not await page.evaluate('y => !!document.elementFromPoint(2,y)?.closest(".dabble-canvas")', y)
                outside_before = await page.evaluate('window.scrollY')
                await drag(2, y, -150)
                assert await page.evaluate('window.scrollY') > outside_before
                print(f'Chromium {width}: 150px drag past edge saved a stroke without scrolling; outside touch drag scrolled')
            await context.close()
        await browser.close()


asyncio.run(main())