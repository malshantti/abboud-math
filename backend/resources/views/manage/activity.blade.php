@extends('layouts.manage')
@section('title', 'سجل النشاط')
@section('content')
<div class="head"><h1>سجلّ النشاط</h1></div>
<form class="filters" method="get"><div><label for="action">النوع</label><select id="action" name="action"><option value="">الكل</option>@foreach (\App\Models\ActivityLog::LABELS as $k => $v)<option value="{{ $k }}" @selected(request('action')===$k)>{{ $v }}</option>@endforeach</select></div><div class="go"><button class="btn small" type="submit">@include('partials.admin-icon',['name'=>'search'])تصفية</button></div></form>
<section class="card">@include('manage.partials.activity-list', ['entries' => $entries, 'showIp' => true])</section>
@include('partials.pager', ['p' => $logs])
@endsection
