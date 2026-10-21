@extends('layouts.manage')
@section('title', 'الاشتراكات')
@section('content')
<div class="head"><h1>الاشتراكات وطلبات الدفع</h1><a class="btn ghost small" href="{{ route('manage.export','subscriptions') }}">@include('partials.admin-icon',['name'=>'download'])تصدير CSV</a></div>
<p class="lead">الدفع يدوي عبر واتساب. بعد استلام المبلغ، ابحث برمز الطلب الوارد في رسالة واتساب ثم اضغط «تفعيل».</p>
<form class="filters" method="get">
  <div><label for="q">بحث</label><input id="q" name="q" value="{{ request('q') }}" placeholder="رمز الطلب أو المجموعة أو البريد"></div>
  <div><label for="status">الحالة</label><select id="status" name="status"><option value="">الكل</option>@foreach (\App\Models\Subscription::STATUS as $k => $v)@if($k!=='expired')<option value="{{ $k }}" @selected(request('status')===$k)>{{ $v }}</option>@endif @endforeach</select></div>
  <div class="go"><button class="btn small" type="submit">@include('partials.admin-icon',['name'=>'search'])تصفية</button></div>
</form>
<form method="post" action="{{ route('manage.subscriptions.bulk') }}" id="bulk" class="bulk" onsubmit="return confirm('تنفيذ الإجراء على الطلبات المحددة؟')">@csrf<span>للمحدد:</span><select name="action" aria-label="إجراء جماعي" style="max-width:240px"><option value="activate">تفعيل المحدد (بعد استلام الدفع)</option><option value="cancel">إلغاء المحدد</option></select><button class="btn small" type="submit">تنفيذ</button></form>
<div class="table-wrap stack"><table>
<thead><tr><th><span class="sr">تحديد</span></th><th>الرمز</th><th>ولي الأمر</th><th>الطالب</th><th>المادة</th><th>السعر</th><th>الحالة</th><th>الفترة</th><th></th></tr></thead><tbody>
@forelse ($subs as $s)
<tr><td class="sel"><input type="checkbox" form="bulk" name="ids[]" value="{{ $s->id }}" aria-label="تحديد {{ $s->code }}" style="width:22px;min-height:22px"></td><td data-label="الرمز" dir="ltr"><span class="mono">{{ $s->code }}</span>@if ($s->batch)<small class="batch">ضمن الطلب <a class="mono" href="{{ route('manage.subscriptions', ['q' => $s->batch]) }}">{{ $s->batch }}</a></small>@endif</td><td data-label="وليّ الأمر"><a href="{{ route('manage.user', $s->user_id) }}">{{ $s->user?->name }}</a><br><small dir="ltr">{{ $s->user?->email }}</small></td><td data-label="الطالب">{{ $s->student?->name ?? 'كل الطلاب' }}</td><td data-label="المادة">{{ $s->plan_name }}</td><td data-label="السعر" style="white-space:nowrap"><b>{{ $ar::num($s->price) }}</b> {{ $s->currency }}</td>
<td data-label="الحالة"><span class="chip {{ $s->status==='pending' ? 'warn' : ($s->status==='active' ? '' : ($s->status==='cancelled' ? 'bad' : 'grey')) }}">{{ $s->statusLabel() }}</span></td>
<td data-label="الفترة" style="white-space:nowrap">{{ $ar::when($s->starts_at, false) }} ← {{ $ar::when($s->ends_at, false) }}</td>
<td class="actions">@if ($s->status === 'pending')
  <form method="post" action="{{ route('manage.subscription.activate', $s) }}" class="row" onsubmit="return confirm('تأكيد استلام الدفع وتفعيل {{ $s->code }}؟')">@csrf<input name="days" type="number" min="1" max="1000" value="{{ $s->days }}" aria-label="الأيام" style="width:90px"><button class="btn small" type="submit">تفعيل</button></form>
  <form method="post" action="{{ route('manage.subscription.cancel', $s) }}" onsubmit="return confirm('إلغاء الطلب؟')" style="margin-top:6px">@csrf<button class="btn ghost small" type="submit">إلغاء</button></form>
@elseif ($s->status === 'active')
  <form method="post" action="{{ route('manage.subscription.cancel', $s) }}" onsubmit="return confirm('إيقاف هذا الاشتراك؟')">@csrf<button class="btn ghost small" type="submit">إيقاف</button></form>
@endif</td></tr>
@empty<tr><td colspan="9" class="empty">لا طلبات.</td></tr>@endforelse
</tbody></table></div>
@include('partials.pager', ['p' => $subs])
@endsection
