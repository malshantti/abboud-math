@extends('layouts.site')
@section('title', 'تسجيل الدخول')
@section('body')
<main class="auth">
  <div class="mascot"><img src="{{ route('brand.asset',['asset'=>'img/av-read.webp']) }}" alt="" width="220" height="220"><p>أهلًا بعودتك إلى البستان</p></div>
  <section class="card">
    <h1>تسجيل الدخول</h1>
    @include('partials.flash')
    <form method="post" action="{{ route('account.login.store') }}">@csrf
      <div class="field"><label for="email">البريد الإلكتروني</label><input id="email" name="email" type="email" dir="ltr" value="{{ old('email') }}" required maxlength="255" autocomplete="username" autofocus></div>
      <div class="field"><label for="password">كلمة المرور</label><input id="password" name="password" type="password" dir="ltr" required maxlength="1024" autocomplete="current-password"></div>
      <div class="field"><label class="row" style="font-weight:500"><input type="checkbox" name="remember" value="1" style="width:22px;min-height:22px"> تذكّرني على هذا الجهاز</label></div>
      <button class="btn wide" type="submit">دخول</button>
    </form>
    <p><a href="{{ route('account.password.request') }}">نسيت كلمة المرور؟</a></p>
    @if (\App\Models\Setting::flag('registration_open'))<p>ليس لديك حساب؟ <a href="{{ route('account.register') }}">أنشئ حسابًا</a></p>@endif
  </section>
</main>
@endsection
