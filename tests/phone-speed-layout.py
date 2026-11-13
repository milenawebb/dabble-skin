"""Run against preview or a served production build: DABBLE_TEST_URL=https://... python3 tests/phone-speed-layout.py."""
import asyncio
import os
from pathlib import Path
from playwright.async_api import async_playwright

async def main():
    screenshots = Path('/tmp/browser/plain-phone-speed')
    screenshots.mkdir(parents=True, exist_ok=True)
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        for width in [320, 360, 390, 430, 1280]:
            context = await browser.new_context(viewport={'width': width, 'height': 1800 if width == 1280 else 844}, has_touch=True, is_mobile=width != 1280)
            page = await context.new_page()
            await page.goto(os.environ.get('DABBLE_TEST_URL', 'http://localhost:8080'), wait_until='networkidle')
            await page.wait_for_timeout(1500)
            if width == 1280:
                await page.get_by_role('radio', name='Mobile', exact=True).click()
                await page.wait_for_timeout(500)
            trigger = page.get_by_role('button', name='Playback speed', exact=True)
            await trigger.tap()
            row = page.get_by_role('radiogroup', name='Playback speed', exact=True)
            await row.wait_for(state='visible')
            video = await page.locator('video').bounding_box()
            box = await row.bounding_box()
            assert video and box
            assert box['x'] >= video['x'] and box['y'] >= video['y']
            assert box['x'] + box['width'] <= video['x'] + video['width']
            assert box['y'] + box['height'] <= video['y'] + video['height']
            inset = min(8, max(0, (video['width'] - 220) / 2))
            assert abs(box['x'] - video['x'] - inset) < 1
            assert abs(box['y'] - video['y'] - 8) < 1
            assert await row.evaluate('e => e.parentElement.classList.contains("phone-video-controls") && !e.closest("[popover]")')
            center = page.locator('.phone-video-play')
            if await center.count():
                play = await center.bounding_box()
                assert play and box['y'] + box['height'] <= play['y']
            assert await row.get_by_role('radio').count() == 5
            pill_boxes = [await pill.bounding_box() for pill in await row.get_by_role('radio').all()]
            for pill in pill_boxes:
                assert pill and pill['width'] >= 44 and pill['height'] >= 44, (width, pill)
            assert await row.get_by_role('radio', checked=True).evaluate('e => e === document.activeElement')
            print(f'{width}: smallest pill {min(pill["width"] for pill in pill_boxes):.2f}px x 44px')
            await page.locator('.dabble-skin').screenshot(path=str(screenshots / f'{width}.png'))
            await row.get_by_role('radio', name='1.25x', exact=True).tap()
            await row.wait_for(state='hidden')
            assert await page.locator('video').evaluate('v => v.playbackRate') == 1.25
            assert await trigger.is_visible()
            assert await trigger.evaluate('e => getComputedStyle(e).outlineStyle === "none" && getComputedStyle(e).boxShadow === "none"')
            await trigger.tap()
            await row.wait_for(state='visible')
            assert await row.get_by_role('radio', name='1.25x', exact=True).get_attribute('aria-checked') == 'true'
            await row.get_by_role('radio', name='1.25x', exact=True).tap()
            await row.wait_for(state='hidden')
            await trigger.tap()
            await page.keyboard.press('Escape')
            await row.wait_for(state='hidden')
            await trigger.tap()
            await page.touchscreen.tap(video['x'] + 3, video['y'] + video['height'] - 3)
            await row.wait_for(state='hidden')
            print(f'{width}: containment, center clearance, direct-child rendering, rate selection, tap focus and dismissal passed')
            await context.close()
        await browser.close()

asyncio.run(main())