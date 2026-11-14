'use strict';
(function () {
  const sh = (paint, extra) => Object.assign({ paint, vignette: 0.55 }, extra || {});
  const PR = {
    _slamBg: '#f2d03a',
    mouth: sh((P, tl) => caveMouth(P, tl, { people: [0, 1, 2, 3].map(i => Object.assign({ x: 260 + i * 150 + tl * 50, y: 1500 + (i % 2) * 30, walk: tl * 5 + i }, BOY(i), { s: 1.3 })) })),
    team: sh((P, tl) => { P.sky('#6a9a5a', '#3a6a3a'); P.rect(-100, 1300, OW + 200, 800, '#4a7a3a', { seed: 1870, depth: 1 }); P.rect(80, 1290, 920, 8, '#f2f2f2', { seed: 1871, depth: 0, grain: false });
      for (let i = 0; i < 13; i++) P.person(Object.assign({ x: 110 + (i % 7) * 140 + (i > 6 ? 70 : 0), y: 1250 + (i > 6 ? 160 : 0), armR: i % 3 ? -0.2 : -2.6 }, BOY(i), { s: 1.0 }, i === 12 ? { coat: '#4a4a4a', s: 1.25 } : {})); P.circle(860, 1560, 40, '#f2f2f2', { seed: 1872, depth: 0.6 }); }),
    rain: sh((P, tl) => caveMouth(P, tl, { rain: 120 }), { vignette: 0.65 }),
    crowd: sh((P, tl) => caveMouth(P, tl, { rain: 40, people: Array.from({ length: 9 }, (_, i) => { const w = wander(i + 50, tl + 3, 120 + (i % 5) * 200, 0, 30); return { x: w.x, y: 1500 + Math.floor(i / 5) * 160, s: 1.1, walk: w.walk, coat: ['#d8b030', '#2e5a8a', '#4a5a3a', '#c4302a'][i % 4], hat: 'helmet', hatCol: '#f2c230', seed: 1880 + i * 9 }; }) })),
    dive: sh((P, tl) => flooded(P, tl, { divers: [[300 + tl * 120, 1000, 1.2], [80 + tl * 120, 1150, 1.0, 0.7, { tank: '#c4302a' }]] })),
    dive_close: sh((P, tl) => flooded(P, tl, { narrow: true, divers: [[440 + tl * 60, 1000, 2.0]] })),
    ledge_dark: sh((P, tl) => ledge(P, tl, {}), { vignette: 0.8 }),
    ledge_light: sh((P, tl) => ledge(P, tl, { light: true })),
    seals: sh((P, tl) => { ledge(P, tl, { light: true }); for (let i = 0; i < 3; i++) P.person({ x: 760 + i * 110, y: 1320, s: 1.1, coat: '#1e1e24', pants: '#1e1e24', hat: 'helmet', hatCol: '#e8c030', seed: 1900 + i * 9 }); }),
    tanks: sh((P, tl) => flooded(P, tl, { divers: [[200 + tl * 150, 1000, 1.3, 0, { tank: '#c4302a' }]] })),
    memorial: sh((P, tl) => { P.sky('#2a2420', '#14100c'); xo.save(); xo.translate(540, 860); xo.rotate(-0.03); P.rect(-260, -340, 520, 680, '#efe4c8', { seed: 1910, depth: 1.5 });
      P.circle(0, -120, 110, '#c8946a', { seed: 1911, depth: 0.5 }); P.poly([[-110, -150], [110, -150], [90, -230], [-90, -230]], '#1e1e24', { seed: 1912, depth: 0.3 }); P.poly([[-180, 120], [180, 120], [150, 10], [-150, 10]], '#1e1e24', { seed: 1913, depth: 0.4 }); xo.restore();
      for (let i = 0; i < 3; i++) { P.rect(300 + i * 200, 1350, 50, 140, '#f2ecdc', { seed: 1914 + i, depth: 0.8 }); P.poly([[325 + i * 200, 1300], [340 + i * 200, 1340], [310 + i * 200, 1340]], '#ffb030', { seed: 1918 + i, depth: 0.1 }); } }, { vignette: 0.7 }),
    pumps: sh((P, tl) => { caveMouth(P, tl, {}); for (let i = 0; i < 3; i++) { P.rect(160 + i * 300, 1520, 180, 120, '#3a6ad0', { seed: 1930 + i, depth: 1 }); P.limb(250 + i * 300, 1520, 30, 300, 2.6 + i * 0.2, '#2a2a2e', { seed: 1934 + i, depth: 0.5 }); }
      for (let i = 0; i < 8; i++) P.circle(200 + i * 100 + (tl * 200 % 100), 1760, 18, '#6aa0d0', { seed: 1940 + i, depth: 0.2, grain: false }); }),
    plan: sh((P, tl) => caveMap(P, tl, 0.3)),
    mask: sh((P, tl) => { P.sky('#08141c', '#0e2a3a'); xo.save(); xo.translate(540, 900); xo.scale(2.4, 2.4); P.circle(0, 0, 110, '#c8946a', { seed: 1950, depth: 1 }); P.ellipse(0, 10, 100, 110, '#2a3a4a', { seed: 1951, depth: 0.8 }); P.ellipse(0, -10, 80, 70, '#9fc4d8', { seed: 1952, depth: 0.2 }); P.rect(-20, 90, 40, 80, '#1e1e24', { seed: 1953, depth: 0.5 }); xo.restore(); }),
    carry: sh((P, tl) => flooded(P, tl, { divers: [[200 + tl * 110, 1000, 1.3, 0, { carry: true }]] })),
    map: sh((P, tl, t, d) => caveMap(P, tl, 0.2 + 0.8 * (tl / d))),
    exit: sh((P, tl) => caveMouth(P, tl, { people: [0, 1, 2].map(i => ({ x: 380 + i * 160, y: 1480 + (i % 2) * 40, s: 1.3, armR: -2.6, armL: -2.6, coat: '#d8b030', hat: 'helmet', hatCol: '#f2c230', seed: 1960 + i * 9 })) })),
    films: sh((P, tl) => { P.sky('#1e1a16', '#0e0c0a'); for (let i = 0; i < 3; i++) { if (tl < i * 0.25) continue; xo.save(); xo.translate(240 + i * 300, 900); xo.rotate((i - 1) * 0.07); P.rect(-130, -200, 260, 400, ['#c4302a', '#2e5a8a', '#2e7a4a'][i], { seed: 1970 + i, depth: 1.4 }); P.circle(0, -40, 60, '#f2d03a', { seed: 1974 + i, depth: 0.3 }); xo.restore(); } }),
  };
  PR.question = Object.assign({}, PR.ledge_light, { card: { type: 'question' } });
  PR.question2 = Object.assign({}, PR.dive, { card: { type: 'question' } });
  PR.question3 = Object.assign({}, PR.exit, { card: { type: 'question' } });
  window.buildShow(PR, window.CFG || {});
})();
