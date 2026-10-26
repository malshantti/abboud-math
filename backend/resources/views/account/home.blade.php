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
/* بطاقة الطالب: رأس (الاسم والصف والرقم السري وآخر مزامنة) ثم صف تعديل مرتب */
.kid,.add{border:2px solid var(--line);border-radius:18px;padding:14px 16px;background:#fffef9;box-shadow:0 3px 0 var(--line)}
.kid-h{display:flex;align-items:center;gap:12px;min-width:0;flex-wrap:wrap}
.kid-h .nm{min-width:0;flex:1;display:flex;align-items:center;gap:8px;flex-wrap:wrap}
.kid-h b{font:800 19px/1.35 Baloo,Cairo,sans-serif;overflow-wrap:anywhere}
.kid-h .chip{font-size:13px;padding:1px 10px;line-height:1.7}
.sync{margin:0;font-size:14px;color:var(--muted);white-space:nowrap}
.fields{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr) minmax(0,.8fr) auto;gap:10px 12px;align-items:end;margin-top:12px;padding-top:12px;border-top:1px dashed var(--line)}
.fields label{display:block;font-size:14px;font-weight:700;color:var(--muted);margin:0 0 4px}
.fields input,.fields select{min-height:50px;height:50px;width:100%;margin:0}
.fields input[name=pin]{letter-spacing:.3em;text-align:center}
.fields input[name=pin]::placeholder{letter-spacing:normal;font-size:14px}
.acts{display:flex;gap:10px}
.acts .btn{min-height:48px;padding-inline:18px}
.kid .del{display:flex;justify-content:flex-end;margin-top:8px}
.kid .del .btn{min-height:44px;font-size:15px;padding:4px 14px;box-shadow:none;border-color:transparent;background:none;text-decoration:underline;text-underline-offset:3px}
.av{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;flex:none;font:800 22px/1 Baloo,Cairo,sans-serif;color:#fff;background:var(--g);box-shadow:0 3px 0 var(--gd)}
.kid:nth-child(4n+2) .av{background:var(--b);box-shadow:0 3px 0 var(--bd)}.kid:nth-child(4n+3) .av{background:var(--o);box-shadow:0 3px 0 #b85d14}.kid:nth-child(4n) .av{background:#8b6cc9;box-shadow:0 3px 0 #644a9c}
.add{margin-top:18px;border-style:dashed;border-color:#cfe3a8;background:#fbfdf6;box-shadow:none}
.add .av{background:#fff;color:var(--gd);border:2px dashed #cfe3a8;box-shadow:none}
.add .av svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:3;stroke-linecap:round}
.pinhelp{margin:8px 0 0;font-size:14px;color:var(--muted)}
@media (max-width:820px){
  .fields{grid-template-columns:minmax(0,1fr)}
  .acts{grid-column:1/-1}.acts .btn{flex:1}
  .sync{white-space:normal;flex-basis:100%;padding-inline-start:60px}
}
.empty{margin:14px 0 0;padding:16px;border-radius:16px;background:var(--yl);color:#5a4000}
.subs{display:grid;gap:10px;margin:14px 0 0;padding:0;list-style:none}
.subs li{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:6px 16px;align-items:center;padding:12px 16px;border:2px solid var(--line);border-radius:16px}
.subs b{font-weight:800}.subs .code{font-size:14px;color:var(--muted)}.subs .end{font-size:14px;color:var(--muted);white-space:nowrap}
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
.more{padding:12px 16px}.more summary{cursor:pointer;font-weight:800;min-height:44px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;color:var(--ink2)}
.more .verify{margin-top:10px;padding:10px 14px;box-shadow:none}.more .verify b{font-size:16px}.more .verify p{font-size:14px}
.first{border-color:#cfe3a8;box-shadow:0 5px 0 #cfe3a8}
.first .add{margin-top:12px}
.kid-h summary{min-height:44px;display:flex;align-items:center}
</style>
<main class="wrap grid">
  @include('partials.flash')

  <section class="card first" id="students">
    <div class="sec-h"><span class="ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></svg></span><h2>الطلاب</h2>@if ($user->students->isNotEmpty())<span class="chip count">{{ $ar::num($user->students->count()) }}</span>@endif</div>
    <p class="hint">الخطوة الأولى: أضف طالبك مع صفه ورقمه السري.</p>
    @if ($user->students->isEmpty())
    <form method="post" action="{{ route('account.students.store') }}" class="add">@csrf
      <div class="kid-h"><span class="av" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></span><span class="nm"><b>@if ($user->students->isEmpty()) أضف طالبك الأول @else إضافة طالب @endif</b></span></div>
      <div class="fields">
        <div class="f-name"><label for="new-name">اسم الطالب</label><input id="new-name" name="name" maxlength="24" required value="{{ old('name') }}"></div>
        <div class="f-grade"><label for="new-grade">الصف</label><select id="new-grade" name="grade" required><option value="" disabled @selected(! old('grade'))>اختر الصف</option>@foreach ($grades as $g => $label)<option value="{{ $g }}" @selected((string) old('grade') === (string) $g)>{{ $label }}</option>@endforeach</select></div>
        <div class="f-pin"><label for="new-pin">الرقم السري</label><input id="new-pin" name="pin" inputmode="numeric" pattern="[0-9٠-٩]{4}" maxlength="4" autocomplete="off" placeholder="اختياري"></div>
        <div class="acts"><button class="btn small" type="submit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>إضافة</button></div>
      </div>
      <p class="pinhelp">اختياري: ٤ أرقام يكتبها طفلك عند الدخول</p>
    </form>
    @else
    <ul class="kids">
    @foreach ($user->students as $s)
      <li class="kid">
        <div class="kid-h"><span class="av" aria-hidden="true">{{ mb_substr($s->name, 0, 1) }}</span><span class="nm"><b>{{ $s->name }}</b><span class="chip grey">{{ $ar::grade($s->grade) }}</span>@if ($s->hasPin())<span class="chip">الرقم السري محدَّد</span>@else<span class="chip warn">لم يُحدَّد رقم سري</span>@endif</span>
          <p class="sync">{{ $s->last_synced_at ? 'آخر مزامنة: '.$ar::date($s->last_synced_at) : 'لم يُزامَن بعد' }}</p>
          <p style="margin:6px 0 0"><a class="btn small" href="{{ route('account.report', $s) }}">تقرير التقدّم</a></p>
          @foreach ($s->classrooms as $cl)<p class="sync" style="margin:6px 0 0">في صف: <b>{{ $cl->name }}</b> <form method="post" action="{{ route('account.students.leave', [$s, $cl]) }}" style="display:inline" onsubmit="return confirm('مغادرة الصف؟ لن يرى المعلّم تقدّم الطالب بعدها.')">@csrf @method('delete')<button class="btn ghost small" type="submit">مغادرة</button></form></p>@endforeach
          <details style="margin:6px 0 0"@if($errors->has('code'.$s->id)) open @endif><summary style="cursor:pointer;font-weight:700">الانضمام إلى صف معلّم</summary>
            <form method="post" action="{{ route('account.students.join', $s) }}" style="display:flex;gap:8px;align-items:end;margin-top:6px">@csrf<div><label for="cc{{ $s->id }}">رمز الصف</label><input id="cc{{ $s->id }}" name="code" maxlength="12" dir="ltr" autocomplete="off" placeholder="مثل: K7QH2M" required></div><button class="btn small" type="submit">انضمام</button></form>
            @error('code'.$s->id)<p class="err" role="alert" style="margin:4px 0 0">{{ $message }}</p>@enderror
            <p class="sync" style="margin:4px 0 0">يرى معلّم الصف تقدّم الطالب وتقريره فقط، ولا يرى بريدك أو اشتراكاتك.</p></details></div>
        <form method="post" action="{{ route('account.students.update', $s) }}" class="fields">@csrf @method('put')
          <div class="f-name"><label for="n{{ $s->id }}">اسم الطالب</label><input id="n{{ $s->id }}" name="name" value="{{ $s->name }}" maxlength="24" required></div>
          <div class="f-grade"><label for="g{{ $s->id }}">الصف</label><select id="g{{ $s->id }}" name="grade">@foreach ($grades as $g => $label)<option value="{{ $g }}" @selected($s->grade === $g)>{{ $label }}</option>@endforeach</select></div>
          <div class="f-pin"><label for="p{{ $s->id }}">{{ $s->hasPin() ? 'رقم سري جديد' : 'الرقم السري' }}</label><input id="p{{ $s->id }}" name="pin" inputmode="numeric" pattern="[0-9٠-٩]{4}" maxlength="4" autocomplete="off" placeholder="{{ $s->hasPin() ? 'اتركه فارغًا لإبقائه' : '٤ أرقام' }}"></div>
          <div class="acts"><button class="btn small" type="submit">حفظ التعديلات</button></div>
        </form>
        <form method="post" action="{{ route('account.students.destroy', $s) }}" class="del" onsubmit="return confirm('حذف الطالب «{{ e($s->name) }}» وتقدّمه من الخادم؟')">@csrf @method('delete')<input type="hidden" name="confirm" value="1"><button class="btn danger small" type="submit">حذف الطالب</button></form>
      </li>
    @endforeach
    </ul>
    <form method="post" action="{{ route('account.students.store') }}" class="add">@csrf
      <div class="kid-h"><span class="av" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M12 5v14M5 12h14"/></svg></span><span class="nm"><b>@if ($user->students->isEmpty()) أضف طالبك الأول @else إضافة طالب @endif</b></span></div>
      <div class="fields">
        <div class="f-name"><label for="new-name">اسم الطالب</label><input id="new-name" name="name" maxlength="24" required value="{{ old('name') }}"></div>
        <div class="f-grade"><label for="new-grade">الصف</label><select id="new-grade" name="grade" required><option value="" disabled @selected(! old('grade'))>اختر الصف</option>@foreach ($grades as $g => $label)<option value="{{ $g }}" @selected((string) old('grade') === (string) $g)>{{ $label }}</option>@endforeach</select></div>
        <div class="f-pin"><label for="new-pin">الرقم السري</label><input id="new-pin" name="pin" inputmode="numeric" pattern="[0-9٠-٩]{4}" maxlength="4" autocomplete="off" placeholder="اختياري"></div>
        <div class="acts"><button class="btn small" type="submit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>إضافة</button></div>
      </div>
      <p class="pinhelp">اختياري: ٤ أرقام يكتبها طفلك عند الدخول</p>
    </form>
    @endif
  </section>
  <section class="card hello">
    <img src="{{ asset('ui/logo-mascot.webp') }}" alt="" width="96" height="126">
    <div class="txt">
      <h1>أهلًا {{ $user->name }}</h1>
      @switch($access['kind'])
        @case('trial')<p><span class="chip warn">فترة تجريبية</span> كل المواد متاحة حتى {{ $ar::date($access['ends_at']) }}.</p>@break
        @case('paid')<p><span class="chip">مشترك</span> المواد المفعّلة: {{ collect($access['subjects'])->map(fn($c)=>$ar::subject($c))->join('، ') }}.</p>@break
        @case('expired')<p><span class="chip bad">انتهت الفترة التجريبية</span> اشترك في المادة التي يحتاجها طفلك لمتابعة الدروس.</p>@break
        @default<p><span class="chip">وصول كامل</span></p>
      @endswitch
      @foreach ($expiring as $e)<p class="renew" role="status"><span class="chip warn">{{ $e['grace'] ? 'فترة سماح' : 'يقترب الانتهاء' }}</span> {{ $e['name'] }}: {{ $e['grace'] ? 'انتهى في' : 'ينتهي في' }} {{ $ar::date($e['ends_at'], false) }}. <a href="{{ route('account.subscribe') }}">جدّد الاشتراك</a></p>@endforeach
    </div>
    <div class="row">
      @if ($siteUrl)<a class="btn sun" href="{{ $siteUrl }}/login.html?sync=1">افتح الموقع وزامن هذا الجهاز</a>@endif
      <a class="btn ghost" href="{{ route('account.subscribe') }}">الاشتراكات</a>
    </div>
  </section>
  <details class="card more">
    <summary>التفعيل والأجهزة @unless ($user->isVerified())<span class="chip warn">البريد غير مفعّل</span>@endunless</summary>
  @unless ($user->isVerified())
  <section class="verify" aria-label="تفعيل الحساب">
    <span class="ic"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m4 7 8 6 8-6"/></svg></span>
    <div class="txt"><b>فعّل بريدك متى شئت</b><p>يمكنك استخدام الحساب وإضافة طلابك الآن دون تفعيل. أرسلنا رابط التفعيل إلى <bdi dir="ltr">{{ $user->email }}</bdi>. يساعدنا ذلك على استعادة حسابك إن نسيت كلمة السر. لم تصلك الرسالة؟ افحص مجلد «الرسائل غير المرغوب فيها» (Spam) أو «العروض» ثم اضغط «ليست رسالة غير مرغوب فيها».</p></div>
    <form method="post" action="{{ route('account.verify.resend') }}">@csrf<button class="btn" type="submit">إعادة إرسال رابط التفعيل</button></form>
  </section>
  @endunless
    <p class="hint">على جهاز الطالب افتح الموقع وسجّل الدخول بحسابك، فتظهر أسماء الطلاب، ويختار كل طالب اسمه ويكتب رقمه السري. يُحفظ التقدّم على الخادم، ويعمل الموقع دون إنترنت ثم يتزامن عند عودة الاتصال.</p>
  </details>

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
