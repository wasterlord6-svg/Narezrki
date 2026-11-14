'use strict';
(function () {
  const sh = (paint, extra) => Object.assign({ paint, vignette: 0.5 }, extra || {});
  const FAM = [{ coat: '#c4302a', hat: 'none', seed: 2300 }, { coat: '#2e5a8a', hat: 'none', seed: 2320, s: 0.8 }];
  const ico = (kind, ok, col) => sh((P, tl) => { board(P, col); icon(P, kind, 540, 860, 1.75 + tl * 0.02, tl); if (ok != null) verdict(P, 820, 560, ok, tl); });
  const PR = {
    _slamBg: '#f2d03a',
    city_off: sh((P, tl, t, d) => city(P, tl, { off: Math.min(1, tl / (d * 0.6)) })),
    city_dark: sh((P, tl) => city(P, tl, { off: 1, people: [Object.assign({ x: 420, y: 1800, s: 1.6 }, FAM[0]), Object.assign({ x: 600, y: 1800, s: 1.3 }, FAM[1])] })),
    city_on: sh((P, tl, t, d) => city(P, tl, { off: 1 - Math.min(1, tl / (d * 0.6)) })),
    plug: ico('plug', null, '#3a3a44'),
    torch_ok: sh((P, tl) => { darkRoom(P, tl, { torch: [520, 1080, -0.35], people: [Object.assign({ x: 380, y: 1700, s: 2.4, armR: -1.4 }, FAM[0])] }); verdict(P, 820, 600, true, tl); }),
    candle_no: ico('candle', false, '#1e1a16'),
    fridge_closed: ico('fridge', null, '#2e3a4e'),
    freezer: sh((P, tl) => { board(P); icon(P, 'fridge', 540, 1000, 1.4, tl); stat(P, 540, 560, '48 Ч', 'ПОЛНАЯ МОРОЗИЛКА'); }),
    thermo: sh((P, tl) => { board(P); stat(P, 540, 880, '4 °C', '2 ЧАСА И ДОЛЬШЕ — В МУСОР'); }),
    trash: sh((P, tl) => { board(P); P.rect(330, 900, 420, 560, '#4a5a6a', { seed: 2400, depth: 1.4 }); P.rect(300, 860, 480, 60, '#3a4a5a', { seed: 2401, depth: 1 }); for (let i = 0; i < 3; i++) P.circle(420 + i * 120, 820 - (tl * 300 % 200) * (i % 2), 40, ['#c4a060', '#7a9a4a', '#c46a40'][i], { seed: 2402 + i, depth: 0.6 }); }),
    doubt: sh((P, tl) => { board(P, '#3a2a2a'); stat(P, 540, 880, '?', 'СОМНЕВАЕШЬСЯ — ВЫБРОСЬ'); }),
    water: ico('water', null, '#1e3a4e'),
    boil: sh((P, tl) => { board(P, '#3a2e24'); icon(P, 'stove', 540, 1150, 1.2, tl); P.rect(380, 760, 320, 220, '#9aa2aa', { seed: 2410, depth: 1.2 }); for (let i = 0; i < 6; i++) P.circle(420 + i * 50, 740 - ((tl * 120 + i * 30) % 160), 16, '#e8f2f8', { seed: 2411 + i, depth: 0.1, grain: false }); }),
    filter: sh((P, tl) => { board(P, '#1e3a4e'); P.rect(400, 900, 280, 400, '#9fd0ec', { seed: 2420, depth: 1.2 }); P.poly([[360, 900], [720, 900], [640, 980], [440, 980]], '#f2ecdc', { seed: 2421, depth: 0.8 }); }),
    fuel_no: sh((P, tl) => { board(P, '#2a2420'); icon(P, 'water', 540, 950, 1.3, tl); P.ellipse(540, 1080, 260, 60, '#6a4a8a', { seed: 2430, depth: 0.2 }); verdict(P, 790, 700, false, tl); }),
    radiator_no: sh((P, tl) => { board(P, '#2a2420'); for (let i = 0; i < 6; i++) P.rect(260 + i * 95, 760, 80, 520, '#d8d2c4', { seed: 2440 + i, depth: 1 }); verdict(P, 790, 650, false, tl); }),
    gen_no: sh((P, tl) => { darkRoom(P, tl, {}); icon(P, 'generator', 520, 1300, 1.0, tl); verdict(P, 800, 800, false, tl); }, { vignette: 0.7 }),
    gen_out: sh((P, tl) => houseGen(P, tl)),
    grill_no: sh((P, tl) => { darkRoom(P, tl, {}); P.ellipse(540, 1250, 200, 60, '#2a2a2e', { seed: 2450, depth: 1.2 }); P.rect(520, 1260, 40, 260, '#2a2a2e', { seed: 2451, depth: 0.8 }); for (let i = 0; i < 5; i++) P.circle(460 + i * 40, 1220, 22, '#e86030', { seed: 2452 + i, depth: 0.2 }); verdict(P, 800, 800, false, tl); }),
    stove_no: sh((P, tl) => { board(P, '#2a2420'); icon(P, 'stove', 540, 1000, 1.4, tl); verdict(P, 820, 700, false, tl); }),
    car_no: sh((P, tl) => { board(P, '#2a2a30'); P.rect(140, 600, 800, 900, '#4a4a54', { seed: 2460, depth: 1.2 }); P.rect(200, 680, 680, 760, '#1e1e24', { seed: 2461, depth: 0.2 }); icon(P, 'car', 540, 1220, 1.0, tl); verdict(P, 820, 600, false, tl); }),
    symptoms: sh((P, tl) => { board(P, '#3a2a2a'); listCard(P, 'КАК ГРИПП', ['головная боль', 'головокружение', 'слабость, тошнота', 'спутанность'], tl); }),
    detector: sh((P, tl) => { board(P); P.circle(540, 900, 230, '#f2ecdc', { seed: 2470, depth: 1.5 }); P.circle(540, 900, 160, '#e2dccc', { seed: 2471, depth: 0.2 }); P.circle(640, 820, 22, Math.sin(tl * 8) > 0 ? '#2e9a4a' : '#1e5a2e', { seed: 2472, depth: 0.1 }); P.label('CO', 540, 920, 90, '#f2ecdc', '#c0241c', { depth: 0, seed: 2473 }); }),
    cold_room: sh((P, tl) => { darkRoom(P, tl, { people: [Object.assign({ x: 420, y: 1700, s: 2.2, lean: 0.15, armL: -1.2, armR: -1.2 }, FAM[0])] }); P.snow(tl, 25, '#cfe0f0'); }, { vignette: 0.7 }),
    warm_center: sh((P, tl) => { city(P, tl, { off: 1 }); P.rect(330, 1200, 420, 520, '#d8c8a8', { seed: 2480, depth: 1.4 }); for (let i = 0; i < 4; i++) P.rect(370 + (i % 2) * 200, 1260 + Math.floor(i / 2) * 180, 140, 120, '#ffe39a', { seed: 2481 + i, depth: 0.2, grain: false }); P.label('ТЕПЛО', 540, 1160, 60, '#c0241c', '#ffffff', { seed: 2486 }); }),
    clothes: ico('clothes', null, '#2e3a4e'),
    phone: ico('phone', null, '#2e3a4e'),
    powerbank: ico('powerbank', null, '#2e3a4e'),
    radio: ico('radio', null, '#3a2e24'),
    landline: sh((P, tl) => { board(P, '#3a2e24'); P.rect(300, 900, 480, 300, '#2a2a2e', { seed: 2490, depth: 1.4 }); P.poly([[300, 860], [780, 860], [740, 780], [340, 780]], '#2a2a2e', { seed: 2491, depth: 1 }); for (let i = 0; i < 9; i++) P.circle(420 + (i % 3) * 120, 960 + Math.floor(i / 3) * 70, 24, '#d8d2c4', { seed: 2492 + i, depth: 0.1 }); }),
    cash: ico('cash', null, '#2a3a2a'),
    car_ok: sh((P, tl) => { city(P, tl, { off: 1 }); icon(P, 'car', 540, 1640, 1.0, tl); verdict(P, 800, 1300, true, tl); }),
    meds: ico('meds', null, '#2e3a4e'),
    docs: ico('docs', null, '#3a2e24'),
    checklist: sh((P, tl) => { board(P); listCard(P, 'ПРИГОТОВЬ СЕГОДНЯ', ['фонарик', 'вода', 'пауэрбанк', 'наличные', 'датчик угарного газа'], tl, '#2e7a4a'); }),
    save: sh((P, tl) => { city(P, tl, { off: 0.85 }); }),
  };
  window.buildShow(PR, window.CFG || {});
})();
