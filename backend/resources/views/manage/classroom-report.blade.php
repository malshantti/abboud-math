@extends('layouts.manage')
@section('title', 'تقرير '.$c->name)
@section('content')
@php($R = \App\Support\Report::class)
<div class="head"><h1>تقرير الصف: {{ $c->name }}</h1><a class="btn ghost small" href="{{ route('manage.class', $c) }}">@include('partials.admin-icon',['name'=>'back'])الصف</a></div>
<p class="lead">ملخّص تقدّم طلاب الصف من بيانات المزامنة. اضغط اسم الطالب لتقريره المفصّل.</p>
@if ($subjects)
<h2>حسب المادة</h2>
<div class="table-wrap stack"><table>
<thead><tr><th>المادة</th><th>طلاب</th><th>دروس منجزة</th><th>إجابات</th><th>نسبة الصواب</th><th>وقت التعلّم</th></tr></thead><tbody>
@foreach ($subjects as $s)
<tr><td data-label="المادة"><b>{{ $s['name'] }}</b></td><td data-label="طلاب">{{ $ar::num($s['students']) }}</td><td data-label="دروس منجزة">{{ $ar::num($s['done']) }}</td><td data-label="إجابات">{{ $ar::num($s['answered']) }}</td><td data-label="نسبة الصواب">{{ $s['answered'] ? $ar::num((int) round(100 * $s['correct'] / $s['answered'])).'٪' : '—' }}</td><td data-label="وقت التعلّم">{{ $R::duration($s['ms']) }}</td></tr>
@endforeach
</tbody></table></div>
@endif
<h2>الطلاب</h2>
<div class="table-wrap stack"><table>
<thead><tr><th>الطالب</th><th>دروس منجزة</th><th>إجابات</th><th>نسبة الصواب</th><th>وقت التعلّم</th><th>آخر مزامنة</th></tr></thead><tbody>
@forelse ($rows as $row)
@php($r = $row['r'])
<tr><td data-label="الطالب"><a href="{{ route('manage.student.report', $row['student']) }}"><b>{{ $row['student']->name }}</b></a></td><td data-label="دروس منجزة">{{ $ar::num($r['done']) }}</td><td data-label="إجابات">{{ $ar::num($r['answered']) }}</td>
<td data-label="نسبة الصواب">@if($r['pct'] !== null)<span class="chip {{ $r['pct'] < 50 ? 'bad' : '' }}">{{ $ar::num($r['pct']) }}٪</span>@else — @endif</td><td data-label="وقت التعلّم">{{ $R::duration($r['total_ms']) }}</td><td data-label="آخر مزامنة">{{ $ar::when($row['student']->last_synced_at) }}</td></tr>
@empty<tr><td colspan="6" class="empty">لا طلاب في هذا الصف بعد.</td></tr>@endforelse
</tbody></table></div>
@endsection
