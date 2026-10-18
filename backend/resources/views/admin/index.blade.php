@extends('layouts.admin')
@section('title', 'مساحة الإدارة')
@section('content')
    <h1>مرحبًا، {{ auth()->user()->name }}</h1>
    <p>أنت داخل مساحة الإدارة الخاصة.</p>
    <div class="account">
        <strong>حساب المشرف</strong>
        <bdi dir="ltr">{{ auth()->user()->email }}</bdi>
        <span class="muted">الصلاحية: مشرف</span>
    </div>
    <section class="scope" aria-labelledby="connection-heading">
        <h2 id="connection-heading">الخطوة التالية</h2>
        <p>متابعة الطلاب وحفظ المحتوى ونشره لم تُربط بعد. ستظهر بياناتك هنا عند اكتمال الربط.</p>
    </section>
    <form method="post" action="{{ route('logout') }}">
        @csrf
        <button type="submit">تسجيل الخروج</button>
    </form>
@endsection
