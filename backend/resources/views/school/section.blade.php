@extends('school.layout')
@section('title', $section->name)
@section('head-end')<a class="btn ghost small" href="{{ route('school.panel', $school) }}">اللوحة</a>@endsection
@section('css')
.top2{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:0 0 14px}.top2 h1{margin:0;font-size:28px}
.cols{display:grid;gap:18px;grid-template-columns:minmax(0,1.5fr) minmax(0,1fr)}@media(max-width:860px){.cols{grid-template-columns:1fr}}
textarea{min-height:170px;font-size:18px;line-height:1.7}
.share{display:grid;grid-template-columns:132px 1fr;gap:14px;align-items:center}.share #qr{width:132px;height:132px}
.code{font:800 30px/1.2 monospace;letter-spacing:4px;direction:ltr;color:var(--gd)}
.pinv{font:800 20px monospace;direction:ltr;letter-spacing:2px}.pinbox{display:inline-flex;gap:8px;align-items:center;white-space:nowrap}th .btn{min-height:30px;padding:2px 10px;font-size:13px}
td form{display:inline}td .btn{min-height:38px;padding:4px 12px;font-size:14px}
.alerts{list-style:none;margin:0;padding:0;font-size:15px}.alerts li{padding:6px 0;border-bottom:1px solid var(--line)}.alerts .bad{color:#8a2a24;font-weight:800}
@media(max-width:600px){table.st thead{display:none}table.st tr{display:grid;grid-template-columns:1fr auto;padding:8px 0;border-bottom:1px solid var(--line)}table.st td{border:0;padding:2px 4px}}
@endsection
@section('content')
<style>.more-acts{display:inline-block;position:relative}.more-acts>summary{list-style:none;cursor:pointer;min-height:44px;display:inline-flex;align-items:center;padding:0 12px;border:1px solid #cbd5e1;border-radius:10px;font-weight:800}.more-acts>summary::-webkit-details-marker{display:none}.more-menu{position:absolute;inset-inline-end:0;z-index:20;background:#fff;border:1px solid #cbd5e1;border-radius:12px;box-shadow:0 8px 20px rgba(0,0,0,.15);padding:8px;display:grid;gap:6px;min-width:200px}.more-menu form{margin:0}.more-menu .btn{width:100%}@media(max-width:700px){.more-menu{position:static;box-shadow:none;min-width:0;margin-top:6px}}</style>
<div class="top2"><h1>{{ $section->name }}</h1><span class="chip grey">{{ $ar::grade($section->grade) }}</span><span class="muted">{{ $ar::count($students->count(), 'طالب') }}</span>
  <a class="btn" style="margin-inline-start:auto" href="{{ route('school.report', [$school, $section]) }}">لوحة المتابعة</a>
  <a class="btn sun" href="{{ route('school.cards', [$school, $section]) }}" target="_blank" rel="noopener">طباعة كل البطاقات</a></div>
<div class="cols">
  <section class="card">
    <h2 class="mt0">إضافة طلاب دفعة واحدة</h2>
    <form method="post" action="{{ route('school.students.store', [$school, $section]) }}" enctype="multipart/form-data">@csrf
      <label for="names">الصق الأسماء — اسم في كل سطر</label>
      <textarea id="names" name="names" placeholder="أحمد محمد&#10;سارة علي&#10;…">{{ old('names') }}</textarea>
      <div class="field"><label for="file">أو ارفع ملف Excel / CSV (الأسماء في العمود الأول)</label><input id="file" type="file" name="file" accept=".xlsx,.csv,text/csv"></div>
      <button class="btn wide" type="submit">إنشاء الطلاب وأرقامهم السرية</button>
      <p class="hint">يُنشأ لكل طالب اسم مستخدم ورقم سري من ٤ أرقام فورًا. الأسماء المكرّرة تُتجاهل.</p>
    </form>
  </section>
  <section class="card">
    <h2 class="mt0">رابط الشعبة ورمزها</h2>
    <div class="share"><canvas id="qr" width="132" height="132" aria-label="رمز QR لرابط الشعبة"></canvas>
      <div><div class="code">{{ $section->code }}</div><p class="hint" style="word-break:break-all" dir="ltr">{{ $joinUrl }}</p>
      <button class="btn ghost small" type="button" id="copy">نسخ الرابط</button></div></div>
    <p class="hint">الرابط يعرض أسماء الشعبة فقط؛ الدخول يحتاج الرقم السري الخاص بكل طالب. لا يمكن لأحد إضافة نفسه.</p>
    <form method="post" action="{{ route('school.code', [$school, $section]) }}" onsubmit="return confirm('سيتوقف الرابط والرمز الحاليان. متابعة؟')">@csrf<button class="btn danger small" type="submit">تغيير الرمز والرابط</button></form>
  </section>
</div>
<section class="card" style="margin-top:18px">
  <h2 class="mt0" style="display:flex;flex-wrap:wrap;gap:10px;align-items:center">الطلاب @unless($students->isEmpty())<button class="btn ghost small" type="button" id="pin-all" aria-pressed="false">إظهار كل الأرقام السرية</button>@endunless</h2>
  @if ($students->isEmpty())<p class="muted">لا طلاب بعد. الصق الأسماء أعلاه.</p>@else
  <table class="st"><thead><tr><th>الاسم</th><th>الرقم السري</th><th>اسم المستخدم</th><th>آخر نشاط</th><th></th></tr></thead><tbody>
  @foreach ($students as $s)
    @php($last = collect([$s->last_synced_at, $s->user?->last_login_at, $s->user?->active_device_seen_at])->filter()->max())
    <tr><td><a href="{{ route('school.student', [$school, $s]) }}"><b>{{ $s->name }}</b></a>@if($s->pin_locked_until && $s->pin_locked_until->isFuture()) <span class="chip bad">قُفل على جهاز مؤقتًا</span> <form method="post" action="{{ route('school.unlock', [$school, $s]) }}" style="display:inline">@csrf<button class="btn ghost" type="submit">فتح القفل</button></form>@endif</td>
      @php($pin = \App\Support\Schools::plainPin($s))
      <td>@if($pin)<span class="pinbox"><span class="pinv pin-mask" aria-hidden="true">••••</span><span class="pinv pin-real" hidden>{{ $pin }}</span> <button class="btn ghost small pin-tog" type="button" aria-pressed="false">إظهار</button></span>@else<span class="pinv">—</span>@endif</td>
      <td dir="ltr" style="text-align:right">{{ $s->user?->username }}</td>
      <td class="muted">{{ $last ? $ar::date($last) : 'لم يدخل بعد' }}</td>
      <td><a class="btn ghost" href="{{ route('school.cards', [$school, $section, 's' => $s->id]) }}" target="_blank" rel="noopener">بطاقة</a>
        <details class="more-acts"><summary aria-label="مزيد من الإجراءات للطالب {{ $s->name }}">… المزيد</summary><div class="more-menu"><form method="post" action="{{ route('school.pin', [$school, $s]) }}">@csrf<button class="btn ghost" type="submit">رقم جديد</button></form>
        <form method="post" action="{{ route('school.kick', [$school, $s]) }}" onsubmit="return confirm('إخراج {{ $s->name }} من كل الأجهزة وإعطاؤه رقمًا جديدًا؟')">@csrf<button class="btn danger" type="submit">إخراج + رقم جديد</button></form>
        <form method="post" action="{{ route('school.archive', [$school, $s]) }}" data-msg="إزالة «{{ $s->name }}» من الشعبة؟ سيختفي من القوائم والبطاقات والتقارير ولن يستطيع الدخول. تقدّمه يبقى محفوظًا ويمكن استعادته من «الطلاب المؤرشفون»." onsubmit="return confirm(this.dataset.msg)">@csrf<button class="btn danger" type="submit" data-archive="{{ $s->id }}">إزالة من الشعبة</button></form></div></details></td></tr>
  @endforeach
  </tbody></table>@endif
  @if ($archived->isNotEmpty())
  <details class="archived" id="archived"><summary><b>الطلاب المؤرشفون ({{ $ar::num($archived->count()) }})</b></summary>
    <p class="muted">لا يظهرون في القوائم ولا يستطيعون الدخول. تقدّمهم محفوظ.</p>
    <table class="st"><tbody>
    @foreach ($archived as $s)
      <tr><td><b>{{ $s->name }}</b></td><td class="muted">أُرشف {{ $ar::date($s->archived_at) }}</td>
        <td><form method="post" action="{{ route('school.restore', [$school, $s]) }}">@csrf<button class="btn ghost" type="submit" data-restore="{{ $s->id }}">استعادة</button></form></td></tr>
    @endforeach
    </tbody></table></details>
  @endif
</section>
<section class="card" style="margin-top:18px">
  <h2 class="mt0">تنبيهات الأمان (آخر ٧ أيام)</h2>
  <ul class="alerts">@forelse ($alerts as $a)<li><span class="{{ $a['bad'] ? 'bad' : '' }}">{{ $a['kind'] }}</span> — {{ $a['name'] }} <span class="muted">· {{ $a['at'] }}</span></li>@empty<li class="muted">لا شيء يستدعي الانتباه.</li>@endforelse</ul>
</section>
@endsection
@section('js')
<script src="{{ asset('ui/qrcode.min.js') }}" defer></script>
<script>
addEventListener('DOMContentLoaded',function(){var url=@json($joinUrl),c=document.getElementById('qr');
 if(window.qrcode){var q=qrcode(0,'M');q.addData(url);q.make();var n=q.getModuleCount(),s=c.width/(n+2),x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.fillStyle='#000';for(var r=0;r<n;r++)for(var k=0;k<n;k++)if(q.isDark(r,k))x.fillRect(Math.floor((k+1)*s),Math.floor((r+1)*s),Math.ceil(s),Math.ceil(s));}
 function pinShow(b,on){var w=b.closest('.pinbox');w.querySelector('.pin-real').hidden=!on;w.querySelector('.pin-mask').hidden=on;b.textContent=on?'إخفاء':'إظهار';b.setAttribute('aria-pressed',on?'true':'false')}
 document.querySelectorAll('.pin-tog').forEach(function(b){b.onclick=function(){pinShow(b,b.getAttribute('aria-pressed')!=='true')}});
 var pa=document.getElementById('pin-all');if(pa)pa.onclick=function(){var on=pa.getAttribute('aria-pressed')!=='true';document.querySelectorAll('.pin-tog').forEach(function(b){pinShow(b,on)});pa.textContent=on?'إخفاء كل الأرقام السرية':'إظهار كل الأرقام السرية';pa.setAttribute('aria-pressed',on?'true':'false')};
 document.getElementById('copy').onclick=function(){navigator.clipboard&&navigator.clipboard.writeText(url).then(()=>{this.textContent='نُسخ ✓'})};});
</script>
@endsection
