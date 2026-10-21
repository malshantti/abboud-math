<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<meta name="theme-color" content="#647b43">
<title>@yield('title') | {{ \App\Models\Setting::get('site_name') }}</title>
<link rel="icon" href="{{ route('brand.asset',['asset'=>'brand/favicon.svg']) }}" type="image/svg+xml">
@include('partials.brand-css')
<style>
.top{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;max-width:1000px;margin:0 auto;padding:16px 20px}
.wrap{max-width:1000px;margin:0 auto;padding:0 20px 48px}
.auth{display:grid;grid-template-columns:1fr minmax(0,460px);gap:32px;align-items:center;max-width:920px;margin:3vh auto;padding:0 20px 48px}
.auth .mascot{text-align:center}.auth .mascot img{width:min(220px,50vw);height:auto}
.auth .mascot p{font:700 22px/1.6 Baloo,Cairo,sans-serif;color:var(--gd)}
.auth h1{margin:0 0 4px;font-size:30px}
.banner{background:#fff4d6;border-bottom:2px solid #f0d58a;color:#5a4000;text-align:center;padding:10px 16px;font-weight:700}
@media (max-width:760px){.auth{grid-template-columns:1fr}.auth .mascot img{width:130px}}
</style>
</head>
<body>
@php($banner = \App\Models\Setting::publicData()['announcement'])
@if ($banner)<div class="banner" role="note">{{ $banner }}</div>@endif
<header class="top">
  <a class="brand" href="{{ config('app.student_site_url') ?: route('account.home') }}"><img src="{{ route('brand.asset',['asset'=>'brand/favicon.svg']) }}" alt=""><span>{{ \App\Models\Setting::get('site_name') }}<small>{{ \App\Models\Setting::get('tagline') }}</small></span></a>
  @auth
  <form method="post" action="{{ route('account.logout') }}" class="row">@csrf<a href="{{ route('account.home') }}">حسابي</a>@can('access-admin')<a href="{{ route('manage.dashboard') }}">لوحة الإدارة</a>@endcan<button class="btn ghost small" type="submit">تسجيل الخروج</button></form>
  @endauth
</header>
@yield('body')
</body>
</html>
