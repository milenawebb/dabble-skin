"""Compare actual canvas CSS and CDN tiles in Chromium, WebKit and Firefox.

Use an isolated page because this sandbox's WebKit crashes on the demo video.
Screenshots stay outside the repository. Run with python3 tests/canvas-texture.py.
"""
import asyncio
from pathlib import Path

import numpy as np
from PIL import Image
from playwright.async_api import async_playwright

ROOT = Path(__file__).resolve().parents[1]
OUT = Path('/tmp/browser/canvas-texture')
OUT.mkdir(parents=True, exist_ok=True)
CSS = (ROOT / 'src/dabble/canvas.css').read_text()
HTML = f'''<style>{CSS}
body {{ margin: 0; }}
.dabble-canvas {{ width: 960px; height: 480px; padding: 0; margin: 0;
max-width: none; box-shadow: none; }}
.dabble-canvas::before, .dabble-canvas::after {{ display: none; }}
</style><div class="dabble-canvas"></div>'''


async def main():
    images = {}
    async with async_playwright() as p:
        for name in ['chromium', 'webkit', 'firefox']:
            browser = await getattr(p, name).launch(headless=True)
            for dpr in [1, 2]:
                page = await browser.new_page(
                    viewport={'width': 1280, 'height': 1800},
                    device_scale_factor=dpr,
                )
                await page.route('**/canvas-texture-check',
                                 lambda route: route.fulfill(body=HTML, content_type='text/html'))
                await page.goto('http://localhost:8080/canvas-texture-check',
                                wait_until='networkidle')
                canvas = page.locator('.dabble-canvas')
                path = OUT / f'{name}-{dpr}x.png'
                await canvas.screenshot(path=str(path))
                pixels = np.array(Image.open(path).convert('RGB'))
                assert pixels.std() > 1, f'{name}: texture did not load'
                # Two repeats are identical, including the tile boundary.
                assert np.array_equal(pixels[:, :480*dpr], pixels[:, 480*dpr:])
                images[name, dpr] = pixels
                if name == 'chromium':
                    await page.emulate_media(forced_colors='active')
                    assert await canvas.evaluate('(e) => getComputedStyle(e).forcedColorAdjust') == 'none'
                    assert await canvas.evaluate('(e) => getComputedStyle(e).backgroundImage') != 'none'
                    await page.emulate_media(forced_colors='none')
                    # Explicitly enable the existing reduced-transparency rule,
                    # since Playwright does not offer this media emulation.
                    await page.add_style_tag(content=CSS.replace(
                        '@media (prefers-reduced-transparency: reduce)', '@media all'))
                    assert await canvas.evaluate('(e) => getComputedStyle(e).backgroundImage') == 'none'
                await page.close()
            await browser.close()
    for dpr in [1, 2]:
        reference = images['webkit', dpr]
        for name in ['chromium', 'firefox']:
            delta = np.abs(images[name, dpr].astype(int) - reference.astype(int))
            assert delta.max() <= 1, f'{name} at {dpr}x: max channel difference {delta.max()}'
            print(f'{name} matches WebKit at {dpr}x: max channel difference {delta.max()}')
    print('Seamless repetition and existing special-display behavior passed.')


asyncio.run(main())