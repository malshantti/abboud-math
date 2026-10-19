<!doctype html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="robots" content="noindex,nofollow">
    <title>@yield('title') | {{ config('app.name') }}</title>
    <style>
        *{box-sizing:border-box}body{margin:0;background:#f7f8f2;color:#29392b;font:18px/1.9 Tahoma,Arial,sans-serif;padding:24px 16px}main{max-width:680px;margin:5vh auto;background:#fff;border:1px solid #e2e7d9;border-radius:24px;padding:clamp(24px,5vw,48px)}a{color:#3e5729;text-underline-offset:4px}a:focus-visible,button:focus-visible,input:focus-visible{outline:3px solid #a97421;outline-offset:4px}.brand{display:inline-flex;align-items:center;gap:12px;text-decoration:none;font-weight:bold}.brand svg{width:40px;height:40px;color:#526d37;flex-shrink:0}h1{font-size:clamp(26px,5vw,34px);line-height:1.6;margin:28px 0 8px}h2{font-size:21px;margin:0 0 8px}p{margin:10px 0;color:#52604f}.field{margin:24px 0}label{display:block;font-weight:bold;margin-bottom:8px}input{display:block;width:100%;min-width:0;border:1px solid #aebaa5;border-radius:12px;padding:12px 14px;background:#fff;color:#29392b;font:18px/1.5 Tahoma,Arial,sans-serif}button,.button{display:inline-block;min-height:48px;border:0;border-radius:12px;background:#526d37;color:#fff;padding:10px 24px;font:inherit;font-weight:bold;cursor:pointer;text-align:center;text-decoration:none}.primary{width:100%}.error,.status{padding:16px 20px;border-radius:12px;margin:24px 0}.error{background:#fff1ee;border:1px solid #e5b1a4;color:#8a3325}.error ul{margin:0;padding-inline-start:24px}.status{background:#edf2e5;border:1px solid #c9d8b4;color:#3e5729}.account{display:grid;gap:4px;margin:24px 0;padding:20px;border:1px solid #e2e7d9;border-radius:16px}.account bdi{overflow-wrap:anywhere}.scope{border-top:1px solid #e2e7d9;padding-top:24px;margin:24px 0}.foot{font-size:15px;margin-top:28px}.muted{font-size:16px}form{margin:0}
    </style>
</head>
<body>
<main>
    <a class="brand" href="{{ route('home') }}">
        <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M27 4C9 2 3 10 7 21c10 6 20-2 20-17ZM5 28 21 10M11 21v-7M17 15h6"/></svg>
        <span>{{ config('app.name') }}</span>
    </a>
    @yield('content')
</main>
</body>
</html>
