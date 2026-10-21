<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<meta name="theme-color" content="#fbf9f0">
<title>@yield('title') | {{ \App\Models\Setting::get('site_name') }}</title>
<link rel="icon" href="{{ asset('ui/favicon.svg') }}" type="image/svg+xml">
@include('partials.brand-css')
<style>
.top{background:rgba(251,249,240,.94);border-bottom:2px solid var(--line)}
.top-in{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;max-width:1120px;margin:0 auto;padding:10px 20px;min-height:68px}
.logo{display:flex}.logo img{height:46px;width:auto;display:block}
.top nav{display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.top nav a{padding:8px 14px;border-radius:12px;text-decoration:none;color:var(--ink2)}.top nav a:hover{background:var(--gl);color:var(--gd)}
.wrap{max-width:1000px;margin:0 auto;padding:28px 20px 56px}
.banner{background:var(--yl);border-bottom:2px solid #f3dc95;color:#5a4000;text-align:center;padding:10px 16px;font-weight:700}
/* صفحات الدخول: بطاقة النموذج ولوحة جانبية */
.auth{display:grid;grid-template-columns:minmax(0,470px) minmax(0,1fr);gap:28px;align-items:stretch;max-width:1080px;margin:0 auto;padding:36px 20px 56px}
.auth>.card{padding:32px clamp(22px,3vw,36px);align-self:center}
.auth h1{margin:0 0 6px;font-size:32px}
.auth .lead{color:var(--muted);margin:0 0 6px}
.auth .btn.wide{margin-top:8px}
.auth .links{margin:22px 0 0;padding-top:18px;border-top:2px dashed var(--line);font-size:16px}
.check{display:flex!important;align-items:center;gap:10px;font-weight:600!important;cursor:pointer}
.side{position:relative;overflow:hidden;background:linear-gradient(160deg,#f3f8e6 0%,var(--gl) 55%,#e4efcb 100%);border:2px solid #dfeac4;border-radius:28px;padding:32px clamp(22px,3vw,40px);display:flex;flex-direction:column;justify-content:center;gap:20px}
.side::before{content:"";position:absolute;inset-inline-end:-80px;top:-80px;width:240px;height:240px;border-radius:50%;background:rgba(255,200,61,.22)}
.side-hero{position:relative;display:flex;align-items:center;gap:18px}
.side-mascot{width:150px;height:auto;display:block;filter:drop-shadow(0 8px 0 rgba(80,122,18,.12));animation:bob 3.2s ease-in-out infinite}
@keyframes bob{50%{transform:translateY(-8px)}}
.bubble{position:relative;margin:0;background:#fff;border:2px solid var(--line);border-radius:20px;padding:12px 18px;font:800 21px/1.5 Baloo,Cairo,sans-serif;color:var(--gd);box-shadow:0 4px 0 var(--line)}
.trial{position:relative;display:flex;align-items:center;gap:12px;margin:0;background:#fff;border:2px solid #f3dc95;border-radius:18px;padding:12px 16px;box-shadow:0 4px 0 #f3dc95}
.trial svg{width:30px;height:30px;flex:none;fill:none;stroke:var(--sun-d);stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.trial b{font-family:Baloo,Cairo,sans-serif;font-size:20px;color:#7a5200}
.perks{position:relative;list-style:none;margin:0;padding:0;display:grid;gap:12px}
.perks li{display:flex;align-items:center;gap:12px;font-weight:700;color:var(--ink2)}
.ic{display:grid;place-items:center;width:42px;height:42px;border-radius:14px;flex:none}
.ic svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.ic.g{background:#fff;color:var(--gd)}.ic.b{background:var(--sky);color:var(--bd)}.ic.o{background:var(--ol);color:#b85d14}
@media (max-width:820px){
  .auth{grid-template-columns:1fr;padding:18px 14px 40px;gap:18px}
  .auth>.card{padding:24px 20px}
  .auth h1{font-size:27px}
  .side{padding:22px 18px;gap:14px}
  .side-mascot{width:84px}.bubble{font-size:17px}
  .logo img{height:38px}.top-in{min-height:58px;padding:8px 14px}
}
</style>
</head>
<body>
@php($banner = \App\Models\Setting::publicData()['announcement'])
@if ($banner)<div class="banner" role="note">{{ $banner }}</div>@endif
<header class="top"><div class="top-in">
  <a class="logo" href="{{ config('app.student_site_url') ?: route('account.home') }}"><img src="{{ asset('ui/logo-horizontal.webp') }}" alt="{{ \App\Models\Setting::get('site_name') }}" width="144" height="46"></a>
  @auth
  <form method="post" action="{{ route('account.logout') }}">@csrf<nav aria-label="الحساب"><a href="{{ route('account.home') }}">حسابي</a>@can('access-admin')<a href="{{ route('manage.dashboard') }}">لوحة الإدارة</a>@endcan<button class="btn ghost small" type="submit">تسجيل الخروج</button></nav></form>
  @endauth
</div></header>
@yield('body')
</body>
</html>
