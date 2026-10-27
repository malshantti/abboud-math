@extends('layouts.manage')
@section('title', 'رحلة العائلات')
@php($ago = function ($t) use ($ar) { $m = max(0, (int) $t->diffInMinutes(now())); return $m < 60 ? 'قبل '.$ar::num($m).' دقيقة' : ($m < 1440 ? 'قبل '.$ar::num(intdiv($m, 60)).' ساعة' : 'قبل '.$ar::num(intdiv($m, 1440)).' يوم'); })
@php($srcLabel = ['fb' => 'فيسبوك', 'google' => 'جوجل', 'direct' => 'مباشر', 'other' => 'آخر'])
@section('content')
<style>
.fn{display:grid;gap:8px}.fn-row{display:grid;grid-template-columns:minmax(9em,15em) 1fr auto;gap:12px;align-items:center}
.fn-row .bar-track{height:26px;border-radius:10px;background:#f3f1e6;overflow:hidden}.fn-row .bar{height:100%;border-radius:10px;background:var(--g,#6a9f1d);min-width:3px}
.fn-row b{font:800 18px/1 Baloo,Cairo,sans-serif}.fn-drop{color:#8a2a24;font-size:13px;font-weight:700;white-space:nowrap}.fn-keep{color:var(--muted);font-size:13px;white-space:nowrap}
.fn-tabs{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 12px}.fn-tabs a{text-decoration:none}.fn-tabs a[aria-current]{outline:2px solid currentColor}
@media (max-width:640px){.fn-row{grid-template-columns:1fr auto}.fn-row .bar-track{grid-column:1/-1;order:3}}
</style>
<div class="head"><h1>رحلة العائلات</h1></div>
<p class="hint" style="margin:-6px 0 14px">أين تتوقف العائلات بين زيارة الموقع والاشتراك المدفوع. الأرقام لعائلات حقيقية وزوّار فقط (دون حسابات الإدارة والاختبار).</p>
<form class="filters" method="get">
  <div><label for="from">من</label><input type="date" id="from" name="from" value="{{ $from->format('Y-m-d') }}"></div>
  <div><label for="to">إلى</label><input type="date" id="to" name="to" value="{{ $to->format('Y-m-d') }}"></div>
  <div><label for="source">المصدر</label><select id="source" name="source">@foreach ($ctl::SOURCES as $k => $v)<option value="{{ $k }}" @selected($source === $k)>{{ $v }}</option>@endforeach</select></div>
  <div class="go"><button class="btn small" type="submit">@include('partials.admin-icon',['name'=>'search'])عرض</button></div>
</form>

<section class="card">
  <h2>@include('partials.admin-icon',['name'=>'activity'])مراحل الرحلة من {{ $ar::date($from, false) }} إلى {{ $ar::date($to, false) }}</h2>
  <p class="hint">كل عائلة (أو زائر لم يسجّل بعد) تُحسب في أبعد مرحلة وصلتها خلال المدة، وفي كل ما قبلها. النسبة = من بقي مقارنة بالمرحلة السابقة.</p>
  @php($top = max(1, $steps[0]['n']))
  <div class="fn" style="margin-top:12px">
  @foreach ($steps as $s)
    <div class="fn-row" data-step="{{ $s['key'] }}">
      <span><b>{{ $ar::num($s['n']) }}</b> &nbsp;{{ $s['label'] }}</span>
      <div class="bar-track"><div class="bar" style="width:{{ max(1, $s['n'] / $top * 100) }}%"></div></div>
      @if ($s['pct'] !== null)<span>@if ($s['drop'] > 0)<span class="fn-drop">−{{ $ar::num($s['drop']) }} ({{ $ar::num(100 - $s['pct']) }}٪ توقفوا)</span>@else<span class="fn-keep">{{ $ar::num($s['pct']) }}٪</span>@endif</span>@else<span></span>@endif
    </div>
  @endforeach
  </div>
  <ul class="list" style="margin-top:14px">
    <li><span>ضغطوا «أرسل الطلب عبر واتساب»</span><span class="chip">{{ $ar::num($extra['wa_click']) }}</span></li>
    <li><span>أكّدوا البريد الإلكتروني (لا يمنع شيئًا)</span><span class="chip grey">{{ $ar::num($extra['email_verified']) }}</span></li>
    <li><span>تعثّر الدخول بحساب Google</span><span class="chip {{ $extra['google_fail'] ? 'warn' : 'grey' }}">{{ $ar::num($extra['google_fail']) }}</span></li>
    <li><span>أخطاء في النماذج (تسجيل/دخول/طفل/اشتراك)</span><span class="chip {{ $extra['form_error'] ? 'warn' : 'grey' }}">{{ $ar::num($extra['form_error']) }}</span></li>
    <li><span>فتحوا الموقع من متصفح فيسبوك/إنستغرام الداخلي</span><span class="chip grey">{{ $ar::num($extra['inapp']) }}</span></li>
  </ul>
  <p class="hint">في السجل {{ $ar::num($total) }} حدثًا، منها {{ $ar::num($backfilled) }} مستعاد من بيانات سابقة (الحسابات والأطفال والتقدّم والطلبات).</p>
</section>

<section class="card">
  <h2>@include('partials.admin-icon',['name'=>'users'])العائلات وآخر مرحلة وصلتها</h2>
  <nav class="fn-tabs" aria-label="تصفية العائلات">
    <a class="chip grey" href="{{ request()->fullUrlWithQuery(['stuck' => null]) }}" @if($stuck==='') aria-current="page" @endif>الكل</a>
    <a class="chip warn" href="{{ request()->fullUrlWithQuery(['stuck' => 'any']) }}" @if($stuck==='any') aria-current="page" @endif>كل العائلات المتوقفة ({{ $ar::num(array_sum($stuckCounts)) }})</a>
    @foreach ($ctl::STUCK as $k => $v)<a class="chip {{ $k === 'pending' ? 'bad' : 'warn' }}" href="{{ request()->fullUrlWithQuery(['stuck' => $k]) }}" @if($stuck===$k) aria-current="page" @endif>{{ $v }} ({{ $ar::num($stuckCounts[$k]) }})</a>@endforeach
  </nav>
  <div class="table-wrap stack"><table>
  <thead><tr><th>العائلة</th><th>آخر مرحلة</th><th>آخر نشاط</th><th>الحالة</th><th>المصدر</th><th></th></tr></thead><tbody>
  @forelse ($list as $r)
    <tr>
      <td data-label="العائلة"><b>{{ $r['user']->name }}</b><small dir="ltr" style="display:block;color:var(--muted)">{{ $r['user']->email }}</small></td>
      <td data-label="آخر مرحلة">{{ $r['label'] }}@if ($r['kids'])<small style="display:block;color:var(--muted)">{{ $ar::num($r['kids']) }} {{ $r['kids'] === 1 ? 'طفل' : 'أطفال' }}</small>@endif</td>
      <td data-label="آخر نشاط">{{ $ago($r['last']) }}<small style="display:block;color:var(--muted)">{{ $ar::date($r['last']) }}</small></td>
      <td data-label="الحالة">@if ($r['stuck'])<span class="chip {{ $r['stuck'] === 'pending' ? 'bad' : 'warn' }}">{{ $ctl::STUCK[$r['stuck']] }}</span>@elseif ($r['step'] >= 9)<span class="chip">مشترك</span>@else<span class="chip grey">يتقدّم</span>@endif</td>
      <td data-label="المصدر">{{ $srcLabel[$r['source']] ?? '—' }}</td>
      <td class="actions"><a class="btn ghost small" href="{{ route('manage.funnel.family', $r['user']) }}">الرحلة كاملة</a></td>
    </tr>
  @empty
    <tr><td colspan="6" class="empty">لا توجد عائلات في هذا التصنيف.</td></tr>
  @endforelse
  </tbody></table></div>
</section>
@endsection
