import json,os,re,shutil,sys,runpy
R='/workspace/abboud-math-audit';SRC=R+'/g6/science';S='/workspace/bustan/newgrades/src'
GN={4:'الرّابع',5:'الخامس',7:'السّابع'};GS={4:'الرابع',5:'الخامس',7:'السابع'}
SUBJ={'math':('الرياضيات','الرّياضيّات','math','#2f6f4f')}
VER='20261029g1'
def build(g,sub,units):
    name,namev,ab,color=SUBJ[sub];d=f'{R}/g{g}/{sub}'
    if os.path.exists(d):shutil.rmtree(d)
    os.makedirs(d)
    for f in os.listdir(SRC):
        if f in('bookimg','sc.js','sc-gen.js','content.js','media.js','sw.js','index.html','manifest.webmanifest'):continue
        p=SRC+'/'+f
        (shutil.copytree if os.path.isdir(p) else shutil.copy2)(p,d+'/'+f)
    # explore: وضع الدروس العام + أجزاء موجودة فقط
    ex=open(SRC+'/explore.js').read()
    ex=ex.replace("const science=C.subject==='science';","const science=C.subject==='science'||!!C.lesmode;",1)
    ex=ex.replace("[1,2].map(n=>'<a href=\"#/home/'","[...new Set(U.map(u=>u.part))].map(n=>'<a href=\"#/home/'",1)
    ex=re.sub(r"\(science\?'الأفكار والمصطلحات من محتوى كتاب الطالب\. الأشكال المرفقة مقتطفات من الكتاب، وزر التدريب يفتح أسئلة إضافية مولّدة\.'","(C.lesmode?'الدروس وترتيبها وأرقام صفحاتها من فهرس كتاب الطالب (المنهاج الفلسطيني، الجزء الأول). الشرح والأمثلة والأسئلة المولّدة من إعداد بستان التعلّم.':science?'الأفكار والمصطلحات من محتوى كتاب الطالب. الأشكال المرفقة مقتطفات من الكتاب، وزر التدريب يفتح أسئلة إضافية مولّدة.'",ex,count=1)
    ex=ex.replace("science?'اقرأ الفكرة، وشاهد أشكال الكتاب، ثم جرّب وتدرّب.'","C.lesmode?'اقرأ الفكرة، وادرس الأمثلة المحلولة، ثم تدرّب بمسائل متجدّدة.':science?'اقرأ الفكرة، وشاهد أشكال الكتاب، ثم جرّب وتدرّب.'",1);assert 'وادرس الأمثلة' in ex
    assert 'C.lesmode?' in ex and '!!C.lesmode' in ex and 'new Set(U.map' in ex
    open(d+'/explore.js','w').write(ex)
    co=open(SRC+'/core.js').read()
    co=co.replace("function offline(){return ","function offline(){if(C.lesmode)return '';return ",1);assert "if(C.lesmode)return ''" in co
    co=co.replace("'../math/img/rank-","'../../g6/math/img/rank-");assert '../../g6/math/img/rank-' in co
    open(d+'/core.js','w').write(co)
    cs=open(SRC+'/core.css').read().replace('../arabic/fonts/naskh.woff2','../../g6/arabic/fonts/naskh.woff2');open(d+'/core.css','w').write(cs)
    shutil.copy2(S+'/les.js',d+'/les.js');shutil.copy2(S+'/mgen.js',d+'/mgen.js')
    UN=[]
    for ui,u in enumerate(units,1):
        les=[]
        for li,l in enumerate(u['les'],1):
            x=dict(l);x['id']=f'U{ui}L{li}';les.append(x)
        UN.append({'id':f'U{ui}','part':1,'t':u['t'],'les':les})
    open(d+'/content.js','w').write('// '+namev+' — الصف '+GS[g]+' — الجزء الأول. ترتيب الوحدات والدروس وأرقام الصفحات من فهرس كتاب الطالب (وزارة التربية والتعليم الفلسطينية).\nwindow.UNITS='+json.dumps(UN,ensure_ascii=False)+';\n')
    pre=f'g{g}{ab}-';key=f'bustan_g{g}_{sub}_v1';path=f'g{g}/{sub}/'
    title=f'{namev} — الصّفّ {GN[g]}'
    h=open(SRC+'/index.html').read()
    h=h.replace('g6/science/',path).replace('bustan_g6_science_v1',key).replace("ap:'g6sci'","ap:'g%d%s'"%(g,ab)).replace("grade:6,subject:'science'",f"grade:{g},subject:'{sub}'")
    h=h.replace("title:'العلوم والحياة — الصّفّ السّادس',audio:false","title:'%s',audio:false,lesmode:true"%title)
    desc=f'{name} للصف {GS[g]} (الجزء الأول): دروس المنهاج الفلسطيني بأفكارها ومفاهيمها، وأمثلة محلولة، وتدريب متجدّد ومغامرات مع زيتون.'
    h=re.sub(r'content="العلوم والحياة للصف السادس[^"]*"','content="%s"'%desc,h)
    h=h.replace('العلوم والحياة — الصف السادس — بستان التعلّم',f'{name} — الصف {GS[g]} — بستان التعلّم')
    h=h.replace('<small>/ العلوم السّادس</small>',f'<small>/ {name} {GN[g]}</small>')
    h=h.replace('العلوم والحياة — الصّفّ السّادس<br>',title+'<br>')
    h=h.replace('<a href="#/lab" data-t="lab" data-ic="lab"><span>المختبر</span></a>','<a href="#/lab" data-t="lab" data-ic="target"><span>الورشة</span></a>')
    h=re.sub(r'<script src="content\.js\?v=[^"]+"></script>\n<script src="core\.js\?v=[^"]+"></script>\n<script src="sc-gen\.js\?v=[^"]+"></script>\n<script src="sc\.js\?v=[^"]+"></script>\n<script src="explore\.js\?v=[^"]+"></script>',
      f'<script src="content.js?v={VER}"></script>\n<script src="core.js?v={VER}"></script>\n<script src="mgen.js?v={VER}"></script>\n<script src="les.js?v={VER}"></script>\n<script src="explore.js?v={VER}"></script>',h)
    h=re.sub(r'(core|explore)\.css\?v=[^"]+',r'\1.css?v='+VER,h)
    assert 'les.js' in h and 'g6' not in h and 'sci' not in h.replace('description','') , [m for m in re.findall(r'.{30}(?:g6|sci).{30}',h)]
    open(d+'/index.html','w').write(h)
    m=json.load(open(SRC+'/manifest.webmanifest'));m['name']=title;m['short_name']=f'{name} {GS[g]}';json.dump(m,open(d+'/manifest.webmanifest','w'),ensure_ascii=False)
    sw=open(SRC+'/sw.js').read()
    files=re.search(r',F=(\[.*?\]);',sw).group(1);F=json.loads(files)
    F=[f.replace('../math/img/','../../g6/math/img/').replace('../arabic/fonts/','../../g6/arabic/fonts/') for f in F]
    F=[f for f in F if not f.startswith(('content.js','core.','explore.','sc','media.js'))]
    F+=[f'content.js?v={VER}',f'core.css?v={VER}',f'core.js?v={VER}',f'explore.js?v={VER}',f'explore.css?v={VER}',f'mgen.js?v={VER}',f'les.js?v={VER}']
    sw=re.sub(r"const V='[^']*',PRE='g6sci-',F=\[.*?\];",f"const V='{pre}{VER}',PRE='{pre}',F={json.dumps(F,ensure_ascii=False)};",sw,count=1)
    assert pre in sw and 'g6sci' not in sw
    open(d+'/sw.js','w').write(sw)
    for f in F:
        p=f.split('?')[0]
        if p in('./',) :continue
        assert os.path.exists(os.path.normpath(d+'/'+p)),(g,f)
    # css under new name
    os.rename(d+'/core.css',d+'/core.css') 
    print('built',path,sum(len(u['les']) for u in UN),'lessons')
for g in (4,5,7):
    build(g,'math',runpy.run_path(f'{S}/content/math{g}.py')['U'])
