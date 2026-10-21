@extends('layouts.site')
@section('title', 'الاشتراك')
@section('body')
<style>
.sub-h{display:flex;align-items:center;gap:14px;margin-bottom:4px}.sub-h img{width:60px;height:auto;flex:none}.sub-h h1{margin:0;font-size:30px;line-height:1.3}
.sub-h .chip{margin-inline-start:auto}
.steps{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:18px 0 6px;padding:0;list-style:none}
.steps li{display:flex;align-items:center;gap:12px;padding:12px 14px;border:2px solid var(--line);border-radius:18px;background:#fffef9;font-weight:700;color:var(--ink2);line-height:1.5}
.steps .n{position:relative;width:44px;height:44px;flex:none;border-radius:14px;display:grid;place-items:center;background:var(--gl);color:var(--gd)}
.steps .n svg{width:22px;height:22px;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.steps .n i{position:absolute;top:-7px;inset-inline-start:-7px;width:22px;height:22px;border-radius:50%;background:var(--g);color:#fff;font:800 13px/22px Baloo,Cairo,sans-serif;text-align:center;font-style:normal}
.steps li:nth-child(2) .n{background:var(--sky);color:var(--bd)}.steps li:nth-child(3) .n{background:#e3f6ea;color:#137a43}
.trialbox{display:flex;align-items:center;gap:12px;margin:14px 0 0;padding:12px 16px;border-radius:16px;font-weight:700}
.trialbox svg{width:26px;height:26px;flex:none;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.trialbox.on{background:var(--yl);color:#5a4000;border:2px solid #f3dc95}.trialbox.off{background:var(--red-bg);color:#8a2a24;border:2px solid #f3c9c6}.trialbox.paid{background:var(--gl);color:var(--gd);border:2px solid #dfeac4}
.stp{display:flex;align-items:center;gap:10px;margin:22px 0 10px;font:800 19px/1.4 Baloo,Cairo,sans-serif}
.stp i{width:28px;height:28px;border-radius:50%;display:grid;place-items:center;background:var(--g);color:#fff;font-style:normal;font-size:15px;flex:none}
.plans-f{border:0;padding:0;margin:22px 0 0;min-width:0}.plans-f legend.stp{margin-top:0}.plans-f legend{padding:0}
.sub-page{overflow-x:clip}.sub-page>.card{min-width:0;max-width:100%}
#subf,#subf *{box-sizing:border-box}#subf{min-width:0;max-width:100%}
#student_id{max-width:100%}
.gl{display:grid;grid-template-columns:minmax(0,1fr);gap:12px;margin-top:12px}
.gc{min-width:0;border:2px solid var(--line);border-radius:20px;background:#fffef9;overflow:hidden}
.gc.cur{border-color:#cfe3a8}
.gh{display:flex;align-items:center;gap:10px;padding:10px 12px;min-width:0}
.gt{flex:1;min-width:0;display:flex;align-items:center;gap:10px;padding:6px 4px;border:0;background:none;font:800 19px/1.4 Baloo,Cairo,sans-serif;color:var(--ink);cursor:pointer;text-align:start}
.gt .nm{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.gt .cnt{flex:none;font:700 13px/1 Cairo,sans-serif;padding:6px 10px;border-radius:999px;background:var(--line);color:var(--ink2)}
.gc.has .gt .cnt{background:var(--g);color:#fff}
.gt svg{width:20px;height:20px;flex:none;fill:none;stroke:currentColor;stroke-width:2.5;stroke-linecap:round;stroke-linejoin:round;transition:transform .15s}
.gc.open .gt svg{transform:rotate(180deg)}
.gall{flex:none;display:flex;align-items:center;gap:6px;font-weight:700;font-size:14px;color:var(--gd);cursor:pointer;white-space:nowrap}
.gall input{margin:0;width:18px;height:18px}
.gb{padding:0 12px 12px}.gb[hidden]{display:none}
.plans{display:grid;gap:10px;grid-template-columns:repeat(2,minmax(0,1fr))}
.plan{position:relative;display:flex;align-items:center;gap:12px;min-width:0;margin:0;padding:12px 14px;border:2px solid var(--line);border-radius:16px;background:#fff;box-shadow:0 3px 0 var(--line);cursor:pointer;transition:border-color .15s,background .15s}
.plan:hover{border-color:#cfe3a8}
.plan input{flex:none;margin:0;width:20px;height:20px}
.plan .pt{flex:1;min-width:0}.plan .pt b{display:block;font:800 18px/1.4 Baloo,Cairo,sans-serif;overflow-wrap:anywhere}
.plan .pt small{display:block;color:var(--muted);font-size:13px}
.plan .price{flex:none;display:flex;align-items:baseline;gap:4px;padding:6px 12px;border-radius:14px;background:var(--gl);color:var(--gd);font-weight:800;font-size:17px;white-space:nowrap}
.plan .price b{font:800 32px/1 Baloo,Cairo,sans-serif}
.plan:has(input:checked){border-color:var(--g);background:var(--gl);box-shadow:0 3px 0 var(--g)}
.plan:has(input:checked) .price{background:#fff}
.plan:has(input:focus-visible){outline:3px solid var(--b);outline-offset:3px}
.paybar{position:sticky;bottom:12px;z-index:5;margin-top:22px;display:flex;align-items:center;gap:10px 14px;flex-wrap:wrap;min-width:0;max-width:100%;padding:14px 16px;background:#fff;border:2px solid #cfe3a8;border-radius:20px;box-shadow:0 6px 0 #dfeac4,0 10px 30px rgba(36,51,28,.12)}
.paybar .sum{flex:1 1 220px;min-width:0}
.paybar .sum p{margin:0;min-width:0}
.paybar .sel{font-size:14px;color:var(--muted);line-height:1.6;overflow:hidden;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow-wrap:anywhere}
.paybar .tot{font:800 18px/1.5 Baloo,Cairo,sans-serif}.paybar .tot b{font-size:26px;color:var(--gd)}
.paybar .btn{flex:none;max-width:100%}
.pend{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:10px 14px;padding:12px 0;border-top:2px solid var(--line);margin:0}
.pend .code{font-size:14px;color:var(--muted)}
@media (max-width:820px){.steps{grid-template-columns:1fr}.steps li{padding:10px 12px}}
@media (max-width:600px){
  .card{padding:18px 16px}.sub-h img{width:48px}.sub-h h1{font-size:24px}
  .plans{grid-template-columns:minmax(0,1fr)}.gh{padding:8px 10px}.gt{font-size:17px}.gb{padding:0 10px 10px}
  .paybar{bottom:8px;padding:12px}.paybar .btn{width:100%}
  .pend{grid-template-columns:1fr}.pend .btn{width:100%}
}
</style>
@php($daysLeft = $access['kind'] === 'trial' && $access['ends_at'] ? max(1, (int) ceil(now()->diffInSeconds($access['ends_at'], false) / 86400)) : null)
<main class="wrap grid sub-page">
  @include('partials.flash')
  <section class="card">
    <div class="sub-h"><img src="{{ asset('ui/logo-mascot.webp') }}" alt="" width="72" height="95"><h1>الاشتراك في المواد</h1></div>
    <ol class="steps" aria-label="خطوات الاشتراك">
      <li><span class="n" aria-hidden="true"><i>١</i><svg viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"/></svg></span><span>اختر الطالب</span></li>
      <li><span class="n" aria-hidden="true"><i>٢</i><svg viewBox="0 0 24 24"><path d="M2 5h7a3 3 0 0 1 3 3v12a2 2 0 0 0-2-2H2zM22 5h-7a3 3 0 0 0-3 3v12a2 2 0 0 1 2-2h8z"/></svg></span><span>اختر المواد</span></li>
      <li><span class="n" aria-hidden="true"><i>٣</i><svg viewBox="0 0 24 24"><path d="M21 12a9 9 0 0 1-13.3 7.9L3 21l1.1-4.6A9 9 0 1 1 21 12ZM9 12l2 2 4-4"/></svg></span><span>ادفع عبر واتساب وسنفعّل الاشتراك بعد التأكيد</span></li>
    </ol>
    @if ($access['kind'] === 'trial')
      <p class="trialbox on" role="status"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 7v5l3 2M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z"/></svg><span>الفترة التجريبية: متبقٍّ {{ $ar::num($daysLeft) }} {{ $daysLeft === 1 ? 'يوم' : ($daysLeft === 2 ? 'يومان' : 'أيام') }}، حتى {{ $ar::date($access['ends_at']) }}. اشترك الآن ليستمر الوصول بعدها.</span></p>
    @elseif ($access['kind'] === 'expired')
      <p class="trialbox off" role="status"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8v5M12 16.5v.5M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z"/></svg><span>انتهت الفترة التجريبية. الدروس المقفلة تحتاج اشتراكًا في المادة.</span></p>
    @elseif ($access['kind'] === 'paid')
      <p class="trialbox paid" role="status"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 11l3 3 8-8M20 12v7a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h9"/></svg><span>اشتراكاتك المفعّلة: {{ collect($access['subjects'])->map(fn($c)=>$ar::subject($c))->join('، ') }}.</span></p>
    @endif
    @unless ($hasNumber)<p class="alert err">لم يُضبط رقم واتساب للدفع بعد. سيُسجّل طلبك وسنتواصل معك.</p>@endunless

    <form method="post" action="{{ route('account.subscribe.store') }}" id="subf" @if($hasNumber) target="_blank" rel="noopener" @endif>@csrf
      <h2 class="stp"><i>١</i>اختر الطالب</h2>
      @if ($user->students->isNotEmpty())
      <label class="sr" for="student_id">الطالب</label>
      <select id="student_id" name="student_id"><option value="" data-grade="">كل الطلاب في الحساب</option>@foreach ($user->students as $s)<option value="{{ $s->id }}" data-grade="{{ $s->grade }}">{{ $s->name }} — {{ $ar::grade($s->grade) }}</option>@endforeach</select>
      @else
      <p class="hint" style="margin:0">سيشمل الاشتراك كل الطلاب في الحساب. يمكنك <a href="{{ route('account.home') }}">إضافة طالب</a> أولًا.</p>
      @endif

      <fieldset class="plans-f"><legend class="stp"><i>٢</i>اختر المواد</legend>
      <p class="hint" style="margin:-4px 0 0">يمكنك اختيار أكثر من مادة، ويُنشأ طلب مستقل لكل مادة.</p>
      <div class="gl">
      @foreach (collect($plans)->groupBy('grade') as $g => $group)
        <section class="gc" data-grade="{{ $g }}">
          <div class="gh">
            <button type="button" class="gt" aria-expanded="true" aria-controls="gb-{{ $loop->index }}"><span class="nm">{{ $ar::grade($g) }}</span><span class="cnt" data-cnt>{{ $ar::num(0) }} / {{ $ar::num($group->count()) }}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg></button>
            <label class="gall"><input type="checkbox" data-all aria-label="اختر كل مواد {{ $ar::grade($g) }}">اختر الكل</label>
          </div>
          <div class="gb" id="gb-{{ $loop->index }}"><div class="plans">
          @foreach ($group as $p)
            <label class="plan"><input type="checkbox" name="plans[]" value="{{ $p['code'] }}" data-price="{{ $p['price'] }}" data-name="{{ $p['name'] }}"><span class="pt"><b>{{ $p['subject'] }}</b><small>لمدة {{ $ar::num($p['days']) }} يومًا</small></span><span class="price"><b>{{ $ar::num($p['price']) }}</b> {{ $currency }}</span></label>
          @endforeach
          </div></div>
        </section>
      @endforeach
      </div>
      </fieldset>

      <div class="paybar" aria-live="polite">
        <div class="sum">
          <p class="tot">المجموع: <b id="tot">{{ $ar::num(0) }}</b> {{ $currency }}</p>
          <p class="sel" id="sel">لم تختر أي مادة بعد.</p>
        </div>
        <button class="btn wa" type="submit" id="pay"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.3 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z"/></svg>ادفع عبر واتساب</button>
      </div>
    </form>
  </section>
  @if ($pending->isNotEmpty())
  <section class="card">
    <h2 style="margin:0 0 8px">طلبات بانتظار الدفع</h2>
    @foreach ($pending as $s)
      <p class="pend"><span><b>{{ $s->plan_name }}</b> — {{ $ar::num($s->price) }} {{ $s->currency }}<br><span class="code" dir="ltr">{{ $s->code }}</span></span>
      @if ($url = $gateway->checkoutUrl($s->setRelation('user', $user)))<a class="btn wa small" href="{{ $url }}" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.1l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Z"/></svg>أرسل عبر واتساب</a>@endif</p>
    @endforeach
  </section>
  @endif
  <p style="margin:0"><a href="{{ route('account.home') }}">العودة إلى حسابي</a></p>
</main>
<script>
(function(){
  var f=document.getElementById('subf');if(!f)return;
  var boxes=[].slice.call(f.querySelectorAll('input[name="plans[]"]')),st=document.getElementById('student_id');
  var ar=function(n){return String(n).replace(/\d/g,function(d){return '٠١٢٣٤٥٦٧٨٩'[d]})};
  function upd(){var on=boxes.filter(function(b){return b.checked}),t=0;on.forEach(function(b){t+=+b.dataset.price});
    document.getElementById('tot').textContent=ar(t);
    document.getElementById('sel').textContent=on.length?ar(on.length)+(on.length===1?' مادة: ':' مواد: ')+on.map(function(b){return b.dataset.name}).join('، '):'لم تختر أي مادة بعد.';}
  var cards=[].slice.call(f.querySelectorAll('.gc'));
  function open(c,o){c.classList.toggle('open',o);c.querySelector('.gt').setAttribute('aria-expanded',o?'true':'false');c.querySelector('.gb').hidden=!o;}
  function counts(){cards.forEach(function(c){var bs=[].slice.call(c.querySelectorAll('input[name="plans[]"]')),n=bs.filter(function(b){return b.checked}).length,all=c.querySelector('[data-all]');
    c.querySelector('[data-cnt]').textContent=ar(n)+' / '+ar(bs.length);c.classList.toggle('has',n>0);all.checked=n===bs.length;all.indeterminate=n>0&&n<bs.length;});}
  // Picking a student focuses (expands) their grade; other grades stay available, collapsed. Selections are never cleared.
  function grade(){var g=st?st.options[st.selectedIndex].dataset.grade:'',hit=g&&cards.some(function(c){return c.dataset.grade===g});
    cards.forEach(function(c,i){var cur=hit?c.dataset.grade===g:false,sel=!!c.querySelector('input[name="plans[]"]:checked');c.classList.toggle('cur',cur);open(c,hit?(cur||sel):(i===0||sel));});
    if(hit&&st===document.activeElement){var c=cards.filter(function(c){return c.dataset.grade===g})[0];c.scrollIntoView({block:'nearest',behavior:'smooth'});}}
  cards.forEach(function(c){c.querySelector('.gt').addEventListener('click',function(){open(c,!c.classList.contains('open'))});
    c.querySelector('[data-all]').addEventListener('change',function(e){[].forEach.call(c.querySelectorAll('input[name="plans[]"]'),function(b){b.checked=e.target.checked});if(e.target.checked)open(c,true);upd();});});
  var _upd=upd;upd=function(){_upd();counts();};
  boxes.forEach(function(b){b.addEventListener('change',upd)});if(st)st.addEventListener('change',grade);
  f.addEventListener('submit',function(e){if(!boxes.some(function(b){return b.checked})){e.preventDefault();alert('اختر مادة واحدة على الأقل.')}});
  grade();upd();
})();
</script>
@endsection
