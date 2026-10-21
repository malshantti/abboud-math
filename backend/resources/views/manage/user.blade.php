@extends('layouts.manage')
@section('title', $user->name)
@section('content')
<div class="head"><h1>{{ $user->name }}</h1><a href="{{ route('manage.users') }}">كل المستخدمين</a></div>
<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(320px,1fr))">
<section class="card"><h2 style="margin-top:0">البيانات والدور</h2>
  <form method="post" action="{{ route('manage.user.update', $user) }}">@csrf @method('put')
    <div class="field"><label for="name">الاسم</label><input id="name" name="name" value="{{ old('name', $user->name) }}" required maxlength="80"></div>
    <div class="field"><label for="email">البريد</label><input id="email" name="email" type="email" dir="ltr" value="{{ old('email', $user->email) }}" required></div>
    <div class="field"><label for="role">الدور</label><select id="role" name="role">@foreach (\App\Models\User::ROLES as $k => $v)<option value="{{ $k }}" @selected(($user->isAdminRole() ? 'admin' : $user->role) === $k)>{{ $v }}</option>@endforeach</select><p class="hint">المعلّم يرى لوحة المعلومات والطلاب والمحتوى فقط.</p></div>
    <button class="btn" type="submit">حفظ</button>
  </form>
  <p class="hint">التسجيل: {{ $ar::date($user->created_at) }} — آخر دخول: {{ $ar::date($user->last_login_at) }}</p>
</section>
<section class="card"><h2 style="margin-top:0">الحالة وكلمة المرور</h2>
  <form method="post" action="{{ route('manage.user.toggle', $user) }}" onsubmit="return confirm('{{ $user->disabled_at ? 'تفعيل' : 'تعطيل' }} هذا الحساب؟')">@csrf
    <p>@if($user->disabled_at)<span class="chip bad">معطّل منذ {{ $ar::date($user->disabled_at) }}</span>@else<span class="chip">فعّال</span>@endif</p>
    <button class="btn {{ $user->disabled_at ? '' : 'ghost' }} small" type="submit">{{ $user->disabled_at ? 'تفعيل الحساب' : 'تعطيل الحساب' }}</button>
  </form>
  <form method="post" action="{{ route('manage.user.password', $user) }}" style="margin-top:16px">@csrf<input type="hidden" name="mode" value="link"><button class="btn ghost small" type="submit">إرسال رابط إعادة التعيين بالبريد</button></form>
  <form method="post" action="{{ route('manage.user.password', $user) }}" class="row" style="margin-top:12px">@csrf
    <div style="flex:1"><label for="pw">كلمة مرور جديدة يدويًا</label><input id="pw" name="password" type="text" dir="ltr" minlength="8" maxlength="72" autocomplete="off"></div><button class="btn small" type="submit" style="align-self:end">تعيين</button>
  </form>
</section>
<section class="card"><h2 style="margin-top:0">الوصول والاشتراكات</h2>
  <p>الحالة: <b>{{ ['staff'=>'فريق الموقع','open'=>'مفتوح للجميع','trial'=>'فترة تجريبية','paid'=>'مشترك','expired'=>'منتهٍ'][$access['kind']] }}</b>
  @if($user->trial_ends_at) — نهاية التجربة: {{ $ar::date($user->trial_ends_at) }}@endif</p>
  <form method="post" action="{{ route('manage.user.trial', $user) }}" class="row">@csrf<div><label for="days">مدّ الفترة التجريبية (أيام من الآن، ٠ لإنهائها)</label><input id="days" name="days" type="number" min="0" max="365" value="3" style="max-width:140px"></div><button class="btn small" type="submit" style="align-self:end">تطبيق</button></form>
  <form method="post" action="{{ route('manage.user.grant', $user) }}" class="row" style="margin-top:12px">@csrf
    <div style="flex:1"><label for="plan">تفعيل مادة يدويًا</label><select id="plan" name="plan">@foreach ($plans as $p)<option value="{{ $p['code'] }}">{{ $p['name'] }}</option>@endforeach</select></div>
    <div><label for="gdays">الأيام</label><input id="gdays" name="days" type="number" min="1" max="1000" placeholder="افتراضي" style="max-width:110px"></div>
    <button class="btn small" type="submit" style="align-self:end">تفعيل</button></form>
  <table style="margin-top:12px"><tbody>@foreach ($subscriptions as $s)<tr><td dir="ltr">{{ $s->code }}</td><td>{{ $s->plan_name }}</td><td>{{ $s->statusLabel() }}</td><td>{{ $ar::date($s->ends_at, false) }}</td></tr>@endforeach</tbody></table>
</section>
<section class="card"><h2 style="margin-top:0">الطلاب</h2>
  @forelse ($user->students as $s)<p><a href="{{ route('manage.student', $s) }}">{{ $s->name }}</a> — {{ $ar::grade($s->grade) }}</p>@empty<p>لا طلاب.</p>@endforelse
  <h3>آخر النشاط</h3>
  @foreach ($log as $l)<p style="margin:2px 0"><span class="chip grey">{{ $l->label() }}</span> {{ $l->subject }} <small class="hint">{{ $ar::date($l->created_at) }}</small></p>@endforeach
</section>
<section class="card" style="border-color:#e5b1a4"><h2 style="margin-top:0">حذف الحساب</h2>
  <p>يحذف الحساب وطلابه وتقدّمهم على الخادم نهائيًا. لا يمكن التراجع.</p>
  <form method="post" action="{{ route('manage.user.destroy', $user) }}" onsubmit="return confirm('حذف الحساب نهائيًا؟')">@csrf @method('delete')
    <div class="field"><label for="confirm_email">اكتب البريد للتأكيد</label><input id="confirm_email" name="confirm_email" dir="ltr" autocomplete="off" required></div>
    <button class="btn danger small" type="submit">حذف نهائي</button></form>
</section>
</div>
@endsection
