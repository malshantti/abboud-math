@extends('layouts.manage')
@section('title', 'المدارس')
@section('content')
<div class="head"><h1>المدارس</h1></div>
@if ($c = session('credentials'))
<div class="note" role="status" style="background:#fff6d8;border:2px dashed #e0a200;padding:14px;border-radius:14px;margin-bottom:16px"><p><b>أُنشئت {{ $c['school'] }}.</b> بيانات دخول المدير {{ $c['name'] }} (تظهر مرة واحدة):<br>اسم المستخدم: <code dir="ltr">{{ $c['username'] }}</code> · كلمة المرور: <code dir="ltr">{{ $c['password'] }}</code><br>صفحة الدخول: <a href="{{ $c['url'] }}" dir="ltr">{{ $c['url'] }}</a></p></div>
@endif
<div class="grid dash">
<section class="card"><h2>مدرسة جديدة</h2>
  <form method="post" action="{{ route('manage.schools.store') }}" enctype="multipart/form-data">@csrf
    <div class="field"><label for="n">اسم المدرسة</label><input id="n" name="name" required maxlength="120" value="{{ old('name') }}"></div>
    <div class="field"><label for="sl">الرابط القصير (إنجليزي)</label><input id="sl" name="slug" dir="ltr" required maxlength="60" placeholder="alamal" value="{{ old('slug') }}"><p class="hint">تصبح صفحة الدخول: bustankids.com/s/<b>الرابط</b></p></div>
    <div class="field"><label for="m">اسم مدير المدرسة</label><input id="m" name="manager" required maxlength="80" value="{{ old('manager') }}"></div>
    <div class="field" style="display:flex;gap:14px"><label>اللون الأساسي <input type="color" name="color" value="#6f9e23" style="width:70px"></label><label>اللون الثاني <input type="color" name="color2" value="#ffc83d" style="width:70px"></label></div>
    <div class="field"><label for="lg">الشعار (PNG/JPG/WebP، حتى ١ م.ب)</label><input id="lg" type="file" name="logo" accept="image/png,image/jpeg,image/webp"></div>
    <label style="display:flex;gap:8px;align-items:center"><input type="checkbox" name="is_test" value="1">مدرسة تجريبية (للاختبار)</label>
    <button class="btn" type="submit" style="margin-top:12px">إنشاء المدرسة وحساب المدير</button>
  </form>
</section>
<section class="card"><h2>كل المدارس</h2>
  <ul class="list">
  @forelse ($schools as $s)
    <li style="flex-wrap:wrap;gap:8px"><b>{{ $s->name }}</b>@if($s->is_test)<span class="chip warn">تجريبية</span>@endif
      <span class="hint">{{ $ar::num($s->sections_count) }} شعبة · {{ $ar::num($s->staff_count) }} من الكادر · {{ $ar::num($students[$s->id] ?? 0) }} طالبًا</span>
      <a href="{{ route('school.login', $s) }}" target="_blank" rel="noopener" dir="ltr">/s/{{ $s->slug }}</a>
      <form method="post" action="{{ route('manage.schools.update', $s->id) }}" enctype="multipart/form-data" style="display:flex;gap:6px;align-items:center;flex-basis:100%">@csrf
        <input type="color" name="color" value="{{ \App\Models\School::hex($s->color,'#6f9e23') }}" style="width:56px" aria-label="اللون الأساسي"><input type="color" name="color2" value="{{ \App\Models\School::hex($s->color2,'#ffc83d') }}" style="width:56px" aria-label="اللون الثاني">
        <input type="file" name="logo" accept="image/png,image/jpeg,image/webp" aria-label="شعار جديد" style="max-width:220px"><button class="btn ghost small" type="submit">حفظ</button></form></li>
  @empty<li class="hint">لا مدارس بعد.</li>@endforelse
  </ul>
</section>
</div>
@endsection
