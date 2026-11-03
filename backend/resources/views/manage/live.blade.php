@extends('layouts.manage')
@section('title', 'المتصلون الآن واليوم')
@section('content')
<style>
.live-dot{display:inline-block;width:11px;height:11px;border-radius:50%;background:#2fa84f;box-shadow:0 0 0 4px #2fa84f33;animation:lv 1.6s infinite}
@keyframes lv{50%{box-shadow:0 0 0 8px #2fa84f00}}
.people{list-style:none;margin:0;padding:0}.people li{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center;padding:10px 0;border-bottom:1px solid #0000000f}
.people .who{font-weight:800}.people .t{margin-inline-start:auto;color:var(--muted);font-weight:700;font-size:14px;white-space:nowrap}
.people .kids{flex-basis:100%;display:flex;flex-wrap:wrap;gap:6px}.people .kid.on{background:#e3f5e7;border-color:#2fa84f55}
.people li.flag{opacity:.7}.trend{width:100%;border-collapse:collapse;font-size:15px}.trend th,.trend td{padding:8px 6px;text-align:center;border-bottom:1px solid #0000000f}
.trend th:first-child,.trend td:first-child{text-align:start}.muted{color:var(--muted);font-size:14px}
</style>
<div class="head"><h1><span class="live-dot" aria-hidden="true"></span> المتصلون الآن واليوم</h1></div>
<div class="stats" id="live-stats">
  @foreach ([['online_accounts','حسابات متصلة الآن','users','', $online['accounts']],['online_students','طلاب متصلون الآن','students','t-sky',$online['students']],['online_guests','زوّار متصلون الآن','search','t-grey',$online['guests']],['signups','حسابات جديدة اليوم','plus','',$stats['signups']],['accounts_today','حسابات نشطة اليوم','activity','',$stats['accounts_today']],['students_today','طلاب نشطون اليوم','students','t-sky',$stats['students_today']],['lessons_opened','مواد فُتحت اليوم','book','t-sun',$stats['lessons_opened']],['progress_saved','تقدّم محفوظ اليوم (درس/مادة)','check','t-sun',$stats['progress_saved']],['guests','زوّار بلا حساب اليوم','search','t-grey',$stats['guests']],['total_accounts','كل حسابات الأهل','users','t-grey',$stats['total_accounts']],['total_students','كل الطلاب','students','t-grey',$stats['total_students']]] as [$k,$label,$icon,$tone,$v])
  <div class="stat {{ $tone }}" data-stat="{{ $k }}"><div class="ic">@include('partials.admin-icon',['name'=>$icon])</div><div class="txt"><b>{{ $ar::html($v) }}</b><span>{{ $label }}</span></div></div>
  @endforeach
</div>
<div class="grid dash">
  <section class="card" aria-live="polite"><h2>@include('partials.admin-icon',['name'=>'activity'])المتصلون الآن <small class="muted">(آخر {{ $ar::num(\App\Support\LiveStats::ONLINE_MINUTES) }} دقائق · يتحدّث كل ٣٠ ثانية · آخر تحديث <span id="live-checked">{{ $online['checked'] }}</span>)</small></h2>
    <ul class="people" id="online-list">@include('manage.partials.live-people', ['people' => $online['people'], 'empty' => 'لا أحد متصل الآن.'])</ul>
  </section>
  <section class="card"><h2>@include('partials.admin-icon',['name'=>'clock'])آخر من دخل اليوم <small class="muted">(بتوقيت غزة، الأحدث أولًا)</small></h2>
    <ul class="people">@include('manage.partials.live-people', ['people' => $today, 'empty' => 'لم يدخل أحد اليوم بعد.'])</ul>
  </section>
  <section class="card" style="grid-column:1/-1"><h2>@include('partials.admin-icon',['name'=>'activity'])آخر ٧ أيام</h2>
    <table class="trend"><thead><tr><th>اليوم</th><th>حسابات جديدة</th><th>حسابات نشطة</th><th>طلاب نشطون</th><th>مواد فُتحت</th><th>زوّار بلا حساب</th></tr></thead><tbody>
    @foreach ($stats['trend'] as $d)<tr><td>{{ $d['day'] }}</td><td>{{ $ar::html($d['signups']) }}</td><td>{{ $ar::html($d['accounts']) }}</td><td>{{ $ar::html($d['students']) }}</td><td>{{ $ar::html($d['lessons']) }}</td><td>{{ $ar::html($d['guests']) }}</td></tr>@endforeach
    </tbody></table>
    <p class="muted">لا تُحتسب حسابات الإدارة والعرض والتجربة (١، ٦٠، ٦٧) في الأرقام، وتظهر في القوائم بعلامة «غير محسوب». «متصل الآن» تقديري: آخر طلب من الحساب أو مزامنة تقدّم أو حدث على الموقع خلال آخر ٥ دقائق.</p>
  </section>
</div>
<script>
(function(){
  var url = @json(route('manage.live.online'));
  var num = function(n){return String(n).replace(/\d/g,function(d){return '٠١٢٣٤٥٦٧٨٩'[d]});};
  var esc = function(s){var d=document.createElement('div');d.textContent=s==null?'':String(s);return d.innerHTML;};
  function row(p){
    var kids = (p.students||[]).map(function(k){return '<span class="pill kid'+(k.active?' on':'')+'">'+esc(k.name)+' · '+esc(k.grade)+'</span>';}).join('');
    return '<li'+(p.excluded?' class="flag"':'')+'><span class="live-dot" aria-hidden="true"></span><b class="who">'+esc(p.name)+'</b>'
      +(p.excluded?'<span class="chip">غير محسوب</span>':'')+(p.new_today?'<span class="chip warn">جديد اليوم</span>':'')
      +(p.source?'<span class="chip">'+esc(p.source)+'</span>':'')+(p.last?'<span class="muted">'+esc(p.last)+'</span>':'')
      +'<span class="t">'+esc(p.time)+' · '+esc(p.ago)+'</span>'+(kids?'<div class="kids">'+kids+'</div>':'')+'</li>';
  }
  function tick(){
    if (document.hidden) return;
    fetch(url,{headers:{'Accept':'application/json'},credentials:'same-origin',cache:'no-store'}).then(function(r){return r.ok?r.json():null;}).then(function(d){
      if(!d) return;
      document.getElementById('online-list').innerHTML = d.people.length ? d.people.map(row).join('') : '<li class="hint">لا أحد متصل الآن.</li>';
      document.getElementById('live-checked').textContent = d.checked;
      [['online_accounts',d.accounts],['online_students',d.students],['online_guests',d.guests]].forEach(function(x){var b=document.querySelector('[data-stat="'+x[0]+'"] b'); if(b) b.textContent=num(x[1]);});
    }).catch(function(){});
  }
  setInterval(tick, 30000);
  document.addEventListener('visibilitychange', function(){ if(!document.hidden) tick(); });
})();
</script>
@endsection
