@extends('layouts.site')
@section('title', 'تسجيل الدخول')
@section('body')
<main class="auth">
  <section class="card">
    <h1>تسجيل الدخول</h1>
    <p class="lead">تابع تعلّم أبنائك من حيث توقفوا.</p>
    @include('partials.flash')
    {{-- جهاز أُغلقت جلسته لأن الحساب فُتح على جهاز آخر (أول طلب كان من الموقع فلم تظهر الرسالة): نوضّح السبب مرة واحدة --}}
    @if (! $errors->any() && \App\Support\Devices::revokedGuest(request()))<p class="alert err" role="alert">{{ \App\Support\Devices::MESSAGE }} سجّل الدخول من جديد لتتابع هنا.</p>@endif
    @include('partials.google-button')
    <form method="post" action="{{ route('account.login.store') }}">@csrf
      <div class="field"><label for="email">البريد الإلكتروني</label><input id="email" name="email" type="email" dir="ltr" value="{{ old('email') }}" required maxlength="255" autocomplete="username" autofocus></div>
      <div class="field"><label for="password">كلمة المرور</label><input id="password" name="password" type="password" dir="ltr" required maxlength="1024" autocomplete="current-password"></div>
      <button class="btn wide" type="submit">دخول</button>
    </form>
    <div class="links"><p style="margin:0"><a href="{{ route('account.password.request') }}">نسيت كلمة المرور؟</a></p>
    @if (\App\Models\Setting::flag('registration_open'))<p style="margin:0">ليس لديك حساب؟ <a href="{{ route('account.register') }}">أنشئ حسابًا مجانيًا</a></p>@endif</div>
  </section>
  @include('partials.auth-side', ['say' => 'أهلًا بعودتك إلى البستان'])
</main>
@endsection
