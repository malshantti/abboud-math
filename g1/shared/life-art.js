/* Small local diagrams for life education. No audio, network or student data. */
(() => {
  'use strict';
  const base = window.G1_ART;
  const ink = '#385346', blue = '#a7d0e6', green = '#b8d58f';
  const svg = (label, body, width = 340, height = 220) => `<svg class="g1-life-art" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="${label}" style="display:block;width:100%;max-width:${width}px;max-height:280px;margin:auto;overflow:visible"><g stroke="${ink}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">${body}</g></svg>`;
  const text = (x, y, value, size = 25) => `<text x="${x}" y="${y}" text-anchor="middle" direction="rtl" fill="${ink}" stroke="none" font-family="inherit" font-size="${size}">${value}</text>`;
  const cards = entries => '<div style="display:flex;flex-wrap:wrap;justify-content:center;gap:14px">'+entries.map(([label,body])=>'<figure style="flex:1 1 100px;min-width:0;max-width:210px;margin:0;padding:10px;border:1px solid #dce6d5;border-radius:16px">'+body+'<figcaption style="font-size:20px;line-height:1.7;text-align:center">'+label+'</figcaption></figure>').join('')+'</div>';
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
      case 'relatives': return cards([['أقارب من جهة الأب',base.scene({type:'items',icons:['dad']})+'<p style="font-size:22px;text-align:center">عمّ · عمّة</p>'],['أقارب من جهة الأمّ',base.scene({type:'items',icons:['mum']})+'<p style="font-size:22px;text-align:center">خال · خالة</p>']]);
      case 'comb': return svg('مشط ذو أسنان متوازية لترتيب الشعر',`<rect x="45" y="65" width="250" height="38" rx="12" fill="#a7d0e6"/>${[55,78,101,124,147,170,193,216,239,262,285].map(x=>`<path stroke="#7ea8ba" stroke-width="12" d="M${x} 100v60"/>`).join('')}`);
      case 'crossing': return svg('طفل ينتظر مع كبير على الرصيف عند ممر المشاة، بعيدًا عن الطريق', `<path fill="#e6e8e1" stroke="none" d="M20 115h300v95H20Z"/><path fill="#65766d" d="M20 140h300v70H20Z"/>${[35,85,135,185,235,285].map(x=>`<path stroke="#fff" stroke-width="18" d="M${x} 156v40"/>`).join('')}<circle cx="92" cy="43" r="14" fill="#efc09f"/><path d="M92 59v43m0-26-23 17m23-15 22 5m-22 19-15 19m15-19 15 19"/><circle cx="139" cy="65" r="10" fill="#efc09f"/><path d="M139 76v29m0-20-24-2m24 22-10 16m10-16 10 16"/>`);
      case 'landscapes': return cards([
        ['جبل',svg('جبل مرتفع',`<path fill="${green}" d="M20 170 165 30l145 140Z"/><path fill="#fff" d="m130 64 35-34 36 35-20-5-16 14-17-14Z"/>`)],
        ['سهل',svg('أرض منبسطة',`<path fill="${green}" d="M15 110h310v70H15Z"/><path d="M15 110h310m-290 25h260m-250 25h260"/>`)],
        ['صحراء',svg('كثبان رملية',`<path fill="#efd49a" d="M15 130q75-100 155 0t155 0v65H15Z"/><path fill="none" d="M15 155q80-60 155 0t155 0"/>`)],
        ['بحر',svg('مسطح مائي كبير',`<path fill="${blue}" stroke="none" d="M15 60h310v140H15Z"/><path fill="none" d="M20 90q30-22 60 0t60 0 60 0 60 0m-240 55q30-22 60 0t60 0 60 0 60 0"/>`)]
      ]);
      case 'soil': return cards([
        ['تربة رملية',svg('رسم مبسط لحبيبات تربة رملية',`<path fill="#efd49a" d="M35 70h260v110H35Z"/>${[[65,100],[125,145],[195,110],[254,155],[80,160],[253,95]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="8" fill="#d5ad70"/>`).join('')}`)],
        ['تربة طينية',svg('رسم مبسط لتربة طينية',`<path fill="#b08a69" d="M35 70h260v110H35Z"/>${[90,120,150].map(y=>`<path fill="none" stroke="#d0b296" d="M45 ${y}h240"/>`).join('')}`)]
      ]);
      case 'months': return '<ol style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;list-style:none;padding:0">'+['كانون الثاني','شباط','آذار','نيسان','أيّار','حزيران','تموز','آب','أيلول','تشرين الأول','تشرين الثاني','كانون الأول'].map((name,i)=>'<li style="font-size:20px;text-align:center;padding:10px 4px;border:1px solid #dce6d5;border-radius:12px"><b>'+String(i+1).replace(/\d/g,x=>'٠١٢٣٤٥٦٧٨٩'[x])+'</b><br>'+name+'</li>').join('')+'</ol>';
      case 'weather': return cards([
        ['مشمس',base.scene({type:'items',icons:['sun']})],
        ['غائم',svg('غيوم',`<path fill="#dce6e7" d="M65 150c-60-15-40-80 5-77-3-65 93-83 109-23 55-17 105 45 70 86-18 19-154 25-184 14Z"/>`)],
        ['ماطر',svg('غيمة تمطر',`<path fill="#c4d6df" d="M65 115c-50-15-30-65 5-62 5-45 75-55 90-13 50-15 85 40 60 68-18 18-125 22-155 7Z"/><path stroke="#70a9c8" d="m80 140-12 25m66-25-12 25m65-25-12 25"/>`)]
      ]);
      case 'force': {
        const push=d.action!=='pull';
        return svg(push?'طفل يسار الرسم يدفع الصندوق نحو اليمين بعيدًا عنه':'طفل يسار الرسم يسحب الصندوق نحو اليسار باتجاهه', `<circle cx="75" cy="45" r="19" fill="#efc09f"/><path d="M75 65v65m0-42 45 18m-45 24-25 50m25-50 25 50"/><path stroke-width="5" d="M120 106 213 106"/><rect x="214" y="78" width="75" height="82" rx="8" fill="#e8c78f"/><path d="M251 78v82"/><path fill="none" stroke="#568c38" stroke-width="6" d="${push?'M150 55h135m-18-15 18 15-18 15':'M290 55H155m18-15-18 15 18 15'}"/>${text(75,210,'الطفل')}${text(250,210,'الصندوق')}`,340,230);
      }
      case 'magnet': return cards([
        ['حديد ينجذب',svg('مغناطيس يجذب قطعة حديد',`<path fill="none" stroke="#729c85" stroke-width="30" d="M70 50v90c0 45 90 45 90 0V50"/><path stroke="#de8b79" stroke-width="30" d="M70 50v35"/><path stroke="#8dbbd1" stroke-width="30" d="M160 50v35"/><rect x="205" y="55" width="55" height="22" rx="7" fill="#b9c7cd"/><path stroke-dasharray="4 7" d="M180 58h20m-20 18h20"/>`)],
        ['خشب لا ينجذب',svg('قطعة خشب',`<rect x="60" y="60" width="205" height="100" rx="12" fill="#d5b082"/><path fill="none" d="M85 90q75 20 150 0M85 130q75-20 150 0"/>`)]
      ]);
      case 'vessels': return svg('ماء سائل في وعاءين مختلفي الشكل', `<path fill="#fff" d="m40 35 10 135h75l10-135Z"/><path fill="${blue}" d="m45 95 5 75h75l5-75Z"/><path fill="#fff" d="M180 95h130v75H180Z"/><path fill="${blue}" d="M182 135h126v33H182Z"/>`);
      case 'water-bodies': return cards([
        ['بحيرة',svg('ماء تحيط به اليابسة من جميع الجهات',`<rect x="20" y="25" width="300" height="170" rx="30" fill="${green}"/><ellipse cx="170" cy="110" rx="100" ry="60" fill="${blue}"/>`)],
        ['نهر',svg('ماء يجري بين ضفتين',`<rect x="20" y="25" width="300" height="170" rx="20" fill="${green}"/><path fill="${blue}" d="M105 25q100 55 0 100t0 70h75q-100-30 0-75t0-95Z"/>`)],
        ['بحر',svg('جزء من ساحل البحر',`<rect x="20" y="25" width="300" height="170" rx="20" fill="${blue}"/><path fill="#efd49a" d="M20 25q90 40 20 85t20 85H20Z"/><path fill="none" d="M145 70q25-15 50 0t50 0m-100 70q25-15 50 0t50 0"/>`)]
      ]);
      case 'bread-order': return '<ol style="font-size:22px;line-height:2.1;text-align:right"><li>حبوب القمح</li><li>الدقيق بعد الطحن</li><li>العجين</li><li>الخبز</li></ol>'+base.scene({type:'items',icons:['bread']});
      case 'butterfly-cycle': return cards([
        ['١ · بيضة',svg('بيضة فراشة على ورقة',`<path fill="${green}" d="M40 150q120-120 240 0-120 80-240 0Z"/><ellipse cx="160" cy="120" rx="17" ry="24" fill="#f5e6b0"/>`)],
        ['٢ · يرقة',svg('يرقة',`${[65,105,145,185,225].map((x,i)=>`<circle cx="${x}" cy="120" r="26" fill="${green}"/><path d="M${x} 144v15"/>`).join('')}<path d="M235 90v-15m-14 17-6-15"/><circle cx="235" cy="115" r="3" fill="${ink}"/>`)],
        ['٣ · شرنقة',svg('شرنقة معلقة بغصن',`<path fill="none" d="M55 35h220m-100 0v25"/><path fill="#c3a881" d="M175 60c-60 40-40 120 0 135 45-60 45-100 0-135Z"/><path fill="none" d="m145 110 46 25m-45 0 35 28"/>`)],
        ['٤ · فراشة',base.scene({type:'items',icons:['butterfly']})]
      ]);
      case 'shadow': return svg('مصدر ضوء وجسم يحجبه وظل خلف الجسم', `<path fill="#f4d376" stroke="none" d="m50 100 235-65v130Z"/><circle cx="45" cy="100" r="25" fill="#f4d376"/><path fill="#d3dbd2" stroke="none" d="m180 65 110-29v155l-110-41Z"/><path stroke="#5e6c64" stroke-width="13" d="M180 65v85"/><path stroke="#d3dbd2" stroke-width="8" d="M290 25v170"/><path stroke="#385346" stroke-width="8" d="M290 36v155"/>${text(45,210,'ضوء')}${text(180,210,'جسم')}${text(290,210,'ظلّ')}`,340,235);
      case 'moon-faces': return cards([
        ['هلال',svg('هلال مضاء رفيع',`<circle cx="160" cy="110" r="80" fill="#385346"/><path fill="#f3dd96" stroke="none" d="M160 30a80 80 0 0 1 0 160c72-40 72-120 0-160Z"/>`)],
        ['بدر',svg('بدر مضاء كامل',`<circle cx="160" cy="110" r="80" fill="#f3dd96"/>`)]
      ]);
      case 'lunar-months': return '<ol style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;list-style:none;padding:0">'+['محرّم','صفر','ربيع الأول','ربيع الثاني','جمادى الأولى','جمادى الآخرة','رجب','شعبان','رمضان','شوّال','ذو القعدة','ذو الحجّة'].map((name,i)=>'<li style="font-size:20px;text-align:center;padding:10px 4px;border:1px solid #dce6d5;border-radius:12px"><b>'+String(i+1).replace(/\d/g,x=>'٠١٢٣٤٥٦٧٨٩'[x])+'</b><br>'+name+'</li>').join('')+'</ol>';
      case 'directions': return svg('مخطط جهات: الشمال أعلى والجنوب أسفل والشرق يمين والغرب يسار',`<path fill="none" d="M170 45v145M65 120h210m-118-60 13-15 13 15m-13 130-13-15m13 15 13-15m-103-68-15 13 15 13m195-13-15-13m15 13-15 13"/>${text(170,28,'الشمال')}${text(170,220,'الجنوب')}${text(295,128,'الشرق')}${text(40,128,'الغرب')}`,340,240);
      case 'edible-parts': return cards([
        ['جذر الجزر',svg('جزر بجذر برتقالي وأوراق خضراء',`<path fill="#eaa467" d="M110 70h110l-55 125Z"/><path fill="none" stroke="#78a35a" stroke-width="9" d="M165 70V25m0 35-35-28m35 20 30-25"/><path d="m125 99 27 5m-13 28 20 4"/>`)],
        ['ساق أرضية للبطاطا',svg('درنة بطاطا ذات براعم صغيرة',`<ellipse cx="170" cy="110" rx="100" ry="62" fill="#d8bb8c"/><path d="m125 85 5 3m70-10 5 3m-25 48 5 3m-45 12 5 3m85-37 5 3"/>`)],
        ['ورقة ملوخية',svg('ورقة خضراء مبسطة',`<path fill="${green}" d="M170 25q110 95 0 155-110-60 0-155Z"/><path d="M170 55v145m0-70-40-30m40 10 40-30"/>`)]
      ]);
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
