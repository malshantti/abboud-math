@extends('layouts.site')
@section('title', 'حسابي')
@section('body')
<main class="wrap grid">
  @include('partials.flash')
  <section class="card row" style="justify-content:space-between">
    <div>
      <h1 style="margin:0">أهلًا {{ $user->name }}</h1>
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
    <h2 style="margin-top:0">الطلاب</h2>
    <p class="hint">يُحفظ تقدّم كل طالب على الخادم حين يفتح الموقع من جهاز مرتبط بحسابك، ويبقى يعمل دون إنترنت ثم يتزامن عند عودة الاتصال.</p>
    @forelse ($user->students as $s)
      <div class="row" style="border-top:1px solid var(--line);padding:12px 0">
        <form method="post" action="{{ route('account.students.update', $s) }}" class="row" style="flex:1">@csrf @method('put')
          <label class="sr" for="n{{ $s->id }}">اسم الطالب</label><input id="n{{ $s->id }}" name="name" value="{{ $s->name }}" maxlength="24" required style="max-width:220px">
          <label class="sr" for="g{{ $s->id }}">الصف</label><select id="g{{ $s->id }}" name="grade" style="max-width:170px">@foreach ($ar::GRADES as $g => $label)<option value="{{ $g }}" @selected($s->grade === $g)>{{ $label }}</option>@endforeach</select>
          <button class="btn small" type="submit">حفظ</button>
          <span class="hint">آخر مزامنة: {{ $ar::date($s->last_synced_at) }}</span>
        </form>
        <form method="post" action="{{ route('account.students.destroy', $s) }}" onsubmit="return confirm('حذف الطالب «{{ e($s->name) }}» وتقدّمه من الخادم؟')">@csrf @method('delete')<input type="hidden" name="confirm" value="1"><button class="btn danger small" type="submit">حذف</button></form>
      </div>
    @empty
      <p>لا يوجد طلاب بعد. أضف طالبًا هنا، أو افتح الموقع على جهاز طفلك وسيُستورد ملفه وتقدّمه تلقائيًا.</p>
    @endforelse
    <form method="post" action="{{ route('account.students.store') }}" class="row" style="margin-top:16px">@csrf
      <div style="flex:1;min-width:180px"><label for="new-name">اسم الطالب</label><input id="new-name" name="name" maxlength="24" required></div>
      <div style="min-width:160px"><label for="new-grade">الصف</label><select id="new-grade" name="grade">@foreach ($ar::GRADES as $g => $label)<option value="{{ $g }}">{{ $label }}</option>@endforeach</select></div>
      <button class="btn" type="submit" style="align-self:end">إضافة طالب</button>
    </form>
  </section>

  @if ($subscriptions->isNotEmpty())
  <section class="card">
    <h2 style="margin-top:0">طلبات الاشتراك</h2>
    <table><thead><tr><th>الرمز</th><th>المادة</th><th>الحالة</th><th>ينتهي</th></tr></thead><tbody>
    @foreach ($subscriptions as $s)<tr><td dir="ltr">{{ $s->code }}</td><td>{{ $s->plan_name }}</td><td>{{ $s->statusLabel() }}</td><td>{{ $ar::date($s->ends_at, false) }}</td></tr>@endforeach
    </tbody></table>
  </section>
  @endif
</main>
@endsection
