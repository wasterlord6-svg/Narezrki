'use strict';
// Кадры серии «Тайна Эвереста» (бумажная аппликация). paint(P, tl, t, d)
(function () {
  const MAL = { coat: '#7a5232', hatCol: '#b03a2e', pack: true, axe: true, pants: '#4a3a30' };
  const IRV = { coat: '#5a6a3a', hatCol: '#2e5a8a', oxygen: true, axe: true, goggles: true, pants: '#3e3a2e' };
  const MODERN = { coat: '#d8402a', pants: '#2a2a3a', hat: 'helmet', hatCol: '#f2c230', goggles: true, pack: true, packCol: '#2a4a8a', axe: true };
  const sh = (paint, extra) => Object.assign({ paint, vignette: 0.45 }, extra || {});
  const W = (tl, k) => tl * (k || 5);

  const PR = {
    // ---- часть 1
    dawn_leave: sh((P, tl) => evWide(P, tl, { sky: 'day', sun: true, cloudsBack: true, cam: { x: tl * 18, zoom: 1.02 + tl * 0.02 },
      climbers: [Object.assign({ x: 300 + tl * 60, y: 1600, s: 0.9, walk: W(tl) }, MAL), Object.assign({ x: 470 + tl * 60, y: 1590, s: 0.9, walk: W(tl) + 1.6 }, IRV)] })),
    ridge_two: sh((P, tl) => evWide(P, tl, { sky: 'day', cloudsBack: true, cam: { x: 120, y: 300, zoom: 1.35 + tl * 0.03 },
      climbers: [Object.assign({ x: 520 + tl * 30, y: 1580, s: 0.55, walk: W(tl) }, MAL), Object.assign({ x: 610 + tl * 30, y: 1575, s: 0.55, walk: W(tl) + 1.6 }, IRV)], snow: 30 })),
    portrait_m: sh((P, tl) => { desk(P); portrait(P, 540, 790, 1.6 + tl * 0.02, { name: 'ДЖОРДЖ МЭЛЛОРИ', sub: '1924', rot: -0.04, hair: '#4a2e1c' }); }),
    portrait_i: sh((P, tl) => { desk(P, '#b8c4cc'); portrait(P, 540, 790, 1.6 + tl * 0.02, { name: 'ЭНДРЮ ИРВИН', sub: 'СТУДЕНТ-ИНЖЕНЕР', rot: 0.04, hair: '#c08a40', coat: '#5a6a3a', seed: 331 }); }),
    oxygen: sh((P, tl) => { desk(P, '#9fb0bc'); bottle(P, 420, 1050, 2.1, -0.12 + tl * 0.01); bottle(P, 680, 1080, 2.0, 0.1); }),
    camp: sh((P, tl) => { evWide(P, tl, { sky: 'dawn', sun: true, cam: { y: 120, zoom: 1.15 } });
      tent(P, 300, 1700, 1.1, '#d8a23a', 3); tent(P, 720, 1720, 1.3, '#c45a3a', 5);
      P.person(Object.assign({ x: 520 + tl * 50, y: 1760, s: 1.1, walk: W(tl) }, MAL)); P.person(Object.assign({ x: 380 + tl * 50, y: 1770, s: 1.1, walk: W(tl) + 1.6 }, IRV)); P.snow(tl, 30); }),
    clouds_part: sh((P, tl, t, d) => evWide(P, tl, { sky: 'storm', clouds: Math.max(0, 1 - tl / (d * 0.6)), cam: { zoom: 1.1 } })),
    odell: sh((P, tl) => { evWide(P, tl, { sky: 'storm', cam: { y: 300, zoom: 1.5 } });
      P.person({ x: 520, y: 1780, s: 3.2, face: 1, coat: '#4a5a6a', hatCol: '#6a4a2a', armR: -2.5, armL: 0.2, lean: -0.08, seed: 9 }); P.snow(tl, 25); }),
    figures_close: sh((P, tl) => { evWide(P, tl, { sky: 'day', cam: { x: 60, y: -120, zoom: 1.9 } });
      P.person(Object.assign({ x: 430 + tl * 40, y: 1500, s: 1.5, walk: W(tl, 4) }, MAL)); P.person(Object.assign({ x: 640 + tl * 40, y: 1480, s: 1.5, walk: W(tl, 4) + 1.6 }, IRV)); }),
    clouds_close: sh((P, tl, t, d) => evWide(P, tl, { sky: 'storm', clouds: Math.min(1, tl / (d * 0.7)), snow: 90, cam: { zoom: 1.1 + tl * 0.03 },
      climbers: [Object.assign({ x: 520, y: 1590, s: 0.6, walk: W(tl) }, MAL), Object.assign({ x: 600, y: 1585, s: 0.6, walk: W(tl) + 1.6 }, IRV)] })),
    ridge_empty: sh((P, tl) => evWide(P, tl, { sky: 'storm', snow: 120, cam: { x: 120 - tl * 20, y: 300, zoom: 1.35 } }), { vignette: 0.6 }),
    card1953: sh((P, tl) => { evWide(P, tl, { sky: 'day', sun: true, cam: { zoom: 1.05 } });
      note(P, 540, 900, 760, 520, [['1953', 140, '#b03a2e'], ['ХИЛЛАРИ И ТЕНЦИНГ', 56], ['ПЕРВЫЕ НА ВЕРШИНЕ', 44, '#7a5a3a']], { rot: -0.03 }); }),
    // ---- часть 2
    anker: sh((P, tl) => slope(P, tl, { cam: { y: 80, zoom: 1.15 }, people: [Object.assign({ x: 380 + tl * 30, y: 1500, s: 2.0, walk: W(tl, 3) }, MODERN)], snow: 20 })),
    white_spot: sh((P, tl) => slope(P, tl, { spot: true, cam: { x: 40, y: 260, zoom: 1.6 + tl * 0.06 } })),
    tag: sh((P, tl) => { desk(P, '#8a9aa6'); P.rect(140, 600, 800, 700, '#6a5a44', { seed: 300, depth: 1 });
      note(P, 540, 950, 600, 260, [['G. MALLORY', 96, '#2a1e18']], { rot: -0.05, bg: '#f3ead2', seed: 301 }); }),
    rope: sh((P, tl) => { desk(P, '#8a7a66'); rope(P, 540, 980, 2.2 + tl * 0.03, true); }),
    fall: sh((P, tl) => slope(P, tl, { cam: { x: -60, y: -150, zoom: 1.3 }, snow: 50 }), { vignette: 0.6 }),
    goggles: sh((P, tl) => { desk(P, '#7a8a96'); goggles(P, 540, 960, 1.9 + tl * 0.03); }),
    dusk: sh((P, tl) => evWide(P, tl, { sky: 'dawn', cam: { y: -100, zoom: 1.2 },
      climbers: [Object.assign({ x: 640 - tl * 40, y: 1590, s: 0.7, face: -1, walk: W(tl) }, MAL), Object.assign({ x: 760 - tl * 40, y: 1585, s: 0.7, face: -1, walk: W(tl) + 1.6 }, IRV)] }), { vignette: 0.65 }),
    photo: sh((P, tl) => { desk(P, '#c4a888'); portrait(P, 540, 790, 1.5, { name: 'РУТ', sub: 'ЖЕНА МЭЛЛОРИ', rot: 0.05, hair: '#3a2416', coat: '#7a3a4a', seed: 351 });
      if (tl > 0.4) P.label('?', 800, 650, 220, '#c0241c', '#ffffff', { rot: 0.12, seed: 352 }); }),
    camera: sh((P, tl) => { desk(P, '#9aa6b0'); kodak(P, 540, 960, 2.4 + tl * 0.04, -0.06); }),
    // ---- часть 3
    glacier_boot: sh((P, tl, t, d) => { glacier(P, tl, { cam: { zoom: 1.05 + tl * 0.03 } }); iceBoot(P, 540, 1300, 1.6, Math.min(1, 0.3 + tl / d)); }),
    team_glacier: sh((P, tl) => { glacier(P, tl, { cam: { zoom: 1.1 } });
      [0, 1, 2].forEach(i => P.person(Object.assign({ x: 260 + i * 230 + tl * 40, y: 1480 + i * 30, s: 1.4, walk: W(tl, 4) + i, seed: 400 + i * 20 }, MODERN, i === 1 ? { coat: '#2a7a5a' } : {}))); P.snow(tl, 20); }),
    bottle1933: sh((P, tl) => { glacier(P, tl, { cam: { y: 300, zoom: 1.4 } }); bottle(P, 560, 1350, 1.9, 1.2, '1933'); }),
    boot_close: sh((P, tl) => { glacier(P, tl, { cam: { y: 360, zoom: 1.7 } }); iceBoot(P, 520, 1200, 2.2, 1); }),
    sock_label: sh((P, tl) => { desk(P, '#7a8a96'); P.rect(200, 620, 680, 760, '#b8a888', { seed: 420, depth: 1.2 });
      P.label('A.C. IRVINE', 540, 980, 100, '#c0241c', '#ffffff', { rot: -0.04, seed: 421 }); }),
    team_close: sh((P, tl) => { glacier(P, tl, { cam: { y: 280, zoom: 1.55 } });
      [0, 1].forEach(i => P.person(Object.assign({ x: 380 + i * 300 + tl * 30, y: 1420, s: 2.4, walk: tl * 3 + i, seed: 440 + i * 20 }, MODERN, i ? { coat: '#2a7a5a' } : {}))); P.snow(tl, 25); }),
    dna_card: sh((P, tl) => { desk(P, '#b8c4cc'); note(P, 540, 920, 780, 560, [['АНАЛИЗ ДНК', 84, '#1d2a44'], ['ОБРАЗЕЦ ВЗЯТ', 52], ['РЕЗУЛЬТАТ:', 52, '#7a5a3a']], { rot: 0.03 });
      if (tl > 0.3) P.label('?', 760, 1080, 180, '#c0241c', '#ffffff', { rot: -0.1, seed: 460 }); }),
    portrait_dna: sh((P, tl) => { desk(P, '#b8c4cc'); portrait(P, 540, 790, 1.6, { name: 'ЭНДРЮ ИРВИН', sub: '1902–1924', rot: 0.04, hair: '#c08a40', coat: '#5a6a3a', seed: 331 }); }),
    glacier_wide: sh((P, tl) => { glacier(P, tl, { cam: { zoom: 1 } });
      xo.save(); xo.setLineDash([26, 18]); xo.lineWidth = 12; xo.strokeStyle = '#c0241c'; xo.beginPath(); xo.ellipse(560, 1300, 300 - tl * 40, 170 - tl * 20, 0, 0, 7); xo.stroke(); xo.restore(); }),
    mountain_clouds: sh((P, tl, t, d) => evWide(P, tl, { sky: 'storm', clouds: 0.6 + 0.3 * Math.sin(tl), snow: 60, cam: { zoom: 1.05 + tl * 0.03 } }), { vignette: 0.6 }),
  };
  // вопрос — поверх широкого плана
  PR.question = Object.assign({}, PR.ridge_empty, { card: { type: 'question' } });
  PR.question2 = Object.assign({}, PR.dusk, { card: { type: 'question' } });
  PR.question3 = Object.assign({}, PR.mountain_clouds, { card: { type: 'question' } });

  window.buildShow(PR, window.CFG || {});
})();
