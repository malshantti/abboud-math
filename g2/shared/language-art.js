/* مشاهد الأشخاص والعلاقات الأسرية؛ الأيقونة المنفردة لا تثبت القرابة. */
(() => {
  'use strict';
  const base=window.G1_ART;
  if(!base)return;
  const pick=(map,key,fallback='')=>typeof key==='string'&&Object.hasOwn(map,key)?map[key]:fallback;
  const person=(config={})=>{
    const pose=['sit','stand','jump','clap'].includes(config.pose)?config.pose:'stand';
    const long=config.hair==='long'||['girl','grandmother','mother','sister'].includes(config.role);
    const elder=['grandfather','grandmother'].includes(config.role),hair=elder?'#9caaa0':pick({blonde:'#dfbd58',brown:'#654a39',black:'#29342e'},config.hairColor,'#654a39');
    const eye=pick({green:'#397746',brown:'#735038'},config.eyeColor,'#385346');
    const shirt=long?'#bba3d2':'#93c6d9';
    const head='<path d="M32 34c0-32 56-32 56 0v30H32Z" fill="'+hair+'"/>'+
      (long?'<path d="M29 41v48h62V41Z" fill="'+hair+'"/>':'')+
      '<path d="M38 40q22-4 25-17 8 14 19 15v17c0 28-44 28-44 0Z" fill="#e9bd99" stroke="#385346" stroke-width="2"/>'+
      '<circle cx="49" cy="49" r="3" fill="'+eye+'"/><circle cx="73" cy="49" r="3" fill="'+eye+'"/><path d="M52 64q9 7 17 0" fill="none" stroke="#385346" stroke-width="2.5" stroke-linecap="round"/>'+
      (elder?'<path d="M42 46h14v10H42Zm23 0h14v10H65Zm-9 4h9" fill="none" stroke="#52665c" stroke-width="2"/>':'');
    const body='<path d="M43 80h34l10 49H33Z" fill="'+shirt+'" stroke="#385346" stroke-width="2.5"/>';
    let limbs='';
    if(pose==='sit')limbs='<path d="M48 128h32v27h19m-38-27v30h20M33 90v45H18m0 0v34m66-34v34" fill="none" stroke="#385346" stroke-width="7" stroke-linecap="round"/><path d="m43 84-17 20m49-20 16 20" stroke="#e9bd99" stroke-width="8" stroke-linecap="round"/>';
    else if(pose==='jump')limbs='<path d="m45 128-17 22 16 12m29-34 20 22-16 12" fill="none" stroke="#385346" stroke-width="8" stroke-linecap="round"/><path d="M43 85 20 67 9 42m68 43 23-18 11-25" fill="none" stroke="#e9bd99" stroke-width="9" stroke-linecap="round"/><path d="M14 118v15m94-15v15" stroke="#87b750" stroke-width="3" stroke-linecap="round"/>';
    else limbs='<path d="M47 128v37H35m38-37v37h12" fill="none" stroke="#385346" stroke-width="8" stroke-linecap="round"/>'+(pose==='clap'?'<path d="m42 86-12 22 29-14m18-8 13 22-29-14" fill="none" stroke="#e9bd99" stroke-width="9" stroke-linecap="round"/><path d="M60 81v-8m-9 10-6-5m24 5 6-5" fill="none" stroke="#b78f39" stroke-width="2.5"/>':'<path d="m43 84-14 35m48-35 14 35" stroke="#e9bd99" stroke-width="9" stroke-linecap="round"/>');
    return head+body+limbs;
  };
  const personScene=d=>{
    const p=d.person||{},names={sit:'شخص جالس على كرسي',stand:'شخص واقف',jump:'شخص يقفز وقدماه فوق الأرض',clap:'شخص يصفق بيديه'};
    const pose=['sit','stand','jump','clap'].includes(p.pose)?p.pose:'stand';
    const label=names[pose]+(p.hair==='long'?'، شعره طويل':p.hair==='short'?'، شعره قصير':'')+pick({blonde:'، شعره أشقر',brown:'، شعره بني',black:'، شعره أسود'},p.hairColor)+pick({green:'، عيناه خضراوان',brown:'، عيناه بنيتان'},p.eyeColor)+pick({tall:'، طويل مقارنة بعلامتي القياس',short:'، قصير مقارنة بعلامتي القياس'},p.height);
    const scale=p.height==='short'?.74:1,y=pose==='jump'?5:194-169*scale;
    const ruler=['tall','short'].includes(p.height)?'<path d="M153 25v169m-7-169h14m-14 44h14m-14 42h14m-14 42h14m-14 41h14" fill="none" stroke="#9ab481" stroke-width="2"/>':'';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 215" role="img" aria-label="'+label+'" style="display:block;width:min(100%,220px);height:auto;max-height:230px"><path d="M12 194h156" stroke="#d1dec4" stroke-width="3" stroke-linecap="round"/>'+ruler+'<g transform="translate(30 '+y+') scale('+scale+')">'+person(p)+'</g></svg>';
  };
  const familyScene=d=>{
    const focus=d.family?.focus,positions={grandfather:[116,4,'grandfather'],grandmother:[232,4,'grandmother'],father:[116,115,'father'],mother:[232,115,'mother'],brother:[58,225,'brother'],self:[174,225,'boy'],sister:[290,225,'sister']};
    let figures='';
    for(const [role,[x,y,kind]] of Object.entries(positions)){
      const selected=role===focus;
      figures+='<g transform="translate('+x+' '+y+')">'+(selected?'<rect x="-8" y="-1" width="81" height="109" rx="14" fill="#eef8db" stroke="#588a32" stroke-width="3"/>':role==='self'?'<rect x="-8" y="-1" width="81" height="109" rx="14" fill="#eff7fc" stroke="#2272a3" stroke-width="2"/>':'')+'<g transform="scale(.54)">'+person({role:kind,hair:['grandmother','mother','sister'].includes(role)?'long':'short'})+'</g>'+(role==='self'?'<path d="M31 100v9m-5-4 5 5 5-5" stroke="#2272a3" stroke-width="2" fill="none"/><text x="32" y="127" text-anchor="middle" fill="#2272a3" font-size="18" font-family="G1Baloo,Arial,sans-serif">أنا</text>':'')+'</g>';
    }
    const labels={grandfather:'الجد في الصف الأعلى، داخل الإطار',grandmother:'الجدة في الصف الأعلى، داخل الإطار',father:'الأب في الصف الأوسط، داخل الإطار',mother:'الأم في الصف الأوسط، داخل الإطار',brother:'أخ الولد الذي يحمل علامة أنا، داخل الإطار',sister:'أخت الولد الذي يحمل علامة أنا، داخل الإطار'};
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 425 365" role="img" aria-label="شجرة أسرة: '+pick(labels,focus,'جد وجدة وأب وأم وثلاثة أبناء')+'" style="display:block;width:min(100%,480px);height:auto"><g stroke="#c5d8b0" stroke-width="3" fill="none"><path d="M148 102v11h116V102m-58 11v10M148 212v12H90v7m174-19v12h58v7m-116-7v7"/></g>'+figures+'</svg>';
  };
  const positionScene=p=>{
    const object=['ball','bus','pencil'].includes(p.object)?p.object:'ball',relation=['in','on','under'].includes(p.relation)?p.relation:'in',desk=p.reference==='desk';
    const label={ball:'كرة',bus:'حافلة لعبة',pencil:'قلم رصاص'}[object]+' '+{in:'داخل',on:'على',under:'تحت'}[relation]+' '+(desk?'الطاولة الدراسية':'الصندوق');
    const y=relation==='on'?18:relation==='under'?(desk?157:205):99;
    const outline=desk?'<path d="M66 91h168v12H66Zm13 12v120m142-120v120" fill="#dcbf96"/>':'<path d="M69 97h162v99H69Z" fill="#f1dfb9"/><path d="m69 97 20-17h120l22 17M89 80l-8-15m128 15 8-15" fill="none"/>';
    const contents=base.icon(object).replace(/^.*?<svg\b[^>]*>/,'').replace(/<\/svg>\s*$/,'');
    const item='<svg x="113" y="'+y+'" width="74" height="67" viewBox="0 0 64 64" fill="none" stroke="#385346" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">'+contents+'</svg>';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 300" role="img" aria-label="'+label+'" style="display:block;width:min(100%,360px);height:auto;max-height:310px"><g stroke="#385346" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">'+outline+'</g>'+item+(relation==='in'?'<path d="M70 150v47h160v-47" fill="#f1dfb9" fill-opacity=".7" stroke="#385346" stroke-width="3"/>':'')+'<path d="M32 '+(desk?228:282)+'h236" stroke="#d1dec4" stroke-width="3"/></svg>';
  };
  const scene=d=>{
    if(d?.person&&typeof d.person==='object')return personScene(d);
    if(d?.family&&typeof d.family==='object')return familyScene(d);
    if(d?.position&&typeof d.position==='object')return positionScene(d.position);
    if(d?.town===true)return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 175" role="img" aria-label="ثلاثة أماكن في صف واحد: كنيسة، ثم متنزه، ثم مدرسة" style="display:block;width:min(100%,480px);height:auto"><path d="M12 142h396" stroke="#b4c59d" stroke-width="3"/><g stroke="#385346" stroke-width="2.5" stroke-linejoin="round"><path d="M28 137V79L68 48l40 31v58Z" fill="#f4dfb2"/><path d="M56 58V35h24v23M68 35V15m-9 8h18M59 137v-30h18v30" fill="none"/><path d="M166 137v-29m85 29v-29"/><path d="M145 126v-10h128v10" fill="#c09c75"/><path d="M149 102v-34m111 34V68"/><circle cx="149" cy="61" r="23" fill="#a9ca83"/><circle cx="260" cy="61" r="23" fill="#a9ca83"/><path d="M312 137V63h81v74Z" fill="#bed8e5"/><path d="M306 63h94L352 36Z" fill="#eac5a6"/><path d="M344 137v-31h17v31M326 79h15v15h-15Zm37 0h15v15h-15Z" fill="#fff"/></g><g text-anchor="middle" font-family="Arial,sans-serif" font-size="15" fill="#385346"><text x="68" y="165">church</text><text x="209" y="165">park</text><text x="352" y="165">school</text></g></svg>';
    return base.scene(d);
  };
  window.G1_ART=Object.freeze({icon:base.icon,scene});
})();
