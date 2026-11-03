h1{margin:0;font-size:28px}h2{font-size:21px;margin:0 0 4px}.sub{color:var(--muted);margin:0 0 12px;font-size:15px}
.top2{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:0 0 14px}
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;margin:0 0 16px}
.kpi{background:#fff;border:2px solid var(--line);border-radius:18px;padding:12px 14px}.kpi b{display:block;font:800 30px/1.2 Baloo,Cairo,sans-serif}.kpi span{color:var(--muted);font-weight:700;font-size:15px}
.kpi.warn{border-color:#f0c36d;background:#fff8e6}.kpi.bad{border-color:#eba59f;background:#fff1ef}
.ring{--p:0;width:54px;height:54px;border-radius:50%;background:conic-gradient(var(--g) calc(var(--p)*1%),var(--line) 0);display:grid;place-items:center;float:inline-end}
.ring i{width:40px;height:40px;border-radius:50%;background:#fff;display:grid;place-items:center;font:800 13px Cairo,sans-serif;font-style:normal}
.filters{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 16px}.filters a{padding:6px 14px;border-radius:999px;border:2px solid var(--line);background:#fff;text-decoration:none;font-weight:800;color:var(--ink)}
.filters a.on{background:var(--g);border-color:var(--g);color:#fff}.filters .csv{margin-inline-start:auto;border-style:dashed}
section.card{margin:0 0 18px;overflow-x:auto}
table{width:100%;border-collapse:collapse;font-size:15px}th,td{padding:8px 6px;border-bottom:1px solid var(--line);text-align:start;vertical-align:middle}th{color:var(--muted);font-size:13px;white-space:nowrap}
tr.idle3{background:#fff8e6}tr.idle7,tr.never{background:#fff1ef}
.tag{display:inline-block;border-radius:999px;padding:1px 10px;font-weight:800;font-size:13px;white-space:nowrap}
.t-today{background:#e3f4d7;color:#2f5f10}.t-recent{background:#eef3f8;color:#2d4f70}.t-idle3{background:#ffe7a8;color:#6b4800}.t-idle7,.t-never{background:#ffd2cc;color:#8a2a24}
.bar{height:9px;border-radius:9px;background:var(--line);min-width:70px;overflow:hidden}.bar i{display:block;height:100%;background:var(--g);border-radius:9px}
.cell{display:grid;gap:3px;min-width:84px}.cell small{color:var(--muted);font-size:12px}
.hq{list-style:none;margin:0;padding:0}.hq li{padding:10px 0;border-bottom:1px solid var(--line)}.hq q{font-weight:800;quotes:none}.hq .meta{color:var(--muted);font-size:14px}
.ok{color:#2f5f10;font-weight:800}.no{color:#8a2a24;font-weight:800}
.cols{display:grid;gap:18px;grid-template-columns:minmax(0,1.3fr) minmax(0,1fr)}@media(max-width:860px){.cols{grid-template-columns:1fr}}
.days{display:flex;gap:3px}.days i{width:12px;height:12px;border-radius:3px;background:var(--line)}.days i.on{background:var(--g)}
a.nm{font-weight:800;text-decoration:none}
@media(max-width:600px){h1{font-size:23px}.kpi b{font-size:25px}th.hm,td.hm{display:none}}
.tabs{display:flex;flex-wrap:wrap;gap:8px;margin:0 0 14px}
.f2{display:grid;gap:10px;grid-template-columns:repeat(auto-fit,minmax(180px,1fr))}.f2 label{display:grid;gap:4px;font-weight:800;font-size:14px}
.f2 input,.f2 select,textarea{font:inherit;padding:9px 10px;border:2px solid var(--line);border-radius:12px;background:#fff;width:100%;box-sizing:border-box}
details.u{border:2px solid var(--line);border-radius:14px;padding:6px 10px;margin:6px 0;background:#fff}details.u summary{font-weight:800;cursor:pointer}
.chk{display:flex;gap:8px;align-items:flex-start;padding:5px 0}.chk input{width:20px;height:20px;flex:none;margin-top:3px}
.mine{background:#eef3f8;color:#2d4f70}.bankt{background:#e3f4d7;color:#2f5f10}
.t-done{background:#e3f4d7;color:#2f5f10}.t-late{background:#ffd2cc;color:#8a2a24}.t-partial{background:#ffe7a8;color:#6b4800}.t-todo{background:#eef3f8;color:#2d4f70}
.spark{display:flex;gap:4px;align-items:flex-end;height:44px}.spark i{width:16px;background:var(--g);border-radius:4px 4px 0 0;min-height:2px;position:relative}
.actions{display:flex;flex-wrap:wrap;gap:8px}
@media print{.sh .end,.filters,.noprint,.foot{display:none!important}body{background:#fff}section.card,.kpi{break-inside:avoid;box-shadow:none}main{max-width:none;padding:0}}
