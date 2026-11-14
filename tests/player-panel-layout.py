"""Check video-contained desktop panels: python3 tests/player-panel-layout.py."""
import asyncio
import os
from pathlib import Path
from playwright.async_api import async_playwright

async def contained(page, selector, text=False):
    panel = page.locator(selector)
    await panel.wait_for(state='visible')
    await page.wait_for_timeout(150)
    result = await panel.evaluate('''(e, text) => {
      const b=e.getBoundingClientRect(), v=document.querySelector('video').getBoundingClientRect();
      const inside=r=>r.left>=v.left-1 && r.top>=v.top-1 && r.right<=v.right+1 && r.bottom<=v.bottom+1;
      const errors=[];
      if (!inside(b)) errors.push('panel outside video');
      if (e.scrollWidth>e.clientWidth || e.scrollHeight>e.clientHeight) errors.push('panel scrolls');
      if (text) {
        const walker=document.createTreeWalker(e,NodeFilter.SHOW_TEXT);
        while(walker.nextNode()) {
          const n=walker.currentNode;
          if(!n.textContent.trim() || !n.parentElement.checkVisibility()) continue;
          const range=document.createRange(); range.selectNodeContents(n);
          for(const r of range.getClientRects()) if(!inside(r) || r.left<b.left-1 || r.right>b.right+1) errors.push(n.textContent);
        }
      }
      return {errors, box:b.toJSON(), video:v.toJSON()};
    }''', text)
    assert not result['errors'], (selector, result)
    return result

async def check_panels(page, label, screenshots):
    trigger=page.get_by_role('button',name='Keyboard shortcuts',exact=True)
    await trigger.click()
    dialog=page.get_by_role('dialog',name='Keys',exact=True)
    result=await contained(page,'.dabble-keys-panel',True)
    assert await dialog.evaluate('e=>!e.closest("[popover]") && e.parentElement.classList.contains("dabble-keys-overlay") && e.parentElement.parentElement.classList.contains("dabble-skin")')
    assert abs(result['box']['x']+result['box']['width']/2-result['video']['x']-result['video']['width']/2)<1
    assert abs(result['box']['y']+result['box']['height']/2-result['video']['y']-result['video']['height']/2)<1
    await page.keyboard.press('Tab')
    assert await dialog.evaluate('e=>e.contains(document.activeElement)')
    await page.keyboard.press('Shift+Tab')
    assert await dialog.evaluate('e=>e.contains(document.activeElement)')
    await page.locator('.dabble-skin').screenshot(path=str(screenshots/f'{label}-keys.png'))
    await page.keyboard.press('Escape')
    await dialog.wait_for(state='hidden')
    await page.wait_for_timeout(100)
    assert await trigger.evaluate('e=>e===document.activeElement')
    await trigger.click()
    await page.get_by_role('button',name='Close Keys',exact=True).click()
    await page.wait_for_timeout(100)
    assert await trigger.evaluate('e=>e===document.activeElement')
    await page.get_by_role('button',name='Playback speed',exact=True).click()
    await contained(page,'.dabble-speed-menu',True)
    await page.locator('.dabble-skin').screenshot(path=str(screenshots/f'{label}-speed.png'))
    await page.keyboard.press('Escape')
    await page.locator('.dabble-mute').hover()
    await contained(page,'.dabble-volume-popup')
    await page.locator('.dabble-skin').screenshot(path=str(screenshots/f'{label}-volume.png'))
    await page.mouse.move(0,0)
    await page.keyboard.press('Escape')
    print(f'{label}: Keys centered, all text visible, no scrolling; focus trap/return, close/Escape, speed and volume containment passed')

async def main():
    screenshots=Path('/tmp/browser/player-panel-layout'); screenshots.mkdir(parents=True,exist_ok=True)
    async with async_playwright() as p:
        browser=await p.chromium.launch(headless=True)
        for width in [600,756,1056]:
            page=await browser.new_page(viewport={'width':1280,'height':1800})
            await page.goto(os.environ.get('DABBLE_TEST_URL','http://localhost:8080'),wait_until='networkidle')
            # Resize the real canvas; its ResizeObserver drives the production layout.
            await page.locator('.dabble-canvas').evaluate('(e,w)=>{e.style.width=w+"px";e.style.maxWidth="none"}',width)
            await page.wait_for_timeout(500)
            assert abs((await page.locator('.dabble-canvas').bounding_box())['width']-width)<1
            await check_panels(page,str(width),screenshots)
            await page.locator('.dabble-fullscreen').click()
            await page.wait_for_function('document.fullscreenElement!==null')
            await page.wait_for_timeout(300)
            await check_panels(page,f'{width}-fullscreen',screenshots)
            await page.close()
        await browser.close()

asyncio.run(main())
