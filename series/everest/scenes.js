'use strict';
// Бумажные сцены серии про Мэллори и Ирвина. P — API из engine/paper.js.
const EV = {
  // пики Эвереста и соседей в координатах кадра (низ гребня — baseY)
  peaksFar: [[-100, 380], [120, 520], [300, 430], [470, 600], [640, 480], [820, 560], [1000, 420], [1200, 500]],
  peaksEv: [[80, 300], [300, 620], [520, 1040], [600, 980], [700, 900], [880, 640], [1100, 380]],
  peaksMid: [[-120, 240], [150, 360], [380, 220], [620, 330], [860, 250], [1150, 340]],
};
const PAL = {
  dawn: ['#28335e', '#f0a77e'], day: ['#3d6fb0', '#cfe0f0'], storm: ['#5a6474', '#b9c0c8'], night: ['#0f1530', '#3a3f6a'],
};
// Широкий план горы. o: sky ('dawn'|'day'|'storm'|'night'), cam, clouds (0..1 сколько закрыто), climbers [{x,y,s,walk,face,...}], sun
function evWide(P, tl, o) {
  o = o || {};
  const cam = o.cam || { x: 0, y: 0, zoom: 1 }, sky = PAL[o.sky || 'day'];
  P.layer(cam, 0.05, () => {
    P.sky(sky[0], sky[1]);
    if (o.sun) P.circle(820, 520, 90, o.sky === 'dawn' ? '#ffd27a' : '#fff4c8', { depth: 0.2, seed: 2 });
    if (o.sky === 'night') for (let i = 0; i < 40; i++) P.circle(hash(i * 3.3) * OW, hash(i * 9.1) * 800, 4 + hash(i) * 4, '#f4ecc8', { depth: 0, seed: i, grain: false });
  });
  P.layer(cam, 0.2, () => { P.ridge(-200, 1300, 1280, EV.peaksFar, o.sky === 'night' ? '#2e3560' : '#8496c0', { seed: 11, depth: 0.6 }); P.cap(EV.peaksFar, 1280, 0.3, '#eef2fa', {}); });
  P.layer(cam, 0.4, () => {
    P.ridge(-100, 1250, 1500, EV.peaksEv, o.sky === 'night' ? '#252a50' : '#5a6c9c', { seed: 21, depth: 1.2 });
    P.cap(EV.peaksEv, 1500, 0.42, '#f6f8fc', {});
    // теневая сторона пирамиды
    P.poly([[520, 460], [600, 520], [700, 600], [880, 860], [1000, 1500], [700, 1500]], o.sky === 'night' ? '#1c2044' : '#4a5a88', { seed: 22, depth: 0.3 });
  });
  if (o.cloudsBack) P.layer(cam, 0.5, () => { for (let i = 0; i < 4; i++) P.cloud(((i * 330 + tl * 40) % 1500) - 200, 900 + i * 60, 90, '#eef1f7', { seed: 30 + i }); });
  P.layer(cam, 0.65, () => { P.ridge(-200, 1300, 1700, EV.peaksMid, o.sky === 'night' ? '#1a1e3c' : '#3d4b78', { seed: 31, depth: 1.5 }); P.cap(EV.peaksMid, 1700, 0.25, '#e9eef8', {}); });
  P.layer(cam, 0.85, () => {
    P.poly([[-200, 1640], [300, 1560], [700, 1610], [1300, 1520], [1300, 2300], [-200, 2300]], '#f3f5fa', { seed: 41, depth: 1.8 });
    P.poly([[-200, 1760], [400, 1700], [600, 1760], [-200, 1900]], '#d5ddeb', { seed: 42, depth: 0.4 });
    (o.climbers || []).forEach((c, i) => P.person(Object.assign({ seed: 50 + i * 20 }, c)));
  });
  // облака накрывают гору
  if (o.clouds) P.layer(cam, 0.95, () => {
    const k = o.clouds;
    for (let i = 0; i < 7; i++) P.cloud(-300 + i * 230 + k * 150 * (i % 2 ? 1 : -1), 700 + (i % 3) * 140 + (1 - k) * -900, 170, '#f1f3f8', { seed: 60 + i, depth: 1.4 });
  });
  if (o.snow) P.snow(tl, o.snow === true ? 60 : o.snow);
}

