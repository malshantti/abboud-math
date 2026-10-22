@extends('layouts.manage')
@section('title', $user->name)
@section('content')
<div class="head"><h1>{{ $user->name }}</h1><a class="btn ghost small" href="{{ route('manage.users') }}">@include('partials.admin-icon',['name'=>'back'])كل المستخدمين</a></div>
<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr))">
<section class="card"><h2>@include('partials.admin-icon',['name'=>'users'])البيانات والدور</h2>
  <form method="post" action="{{ route('manage.user.update', $user) }}">@csrf @method('put')
    <div class="field"><label for="name">الاسم</label><input id="name" name="name" value="{{ old('name', $user->name) }}" required maxlength="80"></div>
    <div class="field"><label for="email">البريد</label><input id="email" name="email" type="email" dir="ltr" value="{{ old('email', $user->email) }}" required></div>
    <div class="field"><label for="role">الدور</label><select id="role" name="role">@foreach (\App\Models\User::ROLES as $k => $v)<option value="{{ $k }}" @selected(($user->isAdminRole() ? 'admin' : $user->role) === $k)>{{ $v }}</option>@endforeach</select><p class="hint">المعلّم يرى لوحة المعلومات والطلاب والمحتوى فقط.</p></div>
    <button class="btn" type="submit">حفظ</button>
  </form>
  <p class="hint">التسجيل: {{ $ar::when($user->created_at) }} — آخر دخول: {{ $ar::when($user->last_login_at) }}</p>
</section>
<section class="card"><h2>@include('partials.admin-icon',['name'=>'lock'])الحالة وكلمة المرور</h2>
  <form method="post" action="{{ route('manage.user.toggle', $user) }}" onsubmit="return confirm('{{ $user->disabled_at ? 'تفعيل' : 'تعطيل' }} هذا الحساب؟')">@csrf
    <p>@if($user->disabled_at)<span class="chip bad">معطّل منذ {{ $ar::when($user->disabled_at) }}</span>@else<span class="chip">فعّال</span>@endif</p>
    <button class="btn {{ $user->disabled_at ? '' : 'ghost' }} small" type="submit">{{ $user->disabled_at ? 'تفعيل الحساب' : 'تعطيل الحساب' }}</button>
  </form>
  <div style="margin-top:16px;padding-top:14px;border-top:2px dashed var(--line)">
    <p style="margin:0 0 8px"><b>تفعيل البريد:</b> @if($user->email_verified_at)<span class="chip">مفعّل</span> <small class="hint">{{ $ar::when($user->email_verified_at, true, 'Asia/Hebron') }}</small>@else<span class="chip warn">غير مفعّل</span>@endif</p>
    @unless($user->email_verified_at)<form method="post" action="{{ route('manage.user.verify', $user) }}" onsubmit="return confirm('تعليم بريد هذا المستخدم مفعّلًا؟')">@csrf<button class="btn small" type="submit">@include('partials.admin-icon',['name'=>'check'])تعليم البريد مفعّلًا</button></form>@endunless
  </div>
  <form method="post" action="{{ route('manage.user.password', $user) }}" style="margin-top:16px">@csrf<input type="hidden" name="mode" value="link"><button class="btn ghost small" type="submit">إرسال رابط إعادة التعيين بالبريد</button></form>
  <form method="post" action="{{ route('manage.user.password', $user) }}" class="row" style="margin-top:12px">@csrf
    <div style="flex:1"><label for="pw">كلمة مرور جديدة يدويًا</label><input id="pw" name="password" type="text" dir="ltr" minlength="8" maxlength="72" autocomplete="off"></div><button class="btn small" type="submit" style="align-self:end">تعيين</button>
  </form>
