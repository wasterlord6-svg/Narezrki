'use strict';
// Бумажные сцены серии про Ди Би Купера. P — API из engine/paper.js.

const NIGHT = ['#0b1026', '#2a3358'];
// Боинг 727 сбоку: фюзеляж, хвост с красной полосой, три двигателя сзади, опущенный задний трап (stair 0..1)
function jet(P, x, y, s, o) {
  o = o || {};
  xo.save(); xo.translate(x, y); xo.rotate(o.ang || 0); xo.scale(s * (o.flip ? -1 : 1), s);
  P.poly([[-420, -40], [330, -50], [400, -30], [420, 0], [400, 30], [330, 45], [-430, 40], [-470, 10]], '#eef0f2', { seed: 501, depth: 1.6 });
  P.poly([[-420, 4], [400, 0], [400, 16], [-430, 20]], '#c4302a', { seed: 502, depth: 0.3 });
  P.poly([[-440, -40], [-520, -230], [-440, -230], [-330, -48]], '#c4302a', { seed: 503, depth: 1 });
  P.poly([[-470, -230], [-560, -232], [-552, -210], [-450, -208]], '#c4302a', { seed: 504, depth: 0.6 });
  P.rect(-420, -88, 130, 44, '#cfd3d8', { seed: 505, depth: 0.8 }); P.rect(-440, -40, 120, 36, '#bfc4ca', { seed: 506, depth: 0.6 });
  P.poly([[-60, 10], [170, 10], [40, 150], [-20, 150]], '#d8dce0', { seed: 507, depth: 1.2 });
  for (let i = 0; i < 14; i++) P.rect(300 - i * 48, -28, 18, 16, o.lit ? '#ffe9a8' : '#3a4a60', { seed: 510 + i, depth: 0.1, grain: false });
  P.poly([[345, -30], [392, -26], [396, -8], [350, -10]], '#2a3a50', { seed: 530, depth: 0.2 });
  if (o.stair) { const k = o.stair; P.poly([[-470, 30], [-430, 40], [-430 - 150 * k, 40 + 170 * k], [-470 - 150 * k, 30 + 170 * k]], '#9aa2aa', { seed: 531, depth: 1 }); }
  xo.restore();
}
// Парашютист: купол (open 0..1) и человек в костюме
function chutist(P, x, y, s, open, t) {
  xo.save(); xo.translate(x, y); xo.scale(s, s); xo.rotate(Math.sin(t * 2) * 0.12);
  if (open > 0) {
    const w = 220 * open, h = 130 * open;
    const pts = []; for (let i = 0; i <= 12; i++) { const a = Math.PI + i / 12 * Math.PI; pts.push([Math.cos(a) * w, -260 + Math.sin(a) * h]); }
    pts.push([w * 0.8, -250]); pts.push([-w * 0.8, -250]);
    P.poly(pts, '#d8d0b8', { seed: 541, depth: 1.2 });
    for (let i = -2; i <= 2; i++) P.poly([[i * w * 0.32, -260 + 6], [i * w * 0.32 + 4, -260 + 6], [2, -120], [-2, -120]], '#6a6a6a', { seed: 545 + i, depth: 0, rough: 0.5, grain: false });
  }
  P.person({ x: 0, y: 40, s: 0.9, coat: '#2a2a30', pants: '#2a2a30', hat: 'none', goggles: true, armL: -2.8, armR: -2.8, tie: true, seed: 550 });
  xo.restore();
}
// Ночное небо с облаками и дождём
function nightSky(P, tl, o) {
  o = o || {};
  const cam = o.cam || {};
  P.layer(cam, 0.05, () => { P.sky(NIGHT[0], NIGHT[1]); for (let i = 0; i < 50; i++) P.circle(hash(i * 3.3) * OW, hash(i * 9.1) * 1100, 3 + hash(i) * 4, '#f4ecc8', { depth: 0, seed: i, grain: false }); if (o.moon) P.circle(800, 420, 80, '#f2ead0', { depth: 0.3, seed: 560 }); });
  if (o.clouds !== false) P.layer(cam, 0.3, () => { for (let i = 0; i < 5; i++) P.cloud(((i * 300 - tl * 60 * (1 + i % 2)) % 1600 + 1600) % 1600 - 250, 500 + i * 230, 150, '#3a4468', { seed: 570 + i, depth: 1 }); });
}
// Лес внизу: слои ёлок, река
function forest(P, tl, o) {
  o = o || {};
  const cam = o.cam || {};
  P.layer(cam, 0.05, () => P.sky(o.day ? '#7f98b8' : NIGHT[0], o.day ? '#c9d6e0' : '#2a3358'));
  const rows = [['#1c2a2a', 1100, 0.3], ['#22362e', 1300, 0.55], ['#2a4434', 1500, 0.8]];
  rows.forEach(([c, y, par], r) => P.layer(cam, par, () => {
    P.rect(-300, y, OW + 600, 1200, c, { seed: 580 + r, depth: 1 });
    for (let i = 0; i < 14; i++) { const x = -200 + i * 105 + (r * 40), h = 220 + hash(i * 3 + r) * 160;
      P.poly([[x, y + 20], [x + 55, y - h], [x + 110, y + 20]], c, { seed: 590 + r * 20 + i, depth: 0.8 }); }
  }));
  if (o.river) P.layer(cam, 0.9, () => P.poly([[-200, 1750], [400, 1690], [900, 1730], [1300, 1680], [1300, 1880], [-200, 1900]], o.day ? '#5a7f9a' : '#2a4058', { seed: 640, depth: 0.6 }));
  if (o.rain) P.rain(tl, o.rain);
}
// Банкноты пачкой
function bills(P, x, y, s, n, rot) {
  xo.save(); xo.translate(x, y); xo.rotate(rot || 0); xo.scale(s, s);
  for (let i = 0; i < (n || 3); i++) {
    xo.save(); xo.translate(i * 18, -i * 14); xo.rotate((hash(i * 7.1) - 0.5) * 0.3);
    P.rect(-160, -70, 320, 140, '#8fae7a', { seed: 650 + i, depth: 0.9 });
    P.rect(-140, -54, 280, 108, '#a8c494', { seed: 660 + i, depth: 0.1 });
    P.circle(0, 0, 40, '#7a9a68', { seed: 670 + i, depth: 0.1 });
    xo.font = `800 34px ${FONT}`; xo.fillStyle = '#3a5a32'; xo.textAlign = 'center'; xo.textBaseline = 'middle'; xo.fillText('20', -110, -30); xo.fillText('20', 110, 30);
    xo.restore();
  }
  xo.restore();
}
// Салон самолёта: ряды кресел, иллюминаторы
function cabin(P, tl, o) {
  o = o || {};
  P.sky('#3a3e48', '#2a2d34');
  P.rect(-50, 300, OW + 100, 900, '#c8c2b4', { seed: 680, depth: 0.5 });
  for (let i = 0; i < 4; i++) { P.rect(80 + i * 260, 520, 150, 190, '#1a2238', { seed: 690 + i, depth: 0.4 }); if (o.rain) for (let k = 0; k < 4; k++) P.rect(100 + i * 260 + k * 30, 540 + ((tl * 200 + k * 50) % 150), 4, 30, '#8aa0c0', { seed: 700 + k, depth: 0, grain: false }); }
  P.rect(-50, 1200, OW + 100, 900, '#4a4a54', { seed: 710, depth: 0.8 });
  for (let i = 0; i < 3; i++) { const x = 140 + i * 330;
    P.rect(x, 900, 240, 420, '#2a4a8a', { seed: 720 + i, depth: 1.2 }); P.rect(x + 20, 1260, 200, 120, '#24407a', { seed: 730 + i, depth: 0.8 }); }
  (o.people || []).forEach(p => P.person(p));
}
// Папка дела ФБР
function fbiFile(P, x, y, s, title, stamp, tl) {
  xo.save(); xo.translate(x, y); xo.rotate(-0.04); xo.scale(s, s);
  P.rect(-330, -420, 660, 840, '#c9a86a', { seed: 750, depth: 1.6 });
  P.rect(-300, -470, 220, 70, '#c9a86a', { seed: 751, depth: 0.8 });
  P.rect(-260, -340, 520, 660, '#f3ead2', { seed: 752, depth: 0.4 });
  xo.font = `800 64px ${FONT}`; xo.fillStyle = '#1d2a44'; xo.textAlign = 'center'; xo.textBaseline = 'middle'; xo.fillText('ФБР', 0, -250);
  xo.font = `800 88px ${FONT}`; xo.fillText(title, 0, -130);
  for (let j = 0; j < 5; j++) { xo.fillStyle = '#b9b3a3'; xo.fillRect(-200, -30 + j * 60, j % 2 ? 300 : 400, 16); }
  if (stamp && tl > 0.35) { xo.save(); xo.rotate(-0.25); xo.strokeStyle = '#c0241c'; xo.lineWidth = 12; xo.strokeRect(-250, 190, 500, 120); xo.font = `800 60px ${FONT}`; xo.fillStyle = '#c0241c'; xo.fillText(stamp, 0, 252); xo.restore(); }
  xo.restore();
}