// ---------- реквизит
function tent(P, x, y, s, c, seed) {
  xo.save(); xo.translate(x, y); xo.scale(s, s);
  P.poly([[-120, 0], [0, -150], [120, 0]], c || '#d8a23a', { seed: seed || 1, depth: 1 });
  P.poly([[-30, 0], [0, -70], [30, 0]], '#3a2a20', { seed: (seed || 1) + 1, depth: 0.2 });
  xo.restore();
}
// Кислородный баллон 1920-х (стальной, с вентилем); label — надпись
function bottle(P, x, y, s, ang, label) {
  xo.save(); xo.translate(x, y); xo.rotate(ang || 0); xo.scale(s, s);
  P.rect(-40, -150, 80, 260, '#8e979e', { seed: 71, depth: 1 });
  P.ellipse(0, -150, 40, 22, '#a6aeb4', { seed: 72, depth: 0.3 });
  P.rect(-14, -200, 28, 52, '#6a4a2a', { seed: 73, depth: 0.5 });
  if (label) P.label(label, 0, -20, 34, '#efe6cf', '#3a2a20', { depth: 0.2, seed: 74, rot: -0.05 });
  xo.restore();
}
// Фотоаппарат Kodak Vest Pocket (складной, с мехами)
function kodak(P, x, y, s, ang) {
  xo.save(); xo.translate(x, y); xo.rotate(ang || 0); xo.scale(s, s);
  P.rect(-150, -70, 300, 140, '#1e1e22', { seed: 81, depth: 1.2 });
  P.poly([[-60, -60], [60, -60], [40, 60], [-40, 60]], '#2c2a2e', { seed: 82, depth: 0.5 });
  P.circle(0, 0, 38, '#4a4e58', { seed: 83, depth: 0.4 }); P.circle(0, 0, 22, '#9fb4c8', { seed: 84, depth: 0.2 });
  P.rect(-140, -64, 60, 20, '#b8b0a0', { seed: 85, depth: 0.2 });
  xo.restore();
}
// Ботинок, торчащий изо льда; k 0..1 — насколько вытаял
function iceBoot(P, x, y, s, k) {
  xo.save(); xo.translate(x, y); xo.scale(s, s);
  const up = 120 * (k == null ? 1 : k);
  P.poly([[-60, 40 - up], [40, 40 - up], [44, 100 - up], [140, 120 - up], [150, 170 - up], [-70, 170 - up]], '#4a3324', { seed: 91, depth: 1.1 });
  P.rect(-64, 150 - up, 220, 22, '#2a1d14', { seed: 92, depth: 0.4 });
  P.rect(-56, -10 - up, 92, 60, '#b8a888', { seed: 93, depth: 0.6 });
  // лёд перед ботинком
  P.poly([[-260, 120], [-120, 60], [40, 100], [200, 70], [320, 130], [320, 400], [-260, 400]], '#cfe3f0', { seed: 94, depth: 1.4 });
  P.poly([[-200, 150], [-80, 110], [60, 160], [-120, 200]], '#e8f3fa', { seed: 95, depth: 0.3 });
  xo.restore();
}
// Ледник: глыбы льда и трещины, на весь кадр
function glacier(P, tl, o) {
  o = o || {};
  const cam = o.cam || {};
  P.layer(cam, 0.05, () => P.sky('#4a78b8', '#d6e6f2'));
  P.layer(cam, 0.3, () => { P.ridge(-200, 1300, 1000, EV.peaksEv.map(p => [p[0], p[1] * 0.7]), '#7085b0', { seed: 101, depth: 0.8 }); P.cap(EV.peaksEv.map(p => [p[0], p[1] * 0.7]), 1000, 0.4, '#f4f7fc', {}); });
  P.layer(cam, 0.6, () => {
    P.poly([[-200, 1000], [1300, 960], [1300, 2300], [-200, 2300]], '#dbe8f1', { seed: 102, depth: 1 });
    for (let i = 0; i < 9; i++) { const x = hash(i * 4.1) * 1200 - 60, y = 1080 + hash(i * 2.3) * 500, w = 120 + hash(i) * 160;
      P.poly([[x, y], [x + w * 0.4, y - w * 0.5], [x + w, y - w * 0.2], [x + w * 0.9, y + 30], [x, y + 30]], i % 2 ? '#c4dceb' : '#e9f2f8', { seed: 110 + i, depth: 0.8 }); }
    P.poly([[100, 1500], [400, 1470], [700, 1520], [690, 1535], [400, 1490], [110, 1515]], '#5b7ea0', { seed: 120, depth: 0.2 });
  });
}
// Портрет в бумажной рамке: имя, подпись, лицо-аппликация
function portrait(P, x, y, s, o) {
  xo.save(); xo.translate(x, y); xo.rotate(o.rot || 0); xo.scale(s, s);
  P.rect(-170, -230, 340, 460, '#efe4c8', { seed: o.seed || 131, depth: 1.4 });
  P.rect(-140, -200, 280, 300, '#b9a888', { seed: (o.seed || 131) + 1, depth: 0.2 });
  P.circle(0, -70, 70, '#e8c4a0', { seed: (o.seed || 131) + 2, depth: 0.5 });
  P.poly([[-72, -90], [72, -90], [60, -150], [0, -168], [-60, -150]], o.hair || '#5a3a24', { seed: (o.seed || 131) + 3, depth: 0.3 });
  xo.fillStyle = '#2a1e18'; xo.fillRect(-28, -78, 10, 10); xo.fillRect(18, -78, 10, 10);
  P.poly([[-110, 100], [110, 100], [90, 10], [-90, 10]], o.coat || '#6a4a30', { seed: (o.seed || 131) + 4, depth: 0.4 });
  xo.font = `800 46px ${FONT}`; xo.fillStyle = '#2a1e18'; xo.textAlign = 'center'; xo.textBaseline = 'middle';
  xo.fillText(o.name, 0, 150);
  xo.font = `800 34px ${FONT}`; xo.fillStyle = '#7a5a3a'; xo.fillText(o.sub || '', 0, 198);
  xo.restore();
}
// Бумажная записка/документ с текстом
function note(P, x, y, w, h, lines, o) {
  o = o || {};
  xo.save(); xo.translate(x, y); xo.rotate(o.rot || 0);
  P.rect(-w / 2, -h / 2, w, h, o.bg || '#f3ead2', { seed: o.seed || 141, depth: 1.3 });
  xo.textAlign = 'center'; xo.textBaseline = 'middle';
  lines.forEach((l, i) => { const sz = l[1] || 56; xo.font = `800 ${sz}px ${FONT}`; xo.fillStyle = l[2] || '#2a1e18'; xo.fillText(l[0], 0, -h / 2 + 90 + i * (sz * 1.35)); });
  xo.restore();
}

