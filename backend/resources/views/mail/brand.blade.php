<!doctype html>
<html lang="ar" dir="rtl" xmlns="http://www.w3.org/1999/xhtml">
<head><meta charset="utf-8">

<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<title>{{ $m['subject'] }}</title>
<style>
@media only screen and (max-width:480px){.wrap{padding:12px 8px!important}.card{padding:24px 18px!important}.h1{font-size:21px!important}.btn a{display:block!important}}
</style>
</head>
<body dir="rtl" style="margin:0;padding:0;background:#f4f1e4;-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">{{ \Illuminate\Support\Str::limit($m['paragraphs'][1] ?? $m['subject'], 110) }}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f1e4">
<tr><td class="wrap" align="center" style="padding:28px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px">
<tr><td align="center" style="padding:0 0 18px"><a href="{{ $m['site_url'] }}" style="text-decoration:none"><img src="{{ $m['logo'] }}" width="180" height="57" alt="{{ $m['site'] }}" style="display:block;width:180px;max-width:60%;height:auto;border:0"></a></td></tr>
<tr><td class="card" dir="rtl" style="background:#ffffff;border:2px solid #e2e7d0;border-radius:20px;padding:32px 30px;text-align:right;font-family:Tahoma,'Segoe UI',Arial,sans-serif;color:#24331c;font-size:16px;line-height:1.9">
<div style="height:6px;width:64px;background:#6f9e23;border-radius:6px;margin:0 0 18px"></div>
<h1 class="h1" style="margin:0 0 14px;font-size:23px;line-height:1.5;color:#3e5f0e;font-weight:bold">{{ $m['subject'] }}</h1>
@foreach ($m['paragraphs'] as $p)
<p style="margin:0 0 14px">{!! nl2br(e($p)) !!}</p>
@endforeach
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:22px 0 8px"><tr><td class="btn" align="center">
<a href="{{ $m['link'] }}" style="display:inline-block;background:#6f9e23;border-bottom:4px solid #507a12;color:#ffffff;text-decoration:none;font-weight:bold;font-size:18px;line-height:1.4;padding:14px 34px;border-radius:14px;font-family:Tahoma,Arial,sans-serif">{{ $m['button'] }}</a>
</td></tr>
@if ($m['whatsapp'])
<tr><td class="btn" align="center" style="padding-top:14px"><a href="{{ $m['whatsapp'] }}" style="display:inline-block;background:#ffffff;border:2px solid #cfe3a8;color:#507a12;text-decoration:none;font-weight:bold;font-size:16px;line-height:1.4;padding:11px 26px;border-radius:14px;font-family:Tahoma,Arial,sans-serif">تواصل عبر واتساب <span dir="ltr">{{ $m['whatsapp_label'] }}</span></a></td></tr>
@endif
</table>
<p style="margin:18px 0 0;padding:12px 14px;background:#f6f9ee;border-radius:12px;color:#5f6b57;font-size:14px;line-height:1.8">{{ $m['note'] }}</p>
@if ($m['show_link'] ?? $m['type'] !== 'welcome')
<p dir="ltr" style="margin:10px 0 0;font-size:12px;line-height:1.6;color:#7a8670;word-break:break-all;text-align:left"><a href="{{ $m['link'] }}" style="color:#507a12">{{ $m['link'] }}</a></p>
@endif
</td></tr>
<tr><td align="center" dir="rtl" style="padding:18px 10px 0;font-family:Tahoma,Arial,sans-serif;color:#7a8670;font-size:13px;line-height:1.8">
{{ $m['site'] }} — <a href="{{ $m['site_url'] }}" style="color:#507a12;text-decoration:none">bustankids.com</a><br>
وصلتك هذه الرسالة لأن بريدك مسجّل في حساب لدينا.
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>
