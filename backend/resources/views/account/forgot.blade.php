@extends('layouts.site')
@section('title', 'استعادة كلمة المرور')
@section('body')
<main class="auth">
  <section class="card">
    <h1>استعادة كلمة المرور</h1>
    <p class="lead">اكتب بريدك المسجّل، وسنرسل إليه رابطًا لتعيين كلمة مرور جديدة.</p>
    @include('partials.flash')
    <form method="post" action="{{ route('account.password.email') }}">@csrf
      <div class="field"><label for="email">البريد الإلكتروني</label><input id="email" name="email" type="email" dir="ltr" value="{{ old('email') }}" required maxlength="255" autocomplete="email"></div>
      <button class="btn wide" type="submit">أرسل الرابط</button>
    </form>
    <p class="links"><a href="{{ route('account.login') }}">العودة إلى الدخول</a></p>
  </section>
  @include('partials.auth-side', ['say' => 'لا بأس، سنرسل لك رابطًا جديدًا'])
</main>
@endsection
