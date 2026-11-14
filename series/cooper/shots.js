'use strict';
(function () {
  const sh = (paint, extra) => Object.assign({ paint, vignette: 0.5 }, extra || {});
  const PR = {
    _slamBg: '#f2d03a',
    // ---- часть 1
    ticket: sh((P, tl) => { P.sky('#6a5a4a', '#3a3028'); noteCard(P, 540, 820, 1.4 + tl * 0.03, [['ПОРТЛЕНД → СИЭТЛ', 50], ['РЕЙС 305', 64, '#c0241c'], ['DAN COOPER', 72], ['НАЛИЧНЫЕ', 44, '#7a5a3a']], -0.04); }),
    board: sh((P, tl) => airport(P, tl, { stair: 1, rain: 40 })),
    cabin_cooper: sh((P, tl) => cabin(P, tl, { rain: true, people: [Object.assign({ x: 560, y: 1330, s: 2.0 }, COOP)] })),
    year: sh((P, tl) => { nightSky(P, tl, { moon: true }); jet(P, 300 + tl * 160, 900, 0.8, { lit: true }); }),
    note_pass: sh((P, tl) => cabin(P, tl, { people: [Object.assign({ x: 380, y: 1330, s: 2.0, armR: -1.3 }, COOP), Object.assign({ x: 760, y: 1360, s: 2.1, face: -1 }, STEW)] })),
    note_card: sh((P, tl) => { P.sky('#3a3e48', '#2a2d34'); noteCard(P, 540, 860, 1.4, [['МИСС,', 64], ['У МЕНЯ В ПОРТФЕЛЕ', 52], ['БОМБА.', 96, '#c0241c'], ['СЯДЬТЕ РЯДОМ', 52]], 0.04); }),
    whisper: sh((P, tl) => { cabin(P, tl, {}); P.person(Object.assign({ x: 480, y: 1900, s: 5.2 }, COOP)); }),
    briefcase: sh((P, tl) => { P.sky('#3a3e48', '#2a2d34'); briefcase(P, 540, 1000, 1.5 + tl * 0.03, true, tl); }),
    demands: sh((P, tl) => { P.sky('#2a2018', '#1a1410'); noteCard(P, 540, 800, 1.5, [['ТРЕБОВАНИЯ', 60], ['$200 000', 110, '#2a6a3a'], ['4 ПАРАШЮТА', 72, '#c0241c']], -0.03); }),
    // ---- часть 2
    stair_open: sh((P, tl) => { nightSky(P, tl, {}); jet(P, 560, 820, 1.05, { stair: 1, ang: -0.05 }); P.rain(tl, 70); }),
    seattle: sh((P, tl) => airport(P, tl, { truck: true, rain: 50 })),
    money: sh((P, tl) => { P.sky('#2a2018', '#1a1410'); bills(P, 400, 900, 1.6, 4, -0.15); bills(P, 640, 1150, 1.5, 3, 0.2); }),
    takeoff: sh((P, tl) => { nightSky(P, tl, {}); jet(P, 200 + tl * 220, 1300 - tl * 160, 0.9, { lit: true, ang: -0.18 }); P.rain(tl, 50); }),
    warn_light: sh((P, tl) => { P.sky('#141820', '#0a0c10'); P.rect(140, 560, 800, 600, '#2a2e36', { seed: 1100, depth: 1.4 });
      for (let i = 0; i < 6; i++) P.circle(260 + (i % 3) * 280, 720 + Math.floor(i / 3) * 280, 70, i === 4 ? (Math.sin(tl * 12) > 0 ? '#ff4030' : '#7a2018') : '#3a4048', { seed: 1101 + i, depth: 0.5 });
      if (Math.sin(tl * 12) > 0) P.beam(540, 1000, -Math.PI / 2, 300, 300, '#ff6040', 0.3); }, { vignette: 0.7 }),
    jolt: sh((P, tl, t, d) => { nightSky(P, tl, {}); jet(P, 540, 900, 1.05, { stair: 1, ang: -0.05 - 0.25 * Math.max(0, Math.sin(tl * 6)) * (tl < 1 ? 1 : 0.2) }); P.rain(tl, 70); }),
    jump: sh((P, tl) => { nightSky(P, tl, {}); chutist(P, 540, 700 + tl * 160, 1.6, Math.min(1, tl * 0.8), tl); P.rain(tl, 80); }, { vignette: 0.65 }),
    empty_cabin: sh((P, tl) => cabin(P, tl, { rain: true }), { vignette: 0.7 }),
    search: sh((P, tl) => { forest(P, tl, { day: true, river: false });
      for (let i = 0; i < 4; i++) P.person({ x: 160 + i * 240 + tl * 40, y: 1720, s: 1.4, walk: tl * 4 + i, coat: '#4a5a3a', pants: '#3a4a2a', hat: 'helmet', hatCol: '#4a5a3a', seed: 1110 + i * 20 }); }),
    forest_night: sh((P, tl) => forest(P, tl, { river: true, rain: 60 }), { vignette: 0.65 }),
    // ---- часть 3
    river_boy: sh((P, tl) => riverBank(P, tl, { boy: [520, 1600, 2.2] })),
    money_sand: sh((P, tl) => { riverBank(P, tl, {}); bills(P, 540, 1450, 1.4 + tl * 0.04, 3, -0.25); }),
    fbi_match: sh((P, tl) => { P.sky('#3a3a44', '#22222a'); fbiFile(P, 540, 1060, 1.1, 'ВЫКУП', 'СОВПАЛО', tl); }),
    river_wide: sh((P, tl) => riverBank(P, tl, { boy: [300 + tl * 30, 1480, 1.0] })),
    tie: sh((P, tl) => { P.sky('#3a3e48', '#2a2d34'); P.rect(240, 600, 600, 800, '#2a4a8a', { seed: 1130, depth: 1.2 });
      P.poly([[500, 700], [580, 700], [600, 760], [560, 1200], [540, 1260], [520, 1200], [480, 760]], '#141418', { seed: 1131, depth: 1.2 }); P.rect(470, 880, 140, 20, '#c8a040', { seed: 1132, depth: 0.5 }); }),
    dna: sh((P, tl) => { P.sky('#3a3a44', '#22222a'); noteCard(P, 540, 880, 1.4, [['ДНК С ГАЛСТУКА', 60], ['ПРОФИЛЬ: ЧАСТИЧНЫЙ', 44], ['СОВПАДЕНИЙ:', 52], ['НЕТ', 110, '#c0241c']], 0.03); }),
    file_2016: sh((P, tl) => { P.sky('#3a3a44', '#22222a'); fbiFile(P, 540, 1060, 1.1, 'КУПЕР', 'ПРИОСТАНОВЛЕНО', tl); }),
    newspaper: sh((P, tl) => { P.sky('#6a5a4a', '#3a3028'); xo.save(); xo.translate(540, 900); xo.rotate(0.05);
      P.rect(-420, -520, 840, 1040, '#ece6d6', { seed: 1140, depth: 1.6 }); xo.textAlign = 'center'; xo.font = `800 110px ${FONT}`; xo.fillStyle = '#1d1a16'; xo.fillText('ДИ БИ КУПЕР', 0, -360);
      xo.font = `800 50px ${FONT}`; xo.fillText('УГОНЩИК ИСЧЕЗ', 0, -260); for (let j = 0; j < 8; j++) { xo.fillStyle = '#b9b3a3'; xo.fillRect(-340, -160 + j * 70, 680, 18); }
      if (tl > 0.4) { xo.strokeStyle = '#c0241c'; xo.lineWidth = 12; xo.beginPath(); xo.ellipse(0, -370, 400, 90, 0, 0, 7); xo.stroke(); } xo.restore(); }),
  };
  PR.question = Object.assign({}, PR.briefcase, { card: { type: 'question' } });
  PR.question2 = Object.assign({}, PR.forest_night, { card: { type: 'question' } });
  PR.question3 = Object.assign({}, PR.forest_night, { card: { type: 'question' } });
  window.buildShow(PR, window.CFG || {});
})();
