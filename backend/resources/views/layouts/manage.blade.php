<!doctype html>
<html lang="ar" dir="rtl">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="robots" content="noindex,nofollow">
<meta name="theme-color" content="#f3f5ee">
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
.stat b{display:block;font:700 30px/1.2 Baloo,Cairo,sans-serif;color:var(--ink)}.stat span{color:var(--muted);font-weight:700;font-size:15px;line-height:1.5}
.subj{display:flex;flex-direction:column;gap:6px}.subj h3{margin:0}
.filters{display:flex;gap:12px;flex-wrap:wrap;align-items:end;margin:0 0 16px;padding:14px 16px;background:#fff;border:2px solid var(--line);border-radius:20px}
.filters>*{flex:1 1 200px}.filters>.go{flex:0 0 auto}
.filters label{font-size:14px;margin-bottom:4px}.filters input,.filters select{min-height:46px}
.bulk{display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:0 0 12px;padding:10px 14px;background:var(--yl);border:2px dashed #f0d98a;border-radius:16px;font-weight:700}
.bulk select,.bulk input[type=number]{min-height:44px;width:auto}
.table-wrap{overflow-x:auto;background:#fff;border:2px solid var(--line);border-radius:20px;box-shadow:0 5px 0 var(--line)}
.table-wrap table th{background:#f7f8ef;font-weight:700;white-space:nowrap;padding:12px 14px}
.table-wrap table td{padding:12px 14px;vertical-align:middle}
.table-wrap tbody tr:hover td{background:#fbfcf6}.table-wrap tbody tr:last-child td{border-bottom:0}
.table-wrap .empty{text-align:center;color:var(--muted);padding:28px}
td small{color:var(--muted)}td .row{gap:8px}
.mono{font-family:Baloo,Cairo,sans-serif;font-weight:700;letter-spacing:.5px}
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
.prices td,.prices th{vertical-align:middle}.prices input{max-width:140px;min-height:46px;text-align:center;font-weight:700}
.money{display:flex;align-items:center;gap:8px}.money span{color:var(--muted);font-weight:700;white-space:nowrap}
.grade-sep td{background:#f3f7ec!important;font:700 15px/1.4 Baloo,Cairo,sans-serif;color:var(--gd)}

/* ---- admin3: readable zero, export menu, aligned stats, activity, facts, stacked tables ---- */
.n{display:inline-flex;align-items:baseline;direction:ltr;unicode-bidi:isolate}
.n,.n>span{font:inherit!important;color:inherit!important;margin:0!important} /* digits split around a drawn zero keep the number's own size (not the card label's) */
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
.grid.dash{grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));align-items:start;margin-top:22px}
.meter{margin:10px 0}.meter-row{display:flex;align-items:baseline;justify-content:flex-start;gap:10px;margin-bottom:4px}.meter-row b{margin-inline-start:auto;font:700 18px/1.3 Baloo,Cairo,sans-serif}.meter-row b small{font:700 14px/1 Cairo,sans-serif;color:var(--muted)}
.list.act li{display:grid;grid-template-columns:minmax(0,1fr);gap:4px;align-items:stretch}
.act-top{display:flex;align-items:center;gap:8px;min-width:0}
.act-top .who{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:700}
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
.facts dd{margin:2px 0 0;min-width:0;font-weight:700}
.grid.subjects{grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr))}
.subj{display:flex;flex-direction:column;gap:10px;background:#fff;border:2px solid var(--line);border-radius:20px;padding:16px;min-width:0}
.lesson .meter-row{justify-content:flex-start}.lesson .meter-row span{color:var(--ink2);font-weight:700;min-width:8.5em}.lesson .meter-row b{margin-inline-start:0}
.head .btn,.head .menu{flex:none;white-space:nowrap}
.lesson .pct{color:var(--muted);font-weight:700}
.kv{margin:0;display:grid;gap:0}.kv>div{display:flex;align-items:baseline;gap:12px;padding:8px 0;border-bottom:1px dashed var(--line)}.kv>div:last-child{border-bottom:0}
.kv dt{color:var(--ink2);font-weight:700;min-width:8.5em}.kv dd{margin:0;font:700 16px/1.5 Baloo,Cairo,sans-serif;color:var(--ink)}.kv dd small{font:600 13px/1 Cairo,sans-serif;color:var(--muted)}.kv .none{font:600 14px/1.5 Cairo,sans-serif;color:var(--muted)}
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
@font-face{font-family:Plex;src:url("{{ asset('ui/fonts/plex-arabic-400.woff2') }}") format("woff2");unicode-range:U+0600-06FF,U+0750-077F,U+0870-08FF,U+FB50-FDFF,U+FE70-FEFF,U+200C-200F;font-weight:400;font-display:swap}
@font-face{font-family:Plex;src:url("{{ asset('ui/fonts/plex-latin-400.woff2') }}") format("woff2");unicode-range:U+0000-00FF,U+2000-206F,U+2212,U+20AA;font-weight:400;font-display:swap}
@font-face{font-family:Plex;src:url("{{ asset('ui/fonts/plex-arabic-500.woff2') }}") format("woff2");unicode-range:U+0600-06FF,U+0750-077F,U+0870-08FF,U+FB50-FDFF,U+FE70-FEFF,U+200C-200F;font-weight:500;font-display:swap}
@font-face{font-family:Plex;src:url("{{ asset('ui/fonts/plex-latin-500.woff2') }}") format("woff2");unicode-range:U+0000-00FF,U+2000-206F,U+2212,U+20AA;font-weight:500;font-display:swap}
@font-face{font-family:Plex;src:url("{{ asset('ui/fonts/plex-arabic-600.woff2') }}") format("woff2");unicode-range:U+0600-06FF,U+0750-077F,U+0870-08FF,U+FB50-FDFF,U+FE70-FEFF,U+200C-200F;font-weight:600;font-display:swap}
@font-face{font-family:Plex;src:url("{{ asset('ui/fonts/plex-latin-600.woff2') }}") format("woff2");unicode-range:U+0000-00FF,U+2000-206F,U+2212,U+20AA;font-weight:600;font-display:swap}
@font-face{font-family:Plex;src:url("{{ asset('ui/fonts/plex-arabic-700.woff2') }}") format("woff2");unicode-range:U+0600-06FF,U+0750-077F,U+0870-08FF,U+FB50-FDFF,U+FE70-FEFF,U+200C-200F;font-weight:700;font-display:swap}
@font-face{font-family:Plex;src:url("{{ asset('ui/fonts/plex-latin-700.woff2') }}") format("woff2");unicode-range:U+0000-00FF,U+2000-206F,U+2212,U+20AA;font-weight:700;font-display:swap}
/* IBM Plex Sans Arabic for every piece of the admin UI (self-hosted in public/ui/fonts) */
.shell,.shell :not(pre):not(code):not(svg):not(path),.top,.top *{font-family:Plex,Cairo,Tahoma,sans-serif!important}
/* =====================================================================
   Admin skin «زيتون وتطريز»: a deep olive sidebar with a tatreez (cross-stitch)
   band on its edge, a clean light canvas, Cairo for the UI and Baloo for numbers.
   Scoped to the management panel; the public site keeps brand-css as is.
   ===================================================================== */
:root{--olive:#1f3524;--olive2:#2a4630;--olive-ink:#dfe8d6;--olive-mute:#9fb39a;
 --canvas:#f4f6f1;--surface:#fff;--line:#e1e6dc;--line2:#edf0e9;--ink:#15201a;--ink2:#3c4a40;--muted:#5d6a61;
 --g:#4f8a1b;--gd:#3c6c12;--gl:#eaf3dc;--leaf:#6ea82c;--sun:#e9a800;--yl:#fff4cc;--clay:#b5372a;--red:#c8442f;--red-d:#a3301f;--red-bg:#fbe9e6;--sky:#e3f0f9;--b:#1f78b4;--bd:#175f8f;
 --sh:0 1px 2px rgba(21,32,26,.05),0 2px 8px rgba(21,32,26,.04);--sh-lg:0 14px 36px rgba(21,32,26,.14);--r:16px;
 --stitch-v:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='24'%3E%3Cg stroke-width='2' stroke-linecap='round'%3E%3Cpath d='M4 4l6 6M10 4l-6 6' stroke='%23e9a800' stroke-opacity='.55'/%3E%3Cpath d='M4 16l6 6M10 16l-6 6' stroke='%23e9a800' stroke-opacity='.55'/%3E%3C/g%3E%3C/svg%3E");--stitch-h:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='12'%3E%3Cg stroke-width='1.8' stroke-linecap='round'%3E%3Cpath d='M3.5 3.5l5 5M8.5 3.5l-5 5' stroke='%23e9a800'/%3E%3Cpath d='M15.5 3.5l5 5M20.5 3.5l-5 5' stroke='%23e9a800'/%3E%3C/g%3E%3C/svg%3E")}
body{background:var(--canvas);font:400 14.5px/1.7 Plex,sans-serif;color:var(--ink)}
h1,h2,h3,h4,.btn,.brand,.menu-list a,.mono{font-family:Plex,sans-serif}
:focus-visible{outline:3px solid var(--b);outline-offset:2px;border-radius:10px}
/* page head: the title is the one large display line on every page */
.head{margin:0 0 22px}
.head h1{font:700 clamp(24px,2.4vw,28px)/1.3 Plex,sans-serif;letter-spacing:0;color:var(--ink)}
.head h1 small{font:500 14px/1.4 Plex,sans-serif;color:var(--muted)}
.lead,.hint{color:var(--muted)}
/* buttons */
.btn{min-height:40px;padding:8px 16px;border:1px solid transparent;border-radius:10px;background:var(--g);color:#fff;font:600 14.5px/1.4 Plex,sans-serif;box-shadow:0 1px 0 rgba(0,0,0,.08);gap:8px;transition:background .15s,border-color .15s,box-shadow .15s}
.btn:hover{background:var(--gd);filter:none}.btn:active{transform:translateY(1px);box-shadow:none}
.btn svg,.btn .ico{width:18px;height:18px}
.btn.ghost{background:var(--surface);color:var(--ink2);border-color:var(--line);box-shadow:none}.btn.ghost:hover{background:#f6f8f3;border-color:#cfd6c8;color:var(--ink)}
.btn.small{min-height:36px;padding:5px 13px;font-size:14px;border-radius:10px}
.btn.danger{background:var(--surface);color:var(--red-d);border-color:#f0cfc9;box-shadow:none}.btn.danger:hover{background:var(--red-bg)}
.btn.sun{background:var(--sun);color:#3b2a00;box-shadow:none}.btn.wa{box-shadow:none}
/* forms */
label{font-weight:500;font-size:13px;color:var(--ink2)}
input,select,textarea{min-height:42px;border:1px solid #d3dacd;border-radius:11px;padding:8px 12px;background:var(--surface);font:500 15px/1.5 Plex,sans-serif}
input:hover,select:hover{border-color:#bfc8b8}
input:focus,select:focus,textarea:focus{border-color:var(--g);box-shadow:0 0 0 3px rgba(79,138,27,.18)}
input[type=checkbox],input[type=radio]{width:18px;height:18px;min-height:18px;accent-color:var(--g)}
.filters input,.filters select,.bulk select,.bulk input[type=number],.prices input{min-height:40px}
/* surfaces */
.card,.stat,.table-wrap,.filters,.facts>div,.subj,.savebar,.sb-fam>article{background:var(--surface);border:1px solid var(--line);border-radius:var(--r);box-shadow:var(--sh)}
.card{padding:20px 22px}
.card h2{font:600 16px/1.45 Plex,sans-serif;margin:0 0 14px;gap:9px;color:var(--ink)}.card h2 .ico{width:20px;height:20px;color:var(--g)}
.card h3{font:600 15px/1.5 Plex,sans-serif}
.alert{border-width:1px;border-radius:12px;box-shadow:none;font-size:15px}.alert.err{box-shadow:none}
.bulk,.note{border-width:1px;border-radius:12px}
.danger-zone{border-color:#f0cfc9;box-shadow:var(--sh)}
.savebar{box-shadow:var(--sh-lg)}
.menu-list{border:1px solid var(--line);border-radius:12px;box-shadow:var(--sh-lg);padding:6px}
.menu-list a{min-height:40px;border-radius:8px;font:600 15px/1.4 Plex,sans-serif}
.chip{font:500 13px/1.7 Plex,sans-serif;padding:1px 10px;gap:5px}.chip:before{width:6px;height:6px}
.pill{font:600 12.5px/1.4 Plex,sans-serif}
/* tables */
.table-wrap table th{background:#f6f8f3;color:var(--muted);font:500 13px/1.5 Plex,sans-serif;padding:11px 14px;border-bottom:1px solid var(--line)}
.table-wrap table td{padding:12px 14px;border-bottom:1px solid var(--line2);font-size:14.5px}
.table-wrap tbody tr:hover td{background:#f9fbf6}
/* stat tiles used across pages (subscriptions, live, ...) */
.stats{grid-template-columns:repeat(auto-fit,minmax(200px,1fr))}
.stat{grid-template-columns:42px minmax(0,1fr);gap:12px;padding:14px 16px}
.stat .ic{width:42px;height:42px;border-radius:12px}.stat .ic .ico{width:21px;height:21px}
.stat b,.stat .txt b{font:600 26px/1.15 Plex,sans-serif;font-variant-numeric:tabular-nums;color:var(--ink)}
.stat span,.stat .txt span{font:500 13px/1.5 Plex,sans-serif;color:var(--muted)}
.stat .txt small{font:600 12.5px/1.5 Plex,sans-serif;color:var(--gd)}
/* shell: the olive sidebar and its tatreez edge */
.side{background:var(--olive);color:var(--olive-ink);border-inline-end:0;padding:20px 26px 16px 14px;gap:12px}
.side{background-color:var(--olive);background-image:var(--stitch-v);background-size:14px 24px;background-position:right 4px top 6px;background-repeat:repeat-y;scrollbar-width:thin;scrollbar-color:#46644b transparent}
.side .logo{border-bottom:1px solid rgba(255,255,255,.10);padding:2px 10px 16px}
.side .logo img{height:40px}
.side .logo small{font:500 12.5px/1.4 Plex,sans-serif;color:var(--olive-mute)}
.side .admin-nav .nav-group{color:#86a07f;font:500 12px/1.4 Plex,sans-serif;margin:18px 12px 6px}
.side .admin-nav .nav-group:first-child{margin-top:2px}
.side .admin-nav .nav-item{color:#d3dfcb;border-radius:10px;font:500 14.5px/1.4 Plex,sans-serif;min-height:40px}
.side .admin-nav .nav-item .ico{color:#8fab86}
.side .admin-nav .nav-item:hover{background:rgba(255,255,255,.07);color:#fff}.side .admin-nav .nav-item:hover .ico{color:#cfe3b8}
.side .admin-nav .nav-item[aria-current=page]{background:var(--canvas);color:var(--olive);font-weight:600}
.side .admin-nav .nav-item[aria-current=page] .ico{color:var(--g)}
.side .admin-nav .nav-item[aria-current=page]:before{display:none}
.side .admin-nav .nav-item:focus-visible{outline-color:var(--sun)}
.me{border:1px solid rgba(255,255,255,.12);border-radius:14px;background:var(--olive2);padding:12px}
.me b{font:600 14.5px/1.5 Plex,sans-serif;color:#fff}.me span{font-size:13px;color:var(--olive-mute)}
.me .btn.ghost{background:transparent;color:#e7efdf;border-color:rgba(255,255,255,.22)}.me .btn.ghost:hover{background:rgba(255,255,255,.08);color:#fff}
.top{background:var(--olive);border-bottom:0;padding-bottom:16px}
.top:after{content:"";position:absolute;inset-inline:0;bottom:0;height:12px;background:var(--stitch-h) right top/24px 12px repeat-x;opacity:.4}
.top .btn.ghost{background:transparent;color:#fff;border-color:rgba(255,255,255,.3)}
.scrim{background:rgba(15,26,18,.5)}
.main{padding:30px clamp(16px,3vw,44px) 60px}
.bar-track{height:9px;border-radius:6px;background:#e9ede4}.bar{height:9px;border-radius:6px;background:linear-gradient(90deg,var(--leaf),var(--g))}
.list li{border-bottom:1px solid var(--line2);font-size:14.5px}

/* ---- dashboard ---- */
.dash-head{align-items:flex-end;margin-bottom:22px}.dash-head .row{gap:8px}
.dash-date{margin:4px 0 0;color:var(--muted);font:500 13.5px/1.4 Plex,sans-serif}
/* «ينتظرك اليوم»: what to act on first; its header carries the tatreez band */
.inbox{padding:0;overflow:hidden;margin:0 0 22px}
.inbox-head{position:relative;display:flex;align-items:center;gap:10px;padding:14px 22px;border-bottom:1px solid var(--line2);background:#fff}

.inbox-head h2{margin:0;font:600 17px/1.4 Plex,sans-serif}.inbox-head h2 .ico{color:var(--muted)}
.todo-item{display:grid;grid-template-columns:40px minmax(0,1fr) auto 18px;align-items:center;gap:16px;padding:15px 22px;color:var(--ink);text-decoration:none;border-bottom:1px solid var(--line2);position:relative;transition:background .15s}
.todo-item:last-child{border-bottom:0}
.todo-item:before{content:"";position:absolute;inset-block:0;inset-inline-start:0;width:4px;background:var(--tone)}
.todo-item:hover{background:#fafbf7}.todo-item:hover>.ico:last-child{transform:translateX(-3px);color:var(--ink2)}
.todo-item .ic{display:grid;place-items:center;width:40px;height:40px;border-radius:12px;background:var(--tone-bg);color:var(--tone-ink)}.todo-item .ic .ico{width:20px;height:20px}
.todo-item .txt{display:flex;flex-direction:column;min-width:0}
.todo-item .txt>span{font:600 15px/1.5 Plex,sans-serif}.todo-item .txt small{color:var(--muted);font:500 13.5px/1.5 Plex,sans-serif}
.todo-item>b{font:700 30px/1 Plex,sans-serif;color:var(--tone-ink);font-variant-numeric:tabular-nums}
.todo-item>.ico:last-child{width:18px;height:18px;color:#a7b0a1;transition:transform .15s}
.todo-item.t-o{--tone:#e07a2e;--tone-bg:#fdeee2;--tone-ink:#9a4a0c}
.todo-item.t-sun{--tone:var(--sun);--tone-bg:var(--yl);--tone-ink:#7a5200}
.todo-item.t-red{--tone:var(--clay);--tone-bg:var(--red-bg);--tone-ink:var(--red-d)}
.todo-ok{display:flex;align-items:center;gap:10px;margin:0;padding:18px 22px;color:var(--gd);font-weight:500}.todo-ok .ico{width:20px;height:20px}
/* the numbers: one strip of four, big Baloo figures, quiet extras in the footer */
.kpi{padding:0;overflow:hidden;margin:0 0 22px}
.kpi-cells{display:grid;grid-template-columns:repeat(4,minmax(0,1fr))}
.kpi .stat{display:block;border:0;border-radius:0;box-shadow:none;padding:20px 22px;border-inline-start:1px solid var(--line2);min-width:0;background:none}
.kpi .stat:first-child{border-inline-start:0}
.kpi .stat .ic{display:none}
.kpi .stat .txt{display:flex;flex-direction:column;align-items:flex-start;gap:0}
.kpi .stat .txt>b{order:2;font:600 32px/1.15 Plex,sans-serif;color:var(--ink);margin-top:2px;font-variant-numeric:tabular-nums}
.kpi .stat .txt>span{order:1;font:500 13px/1.5 Plex,sans-serif;color:var(--muted)}
.kpi .stat .txt>small{order:3;color:var(--muted);font:500 12.5px/1.5 Plex,sans-serif;margin-top:2px}



.grid.dash{gap:22px;margin-top:0}
.meter{margin:0 0 12px}.meter-row{margin-bottom:5px}.meter-row span{font:500 14px/1.5 Plex,sans-serif;color:var(--ink2)}.meter-row b{font:600 15px/1.3 Plex,sans-serif}
.list.cols{columns:2 220px;column-gap:28px}.list.cols li{break-inside:avoid;padding:8px 0}
.list.cols .chip{background:#eef2e8;color:var(--ink2);font-family:Plex,sans-serif}.list.cols .chip:before{display:none}
.more{font-size:14px}
@media (max-width:900px){.kpi-cells{grid-template-columns:repeat(2,minmax(0,1fr))}.kpi .stat:nth-child(3){border-inline-start:0}.kpi .stat:nth-child(n+3){border-top:1px solid var(--line2)}}
@media (max-width:640px){
 .card{padding:16px}.inbox,.kpi{padding:0}
 .inbox-head,.todo-item,.req,.req-head{padding-inline:16px}.todo-item{gap:12px;grid-template-columns:36px minmax(0,1fr) auto 16px}.todo-item>b{font-size:26px}
 .kpi .stat{padding:15px 16px;min-height:0}.kpi .stat .txt b{font-size:32px}
 
 .stats{gap:10px;grid-template-columns:repeat(2,minmax(0,1fr))}.stat{border-radius:12px}
 .head.dash-head{flex-wrap:wrap}.head h1{font-size:26px}
}
@media (prefers-reduced-motion:reduce){.todo-item,.todo-item>.ico:last-child{transition:none}}
/* ---- charts: one series each, olive marks, recessive axes; motion on first paint only ---- */
.sec-head{display:flex;align-items:baseline;gap:12px;flex-wrap:wrap;margin:0 0 12px}
.sec-head h2{margin:0;font-size:19px;font-weight:700}
.sec-head .hint{margin:0;font-size:13px}





.grid.dash.charts{margin-bottom:22px}
.chart-card h2 small{margin-inline-start:auto;color:var(--muted);font-size:13px;font-weight:600}
.chart-sum{margin:-6px 0 10px;color:var(--muted);font-weight:600}
.chart-sum b{color:var(--ink);font-size:24px;font-weight:600;font-variant-numeric:tabular-nums;margin-inline-end:4px}
.chart{display:block;width:100%;height:auto;overflow:visible}
.chart .mark{fill:var(--g);transition:fill .15s}
.chart .zero{fill:#dfe5d8}
.chart .base{stroke:#dfe5d8;stroke-width:1}
.chart .grid{stroke:#edf0e9;stroke-width:1}
.chart .ax{fill:var(--muted);font-size:11.5px;font-weight:500}
.chart .cap{fill:var(--ink);font-size:12.5px;font-weight:600}
.chart .hit{fill:transparent}
.chart .col{cursor:default}.chart .col:hover .mark{fill:var(--gd)}
.chart .fill{fill:var(--g);opacity:.1}
.chart .ln{fill:none;stroke:var(--g);stroke-width:2;stroke-linejoin:round;stroke-linecap:round}
.chart .end{fill:var(--g);stroke:#fff;stroke-width:2}
.chart .pt .xh{stroke:var(--ink2);stroke-width:1;opacity:0}
.chart .pt .dot{fill:var(--g);stroke:#fff;stroke-width:2;opacity:0}
.chart .pt:hover .xh,.chart .pt:hover .dot{opacity:1}
/* hover tooltip (one element for the page, moved by the script below) */
.ctip{position:fixed;z-index:60;pointer-events:none;max-width:280px;padding:6px 11px;border-radius:9px;background:var(--ink);color:#fff;font-size:13px;font-weight:500;line-height:1.5;box-shadow:var(--sh-lg);opacity:0;transform:translateY(4px);transition:opacity .12s,transform .12s}
.ctip.on{opacity:1;transform:none}
/* entrance: cards rise in order, columns grow from the baseline, the line draws itself, bars fill from the start edge */
@keyframes rise{from{opacity:0;transform:translateY(10px)}}
@keyframes grow{from{transform:scaleY(0)}}
@keyframes growx{from{transform:scaleX(0)}}
@keyframes draw{from{stroke-dashoffset:1}}
@keyframes fade{from{opacity:0}}
.main>.inbox,.main>.kpi,.main>.grid>.card,.main>.matrix-card{animation:rise .5s cubic-bezier(.2,.7,.2,1) both}
.main>.kpi{animation-delay:.06s}.main>.main>.grid>.card:nth-child(1){animation-delay:.18s}.main>.grid>.card:nth-child(2){animation-delay:.24s}.main>.grid>.card:nth-child(3){animation-delay:.3s}.main>.grid>.card:nth-child(4){animation-delay:.36s}
.chart .col .mark{transform-box:fill-box;transform-origin:50% 100%;animation:grow .65s cubic-bezier(.2,.7,.2,1) both;animation-delay:calc(.3s + var(--i) * 50ms)}
.chart .ln{stroke-dasharray:1;stroke-dashoffset:0;animation:draw 1.2s cubic-bezier(.3,.6,.2,1) both .35s}
.chart .fill{animation:fade .8s ease-out both .9s}.chart .end{animation:fade .3s ease-out both 1.45s}
.bar{transform-origin:right center;animation:growx .8s cubic-bezier(.2,.7,.2,1) both .35s}
.todo-item{animation:rise .45s cubic-bezier(.2,.7,.2,1) both}.todo-item:nth-child(3){animation-delay:.08s}.todo-item:nth-child(4){animation-delay:.16s}

@media (max-width:640px){}
@media (prefers-reduced-motion:reduce){.main *,.chart *{animation:none!important;transition:none!important}.ctip{transition:none}}


.stat .ic,.stat[class*="t-"] .ic{background:#eef2e8;color:var(--g)}
/* ---- dashboard v3: actionable inbox, KPI cells with their week, subject matrix ---- */
.count{display:inline-grid;place-items:center;min-width:24px;height:22px;padding:0 7px;margin-inline-start:6px;border-radius:999px;background:#eef2e8;color:var(--ink);font:600 13px/1 Plex,sans-serif;font-variant-numeric:tabular-nums;vertical-align:1px}
.todo-item{grid-template-columns:40px minmax(0,1fr) 18px}
.todo-item.t-sun .count{background:var(--yl);color:#7a5200}.todo-item.t-red .count{background:var(--red-bg);color:var(--red-d)}
.req-group{border-bottom:1px solid var(--line2);box-shadow:inset -4px 0 0 #e07a2e}
.req-head{display:grid;grid-template-columns:40px minmax(0,1fr) auto;align-items:center;gap:16px;padding:14px 22px 8px}
.req-head .ic{display:grid;place-items:center;width:40px;height:40px;border-radius:12px;background:#fdeee2;color:#9a4a0c}.req-head .ic .ico{width:20px;height:20px}
.req-head b{font-weight:600;font-size:15px}.req-head .count{background:#fdeee2;color:#9a4a0c}.req-head small{display:block;color:var(--muted);font-size:13px}
.more-link{font-size:13.5px;font-weight:500}
.req{display:grid;grid-template-columns:minmax(150px,1.2fr) minmax(0,1.5fr) auto auto;align-items:center;gap:14px;padding:10px 22px 10px 22px;margin-inline-start:56px;border-top:1px solid var(--line2)}
.req-who{display:flex;flex-direction:column;min-width:0}.req-who b{font-weight:600}.req-who small{color:var(--muted);font-size:12.5px}
.req-subj{display:flex;flex-wrap:wrap;gap:6px}.req-subj .pill{background:#f2f4ed;color:var(--ink2)}
.req-total{font-weight:600;font-variant-numeric:tabular-nums;white-space:nowrap}
.req-acts{display:flex;gap:8px}.req-acts form{margin:0}
.kpi .stat{display:flex;flex-direction:column;justify-content:space-between;gap:10px}
.kpi .stat .chart{max-width:220px}
.matrix-card{margin:22px 0 0}.matrix-card h2 small{margin-inline-start:auto;color:var(--muted);font-size:13px;font-weight:500}
.matrix-wrap{overflow-x:auto}
.matrix{width:100%;border-collapse:separate;border-spacing:4px;min-width:520px}
.matrix th{font-weight:500;font-size:13px;color:var(--muted);text-align:center;padding:4px 6px;border:0}
.matrix tbody th{text-align:start;color:var(--ink2);white-space:nowrap}
.matrix td{padding:0;border:0;text-align:center}
.matrix .heat{display:grid;place-items:center;height:36px;border-radius:8px;background:rgba(79,138,27,var(--a));color:var(--ink);font-weight:600;font-variant-numeric:tabular-nums}
.matrix .heat.dark{color:#fff}.matrix .heat.zero{background:#f3f5ef;color:#a3ab9c;font-weight:400}
.matrix td.na{color:#c3c9bc}
@media (max-width:900px){.req{grid-template-columns:minmax(0,1fr) auto;margin-inline-start:0}.req-subj{grid-column:1/-1;grid-row:2}.req-acts{grid-column:1/-1}}
@media (max-width:640px){.kpi .stat .chart{max-width:none}.req-head{padding-inline:16px}}
/* Activity feed: day headings, one line per entry, colour by kind, time at the end */
.feed{list-style:none;margin:0;padding:0}
.feed-day{position:sticky;top:0;z-index:1;margin:14px 0 2px;padding:4px 0;background:var(--surface);color:var(--muted);font:600 12.5px/1.4 Plex,sans-serif;letter-spacing:.2px}
.feed-day:first-child{margin-top:0}
.ev{--ev:var(--muted);--ev-bg:#eef2e8;display:grid;grid-template-columns:32px minmax(0,1fr) auto;gap:10px;align-items:start;padding:8px 0;border-bottom:1px solid var(--line2)}
.feed .ev:last-child,.ev:has(+ .feed-day){border-bottom:0}
.ev-ic{display:grid;place-items:center;width:32px;height:32px;border-radius:10px;background:var(--ev-bg);color:var(--ev)}.ev-ic .ico{width:17px;height:17px}
.ev.t-sky{--ev:var(--bd);--ev-bg:var(--sky)}.ev.t-green{--ev:var(--gd);--ev-bg:var(--gl)}.ev.t-amber{--ev:#7a5200;--ev-bg:var(--yl)}.ev.t-red{--ev:var(--red-d);--ev-bg:var(--red-bg)}.ev.t-olive{--ev:var(--olive2);--ev-bg:#eef2e8}
.ev-body{min-width:0;display:grid;gap:4px;padding-top:5px}
.ev-line{margin:0;display:flex;flex-wrap:wrap;align-items:baseline;gap:2px 6px;font-size:14.5px;line-height:1.5;color:var(--ink2)}
.ev-line .who{font-weight:600;color:var(--ink);text-decoration:none;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}a.who:hover{color:var(--gd);text-decoration:underline}
.ev-what{color:var(--muted)}
.ev-obj{font-weight:600;color:var(--ink);overflow-wrap:anywhere;unicode-bidi:isolate}.ev-obj:before{content:"·";margin-inline-end:6px;color:var(--muted);font-weight:400}
.ev-n{font:600 12px/1.6 Plex,sans-serif;padding:0 7px;border-radius:999px;background:#eef2e8;color:var(--ink2)}
.ev-meta{color:var(--muted);font-size:12.5px;text-align:right;unicode-bidi:plaintext;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ev .act-items{gap:5px}.ev .act-items small{font-weight:500;font-size:12.5px}.ev .pill{background:#f2f4ed;color:var(--ink2)}
.ev-time{padding-top:6px;color:var(--muted);font:500 12.5px/1.5 Plex,sans-serif;white-space:nowrap;font-variant-numeric:tabular-nums}
/* Brand: the mascot keeps its colours on the olive bars; the name is live white text (no inverted wordmark) */
.brand{display:flex;align-items:center;gap:10px;min-width:0;color:#fff;text-decoration:none}
.brand img,.side .logo .brand img,.top .brand img{flex:none;width:auto;filter:drop-shadow(0 1px 1px rgba(0,0,0,.25));opacity:1}
.side .logo .brand img{height:44px}.top .brand img{height:38px}
.brand b{font:700 20px/1.2 Plex,sans-serif;color:#fff;letter-spacing:-.2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.top .brand b{font-size:18px}
.side .logo small{margin-top:6px;padding-inline-start:44px}
</style>
</head>
<body>
<header class="top">
  <a class="brand" href="{{ route('manage.dashboard') }}"><img src="{{ asset('ui/logo-mascot.webp') }}" alt="" width="30" height="38"><b>{{ \App\Models\Setting::get('site_name') }}</b></a>
  <button class="btn ghost small" type="button" id="nav-toggle" aria-controls="side" aria-expanded="false">@include('partials.admin-icon',['name'=>'menu'])<span>القائمة</span></button>
</header>
<div class="shell">
  <aside class="side" id="side">
    <a class="logo" href="{{ route('manage.dashboard') }}"><span class="brand"><img src="{{ asset('ui/logo-mascot.webp') }}" alt="" width="34" height="44"><b>{{ \App\Models\Setting::get('site_name') }}</b></span><small>لوحة الإدارة</small></a>
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
<script>
/* Chart tooltips (pointer) and numbers that count up on first paint. */
(function(){var tip=document.createElement('div');tip.className='ctip';tip.setAttribute('role','status');document.body.appendChild(tip);
function show(el,x,y){tip.textContent=el.getAttribute('data-tip');tip.classList.add('on');var w=tip.offsetWidth,h=tip.offsetHeight;tip.style.left=Math.max(8,Math.min(innerWidth-w-8,x-w/2))+'px';tip.style.top=Math.max(8,y-h-14)+'px';}
function hide(){tip.classList.remove('on');}
document.addEventListener('pointermove',function(e){var el=e.target.closest&&e.target.closest('.chart [data-tip]');if(el)show(el,e.clientX,e.clientY);else hide();});
document.addEventListener('pointerleave',hide);
var still=matchMedia('(prefers-reduced-motion: reduce)').matches;if(still)return;
document.querySelectorAll('.kpi .stat .txt>b').forEach(function(el){var orig=el.textContent,to=parseInt(orig.replace(/[^0-9]/g,''),10);if(!(to>1)||el.children.length>1)return;var t0=null,dur=Math.min(1100,500+to*4);
el.style.fontVariantNumeric='tabular-nums';function step(t){if(t0===null)t0=t;var k=Math.min(1,(t-t0)/dur),v=Math.round(to*(1-Math.pow(1-k,3)));el.textContent=k<1?String(v):orig;if(k<1)requestAnimationFrame(step);}el.textContent='0';requestAnimationFrame(step);});
})();
</script>
</body>
</html>
