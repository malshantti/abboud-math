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
    <script>window.ADMIN_CONFIG={{ Illuminate\Support\Js::from(['name'=>auth()->user()->name,'siteUrl'=>config('app.student_site_url'),'api'=>url('/admin/api')]) }};</script>
    @foreach (['catalog.js','math-editor.js','quiz-builder.js','content-preview.js','content-builder.js','dashboard.js'] as $asset)
        <script src="{{ route('admin.assets',compact('asset')) }}" defer></script>
    @endforeach
</head>
<body>
<a class="skip-link" href="#main-content">انتقل إلى المحتوى</a>
<div class="app-shell">
    <aside class="sidebar" id="sidebar" aria-label="أقسام لوحة التحكم">
        <a class="brand" href="#overview"><img src="{{ route('admin.assets',['asset'=>'brand/favicon.svg']) }}" width="42" height="42" alt=""><span>بستان التعلّم<small>لوحة التحكم</small></span></a>
        <p class="nav-label">إدارة البستان</p>
        <nav id="navigation">
            <a class="nav-item" href="#overview" data-view="overview"><span data-icon="grid"></span>نظرة عامة</a>
            <a class="nav-item" href="#library" data-view="library"><span data-icon="book"></span>مكتبة المحتوى</a>
            <a class="nav-item" href="#content-builder" data-view="content-builder"><span data-icon="plus"></span>منشئ المحتوى</a>
            <a class="nav-item" href="#quiz-builder" data-view="quiz-builder"><span data-icon="quiz"></span>مصمم الاختبارات</a>
            <a class="nav-item" href="#courses" data-view="courses"><span data-icon="book"></span>مواد الموقع</a>
            <a class="nav-item" href="#students" data-view="students"><span data-icon="students"></span>الطلاب</a>
            <a class="nav-item" href="#accounts" data-view="accounts"><span data-icon="users"></span>المشرفون</a>
        </nav>
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
