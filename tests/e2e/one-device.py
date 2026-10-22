"""E2E: latest login wins. Two browser contexts sign in as the same parent: the second kicks the first, which sees the
message; with «جهاز واحد لكل حساب» off both stay signed in. Needs site + backend on one origin (BASE) with
parent@x.test / secret123 (2 students) and admin@x.test / secret123. Usage: python3 tests/e2e/one-device.py [shots-dir]"""
import asyncio, os, sys
from playwright.async_api import async_playwright
BASE = os.environ.get('BASE', 'http://127.0.0.1:8130')
SHOTS = sys.argv[1] if len(sys.argv) > 1 else None
MSG = 'تم تسجيل الدخول إلى هذا الحساب من جهاز آخر، لذلك أُغلقت الجلسة هنا.'

async def parent(b, w, h):
    c = await b.new_context(viewport={'width': w, 'height': h})
    pg = await c.new_page()
    await pg.goto(BASE + '/login.html')
    await pg.wait_for_url('**/admin-api/account/login**')
    await pg.fill('#email', 'parent@x.test'); await pg.fill('input[name=password]', 'secret123')
    await pg.click('button[type=submit]'); await pg.wait_for_url('**/login.html?sync=1')
    await pg.wait_for_selector('.pcard')
    return pg

async def check(pg):  # same as the 60 s periodic check, triggered now
    await pg.evaluate("dispatchEvent(new Event('online'))"); await pg.wait_for_timeout(1500)

async def setting(b, on):
    c = await b.new_context(); pg = await c.new_page()
    await pg.goto(BASE + '/admin-api/login')
    await pg.fill('#email', 'admin@x.test'); await pg.fill('input[name=password]', 'secret123'); await pg.click('button[type=submit]')
    await pg.goto(BASE + '/admin-api/admin/manage/settings?tab=accounts')
    box = pg.locator('input[name=single_device]')
    if await box.is_checked() != on:
        await pg.locator('label.sw', has=box).click()
    await pg.click('#save'); await pg.wait_for_load_state('networkidle')
    await pg.goto(BASE + '/admin-api/admin/manage/settings?tab=accounts')
    assert await pg.locator('input[name=single_device]').is_checked() == on
    await c.close()

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        a = await parent(b, 390, 844)
        bb = await parent(b, 1024, 800)          # second device logs in: first is revoked
        await check(a)
        await a.wait_for_selector('#bustan-kicked', timeout=5000)
        assert MSG in await a.inner_text('#bustan-kicked')
        if SHOTS: await a.screenshot(path=f'{SHOTS}/kicked-390.png')
        await check(bb); assert await bb.locator('#bustan-kicked').count() == 0, 'latest device stays signed in'
        # A lesson on the revoked device stays locked, also on reload
        await a.goto(BASE + '/g1/math/'); await a.wait_for_timeout(2500)
        assert 'admin-api/account/login' in a.url or await a.locator('#bustan-kicked').count() == 1, a.url
        print('PASS second login kicks the first; first sees the message; lesson locked')
        await setting(b, False)
        a2 = await parent(b, 390, 844)          # with the setting off, another login does not kick
        await check(bb); await check(a2)
        assert await bb.locator('#bustan-kicked').count() == 0 and await a2.locator('#bustan-kicked').count() == 0
        print('PASS setting off: both devices stay signed in')
        await setting(b, True)
        await b.close()
asyncio.run(main())
