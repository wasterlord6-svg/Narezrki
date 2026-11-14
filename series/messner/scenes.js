'use strict';
// Месснер, Нанга-Парбат 1970. Использует evWide/portrait/note/iceBoot/glacier/desk из ../everest/scenes.js
const REIN = { coat: '#b03a2e', pants: '#3a3a4a', hatCol: '#e8c030', beard: '#6a4a2a', axe: true, pack: true, seed: 1401 };
const GUNT = { coat: '#2e5a8a', pants: '#3a3a4a', hatCol: '#c4302a', axe: true, pack: true, seed: 1421 };
// Отвесная стена Рупал: огромная скальная плита, снежные полки, крошечные фигурки
function wall(P, tl, o) {
  o = o || {};
  const cam = o.cam || {};
  P.layer(cam, 0.05, () => P.sky(o.night ? '#0f1530' : '#3a64a8', o.night ? '#3a3f6a' : '#c9dcee'));
  P.layer(cam, 0.35, () => {
    P.poly([[-100, 2000], [-100, 500], [200, 260], [540, 120], [860, 240], [1180, 520], [1180, 2000]], o.night ? '#2a2e48' : '#5d6a86', { seed: 1440, depth: 1.6 });
    for (let i = 0; i < 9; i++) { const y = 420 + i * 170, x = 100 + (i % 3) * 260;
      P.poly([[x, y], [x + 300, y - 30], [x + 340, y + 10], [x + 20, y + 40]], '#eef2fa', { seed: 1441 + i, depth: 0.4 }); }
    P.poly([[400, 170], [540, 120], [680, 180], [600, 260], [480, 250]], '#f6f8fc', { seed: 1455, depth: 0.5 });
  });
  (o.people || []).forEach(p => P.layer(cam, 0.35, () => P.person(p)));
  if (o.snow) P.snow(tl, o.snow);
}
// Лавина: каскад белых бумажных глыб, k 0..1
function avalanche(P, tl, k) {
  for (let i = 0; i < 40; i++) {
    const d = clamp01(k * 1.4 - hash(i * 2.1) * 0.4), x = 100 + hash(i * 3.7) * 880 + d * 120, y = -200 + d * 1900 + hash(i * 5.3) * 300, r = 40 + hash(i) * 70;
    if (d <= 0) continue;
    piece(circlePts(x, y, r, r * 0.8, 9), i % 3 ? '#f2f5fa' : '#dfe6ef', { seed: 1460 + i, depth: 1, rough: 6 });
  }
}
// Ночёвка без палатки: двое под стеной, звёзды
function bivouac(P, tl) {
  wall(P, tl, { night: true, cam: { y: 300, zoom: 1.6 } });
  P.person(Object.assign({ x: 420, y: 1500, s: 1.8, lean: 0.4, armL: -1.2, armR: -1.2 }, REIN));
  P.person(Object.assign({ x: 640, y: 1510, s: 1.8, lean: 0.5, face: -1, armL: -1.2, armR: -1.2 }, GUNT));
  P.snow(tl, 40);
}
// Газета с заголовком
function paper(P, x, y, s, head, sub, tl) {
  xo.save(); xo.translate(x, y); xo.rotate(0.04); xo.scale(s, s);
  P.rect(-420, -520, 840, 1040, '#ece6d6', { seed: 1500, depth: 1.6 });
  xo.textAlign = 'center'; xo.font = `800 96px ${FONT}`; xo.fillStyle = '#1d1a16'; xo.fillText(head, 0, -360);
  xo.font = `800 46px ${FONT}`; xo.fillText(sub || '', 0, -270);
  for (let j = 0; j < 8; j++) { xo.fillStyle = '#b9b3a3'; xo.fillRect(-340, -160 + j * 70, 680, 18); }
  xo.restore();
}
