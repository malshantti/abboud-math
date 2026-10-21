@extends('layouts.site')
@section('title', 'حسابي')
@section('body')
<style>
.hello{display:flex;align-items:center;gap:22px;flex-wrap:wrap;background:linear-gradient(160deg,#f3f8e6,var(--gl));border-color:#dfeac4;box-shadow:0 5px 0 #dfeac4}
.hello img{width:96px;height:auto;flex:none}
.hello .txt{flex:1;min-width:220px}.hello h1{margin:0 0 6px;font-size:30px}
.hello .txt p{margin:0;display:flex;flex-wrap:wrap;align-items:center;gap:8px;color:var(--ink2)}
.sec-h{display:flex;align-items:center;gap:12px;margin:0 0 4px}.sec-h h2{margin:0;font-size:24px}
.sec-h .ic{width:42px;height:42px;border-radius:14px;display:grid;place-items:center;background:var(--gl);color:var(--gd)}
.sec-h svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.kids{display:grid;gap:12px;margin:16px 0 0;padding:0;list-style:none}
.kid{display:flex;align-items:center;gap:14px;flex-wrap:wrap;border:2px solid var(--line);border-radius:18px;padding:12px 14px;background:#fffef9}
.av{width:48px;height:48px;border-radius:50%;display:grid;place-items:center;flex:none;font:800 22px/1 Baloo,Cairo,sans-serif;color:#fff;background:var(--g);box-shadow:0 3px 0 var(--gd)}
.kid:nth-child(4n+2) .av{background:var(--b);box-shadow:0 3px 0 var(--bd)}.kid:nth-child(4n+3) .av{background:var(--o);box-shadow:0 3px 0 #b85d14}.kid:nth-child(4n) .av{background:#8b6cc9;box-shadow:0 3px 0 #644a9c}
.kid form.edit{display:flex;flex-wrap:wrap;gap:10px;align-items:center;flex:1;min-width:240px}
.kid input{max-width:220px;min-height:46px}.kid select{max-width:170px;min-height:46px}
.kid .hint{flex-basis:100%;margin:0}
.kid>form:last-child{margin-inline-start:auto}
.add{display:flex;flex-wrap:wrap;gap:12px;align-items:end;margin-top:18px;padding:16px;border:2px dashed #cfe3a8;border-radius:18px;background:#fbfdf6}
.empty{margin:14px 0 0;padding:16px;border-radius:16px;background:var(--yl);color:#5a4000}
@media (max-width:600px){.hello{gap:14px}.hello img{width:68px}.hello h1{font-size:25px}.hello .row{width:100%}.hello .row .btn{flex:1}.kid input,.kid select{max-width:none;flex:1 1 130px}.kid form.edit{min-width:0}.add>*{flex:1 1 100%}}
</style>
<main class="wrap grid">
  @include('partials.flash')
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
    </div>
    <div class="row">
      @if ($siteUrl)<a class="btn sun" href="{{ $siteUrl }}/login.html?sync=1">افتح الموقع وزامن هذا الجهاز</a>@endif
      <a class="btn ghost" href="{{ route('account.subscribe') }}">الاشتراكات</a>
    </div>
  </section>

  <section class="card">
    <div class="sec-h"><span class="ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></svg></span><h2>الطلاب</h2></div>
    <p class="hint">يُحفظ تقدّم كل طالب على الخادم حين يفتح الموقع من جهاز مرتبط بحسابك، ويبقى يعمل دون إنترنت ثم يتزامن عند عودة الاتصال.</p>
    @if ($user->students->isEmpty())
      <p class="empty">لا يوجد طلاب بعد. أضف طالبًا هنا، أو افتح الموقع على جهاز طفلك وسيُستورد ملفه وتقدّمه تلقائيًا.</p>
    @else
    <ul class="kids">
    @foreach ($user->students as $s)
      <li class="kid">
        <span class="av" aria-hidden="true">{{ mb_substr($s->name, 0, 1) }}</span>
        <form method="post" action="{{ route('account.students.update', $s) }}" class="edit">@csrf @method('put')
          <label class="sr" for="n{{ $s->id }}">اسم الطالب</label><input id="n{{ $s->id }}" name="name" value="{{ $s->name }}" maxlength="24" required>
          <label class="sr" for="g{{ $s->id }}">الصف</label><select id="g{{ $s->id }}" name="grade">@foreach ($ar::GRADES as $g => $label)<option value="{{ $g }}" @selected($s->grade === $g)>{{ $label }}</option>@endforeach</select>
          <button class="btn small" type="submit">حفظ</button>
          <span class="hint">آخر مزامنة: {{ $ar::date($s->last_synced_at) }}</span>
        </form>
        <form method="post" action="{{ route('account.students.destroy', $s) }}" onsubmit="return confirm('حذف الطالب «{{ e($s->name) }}» وتقدّمه من الخادم؟')">@csrf @method('delete')<input type="hidden" name="confirm" value="1"><button class="btn danger small" type="submit">حذف</button></form>
      </li>
    @endforeach
    </ul>
    @endif
    <form method="post" action="{{ route('account.students.store') }}" class="add">@csrf
      <div style="flex:1;min-width:180px"><label for="new-name">اسم الطالب</label><input id="new-name" name="name" maxlength="24" required></div>
      <div style="min-width:160px"><label for="new-grade">الصف</label><select id="new-grade" name="grade">@foreach ($ar::GRADES as $g => $label)<option value="{{ $g }}">{{ $label }}</option>@endforeach</select></div>
      <button class="btn" type="submit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>إضافة طالب</button>
    </form>
  </section>

  @if ($subscriptions->isNotEmpty())
  <section class="card">
    <div class="sec-h"><span class="ic"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"/></svg></span><h2>طلبات الاشتراك</h2></div>
    <div style="overflow-x:auto"><table><thead><tr><th>الرمز</th><th>المادة</th><th>الحالة</th><th>ينتهي</th></tr></thead><tbody>
    @foreach ($subscriptions as $s)<tr><td dir="ltr">{{ $s->code }}</td><td>{{ $s->plan_name }}</td><td>{{ $s->statusLabel() }}</td><td>{{ $ar::date($s->ends_at, false) }}</td></tr>@endforeach
    </tbody></table></div>
  </section>
  @endif
</main>
@endsection
