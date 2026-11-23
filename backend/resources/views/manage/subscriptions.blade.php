@extends('layouts.manage')
@section('title', 'الاشتراكات')
@php($B = \App\Support\SubscriptionBoard::class)
@php($tz = $B::TZ)
@php($ago = function ($t) use ($ar) { if (! $t) return ''; $m = max(0, (int) $t->diffInMinutes(now())); return $m < 60 ? 'قبل '.$ar::num($m).' دقيقة' : ($m < 1440 ? 'قبل '.$ar::num(intdiv($m, 60)).' ساعة' : 'قبل '.$ar::num(intdiv($m, 1440)).' يوم'); })
@php($left = fn ($d) => $d === null ? '' : ($d < 0 ? 'انتهى قبل '.$ar::num(-$d).' يوم' : ($d === 0 ? 'ينتهي اليوم' : 'باقي '.$ar::num($d).' يوم')))
@section('content')
<style>
.sb-badge{display:inline-flex;align-items:center;gap:5px;padding:2px 10px;border-radius:999px;font-size:12.5px;font-weight:600;white-space:nowrap;background:#e6f2d6;color:#3d6410}
.sb-badge.warn{background:#fff1cc;color:#7a5200}.sb-badge.sky{background:#dceefe;color:#1d4f86}.sb-badge.grey{background:#efeee5;color:#6b6a60}.sb-badge.bad{background:#fbe3e1;color:#8a2a24}
.sb-req{display:grid;gap:12px}.sb-req article{border:1px solid #f0d37a;background:#fffaf0;border-radius:18px;padding:14px;display:grid;gap:8px}
.sb-req .sb-top{display:flex;flex-wrap:wrap;justify-content:space-between;gap:8px;align-items:baseline}.sb-req .sb-top b{font-size:17px}
.sb-meta{color:var(--muted);font-size:14px;display:flex;flex-wrap:wrap;gap:4px 14px}.sb-meta a{color:inherit}
.sb-subj{display:flex;flex-wrap:wrap;gap:6px}.sb-subj span{background:#fff;border:1px solid var(--line);border-radius:10px;padding:2px 9px;font-size:14px}
.sb-total{font-size:19px;font-weight:700;font-variant-numeric:tabular-nums}.sb-acts{display:flex;flex-wrap:wrap;gap:8px;align-items:center}.sb-acts form{margin:0}
.sb-fam{background:#fff;border:1px solid var(--line);border-radius:var(--r);box-shadow:var(--sh);overflow:hidden}
.fam{border-bottom:1px solid var(--line2)}.fam:last-child{border-bottom:0}.fam.has-pending{box-shadow:inset -3px 0 0 var(--sun)}
.fam-row{display:grid;grid-template-columns:minmax(150px,1.4fr) minmax(110px,1fr) minmax(170px,1.6fr) 120px minmax(90px,auto) 18px;gap:12px;align-items:center;padding:12px 18px;cursor:pointer;list-style:none}
.fam-row::-webkit-details-marker{display:none}.fam-row:hover{background:#f9fbf6}
.fam-row:after{content:"";width:8px;height:8px;border:solid var(--muted);border-width:0 0 2px 2px;transform:rotate(-45deg);justify-self:center;transition:transform .15s}.fam[open]>.fam-row:after{transform:rotate(-135deg)}
.fam-who{display:flex;flex-direction:column;min-width:0}.fam-who small{color:var(--muted);font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;text-align:right;unicode-bidi:plaintext}
.fam-kids,.fam-states{display:flex;flex-wrap:wrap;gap:6px}.fam-end{font-size:13.5px;color:var(--muted)}.fam-end.soon{color:#7a5200;font-weight:600}
.fam-body{display:grid;gap:12px;padding:6px 18px 16px;background:#fcfdfa;border-top:1px dashed var(--line2)}
.sb-kid{border-top:1px dashed var(--line);padding-top:10px;display:grid;gap:8px}.sb-kid h4{margin:0;font-size:16px;display:flex;flex-wrap:wrap;gap:8px;align-items:center}
.sb-row{display:grid;grid-template-columns:minmax(8em,1fr) auto minmax(9em,auto) auto;gap:6px 12px;align-items:center;padding:8px 10px;border-radius:12px;background:#faf9f3}
.sb-row.flag{background:#fdf0ee;outline:1px solid #f1c0bb}.sb-row .when{font-size:13px;color:var(--muted)}.sb-row .code{font-size:11px;color:var(--muted)}
.sb-row details summary{cursor:pointer;font-size:13px;font-weight:700;color:var(--gd)}.sb-row details form{display:flex;gap:6px;align-items:center;margin-top:6px}
.sb-prob{margin:6px 0 0;padding-inline-start:20px;color:#8a2a24;font-size:14px}.sb-prob li{margin:2px 0}
.sb-wa{color:#1a7f37;font-weight:700}
input.sb-days{width:70px}
@media (max-width:900px){.fam-row{grid-template-columns:minmax(0,1fr) auto 18px;gap:6px 10px}.fam-kids,.fam-states,.fam-end{grid-column:1/-1}.fam-flag{grid-row:1;grid-column:2}}
@media (max-width:640px){.sb-row{grid-template-columns:1fr auto}.sb-row .when{grid-column:1/-1}.sb-row .rowacts{grid-column:1/-1}.stats{grid-template-columns:1fr 1fr;gap:10px}.stat{padding:10px;gap:8px;grid-template-columns:40px minmax(0,1fr)}.stat .ic{width:40px;height:40px}.stat b{font-size:22px}.stat span{font-size:13px}}
</style>
<div class="head"><h1>الاشتراكات</h1><a class="btn ghost small" href="{{ route('manage.export','subscriptions') }}">@include('partials.admin-icon',['name'=>'download'])تصدير CSV</a></div>
<p class="hint" style="margin:-6px 0 14px">كل عائلة في سطر: افتحه لترى أطفالها وموادّ كل طفل. الأوقات بتوقيت فلسطين (الخليل).</p>

<div class="stats" style="margin-bottom:18px">
  <div class="stat"><span class="ic">@include('partials.admin-icon',['name'=>'check'])</span><span class="txt"><b>{{ $ar::num($summary['active']) }}</b><span>اشتراك فعّال، {{ $ar::num($summary['active_families']) }} عائلة</span></span></div>
  <div class="stat t-sky"><span class="ic">@include('partials.admin-icon',['name'=>'star'])</span><span class="txt"><b>{{ $ar::num($summary['trials']) }}</b><span>عائلة في التجربة المجانية</span></span></div>
  <div class="stat t-sun" data-card="pending"><span class="ic">@include('partials.admin-icon',['name'=>'wallet'])</span><span class="txt"><b>{{ $ar::num($summary['pending_requests']) }}</b><span>طلب بانتظار الدفع، {{ $ar::money($summary['pending_total']) }}</span></span></div>
  <div class="stat t-o"><span class="ic">@include('partials.admin-icon',['name'=>'clock'])</span><span class="txt"><b>{{ $ar::num($summary['expiring']) }}</b><span>ينتهي خلال 7 أيام</span></span></div>
  <div class="stat t-grey"><span class="ic">@include('partials.admin-icon',['name'=>'card'])</span><span class="txt"><b>{{ $ar::money($summary['revenue_month']) }}</b><span>إيراد هذا الشهر ({{ $ar::num($summary['revenue_count']) }} تفعيل)</span></span></div>
</div>

<section class="card" id="pending">
  <h2>@include('partials.admin-icon',['name'=>'wallet'])طلبات بانتظار التفعيل</h2>
  <p class="hint">بعد وصول المبلغ عبر واتساب اضغط «تفعيل الطلب» فتُفعَّل كل مواد الطلب مرة واحدة. «رفض» يلغي الطلب دون حذف بياناته.</p>
  @if ($requests->isEmpty())<p class="empty">لا طلبات بانتظار التفعيل الآن.</p>@else
  <div class="sb-req">
  @foreach ($requests as $r)
    <article data-request="{{ $r->key }}">
      <div class="sb-top"><b>@if ($r->user)<a href="{{ route('manage.user', $r->user) }}">{{ $r->user->name }}</a>@else عائلة محذوفة @endif</b><span class="sb-total">{{ $ar::money($r->total, $r->currency) }}</span></div>
      <div class="sb-meta">
        @if ($r->user)<a dir="ltr" href="mailto:{{ $r->user->email }}">{{ $r->user->email }}</a>@endif
        <span>@if ($r->student)الطفل: <b>{{ $r->student->name }}</b>، {{ $ar::grade($r->student->grade) }}@else<span class="sb-badge bad">بدون طفل محدد</span>@endif</span>
        <span title="{{ $ar::date($r->created_at, true, $tz) }}">طُلب {{ $ar::date($r->created_at, true, $tz) }} ({{ $ago($r->created_at) }})</span>
        <span class="mono" dir="ltr">{{ $r->key }}</span>
      </div>
      <div class="sb-subj">@foreach ($r->rows as $s)<span>{{ $B::planSubject($s->plan, $s->plan_name) }} — {{ $ar::grade($B::planGrade($s->plan)) }}: {{ $ar::money($s->price, $s->currency) }}</span>@endforeach</div>
      @if ($r->student && collect($r->grades)->contains(fn ($g) => (int) $g !== (int) $r->student->grade))<div class="sb-prob">تنبيه: بعض المواد لصف غير صف الطفل ({{ $ar::grade($r->student->grade) }}).</div>@endif
      <div class="sb-acts">
        <form method="post" action="{{ route('manage.subscriptions.bulk') }}" onsubmit="return confirm('تأكيد استلام {{ $ar::money($r->total, $r->currency) }} وتفعيل الطلب؟')">@csrf<input type="hidden" name="action" value="activate">@foreach ($r->ids as $id)<input type="hidden" name="ids[]" value="{{ $id }}">@endforeach<button class="btn small" type="submit">@include('partials.admin-icon',['name'=>'check'])تفعيل الطلب ({{ $ar::num($r->days) }} يوم)</button></form>
        <form method="post" action="{{ route('manage.subscriptions.bulk') }}" onsubmit="return confirm('رفض هذا الطلب؟')">@csrf<input type="hidden" name="action" value="cancel">@foreach ($r->ids as $id)<input type="hidden" name="ids[]" value="{{ $id }}">@endforeach<button class="btn ghost small" type="submit">رفض</button></form>
      </div>
    </article>
  @endforeach
  </div>@endif
</section>

<form class="filters" method="get" style="margin-top:18px">
  <div><label for="q">بحث</label><input id="q" name="q" value="{{ $f['q'] }}" placeholder="اسم العائلة أو الطفل أو البريد أو رمز الطلب"></div>
  <div><label for="status">الحالة</label><select id="status" name="status">@foreach ($B::FILTERS as $k => $v)<option value="{{ $k }}" @selected($f['status']===$k)>{{ $v }}</option>@endforeach</select></div>
  <div><label for="grade">الصف</label><select id="grade" name="grade"><option value="">كل الصفوف</option>@foreach ($grades as $g => $name)<option value="{{ $g }}" @selected($f['grade']===$g)>{{ $name }}</option>@endforeach</select></div>
  <div class="go"><button class="btn small" type="submit">@include('partials.admin-icon',['name'=>'search'])تصفية</button>@if ($f['q'] || $f['status'] !== 'action' || $f['grade'])<a class="btn ghost small" href="{{ route('manage.subscriptions') }}">مسح</a>@endif</div>
</form>

<p class="hint">{{ $ar::num($families->total()) }} عائلة @if ($f['status'] === 'action')تحتاج إجراءً · <a href="{{ route('manage.subscriptions', ['status' => 'all']) }}">عرض كل العائلات</a>@endif</p>
<div class="sb-fam">
@forelse ($families as $fam)
  @php($u = $fam->user)
  @php($counts = collect($fam->rows)->countBy(fn ($row) => $B::state($row)))
  @php($nextEnd = collect($fam->rows)->filter(fn ($row) => $B::state($row) === 'active' && $row->ends_at)->min('ends_at'))
  <details class="fam {{ $fam->pending ? 'has-pending' : '' }}" data-family="{{ $u->id }}" @if ($fam->pending) open @endif>
    <summary class="fam-row">
      <span class="fam-who"><b><a href="{{ route('manage.user', $u) }}">{{ $u->name }}</a></b><small dir="ltr">{{ $u->email }}</small></span>
      <span class="fam-kids">@forelse ($fam->children as $c)<span class="sb-badge grey">{{ $c->student->name }}</span>@empty<span class="hint">بلا أطفال</span>@endforelse</span>
      <span class="fam-states">@foreach (['pending', 'active', 'expired', 'cancelled'] as $stt)@if ($counts[$stt] ?? 0)<span class="sb-badge {{ $B::STATES[$stt][1] }}">{{ $ar::num($counts[$stt]) }} {{ $B::STATES[$stt][0] }}</span> @endif @endforeach @if ($fam->trial)<span class="sb-badge sky">تجربة حتى {{ $ar::date($fam->trial, false, $tz) }}</span>@endif</span>
      <span class="fam-end {{ $fam->expiring ? 'soon' : '' }}">@if ($nextEnd){{ $left($B::daysLeft(\Illuminate\Support\Carbon::parse($nextEnd))) }}@endif</span>
      <span class="fam-flag">@if ($fam->problems)<span class="sb-badge bad">{{ $ar::num(count($fam->problems)) }} {{ count($fam->problems) === 1 ? 'ملاحظة' : 'ملاحظات' }}</span>@endif</span>
    </summary>
    <div class="fam-body">
    @if ($fam->problems)<ul class="sb-prob">@foreach ($fam->problems as $p)<li>{{ $p }}</li>@endforeach</ul>@endif
    @php($groups = collect($fam->children)->map(fn ($c) => ['title' => $c->student->name, 'grade' => $c->student->grade, 'items' => $c->items, 'trial' => $c->trial, 'kid' => true]))
    @if ($fam->orphans->isNotEmpty())@php($groups->push(['title' => 'اشتراكات بدون طفل محدد', 'grade' => null, 'items' => $fam->orphans, 'trial' => null, 'kid' => false]))@endif
    @if ($groups->isEmpty())<p class="hint">لم تُضف العائلة أي طفل بعد.</p>@endif
    @foreach ($groups as $g)
    <div class="sb-kid">
      <h4>{{ $g['kid'] ? '👦 ' : '⚠️ ' }}{{ $g['title'] }} @if ($g['kid'])<span class="sb-badge grey">{{ $ar::grade($g['grade']) }}</span>@endif</h4>
      @forelse ($g['items'] as $it)
        @php($s = $it->sub)
        <div class="sb-row {{ $it->mismatch || $it->dup || ! $g['kid'] ? 'flag' : '' }}" data-sub="{{ $s->id }}">
          <span><b>{{ $it->subject }}</b> <small>— {{ $ar::grade($it->grade) }}</small>@if ($it->mismatch) <span class="sb-badge bad">صف لا يطابق الطفل</span>@endif @if ($it->dup) <span class="sb-badge bad">مكرر</span>@endif<br><span class="code mono" dir="ltr">{{ $s->code }}</span></span>
          <span class="sb-badge {{ $B::STATES[$it->state][1] }}">{{ $B::STATES[$it->state][0] }}</span>
          <span class="when">@if ($it->state === 'pending')طُلب {{ $ago($s->created_at) }}، {{ $ar::money($s->price, $s->currency) }}@elseif ($s->ends_at && in_array($it->state, ['active','expired']))حتى {{ $ar::date($s->ends_at, false, $tz) }}، <b>{{ $left($it->days_left) }}</b>@elseif ($it->state === 'cancelled')أُلغي {{ $ar::date($s->updated_at, false, $tz) }}@endif</span>
          <span class="rowacts sb-acts">
          @if ($it->state === 'pending')
            <details><summary>تفعيل هذه المادة وحدها / رفض</summary>
            <form method="post" action="{{ route('manage.subscription.activate', $s) }}" onsubmit="return confirm('تأكيد استلام الدفع وتفعيل {{ $it->subject }}؟')">@csrf<input class="sb-days" name="days" type="number" min="1" max="1000" value="{{ $s->days }}" aria-label="الأيام"><button class="btn small" type="submit">تفعيل</button></form>
            <form method="post" action="{{ route('manage.subscription.cancel', $s) }}" onsubmit="return confirm('رفض هذا الطلب؟')">@csrf<button class="btn ghost small" type="submit">رفض</button></form>
            </details>
          @elseif ($it->state === 'active' || $it->state === 'expired')
            <details><summary>تمديد{{ $it->state === 'active' ? ' / إيقاف' : '' }}</summary>
              <form method="post" action="{{ route('manage.subscription.activate', $s) }}" onsubmit="return confirm('تمديد {{ $it->subject }}؟')">@csrf<input class="sb-days" name="days" type="number" min="1" max="1000" value="{{ $s->days ?: 30 }}" aria-label="أيام التمديد"><button class="btn small" type="submit">تمديد</button></form>
              @if ($it->state === 'active')<form method="post" action="{{ route('manage.subscription.cancel', $s) }}" onsubmit="return confirm('إيقاف هذا الاشتراك؟')">@csrf<button class="btn ghost small" type="submit">إيقاف الاشتراك</button></form>@endif
            </details>
          @endif
          </span>
        </div>
      @empty
        <p class="hint" style="margin:0">@if ($g['trial'])<span class="sb-badge sky">تجربة</span> كل المواد متاحة حتى {{ $ar::date($g['trial'], false, $tz) }} ({{ $left($B::daysLeft($g['trial'])) }})@else لا اشتراكات لهذا الطفل.@endif</p>
      @endforelse
    </div>
    @endforeach

    <details><summary class="hint" style="cursor:pointer">@include('partials.admin-icon',['name'=>'plus'])منح اشتراك يدوي لهذه العائلة</summary>
      <form method="post" action="{{ route('manage.user.grant', $u) }}" class="sb-acts" style="margin-top:8px" onsubmit="return confirm('منح الاشتراك وتفعيله الآن؟')">@csrf
        <select name="plan" aria-label="المادة" style="max-width:260px">@foreach ($plans as $code => $p)<option value="{{ $code }}">{{ $p['subject'] }} — {{ $ar::grade($p['grade']) }}</option>@endforeach</select>
        <input class="sb-days" name="days" type="number" min="1" max="1000" placeholder="أيام" aria-label="الأيام"><button class="btn small" type="submit">منح</button>
      </form>
      <p class="hint">ملاحظة: الاشتراك الممنوح لا يُربط بطفل محدد.</p>
    </details>
    </div>
  </details>
@empty
  <p class="empty">لا عائلات تطابق التصفية.</p>
@endforelse
</div>
@include('partials.pager', ['p' => $families])
@endsection
