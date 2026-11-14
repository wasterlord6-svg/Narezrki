'use strict';
(function () {
  const sh = (paint, extra) => Object.assign({ paint, vignette: 0.5 }, extra || {});
  const PR = {
    _slamBg: '#f2d03a',
    wall_wide: sh((P, tl) => wall(P, tl, { cam: { zoom: 1.02 + tl * 0.02 }, snow: 20 })),
    wall_two: sh((P, tl) => wall(P, tl, { cam: { y: 200, zoom: 1.5 }, people: [Object.assign({ x: 420 + tl * 20, y: 1080, s: 0.6, walk: tl * 4 }, REIN), Object.assign({ x: 520 + tl * 20, y: 1090, s: 0.6, walk: tl * 4 + 1.5 }, GUNT)], snow: 30 })),
    wall_one: sh((P, tl) => wall(P, tl, { cam: { y: 200, zoom: 1.5 }, people: [Object.assign({ x: 480 + tl * 20, y: 1080, s: 0.6, walk: tl * 4 }, REIN)], snow: 40 })),
    brothers: sh((P, tl) => { desk(P, '#b8c4cc'); portrait(P, 300, 800, 1.1, { name: 'РАЙНХОЛЬД', sub: '25 ЛЕТ', rot: -0.05, hair: '#5a3a20', coat: '#b03a2e', seed: 1470 }); if (tl > 0.3) portrait(P, 780, 860, 1.1, { name: 'ГЮНТЕР', sub: '24 ГОДА', rot: 0.05, hair: '#6a4a2a', coat: '#2e5a8a', seed: 1480 }); }),
    rocket: sh((P, tl) => { evWide(P, tl, { sky: 'dawn', cam: { zoom: 1.05 } }); const k = Math.min(1, tl / 1.0); P.circle(540, 1500 - k * 1000, 24, '#ff3020', { seed: 1490, depth: 0.5 });
      if (k >= 1) for (let i = 0; i < 10; i++) { const a = i / 10 * 6.28; P.circle(540 + Math.cos(a) * (tl - 1) * 260, 500 + Math.sin(a) * (tl - 1) * 260, 18, '#ff4030', { seed: 1491 + i, depth: 0.2 }); } }),
    summit: sh((P, tl) => { evWide(P, tl, { sky: 'dawn', sun: true, cam: { x: 0, y: -600, zoom: 2.4 } }); P.person(Object.assign({ x: 470, y: 1010, s: 1.6, armR: -2.8 }, REIN)); P.person(Object.assign({ x: 620, y: 1030, s: 1.6, lean: 0.35, face: -1 }, GUNT)); }),
    bivouac: sh((P, tl) => bivouac(P, tl), { vignette: 0.7 }),
    gunther_close: sh((P, tl) => { wall(P, tl, { night: true, cam: { y: 300, zoom: 1.6 } }); P.person(Object.assign({ x: 520, y: 1950, s: 5.0, lean: 0.25 + Math.sin(tl * 2) * 0.05 }, GUNT)); P.snow(tl, 50); }, { vignette: 0.75 }),
    two_climbers: sh((P, tl) => { wall(P, tl, { cam: { y: 200, zoom: 1.6 } }); P.person(Object.assign({ x: 360, y: 900, s: 1.0, armR: -2.6 }, REIN)); P.person({ x: 620, y: 1420, s: 1.0, walk: tl * 4, coat: '#5a6a3a', hatCol: '#2e5a8a', pack: true, axe: true, seed: 1500 }); P.person({ x: 760, y: 1440, s: 1.0, walk: tl * 4 + 1, coat: '#6a4a8a', hatCol: '#e8c030', pack: true, axe: true, seed: 1520 }); }),
    diamir: sh((P, tl) => evWide(P, tl, { sky: 'day', cam: { x: -60, zoom: 1.15 }, climbers: [Object.assign({ x: 470 - tl * 40, y: 1600, s: 0.8, face: -1, walk: tl * 4 }, REIN), Object.assign({ x: 580 - tl * 40, y: 1595, s: 0.8, face: -1, walk: tl * 4 + 1.5, lean: 0.3 }, GUNT)], snow: 30 })),
    descent: sh((P, tl) => slope(P, tl, { cam: { y: 100, zoom: 1.2 }, people: [Object.assign({ x: 380 + tl * 40, y: 1500, s: 2.0, walk: tl * 4 }, REIN)], snow: 40 })),
    avalanche: sh((P, tl, t, d) => { wall(P, tl, { cam: { zoom: 1.1 } }); avalanche(P, tl, tl / d); }, { vignette: 0.6 }),
    feet: sh((P, tl) => { desk(P, '#9aa6b0'); note(P, 540, 900, 760, 560, [['ОБМОРОЖЕНИЕ', 80, '#1d2a44'], ['АМПУТИРОВАНО', 52], ['7 ПАЛЬЦЕВ', 110, '#c0241c']], { rot: 0.03 }); }),
    news: sh((P, tl) => { P.sky('#6a5a4a', '#3a3028'); paper(P, 540, 1000, 1.0, 'БРОСИЛ БРАТА?', 'ОБВИНЕНИЯ УЧАСТНИКОВ', tl); }),
    court: sh((P, tl) => { P.sky('#3a3028', '#1e1812'); for (let i = 0; i < 5; i++) { if (tl < i * 0.15) continue; xo.save(); xo.translate(300 + (i % 3) * 240, 800 + Math.floor(i / 3) * 360); xo.rotate((i - 2) * 0.08); P.rect(-160, -220, 320, 440, ['#efe4c8', '#d8e2ea', '#f2d8c0'][i % 3], { seed: 1530 + i, depth: 1.2 }); xo.font = `800 40px ${FONT}`; xo.fillStyle = '#2a1e18'; xo.textAlign = 'center'; xo.fillText('ИСК', 0, -150); xo.restore(); } }),
    legend: sh((P, tl) => evWide(P, tl, { sky: 'dawn', sun: true, cam: { x: 0, y: -600, zoom: 2.2 }, climbers: [Object.assign({ x: 540, y: 1600, s: 1.4, armR: -2.8, armL: -2.8 }, REIN)] })),
    diamir_glacier: sh((P, tl) => { glacier(P, tl, { cam: { zoom: 1.05 } }); [0, 1, 2].forEach(i => P.person({ x: 300 + i * 200 + tl * 30, y: 1460, s: 1.3, walk: tl * 4 + i, coat: ['#6a4a2a', '#4a5a3a', '#7a6a4a'][i], hat: 'wool', hatCol: '#e8e2d4', seed: 1550 + i * 20 })); }),
    boot: sh((P, tl, t, d) => { glacier(P, tl, { cam: { y: 360, zoom: 1.7 } }); iceBoot(P, 520, 1200, 2.2, Math.min(1, 0.5 + tl / d)); }),
    dna: sh((P, tl) => { desk(P, '#b8c4cc'); note(P, 540, 900, 780, 560, [['ИНСБРУК · 2005', 60, '#1d2a44'], ['АНАЛИЗ ДНК', 52], ['ГЮНТЕР', 110, '#2e7a4a']], { rot: 0.03 }); }),
  };
  PR.question = Object.assign({}, PR.wall_one, { card: { type: 'question' } });
  PR.question2 = Object.assign({}, PR.bivouac, { card: { type: 'question' } });
  PR.question3 = Object.assign({}, PR.wall_wide, { card: { type: 'question' } });
  window.buildShow(PR, window.CFG || {});
})();
