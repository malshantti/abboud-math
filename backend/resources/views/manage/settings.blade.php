@extends('layouts.manage')
@section('title', 'مركز الإعدادات')
@php
  $tabs = [
    'prices' => ['الأسعار والمواد', 'tag', 'سعر كل مادة في كل صف ومدتها وإتاحتها'],
    'trial' => ['التجربة والاشتراكات', 'clock', 'الفترة المجانية والسماح والتذكير'],
    'payment' => ['الدفع وواتساب', 'wallet', 'الرقم والرسالة والعملة والتعليمات'],
    'identity' => ['الهوية والصفحة الرئيسية', 'home', 'الاسم والواجهة والإعلان والأسئلة'],
    'accounts' => ['الحسابات والأمان', 'shield', 'التسجيل والتفعيل والجلسات'],
    'voice' => ['الجولة الصوتية', 'volume', 'صوت زيتون في الصفحة الرئيسية'],
    'contact' => ['التواصل والتذييل', 'globe', 'روابط التواصل ونص التذييل'],
    'maintenance' => ['وضع الصيانة', 'wrench', 'إيقاف موقع الطلاب مؤقتًا'],
  ];
  $fieldTab = ['prices'=>'prices','extra'=>'prices','trial_days'=>'trial','gating_enabled'=>'trial','grace_days'=>'trial','reminder_days'=>'trial','max_pending'=>'trial','pending_expire_days'=>'trial','auto_expire'=>'trial',
    'whatsapp_number'=>'payment','whatsapp_template'=>'payment','currency'=>'payment','payment_instructions'=>'payment',
    'site_name'=>'identity','tagline'=>'identity','hero'=>'identity','announcement'=>'identity','faq'=>'identity',
    'max_students'=>'accounts','session_minutes'=>'accounts','voice_volume'=>'voice','facebook_url'=>'contact','instagram_url'=>'contact','contact_email'=>'contact','footer_text'=>'contact','maintenance_message'=>'maintenance'];
  $tab = array_key_exists(request('tab'), $tabs) ? request('tab') : 'prices';
  $errTabs = [];
  foreach ($errors->keys() as $k) { foreach ($fieldTab as $pre => $t) { if (str_starts_with($k, $pre)) { $errTabs[$t] = true; break; } } }
  if ($errTabs) { $tab = array_key_first($errTabs); }
  $v = fn ($k) => old($k, $s[$k] ?? '');
  $n = fn ($k) => $ar::num(old($k, $s[$k] ?? ''));
  $on = fn ($k) => old('_sent') ? (bool) old($k) : ($s[$k] ?? '0') === '1';
  $byGrade = collect($plans)->groupBy('grade')->sortKeys();
  $err = fn ($k) => $errors->has($k) ? '<p class="ferr" role="alert">'.e($ar::num($errors->first($k))).'</p>' : '';
