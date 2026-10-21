<style>
@font-face{font-family:Baloo;src:url("{{ route('brand.asset',['asset'=>'fonts/baloo-arabic.woff2']) }}") format("woff2");unicode-range:U+0600-06FF,U+0750-077F,U+FB50-FDFF,U+FE70-FEFF,U+200C-200F;font-display:swap;font-weight:400 800}
@font-face{font-family:Baloo;src:url("{{ route('brand.asset',['asset'=>'fonts/baloo-latin.woff2']) }}") format("woff2");unicode-range:U+0000-00FF;font-display:swap;font-weight:400 800}
@font-face{font-family:Cairo;src:url("{{ route('brand.asset',['asset'=>'fonts/cairo-arabic.woff2']) }}") format("woff2");unicode-range:U+0600-06FF,U+0750-077F,U+FB50-FDFF,U+FE70-FEFF,U+200C-200F;font-display:swap;font-weight:400 800}
@font-face{font-family:Cairo;src:url("{{ route('brand.asset',['asset'=>'fonts/cairo-latin.woff2']) }}") format("woff2");unicode-range:U+0000-00FF;font-display:swap;font-weight:400 800}
:root{--g:#58a700;--g2:#647b43;--gd:#3e5729;--leaf:#89b53a;--sun:#f5b82e;--sun-d:#c98a0c;--sky:#e8f4fb;--cream:#fbf8ef;--ink:#29392b;--muted:#5d6b59;--line:#e2e7d9;--red:#c0392b;--red-bg:#fff1ee;--r:18px}
*{box-sizing:border-box}html{-webkit-text-size-adjust:100%}
body{margin:0;background:var(--cream);color:var(--ink);font:17px/1.85 Cairo,Tahoma,Arial,sans-serif}
h1,h2,h3,.btn,.brand{font-family:Baloo,Cairo,Tahoma,sans-serif}
a{color:var(--gd);text-underline-offset:4px}
:focus-visible{outline:3px solid var(--sun-d);outline-offset:3px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:48px;padding:10px 22px;border:0;border-radius:16px;background:var(--g2);color:#fff;font-size:18px;font-weight:700;text-decoration:none;cursor:pointer;box-shadow:0 4px 0 var(--gd);transition:transform .08s}
.btn:active{transform:translateY(3px);box-shadow:0 1px 0 var(--gd)}
.btn.sun{background:var(--sun);color:#3b2a00;box-shadow:0 4px 0 var(--sun-d)}
.btn.ghost{background:#fff;color:var(--gd);border:2px solid var(--line);box-shadow:0 4px 0 var(--line)}
.btn.danger{background:var(--red);box-shadow:0 4px 0 #7f2219}
.btn.small{min-height:44px;padding:6px 14px;font-size:16px}
.btn.wa{background:#1f9d55;box-shadow:0 4px 0 #13693a}
.wide{width:100%}
label{display:block;font-weight:700;margin:0 0 6px}
input,select,textarea{display:block;width:100%;min-height:48px;border:2px solid #cfd8c4;border-radius:14px;padding:10px 14px;background:#fff;color:var(--ink);font:inherit}
input:focus,select:focus,textarea:focus{border-color:var(--leaf)}
.field{margin:18px 0}.hint{font-size:15px;color:var(--muted);margin:4px 0 0}
.alert{padding:14px 18px;border-radius:14px;margin:16px 0}.alert ul{margin:0;padding-inline-start:20px}
.alert.err{background:var(--red-bg);border:2px solid #e5b1a4;color:#8a3325}.alert.ok{background:#edf6e1;border:2px solid #c3dca0;color:var(--gd)}
.card{background:#fff;border:2px solid var(--line);border-radius:22px;padding:22px;box-shadow:0 4px 0 var(--line)}
.chip{display:inline-block;padding:2px 12px;border-radius:999px;background:#edf6e1;color:var(--gd);font-size:15px;font-weight:700}
.chip.warn{background:#fff4d6;color:#7a5200}.chip.bad{background:var(--red-bg);color:#8a3325}.chip.grey{background:#eef0ea;color:var(--muted)}
.brand{display:inline-flex;align-items:center;gap:10px;text-decoration:none;color:var(--gd);font-weight:800;font-size:22px}
.brand img{width:40px;height:40px}.brand small{display:block;font:500 14px/1.4 Cairo,sans-serif;color:var(--muted)}
table{width:100%;border-collapse:collapse}th,td{padding:10px 8px;border-bottom:1px solid var(--line);text-align:start;vertical-align:top}th{font-size:15px;color:var(--muted)}
.row{display:flex;gap:12px;flex-wrap:wrap;align-items:center}.grid{display:grid;gap:16px}
.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0)}
@media (prefers-reduced-motion:reduce){*{transition:none!important}}
</style>
