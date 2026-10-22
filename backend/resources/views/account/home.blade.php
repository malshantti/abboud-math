@extends('layouts.site')
@section('title', 'حسابي')
@section('body')
<style>
.hello{display:flex;align-items:center;gap:22px;flex-wrap:wrap;background:linear-gradient(160deg,#f3f8e6,var(--gl));border-color:#dfeac4;box-shadow:0 5px 0 #dfeac4}
.hello img{width:96px;height:auto;flex:none}
.hello .txt{flex:1;min-width:220px}.hello h1{margin:0 0 6px;font-size:30px;line-height:1.3}
.hello .txt p{margin:0;display:flex;flex-wrap:wrap;align-items:center;gap:8px;color:var(--ink2)}
.hello .row{display:flex;gap:10px;flex-wrap:wrap}
.sec-h{display:flex;align-items:center;gap:12px;margin:0 0 6px}.sec-h h2{margin:0;font-size:24px}
.sec-h .ic{width:42px;height:42px;border-radius:14px;display:grid;place-items:center;background:var(--gl);color:var(--gd)}
.sec-h .count{margin-inline-start:auto}
.sec-h svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.kids{display:grid;gap:14px;margin:18px 0 0;padding:0;list-style:none}
/* بطاقة الطالب: شبكة مرتبة على الحاسوب، وأكوام متتالية على الجوال */
.kid,.add{display:grid;grid-template-columns:minmax(190px,1.1fr) minmax(0,1.3fr) minmax(150px,.9fr) 216px;grid-template-areas:"head name grade act" "sync name grade act";column-gap:14px;row-gap:2px;align-items:center;border:2px solid var(--line);border-radius:18px;padding:14px 16px;background:#fffef9;box-shadow:0 3px 0 var(--line)}
.kid form.edit{display:contents}
.kid-h{grid-area:head;display:flex;align-items:center;gap:12px;min-width:0}
.kid-h .nm{min-width:0}.kid-h b{display:block;font:800 19px/1.35 Baloo,Cairo,sans-serif;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.kid-h .chip{font-size:13px;padding:1px 10px;line-height:1.7}
.f-name{grid-area:name}.f-grade{grid-area:grade}
.f-name label,.f-grade label{font-size:14px;color:var(--muted);margin:0 0 4px}
.kid .f-name label,.kid .f-grade label{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
.kid input,.kid select{min-height:48px}
.acts{grid-area:act;display:grid;grid-template-columns:1fr 1fr;gap:10px}
.acts form{display:contents}.acts .btn{width:100%;min-height:48px;padding-inline:10px}
.sync{grid-area:sync;margin:0;padding-inline-start:60px;font-size:13px;color:var(--muted)}
.av{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;flex:none;font:800 22px/1 Baloo,Cairo,sans-serif;color:#fff;background:var(--g);box-shadow:0 3px 0 var(--gd)}
.kid:nth-child(4n+2) .av{background:var(--b);box-shadow:0 3px 0 var(--bd)}.kid:nth-child(4n+3) .av{background:var(--o);box-shadow:0 3px 0 #b85d14}.kid:nth-child(4n) .av{background:#8b6cc9;box-shadow:0 3px 0 #644a9c}
.add{margin-top:18px;grid-template-areas:"head name grade act";align-items:end;border-style:dashed;border-color:#cfe3a8;background:#fbfdf6;box-shadow:none}
.add .kid-h{align-self:center}.add .av{background:#fff;color:var(--gd);border:2px dashed #cfe3a8;box-shadow:none}
.add .av svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:3;stroke-linecap:round}
.add .acts{grid-template-columns:1fr}
.empty{margin:14px 0 0;padding:16px;border-radius:16px;background:var(--yl);color:#5a4000}
.subs{display:grid;gap:10px;margin:14px 0 0;padding:0;list-style:none}
.subs li{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:6px 16px;align-items:center;padding:12px 16px;border:2px solid var(--line);border-radius:16px}
.subs b{font-weight:800}.subs .code{font-size:14px;color:var(--muted)}.subs .end{font-size:14px;color:var(--muted);white-space:nowrap}
@media (max-width:820px){
  .kid,.add{grid-template-columns:minmax(0,1fr);grid-template-areas:"head" "name" "grade" "act" "sync";row-gap:10px;padding:14px}
  .add{grid-template-areas:"head" "name" "grade" "act"}
  .sync{padding:8px 0 0;border-top:1px dashed var(--line)}
}
.verify{display:flex;align-items:center;gap:14px;flex-wrap:wrap;padding:14px 18px;background:var(--yl);border:2px solid #f3dc95;border-radius:18px;box-shadow:0 4px 0 #f3dc95}
.verify .ic{width:44px;height:44px;border-radius:14px;display:grid;place-items:center;background:#fff;color:#9a6b00;flex:none}
.verify svg{width:24px;height:24px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.verify .txt{flex:1;min-width:200px}.verify b{display:block;font:800 18px/1.5 Baloo,Cairo,sans-serif;color:#5a4000}.verify p{margin:0;color:#6b5410;font-size:15px;line-height:1.7}
.verify form{margin:0}.verify .btn{min-height:46px;font-size:16px;padding:8px 18px;background:#fff;color:#7a5200;border-color:#f0d98a;box-shadow:0 4px 0 #f0d98a}
@media (max-width:600px){
  .verify form,.verify .btn{width:100%}
  .card{padding:18px 16px}
  .hello{gap:12px 14px}.hello img{width:64px}.hello h1{font-size:24px}.hello .txt{min-width:0}
  .hello .row{width:100%;display:grid;grid-template-columns:1fr}.hello .row .btn{width:100%}
  .sec-h h2{font-size:22px}
  .subs li{grid-template-columns:minmax(0,1fr) auto}.subs .end{grid-column:1/-1}
}
</style>
<main class="wrap grid">
  @include('partials.flash')
  @unless ($user->isVerified())
  <section class="verify" role="status" aria-label="تفعيل الحساب">
    <span class="ic"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></svg></span>
    <div class="txt"><b>فعّل حسابك بلمسة واحدة</b><p>أرسلنا رابط التفعيل إلى <bdi dir="ltr">{{ $user->email }}</bdi>. يساعدنا ذلك على استعادة حسابك إن نسيت كلمة السر.</p></div>
    <form method="post" action="{{ route('account.verify.resend') }}">@csrf<button class="btn" type="submit">إعادة إرسال رابط التفعيل</button></form>
  </section>
  @endunless
  <section class="card hello">
    <img src="{{ asset('ui/logo-mascot.webp') }}" alt="" width="96" height="126">
    <div class="txt">
      <h1>أهلًا {{ $user->name }}</h1>
      @switch($access['kind'])
        @case('trial')<p><span class="chip warn">فترة تجريبية</span> كل المواد متاحة حتى {{ $ar::date($access['ends_at']) }}.</p>@break
        @case('paid')<p><span class="chip">مشترك</span> المواد المفعّلة: {{ collect($access['subjects'])->map(fn($c)=>$ar::subject($c))->join('، ') }}.</p>@break
        @case('expired')<p><span class="chip bad">انتهت الفترة التجريبية</span> اشترك في المادة التي يحتاجها طفلك لمتابعة الدروس.</p>@break
        @case('unverified')<p><span class="chip bad">البريد غير مفعّل</span> فعّل بريدك الإلكتروني من الرسالة التي أرسلناها إليك لتفتح الدروس.</p>@break
        @default<p><span class="chip">وصول كامل</span></p>
      @endswitch
      @foreach ($expiring as $e)<p class="renew" role="status"><span class="chip warn">{{ $e['grace'] ? 'فترة سماح' : 'يقترب الانتهاء' }}</span> {{ $e['name'] }}: {{ $e['grace'] ? 'انتهى في' : 'ينتهي في' }} {{ $ar::date($e['ends_at'], false) }}. <a href="{{ route('account.subscribe') }}">جدّد الاشتراك</a></p>@endforeach
    </div>
    <div class="row">
      @if ($siteUrl)<a class="btn sun" href="{{ $siteUrl }}/login.html?sync=1">افتح الموقع وزامن هذا الجهاز</a>@endif
      <a class="btn ghost" href="{{ route('account.subscribe') }}">الاشتراكات</a>
    </div>
  </section>

  <section class="card">
    <div class="sec-h"><span class="ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></svg></span><h2>الطلاب</h2>@if ($user->students->isNotEmpty())<span class="chip count">{{ $ar::num($user->students->count()) }}</span>@endif</div>
    <p class="hint">يُحفظ تقدّم كل طالب على الخادم حين يفتح الموقع من جهاز مرتبط بحسابك، ويبقى يعمل دون إنترنت ثم يتزامن عند عودة الاتصال.</p>
    @if ($user->students->isEmpty())
      <p class="empty">لا يوجد طلاب بعد. أضف طالبًا هنا، أو افتح الموقع على جهاز طفلك وسيُستورد ملفه وتقدّمه تلقائيًا.</p>
    @else
    <ul class="kids">
    @foreach ($user->students as $s)
      <li class="kid">
        <div class="kid-h"><span class="av" aria-hidden="true">{{ mb_substr($s->name, 0, 1) }}</span><span class="nm"><b>{{ $s->name }}</b><span class="chip grey">{{ $ar::grade($s->grade) }}</span></span></div>
        <form method="post" action="{{ route('account.students.update', $s) }}" class="edit" id="edit{{ $s->id }}">@csrf @method('put')
          <div class="f-name"><label for="n{{ $s->id }}">اسم الطالب</label><input id="n{{ $s->id }}" name="name" value="{{ $s->name }}" maxlength="24" required></div>
          <div class="f-grade"><label for="g{{ $s->id }}">الصف</label><select id="g{{ $s->id }}" name="grade">@foreach ($grades as $g => $label)<option value="{{ $g }}" @selected($s->grade === $g)>{{ $label }}</option>@endforeach</select></div>
        </form>
        <div class="acts">
          <button class="btn small" type="submit" form="edit{{ $s->id }}">حفظ</button>
          <form method="post" action="{{ route('account.students.destroy', $s) }}" onsubmit="return confirm('حذف الطالب «{{ e($s->name) }}» وتقدّمه من الخادم؟')">@csrf @method('delete')<input type="hidden" name="confirm" value="1"><button class="btn danger small" type="submit">حذف</button></form>
        </div>
        <p class="sync">آخر مزامنة: {{ $ar::date($s->last_synced_at) }}</p>
      </li>
    @endforeach
    </ul>
    @endif
    <form method="post" action="{{ route('account.students.store') }}" class="add">@csrf
      <div class="kid-h"><span class="av" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></span><span class="nm"><b>طالب جديد</b></span></div>
      <div class="f-name"><label for="new-name">اسم الطالب</label><input id="new-name" name="name" maxlength="24" required></div>
      <div class="f-grade"><label for="new-grade">الصف</label><select id="new-grade" name="grade">@foreach ($grades as $g => $label)<option value="{{ $g }}">{{ $label }}</option>@endforeach</select></div>
      <div class="acts"><button class="btn small" type="submit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>إضافة طالب</button></div>
    </form>
  </section>

  @if ($subscriptions->isNotEmpty())
  <section class="card">
    <div class="sec-h"><span class="ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"/></svg></span><h2>طلبات الاشتراك</h2></div>
    <ul class="subs">
    @foreach ($subscriptions as $s)<li><span><b>{{ $s->plan_name }}</b><br><span class="code" dir="ltr">{{ $s->code }}</span></span><span class="chip {{ $s->status === 'active' ? '' : ($s->status === 'pending' ? 'warn' : 'grey') }}">{{ $s->statusLabel() }}</span><span class="end">ينتهي: {{ $ar::date($s->ends_at, false) }}</span></li>@endforeach
    </ul>
  </section>
  @endif
</main>
@endsection
