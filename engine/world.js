'use strict';
// Персонажи, техника и окружения из коробок. Зависит от raster.js.

const SKIN = [0.95, 0.72, 0.55];
// Зима: белая земля, снег на крышах и машинах, сугробы. Включается из show: setWinter(true).
let WINTER = false;
function setWinter(v) { WINTER = !!v; }
const SNOW = [0.9, 0.93, 0.98];
// цвет поверхности зимой: смешиваем с белым
const wint = (c, k) => WINTER ? lerp3(c, SNOW, k == null ? 0.85 : k) : c;

// Блочный человек. Смотрит в +Z при yaw = 0.
// o: x,y,z,yaw,s, walk (фаза шага), swing, lean, armL/armR {rx,rz}, headYaw, headPitch,
//    talk (0..1), angry, shirt, pants, hat ('helmet'|'hair'|null), hatCol, vest, tie, tool
function person(S, o) {
  const s = o.s || 1, walk = o.walk || 0, sw = o.swing == null ? 0.6 : o.swing;
  const bob = Math.abs(Math.sin(walk)) * 0.05 * (sw > 0 ? 1 : 0);
  const y = o.y || 0;
  const B = M(T(o.x, y + bob, o.z), Ry(o.yaw || 0), Sc(s, s, s));
  const skin = o.skin || SKIN, shirt = o.shirt || [0.2, 0.35, 0.7], pants = o.pants || [0.15, 0.2, 0.4];
  const la = Math.sin(walk) * sw;
  if (!o.noShadow) S.box(T(o.x, y + 0.012, o.z), 0.95 * s, 0.01, 0.75 * s, o.shadowCol || [0.03, 0.03, 0.04]);
  for (const sd of [-1, 1]) {
    const L = M(B, T(sd * 0.15, 0.75, 0), Rx(sd * la));
    S.box(M(L, T(0, -0.34, 0)), 0.25, 0.68, 0.27, pants);
    S.box(M(L, T(0, -0.69, 0.05)), 0.27, 0.13, 0.38, [0.12, 0.1, 0.1]);
  }
  const U = M(B, T(0, 0.75, 0), Rx(o.lean || 0));
  S.box(M(U, T(0, 0.42, 0)), 0.62, 0.84, 0.35, shirt);
  if (o.vest) {
    S.box(M(U, T(0, 0.48, 0)), 0.66, 0.56, 0.39, [1, 0.42, 0.05]);
    S.box(M(U, T(0, 0.36, 0)), 0.68, 0.07, 0.41, [0.95, 0.95, 0.7], 0.5);
    S.box(M(U, T(0, 0.58, 0)), 0.68, 0.07, 0.41, [0.95, 0.95, 0.7], 0.5);
  }
  if (o.tie) S.box(M(U, T(0, 0.5, 0.18)), 0.1, 0.5, 0.02, o.tieCol || [0.8, 0.1, 0.1]);
  if (o.coat) S.box(M(U, T(0, 0.3, 0)), 0.66, 1.0, 0.39, o.coat);
  if (o.scarf) S.box(M(U, T(0, 0.8, 0.02)), 0.5, 0.14, 0.41, o.scarf);
  const arms = [o.armL || { rx: la * 0.8 }, o.armR || { rx: -la * 0.8 }];
  for (let k = 0; k < 2; k++) {
    const sd = k ? 1 : -1, a = arms[k];
    const A = M(U, T(sd * 0.42, 0.78, 0), Rz(sd * (a.rz || 0)), Rx(a.rx || 0));
    S.box(M(A, T(0, -0.28, 0)), 0.21, 0.6, 0.23, o.vest ? shirt : shirt);
    S.box(M(A, T(0, -0.66, 0)), 0.19, 0.17, 0.21, skin);
    if (k === 1 && o.tool === 'shovel') {
      S.box(M(A, T(0, -0.66, 0.45)), 0.07, 0.07, 1.4, [0.5, 0.33, 0.15]);
      S.box(M(A, T(0, -0.66, 1.25)), 0.3, 0.05, 0.36, [0.6, 0.62, 0.66]);
    }
  }
  if (o.carry) S.box(M(U, T(0, 0.42, 0.46)), 0.62, 0.42, 0.46, [0.72, 0.55, 0.35]);
  const Hd = M(U, T(0, 1.09, 0), Ry(o.headYaw || 0), Rx(o.headPitch || 0));
  S.box(Hd, 0.48, 0.48, 0.48, skin);
  for (const sd of [-1, 1]) {
    S.box(M(Hd, T(sd * 0.11, 0.05, 0.245)), 0.08, 0.09, 0.02, [0.05, 0.05, 0.08]);
    if (o.angry) S.box(M(Hd, T(sd * 0.11, 0.15, 0.25), Rz(sd * 0.4)), 0.15, 0.04, 0.02, [0.1, 0.07, 0.05]);
  }
  S.box(M(Hd, T(0, -0.12, 0.245)), 0.17, 0.035 + 0.1 * (o.talk || 0), 0.02, [0.3, 0.05, 0.05]);
  if (o.glasses === 'sun') for (const sd of [-1, 1]) S.box(M(Hd, T(sd * 0.11, 0.05, 0.255)), 0.15, 0.12, 0.02, [0.04, 0.04, 0.05]);
  else if (o.glasses) for (const sd of [-1, 1]) {
    const G = M(Hd, T(sd * 0.11, 0.05, 0.255)), fc = [0.12, 0.12, 0.14];
    S.box(M(G, T(0, 0.065, 0)), 0.16, 0.025, 0.02, fc); S.box(M(G, T(0, -0.065, 0)), 0.16, 0.025, 0.02, fc);
    S.box(M(G, T(0.07, 0, 0)), 0.025, 0.15, 0.02, fc); S.box(M(G, T(-0.07, 0, 0)), 0.025, 0.15, 0.02, fc);
  }
  if (o.glasses) S.box(M(Hd, T(0, 0.07, 0.26)), 0.1, 0.03, 0.02, [0.1, 0.1, 0.1]);
  if (o.hat === 'beanie') {
    const hc = o.hatCol || [0.75, 0.15, 0.15];
    S.box(M(Hd, T(0, 0.27, 0)), 0.52, 0.16, 0.52, hc);
    S.box(M(Hd, T(0, 0.39, 0)), 0.14, 0.1, 0.14, [0.95, 0.95, 0.95]);
  } else if (o.hat === 'helmet') {
    const hc = o.hatCol || [1, 0.85, 0.1];
    S.box(M(Hd, T(0, 0.29, 0)), 0.54, 0.16, 0.54, hc);
    S.box(M(Hd, T(0, 0.22, 0.14)), 0.54, 0.04, 0.66, hc);
  } else if (o.hat === 'hair') {
    const hc = o.hatCol || [0.15, 0.1, 0.07];
    S.box(M(Hd, T(0, 0.26, -0.02)), 0.52, 0.1, 0.52, hc);
    S.box(M(Hd, T(0, 0.08, -0.23)), 0.52, 0.34, 0.07, hc);
  }
}

