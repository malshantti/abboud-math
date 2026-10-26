<!doctype html>
<html lang="ar" dir="rtl">
<head><meta charset="utf-8">

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

.hero{display:grid;grid-template-columns:auto 1fr;gap:14px;align-items:center;background:#fff;border:2px solid var(--line);border-radius:22px;box-shadow:0 5px 0 var(--line);padding:16px;margin:0 0 12px}
.hero .ring{width:132px;height:132px}
.minis{display:grid;gap:8px}.mini{display:flex;align-items:center;gap:10px}.mini .ic{flex:none;width:40px;height:40px;border-radius:12px;display:grid;place-items:center}
.mini .ic svg{width:22px;height:22px}.mini b{display:block;font:800 19px/1.2 Baloo,Cairo,sans-serif}.mini span{font-size:13px;color:var(--muted)}
.note{display:flex;gap:10px;align-items:flex-start;background:var(--yl);border:2px solid #f3dc95;border-radius:18px;padding:12px 14px;margin:0 0 16px;color:#5a4000;font-weight:700}
.note svg{flex:none;width:28px;height:28px}
.ring text{font-family:Baloo,Cairo,sans-serif}
.subj-h{display:flex;align-items:center;gap:10px;margin-bottom:8px}.subj-h .ic{width:44px;height:44px;border-radius:14px;display:grid;place-items:center;color:#fff}.subj-h .ic svg{width:24px;height:24px}
.subj-h h2{margin:0}
.subj-b{display:grid;grid-template-columns:96px 1fr;gap:14px;align-items:center}.subj-b .ring{width:96px;height:96px}
.bar2{height:14px;border-radius:99px;background:#eef0e6;overflow:hidden;margin:4px 0}.bar2 i{display:block;height:100%;border-radius:99px}
.small-kv{font-size:14px;color:var(--muted);display:flex;flex-wrap:wrap;gap:4px 14px;margin-top:6px}.small-kv b{color:var(--ink)}
.chart{width:100%;height:auto;display:block}.chart text{font:600 11px Cairo,sans-serif;fill:var(--muted)}
.legend{font-size:13px;color:var(--muted);margin:4px 0 0}
.mcards{display:grid;gap:10px}.mcard{border:2px solid var(--line);border-radius:16px;padding:12px;background:#fff}
.mcard .q{font-weight:800;margin:0 0 8px}.ans{display:flex;flex-wrap:wrap;gap:6px}.ans span{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:12px;font-weight:700;font-size:15px}
.ans .no{background:var(--red-bg);color:var(--red-d)}.ans .yes{background:var(--gl);color:var(--gd)}.ans svg{width:14px;height:14px}
.mcard .meta{color:var(--muted);font-size:13px;margin-top:6px}
details.more{margin-top:12px}details.more summary{cursor:pointer;font-weight:800;color:var(--gd);min-height:44px;display:flex;align-items:center}
@media print{details.more>*{display:block}.hero,.mcard{break-inside:avoid}}
</style>
</head>
<body>
@php
$ar = \App\Support\Ar::class;
$dur = fn ($ms) => \App\Support\Report::duration((int) $ms);
$icons = [
 'math' => '<path d="M5 12h14M12 5v14" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/>',
 'book' => '<path d="M4 5c3-1 6-1 8 1 2-2 5-2 8-1v14c-3-1-6-1-8 1-2-2-5-2-8-1z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 6v14" stroke="currentColor" stroke-width="2"/>',
 'globe' => '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M3.5 12h17M12 3.5c3 3 3 14 0 17M12 3.5c-3 3-3 14 0 17" fill="none" stroke="currentColor" stroke-width="1.8"/>',
 'flask' => '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/>',
 'leaf' => '<path d="M5 19C5 10 10 5 20 4c0 10-5 15-14 15zM5 19l8-8" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
 'check' => '<path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
 'clock' => '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7v5l3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
 'q' => '<circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.3-1 .8-1 1.5M12 16.5v.1" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>',
 'x' => '<path d="M7 7l10 10M17 7L7 17" stroke="currentColor" stroke-width="2.8" stroke-linecap="round"/>',
 'star' => '<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z" fill="#ffc83d" stroke="#e0a200" stroke-width="1.4" stroke-linejoin="round"/>',
];
$svg = fn ($k) => new \Illuminate\Support\HtmlString('<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">'.$icons[$k].'</svg>');
$ring = function (?int $pct, string $color, string $label, int $stroke = 12) use ($ar) {
  $r = 50 - $stroke / 2 - 2; $c = 2 * M_PI * $r; $v = $pct ?? 0;
  $txt = $pct === null ? '—' : e($ar::num($pct)).'٪';
  return new \Illuminate\Support\HtmlString('<svg class="ring" viewBox="0 0 100 100" role="img" aria-label="'.e($label).': '.($pct === null ? 'لا بيانات' : e($ar::num($pct)).'٪').'">'
   .'<circle cx="50" cy="50" r="'.$r.'" fill="none" stroke="#eef0e6" stroke-width="'.$stroke.'"/>'
   .'<circle cx="50" cy="50" r="'.$r.'" fill="none" stroke="'.$color.'" stroke-width="'.$stroke.'" stroke-linecap="round" stroke-dasharray="'.round($c * $v / 100, 2).' '.round($c, 2).'" transform="rotate(-90 50 50)"/>'
   .'<text x="50" y="'.($stroke > 10 ? 52 : 50).'" text-anchor="middle" dominant-baseline="middle" font-size="'.($stroke > 10 ? 22 : 20).'" font-weight="800" fill="#24331c">'.$txt.'</text>'
   .($stroke > 10 ? '<text x="50" y="72" text-anchor="middle" font-size="9" fill="#5f6b57">صواب</text>' : '').'</svg>');
};
$pctColor = fn ($p) => $p === null ? '#c9cdb8' : ($p >= 80 ? '#6f9e23' : ($p >= 50 ? '#e0a200' : '#e5534b'));
$series = $r['series'];
$W = 340; $H = 150; $pl = 8; $pr = 30; $pt = 14; $pb = 24; $n = count($series); $step = ($W - $pl - $pr) / max(1, $n);
$xOf = fn ($i) => $W - $pr - ($i + 0.5) * $step; // RTL: oldest on the right
$maxMin = max(10, max(array_column($series, 'min') ?: [0]));
$hasTime = array_sum(array_column($series, 'min')) > 0;
$pts = []; foreach ($series as $i => $d) { if ($d['pct'] !== null) $pts[] = [$xOf($i), $pt + ($H - $pt - $pb) * (1 - $d['pct'] / 100), $d['pct']]; }
$dayLbl = fn ($d) => $ar::num((int) substr($d, 8, 2).'/'.(int) substr($d, 5, 2));
@endphp
<main class="wrap">
  <div class="rhead">
    <div><h1>تقرير تقدّم {{ $student->name }}</h1><p class="sub">{{ $ar::grade($student->grade) }} · آخر مزامنة: {{ $student->last_synced_at ? $ar::date($student->last_synced_at) : 'لم يُزامَن بعد' }}</p></div>
    @if ($back)<a class="btn ghost small noprint" href="{{ $back }}">رجوع</a>@endif
  </div>
  @if (session('status'))<div class="alert ok noprint">{{ session('status') }}</div>@endif

  <section class="hero" aria-label="ملخص">
    {!! $ring($r['pct'], $pctColor($r['pct']), 'نسبة الإجابات الصحيحة') !!}
    <div class="minis">
      <div class="mini"><span class="ic" style="background:#eef5dc;color:#507a12">{{ $svg('check') }}</span><div><b>{{ $ar::html($r['done']) }}</b><span>درسًا منجزًا</span></div></div>
      <div class="mini"><span class="ic" style="background:#e5f4fc;color:#1f7fb2">{{ $svg('clock') }}</span><div><b>{{ $dur($r['total_ms']) }}</b><span>وقت الدراسة</span></div></div>
      <div class="mini"><span class="ic" style="background:#fff0e3;color:#c4621a">{{ $svg('q') }}</span><div><b>{{ $ar::html($r['answered']) }}</b><span>سؤالًا مُجابًا</span></div></div>
    </div>
  </section>
  <p class="note">{{ $svg('star') }}<span>{{ \App\Support\Report::note($student->name, $r) }}</span></p>

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

  @if ($hasTime)
  <section class="card"><h2>وقت الدراسة يوميًا</h2>
    <svg class="chart" viewBox="0 0 {{ $W }} {{ $H }}" role="img" aria-label="رسم بياني لدقائق الدراسة في آخر {{ $ar::num($n) }} يومًا">
      @foreach ([0, 0.5, 1] as $f)@php $y = $pt + ($H - $pt - $pb) * (1 - $f); @endphp<line x1="{{ $pl }}" x2="{{ $W - $pr }}" y1="{{ $y }}" y2="{{ $y }}" stroke="#eef0e6"/>@if ($f)<text x="{{ $W - $pr + 4 }}" y="{{ $y + 4 }}">{{ $ar::num((int) round($maxMin * $f)) }}</text>@endif @endforeach
      @foreach ($series as $i => $d)
        @php $h = ($H - $pt - $pb) * $d['min'] / $maxMin; @endphp
        @if ($d['min'] > 0)<rect x="{{ round($xOf($i) - $step * 0.32, 1) }}" y="{{ round($H - $pb - $h, 1) }}" width="{{ round($step * 0.64, 1) }}" height="{{ round(max(2, $h), 1) }}" rx="4" fill="#2e9fd8"><title>{{ $dayLbl($d['date']) }}: {{ $ar::num($d['min']) }} دقيقة</title></rect>@endif
        @if ($i % 2 === ($n - 1) % 2)<text x="{{ round($xOf($i), 1) }}" y="{{ $H - 6 }}" text-anchor="middle">{{ $dayLbl($d['date']) }}</text>@endif
      @endforeach
    </svg>
    <p class="legend">بالدقائق، آخر {{ $ar::num($n) }} يومًا (الأحدث على اليسار).</p>
  </section>
  @endif

  @if (count($pts) >= 2)
  <section class="card"><h2>نسبة الصواب مع الوقت</h2>
    <svg class="chart" viewBox="0 0 {{ $W }} {{ $H }}" role="img" aria-label="رسم بياني لنسبة الإجابات الصحيحة يوميًا">
      @foreach ([0, 50, 100] as $f)@php $y = $pt + ($H - $pt - $pb) * (1 - $f / 100); @endphp<line x1="{{ $pl }}" x2="{{ $W - $pr }}" y1="{{ $y }}" y2="{{ $y }}" stroke="#eef0e6"/><text x="{{ $W - $pr + 4 }}" y="{{ $y + 4 }}">{{ $ar::num($f) }}٪</text>@endforeach
      <polyline points="{{ implode(' ', array_map(fn ($p) => round($p[0], 1).','.round($p[1], 1), $pts)) }}" fill="none" stroke="#6f9e23" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
      @foreach ($pts as $p)<circle cx="{{ round($p[0], 1) }}" cy="{{ round($p[1], 1) }}" r="4.5" fill="#fff" stroke="{{ $pctColor($p[2]) }}" stroke-width="3"/>@endforeach
      @foreach ($series as $i => $d)@if ($i % 2 === ($n - 1) % 2)<text x="{{ round($xOf($i), 1) }}" y="{{ $H - 6 }}" text-anchor="middle">{{ $dayLbl($d['date']) }}</text>@endif @endforeach
    </svg>
  </section>
  @endif

  @forelse ($r['subjects'] as $s)
  @php $p = $s['progress']; [$col, $ico] = \App\Support\Report::look($s['code']); @endphp
  <section class="card">
    <div class="subj-h"><span class="ic" style="background:{{ $col }}">{{ $svg($ico) }}</span><h2>{{ $s['name'] }} <span class="chip">{{ $ar::grade($s['grade']) }}</span></h2></div>
    <div class="subj-b">
      {!! $ring($s['pct'], $s['pct'] === null ? '#c9cdb8' : $col, 'نسبة الصواب في '.$s['name'], 10) !!}
      <div>
        @if ($p && $p['done'] !== null)
          <div>الدروس: <b>{{ $ar::html($p['done']) }}</b>@if ($p['total']) من {{ $ar::html($p['total']) }}@endif</div>
          <div class="bar2" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="{{ $p['pct'] ?? 0 }}" aria-label="الدروس المنجزة"><i style="width:{{ max(3, $p['pct'] ?? ($p['done'] ? 100 : 0)) }}%;background:{{ $col }}"></i></div>
        @endif
        <div class="small-kv">
          <span>الوقت: <b>{{ $dur($s['ms']) }}</b></span>
          @if ($p && $p['quiz_avg'] !== null)<span>الاختبارات: <b>{{ $ar::html($p['quiz_avg']) }}٪</b></span>@endif
          <span>آخر نشاط: <b>{{ $p && $p['last'] ? $ar::date($p['last'], false) : '—' }}</b></span>
        </div>
      </div>
    </div>
    @if ($s['wrong'])
      <h3>أسئلة نتدرّب عليها</h3>
      <div class="mcards">
      @foreach (array_slice($s['wrong'], 0, 6) as $w)
        <div class="mcard">@if ($w['question'])<p class="q">{{ $w['question'] }}</p>@endif
          <div class="ans"><span class="no">{{ $svg('x') }} {{ $w['chosen'] ?: '—' }}</span>@if ($w['correct'])<span class="yes">{{ $svg('check') }} {{ $w['correct'] }}</span>@endif</div>
          <div class="meta">{{ $w['lesson'] }}@if ($w['at']) · {{ $ar::date($w['at'], false) }}@endif</div></div>
      @endforeach
      </div>
    @endif
    @if ($s['lessons'])
      <details class="more"><summary>التفاصيل: الدروس ({{ $ar::num(count($s['lessons'])) }})</summary>
      <div style="overflow-x:auto"><table><thead><tr><th>الدرس</th><th>الوقت</th><th>الصواب</th><th>آخر مرة</th></tr></thead><tbody>
      @foreach (array_slice($s['lessons'], 0, 20) as $l)
        <tr><td>{{ $l['name'] }}</td><td class="n">{{ $dur($l['ms']) }}</td>
          <td class="n">@if ($l['pct'] !== null)<span class="pill {{ $l['pct'] >= 80 ? '' : ($l['pct'] >= 50 ? 'mid' : 'low') }}">{{ $ar::html($l['pct']) }}٪</span>@else — @endif</td>
          <td class="n">{{ $l['last'] ? $ar::date($l['last'], false) : '—' }}</td></tr>
      @endforeach
      </tbody></table></div></details>
    @endif
  </section>
  @empty
  <p class="card">لا يوجد تقدّم متزامن لهذا الطالب بعد. يظهر التقرير بعد أن يدرس الطالب درسًا على جهاز مسجَّل بحساب العائلة.</p>
  @endforelse
  <p class="hint noprint" style="text-align:center"><button class="btn ghost small" type="button" onclick="document.querySelectorAll('details').forEach(d=>d.open=true);print()">طباعة / حفظ PDF</button></p>
</main>
</body>
</html>
