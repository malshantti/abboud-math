@extends('layouts.manage')
@section('title', 'المستخدمون')
@section('content')
<div class="head"><h1>المستخدمون</h1><a class="btn ghost small" href="{{ route('manage.export','users') }}">@include('partials.admin-icon',['name'=>'download'])تصدير CSV</a></div>
<form class="filters" method="get">
  <div><label for="q">بحث</label><input id="q" name="q" value="{{ request('q') }}" placeholder="الاسم أو البريد"></div>
  <div><label for="role">الدور</label><select id="role" name="role"><option value="">الكل</option>@foreach (\App\Models\User::ROLES as $k => $v)<option value="{{ $k }}" @selected(request('role')===$k)>{{ $v }}</option>@endforeach</select></div>
  <div><label for="status">الحالة</label><select id="status" name="status"><option value="">الكل</option><option value="active" @selected(request('status')==='active')>فعّال</option><option value="disabled" @selected(request('status')==='disabled')>معطّل</option><option value="unverified" @selected(request('status')==='unverified')>بريد غير مفعّل</option></select></div>
  <div class="go"><button class="btn small" type="submit">@include('partials.admin-icon',['name'=>'search'])تصفية</button></div>
</form>
<form method="post" action="{{ route('manage.users.bulk') }}" id="bulk" onsubmit="return confirm('تنفيذ الإجراء على الحسابات المحددة؟')">@csrf
<div class="bulk"><span aria-hidden="true">للمحدد:</span><label for="action" class="sr">إجراء جماعي</label><select id="action" name="action" style="max-width:220px"><option value="disable">تعطيل المحدد</option><option value="enable">تفعيل المحدد</option><option value="trial">تجربة جديدة (أيام)</option><option value="delete">حذف المحدد</option></select>
<input name="days" type="number" min="0" max="365" value="3" aria-label="الأيام" style="max-width:90px"><label class="check" style="margin:0"><input type="checkbox" name="confirm" value="1" style="width:22px;min-height:22px"> تأكيد الحذف</label><button class="btn small" type="submit">تنفيذ</button></div>
</form>
<div class="table-wrap stack"><table>
<thead><tr><th><input type="checkbox" aria-label="تحديد الكل" onclick="document.querySelectorAll('[form=bulk][name^=ids]').forEach(c=>c.checked=this.checked)" style="width:22px;min-height:22px"></th><th>الاسم</th><th>البريد</th><th>الدور</th><th>الطلاب</th><th>الحالة</th><th>آخر دخول</th><th></th></tr></thead><tbody>
@forelse ($users as $u)
<tr><td class="sel"><input type="checkbox" form="bulk" name="ids[]" value="{{ $u->id }}" aria-label="تحديد {{ $u->name }}" style="width:22px;min-height:22px"></td><td data-label="الاسم"><b>{{ $u->name }}</b></td><td data-label="البريد" dir="ltr" style="text-align:right">{{ $u->email }}@unless($u->email_verified_at) <span class="chip warn" dir="rtl" style="font-size:12px;padding:0 8px">غير مفعّل</span>@endunless</td><td data-label="الدور"><span class="chip {{ $u->isAdminRole() || $u->role==='teacher' ? '' : 'grey' }}">{{ \App\Models\User::ROLES[$u->isAdminRole() ? 'admin' : $u->role] ?? $u->role }}</span></td><td data-label="الطلاب">{{ $ar::html($u->students_count) }}</td>
<td data-label="الحالة">@if($u->disabled_at)<span class="chip bad">معطّل</span>@else<span class="chip">فعّال</span>@endif</td><td data-label="آخر دخول">{{ $ar::when($u->last_login_at) }}</td><td class="actions"><a class="btn ghost small" href="{{ route('manage.user', $u) }}">إدارة</a></td></tr>
@empty<tr><td colspan="8" class="empty">لا نتائج.</td></tr>@endforelse
</tbody></table></div>
@include('partials.pager', ['p' => $users])
@endsection
