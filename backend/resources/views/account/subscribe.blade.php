@extends('layouts.site')
@section('title', 'الاشتراك')
@section('body')
<main class="wrap grid">
  @include('partials.flash')
  <section class="card">
    <h1 style="margin-top:0">الاشتراك في مادة</h1>
    @if ($access['kind'] === 'trial')<p><span class="chip warn">فترة تجريبية</span> كل المواد متاحة حتى {{ $ar::date($access['ends_at']) }}. يمكنك الاشتراك الآن ليستمر الوصول بعدها.</p>
    @elseif ($access['kind'] === 'expired')<p><span class="chip bad">انتهت الفترة التجريبية</span> الدروس المقفلة تحتاج اشتراكًا في المادة.</p>@endif
    <p>الاشتراك لكل مادة في صف محدد. الدفع يدوي عبر واتساب: اختر المادة، ثم اضغط «ادفع عبر واتساب» لتُرسل رسالة جاهزة فيها رمز طلبك، ونفعّل الاشتراك بعد تأكيد الدفع.</p>
    @unless ($hasNumber)<p class="alert err">لم يُضبط رقم واتساب للدفع بعد. سيُسجّل طلبك وسنتواصل معك.</p>@endunless
    <form method="post" action="{{ route('account.subscribe.store') }}" @if($hasNumber) target="_blank" rel="noopener" @endif>@csrf
      @if ($user->students->isNotEmpty())
      <div class="field"><label for="student_id">الطالب</label><select id="student_id" name="student_id"><option value="">كل الطلاب في الحساب</option>@foreach ($user->students as $s)<option value="{{ $s->id }}">{{ $s->name }} — {{ $ar::grade($s->grade) }}</option>@endforeach</select></div>
      @endif
      <fieldset style="border:0;padding:0;margin:0"><legend style="font-weight:700;margin-bottom:8px">المادة</legend>
      <div class="grid" style="grid-template-columns:repeat(auto-fill,minmax(220px,1fr))">
      @foreach ($plans as $p)
        <label class="card" style="display:flex;gap:10px;align-items:flex-start;padding:14px;cursor:pointer;font-weight:500"><input type="radio" name="plan" value="{{ $p['code'] }}" required style="width:22px;min-height:22px;margin-top:6px"><span><b>{{ $p['subject'] }}</b><br>{{ $ar::grade($p['grade']) }}<br><span class="chip">{{ $ar::num($p['price']) }} {{ $currency }} / {{ $ar::num($p['days']) }} يومًا</span></span></label>
      @endforeach
      </div></fieldset>
      <p style="margin-top:20px"><button class="btn wa" type="submit">ادفع عبر واتساب</button></p>
    </form>
  </section>
  @if ($pending->isNotEmpty())
  <section class="card">
    <h2 style="margin-top:0">طلبات بانتظار الدفع</h2>
    @foreach ($pending as $s)
      <p class="row" style="justify-content:space-between"><span><b dir="ltr">{{ $s->code }}</b> — {{ $s->plan_name }} — {{ $ar::num($s->price) }} {{ $s->currency }}</span>
      @if ($url = $gateway->checkoutUrl($s->setRelation('user', $user)))<a class="btn wa small" href="{{ $url }}" target="_blank" rel="noopener">أرسل عبر واتساب</a>@endif</p>
    @endforeach
  </section>
  @endif
  <p><a href="{{ route('account.home') }}">العودة إلى حسابي</a></p>
</main>
@endsection