// Толпа: каждый ходит в своей ячейке по плавной траектории, ячейки не пересекаются.
function wander(i, t, cx, cz, r) {
  const a = hash(i * 3 + 1) * 6.28, b = hash(i * 3 + 2) * 6.28, f1 = 0.22 + hash(i * 7) * 0.25, f2 = 0.16 + hash(i * 11) * 0.28;
  const px = tt => cx + r * (0.6 * Math.sin(f1 * tt * 2 + a) + 0.4 * Math.sin(f2 * tt * 3.1 + b));
  const pz = tt => cz + r * (0.6 * Math.cos(f2 * tt * 2.3 + b) + 0.4 * Math.sin(f1 * tt * 2.7 + a * 2));
  const x = px(t), z = pz(t), dx = px(t + 0.05) - x, dz = pz(t + 0.05) - z;
  let dist = 0, lx = px(0), lz = pz(0);
  for (let tt = 0.05; tt <= t; tt += 0.05) { const nx = px(tt), nz = pz(tt); dist += Math.hypot(nx - lx, nz - lz); lx = nx; lz = nz; }
  const speed = Math.hypot(dx, dz) / 0.05;
  return { x, z, yaw: Math.atan2(dx, dz), walk: dist * 3.4, swing: Math.min(0.7, speed * 0.8) };
}

