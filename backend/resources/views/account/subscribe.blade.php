@extends('layouts.site')
@section('title', 'الاشتراك')
@section('body')
<style>
.sub-h{display:flex;align-items:center;gap:14px;margin-bottom:6px}.sub-h img{width:64px;height:auto}.sub-h h1{margin:0;font-size:30px}
.plans-f{border:0;padding:0;margin:18px 0 0}.plans-f legend{font-weight:800;margin-bottom:10px;padding:0}
.plans{display:grid;gap:14px;grid-template-columns:repeat(auto-fill,minmax(230px,1fr))}
.plan{position:relative;display:flex;flex-direction:column;gap:10px;margin:0;padding:16px 18px;border:2px solid var(--line);border-radius:20px;background:#fff;box-shadow:0 4px 0 var(--line);cursor:pointer;transition:border-color .15s,background .15s,transform .12s}
.plan:hover{border-color:#cfe3a8}
.plan input{position:absolute;inset-inline-end:16px;top:16px;margin:0}
.plan .pt b{display:block;font:800 20px/1.4 Baloo,Cairo,sans-serif}
.plan .price{display:flex;flex-wrap:wrap;align-items:baseline;gap:4px 6px;padding-top:10px;border-top:2px dashed var(--line);color:var(--ink2);font-weight:700}
.plan .price b{font:800 28px/1 Baloo,Cairo,sans-serif;color:var(--gd)}.plan .price small{flex-basis:100%;color:var(--muted);font-size:14px}
.plan:has(input:checked){border-color:var(--g);background:var(--gl);box-shadow:0 4px 0 var(--g)}
.plan:has(input:focus-visible){outline:3px solid var(--b);outline-offset:3px}
.pend{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;padding:12px 0;border-top:2px solid var(--line);margin:0}
</style>
<main class="wrap grid">
  @include('partials.flash')
  <section class="card">
    <div class="sub-h"><img src="{{ asset('ui/logo-mascot.webp') }}" alt="" width="72" height="95"><h1>الاشتراك في مادة</h1></div>
    @if ($access['kind'] === 'trial')<p><span class="chip warn">فترة تجريبية</span> كل المواد متاحة حتى {{ $ar::date($access['ends_at']) }}. يمكنك الاشتراك الآن ليستمر الوصول بعدها.</p>
    @elseif ($access['kind'] === 'expired')<p><span class="chip bad">انتهت الفترة التجريبية</span> الدروس المقفلة تحتاج اشتراكًا في المادة.</p>@endif
    <p>الاشتراك لكل مادة في صف محدد. الدفع يدوي عبر واتساب: اختر المادة، ثم اضغط «ادفع عبر واتساب» لتُرسل رسالة جاهزة فيها رمز طلبك، ونفعّل الاشتراك بعد تأكيد الدفع.</p>
    @unless ($hasNumber)<p class="alert err">لم يُضبط رقم واتساب للدفع بعد. سيُسجّل طلبك وسنتواصل معك.</p>@endunless
    <form method="post" action="{{ route('account.subscribe.store') }}" @if($hasNumber) target="_blank" rel="noopener" @endif>@csrf
      @if ($user->students->isNotEmpty())
      <div class="field"><label for="student_id">الطالب</label><select id="student_id" name="student_id"><option value="">كل الطلاب في الحساب</option>@foreach ($user->students as $s)<option value="{{ $s->id }}">{{ $s->name }} — {{ $ar::grade($s->grade) }}</option>@endforeach</select></div>
      @endif
      <fieldset class="plans-f"><legend>المادة والصف</legend>
      <div class="plans">
      @foreach ($plans as $p)
        <label class="plan"><input type="radio" name="plan" value="{{ $p['code'] }}" required><span class="pt"><b>{{ $p['subject'] }}</b><span class="hint">{{ $ar::grade($p['grade']) }}</span></span><span class="price"><b>{{ $ar::num($p['price']) }}</b> {{ $currency }}<small>لمدة {{ $ar::num($p['days']) }} يومًا</small></span></label>
      @endforeach
      </div></fieldset>
      <p style="margin-top:22px"><button class="btn wa" type="submit"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z"/></svg>ادفع عبر واتساب</button></p>
    </form>
  </section>
  @if ($pending->isNotEmpty())
  <section class="card">
    <h2 style="margin:0 0 8px">طلبات بانتظار الدفع</h2>
    @foreach ($pending as $s)
      <p class="pend"><span><b dir="ltr">{{ $s->code }}</b> — {{ $s->plan_name }} — {{ $ar::num($s->price) }} {{ $s->currency }}</span>
      @if ($url = $gateway->checkoutUrl($s->setRelation('user', $user)))<a class="btn wa small" href="{{ $url }}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z"/></svg>أرسل عبر واتساب</a>@endif</p>
    @endforeach
  </section>
  @endif
  <p style="margin:0"><a href="{{ route('account.home') }}">العودة إلى حسابي</a></p>
</main>
@endsection
