@extends('layouts.manage')
@section('title', 'لوحة المعلومات')
@section('content')
@php($weekdays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'])
@php($dayName = fn (string $d) => $weekdays[\Illuminate\Support\Carbon::parse($d)->dayOfWeek].' '.\Illuminate\Support\Carbon::parse($d)->format('d/m'))
{{-- One week everywhere: the KPI numbers below are sums of the same 7-day series the small charts draw. --}}
@php($spark = fn (string $k) => $charts ? array_map(fn ($d, $i) => ['v' => $d[$k], 'tip' => $dayName($d['date']).': '.$d[$k], 'label' => $i === count($charts['week']) - 1 ? 'اليوم' : null], $charts['week'], array_keys($charts['week'])) : null)
@php($kpis = [
  ['parents', 'أولياء الأمور', $charts ? '+'.$ar::num($stats['new_week']).' حساب جديد هذا الأسبوع' : null, 'signups'],
  ['students', 'الطلاب', $stats['families'] ? 'لدى '.$ar::num($stats['families']).' '.($stats['families'] === 1 ? 'وليّ أمر' : 'من أولياء الأمور') : 'لم يُضف وليّ أمر طالبًا بعد', null],
  ['active_week', 'طلاب نشطون هذا الأسبوع', $stats['students'] ? 'من أصل '.$ar::num($stats['students']).' طالبًا' : null, 'students'],
  ['subs_active', 'اشتراكات فعّالة', $charts ? $ar::num($stats['requests_week']).' طلب اشتراك هذا الأسبوع' : null, 'requests'],
])
<div class="head dash-head">
  <div><h1>لوحة المعلومات</h1><p class="dash-date">{{ $ar::num(now()->timezone(config('app.display_timezone', 'Asia/Gaza'))->format('d/m/Y')) }}</p></div>
  <div class="row"><a class="btn ghost small" href="{{ route('manage.live') }}">@include('partials.admin-icon',['name'=>'online'])المتصلون الآن</a>@can('manage-site')@include('partials.export-menu')@endcan</div>
</div>

@can('manage-site')
{{-- What needs the admin today comes first. Payment requests are handled right here: activate after the money arrives on WhatsApp, or reject. --}}
@php($todo = array_filter([
  ['n' => $stats['subs_expiring'], 'label' => 'اشتراكات تنتهي خلال 7 أيام', 'hint' => 'ذكّر العائلات بالتجديد', 'href' => route('manage.subscriptions', ['status' => 'expiring']), 'icon' => 'clock', 'tone' => 't-sun'],
  ['n' => count($audit['ids']), 'label' => 'سجلّات طلاب غير محسوبة', 'hint' => 'تجريبية أو مكرّرة أو قديمة: مراجعتها', 'href' => route('manage.students', ['owner' => 'review']), 'icon' => 'alert', 'tone' => 't-red'],
], fn ($t) => $t['n'] > 0))
<section class="card inbox" aria-labelledby="inbox-title">
  <div class="inbox-head"><h2 id="inbox-title">@include('partials.admin-icon',['name'=>'alert'])ينتظرك اليوم</h2></div>
  @if ($requestsCount)
  <div class="req-group" id="requests">
    <div class="req-head"><span class="ic">@include('partials.admin-icon',['name'=>'wallet'])</span><span><b>طلبات اشتراك بانتظار الدفع</b> <span class="count">{{ $ar::num($requestsCount) }}</span><small>فعّل الطلب بعد وصول المبلغ عبر واتساب</small></span>@if ($requestsCount > $requests->count())<a class="more-link" href="{{ route('manage.subscriptions') }}#pending">كل الطلبات</a>@endif</div>
    @foreach ($requests as $r)
    <div class="req" data-request="{{ $r->key }}">
      <span class="req-who"><b>@if ($r->user)<a href="{{ route('manage.user', $r->user) }}">{{ $r->user->name }}</a>@else عائلة محذوفة @endif</b><small>@if ($r->student){{ $r->student->name }} · {{ $ar::grade($r->student->grade) }}@else بدون طفل محدد @endif · {{ $ar::when($r->created_at, true) }}</small></span>
      <span class="req-subj">@foreach ($r->subjects as $subj)<span class="pill">{{ $subj }}</span>@endforeach</span>
      <b class="req-total">{{ $ar::money($r->total, $r->currency) }}</b>
      <span class="req-acts">
        <form method="post" action="{{ route('manage.subscriptions.bulk') }}" onsubmit="return confirm('تأكيد استلام {{ $ar::money($r->total, $r->currency) }} وتفعيل الطلب؟')">@csrf<input type="hidden" name="action" value="activate">@foreach ($r->ids as $id)<input type="hidden" name="ids[]" value="{{ $id }}">@endforeach<button class="btn small" type="submit">@include('partials.admin-icon',['name'=>'check'])تفعيل</button></form>
        <form method="post" action="{{ route('manage.subscriptions.bulk') }}" onsubmit="return confirm('رفض هذا الطلب؟')">@csrf<input type="hidden" name="action" value="cancel">@foreach ($r->ids as $id)<input type="hidden" name="ids[]" value="{{ $id }}">@endforeach<button class="btn ghost small" type="submit">رفض</button></form>
      </span>
    </div>
    @endforeach
  </div>
  @endif
  @foreach ($todo as $t)
  <a class="todo-item {{ $t['tone'] }}" href="{{ $t['href'] }}"><span class="ic">@include('partials.admin-icon',['name'=>$t['icon']])</span><span class="txt"><span>{{ $t['label'] }} <span class="count">{{ $ar::html($t['n']) }}</span></span><small>{{ $t['hint'] }}</small></span>@include('partials.admin-icon',['name'=>'arrow'])</a>
  @endforeach
  @if (! $requestsCount && ! $todo)
  <p class="todo-ok">@include('partials.admin-icon',['name'=>'check'])لا شيء ينتظرك الآن: لا طلبات دفع، ولا اشتراكات على وشك الانتهاء.</p>
  @endif
</section>
@endcan

<section class="card kpi" aria-label="أرقام الموقع">
  <div class="kpi-cells">
  @foreach ($kpis as [$k, $label, $sub, $series])
  <div class="stat" data-stat="{{ $k }}" @if ($series && $charts) data-chart="{{ $series }}" @endif><div class="txt"><b>{{ $ar::html($stats[$k]) }}</b><span>{{ $label }}</span>@if ($sub)<small>{{ $sub }}</small>@endif</div>
    @if ($series && $charts)@include('manage.partials.chart-columns', ['points' => $spark($series), 'w' => 200, 'h' => 58, 'axis' => true, 'aria' => $label.' يومًا بيوم خلال آخر 7 أيام: '.implode('، ', array_column($spark($series), 'tip'))])@endif
  </div>
  @endforeach
  </div>
</section>

@if ($charts)
<div class="grid dash charts">
  @php($sig = $charts['signups'])
  @php($sigPts = array_map(fn ($d) => ['v' => $d['n'], 'tip' => $dayName($d['date']).': '.$d['n'].' '.($d['n'] === 1 ? 'حساب' : 'حسابات')], $sig))
  <section class="card chart-card" data-chart="signups30"><h2>@include('partials.admin-icon',['name'=>'users'])التسجيلات الجديدة <small>آخر 30 يومًا</small></h2>
    <p class="chart-sum"><b>{{ array_sum(array_column($sig, 'n')) }}</b> حساب وليّ أمر جديد</p>
    @include('manage.partials.chart-area', ['points' => $sigPts, 'w' => 420, 'h' => 200, 'ends' => [\Illuminate\Support\Carbon::parse($sig[0]['date'])->format('d/m'), 'اليوم'], 'aria' => 'التسجيلات اليومية خلال آخر 30 يومًا: '.implode('، ', array_column($sigPts, 'tip'))])
  </section>
  @php($rev = $charts['revenue'])
  @php($peak = max(array_column($rev, 'amount')))
  @php($revPts = array_map(fn ($m, $i) => ['v' => $m['amount'], 'label' => $m['month'], 'cap' => $m['amount'] && ($i === count($rev) - 1 || $m['amount'] === $peak), 'capText' => $m['amount'], 'tip' => $m['month'].' '.$m['year'].': '.$ar::money($m['amount']).' · '.$m['count'].' اشتراك'], $rev, array_keys($rev)))
  <section class="card chart-card" data-chart="revenue"><h2>@include('partials.admin-icon',['name'=>'wallet'])الإيراد الشهري <small>آخر 6 أشهر</small></h2>
    <p class="chart-sum"><b>{{ $ar::money(end($rev)['amount']) }}</b> هذا الشهر</p>
    @include('manage.partials.chart-columns', ['points' => $revPts, 'w' => 420, 'h' => 200, 'axis' => true, 'aria' => 'الإيراد الشهري: '.implode('، ', array_column($revPts, 'tip'))])
  </section>
</div>
@endif

<div class="grid dash">
  <section class="card"><h2>@include('partials.admin-icon',['name'=>'students'])الطلاب حسب الصف</h2>
    @php($max = max(1, $byGrade->max() ?? 1))
    @foreach (\App\Models\Setting::gradeOptions() + [0 => 'غير محدد'] as $g => $label)
      @php($n = $byGrade[$g ?: null] ?? ($g === 0 ? ($byGrade[''] ?? 0) : 0))
      @continue($g === 0 && ! $n)
      <div class="meter"><div class="meter-row"><span>{{ $label }}</span><b>{{ $ar::html($n) }}</b></div><div class="bar-track"><div class="bar" style="width:{{ $n ? max(2, $n / $max * 100) : 0 }}%"></div></div></div>
    @endforeach
  </section>
  @can('manage-site')
  <section class="card"><h2>@include('partials.admin-icon',['name'=>'list'])آخر النشاط</h2>
    @include('manage.partials.activity-list', ['entries' => $recent])
    <p class="more"><a href="{{ route('manage.activity') }}">السجلّ كاملًا</a></p>
  </section>
  @endcan
</div>

{{-- Students with synced progress, grade × subject: darker cell = more students; «—» = the subject has no course in that grade. --}}
@php($subjects = ['الرياضيات', 'العربية', 'الإنجليزية', 'العلوم', 'التربية الحياتية'])
@php($avail = collect($ar::KEYS)->mapWithKeys(fn ($v) => [$v[0].'|'.$v[1] => true]))
@php($cells = collect($bySubject)->mapWithKeys(fn ($r) => [$r[0].'|'.$r[1] => $r[2]]))
@php($cmax = max(1, $cells->max() ?? 1))
@php($matrixGrades = collect($ar::KEYS)->map(fn ($v) => $v[0])->unique()->sort()->values())
<section class="card matrix-card"><h2>@include('partials.admin-icon',['name'=>'book'])طلاب لديهم تقدّم في كل مادة <small>كلما غمق المربع زاد العدد</small></h2>
  @if ($cells->isEmpty())<p class="hint">لا يوجد تقدّم متزامن بعد.</p>@else
  <div class="matrix-wrap"><table class="matrix">
    <thead><tr><th scope="col">الصف</th>@foreach ($subjects as $subj)<th scope="col">{{ $subj }}</th>@endforeach</tr></thead>
    <tbody>
    @foreach ($matrixGrades as $g)
      <tr><th scope="row">{{ $ar::grade($g) }}</th>
      @foreach ($subjects as $subj)
        @php($n = $cells[$g.'|'.$subj] ?? 0)
        @if (! isset($avail[$g.'|'.$subj]))<td class="na">—</td>
        @elseif ($n)@php($a = round(.14 + .86 * $n / $cmax, 2))<td><span class="heat {{ $a > .55 ? 'dark' : '' }}" style="--a:{{ $a }}" title="{{ $subj }} — {{ $ar::grade($g) }}: {{ $ar::num($n) }}">{{ $ar::num($n) }}</span></td>
        @else<td><span class="heat zero">0</span></td>@endif
      @endforeach
      </tr>
    @endforeach
    </tbody>
  </table></div>
  @endif
</section>
@endsection
