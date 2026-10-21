@extends('layouts.admin')
@section('title', 'دخول المشرفين')
@section('content')
    <h1>دخول المشرفين</h1>
    <p>سجّل الدخول إلى مساحة الإدارة بحسابك المصرّح له.</p>
    @if (session('status'))
        <p class="status" role="status">{{ session('status') }}</p>
    @endif
    @if ($errors->any())
        <div class="error" role="alert"><ul>@foreach ($errors->all() as $error)<li>{{ $error }}</li>@endforeach</ul></div>
    @endif
    <form method="post" action="{{ route('login.store') }}">
        @csrf
        <div class="field">
            <label for="email">البريد الإلكتروني</label>
            <input id="email" name="email" type="email" dir="ltr" value="{{ old('email') }}" autocomplete="username" required maxlength="255" autofocus @if($errors->has('email')) aria-invalid="true" @endif>
        </div>
        <div class="field">
            <label for="password">كلمة المرور</label>
            <input id="password" name="password" type="password" dir="ltr" autocomplete="current-password" required maxlength="1024" @if($errors->has('password')) aria-invalid="true" @endif>
        </div>
        <button class="primary" type="submit">تسجيل الدخول</button>
    </form>
    <p class="foot"><a class="back-link" href="{{ route('home') }}">العودة إلى البداية</a></p>
@endsection
