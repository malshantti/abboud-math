@extends('layouts.site')
@section('title', 'إنشاء حساب')
@section('body')
<main class="auth">
  <div class="mascot"><img src="{{ route('brand.asset',['asset'=>'img/av-encourage.webp']) }}" alt="" width="220" height="220"><p>حساب واحد للعائلة، وتقدّم محفوظ على كل الأجهزة</p></div>
  <section class="card">
    <h1>إنشاء حساب ولي الأمر</h1>
    @if ($open)
    <p class="hint">يبدأ حسابك بفترة تجريبية مجانية مدتها {{ $ar::num(\App\Models\Setting::get('trial_days')) }} أيام بكل المواد.</p>
    @include('partials.flash')
    <form method="post" action="{{ route('account.register.store') }}">@csrf
      <div class="field"><label for="name">الاسم</label><input id="name" name="name" value="{{ old('name') }}" required maxlength="80" autocomplete="name"></div>
      <div class="field"><label for="email">البريد الإلكتروني</label><input id="email" name="email" type="email" dir="ltr" value="{{ old('email') }}" required maxlength="255" autocomplete="email"></div>
      <div class="field"><label for="password">كلمة المرور</label><input id="password" name="password" type="password" dir="ltr" required minlength="8" maxlength="72" autocomplete="new-password"><p class="hint">٨ محارف على الأقل.</p></div>
      <div class="field"><label for="password_confirmation">أعد كلمة المرور</label><input id="password_confirmation" name="password_confirmation" type="password" dir="ltr" required autocomplete="new-password"></div>
      <button class="btn wide" type="submit">إنشاء الحساب</button>
    </form>
    @else
    <p class="alert err">التسجيل مغلق حاليًا. يمكنك متابعة التعلّم على الجهاز دون حساب.</p>
    @endif
    <p>لديك حساب؟ <a href="{{ route('account.login') }}">سجّل الدخول</a></p>
  </section>
</main>
@endsection