// очки-консервы
function goggles(P, x, y, s) {
  xo.save(); xo.translate(x, y); xo.scale(s, s);
  P.rect(-230, -14, 460, 28, '#5a4632', { seed: 151, depth: 0.6 });
  P.circle(-80, 0, 70, '#2b3440', { seed: 152, depth: 1 }); P.circle(80, 0, 70, '#2b3440', { seed: 153, depth: 1 });
  P.circle(-80, 0, 48, '#4f6a7e', { seed: 154, depth: 0.2 }); P.circle(80, 0, 48, '#4f6a7e', { seed: 155, depth: 0.2 });
  P.ellipse(-96, -18, 14, 8, '#b8d0e0', { seed: 156, depth: 0 }); P.ellipse(64, -18, 14, 8, '#b8d0e0', { seed: 157, depth: 0 });
  xo.restore();
}
// верёвка: бумажная полоска по кривой, с обрывом на конце
function rope(P, x, y, s, frayed) {
  xo.save(); xo.translate(x, y); xo.scale(s, s);
  for (let i = 0; i < 26; i++) {
    const a = i / 26 * Math.PI * 2.4, r = 150 - i * 3;
    P.limb(Math.cos(a) * r, Math.sin(a) * r * 0.55, 30, 44, a + 1.4, i % 2 ? '#c9a46a' : '#b8925a', { seed: 160 + i, depth: 0.5 });
  }
  if (frayed) for (let k = 0; k < 4; k++) P.limb(150, 0, 6, 40, -0.6 + k * 0.35, '#d8b47a', { seed: 190 + k, depth: 0.2 });
  xo.restore();
}
// скалистый склон с осыпью. o.spot — белое пятно (находка), o.dusk
function slope(P, tl, o) {
  o = o || {};
  const cam = o.cam || {};
  P.layer(cam, 0.05, () => P.sky(o.dusk ? '#1d2148' : '#3a64a8', o.dusk ? '#d07a58' : '#c9dcee'));
  P.layer(cam, 0.25, () => { P.ridge(-200, 1300, 900, EV.peaksFar.map(p => [p[0], p[1] * 0.8]), o.dusk ? '#3a3a68' : '#8094bf', { seed: 201, depth: 0.6 }); P.cap(EV.peaksFar.map(p => [p[0], p[1] * 0.8]), 900, 0.3, '#eef2fa', {}); });
  P.layer(cam, 0.6, () => {
    P.poly([[-200, 820], [300, 700], [1300, 980], [1300, 2300], [-200, 2300]], o.dusk ? '#4a4048' : '#7a6e66', { seed: 202, depth: 1.4 });
    for (let i = 0; i < 26; i++) { const x = hash(i * 3.9) * 1300 - 100, y = 900 + hash(i * 6.1) * 1100, r = 30 + hash(i * 2.2) * 50;
      P.poly([[x - r, y], [x - r * 0.3, y - r * 0.7], [x + r, y - r * 0.2], [x + r * 0.7, y + r * 0.5]], i % 3 ? '#8c8078' : '#5e554e', { seed: 210 + i, depth: 0.6 }); }
    for (let i = 0; i < 6; i++) P.poly([[i * 220 - 80, 1000 + i * 60], [i * 220 + 90, 980 + i * 60], [i * 220 + 40, 1040 + i * 60]], '#eef2f8', { seed: 240 + i, depth: 0.4 });
    if (o.spot) P.poly([[480, 1360], [640, 1330], [700, 1380], [660, 1440], [500, 1450]], '#f4efe6', { seed: 250, depth: 0.8 });
  });
  (o.people || []).forEach((c, i) => P.layer(cam, 0.85, () => P.person(Object.assign({ seed: 260 + i * 20 }, c))));
  if (o.snow) P.snow(tl, o.snow === true ? 50 : o.snow);
}
// пергаментный фон для реквизита крупным планом
function desk(P, col) {
  P.sky(col || '#c9b48c', '#a8916a');
  for (let i = 0; i < 5; i++) P.rect(-100 + i * 260, 1500 + (i % 2) * 40, 300, 600, i % 2 ? '#b8a07a' : '#c4ae88', { seed: 270 + i, depth: 0.5 });
}
