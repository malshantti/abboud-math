@extends('layouts.manage')
@section('title', 'المتصلون الآن واليوم')
@section('content')
<style>
.live-dot{display:inline-block;flex:none;width:10px;height:10px;border-radius:50%;background:#2fa84f;box-shadow:0 0 0 4px #2fa84f33;animation:lv 1.6s infinite}
@keyframes lv{50%{box-shadow:0 0 0 7px #2fa84f00}}
@media (prefers-reduced-motion:reduce){.live-dot{animation:none}}
.live-sub{margin:-10px 0 18px;color:var(--muted);font-size:13.5px}
.live-top{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,2fr);gap:16px;align-items:stretch}
@media (max-width:900px){.live-top{grid-template-columns:minmax(0,1fr)}}
.live-top .card{margin:0}
.live-top h2,.live-card h2{display:flex;align-items:center;gap:10px;font-size:16px;margin:0 0 14px}
.nums{display:grid;grid-template-columns:repeat(var(--n,3),minmax(0,1fr));gap:4px}
.nums>div{display:flex;flex-direction:column;gap:2px;padding:8px 10px;border-radius:12px;min-width:0}
.nums b{font:600 28px/1.15 Plex,sans-serif;color:var(--ink);font-variant-numeric:tabular-nums}
.nums span{color:var(--muted);font-size:13px;line-height:1.4}
.nums .z b{color:#b9c2b5}
.now .nums>div:first-child:not(.z){background:#eaf6ec}.now .nums>div:first-child:not(.z) b{color:#1d7a3a}
.today .nums{--n:6}
@media (max-width:1100px){.today .nums{--n:3}}
@media (max-width:420px){.nums b{font-size:24px}}
.live-card{margin-top:16px}
.live-card h2 small{font:500 12.5px/1.4 Plex,sans-serif;color:var(--muted);margin-inline-start:auto}
.pp-list{list-style:none;margin:0;padding:0}
.pp{display:grid;grid-template-columns:12px minmax(0,1fr) auto;gap:4px 12px;align-items:start;padding:10px 0;border-bottom:1px solid var(--line2)}
.pp:last-child{border-bottom:0}
.pp-dot{width:9px;height:9px;margin-top:7px;border-radius:50%;background:#cfd6cb}
.pp.on .pp-dot{background:#2fa84f;box-shadow:0 0 0 3px #2fa84f2e}
.pp.flag{opacity:.62}
.pp-main{min-width:0;display:grid;gap:3px}
.pp-line{margin:0;display:flex;flex-wrap:wrap;align-items:baseline;gap:2px 8px;font-size:14.5px;line-height:1.5}
.pp-line .who{font-weight:600;color:var(--ink)}
.tag{font:500 11.5px/1.7 Plex,sans-serif;padding:0 7px;border-radius:999px;background:#eef2e8;color:var(--muted)}
.tag.new{background:var(--yl);color:#7a5200}
.pp-meta{color:var(--muted);font-size:12.5px}
.pp-kids{margin:0;display:flex;flex-wrap:wrap;gap:2px 14px;color:var(--ink2);font-size:13px}
.kid{display:inline-flex;align-items:baseline;gap:5px}.kid small{color:var(--muted);font-size:12px}
.kid.on{color:#1d7a3a;font-weight:600}.kid.on:before{content:"";width:6px;height:6px;border-radius:50%;background:#2fa84f;align-self:center}
.pp-time{display:flex;flex-direction:column;align-items:flex-end;gap:1px;padding-top:2px;color:var(--ink2);font:500 13px/1.4 Plex,sans-serif;white-space:nowrap;font-variant-numeric:tabular-nums}
.pp-time small{color:var(--muted);font-size:12px}.pp.on .pp-time b{color:#1d7a3a;font-weight:600}
.trend-wrap{overflow-x:auto;margin:0 -4px}
.trend{width:100%;border-collapse:collapse;font-size:14px;font-variant-numeric:tabular-nums}
.trend th{padding:6px 8px;color:var(--muted);font:500 12.5px/1.4 Plex,sans-serif;text-align:center;white-space:nowrap;border-bottom:1px solid var(--line)}
.trend td{padding:9px 8px;text-align:center;border-bottom:1px solid var(--line2)}
.trend th:first-child,.trend td:first-child{text-align:start}
.trend td.z{color:#b9c2b5}
.trend tr.is-today td{background:#f4f8ee;font-weight:600}.trend tr.is-today td:first-child{color:var(--gd)}
.trend tbody tr:last-child td{border-bottom:0}
.live-note{margin:12px 0 0;color:var(--muted);font-size:12.5px;line-height:1.7}
</style>
@php($onlineIds = array_column($online['people'], 'id'))
@php($people = array_merge($online['people'], array_values(array_filter($today, fn ($p) => ! in_array($p['id'], $onlineIds, true)))))
<div class="head"><h1>المتصلون الآن واليوم</h1></div>
<p class="live-sub">يتحدّث «متصل الآن» تلقائيًا كل 30 ثانية · آخر تحديث <span id="live-checked">{{ $online['checked'] }}</span></p>

<div class="live-top">
  <section class="card now" aria-live="polite">
    <h2><span class="live-dot" aria-hidden="true"></span>متصل الآن</h2>
    <div class="nums">
      @foreach ([['online_accounts', 'عائلات', $online['accounts']], ['online_students', 'طلاب', $online['students']], ['online_guests', 'زوّار', $online['guests']]] as [$k, $label, $v])
        <div data-stat="{{ $k }}" @class(['z' => ! $v])><b>{{ $ar::num($v) }}</b><span>{{ $label }}</span></div>
      @endforeach
    </div>
  </section>
  <section class="card today">
    <h2>@include('partials.admin-icon', ['name' => 'clock'])اليوم</h2>
    <div class="nums">
      @foreach ([['accounts_today', 'عائلات دخلت', $stats['accounts_today']], ['students_today', 'طلاب تعلّموا', $stats['students_today']], ['lessons_opened', 'مواد فُتحت', $stats['lessons_opened']], ['progress_saved', 'تقدّم محفوظ', $stats['progress_saved']], ['signups', 'حسابات جديدة', $stats['signups']], ['guests', 'زوّار بلا حساب', $stats['guests']]] as [$k, $label, $v])
        <div data-stat="{{ $k }}" @class(['z' => ! $v])><b>{{ $ar::num($v) }}</b><span>{{ $label }}</span></div>
      @endforeach
    </div>
  </section>
</div>

<section class="card live-card">
  <h2>@include('partials.admin-icon', ['name' => 'users'])من دخل اليوم <small>المتصلون أولًا، ثم الأحدث</small></h2>
  <ul class="pp-list" id="people">@include('manage.partials.live-people', ['people' => $people, 'onlineIds' => $onlineIds, 'empty' => 'لم يدخل أحد اليوم بعد.'])</ul>
</section>

<section class="card live-card">
  <h2>@include('partials.admin-icon', ['name' => 'activity'])آخر 7 أيام</h2>
  <div class="trend-wrap"><table class="trend">
    <thead><tr><th>اليوم</th><th>عائلات</th><th>طلاب</th><th>مواد فُتحت</th><th>حسابات جديدة</th><th>زوّار</th></tr></thead>
    <tbody>
    @foreach (array_reverse($stats['trend']) as $i => $d)
      <tr @class(['is-today' => $i === 0])><td>{{ $i === 0 ? 'اليوم' : ($i === 1 ? 'أمس' : $d['day']) }}</td>
        @foreach (['accounts', 'students', 'lessons', 'signups', 'guests'] as $c)<td @class(['z' => ! $d[$c]])>{{ $ar::num($d[$c]) }}</td>@endforeach
      </tr>
    @endforeach
    </tbody>
  </table></div>
  <p class="live-note">لا تُحتسب حسابات الإدارة والعرض والتجربة في الأرقام، وتظهر في القائمة باهتة بعلامة «غير محسوب». «متصل الآن» تقديري: نشاط من الحساب أو مزامنة تقدّم أو حدث على الموقع خلال آخر {{ $ar::num(\App\Support\LiveStats::ONLINE_MINUTES) }} دقائق.</p>
</section>

<script>
(function(){
  var url = @json(route('manage.live.online'));
  var list = document.getElementById('people');
  var esc = function(s){var d=document.createElement('div');d.textContent=s==null?'':String(s);return d.innerHTML;};
  // Same markup as manage/partials/live-people.blade.php, for families who came online after the page loaded.
  function row(p){
    var kids = (p.students||[]).map(function(k){return '<span class="kid'+(k.active?' on':'')+'">'+esc(k.name)+' <small>'+esc(k.grade)+'</small></span>';}).join('');
    var meta = [p.source ? 'من '+p.source : null, p.last].filter(Boolean).join(' · ');
    return '<li class="pp on'+(p.excluded?' flag':'')+'" data-id="'+esc(p.id)+'"><span class="pp-dot" aria-hidden="true"></span><div class="pp-main">'
      +'<p class="pp-line"><b class="who">'+esc(p.name)+'</b>'+(p.excluded?'<span class="tag">غير محسوب</span>':'')+(p.new_today?'<span class="tag new">جديد اليوم</span>':'')+(meta?'<span class="pp-meta">'+esc(meta)+'</span>':'')+'</p>'
      +(kids?'<p class="pp-kids">'+kids+'</p>':'')+'</div><span class="pp-time"><b>متصل الآن</b></span></li>';
  }
  function setNum(k, v){var box=document.querySelector('[data-stat="'+k+'"]'); if(!box) return; box.querySelector('b').textContent=String(v); box.classList.toggle('z', !v);}
  function tick(){
    if (document.hidden) return;
    fetch(url,{headers:{'Accept':'application/json'},credentials:'same-origin',cache:'no-store'}).then(function(r){return r.ok?r.json():null;}).then(function(d){
      if(!d) return;
      var ids = {}; d.people.forEach(function(p){ ids[p.id] = p; });
      // Mark who is online now; anyone new to the page goes to the top.
      [].forEach.call(list.querySelectorAll('.pp'), function(li){
        var on = !!ids[li.dataset.id]; li.classList.toggle('on', on);
        var t = li.querySelector('.pp-time'); if (on) { t.innerHTML = '<b>متصل الآن</b>'; delete ids[li.dataset.id]; } else if (t.querySelector('b')) { t.innerHTML = 'قبل قليل'; }
      });
      var fresh = Object.keys(ids).map(function(k){ return row(ids[k]); }).join('');
      if (fresh) { var hint = list.querySelector('.hint'); if (hint) hint.remove(); list.insertAdjacentHTML('afterbegin', fresh); }
      document.getElementById('live-checked').textContent = d.checked;
      setNum('online_accounts', d.accounts); setNum('online_students', d.students); setNum('online_guests', d.guests);
    }).catch(function(){});
  }
  setInterval(tick, 30000);
  document.addEventListener('visibilitychange', function(){ if(!document.hidden) tick(); });
})();
</script>
@endsection
