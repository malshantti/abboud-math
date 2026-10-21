@extends('layouts.manage')
@section('title', 'الطلاب')
@section('content')
<div class="head"><h1>الطلاب والتقدّم</h1>@can('manage-site')<a class="btn ghost small" href="{{ route('manage.export','students') }}">تصدير CSV</a>@endcan</div>
<form class="filters" method="get">
  <div><label for="q">بحث</label><input id="q" name="q" value="{{ request('q') }}" placeholder="اسم الطالب أو ولي الأمر أو البريد"></div>
  <div><label for="grade">الصف</label><select id="grade" name="grade"><option value="">كل الصفوف</option>@foreach ($ar::GRADES as $g => $l)<option value="{{ $g }}" @selected((int) request('grade') === $g)>{{ $l }}</option>@endforeach</select></div>
  <div style="flex:0 0 auto"><button class="btn small" type="submit">تصفية</button></div>
</form>
<div class="table-wrap"><table>
<thead><tr><th>الطالب</th><th>الصف</th><th>ولي الأمر</th><th>مواد فيها تقدّم</th><th>آخر مزامنة</th><th></th></tr></thead><tbody>
@forelse ($students as $s)
<tr><td>{{ $s->name }}</td><td>{{ $ar::grade($s->grade) }}</td><td>{{ $s->user?->name }}<br><small dir="ltr">{{ $s->user?->email }}</small></td><td>{{ $ar::num($s->progress_count) }}</td><td>{{ $ar::date($s->last_synced_at) }}</td><td><a class="btn ghost small" href="{{ route('manage.student', $s) }}">التقدّم</a></td></tr>
@empty<tr><td colspan="6">لا نتائج.</td></tr>@endforelse
</tbody></table></div>
@include('partials.pager', ['p' => $students])
@endsection
