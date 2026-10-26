@extends('layouts.manage')
@section('title', 'عناوين جوجل (SEO)')
@section('content')
<style>
.seo-row{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:18px;align-items:start}
@media (max-width:900px){.seo-row{grid-template-columns:1fr}}
.serp{background:#fff;border:1px solid #dadce0;border-radius:12px;padding:14px 16px;font-family:Arial,Tahoma,sans-serif;direction:rtl}
.serp .u{color:#202124;font-size:13px;direction:ltr;text-align:right}.serp .t{color:#1a0dab;font-size:19px;line-height:1.35;margin:4px 0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.serp .d{color:#4d5156;font-size:14px;line-height:1.6;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.cnt{font-size:12px;color:var(--muted)}.cnt.over{color:#b3261e;font-weight:700}
</style>
<div class="head"><h1>عناوين جوجل (SEO)</h1></div>
<p class="lead">العنوان والوصف اللذان يظهران في نتائج جوجل وعند مشاركة الرابط، لكل صفحة رئيسية. اترك الحقل فارغًا لاستخدام النص الأصلي. تُكتب القيم مباشرة في ملفات الصفحات فيراها جوجل دون انتظار.</p>
@if (session('mail_error'))<p class="alert err" role="alert">{{ session('mail_error') }}</p>@endif
@unless ($writable)
<div class="note" style="margin:0 0 16px">@include('partials.admin-icon',['name'=>'alert'])<p>لا يمكن للخادم الكتابة في ملفات الموقع الثابت حاليًا ({{ \App\Support\Seo::root() }}). تُحفظ القيم، لكنها لن تظهر حتى تُصلح الصلاحيات ثم تضغط «إعادة التطبيق».</p></div>
@endunless
<form method="post" action="{{ route('manage.seo.update') }}">@csrf @method('put')
@foreach ($rows as $path => $r)
@php($k = $path === '' ? '_home' : $path)
@php($o = $over[$path] ?? [])
<section class="card" style="margin-bottom:16px" data-seo>
  <h2 style="margin-top:0">{{ $r['label'] }} <small dir="ltr" style="font-weight:400;color:var(--muted);font-size:13px">/{{ $path }}{{ $path ? '/' : '' }}</small></h2>
  <div class="seo-row">
    <div>
      <div class="field"><label for="t-{{ $loop->index }}">العنوان</label><input id="t-{{ $loop->index }}" name="seo[{{ $k }}][title]" value="{{ old('seo.'.$k.'.title', $o['title'] ?? '') }}" maxlength="120" placeholder="{{ $r['current']['title'] }}" data-t data-orig="{{ $r['current']['title'] }}"><p class="hint"><span class="cnt" data-ct></span> — الأفضل حتى ٦٠ حرفًا.</p></div>
      <div class="field"><label for="d-{{ $loop->index }}">الوصف</label><textarea id="d-{{ $loop->index }}" name="seo[{{ $k }}][description]" maxlength="320" rows="3" placeholder="{{ $r['current']['description'] }}" data-d data-orig="{{ $r['current']['description'] }}">{{ old('seo.'.$k.'.description', $o['description'] ?? '') }}</textarea><p class="hint"><span class="cnt" data-cd></span> — الأفضل بين ٧٠ و١٦٠ حرفًا.</p></div>
    </div>
    <div><p class="hint" style="margin:0 0 6px">معاينة نتيجة جوجل</p><div class="serp"><div class="u">{{ $r['url'] }}</div><div class="t" data-pt></div><div class="d" data-pd></div></div></div>
  </div>
</section>
@endforeach
<div class="savebar"><p>تُحفظ وتُكتب في الصفحات فورًا.</p><button class="btn" type="submit">@include('partials.admin-icon',['name'=>'save'])حفظ العناوين</button></div>
</form>
<form method="post" action="{{ route('manage.seo.apply') }}" style="margin-top:12px">@csrf<button class="btn ghost small" type="submit">إعادة التطبيق على الملفات</button> <span class="hint">استخدمه إن نُشرت نسخة جديدة من الموقع فعادت العناوين القديمة.</span></form>
<script>
document.querySelectorAll('[data-seo]').forEach(function(c){var t=c.querySelector('[data-t]'),d=c.querySelector('[data-d]');
function n(x){return String(x).replace(/\d/g,function(z){return '٠١٢٣٤٥٦٧٨٩'[z]})}
function up(){var tv=t.value.trim()||t.dataset.orig,dv=d.value.trim()||d.dataset.orig;c.querySelector('[data-pt]').textContent=tv;c.querySelector('[data-pd]').textContent=dv;
var a=c.querySelector('[data-ct]'),b=c.querySelector('[data-cd]');a.textContent=n(tv.length)+' حرفًا';a.classList.toggle('over',tv.length>60);b.textContent=n(dv.length)+' حرفًا';b.classList.toggle('over',dv.length>160);}
t.addEventListener('input',up);d.addEventListener('input',up);up();});
</script>
@endsection
