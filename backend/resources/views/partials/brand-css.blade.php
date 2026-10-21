<style>
@font-face{font-family:Baloo;src:url("{{ asset('ui/fonts/baloo-arabic.woff2') }}") format("woff2");unicode-range:U+0600-06FF,U+0750-077F,U+0870-08FF,U+FB50-FDFF,U+FE70-FEFF,U+200C-200F;font-display:swap;font-weight:400 800}
@font-face{font-family:Baloo;src:url("{{ asset('ui/fonts/baloo-latin.woff2') }}") format("woff2");unicode-range:U+0000-00FF,U+2000-206F;font-display:swap;font-weight:400 800}
@font-face{font-family:Cairo;src:url("{{ asset('ui/fonts/cairo-arabic.woff2') }}") format("woff2");unicode-range:U+0600-06FF,U+0750-077F,U+08A0-08FF,U+FB50-FDFF,U+FE70-FEFF,U+200C-200F;font-display:swap;font-weight:200 1000}
@font-face{font-family:Cairo;src:url("{{ asset('ui/fonts/cairo-latin.woff2') }}") format("woff2");unicode-range:U+0000-00FF,U+2000-206F,U+2212;font-display:swap;font-weight:200 1000}
:root{--g:#6f9e23;--g2:#6f9e23;--gd:#507a12;--gl:#eef5dc;--leaf:#89b53a;--sun:#ffc83d;--sun-d:#e0a200;--yl:#fff6d8;--sky:#e5f4fc;--b:#2e9fd8;--bd:#1f7fb2;--o:#f08a3c;--ol:#fff0e3;--cream:#fbf9f0;--ink:#24331c;--ink2:#4c5a43;--muted:#5f6b57;--line:#e8e6d6;--red:#e5534b;--red-d:#b8362f;--red-bg:#fdeceb;--r:22px}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--cream);color:var(--ink);font:500 17px/1.8 Cairo,Tahoma,Arial,sans-serif}
h1,h2,h3,.btn,.brand{font-family:Baloo,Cairo,Tahoma,sans-serif;line-height:1.35}
a{color:var(--gd);font-weight:700;text-underline-offset:4px}
:focus-visible{outline:3px solid var(--b);outline-offset:3px;border-radius:12px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:10px;min-height:52px;padding:10px 24px;border:2px solid transparent;border-radius:16px;background:var(--g);color:#fff;font-size:18px;font-weight:800;text-decoration:none;cursor:pointer;box-shadow:0 5px 0 var(--gd);transition:transform .12s,box-shadow .12s,filter .15s;-webkit-tap-highlight-color:transparent}
.btn:hover{filter:brightness(1.06)}
.btn:active{transform:translateY(4px);box-shadow:0 1px 0 var(--gd)}
.btn svg{flex:none;width:22px;height:22px}
.btn.sun{background:var(--sun);color:#3d2c00;box-shadow:0 5px 0 var(--sun-d)}
.btn.ghost{background:#fff;color:var(--gd);border-color:var(--line);box-shadow:0 4px 0 var(--line)}
.btn.danger{background:#fff;color:var(--red-d);border-color:#f3c9c6;box-shadow:0 4px 0 #f3c9c6}
.btn.small{min-height:44px;padding:6px 16px;font-size:16px;border-radius:14px}
.btn.wa{background:#1fa855;box-shadow:0 5px 0 #137a43}
.wide{width:100%}
label{display:block;font-weight:800;margin:0 0 6px;color:var(--ink)}
input,select,textarea{display:block;width:100%;min-height:52px;border:2px solid var(--line);border-radius:14px;padding:10px 16px;background:#fff;color:var(--ink);font:500 17px/1.5 Cairo,Tahoma,sans-serif;transition:border-color .15s,box-shadow .15s}
input:hover,select:hover{border-color:#d6d3bd}
input:focus,select:focus,textarea:focus{outline:0;border-color:var(--g);box-shadow:0 0 0 4px var(--gl)}
input[type=checkbox],input[type=radio]{width:22px;min-height:22px;height:22px;accent-color:var(--g);box-shadow:none}
.field{margin:16px 0}.hint{font-size:15px;color:var(--muted);margin:4px 0 0}
.alert{padding:12px 16px;border-radius:14px;margin:14px 0;font-weight:600}.alert ul{margin:0;padding-inline-start:20px}
.alert.err{background:var(--red-bg);border:2px solid #f3c9c6;color:#8a2a24}.alert.ok{background:var(--gl);border:2px solid #cfe3a8;color:var(--gd)}
.card{background:#fff;border:2px solid var(--line);border-radius:var(--r);padding:24px;box-shadow:0 5px 0 var(--line)}
.chip{display:inline-flex;align-items:center;gap:6px;padding:3px 14px;border-radius:999px;background:var(--gl);color:var(--gd);font-size:15px;font-weight:800;line-height:1.7}
.chip.warn{background:var(--yl);color:#7a5200}.chip.bad{background:var(--red-bg);color:#8a2a24}.chip.grey{background:#efeee5;color:var(--muted)}
.brand{display:inline-flex;align-items:center;gap:10px;text-decoration:none;color:var(--gd);font-weight:800;font-size:22px}
.brand img{width:40px;height:40px}.brand small{display:block;font:500 14px/1.4 Cairo,sans-serif;color:var(--muted)}
table{width:100%;border-collapse:collapse}th,td{padding:10px 8px;border-bottom:1px solid var(--line);text-align:start;vertical-align:top}th{font-size:15px;color:var(--muted)}
.row{display:flex;gap:12px;flex-wrap:wrap;align-items:center}.grid{display:grid;gap:18px}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}
@media (prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}
</style>
