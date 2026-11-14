'use strict';
// Блэкаут: бумажные инфографические сцены
// Город ночью: окна гаснут (k 0..1 — доля погасших)
function city(P, tl, o) {
  o = o || {};
  P.sky('#0b1026', '#2a3358');
  for (let i = 0; i < 40; i++) P.circle(hash(i * 3.3) * OW, hash(i * 9.1) * 700, 3 + hash(i) * 3, '#f4ecc8', { depth: 0, seed: i, grain: false });
  const k = o.off == null ? 1 : o.off;
  for (let b = 0; b < 6; b++) {
    const x = -40 + b * 190, h = 600 + hash(b * 4.4) * 600, y = 1700 - h;
    P.rect(x, y, 170, h + 400, ['#2a3048', '#323a56', '#262c42'][b % 3], { seed: 1900 + b, depth: 1.2 });
    for (let r = 0; r < Math.floor(h / 90); r++) for (let c = 0; c < 3; c++) {
      const id = b * 100 + r * 3 + c, on = hash(id * 1.7) > k;
      P.rect(x + 20 + c * 50, y + 30 + r * 90, 30, 46, on ? '#ffe39a' : '#141828', { seed: 1950 + id, depth: 0.1, grain: false });
    }
  }
  P.rect(-100, 1700, OW + 200, 500, '#141620', { seed: 1999, depth: 1 });
  if (o.people) o.people.forEach(p => P.person(p));
}
// Комната в темноте; o.torch — луч фонаря, o.candle
function darkRoom(P, tl, o) {
  o = o || {};
  P.sky('#1a1612', '#0c0a08');
  P.rect(-50, 300, OW + 100, 1250, '#2a241e', { seed: 2000, depth: 0.5 });
  P.rect(-50, 1500, OW + 100, 700, '#1e1914', { seed: 2001, depth: 1 });
  P.rect(620, 450, 300, 360, '#0b1026', { seed: 2002, depth: 0.8 });
  (o.people || []).forEach(p => P.person(p));
  if (o.torch) P.beam(o.torch[0], o.torch[1], o.torch[2] || -0.3, 1100, 420, '#fff2b8', 0.5);
}
// Иконки
function icon(P, kind, x, y, s, tl) {
  xo.save(); xo.translate(x, y); xo.scale(s, s);
  if (kind === 'fridge') { P.rect(-150, -280, 300, 560, '#e8ecef', { seed: 2010, depth: 1.4 }); P.rect(-150, -280, 300, 200, '#dfe4e8', { seed: 2011, depth: 0.3 }); P.rect(100, -230, 16, 100, '#9aa2aa', { seed: 2012, depth: 0.2 }); P.rect(100, -40, 16, 160, '#9aa2aa', { seed: 2013, depth: 0.2 }); }
  else if (kind === 'water') { for (let i = 0; i < 3; i++) { P.rect(-170 + i * 120, -180, 100, 300, '#9fd0ec', { seed: 2020 + i, depth: 1 }); P.rect(-150 + i * 120, -220, 60, 40, '#3a6ad0', { seed: 2025 + i, depth: 0.5 }); } }
  else if (kind === 'torch') { P.rect(-50, -40, 200, 80, '#3a3a40', { seed: 2030, depth: 1 }); P.poly([[150, -60], [210, -80], [210, 80], [150, 60]], '#5a5a60', { seed: 2031, depth: 0.8 }); P.beam(210, 0, 0, 400, 260, '#fff2b8', 0.5); }
  else if (kind === 'candle') { P.rect(-40, -60, 80, 220, '#f2ecdc', { seed: 2040, depth: 1 }); P.poly([[0, -150], [26, -90], [0, -64], [-26, -90]], '#ffb030', { seed: 2041, depth: 0.2 }); }
  else if (kind === 'generator') { P.rect(-200, -120, 400, 240, '#d8402a', { seed: 2050, depth: 1.4 }); P.rect(-160, -80, 200, 160, '#2a2a2e', { seed: 2051, depth: 0.4 }); for (let i = 0; i < 4; i++) P.circle(220 + i * 40, -160 - i * 70 - (tl * 80 % 70), 30 + i * 10, '#6a6e76', { seed: 2052 + i, depth: 0.3 }); }
  else if (kind === 'radio') { P.rect(-220, -140, 440, 280, '#8a5a3a', { seed: 2060, depth: 1.4 }); P.circle(-90, 10, 90, '#3a2a20', { seed: 2061, depth: 0.4 }); P.rect(40, -80, 140, 60, '#e8dcb0', { seed: 2062, depth: 0.3 }); P.rect(140, -260, 10, 140, '#9aa2aa', { seed: 2063, depth: 0.3 }); }
  else if (kind === 'phone') { P.rect(-110, -220, 220, 440, '#1e1e24', { seed: 2070, depth: 1.4 }); P.rect(-90, -190, 180, 380, '#2a4a6a', { seed: 2071, depth: 0.2 }); const lvl = o_lvl(tl); P.rect(-40, -60, 80, 140, '#3a3a40', { seed: 2072, depth: 0.2 }); P.rect(-30, 70 - 120 * lvl, 60, 120 * lvl, lvl > 0.3 ? '#4ac060' : '#e04030', { seed: 2073, depth: 0, grain: false }); }
  else if (kind === 'powerbank') { P.rect(-160, -80, 320, 160, '#3a6ad0', { seed: 2080, depth: 1.2 }); for (let i = 0; i < 4; i++) P.rect(-120 + i * 60, -20, 40, 40, i < 3 ? '#9ff0a0' : '#2a4a8a', { seed: 2081 + i, depth: 0.1, grain: false }); }
  else if (kind === 'cash') { for (let i = 0; i < 3; i++) { xo.save(); xo.rotate((i - 1) * 0.12); P.rect(-170, -80 - i * 10, 340, 160, '#8fae7a', { seed: 2090 + i, depth: 0.8 }); P.circle(0, -i * 10, 40, '#7a9a68', { seed: 2094 + i, depth: 0.1 }); xo.restore(); } }
  else if (kind === 'meds') { P.rect(-200, -160, 400, 320, '#f2ecdc', { seed: 2100, depth: 1.4 }); P.rect(-30, -110, 60, 220, '#c4302a', { seed: 2101, depth: 0.2 }); P.rect(-110, -30, 220, 60, '#c4302a', { seed: 2102, depth: 0.2 }); }
  else if (kind === 'clothes') { P.poly([[-200, -200], [200, -200], [260, -60], [180, -40], [180, 240], [-180, 240], [-180, -40], [-260, -60]], '#5a7a9a', { seed: 2110, depth: 1.4 }); P.poly([[-160, -160], [160, -160], [140, 200], [-140, 200]], '#8a4a3a', { seed: 2111, depth: 0.6 }); P.rect(-200, -40, 400, 50, '#e8c030', { seed: 2112, depth: 0.5 }); }
  else if (kind === 'plug') { P.rect(-150, -100, 300, 200, '#f2ecdc', { seed: 2120, depth: 1.2 }); P.circle(-50, 0, 22, '#2a2a2a', { seed: 2121, depth: 0.1 }); P.circle(50, 0, 22, '#2a2a2a', { seed: 2122, depth: 0.1 });
    const out = Math.min(1, tl * 1.5) * 260; P.rect(-90, 120 + out, 180, 120, '#3a3a40', { seed: 2123, depth: 1 }); P.rect(-60, 30 + out, 18, 90, '#c8b060', { seed: 2124, depth: 0.3 }); P.rect(42, 30 + out, 18, 90, '#c8b060', { seed: 2125, depth: 0.3 }); }
  else if (kind === 'bulb') { P.circle(0, -60, 110, tl % 1 > 0.5 ? '#ffe39a' : '#e8e2c8', { seed: 2130, depth: 1 }); P.rect(-50, 40, 100, 90, '#9aa2aa', { seed: 2131, depth: 0.6 }); }
  else if (kind === 'stove') { P.rect(-220, -160, 440, 320, '#d8d2c4', { seed: 2140, depth: 1.4 }); for (let i = 0; i < 2; i++) P.circle(-90 + i * 180, -60, 60, '#2a2a2e', { seed: 2141 + i, depth: 0.3 }); P.rect(-180, 20, 360, 110, '#3a3a40', { seed: 2143, depth: 0.3 }); }
  else if (kind === 'car') { P.poly([[-300, 40], [-260, -60], [-120, -140], [120, -140], [230, -60], [300, 40], [300, 110], [-300, 110]], '#3a6ad0', { seed: 2150, depth: 1.4 }); P.circle(-180, 110, 60, '#1e1e24', { seed: 2151, depth: 0.6 }); P.circle(180, 110, 60, '#1e1e24', { seed: 2152, depth: 0.6 }); P.poly([[-100, -120], [100, -120], [180, -60], [-200, -60]], '#bfe0f0', { seed: 2153, depth: 0.2 }); }
  else if (kind === 'docs') { for (let i = 0; i < 3; i++) { xo.save(); xo.rotate((i - 1) * 0.1); P.rect(-170, -230, 340, 460, ['#efe4c8', '#d8e2ea', '#f2d8c0'][i], { seed: 2160 + i, depth: 0.9 }); xo.restore(); } P.rect(-120, -150, 240, 20, '#b9b3a3', { seed: 2164, depth: 0 }); }
  xo.restore();
}
function o_lvl(tl) { return Math.max(0.12, 1 - tl * 0.25); }
// Крупный значок «нельзя» / «можно» поверх иконки
function verdict(P, x, y, ok, tl) {
  if (tl < 0.35) return;
  xo.save(); xo.translate(x, y); const k = backOut((tl - 0.35) / 0.15); xo.scale(k, k);
  if (ok) { P.circle(0, 0, 90, '#2e9a4a', { seed: 2170, depth: 1.2 }); xo.strokeStyle = '#fff'; xo.lineWidth = 22; xo.lineCap = 'round'; xo.beginPath(); xo.moveTo(-40, 0); xo.lineTo(-10, 34); xo.lineTo(46, -34); xo.stroke(); }
  else { P.circle(0, 0, 90, '#c0241c', { seed: 2171, depth: 1.2 }); xo.strokeStyle = '#fff'; xo.lineWidth = 22; xo.lineCap = 'round'; xo.beginPath(); xo.moveTo(-38, -38); xo.lineTo(38, 38); xo.moveTo(38, -38); xo.lineTo(-38, 38); xo.stroke(); }
  xo.restore();
}
// Бумажный фон-стол для инфографики
function board(P, col) { P.sky(col || '#2e3a4e', '#1e2636'); }
// Карточка-заметка с крупной цифрой
function stat(P, x, y, big, small, col, rot) {
  xo.save(); xo.translate(x, y); xo.rotate(rot || -0.03);
  P.rect(-360, -230, 720, 460, '#f3ead2', { seed: 2180, depth: 1.5 });
  xo.textAlign = 'center'; xo.textBaseline = 'middle'; xo.font = `800 170px ${FONT}`; xo.fillStyle = col || '#c0241c'; xo.fillText(big, 0, -50);
  const fs = fitSize(small, 50, 640); xo.font = `800 ${fs}px ${FONT}`; xo.fillStyle = '#2a1e18'; xo.fillText(small, 0, 120);
  xo.restore();
}
// Карточка-список: пункты появляются по очереди
function listCard(P, title, items, tl, col) {
  xo.save(); xo.translate(540, 900); xo.rotate(-0.02);
  P.rect(-430, -420, 860, 840, '#f3ead2', { seed: 2200, depth: 1.6 });
  xo.textAlign = 'center'; xo.textBaseline = 'middle'; xo.font = `800 66px ${FONT}`; xo.fillStyle = col || '#c0241c'; xo.fillText(title, 0, -330);
  items.forEach((it, i) => { if (tl < 0.2 + i * 0.35) return; xo.textAlign = 'left'; xo.font = `800 52px ${FONT}`; xo.fillStyle = '#2a1e18'; xo.fillText('• ' + it, -370, -200 + i * 110); });
  xo.restore();
}
// Дом с генератором снаружи и рулеткой «6 м»
function houseGen(P, tl) {
  P.sky('#6f8aa6', '#c9d4dc');
  P.rect(-100, 1450, OW + 200, 700, '#5f7a4a', { seed: 2210, depth: 1 });
  P.rect(60, 760, 420, 700, '#d8c8a8', { seed: 2211, depth: 1.4 }); P.poly([[40, 770], [270, 560], [500, 770]], '#7a4a3a', { seed: 2212, depth: 1 });
  P.rect(130, 900, 110, 140, '#2a3a4a', { seed: 2213, depth: 0.3 }); P.rect(300, 1220, 110, 240, '#5a3a24', { seed: 2214, depth: 0.4 });
  icon(P, 'generator', 860, 1400, 0.8, tl);
  xo.save(); xo.setLineDash([24, 14]); xo.strokeStyle = '#c0241c'; xo.lineWidth = 10; xo.beginPath(); xo.moveTo(490, 1500); xo.lineTo(700, 1500); xo.stroke(); xo.restore();
  P.label('≥ 6 М', 600, 1580, 60, '#f2d03a', '#1d1a16', { seed: 2215, rot: -0.03 });
}
