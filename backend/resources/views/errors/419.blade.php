@extends('layouts.admin')
@section('title', 'انتهت الجلسة')
@section('content')
    <h1>انتهت الجلسة</h1>
    <p>أعد فتح صفحة الدخول ثم حاول مجددًا.</p>
    <p class="foot"><a class="button" href="{{ route('login') }}">العودة إلى الدخول</a></p>
@endsection
