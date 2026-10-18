@extends('layouts.admin')
@section('title', 'لا توجد صلاحية')
@section('content')
    <h1>لا توجد صلاحية للدخول</h1>
    <p>هذا الحساب غير مصرّح له باستخدام مساحة الإدارة.</p>
    @auth
        <form class="scope" method="post" action="{{ route('logout') }}">@csrf<button type="submit">تسجيل الخروج</button></form>
    @else
        <p class="foot"><a href="{{ route('login') }}">العودة إلى الدخول</a></p>
    @endauth
@endsection