</section>
<section class="card"><h2>@include('partials.admin-icon',['name'=>'shield'])الجهاز الحالي</h2>
  @if($user->deviceLabel())
  <dl class="device" style="display:grid;grid-template-columns:auto minmax(0,1fr);gap:6px 14px;margin:0 0 14px">
    <dt style="color:var(--muted)">الجهاز</dt><dd style="margin:0;font-weight:700">{{ $user->deviceLabel() }}</dd>
    <dt style="color:var(--muted)">آخر ظهور</dt><dd style="margin:0">@if($user->active_device_seen_at)<time datetime="{{ $user->active_device_seen_at->toIso8601String() }}">{{ $ar::when($user->active_device_seen_at) }}</time>@else لم يظهر بعد @endif</dd>
    <dt style="color:var(--muted)">المتصفح</dt><dd style="margin:0;font-size:13px;color:var(--muted);overflow-wrap:anywhere" dir="ltr">{{ $user->active_device_ua }}</dd>
  </dl>
  @else<p class="hint">لم يسجّل هذا الحساب الدخول من أي جهاز بعد.</p>@endif
  <p class="hint" style="margin:0 0 12px">{{ \App\Models\Setting::flag('single_device') ? 'جهاز واحد لكل حساب مفعّل: آخر جهاز يسجّل الدخول هو الوحيد المفتوح.' : 'جهاز واحد لكل حساب متوقف حاليًا من الإعدادات.' }}@if($user->isAdminRole()) حسابات المشرفين مستثناة.@endif</p>
  <form method="post" action="{{ route('manage.user.devices', $user) }}" onsubmit="return confirm('تسجيل خروج هذا الحساب من كل الأجهزة؟')">@csrf<button class="btn ghost small" type="submit">تسجيل الخروج من كل الأجهزة</button></form>
</section>

<section class="card"><h2>@include('partials.admin-icon',['name'=>'card'])الوصول والاشتراكات</h2>
  <p>الحالة: <b>{{ ['staff'=>'فريق الموقع','open'=>'مفتوح للجميع','trial'=>'فترة تجريبية','paid'=>'مشترك','expired'=>'منتهٍ'][$access['kind']] }}</b>
  @if($user->trial_ends_at) — نهاية التجربة: {{ $ar::when($user->trial_ends_at) }}@endif</p>
  <form method="post" action="{{ route('manage.user.trial', $user) }}" class="row">@csrf<div><label for="days">مدّ الفترة التجريبية (أيام من الآن، ٠ لإنهائها)</label><input id="days" name="days" type="number" min="0" max="365" value="3" style="max-width:140px"></div><button class="btn small" type="submit" style="align-self:end">تطبيق</button></form>
  <form method="post" action="{{ route('manage.user.grant', $user) }}" class="row" style="margin-top:12px">@csrf
    <div style="flex:1"><label for="plan">تفعيل مادة يدويًا</label><select id="plan" name="plan">@foreach ($plans as $p)<option value="{{ $p['code'] }}">{{ $p['name'] }}</option>@endforeach</select></div>
    <div><label for="gdays">الأيام</label><input id="gdays" name="days" type="number" min="1" max="1000" placeholder="افتراضي" style="max-width:110px"></div>
    <button class="btn small" type="submit" style="align-self:end">تفعيل</button></form>
  <table style="margin-top:12px"><tbody>@foreach ($subscriptions as $s)<tr><td dir="ltr" class="mono">{{ $s->code }}</td><td>{{ $s->plan_name }}</td><td><span class="chip {{ $s->status==='pending' ? 'warn' : ($s->status==='active' ? '' : ($s->status==='cancelled' ? 'bad' : 'grey')) }}">{{ $s->statusLabel() }}</span></td><td>{{ $ar::when($s->ends_at, false) }}</td></tr>@endforeach</tbody></table>
</section>
<section class="card"><h2>@include('partials.admin-icon',['name'=>'students'])الطلاب</h2>
  @forelse ($user->students as $s)<p><a href="{{ route('manage.student', $s) }}">{{ $s->name }}</a> — {{ $ar::grade($s->grade) }}</p>@empty<p>لا طلاب.</p>@endforelse
  <h3>آخر النشاط</h3>
  @foreach ($log as $l)<p style="margin:2px 0"><span class="chip grey">{{ $l->label() }}</span> {{ $l->subject }} <small class="hint">{{ $ar::when($l->created_at) }}</small></p>@endforeach
</section>
<section class="card danger-zone"><h2>@include('partials.admin-icon',['name'=>'alert'])حذف الحساب</h2>
  <p>يحذف الحساب وطلابه وتقدّمهم على الخادم نهائيًا. لا يمكن التراجع.</p>
  <form method="post" action="{{ route('manage.user.destroy', $user) }}" onsubmit="return confirm('حذف الحساب نهائيًا؟')">@csrf @method('delete')
    <div class="field"><label for="confirm_email">اكتب البريد للتأكيد</label><input id="confirm_email" name="confirm_email" dir="ltr" autocomplete="off" required></div>
    <button class="btn danger small" type="submit">حذف نهائي</button></form>
</section>
</div>
@endsection
