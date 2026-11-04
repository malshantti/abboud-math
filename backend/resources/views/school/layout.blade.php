@php($c1 = \App\Models\School::hex($school->color, '#6f9e23'))
@php($c2 = \App\Models\School::hex($school->color2, '#ffc83d'))
<!doctype html>
<html lang="ar" dir="rtl">
<head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<meta name="theme-color" content="{{ $c1 }}">
<meta name="description" content="دخول طلاب ومعلّمي {{ $school->name }} إلى بستان التعلّم">
<title>@yield('title') | {{ $school->name }}</title>
<link rel="icon" href="{{ $school->logoUrl() ?? asset('ui/favicon.svg') }}">
<link rel="preload" href="{{ asset('ui/fonts/baloo-arabic.woff2') }}" as="font" type="font/woff2" crossorigin>
@include('partials.brand-css')
<style>
:root{--g:{{ $c1 }};--gd:color-mix(in srgb,{{ $c1 }} 78%,#000);--gl:color-mix(in srgb,{{ $c1 }} 12%,#fff);--sun:{{ $c2 }}}
body{background:linear-gradient(180deg,var(--gl),var(--cream) 320px) no-repeat,var(--cream);min-height:100vh}
.sh{display:flex;align-items:center;gap:12px;max-width:1040px;margin:0 auto;padding:14px 18px}
.sh img{width:56px;height:56px;object-fit:contain;border-radius:14px;background:#fff;border:2px solid var(--line)}
.sh .mono{width:56px;height:56px;border-radius:14px;background:var(--g);color:#fff;display:grid;place-items:center;font:800 26px Baloo,Cairo,sans-serif}
.sh b{display:block;font:800 21px/1.3 Baloo,Cairo,sans-serif;color:var(--ink)}.sh small{color:var(--muted);font-size:14px}
.sh .end{margin-inline-start:auto;display:flex;gap:8px;align-items:center}
.test-flag{background:#fff3cd;color:#7a5200;border:2px dashed #e0a200;border-radius:12px;padding:2px 10px;font-weight:800;font-size:14px}
main{max-width:1040px;margin:0 auto;padding:6px 18px 48px}
.btn{box-shadow:0 5px 0 var(--gd)}
.muted{color:var(--muted)}.mt0{margin-top:0}
.foot{text-align:center;color:var(--muted);font-size:14px;padding:18px}
.foot a{color:var(--muted)}
@media(max-width:600px){.sh{flex-wrap:wrap;gap:8px 10px;padding:12px 14px}.sh>div:not(.end){flex:1 1 0;min-width:0}.sh b{font-size:18px;overflow-wrap:anywhere}.sh .end{flex-wrap:wrap;width:100%;margin-inline-start:0}.sh img,.sh .mono{width:46px;height:46px}main{padding:6px 12px 40px}}
@yield('css')
</style>
</head>
<body class="brand-font">
<header class="sh">
  @if ($school->logoUrl())<img src="{{ $school->logoUrl() }}" alt="شعار {{ $school->name }}" width="56" height="56" fetchpriority="high">@else<span class="mono" aria-hidden="true">{{ mb_substr($school->name, 0, 1) }}</span>@endif
  <div><b>{{ $school->name }}</b><small>على منصّة بستان التعلّم</small></div>
  @if ($school->is_test)<span class="test-flag">مدرسة تجريبية — للاختبار</span>@endif
  <div class="end">@yield('head-end')</div>
</header>
<main>
@if (session('status'))<div class="alert ok" role="status">{{ session('status') }}</div>@endif
@if ($errors->any())<div class="alert err" role="alert">{{ $errors->first() }}</div>@endif
@yield('content')
</main>
<p class="foot">بستان التعلّم · منهاج فلسطين</p>
@yield('js')
</body>
</html>
