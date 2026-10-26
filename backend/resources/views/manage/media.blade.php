@extends('layouts.manage')
@section('title', 'مكتبة الوسائط')
@section('content')
<style>
.md-bar{display:flex;flex-wrap:wrap;gap:10px;align-items:end;margin-bottom:14px}.md-bar>div{display:flex;flex-direction:column;gap:4px}
.md-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:12px}
.md-it{background:#fff;border:1px solid var(--line,#e2e7d9);border-radius:14px;padding:8px;display:flex;flex-direction:column;gap:6px;cursor:pointer;text-align:right;font:inherit}
.md-it:hover,.md-it:focus-visible{border-color:#6f9e23;outline:none;box-shadow:0 0 0 3px #6f9e2333}
.md-th{height:120px;border-radius:10px;background:#f4f6ef center/contain no-repeat;display:grid;place-items:center;font-size:34px}
.md-th img{max-width:100%;max-height:120px;object-fit:contain}
.md-n{font-size:12px;direction:ltr;text-align:left;word-break:break-all;color:#29392b}.md-tag{font-size:11px;background:#fff3cd;border-radius:6px;padding:1px 6px;align-self:flex-start}
.md-pane{position:fixed;inset:0;background:#0006;display:none;place-items:center;z-index:50;padding:16px}.md-pane.on{display:grid}
.md-box{background:#fff;border-radius:18px;max-width:760px;width:100%;max-height:92vh;overflow:auto;padding:20px}
.md-prev{background:#f4f6ef;border-radius:12px;padding:10px;text-align:center}.md-prev img{max-width:100%;max-height:300px}
.md-cmp{display:grid;grid-template-columns:1fr 1fr;gap:10px}@media(max-width:640px){.md-cmp{grid-template-columns:1fr}}
.md-url{direction:ltr;font-size:12px;width:100%}
</style>
<div class="head"><h1>مكتبة الوسائط</h1></div>
<p class="lead">كل صور الموقع وأصواته ({{ number_format($total) }} ملفًا) في مكان واحد: ابحث واستمع، وارفع ملفات جديدة، واستبدل أي صورة أو صوت. عند الاستبدال يبقى الملف الأصلي محفوظًا، ويرى الطلاب البديل في كل مكان يُستخدم فيه الملف، ويمكنك إرجاع الأصل بضغطة.</p>
@if (session('status'))<p class="alert ok" role="status">{{ session('status') }}</p>@endif
@if (session('mail_error'))<p class="alert err" role="alert">{{ session('mail_error') }}</p>@endif
@if ($errors->any())<p class="alert err" role="alert">{{ $errors->first() }}</p>@endif
@unless ($writable)<div class="note">@include('partials.admin-icon',['name'=>'alert'])<p>لا يمكن للخادم الكتابة في مجلد الموقع ({{ \App\Support\MediaLibrary::root() }})، فلن ينجح الرفع حتى تُصلح الصلاحيات.</p></div>@endunless
<section class="card" style="margin-bottom:16px">
<h2 style="margin-top:0">@include('partials.admin-icon',['name'=>'plus'])رفع ملف جديد</h2>
<form method="post" action="{{ route('manage.media.upload') }}" enctype="multipart/form-data" class="md-bar">@csrf
  <div><label for="up">صورة (PNG/JPG/WebP/GIF) أو صوت (MP3/OGG/WAV/M4A)، حتى ١٦ ميغابايت</label><input id="up" type="file" name="file" required accept="image/png,image/jpeg,image/webp,image/gif,audio/mpeg,audio/ogg,audio/wav,audio/mp4,.m4a"></div>
  <button class="btn" type="submit">رفع</button>
</form>
<p class="hint" style="margin:0">تُحفظ الملفات المرفوعة في <code dir="ltr">media/u/</code>. انسخ رابطها لاستخدامه، أو اخترها مباشرة من زر «من مكتبة الوسائط» في منشئ المحتوى ومصمم الاختبارات.</p>
</section>
<div class="md-bar" role="search">
  <div><label for="q">بحث باسم الملف</label><input id="q" type="search" placeholder="مثل: zaytoun أو rank" dir="ltr"></div>
  <div><label for="ty">النوع</label><select id="ty"><option value="">الكل</option><option value="image">صور</option><option value="audio">أصوات</option></select></div>
  <div><label for="fo">المجلد</label><select id="fo"><option value="">كل المجلدات</option>@if ($map)<option value="_replaced">المستبدَلة ({{ count($map) }})</option>@endif @foreach ($folders as $f => $n)<option value="{{ $f }}">{{ $f }} ({{ $n }})</option>@endforeach</select></div>
  <form method="post" action="{{ route('manage.media.refresh') }}">@csrf<button class="btn ghost small" type="submit">تحديث الفهرس</button></form>
</div>
<p class="hint" id="cnt" aria-live="polite"></p>
<div class="md-grid" id="grid"></div>
<p style="text-align:center;margin-top:14px"><button class="btn ghost" type="button" id="more" hidden>عرض المزيد</button></p>

<div class="md-pane" id="pane" role="dialog" aria-modal="true" aria-labelledby="pt"><div class="md-box">
  <div style="display:flex;justify-content:space-between;gap:10px;align-items:center"><h2 id="pt" style="margin:0;font-size:18px">تفاصيل الملف</h2><button class="btn ghost small" type="button" data-close>إغلاق</button></div>
  <p class="md-n" id="pn"></p>
  <div class="md-cmp" id="pv"></div>
  <div class="field"><label for="pu">الرابط</label><input id="pu" class="md-url" readonly></div>
  <h3>أين يُستخدم؟</h3><div id="use" class="hint">…</div>
  <h3>استبدال الملف</h3>
  <form method="post" action="{{ route('manage.media.replace') }}" enctype="multipart/form-data" class="md-bar">@csrf<input type="hidden" name="path" id="rp">
    <div><label for="rf">الملف البديل (من النوع نفسه)</label><input id="rf" type="file" name="file" required></div><button class="btn" type="submit">استبدال</button></form>
  <form method="post" action="{{ route('manage.media.restore') }}" id="rs" hidden>@csrf<input type="hidden" name="path" id="rsp"><button class="btn ghost small" type="submit">إرجاع الملف الأصلي</button></form>
  <p class="hint">يُطبَّق الاستبدال على صفحات الطلاب عند فتحها التالي (مع اتصال بالإنترنت). الأصل لا يُحذف.</p>
</div></div>
<script>
(()=>{const L=@json(route('manage.media.list')),U=@json(route('manage.media.usage'));let site=@json($site),page=1,items=[],t=0;
const $=id=>document.getElementById(id),esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const kb=n=>n>1048576?(n/1048576).toFixed(1)+' MB':Math.max(1,Math.round(n/1024))+' KB';
const url=p=>site+p.split('/').map(encodeURIComponent).join('/');
function card(i){const r=i.r?url(i.r):url(i.p);return '<button type="button" class="md-it" data-p="'+esc(i.p)+'"><span class="md-th">'+(i.t==='image'?'<img loading="lazy" src="'+esc(r)+'" alt="">':'🔊')+'</span><span class="md-n">'+esc(i.p)+'</span><span class="hint" style="font-size:11px">'+kb(i.s)+'</span>'+(i.r?'<span class="md-tag">مستبدَل</span>':'')+'</button>'}
async function load(reset){if(reset){page=1;items=[];$('grid').innerHTML=''}
 const qs=new URLSearchParams({q:$('q').value,type:$('ty').value,folder:$('fo').value,page,per:60});
 const j=await (await fetch(L+'?'+qs,{headers:{Accept:'application/json'}})).json();site=j.site||site;items=items.concat(j.items);
 $('grid').insertAdjacentHTML('beforeend',j.items.map(card).join(''));$('cnt').textContent=j.total.toLocaleString('ar')+' ملفًا';$('more').hidden=items.length>=j.total}
function media(i,p,label){return '<div class="md-prev"><div class="hint">'+label+'</div>'+(i.t==='image'?'<img src="'+esc(url(p))+'" alt="">':'<audio controls preload="none" src="'+esc(url(p))+'" style="width:100%"></audio>')+'</div>'}
async function open(p){const i=items.find(x=>x.p===p);if(!i)return;$('pn').textContent=p;$('pu').value=url(i.r||p);$('rp').value=p;$('rsp').value=p;$('rs').hidden=!i.r;
 $('rf').accept=i.t==='image'?'image/png,image/jpeg,image/webp,image/gif':'audio/mpeg,audio/ogg,audio/wav,audio/mp4,.m4a';
 $('pv').innerHTML=media(i,p,i.r?'الأصل':'المعاينة')+(i.r?media(i,i.r,'البديل الظاهر للطلاب'):'');$('pane').classList.add('on');$('use').textContent='جارٍ البحث…';
 try{const j=await (await fetch(U+'?path='+encodeURIComponent(p),{headers:{Accept:'application/json'}})).json();
  $('use').innerHTML=j.used.length?'<ul>'+j.used.map(u=>'<li dir="ltr" style="text-align:left">'+esc(u.file)+' <small>×'+u.count+'</small></li>').join('')+'</ul>':'لم يُعثر على ذكر لاسم الملف في ملفات الصفحات (قد يُبنى اسمه برمجيًا، مثل الأصوات المرقّمة).'}catch(e){$('use').textContent='تعذّر البحث.'}}
$('grid').addEventListener('click',e=>{const b=e.target.closest('[data-p]');if(b)open(b.dataset.p)});
$('pane').addEventListener('click',e=>{if(e.target.id==='pane'||e.target.closest('[data-close]')){$('pane').classList.remove('on');$('pv').innerHTML=''}});
addEventListener('keydown',e=>{if(e.key==='Escape'&&$('pane').classList.contains('on')){$('pane').classList.remove('on');$('pv').innerHTML=''}});
$('q').addEventListener('input',()=>{clearTimeout(t);t=setTimeout(()=>load(true),250)});$('ty').onchange=$('fo').onchange=()=>load(true);$('more').onclick=()=>{page++;load(false)};
load(true)})();
</script>
@endsection