const COOP = { coat: '#2a2a32', pants: '#2a2a32', hat: 'none', skin: '#e8c0a0', seed: 901 };
const STEW = { coat: '#3a5a9a', pants: '#3a5a9a', hat: 'wool', hatCol: '#3a5a9a', skin: '#f0c8a8', seed: 921 };
// Портфель: open — открыт, видны батарея, провода, красные цилиндры
function briefcase(P, x, y, s, open, tl) {
  xo.save(); xo.translate(x, y); xo.scale(s, s);
  if (open) {
    P.rect(-300, -360, 600, 300, '#2a2420', { seed: 940, depth: 1 });
    P.rect(-300, -60, 600, 320, '#1e1a16', { seed: 941, depth: 1.4 });
    P.rect(-270, -30, 540, 260, '#3a3026', { seed: 942, depth: 0.2 });
    for (let r = 0; r < 2; r++) for (let i = 0; i < 4; i++) P.rect(-220 + i * 70, 0 + r * 110, 50, 90, '#c4302a', { seed: 943 + r * 4 + i, depth: 0.6 });
    P.rect(90, 20, 140, 180, '#4a4a50', { seed: 952, depth: 0.7 });
    for (let k = 0; k < 4; k++) P.limb(80, 60 + k * 30, 8, 120, 1.2 + k * 0.15, ['#e8c030', '#2a8a4a', '#c43030', '#3a6ad0'][k], { seed: 953 + k, depth: 0.2 });
  } else {
    P.rect(-300, -180, 600, 360, '#1e1a16', { seed: 960, depth: 1.4 });
    P.rect(-60, -230, 120, 50, '#1e1a16', { seed: 961, depth: 0.6 });
  }
  xo.restore();
}
// Записка
function noteCard(P, x, y, s, lines, rot) {
  xo.save(); xo.translate(x, y); xo.rotate(rot || -0.05); xo.scale(s, s);
  P.rect(-300, -200, 600, 400, '#f6f2e6', { seed: 970, depth: 1.5 });
  xo.textAlign = 'center'; xo.textBaseline = 'middle';
  lines.forEach((l, i) => { xo.font = `800 ${l[1] || 52}px ${FONT}`; xo.fillStyle = l[2] || '#1d2a44'; xo.fillText(l[0], 0, -110 + i * 80); });
  xo.restore();
}
// Аэропорт ночью: огни полосы, самолёт, заправщик
function airport(P, tl, o) {
  o = o || {};
  P.sky('#0b1026', '#3a3050');
  P.rect(-100, 1250, OW + 200, 900, '#1a1c24', { seed: 980, depth: 1 });
  for (let i = 0; i < 12; i++) P.circle(i * 100 + 20, 1300 + (i % 2) * 120, 10, i % 3 ? '#ffd27a' : '#6ad0ff', { seed: 981 + i, depth: 0, grain: false });
  jet(P, 560, 1150, 1.0, { lit: true, stair: o.stair || 0 });
  if (o.truck) { P.rect(80, 1240, 260, 110, '#d8b030', { seed: 995, depth: 1 }); P.rect(300, 1200, 100, 150, '#c4302a', { seed: 996, depth: 1 }); }
  if (o.rain) P.rain(tl, o.rain);
}
// Берег реки днём: песок, вода, мальчик
function riverBank(P, tl, o) {
  o = o || {};
  P.sky('#8fa8c4', '#d8e2ea');
  P.ridge(-200, 1300, 900, [[0, 160], [300, 260], [600, 180], [900, 240], [1200, 150]], '#3a5a48', { seed: 1001, depth: 0.8 });
  P.poly([[-200, 900], [1300, 880], [1300, 1150], [-200, 1180]], '#5f87a4', { seed: 1002, depth: 0.8 });
  P.poly([[-200, 1150], [1300, 1120], [1300, 2100], [-200, 2100]], '#d8c49a', { seed: 1003, depth: 1.2 });
  for (let i = 0; i < 10; i++) P.ellipse(hash(i * 3.1) * 1100, 1250 + hash(i * 7) * 600, 30 + hash(i) * 30, 12, '#c4ae84', { seed: 1004 + i, depth: 0.2 });
  if (o.boy) P.person(Object.assign({ x: o.boy[0], y: o.boy[1], s: o.boy[2] || 1.6, coat: '#c4302a', pants: '#3a4a7a', hat: 'wool', hatCol: '#e8c030', armR: -1.0 + 0.4 * Math.sin(tl * 8), seed: 1020 }, o.boyO || {}));
  if (o.money) bills(P, o.money[0], o.money[1], o.money[2] || 1, 3, -0.2);
}