@endphp
@section('content')
<style>
.sc [hidden],.sbar [hidden]{display:none!important}
.sc{display:grid;grid-template-columns:262px minmax(0,1fr);gap:22px;align-items:start}
.sc-nav{position:sticky;top:18px;display:flex;flex-direction:column;gap:6px;background:#fff;border:2px solid var(--line);border-radius:22px;padding:10px;box-shadow:0 5px 0 var(--line)}
.sc-nav button,.sc-nav a{all:unset;box-sizing:border-box;display:grid;grid-template-columns:22px minmax(0,1fr) auto;align-items:center;gap:10px;min-height:52px;padding:8px 12px;border-radius:14px;cursor:pointer;font:700 16px/1.35 Baloo,Cairo,sans-serif;color:var(--ink)}
.sc-nav button .ico,.sc-nav a .ico{color:var(--leaf)}
.sc-nav button:hover,.sc-nav a:hover{background:#f6f9ee}
.sc-nav button:focus-visible,.sc-nav a:focus-visible{outline:3px solid var(--sun);outline-offset:1px}
.sc-nav button[aria-selected=true]{background:var(--gl);color:var(--gd);box-shadow:inset 0 0 0 2px #cfe3a8}
.sc-nav .dot{width:10px;height:10px;border-radius:50%;background:transparent}
.sc-nav [data-dirty] .dot{background:var(--sun-d)}.sc-nav [data-err] .dot{background:var(--red)}
.sc-nav hr{border:0;border-top:2px dashed var(--line);margin:4px 6px}
.sc-nav a small{color:var(--muted);font:700 12px/1 Cairo,sans-serif}
.panel[hidden]{display:none}
.panel>header{display:flex;align-items:center;gap:14px;margin:0 0 16px}
.panel>header .pi{flex:none;display:grid;place-items:center;width:52px;height:52px;border-radius:16px;background:var(--gl);color:var(--gd)}.panel>header .pi .ico{width:26px;height:26px}
.panel>header h2{margin:0;font-size:clamp(22px,2.6vw,27px)}.panel>header p{margin:2px 0 0;color:var(--muted);font-weight:600}
.stack{display:grid;gap:18px}
.card h3{font-size:19px;margin:0 0 6px;display:flex;align-items:center;gap:8px}.card h3 .ico{color:var(--leaf);width:20px;height:20px}
.card>.sub{margin:0 0 12px;color:var(--muted);font-weight:600;line-height:1.7}
.fg{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,230px),1fr));gap:4px 18px}
.fg .field{margin:10px 0}
.field label{display:block;font-weight:800;margin-bottom:6px}
.field input:not([type=checkbox]),.field select,.field textarea{width:100%}
.unit{display:flex;align-items:stretch}.unit input{border-start-end-radius:0;border-end-end-radius:0}.unit span{display:grid;place-items:center;padding:0 12px;border:2px solid var(--line);border-inline-start:0;border-radius:0 14px 14px 0;background:#f7f8ef;color:var(--muted);font-weight:700;white-space:nowrap}
[dir=rtl] .unit span{border-radius:14px 0 0 14px}[dir=rtl] .unit input{border-radius:0 14px 14px 0}
.ferr{margin:6px 0 0;color:var(--red-d);font-weight:700;font-size:15px}
.is-bad{border-color:var(--red)!important;background:#fffafa!important}
.sw{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:14px;padding:14px 0;border-bottom:1px dashed var(--line);cursor:pointer}
.sw:last-child{border-bottom:0}.sw b{display:block;font-size:17px}.sw small{display:block;color:var(--muted);font-weight:600;font-size:14.5px;line-height:1.6}
.tg{position:relative;width:58px;height:34px;flex:none}
.tg input{position:absolute;inset:0;width:100%!important;height:100%!important;min-height:0!important;margin:0;opacity:0;cursor:pointer;z-index:1}
.tg i{position:absolute;inset:0;border-radius:999px;background:#dcdccf;transition:background .15s}
.tg i:after{content:"";position:absolute;top:4px;inset-inline-start:4px;width:26px;height:26px;border-radius:50%;background:#fff;box-shadow:0 2px 4px #0003;transition:transform .15s}
.tg input:checked+i{background:var(--g)}.tg input:checked+i:after{transform:translateX(-24px)}
[dir=ltr] .tg input:checked+i:after{transform:translateX(24px)}
.tg input:focus-visible+i{outline:3px solid var(--sun);outline-offset:2px}
.tg.sm{width:50px;height:30px}.tg.sm i:after{width:22px;height:22px}.tg.sm input:checked+i:after{transform:translateX(-20px)}
/* prices */
.gcard{padding:0;overflow:hidden}
.gh{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:14px 18px;background:#f6f9ee;border-bottom:2px solid var(--line)}
.gh h3{margin:0;font-size:20px}.gh .chip{font-size:13px}
.gh .tools{margin-inline-start:auto;display:flex;gap:8px;flex-wrap:wrap;align-items:center}
.gh .tools input,.gh .tools select{min-height:44px;width:auto}
.gh .tools input{width:92px;text-align:center;font-weight:800}
.prow{display:grid;grid-template-columns:minmax(0,1.4fr) 150px 150px 112px;gap:12px;align-items:center;padding:12px 18px;border-bottom:1px dashed var(--line)}
.prow:last-child{border-bottom:0}
.prow.off{background:#fafaf5}.prow.off .pname b{color:var(--muted)}
.prow .pname b{display:block;font-size:17px}.prow .pname small{color:var(--muted);font-weight:700;font-size:13px}
.prow input{min-height:46px;text-align:center;font-weight:800}
.prow label.l{display:none}
.prow .act{display:flex;align-items:center;gap:8px;justify-content:flex-end}
.phead{display:grid;grid-template-columns:minmax(0,1.4fr) 150px 150px 112px;gap:12px;padding:8px 18px;color:var(--muted);font-weight:800;font-size:14px;border-bottom:2px solid var(--line)}
.ibtn{display:inline-grid;place-items:center;width:44px;height:44px;border-radius:12px;border:2px solid var(--line);background:#fff;color:var(--muted);cursor:pointer}
.ibtn:hover{color:var(--red-d);border-color:#f3c9c6}.ibtn .ico{width:20px;height:20px}
.addu{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,190px),1fr));gap:12px;align-items:end}
.addu .field{margin:0}
.summary{display:flex;gap:10px;flex-wrap:wrap}.summary .pill{min-height:34px;font-size:14px}
/* faq */
.faq-i{border:2px solid var(--line);border-radius:18px;padding:12px 14px;background:#fffef9;margin:0 0 12px}
.faq-i .fh{display:flex;align-items:center;gap:8px;margin:0 0 6px}.faq-i .fh b{flex:1;color:var(--gd)}
.faq-i .field{margin:8px 0}
/* previews */
.pv-ann{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;padding:10px 16px;border:2px solid;border-radius:14px;font-weight:700;text-align:center;line-height:1.7}
.pv-wa{white-space:pre-wrap;background:#e7f7dc;border:2px solid #bfe5a6;border-radius:16px 16px 4px 16px;padding:12px 14px;font-size:15px;line-height:1.8;max-width:520px}
.ph{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 0}
.ph button{all:unset;cursor:pointer;display:inline-flex;align-items:center;gap:6px;min-height:36px;padding:2px 10px;border-radius:10px;background:var(--gl);color:var(--gd);font:700 14px/1.3 Cairo,sans-serif}
.ph button code{font-family:inherit;direction:ltr}
.ph button:focus-visible{outline:3px solid var(--sun)}
.colors{display:flex;gap:10px;flex-wrap:wrap}
.colors label{display:inline-flex;align-items:center;gap:8px;min-height:44px;padding:4px 14px 4px 10px;border:2px solid var(--line);border-radius:14px;cursor:pointer;font-weight:700}
.colors label i{width:22px;height:22px;border-radius:8px;border:2px solid}
.colors input{width:18px!important;min-height:18px!important;height:18px}
.colors label:has(input:checked){border-color:var(--g);background:var(--gl)}
.range{display:flex;align-items:center;gap:14px}.range input{flex:1;accent-color:var(--g);min-height:0}.range output{min-width:3.5em;text-align:center;font:800 20px/1 Baloo,Cairo,sans-serif;color:var(--gd)}
.mail-link{display:flex;align-items:center;gap:14px;flex-wrap:wrap}
.mail-link p{flex:1;margin:0;min-width:200px}
.maint-on{border-color:#f3c9c6;box-shadow:0 5px 0 #f3c9c6}
.sbar{position:sticky;bottom:12px;z-index:12;display:flex;align-items:center;gap:12px;flex-wrap:wrap;margin-top:22px;padding:12px 16px;background:#fff;border:2px solid #cfe3a8;border-radius:20px;box-shadow:0 8px 24px #24331c1a,0 5px 0 #cfe3a8}
.sbar .st{flex:1;min-width:0;margin:0;display:flex;align-items:center;gap:8px;font-weight:700;color:var(--ink2)}
.sbar .st i{flex:none;width:12px;height:12px;border-radius:50%;background:var(--leaf)}
.sbar.dirty{border-color:#f0d58a;box-shadow:0 8px 24px #24331c1a,0 5px 0 #f0d58a}.sbar.dirty .st i{background:var(--sun-d)}
.sbar .btn{min-width:200px}
.toast{position:fixed;inset-inline:0;top:18px;margin:auto;width:max-content;max-width:calc(100vw - 28px);z-index:60;display:flex;align-items:center;gap:10px;padding:12px 18px;border-radius:16px;background:var(--gd);color:#fff;font-weight:800;box-shadow:0 10px 30px #24331c44;transition:opacity .3s,transform .3s}
.toast.hide{opacity:0;transform:translateY(-14px);pointer-events:none}.toast .ico{color:#d9f0a8}
.errsum{margin:0 0 16px}.errsum a{color:inherit}
@media (max-width:1100px){.prow,.phead{grid-template-columns:minmax(0,1fr) 120px 120px 104px}}
@media (max-width:900px){
 .sc{grid-template-columns:minmax(0,1fr);gap:14px}
 .sc-nav{position:sticky;top:60px;z-index:11;flex-direction:row;overflow-x:auto;scrollbar-width:none;padding:6px;border-radius:18px;margin:0 -4px}
 .sc-nav::-webkit-scrollbar{display:none}
 .sc-nav button,.sc-nav a{grid-template-columns:20px auto 8px;white-space:nowrap;min-height:46px;padding:6px 12px;font-size:15px}
 .sc-nav hr{display:none}.sc-nav a small{display:none}
}
@media (max-width:640px){
 .phead{display:none}
 .prow{grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px 10px;padding:12px 14px}
 .prow .pname{grid-column:1/-1;display:flex;align-items:center;justify-content:space-between;gap:8px}
 .prow label.l{display:block;font-size:13px;color:var(--muted);font-weight:700;margin:0 0 2px}
 .prow .act{grid-column:1/-1;justify-content:space-between;border-top:1px dashed var(--line);padding-top:8px}
 .prow .act:before{content:"متاحة للاشتراك";font-weight:700;color:var(--ink2);font-size:14px;margin-inline-end:auto}
 .gh{padding:12px 14px}.gh .tools{margin:0;width:100%}.gh .tools>*{flex:1 1 auto}
 .panel>header .pi{width:44px;height:44px}
 .sbar{bottom:8px;padding:8px 10px;gap:8px;flex-wrap:nowrap}.sbar .st{font-size:13.5px;line-height:1.45}.sbar .btn{min-width:0;min-height:48px;padding:8px 14px;font-size:16px;flex:none}.sbar #undo{padding:6px 10px;font-size:14px}
 .sbar.dirty{flex-wrap:wrap}.sbar.dirty .st{flex-basis:100%}.sbar.dirty .btn{flex:1}
}
</style>

@if (session('status'))<div class="toast" id="toast" role="status">@include('partials.admin-icon',['name'=>'check']){{ $ar::num(session('status')) }}</div>@endif
<div class="head"><h1>@include('partials.admin-icon',['name'=>'settings'])مركز الإعدادات</h1></div>
@if ($errors->any())
<div class="alert err errsum" role="alert"><b>لم تُحفظ الإعدادات. صحّح الحقول الآتية:</b><ul>@foreach ($errors->all() as $e)<li>{{ $ar::num($e) }}</li>@endforeach</ul></div>
@endif

<form method="post" action="{{ route('manage.settings.update') }}" id="sf" novalidate>@csrf @method('put')
<input type="hidden" name="_sent" value="1"><input type="hidden" name="tab" id="tabf" value="{{ $tab }}">
<div class="sc">
<nav class="sc-nav" role="tablist" aria-label="أقسام الإعدادات">
  @foreach ($tabs as $k => [$label, $icon])
    <button type="button" role="tab" id="t-{{ $k }}" aria-controls="p-{{ $k }}" aria-selected="{{ $tab === $k ? 'true' : 'false' }}" data-tab="{{ $k }}" @if(isset($errTabs[$k])) data-err @endif>@include('partials.admin-icon',['name'=>$icon])<span>{{ $label }}</span><i class="dot" aria-hidden="true"></i></button>
  @endforeach
  <hr>
  <a href="{{ route('manage.mail') }}">@include('partials.admin-icon',['name'=>'mail'])<span>إعدادات البريد</span><small>صفحة مستقلة</small></a>
</nav>

<div class="panels">
{{-- ===== 1) Prices ===== --}}
<section class="panel" id="p-prices" role="tabpanel" aria-labelledby="t-prices" @if($tab!=='prices') hidden @endif>
  <header><span class="pi">@include('partials.admin-icon',['name'=>'tag'])</span><div><h2>الأسعار والمواد</h2><p>سعر كل مادة في كل صف بعملة «{{ $s['currency'] }}»، ومدة الاشتراك بالأيام، وإتاحتها للاشتراك.</p></div></header>
  <div class="stack">
  <div class="card">
    <h3>@include('partials.admin-icon',['name'=>'copy'])إجراءات جماعية</h3>
    <p class="sub">انسخ أسعار صف إلى صف آخر بحسب اسم المادة. تُطبَّق التغييرات في الجدول، ولا تُحفظ قبل الضغط على «حفظ الإعدادات».</p>
    <div class="addu">
      <div class="field"><label for="cp-from">انسخ من</label><select id="cp-from">@foreach ($byGrade as $g => $_)<option value="{{ $g }}">{{ $ar::grade($g) }}</option>@endforeach</select></div>
      <div class="field"><label for="cp-to">إلى</label><select id="cp-to">@foreach ($byGrade as $g => $_)<option value="{{ $g }}" @selected($loop->index===1)>{{ $ar::grade($g) }}</option>@endforeach</select></div>
      <div class="field"><label class="check" for="cp-days" style="margin:0 0 10px;display:flex;flex-direction:row;font-weight:700"><input type="checkbox" id="cp-days" checked style="margin:0"><span>مع مدة الاشتراك</span></label><button type="button" class="btn ghost small" id="cp-go" style="width:100%">@include('partials.admin-icon',['name'=>'copy'])انسخ الأسعار</button></div>
    </div>
    <p class="hint" id="cp-msg" role="status" aria-live="polite"></p>
  </div>

  <div id="grades">
  @foreach ($byGrade as $g => $group)
    <div class="card gcard" data-grade="{{ $g }}" style="margin-bottom:18px">
      <div class="gh"><h3>{{ $ar::grade($g) }}</h3><span class="chip grey" data-count>{{ $ar::num(count($group)) }} {{ count($group) <= 10 && count($group) > 2 ? 'مواد' : 'مادة' }}</span>
        <div class="tools"><label class="sr" for="bulk-{{ $g }}" style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)">سعر موحّد لـ{{ $ar::grade($g) }}</label>
          <input id="bulk-{{ $g }}" inputmode="numeric" data-num placeholder="السعر" aria-label="سعر موحّد لـ{{ $ar::grade($g) }}">
          <button type="button" class="btn ghost small" data-bulk="{{ $g }}">طبّق على الصف كله</button></div></div>
      <div class="phead" aria-hidden="true"><span>المادة</span><span>السعر</span><span>المدة بالأيام</span><span style="text-align:end">متاحة</span></div>
      @foreach ($group as $p)
        @php($c = $p['code'])
        @php($act = old('_sent') ? (bool) old("prices.$c.active") : $p['active'])
        <div class="prow @unless($act) off @endunless" data-code="{{ $c }}" data-subject="{{ $p['subject'] }}">
          <div class="pname"><span><b>{{ $p['subject'] }}</b>@unless($p['builtin'])<small>مادة مضافة — يلزم رفع محتواها قبل إتاحتها</small>@endunless</span>
            @unless($p['builtin'])<input type="hidden" name="extra[]" value="{{ $c }}"><input type="hidden" name="extra_name[{{ $c }}]" value="{{ $p['subject'] }}"><button type="button" class="ibtn" data-remove aria-label="احذف {{ $p['subject'] }} من {{ $ar::grade($g) }}">@include('partials.admin-icon',['name'=>'trash'])</button>@endunless</div>
          <div><label class="l" for="pp-{{ $c }}">السعر</label><div class="unit"><input id="pp-{{ $c }}" name="prices[{{ $c }}][price]" inputmode="numeric" data-num value="{{ $ar::num(old("prices.$c.price", $p['price'])) }}" aria-label="سعر {{ $p['subject'] }} — {{ $ar::grade($g) }}" class="@error("prices.$c.price") is-bad @enderror"><span>{{ $s['currency'] }}</span></div>{!! $err("prices.$c.price") !!}</div>
          <div><label class="l" for="pd-{{ $c }}">المدة</label><div class="unit"><input id="pd-{{ $c }}" name="prices[{{ $c }}][days]" inputmode="numeric" data-num value="{{ $ar::num(old("prices.$c.days", $p['days'])) }}" aria-label="مدة {{ $p['subject'] }} — {{ $ar::grade($g) }} بالأيام" class="@error("prices.$c.days") is-bad @enderror"><span>يومًا</span></div>{!! $err("prices.$c.days") !!}</div>
          <div class="act"><span class="tg sm"><input type="checkbox" name="prices[{{ $c }}][active]" value="1" @checked($act) aria-label="إتاحة {{ $p['subject'] }} — {{ $ar::grade($g) }} للاشتراك"><i></i></span></div>
        </div>
      @endforeach
    </div>
  @endforeach
  </div>

  <div class="card">
    <h3>@include('partials.admin-icon',['name'=>'plus'])إضافة مادة أو صف من المنهاج</h3>
    <p class="sub">أضف أي مادة لأي صف من الصف الأول إلى الصف الثاني عشر. تُضاف المادة غير متاحة للاشتراك حتى يُرفع محتواها إلى الموقع في المجلد <span dir="ltr">g{رقم الصف}/{رمز المادة}</span>، ثم تفعّلها من مفتاح «متاحة». يظهر الصف الجديد لأولياء الأمور عند إضافة الطلاب.</p>
    <div class="addu">
      <div class="field"><label for="nu-grade">الصف</label><select id="nu-grade">@foreach ($ar::GRADE_WORDS as $g => $l)<option value="{{ $g }}">{{ $l }}</option>@endforeach</select></div>
      <div class="field"><label for="nu-subj">المادة</label><select id="nu-subj">@foreach ($subjectsList as $slug => $l)<option value="{{ $slug }}">{{ $l }}</option>@endforeach</select></div>
      <div class="field"><label for="nu-price">السعر</label><input id="nu-price" inputmode="numeric" data-num value="{{ $ar::num(20) }}"></div>
      <div class="field"><button type="button" class="btn small" id="nu-add" style="width:100%">@include('partials.admin-icon',['name'=>'plus'])أضف المادة</button></div>
    </div>
    <p class="hint" id="nu-msg" role="status" aria-live="polite"></p>{!! $err('extra') !!}
  </div>
  </div>
</section>

{{-- ===== 2) Trial ===== --}}
<section class="panel" id="p-trial" role="tabpanel" aria-labelledby="t-trial" @if($tab!=='trial') hidden @endif>
  <header><span class="pi">@include('partials.admin-icon',['name'=>'clock'])</span><div><h2>التجربة والاشتراكات</h2><p>كيف تبدأ الحسابات الجديدة، وما يحدث عند انتهاء التجربة أو الاشتراك.</p></div></header>
  <div class="stack">
  <div class="card">
    <h3>الفترة التجريبية</h3>
    <div class="fg">
      <div class="field"><label for="trial_days">مدة التجربة للحسابات الجديدة</label><div class="unit"><input id="trial_days" name="trial_days" inputmode="numeric" data-num value="{{ $n('trial_days') }}" class="@error('trial_days') is-bad @enderror"><span>يومًا</span></div><p class="hint">صفر يعني بلا تجربة. تظهر المدة في الصفحة الرئيسية وصفحة التسجيل.</p>{!! $err('trial_days') !!}</div>
    </div>
    <label class="sw"><span><b>قفل المواد بعد انتهاء التجربة</b><small>عند الإيقاف تُفتح كل المواد لكل الحسابات دون اشتراك.</small></span><span class="tg"><input type="checkbox" name="gating_enabled" value="1" @checked($on('gating_enabled'))><i></i></span></label>
  </div>
  <div class="card">
    <h3>انتهاء الاشتراك والتذكير</h3>
    <div class="fg">
      <div class="field"><label for="grace_days">أيام السماح بعد انتهاء الاشتراك</label><div class="unit"><input id="grace_days" name="grace_days" inputmode="numeric" data-num value="{{ $n('grace_days') }}" class="@error('grace_days') is-bad @enderror"><span>يومًا</span></div><p class="hint">تبقى المادة مفتوحة خلالها، مع تنبيه بالتجديد.</p>{!! $err('grace_days') !!}</div>
      <div class="field"><label for="reminder_days">التذكير قبل الانتهاء بـ</label><div class="unit"><input id="reminder_days" name="reminder_days" inputmode="numeric" data-num value="{{ $n('reminder_days') }}" class="@error('reminder_days') is-bad @enderror"><span>أيام</span></div><p class="hint">يظهر التنبيه في صفحة «حسابي». صفر يوقفه.</p>{!! $err('reminder_days') !!}</div>
    </div>
  </div>
  <div class="card">
    <h3>طلبات الاشتراك المعلّقة</h3>
    <div class="fg">
      <div class="field"><label for="max_pending">الحد الأقصى للطلبات المفتوحة لكل حساب</label><input id="max_pending" name="max_pending" inputmode="numeric" data-num value="{{ $n('max_pending') }}" class="@error('max_pending') is-bad @enderror">{!! $err('max_pending') !!}</div>
      <div class="field"><label for="pending_expire_days">إلغاء الطلب المعلّق بعد</label><div class="unit"><input id="pending_expire_days" name="pending_expire_days" inputmode="numeric" data-num value="{{ $n('pending_expire_days') }}" class="@error('pending_expire_days') is-bad @enderror"><span>يومًا</span></div><p class="hint">صفر يبقي الطلبات حتى تعالجها يدويًا.</p>{!! $err('pending_expire_days') !!}</div>
    </div>
    <label class="sw"><span><b>الإنهاء التلقائي</b><small>يحوّل الاشتراك المنتهي (بعد أيام السماح) إلى «منتهٍ»، ويلغي الطلبات المعلّقة القديمة. يعمل عند فتح اللوحة، ومع الأمر <span dir="ltr">php artisan subscriptions:expire</span>.</small></span><span class="tg"><input type="checkbox" name="auto_expire" value="1" @checked($on('auto_expire'))><i></i></span></label>
  </div>
  </div>
</section>

{{-- ===== 3) Payment ===== --}}
<section class="panel" id="p-payment" role="tabpanel" aria-labelledby="t-payment" @if($tab!=='payment') hidden @endif>
  <header><span class="pi">@include('partials.admin-icon',['name'=>'wallet'])</span><div><h2>الدفع وواتساب</h2><p>يرسل ولي الأمر طلبه برسالة واتساب جاهزة، ثم تفعّل المواد من «الاشتراكات».</p></div></header>
  <div class="stack">
  <div class="card"><div class="fg">
    <div class="field"><label for="whatsapp_number">رقم واتساب لاستقبال الطلبات</label><input id="whatsapp_number" name="whatsapp_number" dir="ltr" inputmode="tel" value="{{ $v('whatsapp_number') }}" placeholder="970599000000" class="@error('whatsapp_number') is-bad @enderror"><p class="hint">بالصيغة الدولية دون علامة + أو أصفار بادئة.</p>{!! $err('whatsapp_number') !!}</div>
    <div class="field"><label for="currency">العملة</label><input id="currency" name="currency" value="{{ $v('currency') }}" maxlength="10" class="@error('currency') is-bad @enderror"><p class="hint">تظهر بجانب كل سعر، مثل «شيكل».</p>{!! $err('currency') !!}</div>
  </div></div>
  <div class="card">
    <h3>@include('partials.admin-icon',['name'=>'chat'])نص رسالة واتساب</h3>
    <p class="sub">اضغط على أي متغيّر لإدراجه في موضع المؤشر. يُستبدل بالقيمة الفعلية لكل طلب.</p>
    <div class="field" style="margin-top:0"><label for="whatsapp_template">القالب</label><textarea id="whatsapp_template" name="whatsapp_template" rows="9" maxlength="2000" class="@error('whatsapp_template') is-bad @enderror">{{ $v('whatsapp_template') }}</textarea>{!! $err('whatsapp_template') !!}
      <div class="ph" id="ph">@foreach ($placeholders as $k => $l)<button type="button" data-ph="{{ $k }}"><code>{{ $k }}</code>{{ $l }}</button>@endforeach</div></div>
    <p style="font-weight:800;margin:16px 0 6px">معاينة بمثال</p><div class="pv-wa" id="pv-wa" aria-live="polite"></div>
  </div>
  <div class="card">
    <h3>تعليمات الدفع لأولياء الأمور</h3>
    <div class="field" style="margin-top:0"><label for="payment_instructions">تظهر في صفحة الاشتراك وفي قسم الأسعار بالصفحة الرئيسية</label><textarea id="payment_instructions" name="payment_instructions" rows="4" maxlength="1000" class="@error('payment_instructions') is-bad @enderror">{{ $v('payment_instructions') }}</textarea>{!! $err('payment_instructions') !!}</div>
  </div>
  </div>
</section>

{{-- ===== 4) Identity ===== --}}
<section class="panel" id="p-identity" role="tabpanel" aria-labelledby="t-identity" @if($tab!=='identity') hidden @endif>
  <header><span class="pi">@include('partials.admin-icon',['name'=>'home'])</span><div><h2>الهوية والصفحة الرئيسية</h2><p>تقرأ الصفحة الرئيسية هذه النصوص من قاعدة البيانات، وتعرض نصوصها الأصلية إن تعذّر الاتصال.</p></div></header>
  <div class="stack">
  <div class="card"><h3>الهوية</h3><div class="fg">
    <div class="field"><label for="site_name">اسم الموقع</label><input id="site_name" name="site_name" value="{{ $v('site_name') }}" maxlength="80" class="@error('site_name') is-bad @enderror">{!! $err('site_name') !!}</div>
    <div class="field"><label for="tagline">الشعار</label><input id="tagline" name="tagline" value="{{ $v('tagline') }}" maxlength="160" class="@error('tagline') is-bad @enderror">{!! $err('tagline') !!}</div>
  </div></div>
  <div class="card"><h3>واجهة الصفحة الرئيسية</h3><div class="fg">
    <div class="field"><label for="hero_badge">الشارة فوق العنوان</label><input id="hero_badge" name="hero_badge" value="{{ $v('hero_badge') }}" maxlength="80" class="@error('hero_badge') is-bad @enderror">{!! $err('hero_badge') !!}</div>
    <div class="field"><label for="hero_title">العنوان الرئيسي</label><input id="hero_title" name="hero_title" value="{{ $v('hero_title') }}" maxlength="80" class="@error('hero_title') is-bad @enderror">{!! $err('hero_title') !!}</div>
    <div class="field"><label for="hero_title_mark">السطر المميّز تحت العنوان</label><input id="hero_title_mark" name="hero_title_mark" value="{{ $v('hero_title_mark') }}" maxlength="80" class="@error('hero_title_mark') is-bad @enderror"><p class="hint">يظهر بلون مميّز، ويمكن تركه فارغًا.</p>{!! $err('hero_title_mark') !!}</div>
  </div>
    <div class="field"><label for="hero_subtitle">الوصف تحت العنوان</label><textarea id="hero_subtitle" name="hero_subtitle" rows="3" maxlength="400" class="@error('hero_subtitle') is-bad @enderror">{{ $v('hero_subtitle') }}</textarea>{!! $err('hero_subtitle') !!}</div>
  </div>
  <div class="card"><h3>@include('partials.admin-icon',['name'=>'megaphone'])شريط الإعلان</h3>
    <label class="sw"><span><b>إظهار الإعلان</b><small>يظهر أعلى الصفحة الرئيسية وصفحات الدروس والحساب، ويستطيع الزائر إخفاءه.</small></span><span class="tg"><input type="checkbox" name="announcement_active" value="1" @checked($on('announcement_active'))><i></i></span></label>
    <div class="field"><label for="announcement">نص الإعلان</label><textarea id="announcement" name="announcement" rows="2" maxlength="500" class="@error('announcement') is-bad @enderror">{{ $v('announcement') }}</textarea>{!! $err('announcement') !!}</div>
    <div class="field"><span style="display:block;font-weight:800;margin-bottom:6px">اللون</span><div class="colors">@foreach ($colors as $k => $c)<label><input type="radio" name="announcement_color" value="{{ $k }}" @checked($v('announcement_color')===$k) data-bg="{{ $c['bg'] }}" data-line="{{ $c['line'] }}" data-ink="{{ $c['ink'] }}"><i style="background:{{ $c['bg'] }};border-color:{{ $c['line'] }}"></i>{{ $c['label'] }}</label>@endforeach</div></div>
    <div class="fg">
      <div class="field"><label for="announcement_link">رابط «التفاصيل» (اختياري)</label><input id="announcement_link" name="announcement_link" dir="ltr" value="{{ $v('announcement_link') }}" placeholder="https://" class="@error('announcement_link') is-bad @enderror">{!! $err('announcement_link') !!}</div>
      <div class="field"><label for="announcement_from">يبدأ العرض من</label><input id="announcement_from" name="announcement_from" type="datetime-local" value="{{ $v('announcement_from') }}" class="@error('announcement_from') is-bad @enderror"><p class="hint">بتوقيت فلسطين. فارغ يعني فورًا.</p>{!! $err('announcement_from') !!}</div>
      <div class="field"><label for="announcement_to">ينتهي العرض في</label><input id="announcement_to" name="announcement_to" type="datetime-local" value="{{ $v('announcement_to') }}" class="@error('announcement_to') is-bad @enderror"><p class="hint">فارغ يعني دون نهاية.</p>{!! $err('announcement_to') !!}</div>
    </div>
    <p style="font-weight:800;margin:6px 0">معاينة</p><div class="pv-ann" id="pv-ann"></div>
  </div>
  <div class="card"><h3>الأسئلة الشائعة</h3>
    <p class="sub">تظهر في قسم «قبل أن تبدأ» بالصفحة الرئيسية. اكتب <span dir="ltr">{days}</span> لمدة الاشتراك و<span dir="ltr">{trial_days}</span> لمدة التجربة.</p>
    <div id="faq">
    @foreach (old('faq', $faq) as $i => $f)
      <div class="faq-i"><div class="fh"><b data-faqn>السؤال {{ $ar::num($loop->iteration) }}</b><button type="button" class="ibtn" data-up aria-label="انقل السؤال للأعلى">@include('partials.admin-icon',['name'=>'up'])</button><button type="button" class="ibtn" data-down aria-label="انقل السؤال للأسفل">@include('partials.admin-icon',['name'=>'down'])</button><button type="button" class="ibtn" data-del aria-label="احذف السؤال">@include('partials.admin-icon',['name'=>'trash'])</button></div>
        <div class="field"><label>السؤال</label><input name="faq[{{ $i }}][q]" value="{{ $f['q'] ?? '' }}" maxlength="200" class="@error("faq.$i.q") is-bad @enderror">{!! $err("faq.$i.q") !!}</div>
        <div class="field"><label>الجواب</label><textarea name="faq[{{ $i }}][a]" rows="3" maxlength="1200" class="@error("faq.$i.a") is-bad @enderror">{{ $f['a'] ?? '' }}</textarea>{!! $err("faq.$i.a") !!}</div></div>
    @endforeach
    </div>{!! $err('faq') !!}
    <button type="button" class="btn ghost small" id="faq-add">@include('partials.admin-icon',['name'=>'plus'])أضف سؤالًا</button>
  </div>
  </div>
</section>

{{-- ===== 5) Accounts ===== --}}
<section class="panel" id="p-accounts" role="tabpanel" aria-labelledby="t-accounts" @if($tab!=='accounts') hidden @endif>
  <header><span class="pi">@include('partials.admin-icon',['name'=>'shield'])</span><div><h2>الحسابات والأمان</h2><p>من يستطيع التسجيل، وشروط فتح الدروس، ومدة بقاء الجلسة.</p></div></header>
  <div class="stack">
  <div class="card">
    <label class="sw"><span><b>التسجيل مفتوح للحسابات الجديدة</b><small>عند الإغلاق تختفي روابط التسجيل ويُرفض إنشاء الحسابات.</small></span><span class="tg"><input type="checkbox" name="registration_open" value="1" @checked($on('registration_open'))><i></i></span></label>
    <label class="sw"><span><b>اشتراط تفعيل البريد قبل فتح الدروس</b><small>يبقى الحساب مقفلًا حتى يضغط ولي الأمر رابط التفعيل. تأكّد من تشغيل رسالة التفعيل في <a href="{{ route('manage.mail') }}">إعدادات البريد</a>.</small></span><span class="tg"><input type="checkbox" name="require_verification" value="1" @checked($on('require_verification'))><i></i></span></label>
    <label class="sw"><span><b>جهاز واحد لكل حساب</b><small>يبقى الحساب مفتوحًا على آخر جهاز سجّل الدخول فقط، وتُغلق الجلسة على الجهاز السابق عند اتصاله التالي. لا يشمل حسابات المشرفين.</small></span><span class="tg"><input type="checkbox" name="single_device" value="1" @checked($on('single_device'))><i></i></span></label>
  </div>
  <div class="card"><div class="fg">
    <div class="field"><label for="max_students">الحد الأقصى للطلاب في حساب ولي الأمر</label><input id="max_students" name="max_students" inputmode="numeric" data-num value="{{ $n('max_students') }}" class="@error('max_students') is-bad @enderror">{!! $err('max_students') !!}</div>
    <div class="field"><label for="session_minutes">مدة الجلسة دون نشاط</label><div class="unit"><input id="session_minutes" name="session_minutes" inputmode="numeric" data-num value="{{ $n('session_minutes') }}" placeholder="{{ $ar::num($serverSession) }}" class="@error('session_minutes') is-bad @enderror"><span>دقيقة</span></div><p class="hint">فارغ يعني إعداد الخادم ({{ $ar::num($serverSession) }} دقيقة). الحد الأدنى ربع ساعة. خيار «تذكّرني» يبقي الدخول أطول.</p>{!! $err('session_minutes') !!}</div>
  </div></div>
  </div>
</section>

{{-- ===== 6) Voice ===== --}}
<section class="panel" id="p-voice" role="tabpanel" aria-labelledby="t-voice" @if($tab!=='voice') hidden @endif>
  <header><span class="pi">@include('partials.admin-icon',['name'=>'volume'])</span><div><h2>الجولة الصوتية</h2><p>زيتون يرافق الزائر في الصفحة الرئيسية ويشرح أقسامها بصوته.</p></div></header>
  <div class="card">
    <label class="sw"><span><b>تشغيل الجولة الصوتية</b><small>عند الإيقاف يختفي زرّ «استمع إلى جولة البستان» تمامًا.</small></span><span class="tg"><input type="checkbox" name="voice_enabled" value="1" @checked($on('voice_enabled'))><i></i></span></label>
    <label class="sw"><span><b>البدء تلقائيًا</b><small>يحاول بدء الترحيب عند فتح الصفحة أو عند أول لمسة. عند الإيقاف لا يبدأ إلا بضغط الزرّ.</small></span><span class="tg"><input type="checkbox" name="voice_autoplay" value="1" @checked($on('voice_autoplay'))><i></i></span></label>
    <div class="field"><label for="voice_volume">مستوى الصوت</label><div class="range"><input type="range" id="voice_volume" name="voice_volume" min="0" max="100" step="5" value="{{ old('voice_volume', $s['voice_volume']) }}"><output for="voice_volume" id="vol-out">{{ $ar::num(old('voice_volume', $s['voice_volume'])) }}٪</output></div>{!! $err('voice_volume') !!}</div>
  </div>
</section>

{{-- ===== 7) Contact ===== --}}
<section class="panel" id="p-contact" role="tabpanel" aria-labelledby="t-contact" @if($tab!=='contact') hidden @endif>
  <header><span class="pi">@include('partials.admin-icon',['name'=>'globe'])</span><div><h2>التواصل والتذييل</h2><p>تظهر الروابط في تذييل الصفحة الرئيسية، ولا يظهر الرابط الفارغ.</p></div></header>
  <div class="card"><div class="fg">
    <div class="field"><label for="facebook_url">صفحة فيسبوك</label><input id="facebook_url" name="facebook_url" dir="ltr" value="{{ $v('facebook_url') }}" placeholder="https://facebook.com/…" class="@error('facebook_url') is-bad @enderror">{!! $err('facebook_url') !!}</div>
    <div class="field"><label for="instagram_url">حساب إنستغرام</label><input id="instagram_url" name="instagram_url" dir="ltr" value="{{ $v('instagram_url') }}" placeholder="https://instagram.com/…" class="@error('instagram_url') is-bad @enderror">{!! $err('instagram_url') !!}</div>
    <div class="field"><label for="contact_email">بريد التواصل</label><input id="contact_email" name="contact_email" type="email" dir="ltr" value="{{ $v('contact_email') }}" placeholder="info@bustankids.com" class="@error('contact_email') is-bad @enderror">{!! $err('contact_email') !!}</div>
  </div>
    <div class="field"><label for="footer_text">نص التذييل</label><input id="footer_text" name="footer_text" value="{{ $v('footer_text') }}" maxlength="300" class="@error('footer_text') is-bad @enderror">{!! $err('footer_text') !!}</div>
  </div>
</section>

{{-- ===== 8) Maintenance ===== --}}
<section class="panel" id="p-maintenance" role="tabpanel" aria-labelledby="t-maintenance" @if($tab!=='maintenance') hidden @endif>
  <header><span class="pi">@include('partials.admin-icon',['name'=>'wrench'])</span><div><h2>وضع الصيانة</h2><p>يوقف الدروس والحسابات للزوار وأولياء الأمور مؤقتًا. المشرفون والمعلّمون يتجاوزونه، وتبقى صفحة الدخول متاحة.</p></div></header>
  <div class="card @if($on('maintenance_on')) maint-on @endif" id="maint-card">
    <label class="sw"><span><b>تفعيل وضع الصيانة</b><small>تظهر رسالة الصيانة بدل الدروس وصفحات «حسابي» والاشتراك.</small></span><span class="tg"><input type="checkbox" name="maintenance_on" value="1" id="maintenance_on" @checked($on('maintenance_on'))><i></i></span></label>
    <div class="field"><label for="maintenance_message">رسالة الصيانة</label><textarea id="maintenance_message" name="maintenance_message" rows="3" maxlength="600" class="@error('maintenance_message') is-bad @enderror">{{ $v('maintenance_message') }}</textarea>{!! $err('maintenance_message') !!}</div>
  </div>
  <div class="card mail-link" style="margin-top:18px">@include('partials.admin-icon',['name'=>'mail'])<p><b>إعدادات البريد</b><br><small style="color:var(--muted);font-weight:600">رسائل التفعيل وإعادة التعيين والترحيب، وسجلّ الإرسال.</small></p><a class="btn ghost small" href="{{ route('manage.mail') }}">افتح إعدادات البريد</a></div>
</section>
</div>
</div>

<div class="sbar" id="sbar"><p class="st"><i aria-hidden="true"></i><span id="sbar-t" aria-live="polite">كل الإعدادات محفوظة.</span></p>
  <button type="button" class="btn ghost small" id="undo" hidden>تراجع عن التغييرات</button>
  <button class="btn" type="submit" id="save">@include('partials.admin-icon',['name'=>'save'])حفظ الإعدادات</button></div>
</form>

<template id="t-faq"><div class="faq-i"><div class="fh"><b data-faqn></b><button type="button" class="ibtn" data-up aria-label="انقل السؤال للأعلى">@include('partials.admin-icon',['name'=>'up'])</button><button type="button" class="ibtn" data-down aria-label="انقل السؤال للأسفل">@include('partials.admin-icon',['name'=>'down'])</button><button type="button" class="ibtn" data-del aria-label="احذف السؤال">@include('partials.admin-icon',['name'=>'trash'])</button></div>
  <div class="field"><label>السؤال</label><input data-k="q" maxlength="200"></div><div class="field"><label>الجواب</label><textarea data-k="a" rows="3" maxlength="1200"></textarea></div></div></template>
<template id="t-trash">@include('partials.admin-icon',['name'=>'trash'])</template>

<script>
(function(){
var f=document.getElementById('sf'),AR='٠١٢٣٤٥٦٧٨٩',GW=@json($ar::GRADE_WORDS),SUBJ=@json($subjectsList),CUR=@json($s['currency']);
var ar=function(x){return String(x).replace(/[0-9]/g,function(d){return AR[d]})},en=function(x){return String(x).replace(/[٠-٩]/g,function(d){return AR.indexOf(d)}).replace(/[۰-۹]/g,function(d){return '۰۱۲۳۴۵۶۷۸۹'.indexOf(d)})};
// tabs
var tabs=[].slice.call(document.querySelectorAll('[data-tab]'));
function go(k,push){tabs.forEach(function(t){var on=t.dataset.tab===k;t.setAttribute('aria-selected',on);t.tabIndex=on?0:-1;document.getElementById('p-'+t.dataset.tab).hidden=!on});
 document.getElementById('tabf').value=k;if(push!==false)history.replaceState(null,'','?tab='+k);
 var cur=document.getElementById('t-'+k);if(cur&&cur.scrollIntoView&&innerWidth<=900)cur.scrollIntoView({block:'nearest',inline:'center'})}
tabs.forEach(function(t,i){t.addEventListener('click',function(){go(t.dataset.tab)});t.addEventListener('keydown',function(e){var d=e.key==='ArrowLeft'?1:e.key==='ArrowRight'?-1:0;if(d){var n=tabs[(i+d+tabs.length)%tabs.length];n.focus();go(n.dataset.tab)}})});
go(document.getElementById('tabf').value,false);
// arabic-indic digits in numeric inputs
function numify(el){el.addEventListener('input',function(){var p=el.selectionStart,v=ar(el.value.replace(/[^0-9٠-٩۰-۹]/g,''));if(v!==el.value){el.value=v;try{el.setSelectionRange(p,p)}catch(e){}}})}
[].forEach.call(document.querySelectorAll('[data-num]'),numify);
// dirty tracking
var snap=new FormData(f),initial={};snap.forEach(function(v,k){initial[k]=(initial[k]||'')+'\u0001'+v});
var sbar=document.getElementById('sbar'),st=document.getElementById('sbar-t'),undo=document.getElementById('undo'),dirty=false,saving=false;
function state(){var now={},n=0,tabsDirty={};new FormData(f).forEach(function(v,k){now[k]=(now[k]||'')+'\u0001'+v});
 var keys={};Object.keys(initial).concat(Object.keys(now)).forEach(function(k){keys[k]=1});
 Object.keys(keys).forEach(function(k){if(k==='tab')return;if(initial[k]!==now[k]){n++;var el=f.querySelector('[name="'+k.replace(/"/g,'\\"')+'"]'),p=el&&el.closest('.panel');if(p)tabsDirty[p.id.slice(2)]=1;if(k.indexOf('extra')===0)tabsDirty.prices=1;if(k.indexOf('faq')===0)tabsDirty.identity=1}});
 tabs.forEach(function(t){if(tabsDirty[t.dataset.tab])t.setAttribute('data-dirty','');else t.removeAttribute('data-dirty')});
 dirty=n>0;sbar.classList.toggle('dirty',dirty);undo.hidden=!dirty;
 var nt=Object.keys(tabsDirty).length||1;st.textContent=dirty?'لديك تغييرات غير محفوظة '+(nt===1?'في قسم واحد':nt===2?'في قسمين':'في '+ar(nt)+(nt<=10?' أقسام':' قسمًا'))+'.':'كل الإعدادات محفوظة.'}
f.addEventListener('input',state);f.addEventListener('change',state);
addEventListener('beforeunload',function(e){if(dirty&&!saving){e.preventDefault();e.returnValue='';return ''}});
document.addEventListener('click',function(e){var a=e.target.closest&&e.target.closest('a[href]');if(a&&dirty&&!saving&&!a.target&&!confirm('لديك تغييرات غير محفوظة. هل تريد مغادرة الصفحة دون حفظها؟'))e.preventDefault()},true);
undo.addEventListener('click',function(){if(confirm('سيُعاد تحميل الصفحة وتُهمل التغييرات غير المحفوظة. هل تتابع؟')){saving=true;location.reload()}});
// client validation, then ASCII digits for the server
function bad(el,msg){el.classList.add('is-bad');var p=el.closest('.field')||el.closest('.prow>div')||el.parentNode,m=p.querySelector('.ferr.js');if(!m){m=document.createElement('p');m.className='ferr js';m.setAttribute('role','alert');p.append(m)}m.textContent=msg;return el}
f.addEventListener('submit',function(e){[].forEach.call(f.querySelectorAll('.ferr.js'),function(m){m.remove()});[].forEach.call(f.querySelectorAll('.is-bad'),function(x){x.classList.remove('is-bad')});
 var first=null,lim={trial_days:[0,90],grace_days:[0,60],reminder_days:[0,60],max_pending:[1,50],pending_expire_days:[0,365],max_students:[1,50],session_minutes:[15,525600]};
 [].forEach.call(f.querySelectorAll('[data-num][name]'),function(el){var v=en(el.value).trim(),k=el.name,r=lim[k]||(/\[price\]$/.test(k)?[1,100000]:/\[days\]$/.test(k)?[1,1000]:null);
  if(!r)return;if(v===''){if(k!=='session_minutes')first=first||bad(el,'هذا الحقل مطلوب.');return}
  if(+v<r[0]||+v>r[1])first=first||bad(el,'اكتب عددًا من '+ar(r[0])+' إلى '+ar(r[1])+'.')});
 var w=f.whatsapp_number;if(w.value.trim()&&!/^\+?[0-9 ]{8,20}$/.test(en(w.value.trim())))first=first||bad(w,'اكتب رقم واتساب بالصيغة الدولية بأرقام فقط، مثل 970599000000.');
 ['site_name','hero_title','hero_subtitle','currency','whatsapp_template','maintenance_message'].forEach(function(k){if(!f[k].value.trim())first=first||bad(f[k],'هذا الحقل مطلوب.')});
 ['announcement_link','facebook_url','instagram_url'].forEach(function(k){var x=f[k].value.trim();if(x&&!/^https?:\/\/\S+\.\S+/.test(x))first=first||bad(f[k],'اكتب رابطًا كاملًا يبدأ بـ https://')});
 var ce=f.contact_email.value.trim();if(ce&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ce))first=first||bad(f.contact_email,'اكتب بريدًا إلكترونيًا صحيحًا.');
 if(f.announcement_from.value&&f.announcement_to.value&&f.announcement_to.value<=f.announcement_from.value)first=first||bad(f.announcement_to,'يجب أن تكون نهاية العرض بعد بدايته.');
 [].forEach.call(f.querySelectorAll('#faq input,#faq textarea'),function(x){if(!x.value.trim())first=first||bad(x,'اكتب السؤال وجوابه، أو احذف السؤال.')});
 if(first){e.preventDefault();var p=first.closest('.panel');if(p)go(p.id.slice(2));first.focus();st.textContent='صحّح الحقول المعلَّمة بالأحمر قبل الحفظ.';return}
 [].forEach.call(f.querySelectorAll('[data-num][name]'),function(el){el.value=en(el.value)});saving=true;document.getElementById('save').disabled=true;st.textContent='جارٍ الحفظ…'});
// prices: bulk set, copy, toggle, add/remove units
function rows(g){return [].slice.call(document.querySelectorAll('.gcard[data-grade="'+g+'"] .prow'))}
function fire(el){el.dispatchEvent(new Event('input',{bubbles:true}))}
document.getElementById('grades').addEventListener('click',function(e){var b=e.target.closest('[data-bulk]');if(b){var g=b.dataset.bulk,inp=document.getElementById('bulk-'+g),v=en(inp.value).trim();
  if(!v||+v<1){bad(inp,'اكتب سعرًا أولًا.');inp.focus();return}inp.classList.remove('is-bad');rows(g).forEach(function(r){var x=r.querySelector('[name$="[price]"]');x.value=ar(+v);fire(x)});inp.value='';
  document.getElementById('cp-msg').textContent='طُبّق السعر '+ar(+v)+' '+CUR+' على '+GW[g]+'.';return}
 var d=e.target.closest('[data-remove]');if(d){var r=d.closest('.prow'),card=r.closest('.gcard');if(!confirm('حذف هذه المادة المضافة من قائمة الأسعار؟'))return;r.remove();if(!card.querySelector('.prow'))card.remove();else count(card);state()}});
document.getElementById('grades').addEventListener('change',function(e){if(e.target.matches('[name$="[active]"]'))e.target.closest('.prow').classList.toggle('off',!e.target.checked)});
document.getElementById('cp-go').addEventListener('click',function(){var a=document.getElementById('cp-from').value,b=document.getElementById('cp-to').value,msg=document.getElementById('cp-msg');
 if(a===b){msg.textContent='اختر صفين مختلفين.';return}var src={};rows(a).forEach(function(r){src[r.dataset.subject]=r});var n=0,wd=document.getElementById('cp-days').checked;
 rows(b).forEach(function(r){var s=src[r.dataset.subject];if(!s)return;n++;['price'].concat(wd?['days']:[]).forEach(function(k){var x=r.querySelector('[name$="['+k+']"]');x.value=s.querySelector('[name$="['+k+']"]').value;fire(x)})});
 msg.textContent=n?'نُسخت أسعار '+ar(n)+' '+(n>2&&n<=10?'مواد':'مادة')+' من '+GW[a]+' إلى '+GW[b]+'. احفظ لتثبيتها.':'لا توجد مواد مشتركة بين الصفين.'});
function count(card){var n=card.querySelectorAll('.prow').length;card.querySelector('[data-count]').textContent=ar(n)+' '+(n>2&&n<=10?'مواد':'مادة')}
function opt(sel,g){if(sel.querySelector('option[value="'+g+'"]'))return;var o=document.createElement('option');o.value=g;o.textContent=GW[g];var after=[].find.call(sel.options,function(x){return +x.value>g});sel.insertBefore(o,after||null)}
document.getElementById('nu-add').addEventListener('click',function(){var g=+document.getElementById('nu-grade').value,slug=document.getElementById('nu-subj').value,code='g'+g+'-'+slug,msg=document.getElementById('nu-msg'),pi=document.getElementById('nu-price'),price=+en(pi.value)||0;
 if(document.querySelector('.prow[data-code="'+code+'"]')){msg.textContent='«'+SUBJ[slug]+'» موجودة في '+GW[g]+'.';return}
 if(price<1){bad(pi,'اكتب سعرًا أولًا.');return}pi.classList.remove('is-bad');
 var card=document.querySelector('.gcard[data-grade="'+g+'"]');
 if(!card){var tpl=document.querySelector('.gcard');card=tpl.cloneNode(true);card.dataset.grade=g;[].forEach.call(card.querySelectorAll('.prow'),function(r){r.remove()});
  card.querySelector('h3').textContent=GW[g];var bi=card.querySelector('.tools input'),bb=card.querySelector('[data-bulk]');bi.id='bulk-'+g;bi.value='';bi.setAttribute('aria-label','سعر موحّد لـ'+GW[g]);bb.dataset.bulk=g;numify(bi);
  var next=[].find.call(document.querySelectorAll('.gcard'),function(c){return +c.dataset.grade>g});document.getElementById('grades').insertBefore(card,next||null);
  opt(document.getElementById('cp-from'),g);opt(document.getElementById('cp-to'),g)}
 var r=document.createElement('div');r.className='prow off';r.dataset.code=code;r.dataset.subject=SUBJ[slug];
 r.innerHTML='<div class="pname"><span><b></b><small>مادة مضافة — يلزم رفع محتواها قبل إتاحتها</small></span><input type="hidden" name="extra[]"><input type="hidden" data-n><button type="button" class="ibtn" data-remove></button></div>'+
  '<div><label class="l">السعر</label><div class="unit"><input inputmode="numeric" data-num data-k="price"><span></span></div></div><div><label class="l">المدة</label><div class="unit"><input inputmode="numeric" data-num data-k="days"><span>يومًا</span></div></div>'+
  '<div class="act"><span class="tg sm"><input type="checkbox" value="1" data-k="active"><i></i></span></div>';
 r.querySelector('b').textContent=SUBJ[slug];r.querySelector('[name="extra[]"]').value=code;var hn=r.querySelector('[data-n]');hn.name='extra_name['+code+']';hn.value=SUBJ[slug];
 var rm=r.querySelector('[data-remove]');rm.innerHTML=document.getElementById('t-trash').innerHTML;rm.setAttribute('aria-label','احذف '+SUBJ[slug]+' من '+GW[g]);
 r.querySelector('.unit span').textContent=CUR;
 ['price','days','active'].forEach(function(k){var x=r.querySelector('[data-k="'+k+'"]');x.name='prices['+code+']['+k+']';if(k==='price')x.value=ar(price);if(k==='days')x.value=ar(30);x.setAttribute('aria-label',(k==='price'?'سعر ':k==='days'?'مدة ':'إتاحة ')+SUBJ[slug]+' — '+GW[g]);if(k!=='active')numify(x)});
 card.append(r);count(card);state();r.scrollIntoView({block:'center',behavior:'smooth'});r.querySelector('[data-k="price"]').focus();
 msg.textContent='أُضيفت «'+SUBJ[slug]+'» إلى '+GW[g]+' غير متاحة للاشتراك. احفظ الإعدادات لتثبيتها.'});
// whatsapp template preview + placeholders
var tpl=f.whatsapp_template,pv=document.getElementById('pv-wa');
var sample={'{student}':'سلمى','{subjects}':'١) الرياضيات — الصف السادس — ٢٠ '+CUR+' لمدة ٣٠ يومًا\n٢) العلوم — الصف السادس — ٢٠ '+CUR+' لمدة ٣٠ يومًا','{total}':'٤٠ '+CUR,'{code}':'R-7KQ2PA','{parent}':'أحمد خليل','{email}':'parent@example.com','{site}':f.site_name.value};
function wa(){sample['{site}']=f.site_name.value;var t=tpl.value;Object.keys(sample).forEach(function(k){t=t.split(k).join(sample[k])});pv.textContent=t}
tpl.addEventListener('input',wa);f.site_name.addEventListener('input',wa);wa();
document.getElementById('ph').addEventListener('click',function(e){var b=e.target.closest('[data-ph]');if(!b)return;var s=tpl.selectionStart||tpl.value.length,en_=tpl.selectionEnd||s;tpl.setRangeText(b.dataset.ph,s,en_,'end');tpl.focus();fire(tpl)});
// announcement preview
var pa=document.getElementById('pv-ann');
function ann(){var c=f.querySelector('[name=announcement_color]:checked')||f.querySelector('[name=announcement_color]');pa.style.background=c.dataset.bg;pa.style.borderColor=c.dataset.line;pa.style.color=c.dataset.ink;
 pa.textContent=f.announcement.value.trim()||'اكتب نص الإعلان ليظهر هنا.';if(f.announcement_link.value.trim()){var a=document.createElement('u');a.textContent='التفاصيل';pa.append(' ',a)}
 pa.style.opacity=f.announcement_active.checked?1:.55}
['input','change'].forEach(function(ev){f.addEventListener(ev,function(e){if(/^announcement/.test(e.target.name||''))ann()})});ann();
// voice volume
var vol=f.voice_volume,vo=document.getElementById('vol-out');vol.addEventListener('input',function(){vo.textContent=ar(vol.value)+'٪'});
f.maintenance_on.addEventListener('change',function(){document.getElementById('maint-card').classList.toggle('maint-on',f.maintenance_on.checked)});
// faq list
var fq=document.getElementById('faq');
function renum(){[].forEach.call(fq.children,function(it,i){it.querySelector('[data-faqn]').textContent='السؤال '+ar(i+1);[].forEach.call(it.querySelectorAll('input,textarea'),function(x){var k=x.dataset.k||(/\[(q|a)\]$/.exec(x.name)||[])[1];x.dataset.k=k;x.name='faq['+i+']['+k+']'})});state()}
fq.addEventListener('click',function(e){var b=e.target.closest('button');if(!b)return;var it=b.closest('.faq-i');
 if(b.hasAttribute('data-del')){if(confirm('حذف هذا السؤال؟')){it.remove();renum()}}else if(b.hasAttribute('data-up')&&it.previousElementSibling){fq.insertBefore(it,it.previousElementSibling);renum()}else if(b.hasAttribute('data-down')&&it.nextElementSibling){fq.insertBefore(it.nextElementSibling,it);renum()}});
document.getElementById('faq-add').addEventListener('click',function(){if(fq.children.length>=20){alert('الحد الأقصى عشرون سؤالًا.');return}fq.append(document.getElementById('t-faq').content.cloneNode(true));renum();fq.lastElementChild.querySelector('input').focus()});
// toast
var t=document.getElementById('toast');if(t)setTimeout(function(){t.classList.add('hide')},4200);
state();
})();
</script>
@endsection
