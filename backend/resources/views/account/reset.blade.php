@extends('layouts.site')
@section('title', 'كلمة مرور جديدة')
@section('body')
<main class="auth">
  <section class="card">
    <h1>كلمة مرور جديدة</h1>
    <p class="lead">٨ محارف على الأقل، ويُستحسن أن تمزج بين الحروف والأرقام.</p>
    @include('partials.flash')
    <form method="post" action="{{ route('account.password.update') }}">@csrf
      <input type="hidden" name="token" value="{{ $token }}">
      <div class="field"><label for="email">البريد الإلكتروني</label><input id="email" name="email" type="email" dir="ltr" value="{{ old('email', $email) }}" required autocomplete="username"></div>
      <div class="field"><label for="password">كلمة المرور الجديدة</label><input id="password" name="password" type="password" dir="ltr" required minlength="8" maxlength="72" autocomplete="new-password"></div>
      <div class="field"><label for="password_confirmation">أعد كلمة المرور</label><input id="password_confirmation" name="password_confirmation" type="password" dir="ltr" required autocomplete="new-password"></div>
      <button class="btn wide" type="submit">حفظ كلمة المرور</button>
    </form>
  </section>
  @include('partials.auth-side', ['say' => 'اختر كلمة مرور تتذكرها'])
</main>
@endsection
