@php($c1 = \App\Models\School::hex($school->color, '#6f9e23'))
<!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex">
<title>بطاقات {{ $section->name }} | {{ $school->name }}</title>
@include('partials.brand-css')
<style>
@page{size:A4;margin:10mm}
body{background:#fff}
.bar{display:flex;gap:10px;align-items:center;padding:12px 16px;border-bottom:2px solid var(--line)}
.sheet{display:grid;grid-template-columns:repeat(2,1fr);gap:6mm;padding:6mm}
.card2{border:2px dashed {{ $c1 }};border-radius:14px;padding:10px 12px;display:grid;grid-template-columns:1fr 92px;gap:8px;align-items:center;break-inside:avoid;page-break-inside:avoid;min-height:52mm}
.hd{display:flex;align-items:center;gap:8px;grid-column:1/-1;border-bottom:1px solid var(--line);padding-bottom:6px}
.hd img{width:34px;height:34px;object-fit:contain}.hd b{font:800 15px/1.2 Baloo,Cairo,sans-serif}.hd small{display:block;color:var(--muted);font-size:12px}
.nm{font:800 22px/1.3 Baloo,Cairo,sans-serif}.sc{color:var(--muted);font-size:14px}
.pn{font:800 13px Cairo,sans-serif;margin-top:4px}.pn span{display:inline-block;font:800 28px/1.1 monospace;letter-spacing:6px;direction:ltr;color:{{ $c1 }};background:#f6f6f0;border-radius:8px;padding:2px 10px}
canvas{width:92px;height:92px}
.ft{grid-column:1/-1;font-size:11px;color:var(--muted)}
.test{color:#7a5200;font-weight:800}
@media screen and (max-width:640px){.sheet{grid-template-columns:1fr}}
@media print{.bar{display:none}.sheet{padding:0}}
</style></head><body class="brand-font">
<div class="bar"><b>{{ $ar::count($cards->count(), 'بطاقة') }} — {{ $section->name }}</b><button class="btn small" onclick="print()">طباعة</button><span class="muted">قصّ البطاقات وسلّم كل طالب بطاقته.</span></div>
<div class="sheet">
@foreach ($cards as $c)
<div class="card2">
  <div class="hd">@if($school->logoUrl())<img src="{{ $school->logoUrl() }}" alt="">@endif<div><b>{{ $school->name }}</b><small>بستان التعلّم @if($school->is_test)<span class="test">· تجريبية</span>@endif</small></div></div>
  <div><div class="nm">{{ $c['name'] }}</div><div class="sc">{{ $section->name }} · {{ $ar::grade($section->grade) }}</div>
    <div class="pn">الرقم السري: <span>{{ $c['pin'] ?? '----' }}</span></div></div>
  <canvas width="184" height="184" data-url="{{ $c['url'] }}" aria-label="رمز QR للدخول"></canvas>
  <div class="ft">امسح الرمز ← اكتب الرقم السري. لا تشارك رقمك مع أحد.</div>
</div>
@endforeach
</div>
<script src="{{ asset('ui/qrcode.min.js') }}"></script>
<script>
document.querySelectorAll('canvas[data-url]').forEach(function(c){var q=qrcode(0,'M');q.addData(c.dataset.url);q.make();var n=q.getModuleCount(),s=c.width/(n+2),x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.fillStyle='#000';for(var r=0;r<n;r++)for(var k=0;k<n;k++)if(q.isDark(r,k))x.fillRect(Math.floor((k+1)*s),Math.floor((r+1)*s),Math.ceil(s),Math.ceil(s));});
</script>
</body></html>
