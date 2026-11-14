'use strict';
// Пещера Тхам Луанг, 2018
const BOY = (i) => ({ coat: ['#c4302a', '#e8c030', '#2e7a4a', '#3a5a9a', '#7a3a8a'][i % 5], pants: '#2a2a30', hat: 'none', skin: '#c8946a', s: 0.75 + hash(i) * 0.12, seed: 1600 + i * 7 });
// Водолаз горизонтально: гидрокостюм, баллон, маска, ласты, фонарь
function diver(P, x, y, s, tl, o) {
  o = o || {};
  xo.save(); xo.translate(x, y); xo.scale(s * (o.flip ? -1 : 1), s); xo.rotate(Math.sin(tl * 3) * 0.04);
  const k = Math.sin(tl * 6) * 0.35;
  P.limb(-110, 6, 26, 120, 1.57 + k, '#1a1a1e', { seed: 1650, depth: 0.6 }); P.limb(-110, -6, 26, 120, 1.57 - k, '#222226', { seed: 1651, depth: 0.6 });
  P.poly([[-235, -10 + k * 40], [-280, -40 + k * 40], [-280, 30 + k * 40]], '#e8c030', { seed: 1652, depth: 0.4 });
  P.rect(-120, -40, 200, 80, '#1e1e24', { seed: 1653, depth: 1 });
  P.rect(-100, -78, 150, 40, o.tank || '#e8c030', { seed: 1654, depth: 0.8 });
  P.circle(110, -4, 38, '#c8946a', { seed: 1655, depth: 0.6 });
  P.rect(110, -24, 48, 30, '#2a3a4a', { seed: 1656, depth: 0.3 });
  P.limb(70, 0, 20, 90, -1.2, '#1e1e24', { seed: 1657, depth: 0.5 });
  if (o.torch !== false) P.beam(160, 10, 0.05, 900, 260, '#fff2b8', 0.35);
  if (o.carry) { P.rect(-20, 40, 220, 60, '#c4302a', { seed: 1658, depth: 0.8 }); P.circle(200, 70, 30, '#c8946a', { seed: 1659, depth: 0.4 }); P.rect(195, 54, 40, 28, '#2a3a4a', { seed: 1660, depth: 0.2 }); }
  for (let i = 0; i < 6; i++) { const ph = (tl * 0.8 + i / 6) % 1; P.circle(140 + ph * 60, -60 - ph * 300, 8 + i % 3 * 4, '#bfe0f0', { seed: 1661 + i, depth: 0, grain: false }); }
  xo.restore();
}
// Затопленный ход: тёмная вода, скалы сверху и снизу, узкий проход
function flooded(P, tl, o) {
  o = o || {};
  P.sky('#08141c', '#0e2a3a');
  P.poly([[-100, -100], [1200, -100], [1200, 520 + (o.narrow ? 200 : 0)], [900, 600], [600, 560], [300, 640], [-100, 560]], '#2a2622', { seed: 1700, depth: 1.6 });
  P.poly([[-100, 2100], [1200, 2100], [1200, 1400 - (o.narrow ? 200 : 0)], [800, 1340], [500, 1420], [200, 1360], [-100, 1440]], '#2a2622', { seed: 1701, depth: 1.6 });
  for (let i = 0; i < 8; i++) P.poly([[i * 150, 560 + (i % 2) * 40], [i * 150 + 60, 700], [i * 150 + 100, 580]], '#221e1a', { seed: 1702 + i, depth: 0.8 });
  for (let i = 0; i < 30; i++) { const x = (hash(i * 3.1) * 1200 - tl * 30 * (1 + hash(i))) % 1200; P.circle((x + 1200) % 1200, 700 + hash(i * 7) * 700, 3 + hash(i) * 5, '#4a7a8a', { seed: 1710 + i, depth: 0, grain: false }); }
  (o.divers || []).forEach(d => diver(P, d[0], d[1], d[2] || 1, tl + (d[3] || 0), d[4] || {}));
}
// Уступ в пещере с мальчиками; o.light — луч фонаря
function ledge(P, tl, o) {
  o = o || {};
  P.sky('#06080c', '#14100c');
  P.poly([[-100, 1250], [300, 1180], [800, 1200], [1200, 1260], [1200, 2100], [-100, 2100]], '#4a3e30', { seed: 1750, depth: 1.4 });
  P.poly([[-100, 1500], [1200, 1480], [1200, 2100], [-100, 2100]], '#0e2a3a', { seed: 1751, depth: 1 });
  for (let i = 0; i < 13; i++) P.person(Object.assign({ x: 120 + (i % 7) * 140 + (i > 6 ? 70 : 0), y: 1220 + (i > 6 ? 70 : 0), lean: 0.3, armL: -0.6, armR: -0.6 }, BOY(i), i === 12 ? { s: 1.0, coat: '#4a4a4a' } : {}));
  if (o.light) { P.beam(1200, 1400, Math.PI + 0.25, 1300, 520, '#fff2b8', 0.5); }
  else xo.save(), xo.fillStyle = 'rgba(0,0,0,0.45)', xo.fillRect(0, 0, OW, OH), xo.restore();
}
// Вход в пещеру, джунгли, ливень
function caveMouth(P, tl, o) {
  o = o || {};
  P.sky('#3a4a3a', '#7a8a6a');
  P.ridge(-200, 1300, 900, [[0, 400], [300, 600], [600, 520], [900, 640], [1200, 420]], '#2a4a2e', { seed: 1800, depth: 1 });
  P.poly([[-100, 900], [1200, 860], [1200, 2100], [-100, 2100]], '#4a5a3a', { seed: 1801, depth: 1.2 });
  P.ellipse(560, 1120, 230, 200, '#0a0806', { seed: 1802, depth: 0.8 });
  for (let i = 0; i < 9; i++) P.poly([[i * 140 - 40, 980], [i * 140 + 20, 760 - hash(i) * 120], [i * 140 + 80, 980]], i % 2 ? '#2e5a32' : '#3a6a3a', { seed: 1803 + i, depth: 0.8 });
  (o.people || []).forEach(p => P.person(p));
  if (o.rain) P.rain(tl, o.rain);
}
// Схема пещеры: путь от входа к уступу
function caveMap(P, tl, k) {
  P.sky('#c9b48c', '#a8916a');
  xo.save(); xo.translate(540, 900); xo.rotate(-0.03);
  P.rect(-460, -560, 920, 1120, '#efe4c8', { seed: 1850, depth: 1.5 });
  const pts = [[-360, 380], [-220, 300], [-160, 120], [-20, 40], [80, -100], [220, -180], [300, -360]];
  xo.strokeStyle = '#3a5a9a'; xo.lineWidth = 34; xo.lineJoin = 'round'; xo.lineCap = 'round'; xo.beginPath(); xo.moveTo(...pts[0]); pts.forEach(p => xo.lineTo(...p)); xo.stroke();
  xo.strokeStyle = '#c0241c'; xo.lineWidth = 10; xo.setLineDash([24, 16]); xo.beginPath(); xo.moveTo(...pts[0]);
  const n = Math.max(1, Math.floor((pts.length - 1) * clamp01(k)) + 1); for (let i = 1; i < n; i++) xo.lineTo(...pts[i]); xo.stroke(); xo.setLineDash([]);
  xo.font = `800 48px ${FONT}`; xo.fillStyle = '#2a1e18'; xo.textAlign = 'center'; xo.fillText('ВХОД', -360, 460); xo.fillText('≈ 4 КМ', 300, -440);
  P.circle(300, -360, 30, '#e8c030', { seed: 1851, depth: 0.5 });
  xo.restore();
}
