'use strict';
// Бумажные сцены серии про маяк на островах Фланнан.
const STORM = ['#1c2433', '#4a5566'];
// Остров: скалы, маяк, домик смотрителей. o.lit — горит ли лампа, o.beam — угол луча
function island(P, tl, o) {
  o = o || {};
  const cam = o.cam || {};
  P.layer(cam, 0.05, () => { P.sky(o.day ? '#6f8aa6' : STORM[0], o.day ? '#c9d4dc' : STORM[1]); });
  if (o.clouds !== false) P.layer(cam, 0.2, () => { for (let i = 0; i < 5; i++) P.cloud(((i * 320 + tl * 50) % 1600) - 250, 330 + (i % 3) * 140, 160, o.day ? '#dfe5ec' : '#2c3546', { seed: 800 + i, depth: 1 }); });
  P.layer(cam, 0.45, () => {
    // скала
    P.poly([[-100, 1500], [80, 1200], [250, 1080], [520, 1040], [780, 1090], [960, 1230], [1180, 1500], [1180, 2000], [-100, 2000]], '#4a4640', { seed: 810, depth: 1.6 });
    P.poly([[120, 1200], [260, 1100], [520, 1060], [760, 1110], [900, 1220], [700, 1180], [420, 1150]], '#5f7a4a', { seed: 811, depth: 0.5 });
    for (let i = 0; i < 6; i++) P.poly([[120 + i * 150, 1300 + (i % 2) * 60], [190 + i * 150, 1260], [240 + i * 150, 1340]], '#3a3632', { seed: 815 + i, depth: 0.4 });
    // дом смотрителей
    P.rect(380, 960, 300, 140, '#e8e2d4', { seed: 820, depth: 1 }); P.poly([[370, 965], [530, 900], [690, 965]], '#5a4a40', { seed: 821, depth: 0.8 });
    P.rect(430, 1010, 40, 50, o.house ? '#ffe39a' : '#2a3040', { seed: 822, depth: 0.2 }); P.rect(590, 1010, 40, 50, o.house ? '#ffe39a' : '#2a3040', { seed: 823, depth: 0.2 });
    // башня
    P.poly([[700, 1060], [722, 700], [798, 700], [820, 1060]], '#f2efe6', { seed: 830, depth: 1.4 });
    P.rect(716, 680, 88, 30, '#3a3a3a', { seed: 831, depth: 0.6 });
    P.rect(724, 610, 72, 70, o.lit ? '#ffe9a0' : '#3a4250', { seed: 832, depth: 0.5, grain: !o.lit });
    P.poly([[716, 612], [760, 560], [804, 612]], '#3a3a3a', { seed: 833, depth: 0.6 });
  });
  if (o.lit) P.layer(cam, 0.45, () => { const a = o.beam == null ? tl * 1.6 : o.beam; P.beam(760, 645, a % (Math.PI * 2), 1400, 360, '#fff2b8', 0.4 * Math.abs(Math.cos(a))); });
  P.layer(cam, 0.8, () => P.waves(tl, o.seaY || 1520, o.day ? ['#3e6a86', '#2f5872', '#24485e'] : ['#2a3e52', '#22344a', '#1a2a3c'], o.calm ? 12 : 34));
  if (o.ship) P.layer(cam, 0.6, () => steamer(P, o.ship[0], o.ship[1], o.ship[2] || 1, o.lights));
  if (o.rain) P.rain(tl, o.rain);
}
// Пароход: корпус, труба, дым
function steamer(P, x, y, s, lights) {
  xo.save(); xo.translate(x, y); xo.scale(s, s);
  P.poly([[-260, 0], [260, 0], [220, 70], [-230, 70]], '#2a2a2e', { seed: 840, depth: 1.2 });
  P.rect(-140, -70, 220, 70, '#d8d2c4', { seed: 841, depth: 0.8 }); P.rect(-40, -170, 50, 100, '#b03a2e', { seed: 842, depth: 0.8 });
  for (let i = 0; i < 4; i++) P.circle(-10 + i * 40, -210 - i * 30, 30 + i * 8, '#5a5e66', { seed: 843 + i, depth: 0.4 });
  if (lights) for (let i = 0; i < 4; i++) P.rect(-120 + i * 50, -45, 18, 18, '#ffe39a', { seed: 850 + i, depth: 0, grain: false });
  xo.restore();
}
// Комната смотрителей: стол, часы, вешалка с плащами. o.coats — сколько плащей висит, o.clockStop
function room(P, tl, o) {
  o = o || {};
  P.sky('#4a4036', '#2e2822');
  P.rect(-50, 200, OW + 100, 1300, '#8a7a62', { seed: 860, depth: 0.5 });
  P.rect(-50, 1450, OW + 100, 700, '#5a4a3a', { seed: 861, depth: 1 });
  // окно со штормом
  P.rect(620, 420, 300, 360, '#1c2433', { seed: 862, depth: 0.8 }); P.rect(765, 420, 14, 360, '#5a4a3a', { seed: 863, depth: 0.2 }); P.rect(620, 590, 300, 14, '#5a4a3a', { seed: 864, depth: 0.2 });
  // часы
  P.circle(300, 560, 110, '#e8dcc0', { seed: 865, depth: 1 });
  const hh = o.clockStop ? 0.5 : tl * 0.2, mm = o.clockStop ? 2.2 : tl * 2;
  xo.save(); xo.translate(300, 560); xo.rotate(hh); P.rect(-6, -60, 12, 60, '#2a1e18', { seed: 866, depth: 0.2, grain: false }); xo.restore();
  xo.save(); xo.translate(300, 560); xo.rotate(mm); P.rect(-4, -90, 8, 90, '#2a1e18', { seed: 867, depth: 0.2, grain: false }); xo.restore();
  // вешалка и плащи
  P.rect(120, 880, 420, 22, '#4a3a2a', { seed: 868, depth: 0.6 });
  for (let i = 0; i < 3; i++) { const x = 170 + i * 130;
    P.circle(x, 892, 10, '#2a1e18', { seed: 869 + i, depth: 0.2 });
    if (i < (o.coats == null ? 3 : o.coats)) P.poly([[x - 50, 900], [x + 50, 900], [x + 70, 1230], [x - 70, 1230]], '#d8b030', { seed: 872 + i, depth: 1.1 }); }
  // стол
  P.rect(560, 1180, 420, 40, '#6a4a30', { seed: 876, depth: 1 }); P.rect(590, 1220, 30, 260, '#5a3a24', { seed: 877, depth: 0.6 }); P.rect(920, 1220, 30, 260, '#5a3a24', { seed: 878, depth: 0.6 });
  if (o.lamp !== false) { P.rect(740, 1100, 50, 80, '#b8a060', { seed: 879, depth: 0.5 }); P.ellipse(765, 1080, 34, 40, o.lampLit ? '#ffe39a' : '#c8c0a8', { seed: 880, depth: 0.3 }); }
  if (o.rain) P.rain(tl, 20);
}
// Журнал/документ крупно
function logbook(P, x, y, s, lines, stamp, tl) {
  xo.save(); xo.translate(x, y); xo.rotate(-0.03); xo.scale(s, s);
  P.rect(-360, -300, 720, 600, '#5a3a24', { seed: 890, depth: 1.6 });
  P.rect(-340, -280, 330, 560, '#efe4c8', { seed: 891, depth: 0.3 }); P.rect(10, -280, 330, 560, '#efe4c8', { seed: 892, depth: 0.3 });
  xo.textAlign = 'center'; xo.textBaseline = 'middle';
  lines.forEach((l, i) => { xo.font = `italic 700 ${l[1] || 40}px ${FONT}`; xo.fillStyle = l[2] || '#3a2a1a'; xo.fillText(l[0], l[3] == null ? -175 : l[3], -200 + i * 80); });
  if (stamp && tl > 0.35) { xo.save(); xo.rotate(-0.2); xo.strokeStyle = '#c0241c'; xo.lineWidth = 12; xo.strokeRect(-260, 120, 520, 120); xo.font = `800 64px ${FONT}`; xo.fillStyle = '#c0241c'; xo.fillText(stamp, 0, 182); xo.restore(); }
  xo.restore();
}
