@extends('layouts.site')
@section('title', 'كلمة مرور جديدة')
@section('body')
<main class="auth">
  <div class="mascot"><img src="{{ route('brand.asset',['asset'=>'img/av-encourage.webp']) }}" alt="" width="220" height="220"><p>اختر كلمة مرور تتذكرها</p></div>
  <section class="card">
    <h1>كلمة مرور جديدة</h1>
    @include('partials.flash')
    <form method="post" action="{{ route('account.password.update') }}">@csrf
      <input type="hidden" name="token" value="{{ $token }}">
      <div class="field"><label for="email">البريد الإلكتروني</label><input id="email" name="email" type="email" dir="ltr" value="{{ old('email', $email) }}" required autocomplete="username"></div>
      <div class="field"><label for="password">كلمة المرور الجديدة</label><input id="password" name="password" type="password" dir="ltr" required minlength="8" maxlength="72" autocomplete="new-password"></div>
      <div class="field"><label for="password_confirmation">أعد كلمة المرور</label><input id="password_confirmation" name="password_confirmation" type="password" dir="ltr" required autocomplete="new-password"></div>
      <button class="btn wide" type="submit">حفظ كلمة المرور</button>
    </form>
  </section>
</main>
@endsection
