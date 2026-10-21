<!doctype html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="robots" content="noindex,nofollow">
    <meta name="theme-color" content="#fbf9f0">
    <title>@yield('title') | {{ config('app.name') }}</title>
    <link rel="icon" href="{{ asset('ui/favicon.svg') }}" type="image/svg+xml">
    @include('partials.brand-css')
    <style>
        body{min-height:100vh;display:flex;flex-direction:column;align-items:center;padding:28px 16px 48px;background:radial-gradient(circle at 85% 0,#eef5dc 0,transparent 45%),var(--cream)}
        .logo{display:flex;margin:0 0 22px}.logo img{height:52px;width:auto}
        main{width:min(500px,100%);background:#fff;border:2px solid var(--line);border-radius:26px;box-shadow:0 6px 0 var(--line);padding:clamp(24px,5vw,40px);position:relative}
        main .badge{position:absolute;top:-34px;inset-inline-start:24px;width:62px;height:auto}
        h1{font-size:clamp(26px,5vw,32px);margin:0 0 6px}h2{font-size:21px;margin:0 0 8px}
        p{margin:8px 0;color:var(--ink2)}
        button,.button{display:inline-flex;align-items:center;justify-content:center;min-height:52px;border:0;border-radius:16px;background:var(--g);color:#fff;padding:10px 24px;font:800 18px/1.2 Baloo,Cairo,sans-serif;cursor:pointer;text-decoration:none;box-shadow:0 5px 0 var(--gd);transition:transform .12s,box-shadow .12s}
        button:active,.button:active{transform:translateY(4px);box-shadow:0 1px 0 var(--gd)}
        .primary{width:100%;margin-top:8px}
        .error,.status{padding:12px 16px;border-radius:14px;margin:16px 0;font-weight:600}
        .error{background:var(--red-bg);border:2px solid #f3c9c6;color:#8a2a24}.error ul{margin:0;padding-inline-start:20px}
        .status{background:var(--gl);border:2px solid #cfe3a8;color:var(--gd)}
        .account{display:grid;gap:4px;margin:20px 0;padding:16px 18px;border:2px solid var(--line);border-radius:18px}.account bdi{overflow-wrap:anywhere}
        .scope{border-top:2px dashed var(--line);padding-top:20px;margin:20px 0}
        .foot{font-size:16px;margin-top:22px;padding-top:16px;border-top:2px dashed var(--line)}.muted{font-size:15px;color:var(--muted)}
        input[aria-invalid=true]{border-color:var(--red)}
        form{margin:0}
    </style>
</head>
<body>
<a class="logo" href="{{ route('home') }}"><img src="{{ asset('ui/logo-horizontal.webp') }}" alt="{{ config('app.name') }}" width="163" height="52"></a>
<main>
    <img class="badge" src="{{ asset('ui/logo-mascot.webp') }}" alt="" width="62" height="82">
    @yield('content')
</main>
</body>
</html>