function van(S, x, z, yaw, t, o) {
  o = o || {};
  const B = M(T(x, 0, z), Ry(yaw)), w = [0.93, 0.94, 0.96];
  S.box(M(B, T(0, 1.3, -0.5)), 2.0, 1.8, 3.4, w);
  S.box(M(B, T(0, 0.85, 1.75)), 2.0, 0.9, 1.1, w);
  S.box(M(B, T(0, 1.55, 1.55)), 1.9, 0.6, 0.75, [0.2, 0.3, 0.42], 0.15);
  S.box(M(B, T(0, 0.95, -0.5)), 2.04, 0.28, 3.42, [0.1, 0.4, 0.9]);
  if (WINTER) S.box(M(B, T(0, 2.25, -0.5)), 1.94, 0.12, 3.3, SNOW, 0.15);
  for (const sx of [-1, 1]) for (const sz of [-1.4, 1.5]) S.box(M(B, T(sx * 0.95, 0.36, sz)), 0.3, 0.72, 0.72, [0.06, 0.06, 0.07]);
  const hl = o.lights ? 1.4 : 0.2;
  for (const sx of [-1, 1]) S.box(M(B, T(sx * 0.65, 0.7, 2.31)), 0.32, 0.2, 0.04, [1, 0.95, 0.7], hl);
  if (o.lights) S.light(tp(B, [0, 0.8, 4.2]), [1, 0.9, 0.65], 1.6);
  if (o.beacon) {
    const on = Math.sin(t * 9) > 0 ? 1 : 0;
    S.box(M(B, T(0, 2.3, 0.3)), 0.32, 0.18, 0.32, [1, 0.5, 0], 0.3 + on * 4);
    if (on) S.light(tp(B, [0, 2.9, 0.3]), [1, 0.5, 0.05], 5);
  }
}

function cone(S, x, z) {
  S.box(T(x, 0.03, z), 0.42, 0.06, 0.42, [0.9, 0.35, 0.05]);
  S.box(T(x, 0.3, z), 0.24, 0.5, 0.24, [1, 0.4, 0.05]);
  S.box(T(x, 0.36, z), 0.26, 0.1, 0.26, [0.95, 0.95, 0.95], 0.3);
}

function house(S, x, z, w, h, d, col, seed, lit) {
  S.box(T(x, h / 2, z), w, h, d, col);
  S.box(T(x, h + 0.15, z), w + 0.3, 0.3, d + 0.3, [col[0] * 0.6, col[1] * 0.6, col[2] * 0.6]);
  if (WINTER) S.box(T(x, h + 0.38, z), w + 0.3, 0.16, d + 0.3, SNOW, 0.12);
  const nx = Math.max(1, Math.floor(w / 1.5)), ny = Math.max(1, Math.floor(h / 1.7));
  for (let i = 0; i < nx; i++) for (let j = 0; j < ny; j++) {
    const on = hash(seed + i * 5.3 + j * 9.1) < lit;
    S.box(T(x - w / 2 + (i + 0.5) * w / nx, 1.1 + j * (h - 1) / ny, z + d / 2 + 0.02), 0.7, 0.9, 0.05,
      on ? [1, 0.85, 0.45] : [0.08, 0.1, 0.16], on ? 1.6 : 0);
  }
}

function lamp(S, x, z, power) {
  S.box(T(x, 2.1, z), 0.14, 4.2, 0.14, [0.2, 0.2, 0.22]);
  S.box(T(x, 4.15, z + 0.5), 0.14, 0.12, 1.1, [0.2, 0.2, 0.22]);
  S.box(T(x, 4.05, z + 0.95), 0.4, 0.14, 0.4, [1, 0.85, 0.55], 5);
  S.light([x, 3.7, z + 1.0], [1, 0.78, 0.45], power == null ? 9 : power);
}

function wallClock(S, x, y, z, hours, minutes, t) {
  const B = T(x, y, z);
  S.box(M(B, T(0, 0, -0.04)), 1.7, 1.7, 0.06, [0.12, 0.12, 0.14]);
  S.box(B, 1.5, 1.5, 0.06, [0.78, 0.77, 0.72], 0);
  for (let i = 0; i < 12; i++) {
    const a = -i / 12 * Math.PI * 2;
    S.box(M(B, Rz(a), T(0, 0.62, 0.04)), i % 3 ? 0.04 : 0.08, 0.14, 0.02, [0.1, 0.1, 0.1]);
  }
  for (let m = 12; m <= 15; m++) S.box(M(B, Rz(-m / 60 * Math.PI * 2), T(0, 0.52, 0.045)), 0.07, 0.1, 0.02, [1, 0.1, 0.1], 1.5);
  S.box(M(B, Rz(-(hours + minutes / 60) / 12 * Math.PI * 2), T(0, 0.2, 0.06)), 0.09, 0.42, 0.02, [0.08, 0.08, 0.1]);
  S.box(M(B, Rz(-minutes / 60 * Math.PI * 2), T(0, 0.29, 0.08)), 0.06, 0.6, 0.02, [0.85, 0.05, 0.05], 0.8);
  S.box(M(B, T(0, 0, 0.1)), 0.12, 0.12, 0.02, [0.1, 0.1, 0.1]);
}

