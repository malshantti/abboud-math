"""E2E: a device with stale local profiles signs in as a parent with 2 students; the picker shows exactly those 2.
Needs the site + backend on one origin (BASE, default http://127.0.0.1:8130) with parent@x.test / secret123 owning
students عبد اللطيف (grade 1, local_id p7) and سندس (grade 6). Usage: python3 tests/e2e/students-picker.py [shots-dir]"""
import asyncio, json, os, sys
from playwright.async_api import async_playwright
BASE = os.environ.get('BASE', 'http://127.0.0.1:8130')
SHOTS = sys.argv[1] if len(sys.argv) > 1 else None
STALE = [{'id': n, 'name': nm, 'avatar': 'idle', 'pin': 'sha256:00', 'salt': 'aa', 'created': 1} for n, nm in
         [('p1', 'ميرا'), ('p2', 'عبد الرحمن'), ('p3', 'خميس'), ('p4', 'سيقبلاتنم'), ('p7', 'عبود القديم')]]

async def run(b, w, h):
    c = await b.new_context(viewport={'width': w, 'height': h})
    pg = await c.new_page()
    await pg.goto(BASE + '/404.html')
    await pg.evaluate("""s=>{localStorage.clear();localStorage.setItem('bustan_profiles',JSON.stringify(s));
      for(const p of s){localStorage.setItem('bustan_p_'+p.id+'__store_v1','1');localStorage.setItem('bustan_p_'+p.id+'__abboud_math_v1',JSON.stringify({name:p.name,points:p.id==='p7'?42:5}))}
      localStorage.setItem('bustan_roster',JSON.stringify({email:'other@x.test',students:s.slice(0,4).map((p,i)=>({sid:90+i,local:p.id,name:p.name,grade:3}))}));}""", STALE)
    await pg.goto(BASE + '/login.html')
    await pg.wait_for_url('**/admin-api/account/login**', timeout=15000)  # no linked account: sent to login
    await pg.fill('#email', 'parent@x.test'); await pg.fill('input[name=password]', 'secret123')
    await pg.click('button[type=submit]')
    await pg.wait_for_url('**/login.html?sync=1', timeout=15000)
    await pg.wait_for_selector('.pcard', timeout=15000); await pg.wait_for_timeout(800)
    names = await pg.eval_on_selector_all('.pcard b', 'e=>e.map(x=>x.textContent)')
    grades = await pg.eval_on_selector_all('.pcard small', 'e=>e.map(x=>x.textContent)')
    body = await pg.inner_text('#view')
    assert sorted(names) == sorted(['عبد اللطيف', 'سندس']), names
    assert grades == ['الصف الأول', 'الصف السادس'], grades
    assert 'طالب جديد' not in body and 'إدارة الطلاب من صفحة الحساب' in body, body
    st = await pg.evaluate("()=>({list:JSON.parse(localStorage.getItem('bustan_profiles')).map(p=>p.id+':'+p.name),p7:localStorage.getItem('bustan_p_p7__abboud_math_v1'),p1:localStorage.getItem('bustan_p_p1__abboud_math_v1')})")
    assert sorted(st['list']) == sorted(['p7:عبد اللطيف', 'ps2:سندس']), st
    assert json.loads(st['p7'])['points'] == 42, 'progress kept for the profile mapped to a server student'
    assert st['p1'] is None, 'stale profile slots removed'
    if SHOTS:
        await pg.screenshot(path=f'{SHOTS}/picker-after{"" if w == 1024 else "-390"}.png')
    if w == 1024:  # the parent sets the PIN on the account page; the device uses it
        await pg.goto(BASE + '/admin-api/account'); await pg.fill('#n1 ~ input, input[name=pin] >> nth=0', '١٢٣٤')
        await pg.click('form.fields >> nth=0 >> button[type=submit]'); await pg.wait_for_load_state('networkidle')
        assert 'الرقم السري محدَّد' in await pg.inner_text('.kids li >> nth=0')
        await pg.goto(BASE + '/login.html'); await pg.wait_for_selector('.pcard'); await pg.wait_for_timeout(600)
        await pg.click('.pcard[data-id=p7]'); await pg.wait_for_selector('#pinIn input')
        await pg.fill('#pinIn input', '1234'); await pg.wait_for_url(lambda u: 'login.html' not in u, timeout=10000)
        print('PASS parent-set PIN opens the student profile')
    print(f'PASS {w}px: picker shows exactly', names, grades)
    await c.close()

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch()
        for w, h in [(1024, 800), (390, 844)]:
            await run(b, w, h)
        await b.close()
asyncio.run(main())
