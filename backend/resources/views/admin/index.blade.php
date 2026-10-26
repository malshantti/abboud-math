<!doctype html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="robots" content="noindex,nofollow">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>لوحة التحكم | {{ config('app.name') }}</title>
    <link rel="icon" href="{{ route('admin.assets',['asset'=>'brand/favicon.svg']) }}">
    @foreach (['admin.css','math-editor.css','quiz-builder.css','content-builder.css','dashboard.css'] as $asset)
        <link rel="stylesheet" href="{{ route('admin.assets',compact('asset')) }}">
    @endforeach
    @include('partials.admin-shell-css')
    <style>
        /* Unified brand skin for the content workspace (matches the management panel) */
        :root{--bg:#fbf9f0;--ink:#24331c;--muted:#5f6b57;--olive:#6f9e23;--olive-dark:#507a12;--olive-soft:#eef5dc;--line:#e8e6d6;--gold:#e0a200;--gold-soft:#fff6d8;--blue:#1f7fb2;--blue-soft:#e5f4fc;--rose:#b8362f;--rose-soft:#fdeceb}
        body{background:radial-gradient(circle at 0 0,#eef5dc 0,transparent 38%),#fbf9f0}
        .app-shell{grid-template-columns:272px minmax(0,1fr)}
        .sidebar{background:#fff;border-inline-end:2px solid var(--line);padding:20px 14px;gap:14px}
        .admin-logo{display:block;padding:4px 10px 12px;border-bottom:2px dashed var(--line)}
        .admin-logo>img{width:auto;height:46px;display:block}
        .admin-logo small{font-weight:700}
        .sidebar-foot{display:none}
        .panel,.card,.stat-card{border:2px solid var(--line)!important;border-radius:20px;box-shadow:0 5px 0 var(--line)!important}
        .button{border-radius:14px;font-family:Baloo,Cairo,sans-serif;font-weight:800;box-shadow:0 4px 0 var(--olive-dark);transition:transform .12s,box-shadow .12s}
        .button:active{transform:translateY(3px);box-shadow:0 1px 0 var(--olive-dark)}
        .button.secondary,.button.ghost{box-shadow:0 4px 0 var(--line)}
        .topbar{border-bottom:2px solid var(--line)}
    </style>
    <script>window.ADMIN_CONFIG={{ Illuminate\Support\Js::from(['name'=>auth()->user()->name,'siteUrl'=>config('app.student_site_url'),'api'=>url('/admin/api'),'media'=>\Illuminate\Support\Facades\Gate::allows('manage-site')?route('manage.media.list'):null]) }};</script>
    @foreach (['catalog.js','math-editor.js','quiz-builder.js','content-preview.js','content-builder.js','dashboard.js','media-picker.js'] as $asset)
        <script src="{{ route('admin.assets',compact('asset')) }}" defer></script>
    @endforeach
</head>
<body>
<a class="skip-link" href="#main-content">انتقل إلى المحتوى</a>
<div class="app-shell">
    <aside class="sidebar" id="sidebar" aria-label="أقسام لوحة التحكم">
        <a class="brand admin-logo" href="{{ route('manage.dashboard') }}"><img src="{{ asset('ui/logo-horizontal.webp') }}" width="144" height="46" alt="{{ config('app.name') }}"><small>لوحة الإدارة</small></a>
        @include('partials.admin-nav', ['spa' => true])
        <div class="sidebar-foot"><img src="{{ route('admin.assets',['asset'=>'img/av-read.webp']) }}" width="88" height="88" alt=""><b>نعلّم بفكرة واضحة</b><p>أنشئ المحتوى، راجعه، واحتفظ بنسختك في الخادم.</p></div>
        <span class="sidebar-version">مساحة إدارة خاصة</span>
    </aside>
    <button id="menu-backdrop" class="menu-backdrop" aria-label="إغلاق القائمة" hidden></button>
    <main class="main" id="main-content" tabindex="-1">
        <header class="topbar">
            <div class="breadcrumb"><button class="icon-btn menu-toggle" id="menu-toggle" aria-controls="sidebar" aria-expanded="false" aria-label="فتح القائمة"><span data-icon="menu"></span></button><span>لوحة التحكم / <b id="breadcrumb-current">نظرة عامة</b></span></div>
            <div class="top-actions"><span class="chip" id="connection-status" role="status">متصل بالخادم</span><a class="account-link" href="#accounts">{{ auth()->user()->name }}</a><form method="post" action="{{ route('logout') }}" id="logout-form">@csrf<button class="button secondary small" type="submit">تسجيل الخروج</button></form></div>
        </header>
        <div id="page-content" aria-live="polite"><section class="panel"><p role="status">جارٍ تحميل لوحة التحكم…</p></section></div>
        <noscript><p class="notice">فعّل JavaScript لاستخدام محررات المحتوى ولوحة التحكم.</p></noscript>
        <footer class="page-footer">بستان التعلّم · نفهم الصعوبة، ونرافق الخطوة التالية.</footer>
    </main>
</div>
<div class="toast" id="toast" role="status" hidden></div>
</body>
</html>
