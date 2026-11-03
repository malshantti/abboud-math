@php($c1 = \App\Models\School::hex($school->color, '#6f9e23'))
@php($c2 = \App\Models\School::hex($school->color2, '#ffc83d'))
@php($months = ['', 'كانون الثاني', 'شباط', 'آذار', 'نيسان', 'أيار', 'حزيران', 'تموز', 'آب', 'أيلول', 'تشرين الأول', 'تشرين الثاني', 'كانون الأول'])
@php($mName = $months[(int) $from->format('n')].' '.$ar::num($from->format('Y')))
@php($ic = ['star' => '🌟', 'days' => '📅', 'hw' => '✅', 'team' => '🏆'])
<!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow">
<title>شهادات {{ $mName }} — {{ $section->name }} | {{ $school->name }}</title>
<link rel="preload" href="{{ asset('ui/fonts/baloo-arabic.woff2') }}" as="font" type="font/woff2" crossorigin>
@include('partials.brand-css')
<style>
body{background:#eee;margin:0;font-family:Cairo,sans-serif;color:#2b2b2b}
.bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;max-width:1000px;margin:0 auto;padding:12px}
.bar select,.bar a,.bar button{font:inherit;font-weight:800}
.cert{box-sizing:border-box;width:min(100%,1000px);aspect-ratio:297/210;margin:0 auto 18px;background:#fffdf6;border:14px solid {{ $c1 }};outline:3px solid {{ $c2 }};outline-offset:-26px;padding:5% 7%;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;position:relative;break-after:page;container-type:inline-size}
.cert img{width:13cqw;height:13cqw;object-fit:contain}.cert .mono{width:11cqw;height:11cqw;border-radius:20%;background:{{ $c1 }};color:#fff;display:grid;place-items:center;font:800 6cqw Baloo,Cairo,sans-serif}
.cert .sc{font:800 2.6cqw Cairo,sans-serif;color:#555;margin:.8cqw 0}
.cert h1{font:800 5.2cqw/1.2 Baloo,Cairo,sans-serif;color:{{ $c1 }};margin:.6cqw 0}
.cert .to{font-size:2.3cqw;margin:0}.cert .nm{font:800 5cqw/1.3 Baloo,Cairo,sans-serif;margin:.6cqw 0;border-bottom:3px dotted {{ $c2 }};padding:0 4cqw}
.cert .why{font-size:2.3cqw;margin:.6cqw 0}.cert .ft{display:flex;justify-content:space-between;width:100%;margin-top:3cqw;font-size:1.9cqw;color:#555}
.cert .ft span{border-top:2px solid #aaa;padding-top:.5cqw;min-width:22cqw}.cert .em{font-size:5cqw}.test{position:absolute;top:2cqw;inset-inline-start:3cqw;background:#fff3cd;border:2px dashed #e0a200;border-radius:10px;padding:0 1cqw;font-size:1.6cqw;font-weight:800}
.none{max-width:700px;margin:40px auto;background:#fff;border-radius:16px;padding:20px;text-align:center}
@media print{body{background:#fff}.bar{display:none}.cert{width:100%;margin:0;border-width:10mm}@page{size:A4 landscape;margin:0}}
</style></head><body>
<form class="bar" method="get"><b>شهادات {{ $section->name }}</b>
<select name="m" onchange="this.form.submit()">@for ($i = 0; $i < 6; $i++)@php($mm = now(\App\Support\SchoolStats::tz())->startOfMonth()->subMonths($i))<option value="{{ $mm->format('Y-m') }}" @selected($mm->format('Y-m') === $m)>{{ $months[(int) $mm->format('n')] }} {{ $ar::num($mm->format('Y')) }}</option>@endfor</select>
<span>{{ $ar::num(count($certs)) }} شهادة</span>
<button class="btn small" type="button" onclick="print()">طباعة / حفظ PDF</button><a class="btn ghost small" href="{{ route('school.honor', [$school, $section]) }}">لوحة الشرف</a></form>
@forelse ($certs as $c)
<div class="cert">@if ($school->is_test)<span class="test">نموذج تجريبي</span>@endif
@if ($school->logoUrl())<img src="{{ $school->logoUrl() }}" alt="شعار {{ $school->name }}">@else<span class="mono">{{ mb_substr($school->name, 0, 1) }}</span>@endif
<div class="sc">{{ $school->name }}</div><div class="em">{{ $ic[$c['type']] }}</div><h1>{{ $c['title'] }}</h1>
<p class="to">تُمنح هذه الشهادة إلى</p><div class="nm">{{ $c['name'] }}</div>
<p class="why">{{ $section->name }} · {{ $ar::grade($section->grade) }} — {{ $c['why'] }}</p><p class="why">شهر {{ $mName }}. نفخر بجهدك ومثابرتك، واصل!</p>
<div class="ft"><span>المعلّم/ة</span><span>مدير/ة المدرسة</span></div></div>
@empty<div class="none">لا شهادات لهذا الشهر بعد. تُمنح الشهادات للمثابرة (٨ أيام تعلّم فأكثر)، ولنجم الشهر، ولمن أنجز كل الواجبات، وللشعبة الفائزة في تحدٍّ.</div>@endforelse
</body></html>
