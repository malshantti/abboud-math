@php($ar = \App\Support\Ar::class)
@php($dur = fn ($ms) => \App\Support\Report::duration((int) $ms))
<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<meta name="referrer" content="no-referrer">
<meta name="theme-color" content="#fbf9f0">
<title>تقرير {{ $student->name }} | {{ \App\Models\Setting::get('site_name') }}</title>
<link rel="icon" href="{{ asset('ui/favicon.svg') }}" type="image/svg+xml">
@include('partials.brand-css')
<style>
.wrap{max-width:900px;margin:0 auto;padding:20px 16px 56px}
.rhead{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px}
.rhead h1{margin:0;font-size:26px}.rhead .sub{color:var(--muted);margin:0;font-size:15px}
.chip{display:inline-block;padding:2px 12px;border-radius:999px;background:var(--gl);color:var(--gd);font-size:14px;font-weight:700}
.stats{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin:0 0 16px}
@media(min-width:640px){.stats{grid-template-columns:repeat(4,minmax(0,1fr))}}
.stat{background:#fff;border:2px solid var(--line);border-radius:18px;padding:12px 14px;box-shadow:0 4px 0 var(--line)}
.stat b{display:block;font:800 24px/1.3 Baloo,Cairo,sans-serif;color:var(--gd)}.stat span{font-size:14px;color:var(--muted)}
.card{padding:18px;margin:0 0 16px}.card h2{margin:0 0 8px;font-size:21px;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.card h3{margin:14px 0 6px;font-size:17px}
.track{height:12px;border-radius:99px;background:var(--gl);overflow:hidden;margin:6px 0 2px}.track i{display:block;height:100%;background:var(--g);border-radius:99px}
.kv{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:6px 12px;margin:8px 0;font-size:15px}.kv dt{color:var(--muted)}.kv dd{margin:0;font-weight:700}
table{width:100%;border-collapse:collapse;font-size:15px}th,td{text-align:start;padding:7px 6px;border-bottom:1px solid var(--line);vertical-align:top}th{color:var(--muted);font-weight:700;font-size:14px}
td.n{white-space:nowrap}
.pill{display:inline-block;min-width:44px;text-align:center;padding:0 8px;border-radius:999px;background:var(--gl);color:var(--gd);font-weight:800}
.pill.mid{background:var(--yl);color:#7a5600}.pill.low{background:var(--red-bg);color:var(--red-d)}
.wrong{list-style:none;margin:0;padding:0}.wrong li{border:2px solid #f3dcd9;background:#fffafa;border-radius:14px;padding:10px 12px;margin:8px 0;font-size:15px}
.wrong .q{font-weight:700;margin:0 0 4px}.wrong .meta{color:var(--muted);font-size:13px}
.bad{color:var(--red-d);font-weight:800}.ok{color:var(--gd);font-weight:800}
.days{display:flex;flex-wrap:wrap;gap:6px;list-style:none;margin:0;padding:0}.days li{background:#fff;border:2px solid var(--line);border-radius:12px;padding:4px 10px;font-size:14px}
.none{color:var(--muted)}
.share{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.share input{flex:1 1 220px;min-height:44px;font-size:14px;direction:ltr}
.share form{margin:0}
@media print{.noprint{display:none!important}.card,.stat{box-shadow:none}}
</style>
</head>
<body>
<main class="wrap">
  <div class="rhead">
    <div><h1>تقرير تقدّم {{ $student->name }}</h1><p class="sub">{{ $ar::grade($student->grade) }} · آخر مزامنة: {{ $student->last_synced_at ? $ar::date($student->last_synced_at) : 'لم يُزامَن بعد' }}</p></div>
    @if ($back)<a class="btn ghost small noprint" href="{{ $back }}">رجوع</a>@endif
  </div>
  @if (session('status'))<div class="alert ok noprint">{{ session('status') }}</div>@endif

  <section class="stats" aria-label="ملخص">
    <div class="stat"><b>{{ $ar::html($r['done']) }}</b><span>درسًا منجزًا</span></div>
    <div class="stat"><b>@if ($r['pct'] !== null){{ $ar::html($r['pct']) }}٪@else — @endif</b><span>إجابات صحيحة</span></div>
    <div class="stat"><b>{{ $dur($r['total_ms']) }}</b><span>وقت الدراسة</span></div>
    <div class="stat"><b>{{ $ar::html($r['answered']) }}</b><span>سؤالًا مُجابًا</span></div>
  </section>

  @if ($mode === 'parent')
  <section class="card noprint"><h2>مشاركة التقرير</h2>
    @if ($student->report_token)
      <p class="hint">أي شخص معه هذا الرابط يرى التقرير فقط (قراءة دون تعديل). أوقفه متى شئت.</p>
      <div class="share"><input readonly value="{{ route('report.shared', $student->report_token) }}" aria-label="رابط التقرير" onclick="this.select()">
        <form method="post" action="{{ route('account.report.share', $student) }}">@csrf<button class="btn ghost small" type="submit">رابط جديد</button></form>
        <form method="post" action="{{ route('account.report.unshare', $student) }}">@csrf @method('delete')<button class="btn danger small" type="submit">إيقاف الرابط</button></form></div>
    @else
      <p class="hint">أنشئ رابطًا خاصًا للقراءة فقط لمشاركته مع الأب أو الأم أو المعلم.</p>
      <form method="post" action="{{ route('account.report.share', $student) }}">@csrf<button class="btn small" type="submit">إنشاء رابط مشاركة</button></form>
    @endif
  </section>
  @endif

  @if (! $r['tracked'])
  <p class="alert ok">يبدأ تسجيل وقت الدراسة والإجابات الخاطئة من الآن، ويظهر هنا بعد أول درس ومزامنة.</p>
  @endif

  @forelse ($r['subjects'] as $s)
  @php($p = $s['progress'])
  <section class="card">
    <h2>{{ $s['name'] }} <span class="chip">{{ $ar::grade($s['grade']) }}</span></h2>
    @if ($p && $p['done'] !== null)
      <div>الدروس المنجزة: <b>{{ $ar::html($p['done']) }}</b>@if ($p['total']) من {{ $ar::html($p['total']) }}@endif</div>
      @if ($p['pct'] !== null)<div class="track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="{{ $p['pct'] }}" aria-label="نسبة الإنجاز"><i style="width:{{ max(2, $p['pct']) }}%"></i></div>@endif
    @endif
    <dl class="kv">
      <div><dt>نسبة الصواب</dt><dd>@if ($s['pct'] !== null){{ $ar::html($s['pct']) }}٪ <small>({{ $ar::html($s['correct']) }} من {{ $ar::html($s['answered']) }})</small>@else<span class="none">—</span>@endif</dd></div>
      <div><dt>متوسط الاختبارات</dt><dd>@if ($p && $p['quiz_avg'] !== null){{ $ar::html($p['quiz_avg']) }}٪@else<span class="none">—</span>@endif</dd></div>
      <div><dt>وقت الدراسة</dt><dd>{{ $dur($s['ms']) }}</dd></div>
      <div><dt>آخر نشاط</dt><dd>{{ $p && $p['last'] ? $ar::date($p['last'], false) : '—' }}</dd></div>
    </dl>
    @if ($s['lessons'])
      <h3>الدروس</h3>
      <div style="overflow-x:auto"><table><thead><tr><th>الدرس</th><th>الوقت</th><th>الصواب</th><th>آخر مرة</th></tr></thead><tbody>
      @foreach (array_slice($s['lessons'], 0, 12) as $l)
        <tr><td>{{ $l['name'] }}</td><td class="n">{{ $dur($l['ms']) }}</td>
          <td class="n">@if ($l['pct'] !== null)<span class="pill {{ $l['pct'] >= 80 ? '' : ($l['pct'] >= 50 ? 'mid' : 'low') }}">{{ $ar::html($l['pct']) }}٪</span>@else — @endif</td>
          <td class="n">{{ $l['last'] ? $ar::date($l['last'], false) : '—' }}</td></tr>
      @endforeach
      </tbody></table></div>
    @endif
    @if ($s['wrong'])
      <h3>أسئلة أخطأ فيها مؤخرًا</h3>
      <ul class="wrong">
      @foreach ($s['wrong'] as $w)
        <li>@if ($w['question'])<p class="q">{{ $w['question'] }}</p>@endif
          <div>اختار: <span class="bad">{{ $w['chosen'] ?: '—' }}</span>@if ($w['correct']) · الصحيح: <span class="ok">{{ $w['correct'] }}</span>@endif</div>
          <div class="meta">{{ $w['lesson'] }}@if ($w['at']) · {{ $ar::date($w['at']) }}@endif</div></li>
      @endforeach
      </ul>
    @endif
  </section>
  @empty
  <p class="card">لا يوجد تقدّم متزامن لهذا الطالب بعد. يظهر التقرير بعد أن يدرس الطالب درسًا على جهاز مسجَّل بحساب ولي الأمر.</p>
  @endforelse

  @if ($r['days'])
  <section class="card"><h2>النشاط الأخير</h2>
    <ul class="days">@foreach ($r['days'] as $d => $ms)<li>{{ $ar::date($d, false) }}@if ($ms) · {{ $dur($ms) }}@endif</li>@endforeach</ul>
  </section>
  @endif
  <p class="hint noprint" style="text-align:center"><button class="btn ghost small" type="button" onclick="print()">طباعة / حفظ PDF</button></p>
</main>
</body>
</html>
