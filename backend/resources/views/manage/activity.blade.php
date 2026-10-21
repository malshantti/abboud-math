@extends('layouts.manage')
@section('title', 'سجل النشاط')
@section('content')
<div class="head"><h1>سجل النشاط</h1></div>
<form class="filters" method="get"><div><label for="action">النوع</label><select id="action" name="action"><option value="">الكل</option>@foreach (\App\Models\ActivityLog::LABELS as $k => $v)<option value="{{ $k }}" @selected(request('action')===$k)>{{ $v }}</option>@endforeach</select></div><div class="go"><button class="btn small" type="submit">@include('partials.admin-icon',['name'=>'search'])تصفية</button></div></form>
<div class="table-wrap"><table>
<thead><tr><th>الوقت</th><th>المستخدم</th><th>الإجراء</th><th>الموضوع</th><th>تفاصيل</th><th>IP</th></tr></thead><tbody>
@forelse ($logs as $l)
<tr><td style="white-space:nowrap">{{ $ar::date($l->created_at) }}</td><td>{{ $l->user?->name ?? '—' }}</td><td><span class="chip grey">{{ $l->label() }}</span></td><td>{{ $l->subject }}</td><td>{{ $l->details }}</td><td dir="ltr"><small>{{ $l->ip }}</small></td></tr>
@empty<tr><td colspan="6" class="empty">لا نشاط بعد.</td></tr>@endforelse
</tbody></table></div>
@include('partials.pager', ['p' => $logs])
@endsection
