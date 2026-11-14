'use strict';
(function () {
  const sh = (paint, extra) => Object.assign({ paint, vignette: 0.55 }, extra || {});
  const KEEP = { coat: '#2a3446', pants: '#1e2430', hat: 'wool', hatCol: '#3a3a3a', beard: '#5a4030' };
  const PR = {
    _slamBg: '#e8dcc0', _slamFg: '#1d1a16',
    // ---- часть 1
    ship_pass: sh((P, tl) => island(P, tl, { ship: [900 - tl * 120, 1480, 0.9], lights: true, rain: 40, cam: { zoom: 1.05 } })),
    dark_light: sh((P, tl) => island(P, tl, { cam: { x: 200, y: -380, zoom: 1.9 }, rain: 50 }), { vignette: 0.7 }),
    portraits: sh((P, tl) => { P.sky('#4a4036', '#2e2822');
      [['ДУКАТ', -0.06, '#4a3a2a'], ['МАРШАЛЛ', 0.04, '#2a2a2a'], ['МАКАРТУР', -0.03, '#7a5a3a']].forEach((p, i) => {
        if (tl < i * 0.25) return; xo.save(); xo.translate(200 + i * 340, 820 + (i % 2) * 120); xo.rotate(p[1]);
        P.rect(-150, -200, 300, 400, '#efe4c8', { seed: 1200 + i * 3, depth: 1.4 }); P.circle(0, -60, 70, '#e8c4a0', { seed: 1201 + i * 3, depth: 0.4 });
        P.poly([[-60, -20], [60, -20], [40, 30], [-40, 30]], p[2], { seed: 1202 + i * 3, depth: 0.2 });
        xo.font = `800 44px ${FONT}`; xo.fillStyle = '#2a1e18'; xo.textAlign = 'center'; xo.fillText(p[0], 0, 140); xo.restore(); }); }),
    lighthouse: sh((P, tl) => island(P, tl, { lit: true, house: true, cam: { zoom: 1.05 } })),
    harbor_storm: sh((P, tl) => { island(P, tl, { clouds: true, rain: 90, cam: { y: 200, zoom: 1.0 } }); }, { vignette: 0.7 }),
    hesperus: sh((P, tl) => island(P, tl, { day: true, ship: [1000 - tl * 140, 1490, 1.0], cam: { zoom: 1.05 } })),
    no_flag: sh((P, tl) => { island(P, tl, { day: true, cam: { x: -120, y: -300, zoom: 1.8 } }); }),
    flare: sh((P, tl) => { island(P, tl, { day: true, ship: [700, 1490, 1.1], cam: { zoom: 1.05 } });
      const k = Math.min(1, tl / 1.2); P.circle(640, 1300 - k * 900, 26, '#ff5030', { seed: 1220, depth: 0.5 }); if (k > 0.9) P.beam(640, 400, 0, 120, 200, '#ff8060', 0.5); }),
    boat_ashore: sh((P, tl) => { island(P, tl, { day: true, cam: { x: -160, y: 120, zoom: 1.4 } });
      P.person(Object.assign({ x: 380 + tl * 50, y: 1560, s: 1.6, walk: tl * 4, coat: '#c8a030', pants: '#2a2a2a', hat: 'wool', hatCol: '#2a2a2a', seed: 1230 })); }),
    // ---- часть 2
    door: sh((P, tl) => { P.sky('#6f8aa6', '#c9d4dc'); P.rect(140, 300, 800, 1400, '#e8e2d4', { seed: 1240, depth: 1.4 });
      P.rect(330, 700, 420, 1000, '#4a3424', { seed: 1241, depth: 1.2 }); P.circle(700, 1200, 22, '#c8a040', { seed: 1242, depth: 0.4 });
      P.rect(100, 1600, 880, 40, '#5a4a40', { seed: 1243, depth: 0.6 }); }),
    room_empty: sh((P, tl) => room(P, tl, { coats: 1, clockStop: true, rain: true }), { vignette: 0.6 }),
    beds: sh((P, tl) => { P.sky('#4a4036', '#2e2822'); for (let i = 0; i < 2; i++) { const x = 140 + i * 460;
      P.rect(x, 1000, 380, 220, '#6a4a30', { seed: 1250 + i, depth: 1.2 }); P.poly([[x + 10, 1000], [x + 370, 990], [x + 360, 940], [x + 200, 900], [x + 20, 950]], '#e8e0cc', { seed: 1252 + i, depth: 0.6 }); P.ellipse(x + 80, 960, 60, 30, '#f2ecdc', { seed: 1254 + i, depth: 0.4 }); } }),
    clock: sh((P, tl) => { P.sky('#4a4036', '#2e2822'); xo.save(); xo.translate(540, 900); xo.scale(2.4, 2.4); xo.translate(-300, -560); room(P, 0, { clockStop: true, lamp: false }); xo.restore(); }),
    lamp_ready: sh((P, tl) => island(P, tl, { day: true, cam: { x: 220, y: -420, zoom: 2.2 } })),
    coat_hook: sh((P, tl) => { P.sky('#4a4036', '#2e2822'); xo.save(); xo.translate(540, 1000); xo.scale(2.0, 2.0); xo.translate(-300, -1000); room(P, 0, { coats: 1, lamp: false }); xo.restore(); }),
    storm_out: sh((P, tl) => { island(P, tl, { rain: 110, cam: { y: 150, zoom: 1.3 } });
      P.person(Object.assign({ x: 420 + tl * 60, y: 1500, s: 1.7, walk: tl * 6, coat: '#e8e2d4', lean: 0.15, seed: 1260 }, { pants: '#1e2430', hat: 'wool', hatCol: '#3a3a3a' })); }, { vignette: 0.7 }),
    telegram: sh((P, tl) => { P.sky('#6a5a4a', '#3a3028'); xo.save(); xo.translate(540, 880); xo.rotate(-0.04);
      P.rect(-400, -300, 800, 600, '#efe4b8', { seed: 1270, depth: 1.5 }); xo.textAlign = 'center'; xo.font = `800 60px ${FONT}`; xo.fillStyle = '#3a2a1a'; xo.fillText('ТЕЛЕГРАММА', 0, -200);
      xo.font = `700 46px ${FONT}`; ['ЧАСЫ ОСТАНОВИЛИСЬ', 'НЕСЧАСТЬЕ СЛУЧИЛОСЬ', 'ОКОЛО НЕДЕЛИ НАЗАД'].forEach((l, i) => { if (tl > 0.2 + i * 0.3) xo.fillText(l, 0, -80 + i * 90); }); xo.restore(); }),
    sea_empty: sh((P, tl) => { P.sky(STORM[0], STORM[1]); P.waves(tl, 900, ['#2a3e52', '#22344a', '#1a2a3c', '#14202e'], 40); P.rain(tl, 60); }, { vignette: 0.7 }),
    // ---- часть 3
    logbook_fake: sh((P, tl) => { P.sky('#3a3028', '#1e1812'); logbook(P, 540, 920, 1.3, [['Шторм', 46], ['закончился,', 46], ['море спокойно.', 46], ['Бог над всем.', 46, '#7a2a1a']], 'ВЫДУМКА', tl); }),
    muirhead: sh((P, tl) => { island(P, tl, { day: true, ship: [820, 1490, 0.8], cam: { zoom: 1.05 } });
      P.person({ x: 420 + tl * 40, y: 1560, s: 1.6, walk: tl * 4, coat: '#1e1e24', pants: '#1e1e24', hat: 'wool', hatCol: '#1e1e24', seed: 1280 }); }),
    landing: sh((P, tl) => { P.sky('#6f8aa6', '#c9d4dc'); P.poly([[-100, 600], [700, 520], [1200, 700], [1200, 2000], [-100, 2000]], '#4a4640', { seed: 1290, depth: 1.4 });
      for (let i = 0; i < 6; i++) P.limb(150 + i * 140, 760 + i * 8, 14, 160, 0.3 * Math.sin(i * 2.1) + (i === 3 ? 0.9 : 0), '#7a7a80', { seed: 1291 + i, depth: 0.6 });
      P.poly([[600, 1000], [860, 960], [920, 1180], [640, 1220]], '#3a3632', { seed: 1300, depth: 1.6 }); P.rect(220, 1050, 220, 160, '#6a4a30', { seed: 1301, depth: 1, rough: 9 });
      P.waves(tl, 1600, ['#3e6a86', '#2f5872'], 30); }),
    box_33: sh((P, tl) => { P.sky('#6f8aa6', '#c9d4dc'); P.rect(260, 700, 560, 520, '#6a4a30', { seed: 1310, depth: 1.5, rough: 14 });
      P.poly([[260, 700], [480, 640], [560, 760], [380, 900]], '#3a2a1a', { seed: 1311, depth: 0.5 }); }),
    rock: sh((P, tl) => { P.sky('#6f8aa6', '#c9d4dc'); P.poly([[-100, 1300], [1200, 1250], [1200, 2000], [-100, 2000]], '#5f7a4a', { seed: 1320, depth: 1 });
      P.poly([[300, 1300], [380, 1000], [640, 960], [800, 1080], [780, 1310]], '#5a5650', { seed: 1321, depth: 1.8 });
      P.poly([[240, 1320], [820, 1300], [830, 1340], [250, 1360]], '#3a2a1a', { seed: 1322, depth: 0.2 }); }),
    big_wave: sh((P, tl, t, d) => { island(P, tl, { cam: { y: 160, zoom: 1.15 }, rain: 60, seaY: 1520 - 500 * Math.min(1, tl / (d * 0.7)) }); }, { vignette: 0.7 }),
    poem: sh((P, tl) => { P.sky('#3a3028', '#1e1812'); logbook(P, 540, 920, 1.3, [['ФЛАННАН', 46, '#3a2a1a', -175], ['1912', 70, '#7a2a1a', -175], ['СТИХИ', 46, '#3a2a1a', -175], ['обед', 40, '#3a2a1a', 175], ['стул', 40, '#3a2a1a', 175]], 'ВЫМЫСЕЛ', tl); }),
  };
  PR.question = Object.assign({}, PR.boat_ashore, { card: { type: 'question' } });
  PR.question2 = Object.assign({}, PR.storm_out, { card: { type: 'question' } });
  PR.question3 = Object.assign({}, PR.big_wave, { card: { type: 'question' } });
  window.buildShow(PR, window.CFG || {});
})();
