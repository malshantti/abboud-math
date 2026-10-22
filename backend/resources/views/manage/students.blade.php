@extends('layouts.manage')
@section('title', 'الطلاب')
@section('content')
<div class="head"><h1>الطلاب والتقدّم</h1>@can('manage-site')<a class="btn ghost small" href="{{ route('manage.export','students') }}">@include('partials.admin-icon',['name'=>'download'])تصدير CSV</a>@endcan</div>
<form class="filters" method="get">
  <div><label for="q">بحث</label><input id="q" name="q" value="{{ request('q') }}" placeholder="اسم الطالب أو ولي الأمر أو البريد"></div>
  <div><label for="grade">الصف</label><select id="grade" name="grade"><option value="">كل الصفوف</option>@foreach (\App\Models\Setting::gradeOptions() as $g => $l)<option value="{{ $g }}" @selected((int) request('grade') === $g)>{{ $l }}</option>@endforeach</select></div>
  <div><label for="owner">الحساب</label><select id="owner" name="owner"><option value="">الكل</option><option value="parents" @selected(request('owner')==='parents')>طلاب أولياء الأمور</option><option value="review" @selected(request('owner')==='review')>بحاجة إلى مراجعة</option></select></div>
  <div class="go"><button class="btn small" type="submit">@include('partials.admin-icon',['name'=>'search'])تصفية</button></div>
</form>
<div class="table-wrap stack"><table>
<thead><tr><th>الطالب</th><th>الصف</th><th>ولي الأمر</th><th>مواد فيها تقدّم</th><th>آخر مزامنة</th><th></th></tr></thead><tbody>
@forelse ($students as $s)
<tr><td data-label="الطالب"><b>{{ $s->name }}</b></td><td data-label="الصف"><span class="chip grey">{{ $ar::grade($s->grade) }}</span></td><td data-label="وليّ الأمر">{{ $s->user?->name }}<br><small dir="ltr">{{ $s->user?->email }}</small></td><td data-label="مواد فيها تقدّم">{{ $ar::html($s->progress_count) }}</td><td data-label="آخر مزامنة">{{ $ar::when($s->last_synced_at) }}</td><td class="actions"><a class="btn ghost small" href="{{ route('manage.student', $s) }}">التقدّم</a></td></tr>
@empty<tr><td colspan="6" class="empty">لا نتائج.</td></tr>@endforelse
</tbody></table></div>
@include('partials.pager', ['p' => $students])
@endsection
