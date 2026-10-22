@extends('layouts.manage')
@section('title', 'البريد الإلكتروني')
@section('content')
<style>
.mail-grid{grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr))}
.tpl textarea{min-height:230px;line-height:1.9}
.tpl .top-row{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap;margin:0 0 10px}
.tpl .top-row h2{margin:0}
.switch{display:inline-flex;align-items:center;gap:10px;font-weight:700;cursor:pointer}
.switch input{appearance:none;-webkit-appearance:none;width:52px;min-height:30px;height:30px;padding:0;border-radius:999px;background:#e3e1d3;border:0;position:relative;cursor:pointer;transition:background .15s}
.switch input:after{content:"";position:absolute;top:4px;inset-inline-start:4px;width:22px;height:22px;border-radius:50%;background:#fff;box-shadow:0 1px 3px #0003;transition:inset-inline-start .15s}
.switch input:checked{background:var(--g)}.switch input:checked:after{inset-inline-start:26px}
.ph{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 0}.ph code{direction:ltr;font:700 13px/1.6 Baloo,Cairo,monospace;background:var(--gl);color:var(--gd);border-radius:8px;padding:1px 8px}
.ph span{font-size:13px;color:var(--muted)}
.transport{display:grid;gap:6px;margin:0}.transport div{display:flex;gap:8px;flex-wrap:wrap}.transport dt{color:var(--muted);font-weight:700}.transport dd{margin:0;font-weight:800}
.test{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.4fr) auto;gap:12px;align-items:end}
@media (max-width:640px){.test{grid-template-columns:1fr}.test .btn{width:100%}}
.st-sent{background:var(--gl);color:var(--gd)}.st-failed{background:var(--red-bg);color:#8a2a24}.st-disabled{background:#efeee5;color:var(--muted)}
</style>
<div class="head"><h1>البريد الإلكتروني</h1></div>
<p class="lead">رسائل التفعيل والترحيب واستعادة كلمة المرور التي تصل إلى أولياء الأمور: نصوصها، وتشغيلها، وسجل إرسالها.</p>
@if (session('mail_error'))<p class="alert err" role="alert">{{ session('mail_error') }}</p>@endif
@if ($mailer === 'log' || $mailer === 'array')
<div class="note" style="margin:0 0 16px">@include('partials.admin-icon',['name'=>'alert'])<p>البريد غير موصول بعد بخادم إرسال (MAIL_MAILER={{ $mailer }})، فلن تصل الرسائل فعليًا حتى تُضبط إعدادات البريد في ملف ‎.env على الخادم.</p></div>
@endif

<form method="post" action="{{ route('manage.mail.update') }}" class="grid mail-grid">@csrf @method('put')
<section class="card"><h2>@include('partials.admin-icon',['name'=>'users'])المرسِل</h2>
  <div class="field"><label for="mail_from_name">اسم المرسِل</label><input id="mail_from_name" name="mail_from_name" value="{{ old('mail_from_name', $s['mail_from_name']) }}" required maxlength="80"><p class="hint">يظهر في صندوق الوارد بدل العنوان.</p></div>
  <dl class="transport"><div><dt>عنوان الإرسال:</dt><dd dir="ltr">{{ $from }}</dd></div><div><dt>طريقة الإرسال:</dt><dd dir="ltr">{{ $mailer }}</dd></div></dl>
  <div class="ph" aria-label="المتغيرات المتاحة">@foreach (\App\Support\MailCenter::PLACEHOLDERS as $k => $v)<code>{{ $k }}</code><span>{{ $v }}</span>@endforeach</div>
  <p class="hint">اترك سطرًا فارغًا بين الفقرات. يُضاف الزر والرابط تلقائيًا أسفل النص.</p>
</section>
@foreach (\App\Support\MailCenter::TYPES as $t => $label)
<section class="card tpl">
  <div class="top-row"><h2>@include('partials.admin-icon',['name'=>$t==='reset'?'lock':($t==='verify'?'check':'star')]){{ $label }}</h2>
  <label class="switch"><input type="checkbox" name="mail_{{ $t }}_on" value="1" @checked($s['mail_'.$t.'_on']==='1') aria-label="تشغيل {{ $label }}"> <span>مفعّلة</span></label></div>
  <div class="field"><label for="mail_{{ $t }}_subject">العنوان</label><input id="mail_{{ $t }}_subject" name="mail_{{ $t }}_subject" value="{{ old('mail_'.$t.'_subject', $s['mail_'.$t.'_subject']) }}" required maxlength="200"></div>
  <div class="field"><label for="mail_{{ $t }}_body">نص الرسالة</label><textarea id="mail_{{ $t }}_body" name="mail_{{ $t }}_body" required maxlength="5000">{{ old('mail_'.$t.'_body', $s['mail_'.$t.'_body']) }}</textarea></div>
  @if($t==='verify')<p class="hint">عند إيقافها، يُعدّ الحساب الجديد مفعّلًا وتصله رسالة الترحيب فورًا.</p>@elseif($t==='reset')<p class="hint">عند إيقافها، لا تُرسل روابط الاستعادة (يبقى التعيين اليدوي من صفحة المستخدم).</p>@else<p class="hint">تُرسل بعد تفعيل البريد.</p>@endif
</section>
@endforeach
<div class="savebar" style="grid-column:1/-1"><p>تُحفظ النصوص والتشغيل معًا.</p><button class="btn" type="submit">@include('partials.admin-icon',['name'=>'save'])حفظ إعدادات البريد</button></div>
</form>

<section class="card" style="margin-top:22px"><h2>@include('partials.admin-icon',['name'=>'send'])رسالة تجريبية</h2>
  <form method="post" action="{{ route('manage.mail.test') }}" class="test">@csrf
    <div><label for="type">النوع</label><select id="type" name="type">@foreach (\App\Support\MailCenter::TYPES as $t => $label)<option value="{{ $t }}">{{ $label }}</option>@endforeach</select></div>
    <div><label for="to">إلى</label><input id="to" name="to" type="email" dir="ltr" value="{{ old('to', auth()->user()->email) }}" required maxlength="255"></div>
    <button class="btn" type="submit">@include('partials.admin-icon',['name'=>'send'])إرسال</button>
  </form>
  <p class="hint">تصل بالنص المحفوظ حاليًا، حتى لو كانت الرسالة متوقفة.</p>
</section>

<section style="margin-top:22px">
<div class="head" style="margin-bottom:12px"><h2 style="margin:0;font-size:22px;display:flex;gap:10px;align-items:center">@include('partials.admin-icon',['name'=>'activity'])سجل الإرسال</h2></div>
<form class="filters" method="get">
  <div><label for="ft">النوع</label><select id="ft" name="type"><option value="">الكل</option>@foreach (\App\Support\MailCenter::TYPES as $t => $label)<option value="{{ $t }}" @selected(request('type')===$t)>{{ $label }}</option>@endforeach</select></div>
  <div><label for="fs">الحالة</label><select id="fs" name="status"><option value="">الكل</option>@foreach (\App\Models\MailLog::STATUS as $k => $v)<option value="{{ $k }}" @selected(request('status')===$k)>{{ $v }}</option>@endforeach</select></div>
  <div class="go"><button class="btn small" type="submit">@include('partials.admin-icon',['name'=>'search'])تصفية</button></div>
</form>
<div class="table-wrap stack"><table>
<thead><tr><th>إلى</th><th>النوع</th><th>الوقت (بتوقيت فلسطين)</th><th>الحالة</th></tr></thead><tbody>
@forelse ($logs as $l)
<tr><td data-label="إلى" dir="ltr" style="text-align:right">{{ $l->to }}</td>
<td data-label="النوع">{{ \App\Support\MailCenter::TYPES[$l->type] ?? $l->type }}@if($l->is_test) <span class="chip grey" style="font-size:12px;padding:0 8px">تجريبية</span>@endif</td>
<td data-label="الوقت">{{ $ar::when($l->created_at, true, 'Asia/Hebron') }}</td>
<td data-label="الحالة"><span class="chip st-{{ $l->status }}">{{ \App\Models\MailLog::STATUS[$l->status] ?? $l->status }}</span>@if($l->error)<small style="display:block;max-width:320px;overflow-wrap:anywhere" dir="ltr">{{ \Illuminate\Support\Str::limit($l->error, 140) }}</small>@endif</td></tr>
@empty<tr><td colspan="4" class="empty">لم تُرسل أي رسالة بعد.</td></tr>@endforelse
</tbody></table></div>
@include('partials.pager', ['p' => $logs])
</section>
@endsection
