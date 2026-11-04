<!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>الصفحة غير موجودة — بستان التعلّم</title>
<style>body{margin:0;min-height:100vh;display:grid;place-items:center;background:#fbf8ef;color:#29392b;font:17px/1.8 Cairo,Tahoma,sans-serif;padding:20px}main{max-width:460px;background:#fff;border:2px solid #e2e7d9;border-radius:22px;padding:24px;text-align:center}h1{font-size:24px;margin:0 0 8px}a{display:inline-flex;align-items:center;min-height:44px;margin:6px 4px 0;padding:0 18px;border-radius:14px;font-weight:800;text-decoration:none;background:#2f8f46;color:#fff}a.g{background:#eef3e6;color:#29392b}</style></head>
<body><main><h1>{{ request()->is('s/*') ? 'المدرسة غير موجودة' : 'الصفحة غير موجودة' }}</h1>
<p>{{ request()->is('s/*') ? 'تأكّد من رابط المدرسة أو رمزها كما وصلك من المعلّم.' : 'ربما تغيّر الرابط أو كُتب بشكل غير صحيح.' }}</p>
<a href="/">الصفحة الرئيسية</a><a class="g" href="/admin-api/login">تسجيل الدخول</a></main></body></html>
