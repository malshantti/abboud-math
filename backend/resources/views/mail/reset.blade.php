<!doctype html>
<html lang="ar" dir="rtl"><head><meta charset="utf-8"></head>
<body style="margin:0;background:#fbf8ef;font-family:Tahoma,Arial,sans-serif;color:#29392b;direction:rtl;text-align:right">
<div style="max-width:560px;margin:24px auto;background:#fff;border:2px solid #e2e7d9;border-radius:18px;padding:28px;line-height:1.9">
<h1 style="color:#3e5729;font-size:22px;margin:0 0 12px">{{ \App\Models\Setting::get('site_name') }}</h1>
<p>مرحبًا {{ $name }}،</p>
<p>وصلنا طلب لإعادة تعيين كلمة المرور لحسابك. اضغط الزر لاختيار كلمة مرور جديدة:</p>
<p style="text-align:center;margin:24px 0"><a href="{{ $url }}" style="display:inline-block;background:#647b43;color:#fff;text-decoration:none;font-weight:bold;padding:12px 28px;border-radius:14px">تعيين كلمة مرور جديدة</a></p>
<p>ينتهي الرابط بعد {{ \App\Support\Ar::num($minutes) }} دقيقة. إن لم تطلب ذلك فتجاهل هذه الرسالة؛ لن يتغيّر شيء.</p>
<p style="font-size:13px;color:#5d6b59;direction:ltr;text-align:left;word-break:break-all">{{ $url }}</p>
</div></body></html>
