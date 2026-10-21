@extends('layouts.manage')
@section('title', 'الاشتراكات')
@section('content')
<div class="head"><h1>الاشتراكات وطلبات الدفع</h1><a class="btn ghost small" href="{{ route('manage.export','subscriptions') }}">تصدير CSV</a></div>
<p class="hint">الدفع يدوي عبر واتساب. بعد استلام المبلغ، ابحث برمز الطلب الوارد في رسالة واتساب ثم اضغط «تفعيل».</p>
<form class="filters" method="get">
  <div><label for="q">بحث</label><input id="q" name="q" value="{{ request('q') }}" placeholder="رمز الطلب أو البريد"></div>
  <div><label for="status">الحالة</label><select id="status" name="status"><option value="">الكل</option>@foreach (\App\Models\Subscription::STATUS as $k => $v)@if($k!=='expired')<option value="{{ $k }}" @selected(request('status')===$k)>{{ $v }}</option>@endif @endforeach</select></div>
  <div style="flex:0 0 auto"><button class="btn small" type="submit">تصفية</button></div>
</form>
<form method="post" action="{{ route('manage.subscriptions.bulk') }}" id="bulk" class="row" style="margin-bottom:10px" onsubmit="return confirm('تنفيذ الإجراء على الطلبات المحددة؟')">@csrf<select name="action" aria-label="إجراء جماعي" style="max-width:240px"><option value="activate">تفعيل المحدد (بعد استلام الدفع)</option><option value="cancel">إلغاء المحدد</option></select><button class="btn small" type="submit">تنفيذ</button></form>
<div class="table-wrap"><table>
<thead><tr><th><span class="sr">تحديد</span></th><th>الرمز</th><th>ولي الأمر</th><th>الطالب</th><th>المادة</th><th>السعر</th><th>الحالة</th><th>الفترة</th><th></th></tr></thead><tbody>
@forelse ($subs as $s)
<tr><td><input type="checkbox" form="bulk" name="ids[]" value="{{ $s->id }}" aria-label="تحديد {{ $s->code }}" style="width:22px;min-height:22px"></td><td dir="ltr"><b>{{ $s->code }}</b></td><td><a href="{{ route('manage.user', $s->user_id) }}">{{ $s->user?->name }}</a><br><small dir="ltr">{{ $s->user?->email }}</small></td><td>{{ $s->student?->name ?? 'كل الطلاب' }}</td><td>{{ $s->plan_name }}</td><td>{{ $ar::num($s->price) }} {{ $s->currency }}</td>
<td><span class="chip {{ $s->status==='pending' ? 'warn' : ($s->status==='active' ? '' : 'grey') }}">{{ $s->statusLabel() }}</span></td>
<td>{{ $ar::date($s->starts_at, false) }} ← {{ $ar::date($s->ends_at, false) }}</td>
<td>@if ($s->status === 'pending')
  <form method="post" action="{{ route('manage.subscription.activate', $s) }}" class="row" onsubmit="return confirm('تأكيد استلام الدفع وتفعيل {{ $s->code }}؟')">@csrf<input name="days" type="number" min="1" max="1000" value="{{ $s->days }}" aria-label="الأيام" style="width:90px"><button class="btn small" type="submit">تفعيل</button></form>
  <form method="post" action="{{ route('manage.subscription.cancel', $s) }}" onsubmit="return confirm('إلغاء الطلب؟')" style="margin-top:6px">@csrf<button class="btn ghost small" type="submit">إلغاء</button></form>
@elseif ($s->status === 'active')
  <form method="post" action="{{ route('manage.subscription.cancel', $s) }}" onsubmit="return confirm('إيقاف هذا الاشتراك؟')">@csrf<button class="btn ghost small" type="submit">إيقاف</button></form>
@endif</td></tr>
@empty<tr><td colspan="9">لا طلبات.</td></tr>@endforelse
</tbody></table></div>
@include('partials.pager', ['p' => $subs])
@endsection
