#!/usr/bin/env python3
"""ارفع رقم إصدار كل عمّال الخدمة بعد أي تعديل في ملفات الواجهة.
الاستعمال:  python3 tools/bump-sw.py 20261101fix1
- يضيف -TOKEN إلى const V في كل sw.js (عدا admin/sw.js)، فيحذف المتصفح النسخة القديمة ويحفظ الجديدة.
- غيّر أيضًا ?v= في index.html وقائمة F لأي ملف عدّلته، لأن Cloudflare يحفظ الرابط نفسه.
- ثم شغّل: node tests/sw-versions.cjs"""
import re,sys,subprocess
tok=sys.argv[1]
files=[f for f in subprocess.check_output(['git','ls-files','*sw.js'],text=True).split() if not f.startswith(('admin/','backend/'))]
for p in files:
    s=open(p).read();n=re.sub(r"const V='([^']*)'",lambda m:"const V='"+m.group(1)+"-"+tok+"'",s,count=1)
    if n!=s:open(p,'w').write(n);print('bumped',p)
