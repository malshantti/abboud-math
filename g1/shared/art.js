(() => {
  'use strict';
  const escape = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const indic = value => String(value).replace(/\d/g, digit => '٠١٢٣٤٥٦٧٨٩'[digit]);
  const paths = {
    apple:'<path fill="#e98d79" d="M32 18C13 9 8 27 14 43c5 15 13 12 18 10 5 2 13 5 18-10 6-16 1-34-18-25Z"/><path d="M32 19V10"/><path fill="#a4c978" d="M34 13c1-8 9-9 14-7-1 7-7 10-14 7Z"/>',
    orange:'<circle fill="#f5bb65" cx="32" cy="36" r="21"/><path d="M32 16v-7"/><path fill="#a4c978" d="M33 12c4-7 10-7 15-4-2 6-8 9-15 4Z"/><path d="M19 34c0-5 3-9 6-10"/>',
    ball:'<circle fill="#a8c8e8" cx="32" cy="32" r="24"/><path fill="#f7df98" d="m32 21 11 8-4 13H25l-4-13Z"/><path d="m32 21-2-13m13 21 12-4M39 42l7 10M25 42l-7 10M21 29 9 25"/>',
    fish:'<path fill="#83c9c5" d="M12 32c10-19 29-20 39 0-10 20-29 19-39 0Z"/><path fill="#f6d17e" d="m13 32-8-12v24Z"/><circle fill="#263e38" stroke="none" cx="41" cy="29" r="2"/><path d="m25 29 6 4-6 5"/>',
    flower:'<path d="M32 35v23m0-10c-12 1-16-5-16-10 10-2 16 4 16 10m0 1c11-1 16-7 16-12-10 0-16 5-16 12" fill="#b4cf88"/><path fill="#e6a7bc" d="M32 11c12-12 23 4 13 12 15 6 5 24-7 16-2 15-22 11-20-1C4 41 1 20 16 21c-4-14 12-20 16-10Z"/><circle fill="#f7d678" cx="29" cy="27" r="8"/>',
    book:'<path fill="#f9e5aa" d="M32 16C22 9 13 10 7 13v37c8-3 16-2 25 4 9-6 17-7 25-4V13c-6-3-15-4-25 3Z"/><path d="M32 16v38M14 22c4-1 7 0 11 2m-11 7c4-1 7 0 11 2m14-9c4-2 7-3 11-2m-11 11c4-2 7-3 11-2"/>',
    leaf:'<path fill="#b5cf88" d="M53 9C23 4 5 20 11 39c5 17 39 16 42-30Z"/><path d="M10 57 43 20M24 42l-3-15m12 5 11 1"/>',
    eye:'<path fill="#fff8e8" d="M5 32c15-23 39-23 54 0C44 55 20 55 5 32Z"/><circle fill="#91beb4" cx="32" cy="32" r="12"/><circle fill="#263e38" stroke="none" cx="32" cy="32" r="5"/><circle fill="#fff" stroke="none" cx="35" cy="29" r="2"/>',
    ear:'<path fill="#f1c9ad" d="M21 47C7 37 13 9 32 8c24-1 26 29 9 37-6 3-4 12-13 11-6 0-9-4-7-9Z"/><path d="M22 31c-5-15 16-20 19-8 3 9-9 7-10 16m-5-10c-4 6 2 11 5 10"/>',
    nose:'<path fill="#f1c9ad" d="M27 10c-2 12-3 20-10 28-9 12 7 20 15 13 9 7 23-1 15-12-7-10-10-18-10-29"/><path d="M21 44h3m16 0h3"/>',
    hand:'<path fill="#f1c9ad" d="M22 36V13c0-6 8-6 8 0v18-23c0-6 8-6 8 0v23-20c0-6 8-6 8 0v21-14c0-6 8-6 8 0v22c0 13-9 19-20 19-10 0-14-7-20-14L7 34c-3-6 2-11 7-6Z"/>',
    tongue:'<path fill="#fff8e8" d="M8 22c12 8 36 8 48 0 0 22-13 29-24 29S8 44 8 22Z"/><path fill="#e6a7ac" d="M19 35c0-9 26-9 26 0v14c0 16-26 16-26 0Z"/><path d="M32 34v11"/>',
    house:'<path fill="#f7e0a2" d="M12 29h40v28H12Z"/><path fill="#d7977c" d="m5 29 27-23 27 23Z"/><path fill="#a9c9bc" d="M27 38h12v19H27Z"/><path fill="#a8c9e6" d="M17 35h7v8h-7Z"/>',
    school:'<path fill="#f7df9e" d="M8 27h48v30H8Z"/><path fill="#d79b83" d="m3 27 29-18 29 18Z"/><path fill="#abc8bc" d="M27 40h10v17H27Z"/><path d="M16 35h5v7h-5Zm28 0h5v7h-5ZM32 18V4"/><path fill="#b5cf88" d="M32 4h16v9H32"/>',
    flag:'<path d="M13 58V7"/><path fill="#fff" d="M14 8h43v33H14Z"/><path fill="#263e38" d="M14 8h43v11H14Z"/><path fill="#84ad78" d="M14 30h43v11H14Z"/><path fill="#d98273" d="m14 8 19 16-19 17Z"/>',
    boy:'<path fill="#a4c3df" d="M12 58c0-17 40-17 40 0"/><path fill="#e9bd99" d="M18 18h28v15c0 20-28 20-28 0Z"/><path fill="#6c5744" d="M17 25C10 3 48-1 47 25l-8-9c-5 8-15 2-22 9Z"/><path d="M24 30h1m14 0h1m-15 9c4 4 9 4 13 0"/>',
    girl:'<path fill="#6c5744" d="M12 47V24c0-27 40-27 40 0v23Z"/><path fill="#e7afbd" d="M11 58c2-17 40-17 42 0"/><path fill="#e9bd99" d="M18 22c6 1 12-3 15-8 3 5 7 8 13 8v12c0 19-28 19-28 0Z"/><path d="M24 29h1m14 0h1m-15 9c4 4 9 4 13 0"/><path fill="#f5d77c" d="m13 15 9-5v11Z"/>',
    sun:'<circle fill="#f7d676" cx="32" cy="32" r="16"/><path d="M32 3v7m0 44v7M3 32h7m44 0h7M11 11l5 5m32 32 5 5M11 53l5-5m32-32 5-5"/>',
    water:'<path fill="#9acbdf" d="M32 6C25 18 12 30 12 41c0 25 40 25 40 0C52 30 39 18 32 6Z"/><path d="M22 40c-1 7 2 11 8 12"/>',
    tree:'<path fill="#b38d6b" d="M27 34h10v24H27Z"/><path fill="#aaca87" d="M15 39C0 36 6 18 18 18 16 3 39 1 43 14c16-3 22 21 7 25Z"/><path d="M32 38V24m0 10-9-6m9 3 9-8"/>',
    car:'<path fill="#9abfb5" d="m8 32 8-17h28l10 17 5 4v15H5V36Z"/><path fill="#d4e4e7" d="m19 20-5 13h36l-8-13Z"/><circle fill="#5b6b68" cx="17" cy="50" r="7"/><circle fill="#5b6b68" cx="47" cy="50" r="7"/><path d="M32 20v13M6 40h7m38 0h7"/>',
    bag:'<path d="M23 15V9c0-7 18-7 18 0v6"/><rect fill="#d9b1c7" x="12" y="14" width="40" height="44" rx="12"/><path fill="#f4dca1" d="M19 36h26v15H19Z"/><path d="M20 25h24M27 36v4h10v-4"/>',
    cat:'<path fill="#e9c699" d="m12 27-1-18 16 10h10L53 9l-1 18c15 29-55 37-40 0Z"/><path d="M22 31h1m18 0h1m-15 7 5 4 5-4m-5 4v5m-13-7-14-3m14 9L5 48m40-8 14-3m-14 9 14 2"/>',
    dog:'<path fill="#bf9b7f" d="M18 17C-1 7 2 42 14 39m32-22C65 7 62 42 50 39"/><path fill="#e8c9a3" d="M16 25c0-27 32-27 32 0v17c0 23-32 23-32 0Z"/><path d="M23 27h1m16 0h1"/><path fill="#6a5b4d" d="m27 38 5 5 5-5Z"/><path d="M32 43v7m-7-2c3 5 11 5 14 0"/>',
    door:'<path fill="#dfbd91" d="M13 6h38v52H13Z"/><path fill="#eee0bb" d="M21 13h22v20H21Z"/><circle fill="#6e8b72" cx="42" cy="42" r="2"/><path d="M8 58h48"/>',
    chair:'<path fill="#c9ae8d" d="M17 7h30v25H17Z"/><path fill="#f3d49c" d="M12 32h40v9H12Z"/><path d="M17 41v17m30-17v17M17 15h30m-30 8h30"/>',
    pen:'<path fill="#a4c6df" d="m15 43 28-32 11 10-28 32-15 5Z"/><path fill="#f6d59a" d="m15 43 11 10-15 5Z"/><path fill="#d9a7b4" d="m43 11 4-5c5-5 15 5 11 10l-4 5Z"/><path d="m39 16 10 10"/>',
    bird:'<path fill="#aac8dc" d="M18 31c-11 6-7 24 9 24 17 0 22-16 20-24 10-16-11-29-20-15-2 3-2 8-1 12Z"/><path fill="#f3d083" d="m48 20 12 6-12 4Z"/><path d="M37 20h1M19 39c5 8 12 9 18 2M14 34 3 25l3 19m19 10v7m12-8v8"/>',
    nest:'<path fill="#d8b58c" d="M5 30h54c-2 29-52 29-54 0Z"/><ellipse fill="#aa8f72" cx="32" cy="30" rx="27" ry="8"/><path fill="#f6ecce" d="M19 28c0-14 12-14 12 0Zm14-1c0-17 13-17 13 0Z"/><path d="m9 38 41 10m5-10L16 48M12 28 4 22m48 7 9-8M9 48l8-4m30 9-8-8"/>',
    bee:'<path fill="#e8f0ee" d="M27 25C2 13 20-5 32 17 45-5 63 13 37 25"/><ellipse fill="#f1d387" cx="31" cy="36" rx="22" ry="15"/><path d="M23 23v26m12-27v27m13-29 5-8m-9 9-2-11M8 36H3"/><circle fill="#385346" cx="45" cy="32" r="2"/>',
    monkey:'<circle fill="#ae8e70" cx="11" cy="30" r="9"/><circle fill="#ae8e70" cx="53" cy="30" r="9"/><circle fill="#ae8e70" cx="32" cy="31" r="25"/><path fill="#ead1aa" d="M32 23c-15-17-28 9-13 16-12 20 38 20 26 0 15-7 2-33-13-16Z"/><path d="M24 29h1m14 0h1m-9 5h2m-10 11c6 5 12 5 18 0M28 7l4-5 5 5"/>',
    banana:'<path fill="#f3d67c" d="M15 10c5 31 19 34 36 14l6 5C43 67 9 61 8 14Z"/><path d="M15 10 8 5l-3 8 5 4m45 10 5-5M17 25c4 27 22 27 33 9"/>',
    peach:'<path fill="#eab18f" d="M32 18C7 4 1 36 16 51c7 7 14 9 17 6 4 3 12-1 19-9 16-19 3-42-20-30Z"/><path d="M32 18c8 12-5 23 1 39m0-39-2-10"/><path fill="#aac58b" d="M33 14c2-11 11-12 19-8-3 8-10 12-19 8Z"/>',
    basket:'<path d="M14 29C14 1 50 1 50 29"/><path fill="#dec08e" d="M7 27h50l-6 30H13Z"/><path d="M10 37h44M12 47h40M20 28l3 29m9-29v29m12-29-3 29"/>',
    tap:'<path fill="#b9cbd0" d="M9 27h18v-8h16v8h7c9 0 10 7 10 19H47V35H9Z"/><path fill="#dce6e2" d="M5 23h7v16H5Z"/><path d="M35 19V9m-12 0h24"/><path fill="#a0cadf" d="M53 48c-3 4-5 7-5 9 0 7 11 7 11 0 0-2-3-5-6-9Z"/>',
    doll:'<path fill="#80634f" d="M17 24C2 22 6 9 20 11m24 0c14-2 18 11 3 13"/><circle fill="#efc7a8" cx="32" cy="19" r="13"/><path fill="#dcaac1" d="M24 33h16l8 20H16Z"/><path d="m22 36-12 8m32-8 12 8M25 53v7m14-7v7M26 17h1m10 0h1m-10 8c2 2 6 2 8 0"/>',
    kite:'<path fill="#c4b0d6" d="m32 5 20 24-20 20-20-20Z"/><path fill="#e7c784" d="m32 5 20 24H32Z"/><path fill="#a2c9dc" d="m12 29 20 20V29Z"/><path d="M32 5v44M12 29h40M32 49c-7 1-7 11-1 12"/><path fill="#dcaac1" d="m24 53 8 3 4-6v11l-5-5-7 4Z"/>',
    balloon:'<ellipse fill="#dfa4b6" cx="32" cy="25" rx="19" ry="23"/><path fill="#dfa4b6" d="m32 48-5 7h10Z"/><path d="M32 55c8 3-8 5 0 8M22 16c-3 3-4 7-3 11"/>',
    shorts:'<path fill="#a5c2d8" d="M14 10h36l4 39H36l-4-19-4 19H10Z"/><path d="M14 19h36M32 10v20m-15-7-1 7m31-7 1 7"/>',
    jeans:'<path fill="#8eacc7" d="M17 7h30l5 50H35l-3-31-3 31H12Z"/><path d="M17 15h30M32 7v19m-13-9c6 1 7 7 0 10m26-10c-6 1-7 7 0 10m-31 25h15m6 0h16"/><path d="M35 17v8" stroke="#f4d7a0"/>',
    taxi:'<path fill="#f2d288" d="m8 32 8-16h28l10 16 5 4v15H5V36Z"/><path fill="#c8e1e5" d="m19 21-5 12h36l-8-12Z"/><path fill="#fff7e5" d="M25 9h14v7H25Z"/><path d="M32 21v12M6 40h7m38 0h7M15 39h35"/><path d="M20 39v5m10-5v5m10-5v5" stroke-width="5"/><circle fill="#5f716b" cx="17" cy="51" r="7"/><circle fill="#5f716b" cx="47" cy="51" r="7"/>',
    lemon:'<path fill="#f2d884" d="M17 14c-2-8-9-3-7 3C-5 40 22 68 46 50c7 3 12-5 4-8C63 16 39-2 17 14Z"/><path d="M15 27c-4 9 0 16 6 19"/>',
    goat:'<path fill="#ece0c6" d="m18 19-11-7 1 18 9 5c-2 17 7 22 15 22s17-5 15-22l9-5 1-18-11 7C38 12 26 12 18 19Z"/><path d="M22 17C12 7 22 1 25 7m17 10C52 7 42 1 39 7M22 29h1m18 0h1m-14 11 4 3 4-3m-9 11 5 10 5-10"/>',
    pencil:'<path fill="#f2d287" d="m12 42 29-32 12 11-29 32-17 6Z"/><path fill="#f8e4c1" d="m12 42 12 11-17 6Z"/><path fill="#daabb9" d="m41 10 5-5c4-4 16 6 12 11l-5 5Z"/><path d="m17 47 29-32M7 59l7-3m23-42 12 11"/>',
    desk:'<path fill="#d9ba92" d="M5 22h54v9H5Z"/><path fill="#efdcad" d="M35 31h19v23H35Z"/><path d="M11 31v27m43-4v4M35 42h19m-13-5h7m-7 11h7"/>',
    applejuice:'<path fill="#f3dcad" d="M17 11h30l-3 46H20Z"/><path fill="#e0c077" d="M19 26h26l-2 29H21Z"/><path d="m35 29 6-24h12"/><path fill="#dd9d86" d="M24 38c3-2 5-1 8 0 8-4 11 10 4 13-2 1-3 0-5 0-6 2-10-7-7-13Z"/><path d="m31 39 1-6"/>',
    orangejuice:'<path fill="#fff3d5" d="M17 11h30l-3 46H20Z"/><path fill="#efbf75" d="M19 26h26l-2 29H21Z"/><path d="m35 29 6-24h12"/><circle fill="#f5d493" cx="32" cy="43" r="8"/><path d="M32 35v16m-8-8h16m-13-6 10 12m0-12-10 12"/>',
    bread:'<path fill="#e4b47a" d="M15 54V29C0 26 7 8 22 10c7-5 13-5 20 0 15-2 22 16 7 19v25Z"/><path fill="#f8dfad" d="M21 47V24c-8-1-7-7 0-7 7-5 15-5 22 0 7 0 8 6 0 7v23Z"/>',
    cheese:'<path fill="#f4d47b" d="m8 25 33-15 16 20v24H8Z"/><path fill="#f9e5a5" d="m8 25 33-15 16 20Z"/><circle fill="#e7bb60" cx="21" cy="39" r="4"/><circle fill="#e7bb60" cx="44" cy="43" r="5"/><path d="M29 23h1m7 27h1"/>',
    egg:'<path fill="#fff9e8" d="M32 7C21 7 11 29 11 41c0 23 42 23 42 0C53 29 43 7 32 7Z"/><path d="M20 36c-2 5-2 10 2 13"/>',
    olive:'<ellipse fill="#a7b976" cx="30" cy="37" rx="17" ry="21" transform="rotate(25 30 37)"/><path d="m37 19 8-12"/><path fill="#abc98b" d="M43 14c0-10 7-11 15-9-2 9-8 13-15 9Z"/><path d="M20 38c-1 4 0 7 3 9"/>',
    milk:'<path fill="#fffaf0" d="M17 19 23 7h21l7 12v38H17Z"/><path fill="#a8c9df" d="M17 30h34v18H17Z"/><path d="M23 7v12H17m6 0h28M38 7v12"/><path fill="#e6f1f4" d="M33 33c-3 5-6 8-6 11 0 8 12 8 12 0 0-3-3-6-6-11Z"/>',
    cup:'<path fill="#f3d99f" d="M11 19h35v26c0 17-35 17-35 0Z"/><path d="M46 23h5c15 0 13 22-5 21M7 58h46"/>',
    head:'<path fill="#edc5a6" d="M16 22c0-24 32-24 32 0v15c0 15-9 22-16 22S16 52 16 37Z"/><path fill="#80664f" d="M16 25C8 3 45-2 49 23c-8-1-14-6-18-12-1 10-9 11-15 14Z"/><path d="M23 31h1m16 0h1m-15 11c4 4 8 4 12 0"/>',
    face:'<circle fill="#edc5a6" cx="32" cy="32" r="24"/><path d="M22 26h1m18 0h1m-10 3-3 8h5m-12 7c6 6 14 6 20 0"/>',
    mouth:'<path fill="#dc97a0" d="M7 30c8-4 15-14 25-6 10-8 17 2 25 6-7 24-43 24-50 0Z"/><path fill="#fff9e8" d="M7 30c15 5 35 5 50 0-8 14-42 14-50 0Z"/>',
    leg:'<path fill="#edc5a6" d="M23 7h20l-2 34c6 0 15 3 15 9 0 7-31 9-36 4-3-3-2-8 1-13Z"/><path fill="#b3c7de" d="M23 7h20l-1 16H22Z"/><path d="M40 48h10"/>',
    finger:'<path fill="#edc5a6" d="M25 33V10c0-9 12-9 12 0v20c8-2 15 3 15 11v4c0 18-26 18-30 9L10 38c-5-7 3-13 8-7l7 8"/><path d="M37 30v10m7-7v8m-15 0v8"/>',
    mum:'<path fill="#c5b1d7" d="M7 58c1-13 12-22 25-22s24 9 25 22Z"/><path fill="#6e5746" d="M14 41V23c0-27 36-27 36 0v18Z"/><path fill="#edc5a6" d="M21 23c5-2 9-6 12-11 3 6 5 9 10 11v12c0 16-22 16-22 0Z"/><path d="M26 28h1m10 0h1m-11 9c3 3 7 3 10 0"/>',
    dad:'<path fill="#96b9ce" d="M7 58c1-14 13-21 25-21s24 7 25 21Z"/><path fill="#edc5a6" d="M18 20h28v17c0 19-28 19-28 0Z"/><path fill="#6e5746" d="M18 23c-8-22 31-25 29-2-9 1-14-3-17-9-3 7-8 7-12 11Z"/><path d="M24 28h1m14 0h1"/><path fill="#6e5746" d="M24 38c4-4 12-4 16 0-3 3-5 3-8 1-3 2-5 2-8-1Z"/>',
    baby:'<path fill="#e8dfad" d="M12 57V41c0-20 40-20 40 0v16Z"/><circle fill="#edc5a6" cx="32" cy="25" r="18"/><path d="M27 8c-5-9 11-8 8-1M24 23h1m14 0h1m-11 9c2 3 4 3 6 0"/><path d="m18 43 28 12M46 43 18 55"/>',
    bus:'<rect fill="#f2d28b" x="5" y="13" width="54" height="37" rx="6"/><path fill="#c9e2e8" d="M10 20h10v14H10Zm15 0h10v14H25Zm15 0h12v27H40Z"/><circle fill="#5f716b" cx="17" cy="50" r="7"/><circle fill="#5f716b" cx="48" cy="50" r="7"/>',
    train:'<path fill="#91bab4" d="M14 10h36v40H14Z"/><path fill="#d3e5e8" d="M20 17h24v16H20Z"/><path fill="#e7bc8d" d="m14 50-5 9h46l-5-9Z"/><circle fill="#f4d68a" cx="23" cy="41" r="3"/><circle fill="#f4d68a" cx="41" cy="41" r="3"/><path d="M24 10V5h16v5M7 59h50"/>',
    bike:'<circle fill="#edf3e6" cx="14" cy="43" r="11"/><circle fill="#edf3e6" cx="50" cy="43" r="11"/><path d="m14 43 13-23 12 23H14l17-16h12l7 16M22 20h11m7-7h6l-3 14"/>',
    plane:'<path fill="#a8c8dc" d="m29 25-22 9v8l22-5v13l-8 5v5l11-3 11 3v-5l-8-5V37l22 5v-8l-22-9V10c0-9-6-9-6 0Z"/>',
    boat:'<path fill="#dab08a" d="M7 42h50l-10 15H18Z"/><path fill="#f6df9f" d="M31 7v32H9Z"/><path fill="#a8c7df" d="M36 13v26h20Z"/><path d="M31 7v35M5 60c4-4 8 4 12 0s8 4 12 0 8 4 12 0 8 4 12 0 4 1 6 0"/>',
    shirt:'<path fill="#a8c7df" d="m21 9 11 6 11-6 16 13-10 12-6-5v29H21V29l-6 5L5 22Z"/><path d="M21 9c1 13 21 13 22 0"/>',
    trousers:'<path fill="#a2b7d0" d="M17 7h30l5 50H35l-3-31-3 31H12Z"/><path d="M17 15h30M32 7v19m-13-9-1 8m27-8 1 8"/>',
    shoes:'<path fill="#b99b83" d="m10 15 13 4 1 17c18 0 24 7 23 18H6V31Z"/><path fill="#e8d9be" d="M6 48h41v7H6Z"/><path d="m27 37 6-2m-1 6 6-2"/><path fill="#a0b8c4" d="m37 9 13 4 1 15c8 2 10 7 9 13H48c-3-5-7-7-13-8Z"/>',
    socks:'<path fill="#c7b1d6" d="M13 8h16v27c0 10-6 21-17 21-11 0-13-12-5-17l6-4Z"/><path fill="#b1ccdf" d="M37 8h16v27c0 10-6 21-17 21-11 0-13-12-5-17l6-4Z"/><path d="M13 17h16m8 0h16M10 37l10 8m14-8 10 8"/>',
    dress:'<path fill="#dfb0c3" d="m23 7 9 7 9-7 11 15-11 8 13 28H10l13-28-11-8Z"/><path d="M23 7c1 12 17 12 18 0M23 30h18"/><path fill="#f7dfa3" d="m24 28 8 3 8-3v8l-8-3-8 3Z"/>',
    bed:'<path fill="#c29d79" d="M7 15h5v35h44V32h4v25h-5v-7H12v7H7Z"/><path fill="#b2c9dd" d="M12 27h34c7 0 10 5 10 10v9H12Z"/><rect fill="#fff8e8" x="14" y="23" width="18" height="12" rx="4"/>',
    table:'<path fill="#e0bd8e" d="M5 23h54v10H5Z"/><path fill="#bb9472" d="M11 33h7v24h-7Zm35 0h7v24h-7Z"/>',
    window:'<path fill="#debd96" d="M8 7h48v50H8Z"/><path fill="#b8d9e4" d="M15 14h34v36H15Z"/><path d="M32 14v36M15 32h34M4 57h56"/><path d="m19 20 5-3m14 26 5-3" stroke="#fff9e9"/>',
    rock:'<path fill="#bec4b6" d="m6 48 9-25 18-11 19 13 7 26-17 6-26-1Z"/><path d="m15 23 15 12 22-10M30 35l-3 20m3-20 13 9"/>',
    rabbit:'<path fill="#f4e8d8" d="M18 27C3-1 19-7 28 21 37-8 54-1 42 27c25 29-42 37-24 0Z"/><path d="M19 10l6 15m18-14-7 14M24 36h1m15 0h1m-13 8 4 3 4-3m-4 3v5"/><path d="M12 44H4m48 0h8"/>',
    hen:'<path fill="#f7e9ce" d="M14 26c-13 31 31 41 36 14l-3-17c-1-10-18-11-20 2Z"/><path fill="#d99586" d="M30 17c-9-10 1-16 5-9 4-9 15-4 10 5l-2 5Z"/><path fill="#e8bb69" d="m47 23 12 6-11 5Z"/><path d="M39 24h1M24 55v6m13-6v6m-22-34L4 17l1 20m17-3c4 10 12 10 16 3"/>',
    duck:'<path fill="#f1d481" d="M13 35c-9 5-8 20 9 22h17c18-2 18-23 11-29 9-19-17-28-21-10-1 7 4 14 8 17-10 2-16 1-24 0Z"/><path fill="#e6ab65" d="m49 19 12 5-13 4Z"/><path d="M40 19h1M20 40c5 10 17 9 20 1"/>',
    butterfly:'<path fill="#c0afd6" d="M29 29C9-5-9 15 14 37-5 59 21 66 29 40m6-11C55-5 73 15 50 37c19 22-7 29-15 3"/><path fill="#f4d890" d="M28 23c0-9 8-9 8 0v25c0 9-8 9-8 0Z"/><path d="m30 19-7-10m11 10 7-10"/>',
    cow:'<path fill="#fff5dd" d="m17 17-9-6-2 17 10 7v9c0 21 32 21 32 0v-9l10-7-2-17-9 6C39 9 25 9 17 17Z"/><path fill="#9b8b79" d="M18 20c8-8 20 8 6 13-6 3-11-6-6-13Z"/><path fill="#e7b6ad" d="M18 39c0-9 28-9 28 0v10c0 13-28 13-28 0Z"/><path d="M37 28h1m-13 16h1m12 0h1M19 15l-3-9m29 9 3-9"/>',
    horse:'<path fill="#b99778" d="m24 14-7-9-1 18-8 19c-5 12 10 18 19 11l8-7 9 12h12L48 20 34 9Z"/><path fill="#715d4c" d="m34 9 12 3 10 28-10-5-4-14Z"/><path d="M26 26h1M12 44h3"/>',
    elephant:'<path fill="#b4c5ca" d="M10 52V28c0-26 43-26 43 0v22c0 12-15 12-15 2V33"/><path fill="#cad8d9" d="M31 20C22 7 7 13 9 29c1 17 23 17 23 3"/><path d="M41 23h1M11 52v6h10v-9m8 2v7h9"/><path fill="#fff5df" d="m36 36 5 10 3-10"/>',
    zoo:'<path fill="#b0ca94" d="M6 20h52v38H6Z"/><path fill="#e0ba8d" d="M14 58V29c0-21 36-21 36 0v29H39V31c0-8-14-8-14 0v27Z"/><path d="M5 32h9m36 0h9M8 20V9m48 11V9M6 45h8m36 0h8"/><circle fill="#f4d587" cx="32" cy="13" r="7"/>',
    home:'<path d="m7 30 25-23 25 23M14 26v30h36V26M27 56V38h10v18"/>',
    seed:'<path fill="#b3cf8e" d="M31 34C9 37 8 20 9 12c15 0 26 5 22 22Zm2-9C31 8 45 5 55 7c0 13-7 22-22 18Z"/><path d="M32 56V26M16 57h32"/>',
    map:'<path fill="#f5dfaa" d="m7 13 17-6 16 6 17-6v44l-17 6-16-6-17 6Z"/><path d="M24 7v44m16-38v44M13 29c5-9 17 15 22 3s10-12 16-8" stroke-dasharray="3 5"/>',
    lab:'<path fill="#d1e6df" d="M24 7h16m-13 0v22L10 51c-3 4-1 7 4 7h36c5 0 7-3 4-7L37 29V7"/><path fill="#95c8bc" d="M19 39h26l9 12c3 4 1 7-4 7H14c-5 0-7-3-4-7Z"/><circle cx="29" cy="44" r="2"/><circle cx="38" cy="50" r="2"/>',
    report:'<path fill="#f9e9c5" d="M14 7h36v51H14Z"/><path d="M23 20h18M23 30h18M23 40h10M23 49h15"/>',
    back:'<path d="m37 13-19 19 19 19M18 32h36"/>',
    arrow:'<path d="m27 13 19 19-19 19M46 32H10"/>',
    close:'<path d="m17 17 30 30m0-30L17 47"/>',
    check:'<path d="m12 32 13 13 27-28"/>',
    plus:'<path d="M32 12v40M12 32h40"/>',
    minus:'<path d="M12 32h40"/>'
  };
  const labels = {apple:'تفاحة',ball:'كرة',fish:'سمكة',flower:'زهرة',book:'كتاب',leaf:'ورقة شجر',eye:'عين',ear:'أذن',nose:'أنف',hand:'يد',tongue:'لسان',house:'منزل',school:'مدرسة',flag:'علم فلسطين',boy:'ولد',girl:'بنت',sun:'شمس',water:'ماء',tree:'شجرة',car:'سيارة',bag:'حقيبة',cat:'قطة',dog:'كلب',door:'باب',chair:'كرسي',pen:'قلم',orange:'برتقالة',bread:'خبز',cheese:'جبن',egg:'بيضة',olive:'زيتون',milk:'حليب',cup:'كوب',head:'رأس',face:'وجه',mouth:'فم',leg:'ساق',finger:'إصبع',mum:'أم',dad:'أب',baby:'طفل رضيع',bus:'حافلة',train:'قطار',bike:'دراجة',plane:'طائرة',boat:'قارب',shirt:'قميص',trousers:'سروال',shoes:'حذاء',socks:'جوارب',dress:'فستان',bed:'سرير',table:'طاولة',window:'نافذة',rock:'صخرة',rabbit:'أرنب',hen:'دجاجة',duck:'بطة',butterfly:'فراشة',cow:'بقرة',horse:'حصان',elephant:'فيل',zoo:'حديقة حيوانات',home:'الرئيسية',seed:'نبتة',map:'خريطة',lab:'مختبر',report:'تقرير',back:'عودة',arrow:'سهم',close:'إغلاق',check:'علامة صحة',plus:'إضافة',minus:'إنقاص'};
  Object.assign(labels,{goat:'ماعز',pencil:'قلم رصاص',desk:'مكتب',applejuice:'عصير تفاح',orangejuice:'عصير برتقال',doll:'دمية',kite:'طائرة ورقية',balloon:'بالون',shorts:'سروال قصير',jeans:'سروال جينز',taxi:'سيارة أجرة',lemon:'ليمون',bird:'عصفور',nest:'عش',bee:'نحلة',monkey:'قرد',banana:'موزة',peach:'خوخة',basket:'سلة',tap:'صنبور ماء'});
  const iconLabel = name => typeof name === 'string' && Object.hasOwn(labels,name) ? labels[name] : 'رسم توضيحي';
  function icon(name) {
    const body = typeof name === 'string' && Object.hasOwn(paths,name) ? paths[name] : '<rect x="10" y="10" width="44" height="44" rx="12"/><circle cx="32" cy="32" r="7"/>';
    return `<svg class="g1-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none" stroke="#385346" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${body}</svg>`;
  }
  function scene(descriptor) {
    const d = descriptor && typeof descriptor === 'object' ? descriptor : {};
    if (d.type === 'count') {
      const count = Number.isInteger(d.count) ? Math.max(0,Math.min(20,d.count)) : 0;
      return count ? `<div class="g1-art-count" role="img" aria-label="${escape(iconLabel(d.icon))}، عدد العناصر: ${indic(count)}">${Array.from({length:count},()=>`<span class="g1-art-object">${icon(d.icon)}</span>`).join('')}</div>` : '<div class="g1-art-zero" role="img" aria-label="صفر، لا توجد عناصر"><span>٠</span><strong>صفر</strong></div>';
    }
    if (d.type === 'items') {
      const items = Array.isArray(d.icons) ? d.icons.slice(0,20) : [];
      return `<div class="g1-art-items" role="img" aria-label="${escape(items.length ? items.map(iconLabel).join('، ') : 'لا توجد عناصر')}">${items.map(name=>`<span class="g1-art-item">${icon(name)}</span>`).join('')}</div>`;
    }
    if (d.type === 'shape') {
      const colors = {red:'#e69d8b',blue:'#a5c9e1',green:'#b1cf91',yellow:'#f5d888',purple:'#c6b3dc',orange:'#efbd81'};
      const color = typeof d.color === 'string' && Object.hasOwn(colors,d.color) ? colors[d.color] : '#a5c9e1';
      const shapes = {circle:'<circle cx="60" cy="60" r="43"/>',square:'<rect x="18" y="18" width="84" height="84" rx="3"/>',triangle:'<path d="M60 13 109 103H11Z"/>',rectangle:'<rect x="8" y="30" width="104" height="60" rx="3"/>'};
      const shape = typeof d.value === 'string' && Object.hasOwn(shapes,d.value) ? shapes[d.value] : shapes.circle;
      const names = {circle:'دائرة',square:'مربع',triangle:'مثلث',rectangle:'مستطيل'};
      const name = typeof d.value === 'string' && Object.hasOwn(names,d.value) ? names[d.value] : names.circle;
      return `<svg class="g1-art-shape" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" fill="${color}" stroke="#385346" stroke-width="3" role="img" aria-label="${name}" focusable="false">${shape}</svg>`;
    }
    if (d.type === 'operation') {
      const left = Number.isInteger(d.left) ? Math.max(0,Math.min(20,d.left)) : 0;
      const op = d.operator === '-' ? '-' : '+';
      const right = Number.isInteger(d.right) ? Math.max(0,Math.min(op === '-' ? left : 20,d.right)) : 0;
      const block = (count,crossed=0) => `<div style="display:grid;justify-items:center;gap:9px;min-width:0;flex:1"><div style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:7px;width:100%;max-width:310px">${count ? Array.from({length:count},(_,i)=>`<span style="position:relative;display:block;min-width:0"><span style="display:block;${i>=count-crossed?'opacity:.35;filter:grayscale(1)':''}">${icon(d.icon)}</span>${i>=count-crossed?'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" style="position:absolute;inset:0;width:100%;height:100%" aria-hidden="true"><path d="M9 54 55 10" stroke="#9c5f4c" stroke-width="5" stroke-linecap="round"/></svg>':''}</span>`).join('') : '<span style="grid-column:1/-1;font-size:30px">٠</span>'}</div><bdi dir="ltr" style="font-size:28px">${indic(count)}</bdi></div>`;
      const label = op === '-' ? `${indic(left)} عناصر من ${iconLabel(d.icon)}، شُطب منها ${indic(right)}. كم بقي؟` : `${indic(left)} عناصر من ${iconLabel(d.icon)} ومجموعة أخرى فيها ${indic(right)}. كم المجموع؟`;
      return `<div class="g1-art-operation" role="img" aria-label="${escape(label)}" style="display:flex;direction:ltr;align-items:center;justify-content:center;gap:14px;flex-wrap:wrap;width:100%;max-width:640px">${block(left,op==='-'?right:0)}${op==='+'?`<bdi dir="ltr" aria-hidden="true" style="font-size:38px">+</bdi>${block(right)}`:`<bdi dir="ltr" aria-hidden="true" style="flex-basis:100%;text-align:center;font-size:28px">${indic(left)} − ${indic(right)} = ؟</bdi>`}</div>`;
    }
    if (d.type === 'fraction') {
      const parts = d.parts === 4 ? 4 : 2;
      const selected = Number.isInteger(d.selected) ? Math.max(0,Math.min(parts,d.selected)) : 1;
      const caption = d.caption ? `<span style="font-size:20px;text-align:center">${escape(indic(String(d.caption).slice(0,300)))}</span>` : '';
      const cells = Array.from({length:parts},(_,i)=>`<rect x="${10+i*240/parts}" y="10" width="${240/parts}" height="100" fill="${i<selected?'#9cbd7c':'#fffaf0'}" stroke="#385346" stroke-width="2"/>`).join('');
      return `<div class="g1-art-fraction" style="display:grid;justify-items:center;gap:14px;width:100%" role="img" aria-label="${indic(selected)} من ${indic(parts)} أجزاء متساوية مظللة"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 120" style="width:min(100%,360px);height:auto" aria-hidden="true">${cells}</svg><span dir="ltr" aria-hidden="true" style="display:inline-grid;text-align:center;font-size:32px;line-height:1.4;min-width:44px"><span style="border-bottom:2px solid #385346;padding:0 8px">${indic(selected)}</span><span>${indic(parts)}</span></span>${caption}</div>`;
    }
    if (d.type === 'place-value') {
      const tens = Number.isInteger(d.tens) ? Math.max(0,Math.min(9,d.tens)) : 0;
      const ones = Number.isInteger(d.ones) ? Math.max(0,Math.min(9,d.ones)) : 0;
      const rods = Array.from({length:tens},(_,t)=>Array.from({length:10},(_,i)=>`<rect x="${10+t*21}" y="${10+i*15}" width="15" height="15" fill="#b2ca8c" stroke="#385346" stroke-width="1"/>`).join('')).join('');
      const units = Array.from({length:ones},(_,i)=>`<rect x="${10+(i%3)*29}" y="${10+Math.floor(i/3)*29}" width="22" height="22" fill="#f1d28e" stroke="#385346" stroke-width="1.5"/>`).join('');
      return `<div class="g1-art-tens" role="img" aria-label="${indic(tens)} عشرات و${indic(ones)} آحاد" style="display:flex;align-items:flex-start;justify-content:center;gap:22px;flex-wrap:wrap;width:100%"><div style="display:grid;justify-items:center;gap:10px;max-width:100%"><span style="font-size:20px">عشرات</span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${Math.max(42,tens*21+14)} 170" style="width:${Math.max(42,tens*21+14)}px;max-width:100%;height:170px" aria-hidden="true">${rods}</svg></div><div style="display:grid;justify-items:center;gap:10px"><span style="font-size:20px">آحاد</span><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 170" width="100" height="170" aria-hidden="true">${units}</svg></div></div>`;
    }
    if (d.type === 'symbol') {
      const value = String(d.value ?? '').slice(0,120);
      const direction = /[\u0621-\u063a\u0641-\u064a\u066e-\u06d3]/.test(value.replace(/[\u064b-\u065f\u0670]/g,'')) ? 'rtl' : 'ltr';
      return `<div class="g1-art-symbol"><bdi dir="${direction}">${escape(indic(value))}</bdi>${d.caption ? `<span>${escape(indic(String(d.caption).slice(0,300)))}</span>` : ''}</div>`;
    }
    return `<div class="g1-art-items" role="img" aria-label="نبتة"><span class="g1-art-item">${icon('seed')}</span></div>`;
  }
  window.G1_ART = Object.freeze({icon,scene});
})();
