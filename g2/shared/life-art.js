/* Small local diagrams for life education. No audio, network or student data. */
(() => {
  'use strict';
  const base = window.G1_ART;
  const ink = '#385346', blue = '#a7d0e6', green = '#b8d58f';
  const svg = (label, body, width = 340, height = 220) => `<svg class="g1-life-art" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${label}" style="display:block;width:100%;max-width:${width}px;max-height:280px;margin:auto;overflow:visible"><g stroke="${ink}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">${body}</g></svg>`;
  const text = (x, y, value, size = 25) => `<text x="${x}" y="${y}" text-anchor="middle" direction="rtl" fill="${ink}" stroke="none" font-family="inherit" font-size="${size}">${value}</text>`;
  function waterState(state, label = false) {
    if (label) return waterState(state) + `<p style="font-size:20px;line-height:1.7;margin:4px 0;text-align:center">${state === 'ice' ? 'جليد: صلب' : state === 'liquid' ? 'ماء: سائل' : 'بخار الماء: غاز'}</p>`;
    if (state === 'ice') return svg('رسم مكعّب جليد', `<path fill="${blue}" d="M75 70 160 35 245 70 245 160 160 195 75 160Z"/><path fill="none" d="m75 70 85 36 85-36m-85 36v89"/>${label ? text(160, 218, 'جليد: صلب') : ''}`, 320, 235);
    if (state === 'liquid') return svg('ماء سائل في كأس', `<path fill="#fff" d="m100 40 15 150h100l15-150Z"/><path fill="${blue}" d="m105 90 10 100h100l10-100q-30-12-60 0t-60 0Z"/>${label ? text(165, 218, 'ماء: سائل') : ''}`, 320, 235);
    return svg('تمثيل تخطيطي لجزيئات بخار الماء؛ الغاز نفسه غير مرئي', `<rect x="45" y="25" width="235" height="155" rx="18" fill="none" stroke-dasharray="6 7"/>${[[70,58],[180,46],[251,73],[112,120],[220,142],[62,157]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="7" fill="${blue}"/>`).join('')}`, 330, 205) + '<p style="font-size:20px;line-height:1.7;text-align:center">بخار الماء غير مرئي.</p>';
  }
  function plant(d) {
    const highlight = part => d.focus === part ? '#dc8e41' : ink;
    return svg('رسم نبات تظهر فيه الجذور تحت التربة والساق والأوراق والزهرة فوقها', `
      <path fill="#ead4af" stroke="none" d="M35 166h270v62H35Z"/><path d="M35 166h270"/>
      <g fill="none" stroke="${highlight('root')}" stroke-width="${d.focus === 'root' ? 6 : 3}"><path d="M160 164v38m0-21-30 23m30-15 32 21m-32-15-10 24m10-37 16 13"/></g>
      <path fill="none" stroke="${highlight('stem')}" stroke-width="${d.focus === 'stem' ? 8 : 5}" d="M160 165V65"/>
      <path fill="${green}" d="M158 133q-46 1-48-35 37-5 48 35Zm4-31q37 1 42-32-33-3-42 32Z"/>
      <g fill="#e9b2b9"><circle cx="160" cy="43" r="16"/><circle cx="141" cy="57" r="16"/><circle cx="178" cy="57" r="16"/><circle cx="150" cy="76" r="16"/><circle cx="172" cy="76" r="16"/></g><circle cx="160" cy="60" r="13" fill="#f4d37e"/>
      ${d.labels ? `${text(252,200,'جذر')}${text(246,147,'ساق')}${text(74,104,'ورقة')}${text(246,55,'زهرة')}` : ''}`, 340, 240);
  }
  function draw(d) {
    switch (d.kind) {
      case 'map': return '<img class="g1-life-map" src="palestine-outline.svg" width="104" height="278" alt="شكل فلسطين، من الصفحة ٨ من كراس الصف الثاني، الجزء الأول" style="display:block;width:auto;max-width:100%;height:220px;margin:auto">';
      case 'well': return svg('مقطع تخطيطي لبئر يصل إلى ماء تحت سطح الأرض', `<path fill="#ead4af" stroke="none" d="M30 100h280v100H30Z"/><path fill="${blue}" stroke="none" d="M30 162q40-12 80 0t80 0 80 0 40 0v38H30Z"/><path fill="#fff" d="M130 100v81h60v-81"/><path fill="${blue}" d="M132 163h56v20h-56Z"/><path fill="#d3d9cd" d="M120 80h80v32h-80Z"/><path fill="none" d="M100 80V32h120v48m-60-48v42"/><path fill="#e7bd79" d="m146 62 4 17h20l4-17Z"/>${text(270,129,'تربة')}${text(70,189,'ماء')}`);
      case 'plant': return plant(d);
      case 'state': return waterState(d.state);
      case 'states': return `<div style="display:flex;flex-wrap:wrap;gap:12px;justify-content:center">${['ice','liquid','gas'].map(state=>`<div style="flex:1 1 140px;max-width:210px">${waterState(state, true)}</div>`).join('')}</div>`;
      case 'zaatar': return svg('رسم مبسط لنبات الزعتر بأوراق صغيرة على سيقان متفرعة', `<path fill="none" d="M165 185V60m0 96-45-35m45 11 45-35m-45-2-25-26m25 10 24-33"/>${[[128,132],[145,111],[179,108],[196,95],[148,82],[179,73],[163,61],[112,119]].map(([x,y])=>`<ellipse cx="${x}" cy="${y}" rx="15" ry="9" fill="${green}" transform="rotate(-25 ${x} ${y})"/>`).join('')}${text(165,215,'زعتر')}`,330,235);
      case 'flatbread': return svg('رسم لفطيرة زعتر', `<ellipse cx="170" cy="117" rx="112" ry="67" fill="#e9c489"/><ellipse cx="170" cy="113" rx="90" ry="46" fill="#8d9e5b"/>${[[110,99],[150,92],[197,94],[229,117],[197,135],[154,128],[119,121],[176,110]].map(([x,y])=>`<path stroke="#526735" d="m${x} ${y} 6 4m-4-7 2 8"/>`).join('')}`);
      case 'oil-order': return `<ol style="display:flex;flex-wrap:wrap;justify-content:center;gap:14px;list-style:none;padding:0;margin:0">${[['١','قطف الثمار',base.scene({type:'items',icons:['tree','olive']})],['٢','نقلها إلى المعصرة',base.scene({type:'items',icons:['olive']})],['٣','استخراج الزيت',svg('رسم عبوة زيت زيتون',`<path fill="#e5c76e" d="M140 55h40v35l18 18v80h-76v-80l18-18Z"/><path fill="#b8d58f" d="M138 40h44v16h-44Z"/>`,320,220)]].map(([n,title,body])=>`<li style="flex:1 1 150px;max-width:210px;border:1px solid #dce6d5;border-radius:16px;padding:12px"><strong>${n} · ${title}</strong>${body}</li>`).join('')}</ol>`;
      default: return '';
    }
  }
  window.G1_ART = Object.freeze({ icon: base.icon, scene: d => d?.type === 'symbol' && d.life ? draw(d.life) || base.scene(d) : base.scene(d) });
})();
