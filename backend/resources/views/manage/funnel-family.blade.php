@extends('layouts.manage')
@section('title', 'رحلة عائلة')
@php($F = \App\Support\Funnel::class)
@php($pages = ['landing' => 'الصفحة الرئيسية', 'pricing' => 'الأسعار', 'register' => 'التسجيل', 'login' => 'الدخول', 'login_site' => 'دخول الطلاب', 'account' => 'الحساب', 'subscribe' => 'الاشتراك', 'lesson' => 'درس', 'forgot' => 'نسيت كلمة المرور', 'reset' => 'تعيين كلمة المرور', 'report' => 'التقرير', 'child' => 'إضافة طفل', 'other' => 'أخرى'])
@php($srcLabel = ['fb' => 'فيسبوك', 'google' => 'جوجل', 'direct' => 'مباشر', 'other' => 'آخر'])
@section('content')
<div class="head"><h1>رحلة عائلة: {{ $u->name }}</h1><a class="btn ghost small" href="{{ route('manage.funnel') }}">رجوع إلى رحلة العائلات</a></div>
<section class="card">
  <dl class="kv">
    <div><dt>البريد</dt><dd dir="ltr" style="text-align:right">{{ $u->email }}</dd></div>
    <div><dt>أُنشئ الحساب</dt><dd>{{ $ar::date($u->created_at) }} @if ($u->google_id)<small>(Google)</small>@endif</dd></div>
    <div><dt>البريد مؤكَّد</dt><dd>{{ $u->email_verified_at ? $ar::date($u->email_verified_at) : 'لا (لا يمنع شيئًا)' }}</dd></div>
    <div><dt>نهاية التجربة</dt><dd>{{ $ar::date($u->trial_ends_at, false) }}</dd></div>
    <div><dt>الأطفال</dt><dd>{{ $kids->count() ? $kids->join('، ') : '—' }}</dd></div>
    <div><dt>الطلبات</dt><dd>@forelse ($subs as $s)<span class="chip {{ $s->status === 'pending' ? 'bad' : ($s->status === 'active' ? '' : 'grey') }}">{{ $s->plan_name }} — {{ $s->statusLabel() }}</span> @empty — @endforelse</dd></div>
    <div><dt>أجهزة/متصفحات</dt><dd>{{ $ar::num($vids->count()) }}</dd></div>
    <div><dt><a href="{{ route('manage.user', $u) }}">صفحة الحساب في الإدارة</a></dt><dd></dd></div>
  </dl>
</section>
<section class="card">
  <h2>@include('partials.admin-icon',['name'=>'activity'])الخط الزمني ({{ $ar::num($events->count()) }} حدثًا)</h2>
  <ul class="list act">
  @forelse ($events as $e)
    @php($m = $e->meta ? (json_decode($e->meta, true) ?: []) : [])
    <li><span><b>{{ $F::LABELS[$e->event] ?? $e->event }}</b>
      @if ($e->page) — {{ $pages[$e->page] ?? $e->page }}@endif
      @if ($e->subject) — {{ $e->subject }}@endif
      @if ($e->count !== null) — {{ $ar::num($e->count) }}@endif
      @if (! empty($m['method'])) — {{ $m['method'] === 'google' ? 'Google' : 'البريد' }}@endif
      @if (! empty($m['grade'])) — {{ $ar::grade((int) $m['grade']) }}@endif
      @if (! empty($m['plans'])) — {{ $m['plans'] }}@endif
      @if (! empty($m['reason'])) — <small>{{ $m['reason'] }}</small>@endif
      @if (! empty($m['fields'])) — <small dir="ltr">{{ $m['fields'] }}</small>@endif
      @if (! empty($m['inapp'])) — <small>داخل {{ $m['inapp'] }}</small>@endif
      @if (! empty($m['utm_campaign'])) — <small>حملة: {{ $m['utm_campaign'] }}</small>@endif
      @if ($e->source && in_array($e->event, ['visit','registered'], true)) — <small>المصدر: {{ $srcLabel[$e->source] ?? $e->source }}</small>@endif
      @if ($e->backfill) <span class="chip grey">مستعاد</span>@endif
    </span><span class="when">{{ $ar::date($e->created_at) }}</span></li>
  @empty
    <li class="hint">لا أحداث مسجّلة لهذه العائلة بعد.</li>
  @endforelse
  </ul>
</section>
@endsection
