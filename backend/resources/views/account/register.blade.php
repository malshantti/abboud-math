@extends('layouts.site')
@section('title', 'إنشاء حساب')
@section('body')
<style>
.field input.bad{border-color:var(--red-d,#c0392b)!important;box-shadow:0 0 0 3px rgba(229,83,75,.15)}
.field .ferr{margin:6px 0 0;color:#a3261f;font-size:15px;font-weight:700}
.field .ferr:empty{display:none}
.pw{position:relative}
.pw input{padding-left:92px}
.pw .eye{position:absolute;left:6px;top:50%;transform:translateY(-50%);min-height:44px;min-width:44px;padding:6px 12px;border:0;border-radius:12px;background:transparent;color:var(--gd);font:inherit;font-weight:800;font-size:15px;cursor:pointer}
.pw .eye:focus-visible{outline:3px solid var(--g)}
.auth .links a{display:inline-flex;align-items:center;min-height:44px;padding:0 4px}
</style>
<main class="auth">
  <section class="card">
    <h1>أنشئ حسابك المجاني – {{ $ar::num(\App\Models\Setting::get('trial_days')) }} أيام بكل المواد</h1>
    @if ($open)
    <p class="lead">حساب واحد للعائلة، ثم أضف طلابك. لا يلزم أي دفع.</p>
    @if (session('status'))<p class="alert {{ request()->boolean('email') ? 'warn' : 'ok' }}" role="status">{{ session('status') }}</p>@endif
    @php($other = collect($errors->getMessages())->except(['name', 'email', 'password'])->flatten())
    @if ($other->isNotEmpty())<div class="alert err" role="alert"><ul>@foreach ($other as $e)<li>{{ $e }}</li>@endforeach</ul></div>@endif
    @include('partials.google-button')
    <form method="post" action="{{ route('account.register.store') }}" id="reg" novalidate>@csrf
      <input type="hidden" name="form_t" value="{{ \Illuminate\Support\Facades\Crypt::encryptString((string) time()) }}">
      <div class="hp" aria-hidden="true" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap;opacity:0;pointer-events:none"><label for="website">اترك هذا الحقل فارغًا</label><input id="website" name="website" type="text" tabindex="-1" autocomplete="off" value=""></div>
      <div class="field"><label for="name">الاسم</label><input id="name" name="name" value="{{ old('name') }}" required maxlength="80" autocomplete="name" @error('name') class="bad" aria-invalid="true" @enderror aria-describedby="name-err"><p class="ferr" id="name-err" role="alert">@error('name'){{ $message }}@enderror</p></div>
      <div class="field"><label for="email">البريد الإلكتروني</label><input id="email" name="email" type="email" dir="ltr" inputmode="email" value="{{ old('email') }}" required maxlength="255" autocomplete="email" @error('email') class="bad" aria-invalid="true" @enderror aria-describedby="email-err"><p class="ferr" id="email-err" role="alert">@error('email'){{ $message }}@enderror</p></div>
      <div class="field"><label for="password">كلمة المرور</label><div class="pw"><input id="password" name="password" type="password" dir="ltr" required minlength="8" maxlength="72" autocomplete="new-password" @error('password') class="bad" aria-invalid="true" @enderror aria-describedby="pw-hint password-err"><button type="button" class="eye" aria-controls="password" aria-pressed="false" aria-label="إظهار كلمة المرور">إظهار</button></div><p class="hint" id="pw-hint">٨ محارف على الأقل.</p><p class="ferr" id="password-err" role="alert">@error('password'){{ $message }}@enderror</p></div>
      <p class="hint">بإنشائك الحساب توافق على <a href="/terms.html">الشروط</a> و<a href="/privacy.html">سياسة الخصوصية</a>.</p>
      <button class="btn wide" type="submit">إنشاء الحساب</button>
    </form>
    <script>
    (function(){
      var f=document.getElementById('reg'),pw=document.getElementById('password'),eye=f.querySelector('.eye'),KEY='bk-reg-pw';
      var M={name:'أدخل الاسم.',email0:'أدخل البريد الإلكتروني.',email:'أدخل بريدًا إلكترونيًا صالحًا.',pw0:'أدخل كلمة المرور.',pw:'كلمة المرور يجب أن تتكون من ٨ محارف على الأقل.'};
      var RE=/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
      // إبقاء كلمة المرور بعد رفض الخادم (تُحفظ في الجلسة الحالية فقط ثم تُمسح فورًا)
      try{var kept=sessionStorage.getItem(KEY);sessionStorage.removeItem(KEY);if(kept&&f.querySelector('.ferr:not(:empty)'))pw.value=kept}catch(e){}
      function check(el){var v=el.value.trim(),m='';
        if(el.id==='name')m=v?'':M.name;
        else if(el.id==='email')m=!v?M.email0:(RE.test(v)?'':M.email);
        else if(el.id==='password')m=!el.value?M.pw0:(el.value.length<8?M.pw:'');
        set(el,m);return!m}
      function set(el,m){var e=document.getElementById(el.id+'-err');if(e)e.textContent=m;el.classList.toggle('bad',!!m);if(m)el.setAttribute('aria-invalid','true');else el.removeAttribute('aria-invalid')}
      ['name','email','password'].forEach(function(id){var el=document.getElementById(id);
        el.addEventListener('input',function(){if(el.classList.contains('bad')||(id!=='name'&&el.value))check(el)});
        el.addEventListener('blur',function(){if(el.value)check(el)})});
      eye.addEventListener('click',function(){var show=pw.type==='password';pw.type=show?'text':'password';eye.textContent=show?'إخفاء':'إظهار';eye.setAttribute('aria-pressed',show);eye.setAttribute('aria-label',show?'إخفاء كلمة المرور':'إظهار كلمة المرور')});
      function first(){var b=f.querySelector('input.bad');if(b){b.scrollIntoView({block:'center',behavior:'smooth'});b.focus({preventScroll:true})}}
      f.addEventListener('submit',function(ev){var ok=true;['name','email','password'].forEach(function(id){if(!check(document.getElementById(id)))ok=false});
        if(!ok){ev.preventDefault();first();return}
        try{sessionStorage.setItem(KEY,pw.value)}catch(e){}});
      if(f.querySelector('.ferr:not(:empty)'))first();
    })();
    </script>
    @if (request()->boolean('email'))<script>(function(){var n=document.getElementById('name');if(n){n.scrollIntoView({block:'center'});n.focus()}})();</script>@endif
    @else
    <p class="alert err">التسجيل مغلق حاليًا. يمكنك متابعة التعلّم على الجهاز دون حساب.</p>
    @endif
    <p class="links">لديك حساب؟ <a href="{{ route('account.login') }}">سجّل الدخول</a></p>
  </section>
  @include('partials.auth-side', ['say' => 'حساب واحد للعائلة، وتقدّم محفوظ على كل الأجهزة'])
</main>
@endsection
