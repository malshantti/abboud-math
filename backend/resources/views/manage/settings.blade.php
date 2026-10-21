@extends('layouts.manage')
@section('title', 'إعدادات الموقع')
@section('content')
<div class="head"><h1>إعدادات الموقع</h1></div>
<form method="post" action="{{ route('manage.settings.update') }}" class="grid" style="grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr))">@csrf @method('put')
<section class="card"><h2>@include('partials.admin-icon',['name'=>'home'])الهوية والإعلان</h2>
  <div class="field"><label for="site_name">اسم الموقع</label><input id="site_name" name="site_name" value="{{ old('site_name', $s['site_name']) }}" required maxlength="80"></div>
  <div class="field"><label for="tagline">الشعار</label><input id="tagline" name="tagline" value="{{ old('tagline', $s['tagline']) }}" maxlength="160"></div>
  <div class="field"><label for="announcement">شريط الإعلان على الموقع</label><textarea id="announcement" name="announcement" rows="3" maxlength="500">{{ old('announcement', $s['announcement']) }}</textarea></div>
  <label class="check"><input type="checkbox" name="announcement_active" value="1" @checked($s['announcement_active']==='1') style="width:22px;min-height:22px"> إظهار الإعلان</label>
  <label class="check"><input type="checkbox" name="registration_open" value="1" @checked($s['registration_open']==='1') style="width:22px;min-height:22px"> التسجيل مفتوح للحسابات الجديدة</label>
</section>
<section class="card"><h2>@include('partials.admin-icon',['name'=>'clock'])التجربة والدفع</h2>
  <label class="check"><input type="checkbox" name="gating_enabled" value="1" @checked($s['gating_enabled']==='1') style="width:22px;min-height:22px"> قفل المواد غير المشترك فيها بعد انتهاء التجربة</label>
  <div class="field"><label for="trial_days">مدة الفترة التجريبية للحسابات الجديدة (أيام)</label><input id="trial_days" name="trial_days" type="number" min="0" max="90" value="{{ old('trial_days', $s['trial_days']) }}" required></div>
  <div class="field"><label for="whatsapp_number">رقم واتساب لاستقبال الدفع</label><input id="whatsapp_number" name="whatsapp_number" dir="ltr" value="{{ old('whatsapp_number', $s['whatsapp_number']) }}" placeholder="970599000000"><p class="hint">بالصيغة الدولية دون + أو أصفار بادئة.</p></div>
  <div class="field"><label for="currency">العملة</label><input id="currency" name="currency" value="{{ old('currency', $s['currency']) }}" required maxlength="10"></div>
</section>
<section class="card" style="grid-column:1/-1"><h2>@include('partials.admin-icon',['name'=>'tag'])أسعار المواد</h2>
  <p class="lead" style="margin:-4px 0 14px">سعر كل مادة في كل صف ومدة الاشتراك بالأيام. تظهر هذه الأسعار لأولياء الأمور في صفحة الاشتراك.</p>
  <div class="table-wrap" style="box-shadow:none"><table class="prices"><thead><tr><th>المادة</th><th>الصف</th><th>السعر ({{ $s['currency'] }})</th><th>المدة بالأيام</th></tr></thead><tbody>
  @foreach ($ar::SUBJECTS as $code => [$g, $subj])
    @php($p = $plans[$code] ?? \App\Models\Setting::defaultPlan($g))
    <tr><td><b>{{ $subj }}</b></td><td><span class="chip grey">{{ $ar::grade($g) }}</span></td><td><input name="prices[{{ $code }}][price]" type="number" min="0" max="100000" value="{{ $p['price'] }}" aria-label="سعر {{ $subj }} {{ $ar::grade($g) }}" ></td><td><input name="prices[{{ $code }}][days]" type="number" min="1" max="1000" value="{{ $p['days'] }}" aria-label="مدة {{ $subj }} {{ $ar::grade($g) }}" ></td></tr>
  @endforeach
  </tbody></table></div>
  </section>
<div class="savebar" style="grid-column:1/-1"><p>تُحفظ الهوية والتجربة والأسعار معًا.</p><button class="btn" type="submit">@include('partials.admin-icon',['name'=>'save'])حفظ الإعدادات</button></div>
</form>
@endsection
