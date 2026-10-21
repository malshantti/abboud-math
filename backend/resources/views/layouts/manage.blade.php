<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<meta name="theme-color" content="#fbf9f0">
<title>@yield('title') | لوحة الإدارة</title>
<link rel="icon" href="{{ route('brand.asset',['asset'=>'brand/favicon.svg']) }}" type="image/svg+xml">
@include('partials.brand-css')
@include('partials.admin-shell-css')
<style>
body{font-size:16px;background:radial-gradient(circle at 0 0,#eef5dc 0,transparent 38%),var(--cream)}
.ico{width:22px;height:22px;flex:none}
.shell{display:grid;grid-template-columns:272px minmax(0,1fr);min-height:100vh}
.side{background:#fff;border-inline-end:2px solid var(--line);padding:20px 14px;position:sticky;top:0;height:100vh;overflow:auto;display:flex;flex-direction:column;gap:14px;z-index:30}
.side .logo{display:block;padding:4px 10px 12px;border-bottom:2px dashed var(--line);text-decoration:none}.side .logo img{height:46px;width:auto;display:block}
.side .logo small{display:block;color:var(--muted);font-weight:700;font-size:14px;margin-top:4px}
.me{margin-top:auto;border:2px solid var(--line);border-radius:18px;padding:12px 14px;background:#fbfcf6}
.me b{display:block;font-size:16px;line-height:1.5}.me span{display:block;color:var(--muted);font-size:14px;margin-bottom:8px}
.me .btn{width:100%}
.top{display:none}
.main{padding:26px clamp(14px,3vw,36px) 56px;min-width:0;max-width:1320px;width:100%}
.head{display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;margin:0 0 18px}
.head h1{margin:0;font-size:clamp(25px,3vw,32px);display:flex;align-items:center;gap:12px;flex-wrap:wrap}
.head h1 small{font:700 16px/1.4 Cairo,sans-serif}
.head .back{display:inline-flex;align-items:center;gap:6px;text-decoration:none}
.lead{color:var(--ink2);margin:-8px 0 18px;max-width:780px}
.card h2{font-size:21px;margin:0 0 12px;display:flex;align-items:center;gap:10px}.card h2 .ico{color:var(--leaf)}
.card h3{font-size:18px;margin:16px 0 8px}
.stats{display:grid;grid-template-columns:repeat(auto-fill,minmax(205px,1fr));gap:16px}
.stat{display:flex;align-items:center;gap:14px;background:#fff;border:2px solid var(--line);border-radius:20px;padding:16px;box-shadow:0 5px 0 var(--line)}
.stat .ic{flex:none;display:grid;place-items:center;width:52px;height:52px;border-radius:16px;background:var(--gl);color:var(--gd)}
.stat .ic .ico{width:26px;height:26px}
.stat.t-sun .ic{background:var(--yl);color:#7a5200}.stat.t-sky .ic{background:var(--sky);color:var(--bd)}.stat.t-o .ic{background:var(--ol);color:#9a4a0c}.stat.t-red .ic{background:var(--red-bg);color:var(--red-d)}.stat.t-grey .ic{background:#efeee5;color:var(--muted)}
.stat b{display:block;font:800 30px/1.2 Baloo,Cairo,sans-serif;color:var(--ink)}.stat span{color:var(--muted);font-weight:700;font-size:15px;line-height:1.5}
.subj{display:flex;flex-direction:column;gap:6px}.subj h3{margin:0}
.filters{display:flex;gap:12px;flex-wrap:wrap;align-items:end;margin:0 0 16px;padding:14px 16px;background:#fff;border:2px solid var(--line);border-radius:20px}
.filters>*{flex:1 1 200px}.filters>.go{flex:0 0 auto}
.filters label{font-size:14px;margin-bottom:4px}.filters input,.filters select{min-height:46px}
.bulk{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:0 0 12px;padding:10px 14px;background:var(--yl);border:2px dashed #f0d98a;border-radius:16px;font-weight:700}
.bulk select,.bulk input[type=number]{min-height:44px;width:auto}
.table-wrap{overflow-x:auto;background:#fff;border:2px solid var(--line);border-radius:20px;box-shadow:0 5px 0 var(--line)}
.table-wrap table th{background:#f7f8ef;font-weight:800;white-space:nowrap;padding:12px 14px}
.table-wrap table td{padding:12px 14px;vertical-align:middle}
.table-wrap tbody tr:hover td{background:#fbfcf6}.table-wrap tbody tr:last-child td{border-bottom:0}
.table-wrap .empty{text-align:center;color:var(--muted);padding:28px}
td small{color:var(--muted)}td .row{gap:8px}
.mono{font-family:Baloo,Cairo,sans-serif;font-weight:800;letter-spacing:.5px}
.chip{white-space:nowrap}.chip:before{content:"";width:8px;height:8px;border-radius:50%;background:currentColor;opacity:.75}
.bar-track{height:12px;border-radius:8px;background:#f0efe4;overflow:hidden}.bar{height:12px;border-radius:8px;background:linear-gradient(90deg,var(--leaf),var(--g))}
.list{list-style:none;margin:0;padding:0}.list li{display:flex;gap:10px;align-items:center;padding:10px 0;border-bottom:1px dashed var(--line)}.list li:last-child{border-bottom:0}
.list li>span:not(.chip){flex:1;min-width:0}.list .when{margin-inline-start:auto;color:var(--muted);font-size:13px;white-space:nowrap}@media (max-width:520px){.list li{flex-wrap:wrap}}
.pager{margin-top:16px;justify-content:center}.pager span{font-weight:700;color:var(--muted)}
.alert{box-shadow:0 4px 0 #cfe3a8;font-size:16px}.alert.err{box-shadow:0 4px 0 #f3c9c6}
details summary{cursor:pointer;font-weight:700;color:var(--gd)}
details pre{white-space:pre-wrap;word-break:break-all;max-height:260px;overflow:auto;background:#f7f8f2;padding:10px;border-radius:12px;font-size:13px;direction:ltr;text-align:left}
.danger-zone{border-color:#f3c9c6;box-shadow:0 5px 0 #f3c9c6}.danger-zone h2{color:var(--red-d)}.danger-zone h2 .ico{color:var(--red)}
.check{display:flex;align-items:center;gap:10px;font-weight:600;margin:10px 0;cursor:pointer}
.savebar{position:sticky;bottom:12px;z-index:5;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:22px;padding:14px 18px;background:#fff;border:2px solid #cfe3a8;border-radius:20px;box-shadow:0 8px 24px #24331c1a,0 5px 0 #cfe3a8}
.savebar p{margin:0;color:var(--ink2);font-weight:600}.savebar .btn{min-width:230px}
.prices td,.prices th{vertical-align:middle}.prices input{max-width:140px;min-height:46px;text-align:center;font-weight:800}
.money{display:flex;align-items:center;gap:8px}.money span{color:var(--muted);font-weight:700;white-space:nowrap}
.grade-sep td{background:#f3f7ec!important;font:800 15px/1.4 Baloo,Cairo,sans-serif;color:var(--gd)}

/* ---- admin3: readable zero, export menu, aligned stats, activity, facts, stacked tables ---- */
.n{display:inline-flex;align-items:baseline;direction:ltr;unicode-bidi:isolate}
.z0{font-style:normal;display:inline-block;flex:none;width:.32em;height:.32em;margin:0 .13em .2em;border-radius:.05em;transform:rotate(45deg);background:currentColor;line-height:0;overflow:hidden;text-indent:-9em}
.dt{white-space:nowrap}
.menu{position:relative}.menu>summary{list-style:none;display:inline-flex;align-items:center;gap:8px}.menu>summary::-webkit-details-marker{display:none}
.menu .caret{width:18px;height:18px;transition:transform .15s}.menu[open] .caret{transform:rotate(180deg)}
.menu-list{position:absolute;inset-inline-end:0;top:calc(100% + 8px);z-index:15;min-width:220px;display:grid;gap:2px;padding:8px;background:#fff;border:2px solid var(--line);border-radius:18px;box-shadow:0 12px 30px #24331c22,0 5px 0 var(--line)}
.menu-list a{display:flex;align-items:center;gap:10px;min-height:46px;padding:8px 12px;border-radius:12px;text-decoration:none;color:var(--ink);font:700 16px/1.4 Baloo,Cairo,sans-serif}
.menu-list a .ico{color:var(--leaf);width:20px;height:20px}.menu-list a small{margin-inline-start:auto;color:var(--muted);font:700 12px/1 Baloo,Cairo,sans-serif;border:1.5px solid var(--line);border-radius:8px;padding:4px 6px}
.menu-list a:hover,.menu-list a:focus-visible{background:var(--gl)}
.stat{display:grid;grid-template-columns:52px minmax(0,1fr);align-items:center;gap:14px}
.stat .txt{min-width:0;display:flex;flex-direction:column;align-items:flex-start;gap:2px}
.stat .txt b{font-variant-numeric:tabular-nums}
.stat .txt small{display:block;color:var(--gd);font:700 13px/1.45 Cairo,sans-serif;margin-top:2px}
.note{display:flex;gap:10px;align-items:flex-start;margin:16px 0 0;padding:12px 16px;background:var(--yl);border:2px dashed #f0d98a;border-radius:16px;font-weight:600}.note .ico{color:#9a6b00;margin-top:3px}.note p{margin:0;line-height:1.7}
.grid.dash{grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));margin-top:22px}
.meter{margin:10px 0}.meter-row{display:flex;align-items:baseline;justify-content:flex-start;gap:10px;margin-bottom:4px}.meter-row b{margin-inline-start:auto;font:800 18px/1.3 Baloo,Cairo,sans-serif}.meter-row b small{font:700 14px/1 Cairo,sans-serif;color:var(--muted)}
.list.act li{display:grid;grid-template-columns:minmax(0,1fr);gap:4px;align-items:stretch}
.act-top{display:flex;align-items:center;gap:8px;min-width:0}
.act-top .who{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:800}
.act-top .btn{flex:none}
.act-meta{display:flex;align-items:baseline;gap:10px;min-width:0}.act-meta .act-mail{flex:1}
.act .when{flex:none;color:var(--muted);font:700 13px/1.4 Baloo,Cairo,sans-serif;white-space:nowrap;margin:0}
.act-mail,.facts .mail,td small[dir=ltr],td[dir=ltr]{display:block;min-width:0;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--muted);font-size:14px;text-align:right;unicode-bidi:plaintext}
.act-sub{color:var(--ink2);font-size:15px;overflow-wrap:anywhere}
.act-items{display:flex;flex-wrap:wrap;gap:6px;align-items:center}.act-items small{color:var(--muted);font-weight:700;width:100%}
.act-ip{color:var(--muted);font-size:12px;text-align:right}
.pill{display:inline-flex;align-items:center;min-height:28px;padding:2px 10px;border-radius:999px;background:var(--gl);color:var(--gd);font:700 13px/1.4 Baloo,Cairo,sans-serif;white-space:nowrap}.pill.mid{background:var(--yl);color:#7a5200}.pill.low{background:var(--red-bg);color:var(--red-d)}
.more{margin:12px 0 0}
.facts{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:12px;margin:0 0 16px}
.facts>div{min-width:0;background:#fff;border:2px solid var(--line);border-radius:18px;padding:12px 16px}
.facts dt{display:flex;align-items:center;gap:8px;color:var(--muted);font-weight:700;font-size:14px}.facts dt .ico{width:18px;height:18px;color:var(--leaf)}
.facts dd{margin:2px 0 0;min-width:0;font-weight:800}
.grid.subjects{grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr))}
.subj{display:flex;flex-direction:column;gap:10px;background:#fff;border:2px solid var(--line);border-radius:20px;padding:16px;min-width:0}
.lesson .meter-row{justify-content:flex-start}.lesson .meter-row span{color:var(--ink2);font-weight:700;min-width:8.5em}.lesson .meter-row b{margin-inline-start:0}
.head .btn,.head .menu{flex:none;white-space:nowrap}
.lesson .pct{color:var(--muted);font-weight:700}
.kv{margin:0;display:grid;gap:0}.kv>div{display:flex;align-items:baseline;gap:12px;padding:8px 0;border-bottom:1px dashed var(--line)}.kv>div:last-child{border-bottom:0}
.kv dt{color:var(--ink2);font-weight:700;min-width:8.5em}.kv dd{margin:0;font:800 16px/1.5 Baloo,Cairo,sans-serif;color:var(--ink)}.kv dd small{font:600 13px/1 Cairo,sans-serif;color:var(--muted)}.kv .none{font:600 14px/1.5 Cairo,sans-serif;color:var(--muted)}
.kv .scores{display:flex;flex-wrap:wrap;gap:6px}
.batch{display:block;color:var(--muted);font-size:13px;margin-top:2px}
@media (max-width:640px){
 .head{flex-wrap:nowrap}.head h1{min-width:0}
 .stats{grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
 .stat{grid-template-columns:40px minmax(0,1fr);gap:10px;padding:12px;border-radius:18px;align-items:center;min-height:86px}
 .stat .ic{width:40px;height:40px;border-radius:12px}.stat .ic .ico{width:22px;height:22px}
 .stat .txt b{font-size:24px}.stat .txt span{font-size:13.5px;line-height:1.4}.stat .txt small{font-size:12px}
 .card{padding:16px}
 .table-wrap.stack{background:transparent;border:0;box-shadow:none;overflow:visible}
 .table-wrap.stack table,.table-wrap.stack tbody,.table-wrap.stack tr,.table-wrap.stack td{display:block;width:100%}
 .table-wrap.stack thead{display:none}
 .table-wrap.stack tr{position:relative;background:#fff;border:2px solid var(--line);border-radius:18px;box-shadow:0 4px 0 var(--line);padding:8px 14px;margin:0 0 12px}
 .table-wrap.stack td{display:block;position:relative;padding:8px 0;padding-inline-start:7.2em;border-bottom:1px dashed var(--line);white-space:normal;min-width:0;overflow-wrap:anywhere;min-height:40px}
 .table-wrap.stack td:last-child{border-bottom:0}
 .table-wrap.stack td[data-label]:before{content:attr(data-label);position:absolute;inset-inline-start:0;top:8px;width:6.8em;color:var(--muted);font-weight:700;font-size:14px;line-height:1.6}
 .table-wrap.stack td[dir=ltr]{direction:rtl;text-align:right}
 .table-wrap.stack td small[dir=ltr]{margin-top:2px}
 .table-wrap.stack td.sel{display:flex;align-items:center;gap:8px;padding:6px 0;min-height:0;color:var(--muted);font-weight:700;font-size:14px}
 .table-wrap.stack td.sel:after{content:"تحديد"}
 .table-wrap.stack td.actions{display:flex;flex-wrap:wrap;gap:8px;padding-inline-start:0;padding-top:12px}
 .table-wrap.stack td.actions form{margin:0!important}
 .table-wrap.stack td.actions form.row{flex-wrap:nowrap}
 .table-wrap.stack td .empty,.table-wrap.stack td.empty{display:block;text-align:center}
 .bulk{gap:8px}.bulk select{flex:1 1 160px;max-width:none!important}
 .kv dt,.lesson .meter-row span{min-width:7.5em}
}
@media (max-width:900px){
 .table-wrap td{white-space:nowrap}
 .shell{grid-template-columns:1fr}
 .top{display:flex;position:sticky;top:0;z-index:20;align-items:center;justify-content:space-between;gap:10px;padding:10px 14px;background:#fffef8;border-bottom:2px solid var(--line)}
 .top img{height:38px;width:auto;display:block}
 .side{position:fixed;inset-block:0;inset-inline-start:0;width:min(300px,86vw);height:100%;transform:translateX(105%);transition:transform .2s;box-shadow:0 0 40px #0003;visibility:hidden}
 body.nav-open .side{transform:none;visibility:visible}
 .scrim{position:fixed;inset:0;background:#24331c66;z-index:25;border:0;display:none}body.nav-open .scrim{display:block}
 .main{padding-top:18px}
 .savebar .btn{width:100%}
}
@media (min-width:901px){.scrim{display:none}}
</style>
</head>
<body>
<header class="top">
  <a href="{{ route('manage.dashboard') }}"><img src="{{ asset('ui/logo-horizontal.webp') }}" alt="{{ \App\Models\Setting::get('site_name') }}" width="119" height="38"></a>
  <button class="btn ghost small" type="button" id="nav-toggle" aria-controls="side" aria-expanded="false">@include('partials.admin-icon',['name'=>'menu'])<span>القائمة</span></button>
</header>
<div class="shell">
  <aside class="side" id="side">
    <a class="logo" href="{{ route('manage.dashboard') }}"><img src="{{ asset('ui/logo-horizontal.webp') }}" alt="{{ \App\Models\Setting::get('site_name') }}" width="144" height="46"><small>لوحة الإدارة</small></a>
    @include('partials.admin-nav')
    <form class="me" method="post" action="{{ route('logout') }}">@csrf<b>{{ auth()->user()->name }}</b><span>{{ \App\Models\User::ROLES[auth()->user()->isAdminRole() ? 'admin' : auth()->user()->role] }}</span><button class="btn ghost small" type="submit">@include('partials.admin-icon',['name'=>'logout'])تسجيل الخروج</button></form>
  </aside>
  <button class="scrim" type="button" id="nav-scrim" aria-label="إغلاق القائمة" tabindex="-1"></button>
  <main class="main" id="main">
    @include('partials.flash')
    @yield('content')
  </main>
</div>
<script>
(function(){var b=document.body,t=document.getElementById('nav-toggle'),s=document.getElementById('nav-scrim');function set(o){b.classList.toggle('nav-open',o);t.setAttribute('aria-expanded',String(o));}
t.addEventListener('click',function(){set(!b.classList.contains('nav-open'));});s.addEventListener('click',function(){set(false);});document.addEventListener('keydown',function(e){if(e.key==='Escape')set(false);});})();
</script>
</body>
</html>
