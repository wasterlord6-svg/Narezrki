'use strict';
// Персонажи, техника и окружения из коробок. Зависит от raster.js.

const SKIN = [0.95, 0.72, 0.55];

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
  if (o.tie) S.box(M(U, T(0, 0.5, 0.18)), 0.1, 0.5, 0.02, [0.8, 0.1, 0.1]);
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
  const Hd = M(U, T(0, 1.09, 0), Ry(o.headYaw || 0), Rx(o.headPitch || 0));
  S.box(Hd, 0.48, 0.48, 0.48, skin);
  for (const sd of [-1, 1]) {
    S.box(M(Hd, T(sd * 0.11, 0.05, 0.245)), 0.08, 0.09, 0.02, [0.05, 0.05, 0.08]);
    if (o.angry) S.box(M(Hd, T(sd * 0.11, 0.15, 0.25), Rz(sd * 0.4)), 0.15, 0.04, 0.02, [0.1, 0.07, 0.05]);
  }
  S.box(M(Hd, T(0, -0.12, 0.245)), 0.17, 0.035 + 0.1 * (o.talk || 0), 0.02, [0.3, 0.05, 0.05]);
  if (o.hat === 'helmet') {
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

// ---------- окружения
const ENV_NIGHT = { skyTop: [0.01, 0.02, 0.06], skyBot: [0.07, 0.1, 0.2], fog: [0.05, 0.07, 0.14], fogK: 0.022,
  amb: [0.16, 0.19, 0.3], sunDir: [-0.3, 0.8, 0.5], sunCol: [0.14, 0.17, 0.3], stars: true };
const ENV_DAY = { skyTop: [0.25, 0.5, 0.95], skyBot: [0.75, 0.87, 1], fog: [0.75, 0.87, 1], fogK: 0.012,
  amb: [0.5, 0.52, 0.58], sunDir: [0.4, 0.9, 0.5], sunCol: [0.75, 0.7, 0.6] };
const ENV_OFFICE = { skyTop: [0.3, 0.33, 0.38], skyBot: [0.3, 0.33, 0.38], fogK: 0,
  amb: [0.42, 0.42, 0.46], sunDir: [0.3, 0.8, 0.6], sunCol: [0.3, 0.3, 0.3] };

const HERO = { shirt: [0.15, 0.3, 0.65], pants: [0.12, 0.18, 0.4], hat: 'helmet', vest: true };
const BOSS = { shirt: [0.92, 0.92, 0.95], pants: [0.12, 0.12, 0.15], hat: 'hair', tie: true, angry: true };

// Ночная улица с раскопанной трубой. hero: параметры позы героя.
function sceneStreet(S, t, o) {
  o = o || {};
  S.ground(-14, -6, 14, 14, 1, [0.2, 0.2, 0.24], 0.025, 0, 1);
  S.ground(-14, -10, 14, -6, 1, [0.36, 0.36, 0.4], 0.02, 0.16, 2);
  S.box(T(0, 0.08, -5.95), 28, 0.16, 0.12, [0.5, 0.5, 0.52]);
  const cols = [[0.45, 0.3, 0.25], [0.3, 0.36, 0.45], [0.5, 0.45, 0.3], [0.32, 0.3, 0.4], [0.4, 0.32, 0.3]];
  for (let i = 0; i < 5; i++) house(S, -11.5 + i * 5.8, -12.5, 5.2, 6 + hash(i * 3.3) * 5, 4, cols[i], i * 17, 0.4);
  lamp(S, -5.5, -6.6); lamp(S, 5.5, -6.6);
  // яма
  S.box(T(0, 0.02, 0.2), 3.4, 0.02, 2.4, [0.02, 0.015, 0.01]);
  for (let i = 0; i < 9; i++) {
    const a = i / 9 * 6.28 + 0.3, r = 2.1 + hash(i) * 0.5, sz = 0.5 + hash(i * 2.2) * 0.5;
    S.box(M(T(Math.cos(a) * r * 1.1, sz * 0.3, 0.2 + Math.sin(a) * r * 0.8), Ry(hash(i * 5) * 3)), sz * 1.3, sz * 0.6, sz, [0.3, 0.2, 0.12]);
  }
  S.box(T(0.2, 0.12, -0.5), 3.2, 0.34, 0.34, [0.25, 0.5, 0.6]);
  // струя воды
  for (let i = 0; i < 46; i++) {
    const ph = (t * 1.6 + i / 46) % 1, sp = hash(i * 9.1) - 0.5;
    const x = 1.2 + ph * (1.6 + sp * 1.1), yy = 0.3 + ph * 7.2 - ph * ph * 7.6, z = -0.5 + ph * (0.6 + sp * 1.3);
    if (yy < 0.05) continue;
    S.box(T(x, yy, z), 0.17, 0.17, 0.17, [0.55, 0.8, 1], 1.0);
  }
  S.box(T(2.6, 0.03, 0.9), 2.2, 0.02, 1.8, [0.2, 0.4, 0.6], 0.25);
  S.light([1.4, 1.2, 0.2], [0.4, 0.65, 1], 2.2);
  van(S, -4.6, -2.6, 0.7, t, { beacon: true, lights: true });
  cone(S, 3.6, 2.6); cone(S, -2.9, 2.9); cone(S, 3.9, -1.4); cone(S, -0.3, 3.4);
  // герой копает
  if (!o.noHero) {
    const d = Math.sin(t * 7);
    person(S, Object.assign({}, HERO, { x: -0.5, y: -0.42, z: 0.5, yaw: 0.75, swing: 0, lean: 0.32 + 0.2 * d,
      armL: { rx: -0.9 + 0.45 * d }, armR: { rx: -0.9 + 0.45 * d }, tool: 'shovel', headPitch: -0.25, noShadow: true }, o.hero || {}));
  }
  // напарник у фургона
  person(S, { x: -2.6, z: -0.9, yaw: 1.2, swing: 0, headYaw: Math.sin(t * 1.3) * 0.5, shirt: [0.5, 0.25, 0.15], pants: [0.2, 0.2, 0.25],
    hat: 'helmet', hatCol: [0.95, 0.95, 0.95], vest: true, armR: { rx: -0.3 + Math.sin(t * 2) * 0.1 } });
}

// Кабинет начальника. o.clock = {h, m}
function sceneOffice(S, t, o) {
  o = o || {};
  S.ground(-5, -4, 5, 6, 1, [0.5, 0.36, 0.22], 0.03, 0, 3);
  S.box(T(0, 2.5, -4.15), 10.4, 5, 0.3, [0.56, 0.62, 0.68]);
  S.box(T(-5.15, 2.5, 1), 0.3, 5, 10.4, [0.5, 0.56, 0.62]);
  S.box(T(5.15, 2.5, 1), 0.3, 5, 10.4, [0.5, 0.56, 0.62]);
  S.box(T(0, 0.12, -3.98), 10, 0.24, 0.06, [0.25, 0.2, 0.15]);
  // окно
  S.box(T(2.5, 2.7, -3.98), 2.6, 2.0, 0.06, [0.75, 0.9, 1], 1.6);
  S.box(T(2.5, 2.7, -3.94), 0.08, 2.0, 0.06, [0.9, 0.9, 0.9]);
  S.box(T(2.5, 2.7, -3.94), 2.6, 0.08, 0.06, [0.9, 0.9, 0.9]);
  const c = o.clock || { h: 3, m: 12 };
  wallClock(S, -2.4, 3.2, -3.94, c.h, c.m, t);
  // стол
  S.box(T(0, 0.98, -1.4), 3.0, 0.1, 1.3, [0.35, 0.22, 0.12]);
  for (const sx of [-1.35, 1.35]) S.box(T(sx, 0.47, -1.4), 0.12, 0.94, 1.2, [0.28, 0.17, 0.09]);
  S.box(T(0, 0.55, -0.8), 2.7, 0.75, 0.06, [0.3, 0.19, 0.1]);
  S.box(T(-0.9, 1.42, -1.5), 0.95, 0.62, 0.07, [0.1, 0.1, 0.12]);
  S.box(T(-0.9, 1.08, -1.5), 0.2, 0.12, 0.2, [0.1, 0.1, 0.12]);
  S.box(T(0.5, 1.045, -1.2), 0.5, 0.03, 0.65, [0.95, 0.95, 0.92]);
  S.box(T(1.1, 1.1, -1.5), 0.3, 0.14, 0.22, [0.8, 0.1, 0.1]);
  // шкаф и растение
  S.box(T(-4.3, 1.4, -3.4), 1.3, 2.8, 0.9, [0.38, 0.26, 0.15]);
  for (let i = 0; i < 3; i++) S.box(T(-4.3, 0.6 + i * 0.9, -2.93), 1.1, 0.7, 0.04, [0.3 + i * 0.1, 0.4, 0.5 - i * 0.1]);
  S.box(T(4.2, 0.35, -3.3), 0.6, 0.7, 0.6, [0.6, 0.35, 0.2]);
  S.box(T(4.2, 1.3, -3.3), 0.9, 1.2, 0.9, [0.15, 0.5, 0.2]);
  S.light([0, 4.4, -0.5], [1, 0.95, 0.85], 7);
  S.light([2.5, 2.7, -3.0], [0.6, 0.8, 1], 2.5);
  if (!o.noBoss) {
    const k = Math.sin(t * 14);
    person(S, Object.assign({}, BOSS, { x: 0.25, z: -2.5, yaw: 0, swing: 0, lean: 0.18, talk: 0.5 + 0.5 * k,
      armR: { rx: -1.5 + 0.12 * k, rz: 0.1 }, armL: { rx: -0.2, rz: 0.3 }, headPitch: 0.08 }, o.boss || {}));
  }
  if (!o.noHero) person(S, Object.assign({}, HERO, { x: -0.7, z: 1.9, yaw: Math.PI, swing: 0 }, o.hero || {}));
}

// Двор водоканала днём, бригада бродит кто куда.
function sceneYard(S, t, o) {
  o = o || {};
  S.ground(-13, -9, 13, 11, 1, [0.6, 0.6, 0.57], 0.03, 0, 4);
  S.box(T(0, 3, -11), 22, 6, 4, [0.35, 0.47, 0.62]);
  S.box(T(0, 6.2, -11), 22.4, 0.4, 4.4, [0.22, 0.3, 0.42]);
  for (const x of [-6.5, 0, 6.5]) {
    S.box(T(x, 1.9, -8.97), 4.4, 3.8, 0.06, [0.16, 0.18, 0.22]);
    for (let j = 0; j < 4; j++) S.box(T(x, 0.5 + j * 0.9, -8.93), 4.2, 0.06, 0.04, [0.3, 0.33, 0.38]);
  }
  S.box(T(0, 5.1, -8.95), 7, 0.9, 0.1, [0.1, 0.45, 0.95], 0.9);
  for (const sx of [-1, 1]) for (let i = 0; i < 10; i++) S.box(T(sx * 12.6, 1, -8 + i * 2), 0.12, 2, 0.12, [0.3, 0.3, 0.32]);
  for (const sx of [-1, 1]) S.box(T(sx * 12.6, 1.5, 1), 0.06, 0.1, 18, [0.3, 0.3, 0.32]);
  van(S, -8.5, -5.8, 0.25, t); van(S, 8.3, -5.6, -0.3, t);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3 - i; j++)
    S.box(T(9.5, 0.3 + i * 0.6, 3 + j * 0.62 + i * 0.31), 4, 0.56, 0.56, [0.25, 0.55, 0.65]);
  const shirts = [[0.5, 0.25, 0.15], [0.2, 0.45, 0.3], [0.45, 0.45, 0.5], [0.55, 0.2, 0.2], [0.2, 0.3, 0.55], [0.5, 0.4, 0.2]];
  const hats = [[0.95, 0.95, 0.95], [1, 0.5, 0.1], [0.2, 0.5, 0.95], [1, 0.85, 0.1]];
  let i = 0;
  for (let gx = -1; gx <= 1; gx++) for (let gz = 0; gz < 3; gz++, i++) {
    const w = wander(i, t + 20, gx * 3.6, -5.5 + gz * 3.4, 1.2);
    person(S, { x: w.x, z: w.z, yaw: w.yaw, walk: w.walk, swing: w.swing, shirt: shirts[i % 6], pants: [0.15, 0.17, 0.25],
      hat: 'helmet', hatCol: hats[i % 4], vest: i % 3 !== 1, s: 0.94 + hash(i * 4.4) * 0.12, shadowCol: [0.25, 0.25, 0.24],
      headYaw: Math.sin(t * 0.9 + i) * 0.4 });
  }
  if (!o.noHero) person(S, Object.assign({}, HERO, { x: 0, z: 6.2, yaw: 0, swing: 0, talk: 0.5 + 0.5 * Math.sin(t * 15),
    shadowCol: [0.25, 0.25, 0.24], armL: { rx: -0.15, rz: 0.12 }, armR: { rx: -0.15, rz: 0.12 }, headYaw: Math.sin(t * 1.1) * 0.12 }, o.hero || {}));
}
