<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<title>@yield('title') | لوحة الإدارة</title>
<link rel="icon" href="{{ route('brand.asset',['asset'=>'brand/favicon.svg']) }}" type="image/svg+xml">
@include('partials.brand-css')
<style>
body{font-size:16px}
.shell{display:grid;grid-template-columns:250px 1fr;min-height:100vh}
.side{background:#fff;border-inline-end:2px solid var(--line);padding:18px 14px;position:sticky;top:0;height:100vh;overflow:auto}
.side nav{display:grid;gap:4px;margin-top:20px}
.side nav a{display:block;padding:10px 14px;border-radius:14px;text-decoration:none;color:var(--ink);font-weight:700;min-height:44px}
.side nav a:hover{background:#f3f7ec}.side nav a[aria-current=page]{background:#edf6e1;color:var(--gd);box-shadow:inset -4px 0 0 var(--leaf)}
.main{padding:22px clamp(14px,3vw,32px) 48px;min-width:0}
.head{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:12px}
.head h1{margin:0;font-size:28px}
.stats{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:14px}
.stat{background:#fff;border:2px solid var(--line);border-radius:18px;padding:14px 16px;box-shadow:0 4px 0 var(--line)}
.stat b{display:block;font:800 30px/1.3 Baloo,Cairo,sans-serif;color:var(--gd)}.stat span{color:var(--muted)}
.filters{display:flex;gap:10px;flex-wrap:wrap;align-items:end;margin:12px 0}.filters>*{flex:0 1 220px}
.table-wrap{overflow-x:auto;background:#fff;border:2px solid var(--line);border-radius:18px;padding:6px 12px}
.bar{height:12px;border-radius:8px;background:var(--leaf)}
.pager{margin-top:14px}.pager nav{display:flex;gap:6px;flex-wrap:wrap}
details pre{white-space:pre-wrap;word-break:break-all;max-height:260px;overflow:auto;background:#f7f8f2;padding:10px;border-radius:12px;font-size:13px;direction:ltr;text-align:left}
@media (max-width:860px){.shell{grid-template-columns:1fr}.side{position:static;height:auto}.side nav{grid-template-columns:repeat(auto-fill,minmax(140px,1fr))}}
</style>
</head>
<body>
<div class="shell">
  <aside class="side">
    <a class="brand" href="{{ route('manage.dashboard') }}"><img src="{{ route('brand.asset',['asset'=>'brand/favicon.svg']) }}" alt=""><span>{{ \App\Models\Setting::get('site_name') }}<small>إدارة الموقع</small></span></a>
    @php($r = request()->route()->getName())
    <nav aria-label="أقسام الإدارة">
      <a href="{{ route('manage.dashboard') }}" @if($r==='manage.dashboard') aria-current="page" @endif>لوحة المعلومات</a>
      <a href="{{ route('manage.students') }}" @if(str_starts_with($r,'manage.student')) aria-current="page" @endif>الطلاب والتقدّم</a>
      @can('manage-site')
      <a href="{{ route('manage.users') }}" @if(str_starts_with($r,'manage.user')) aria-current="page" @endif>المستخدمون</a>
      <a href="{{ route('manage.subscriptions') }}" @if(str_starts_with($r,'manage.subscription')) aria-current="page" @endif>الاشتراكات</a>
      <a href="{{ route('manage.settings') }}" @if($r==='manage.settings') aria-current="page" @endif>إعدادات الموقع</a>
      <a href="{{ route('manage.activity') }}" @if($r==='manage.activity') aria-current="page" @endif>سجل النشاط</a>
      @endcan
      <a href="{{ route('admin.index') }}">المحتوى ومسودات الاختبارات</a>
    </nav>
    <form method="post" action="{{ route('logout') }}" style="margin-top:24px">@csrf<p class="hint">{{ auth()->user()->name }} — {{ \App\Models\User::ROLES[auth()->user()->isAdminRole() ? 'admin' : auth()->user()->role] }}</p><button class="btn ghost small" type="submit">تسجيل الخروج</button></form>
  </aside>
  <main class="main" id="main">
    @include('partials.flash')
    @yield('content')
  </main>
</div>
</body>
</html>
