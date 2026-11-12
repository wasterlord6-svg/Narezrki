'use strict';
// Окружения и расстановка персонажей. Зависит от raster.js и world.js.

const ENV_NIGHT = { skyTop: [0.01, 0.02, 0.06], skyBot: [0.07, 0.1, 0.2], fog: [0.05, 0.07, 0.14], fogK: 0.022,
  amb: [0.16, 0.19, 0.3], sunDir: [-0.3, 0.8, 0.5], sunCol: [0.14, 0.17, 0.3], stars: true };
const ENV_DAY = { skyTop: [0.25, 0.5, 0.95], skyBot: [0.75, 0.87, 1], fog: [0.75, 0.87, 1], fogK: 0.012,
  amb: [0.5, 0.52, 0.58], sunDir: [0.4, 0.9, 0.5], sunCol: [0.75, 0.7, 0.6] };
const ENV_DAWN = { skyTop: [0.14, 0.2, 0.42], skyBot: [0.98, 0.6, 0.38], fog: [0.85, 0.6, 0.48], fogK: 0.014,
  amb: [0.4, 0.38, 0.44], sunDir: [0.3, 0.4, -0.85], sunCol: [0.7, 0.45, 0.28] };
const ENV_OFFICE = { skyTop: [0.3, 0.33, 0.38], skyBot: [0.3, 0.33, 0.38], fogK: 0,
  amb: [0.42, 0.42, 0.46], sunDir: [0.3, 0.8, 0.6], sunCol: [0.3, 0.3, 0.3] };

const HERO = { shirt: [0.15, 0.3, 0.65], pants: [0.12, 0.18, 0.4], hat: 'helmet', vest: true };
const BOSS = { shirt: [0.92, 0.92, 0.95], pants: [0.12, 0.12, 0.15], hat: 'hair', tie: true, angry: true };
const DIRECTOR = { shirt: [0.14, 0.16, 0.26], pants: [0.1, 0.1, 0.14], hat: 'hair', hatCol: [0.72, 0.72, 0.75], tie: true };
const W_SHIRTS = [[0.5, 0.25, 0.15], [0.2, 0.45, 0.3], [0.45, 0.45, 0.5], [0.55, 0.2, 0.2], [0.2, 0.3, 0.55], [0.5, 0.4, 0.2]];
const W_HATS = [[0.95, 0.95, 0.95], [1, 0.5, 0.1], [0.2, 0.5, 0.95], [1, 0.85, 0.1]];
const workerLook = i => ({ shirt: W_SHIRTS[i % 6], pants: [0.15, 0.17, 0.25], hat: 'helmet', hatCol: W_HATS[i % 4],
  vest: i % 3 !== 1, s: 0.94 + hash(i * 4.4) * 0.12 });

function poseOf(name, t) {
  const k = Math.sin(t * 14);
  switch (name) {
    case 'dig': { const d = Math.sin(t * 7); return { lean: 0.32 + 0.2 * d, armL: { rx: -0.9 + 0.45 * d }, armR: { rx: -0.9 + 0.45 * d }, tool: 'shovel', headPitch: -0.25 }; }
    case 'point': return { lean: 0.18, talk: 0.5 + 0.5 * k, armR: { rx: -1.5 + 0.12 * k, rz: 0.1 }, armL: { rx: -0.2, rz: 0.3 }, headPitch: 0.08 };
    case 'rant': { const q = Math.sin(t * 11); return { talk: 0.5 + 0.5 * k, armR: { rx: -2.5 + 0.4 * q, rz: 0.5 }, armL: { rx: -2.5 - 0.4 * q, rz: 0.5 }, lean: 0.1, headYaw: 0.2 * q }; }
    case 'angry': return { armR: { rx: -1.2 + 0.2 * k, rz: 0.2 }, armL: { rx: -1.2 - 0.2 * k, rz: 0.2 }, lean: 0.12, headYaw: 0.15 * Math.sin(t * 9) };
    case 'talk': return { talk: 0.5 + 0.5 * k, armL: { rx: -0.15, rz: 0.12 }, armR: { rx: -0.15 - 0.3 * Math.max(0, Math.sin(t * 3)), rz: 0.12 }, headYaw: Math.sin(t * 1.1) * 0.12 };
    case 'nod': return { headPitch: 0.28 * Math.max(0, Math.sin(t * 7)) };
    case 'shrink': return { lean: 0.25, headPitch: 0.4 };
    case 'box': return { carry: true, armL: { rx: -1.0, rz: -0.15 }, armR: { rx: -1.0, rz: -0.15 }, headPitch: 0.3 };
    case 'look': return { headYaw: Math.sin(t * 1.3) * 0.5 };
    case 'shake': return { armR: { rx: -1.3 + 0.12 * Math.sin(t * 10), rz: -0.1 }, lean: 0.05 };
    case 'shrug': { const q = 0.5 + 0.5 * Math.sin(t * 4); return { armL: { rx: -0.7, rz: 0.4 + 0.35 * q }, armR: { rx: -0.7, rz: 0.4 + 0.35 * q }, headYaw: 0.2 * Math.sin(t * 2), talk: 0.5 + 0.5 * k }; }
    case 'wave': return { armR: { rx: -2.2 + 0.5 * Math.sin(t * 9), rz: 0.4 }, talk: 0.5 + 0.5 * k, headYaw: -0.2 };
    case 'phone': return { armR: { rx: -2.7, rz: 0.55 }, talk: 0.5 + 0.5 * k, headYaw: 0.15 * Math.sin(t * 1.5) };
    case 'leanback': return { lean: -0.2, armL: { rx: -2.9, rz: 0.4 }, armR: { rx: -2.9, rz: 0.4 }, headPitch: -0.15 };
    case 'slump': return { lean: 0.45, headPitch: 0.5, armL: { rx: -0.5 }, armR: { rx: -0.5 } };
    case 'give': return { armL: { rx: -1.3 }, armR: { rx: -1.3 }, talk: 0.5 + 0.5 * k };
    default: return {};
  }
}

// a: {x,z,yaw,pose} или {path:[x0,z0,x1,z1], k:0..1, pose}
function actor(S, look, a, t) {
  if (!a) return;
  const p = Object.assign({ swing: 0 }, look, poseOf(a.pose, t), a);
  if (a.path) {
    const [x0, z0, x1, z1] = a.path, k = clamp01(a.k);
    p.x = lerp(x0, x1, k); p.z = lerp(z0, z1, k); p.yaw = Math.atan2(x1 - x0, z1 - z0);
    p.walk = Math.hypot(x1 - x0, z1 - z0) * k * 3.4; p.swing = k > 0 && k < 1 ? 0.65 : 0;
  }
  person(S, p);
}

// Сугробы вдоль линии z
function snowbanks(S, x0, x1, z, seed) {
  for (let x = x0; x < x1; x += 1.3) {
    const h = 0.25 + hash(x * 3.7 + seed) * 0.35, w = 1.2 + hash(x * 1.9 + seed) * 0.6;
    S.box(T(x + 0.6, h / 2, z + (hash(x + seed) - 0.5) * 0.4), w, h, 0.9 + hash(x * 5.1) * 0.5, SNOW);
  }
}

// Улица с раскопанной трубой. o: day, water, hero, crew, mate, shovel
function sceneStreet(S, t, o) {
  o = o || {};
  const day = !!o.day, sh = day ? [0.1, 0.1, 0.11] : [0.03, 0.03, 0.04];
  S.ground(-14, -6, 14, 14, 1, wint([0.2, 0.2, 0.24], 0.7), 0.025, 0, 1);
  S.ground(-14, -10, 14, -6, 1, wint([0.36, 0.36, 0.4]), 0.02, 0.16, 2);
  if (WINTER) snowbanks(S, -14, 14, -5.6, 1);
  S.box(T(0, 0.08, -5.95), 28, 0.16, 0.12, [0.5, 0.5, 0.52]);
  const cols = [[0.45, 0.3, 0.25], [0.3, 0.36, 0.45], [0.5, 0.45, 0.3], [0.32, 0.3, 0.4], [0.4, 0.32, 0.3]];
  for (let i = 0; i < 5; i++) house(S, -11.5 + i * 5.8, -12.5, 5.2, 6 + hash(i * 3.3) * 5, 4, cols[i], i * 17, day ? 0 : 0.4);
  lamp(S, -5.5, -6.6, day ? 0 : 9); lamp(S, 5.5, -6.6, day ? 0 : 9);
  S.box(T(0, 0.02, 0.2), 3.4, 0.02, 2.4, [0.02, 0.015, 0.01]);
  for (let i = 0; i < 9; i++) {
    const a = i / 9 * 6.28 + 0.3, r = 2.1 + hash(i) * 0.5, sz = 0.5 + hash(i * 2.2) * 0.5;
    const P = M(T(Math.cos(a) * r * 1.1, sz * 0.3, 0.2 + Math.sin(a) * r * 0.8), Ry(hash(i * 5) * 3));
    S.box(P, sz * 1.3, sz * 0.6, sz, [0.3, 0.2, 0.12]);
    if (WINTER) S.box(M(P, T(0, sz * 0.32, 0)), sz * 1.25, sz * 0.08, sz * 0.95, SNOW);
  }
  S.box(T(0.2, 0.12, -0.5), 3.2, 0.34, 0.34, [0.25, 0.5, 0.6]);
  if (o.water !== false) {
    for (let i = 0; i < 46; i++) {
      const ph = (t * 1.6 + i / 46) % 1, sp = hash(i * 9.1) - 0.5;
      const x = 1.2 + ph * (1.6 + sp * 1.1), yy = 0.3 + ph * 7.2 - ph * ph * 7.6, z = -0.5 + ph * (0.6 + sp * 1.3);
      if (yy < 0.05) continue;
      S.box(T(x, yy, z), 0.17, 0.17, 0.17, [0.55, 0.8, 1], 1.0);
    }
    S.box(T(2.6, 0.03, 0.9), 2.2, 0.02, 1.8, [0.2, 0.4, 0.6], 0.25);
    if (!day) S.light([1.4, 1.2, 0.2], [0.4, 0.65, 1], 2.2);
  }
  van(S, -4.6, -2.6, 0.7, t, { beacon: !day, lights: !day });
  cone(S, 3.6, 2.6); cone(S, -2.9, 2.9); cone(S, 3.9, -1.4); cone(S, -0.3, 3.4);
  if (o.shovel) { S.box(T(2.1, 0.85, 1.5), 0.07, 1.5, 0.07, [0.5, 0.33, 0.15]); S.box(T(2.1, 0.2, 1.5), 0.3, 0.38, 0.05, [0.6, 0.62, 0.66]); }
  const hero = o.hero === undefined ? { x: -0.5, y: -0.42, z: 0.5, yaw: 0.75, pose: 'dig', noShadow: true } : o.hero;
  if (hero) actor(S, HERO, Object.assign({ shadowCol: sh }, hero), t);
  if (o.crew) {
    const P = [[-0.9, 0.7, 0.8], [0.7, -0.1, -0.5], [1.5, 1.1, -2.3]];
    for (let i = 0; i < 3; i++) actor(S, workerLook(i + 2), { x: P[i][0], y: -0.42, z: P[i][1], yaw: P[i][2], pose: 'dig', noShadow: true }, t + i * 0.31);
  } else if (o.mate !== false) {
    actor(S, workerLook(0), { x: -2.6, z: -0.9, yaw: 1.2, pose: 'look', shadowCol: sh, vest: true }, t);
  }
}

// Кабинет. o: mgmt (кабинет руководства), clock {h,m}, boss, hero, director
function sceneOffice(S, t, o) {
  o = o || {};
  const mg = !!o.mgmt, w1 = mg ? [0.5, 0.4, 0.32] : [0.56, 0.62, 0.68], w2 = mg ? [0.45, 0.36, 0.29] : [0.5, 0.56, 0.62];
  S.ground(-5, -4, 5, 6, 1, mg ? [0.32, 0.2, 0.15] : [0.5, 0.36, 0.22], 0.03, 0, 3);
  S.box(T(0, 2.5, -4.15), 10.4, 5, 0.3, w1);
  S.box(T(-5.15, 2.5, 1), 0.3, 5, 10.4, w2); S.box(T(5.15, 2.5, 1), 0.3, 5, 10.4, w2);
  S.box(T(0, 2.5, 6.15), 10.4, 5, 0.3, w1);
  S.box(T(2.8, 1.25, 5.96), 1.3, 2.5, 0.08, [0.3, 0.18, 0.1]); S.box(T(2.35, 1.2, 5.9), 0.1, 0.1, 0.08, [0.9, 0.8, 0.3]);
  S.box(T(0, 0.12, -3.98), 10, 0.24, 0.06, [0.25, 0.2, 0.15]);
  S.box(T(2.5, 2.7, -3.98), 2.6, 2.0, 0.06, [0.75, 0.9, 1], 1.0);
  S.box(T(2.5, 2.7, -3.94), 0.08, 2.0, 0.06, [0.9, 0.9, 0.9]); S.box(T(2.5, 2.7, -3.94), 2.6, 0.08, 0.06, [0.9, 0.9, 0.9]);
  if (!mg) { const c = o.clock || { h: 3, m: 12 }; wallClock(S, -2.4, 3.2, -3.94, c.h, c.m, t); }
  else { S.box(T(-2.4, 3.1, -3.96), 2.0, 1.4, 0.06, [0.75, 0.6, 0.2]); S.box(T(-2.4, 3.1, -3.92), 1.7, 1.1, 0.04, [0.2, 0.4, 0.55]); S.box(T(-2.6, 2.9, -3.9), 0.9, 0.5, 0.03, [0.3, 0.55, 0.3]); }
  const dw = mg ? 3.8 : 3.0, dcol = mg ? [0.25, 0.13, 0.08] : [0.35, 0.22, 0.12];
  S.box(T(0, 0.98, -1.4), dw, 0.1, 1.3, dcol);
  for (const sx of [-1, 1]) S.box(T(sx * (dw / 2 - 0.15), 0.47, -1.4), 0.12, 0.94, 1.2, mulS(dcol, 0.8));
  S.box(T(0, 0.55, -0.8), dw - 0.3, 0.75, 0.06, mulS(dcol, 0.85));
  if (!mg) { S.box(T(-0.9, 1.42, -1.5), 0.95, 0.62, 0.07, [0.1, 0.1, 0.12]); S.box(T(-0.9, 1.08, -1.5), 0.2, 0.12, 0.2, [0.1, 0.1, 0.12]); }
  else { S.box(T(-1.3, 1.25, -1.5), 0.12, 0.45, 0.12, [0.7, 0.6, 0.2]); S.box(T(-1.3, 1.52, -1.5), 0.5, 0.2, 0.3, [0.2, 0.7, 0.3], 1.2); }
  S.box(T(0.5, 1.045, -1.2), 0.5, 0.03, 0.65, [0.95, 0.95, 0.92]);
  S.box(T(1.1, 1.1, -1.5), 0.3, 0.14, 0.22, [0.8, 0.1, 0.1]);
  S.box(T(-4.3, 1.4, -3.4), 1.3, 2.8, 0.9, [0.38, 0.26, 0.15]);
  for (let i = 0; i < 3; i++) S.box(T(-4.3, 0.6 + i * 0.9, -2.93), 1.1, 0.7, 0.04, [0.3 + i * 0.1, 0.4, 0.5 - i * 0.1]);
  S.box(T(4.2, 0.35, -3.3), 0.6, 0.7, 0.6, [0.6, 0.35, 0.2]); S.box(T(4.2, 1.3, -3.3), 0.9, 1.2, 0.9, [0.15, 0.5, 0.2]);
  S.light([0, 4.4, -0.5], [1, 0.95, 0.85], 7); S.light([2.5, 2.7, -3.0], [0.6, 0.8, 1], 2.5); S.light([0, 4.2, 3.5], [1, 0.92, 0.8], 4);
  const boss = o.noBoss ? null : o.boss === undefined ? { x: 0.25, z: -2.5, yaw: 0, pose: 'point' } : o.boss;
  const hero = o.noHero ? null : o.hero === undefined ? { x: -0.7, z: 1.9, yaw: Math.PI } : o.hero;
  actor(S, o.bossLook || BOSS, boss, t); actor(S, o.heroLook || HERO, hero, t); actor(S, o.directorLook || DIRECTOR, o.director, t);
  if (o.extra) o.extra.forEach(e => actor(S, e.look, e, t));
  if (o.papers) for (let i = 0; i < o.papers; i++) S.box(T(-0.3 + i * 0.05, 1.06 + i * 0.03, -1.1 + i * 0.02), 0.5, 0.025, 0.65, [0.97, 0.97, 0.94]);
}

// Двор водоканала. o: crowd, gate, group, hero, boss
function sceneYard(S, t, o) {
  o = o || {};
  const sh = [0.25, 0.25, 0.24];
  S.ground(-13, -9, 13, o.gate ? 17 : 11, 1, wint([0.6, 0.6, 0.57]), 0.03, 0, 4);
  if (WINTER) snowbanks(S, -12.3, 12.3, -8.6, 4);
  S.box(T(0, 3, -11), 22, 6, 4, [0.35, 0.47, 0.62]);
  S.box(T(0, 6.2, -11), 22.4, 0.4, 4.4, [0.22, 0.3, 0.42]);
  for (const x of [-6.5, 0, 6.5]) {
    S.box(T(x, 1.9, -8.97), 4.4, 3.8, 0.06, [0.16, 0.18, 0.22]);
    for (let j = 0; j < 4; j++) S.box(T(x, 0.5 + j * 0.9, -8.93), 4.2, 0.06, 0.04, [0.3, 0.33, 0.38]);
  }
  S.box(T(0, 5.1, -8.95), 7, 0.9, 0.1, [0.1, 0.45, 0.95], 0.9);
  for (const sx of [-1, 1]) for (let i = 0; i < 10; i++) S.box(T(sx * 12.6, 1, -8 + i * 2), 0.12, 2, 0.12, [0.3, 0.3, 0.32]);
  for (const sx of [-1, 1]) S.box(T(sx * 12.6, 1.5, 1), 0.06, 0.1, 18, [0.3, 0.3, 0.32]);
  if (o.gate) {
    for (const sx of [-1, 1]) {
      S.box(T(sx * 3.6, 2.3, 10), 0.5, 4.6, 0.5, [0.3, 0.33, 0.38]);
      S.box(T(sx * 8.4, 1.1, 10), 9, 2.2, 0.15, [0.4, 0.43, 0.48]);
    }
    S.box(T(0, 4.9, 10), 8.2, 0.9, 0.4, [0.1, 0.45, 0.95], 0.8);
    S.box(T(0, 0.02, 14), 26, 0.02, 6, [0.25, 0.25, 0.28]);
  }
  van(S, -8.5, -5.8, 0.25, t); van(S, 8.3, -5.6, -0.3, t);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3 - i; j++)
    S.box(T(9.5, 0.3 + i * 0.6, 3 + j * 0.62 + i * 0.31), 4, 0.56, 0.56, [0.25, 0.55, 0.65]);
  if (o.crowd !== false) {
    let i = 0;
    for (let gx = -1; gx <= 1; gx++) for (let gz = 0; gz < 3; gz++, i++) {
      const w = wander(i, t + 20, gx * 3.6, -5.5 + gz * 3.4, 1.2);
      person(S, Object.assign(workerLook(i), { x: w.x, z: w.z, yaw: w.yaw, walk: w.walk, swing: w.swing, shadowCol: sh, headYaw: Math.sin(t * 0.9 + i) * 0.4 }));
    }
  }
  if (o.group) for (let i = 0; i < 6; i++) {
    const x = (i < 3 ? -1 : 1) * (1.3 + (i % 3) * 1.25);
    actor(S, workerLook(i + 1), { x, z: 8.3 + (i % 3) * 0.35, yaw: Math.PI + (i < 3 ? -0.15 : 0.15), pose: 'look', shadowCol: sh }, t + i);
  }
  const hero = o.noHero ? null : o.hero === undefined ? { x: 0, z: 6.2, yaw: 0, pose: 'talk' } : o.hero;
  if (hero) actor(S, HERO, Object.assign({ shadowCol: sh }, hero), t);
  if (o.boss) actor(S, BOSS, Object.assign({ shadowCol: sh }, o.boss), t);
}

// ================= Цех, склад, двор цеха (серия «Новый хозяин»)

// Станок: o.on — работает (крутится шпиндель, летят искры, зелёная лампа), o.open — разобран
function machine(S, x, z, yaw, t, o) {
  o = o || {};
  const B = M(T(x, 0, z), Ry(yaw || 0)), on = !!o.on, body = o.col || [0.36, 0.5, 0.46];
  S.box(M(B, T(0, 0.45, 0)), 2.2, 0.9, 1.3, mulS(body, 0.8));
  if (!o.open) {
    S.box(M(B, T(0, 1.35, -0.1)), 2.2, 0.9, 1.1, body);
    S.box(M(B, T(0.2, 1.35, 0.46)), 1.1, 0.6, 0.04, [0.4, 0.55, 0.65], on ? 0.5 : 0.1);
  } else {
    S.box(M(B, T(-0.6, 1.1, -0.1)), 0.5, 0.4, 0.5, [0.55, 0.55, 0.58]);
    S.box(M(B, T(0.5, 1.0, 0.1)), 0.7, 0.2, 0.3, [0.5, 0.5, 0.52]);
    S.box(M(B, T(-1.6, 0.06, 0.9), Ry(0.4)), 0.6, 0.12, 0.4, [0.55, 0.55, 0.58]);
    S.box(M(B, T(1.5, 0.05, 1.0), Ry(-0.3)), 0.3, 0.1, 0.5, [0.6, 0.6, 0.62]);
  }
  S.box(M(B, T(-0.75, 1.4, 0.47)), 0.45, 0.35, 0.04, on ? [0.2, 0.9, 0.5] : [0.9, 0.25, 0.2], 1.4);
  const sp = on ? t * 18 : 0;
  S.box(M(B, T(0.25, 1.25, 0.2), Rz(sp)), 0.36, 0.36, 0.3, [0.7, 0.72, 0.75]);
  S.box(M(B, T(1.25, 1.6, -0.45)), 0.08, 1.2, 0.08, [0.3, 0.3, 0.32]);
  const lc = on ? [0.2, 1, 0.35] : [1, 0.15, 0.1], blink = on || Math.sin(t * 8) > 0;
  S.box(M(B, T(1.25, 2.3, -0.45)), 0.22, 0.26, 0.22, lc, blink ? 3 : 0.3);
  if (blink) S.light(tp(B, [1.25, 2.4, -0.2]), lc, on ? 0.8 : 1.6);
  if (on) for (let i = 0; i < 10; i++) {
    const ph = (t * 3 + hash(i * 3.3)) % 1, a = hash(i * 7.1) * 2.5 - 1.25;
    S.box(M(B, T(0.25 + Math.sin(a) * ph * 0.9, 1.25 + ph * 0.5 - ph * ph * 1.2, 0.35 + Math.cos(a) * ph * 0.6)), 0.06, 0.06, 0.06, [1, 0.75, 0.3], 3);
  }
}

// Цех. o: off (сколько станков стоит), open (индексы разобранных), dark, workers, hero, friend, boss, lit
function sceneShop(S, t, o) {
  o = o || {};
  const dark = !!o.dark;
  S.ground(-9, -8, 9, 9, 1, [0.34, 0.35, 0.37], 0.03, 0, 6);
  for (const x of [-1.6, 1.6]) S.box(T(x, 0.01, 0.5), 0.12, 0.01, 17, [0.95, 0.8, 0.1]);
  S.box(T(0, 3.5, -8.2), 18.4, 7, 0.3, [0.55, 0.57, 0.6]);
  S.box(T(-9.15, 3.5, 0.5), 0.3, 7, 17.4, [0.5, 0.52, 0.56]); S.box(T(9.15, 3.5, 0.5), 0.3, 7, 17.4, [0.5, 0.52, 0.56]);
  for (const x of [-6, -2, 2, 6]) {
    S.box(T(x, 4.3, -8.0), 3, 2.2, 0.06, WINTER ? [0.82, 0.86, 0.95] : [0.75, 0.88, 1], dark ? 0.3 : 0.7);
    S.box(T(x, 4.3, -7.95), 0.08, 2.2, 0.06, [0.3, 0.3, 0.32]);
  }
  for (let i = 0; i < 4; i++) {
    const z = -5 + i * 3.6;
    S.box(T(0, 6.8, z), 16, 0.2, 0.3, [0.35, 0.35, 0.37]);
    S.box(T(-3.5, 6.5, z), 1.6, 0.12, 0.5, [1, 0.97, 0.88], dark ? 0 : 3);
    S.box(T(3.5, 6.5, z), 1.6, 0.12, 0.5, [1, 0.97, 0.88], dark ? 0 : 3);
    if (!dark) { S.light([-3.5, 6.0, z], [1, 0.95, 0.85], 2.0); S.light([3.5, 6.0, z], [1, 0.95, 0.85], 2.0); }
  }
  const pos = [[-3.3, -5], [-3.3, -1.3], [-3.3, 2.4], [3.3, -5], [3.3, -1.3], [3.3, 2.4]];
  const off = o.off || 0, open = o.open || [];
  pos.forEach((p, i) => machine(S, p[0], p[1], p[0] < 0 ? Math.PI / 2 : -Math.PI / 2, t + i * 0.37,
    { on: !dark && i % 3 >= off, open: open.includes(i) }));
  if (o.workers !== false && !dark) {
    const W = o.workers || [[-1.6, -5, -1.57, 'look'], [1.6, -1.3, 1.57, 'look'], [-1.6, 2.4, -1.57, 'look'], [1.6, 2.4, 1.57, 'look']];
    W.forEach((w, i) => actor(S, workerLook(i + 1), { x: w[0], z: w[1], yaw: w[2], pose: w[3], hat: 'helmet', vest: false, shirt: [0.2, 0.3, 0.45] }, t + i));
  }
  actor(S, HERO2, o.hero, t); actor(S, FRIEND, o.friend, t); actor(S, BOB, o.boss, t);
}

// Склад: стеллажи, o.stock 0..1 — насколько заполнены
function sceneWarehouse(S, t, o) {
  o = o || {};
  S.ground(-8, -8, 8, 8, 1, [0.46, 0.45, 0.42], 0.03, 0, 7);
  S.box(T(0, 3.5, -8.2), 16.4, 7, 0.3, [0.5, 0.48, 0.45]);
  S.box(T(-8.15, 3.5, 0), 0.3, 7, 16.4, [0.46, 0.44, 0.42]); S.box(T(8.15, 3.5, 0), 0.3, 7, 16.4, [0.46, 0.44, 0.42]);
  for (let i = 0; i < 3; i++) { S.box(T(-3 + i * 3, 6.6, 0), 0.8, 0.1, 10, [1, 0.96, 0.85], 2.5); S.light([-3 + i * 3, 6, 0], [1, 0.95, 0.85], 6); }
  const stock = clamp01(o.stock == null ? 0.6 : o.stock);
  let n = 0;
  for (const rx of [-5, 0, 5]) {
    for (const sx of [-1.7, 1.7]) S.box(T(rx + sx, 2.6, -4), 0.12, 5.2, 0.12, [0.15, 0.35, 0.75]), S.box(T(rx + sx, 2.6, -1), 0.12, 5.2, 0.12, [0.15, 0.35, 0.75]);
    for (let lv = 0; lv < 4; lv++) {
      S.box(T(rx, 0.15 + lv * 1.3, -2.5), 3.5, 0.1, 3.1, [0.85, 0.45, 0.1]);
      for (let b = 0; b < 6; b++, n++) {
        if (hash(n * 4.7 + 1) > stock * 1.15 - 0.05) continue;
        const bx = rx - 1.1 + (b % 3) * 1.1, bz = -3.4 + Math.floor(b / 3) * 1.6;
        S.box(T(bx, 0.6 + lv * 1.3, bz), 0.95, 0.85, 1.2, [0.72, 0.55, 0.35]);
        S.box(T(bx, 0.6 + lv * 1.3, bz + 0.61), 0.3, 0.2, 0.02, [0.95, 0.95, 0.9]);
      }
    }
  }
  // погрузчик
  const fx = o.forklift == null ? 2.5 : o.forklift;
  S.box(T(fx, 0.55, 3), 1.3, 0.8, 2, [0.95, 0.75, 0.1]); S.box(T(fx, 1.5, 2.8), 1.2, 1.1, 1.0, [0.2, 0.2, 0.22]);
  S.box(T(fx, 1.3, 4.3), 1.2, 2.4, 0.12, [0.25, 0.25, 0.27]); S.box(T(fx, 0.3, 4.9), 1.1, 0.08, 1.1, [0.3, 0.3, 0.32]);
  for (const sx of [-0.65, 0.65]) for (const sz of [2.4, 3.6]) S.box(T(fx + sx, 0.25, sz), 0.2, 0.5, 0.5, [0.08, 0.08, 0.08]);
  actor(S, MANAGER, o.manager, t); actor(S, BOB, o.boss, t); actor(S, HERO2, o.hero, t);
}

// Двор цеха зимой: здание с вывеской, рампа, грузовик, люди. o: truck (k 0..1 уезжает), crowd, leaving, hero, friend, gift
function truck(S, x, z, yaw, t, o) {
  o = o || {};
  const B = M(T(x, 0, z), Ry(yaw));
  S.box(M(B, T(0, 1.9, -1.2)), 2.4, 2.8, 5.2, [0.9, 0.9, 0.92]);
  S.box(M(B, T(0, 1.5, 2.3)), 2.3, 2.0, 1.6, o.col || [0.8, 0.15, 0.12]);
  S.box(M(B, T(0, 1.95, 3.12)), 2.0, 0.8, 0.05, [0.2, 0.3, 0.42], 0.2);
  if (WINTER) S.box(M(B, T(0, 3.36, -1.2)), 2.3, 0.12, 5.1, SNOW, 0.12);
  for (const sx of [-1.1, 1.1]) for (const sz of [-2.8, -1.6, 2.3]) S.box(M(B, T(sx, 0.45, sz)), 0.35, 0.9, 0.9, [0.06, 0.06, 0.07]);
  if (o.lights) for (const sx of [-0.8, 0.8]) S.box(M(B, T(sx, 0.9, 3.13)), 0.35, 0.22, 0.04, [1, 0.95, 0.7], 2);
}

function sceneLot(S, t, o) {
  o = o || {};
  const sh = [0.6, 0.62, 0.68];
  S.ground(-14, -9, 14, 14, 1, wint([0.4, 0.4, 0.42]), 0.03, 0, 8);
  // корпус цеха
  S.box(T(0, 3.2, -12), 20, 6.4, 6, [0.55, 0.3, 0.22]);
  S.box(T(0, 6.55, -12), 20.4, 0.3, 6.4, [0.3, 0.3, 0.32]);
  if (WINTER) S.box(T(0, 6.8, -12), 20.4, 0.25, 6.4, SNOW, 0.12);
  S.box(T(-3, 5.4, -8.95), 8, 1.1, 0.1, [0.95, 0.75, 0.1], 0.8);
  for (let i = 0; i < 6; i++) S.box(T(-8 + i * 3.2, 3.6, -8.97), 2, 1.4, 0.06, [1, 0.88, 0.55], o.night ? 1.5 : 0.25);
  S.box(T(1.8, 1.8, -8.95), 4, 3.6, 0.08, [0.3, 0.32, 0.36]);
  for (let j = 0; j < 5; j++) S.box(T(1.8, 0.4 + j * 0.75, -8.9), 3.9, 0.05, 0.04, [0.42, 0.44, 0.48]);
  S.box(T(1.8, 0.5, -8), 4.4, 1.0, 2, [0.5, 0.5, 0.52]);
  // забор и ворота
  for (const sx of [-1, 1]) {
    S.box(T(sx * 3.4, 1.6, 9), 0.4, 3.2, 0.4, [0.3, 0.32, 0.36]);
    S.box(T(sx * 8.7, 1.0, 9), 10.2, 2.0, 0.12, [0.35, 0.38, 0.42]);
    if (WINTER) S.box(T(sx * 8.7, 2.06, 9), 10.2, 0.1, 0.2, SNOW);
  }
  if (WINTER) { snowbanks(S, -13.5, -4, 7.8, 8); snowbanks(S, 4, 13.5, 7.8, 9); snowbanks(S, -13.5, 13.5, -8.3, 10); }
  for (let i = 0; i < 4; i++) {
    const px = -11 + i * 1.6;
    S.box(T(px, 0.5, -4), 1.2, 1.0, 1.2, [0.72, 0.55, 0.35]);
    if (WINTER) S.box(T(px, 1.05, -4), 1.2, 0.1, 1.2, SNOW);
  }
  const tk = o.truck == null ? 0 : clamp01(o.truck);
  if (o.truck !== false) truck(S, 1.8, -3.2 + tk * 9, 0, t, { lights: tk > 0 });
  if (o.crowd) {
    for (let i = 0; i < 5; i++) {
      const w = wander(i + 30, t + 5, -6 + i * 3, -1 + (i % 2) * 3.5, 1.1);
      person(S, Object.assign(workerLook(i), { x: w.x, z: w.z, yaw: w.yaw, walk: w.walk, swing: w.swing, shadowCol: sh, hat: 'beanie', vest: false, coat: [0.25 + hash(i) * 0.3, 0.3, 0.38] }));
    }
  }
  if (o.leaving) for (let i = 0; i < 6; i++) {
    const k = clamp01(o.leaving - i * 0.08);
    actor(S, Object.assign(workerLook(i), { hat: 'beanie', vest: false, coat: [0.3, 0.32 + hash(i) * 0.2, 0.4] }),
      { path: [-2.4 + (i % 3) * 1.6, -6 + Math.floor(i / 3) * 1.2, -2.4 + (i % 3) * 1.6 + 0.4, 13], k, shadowCol: sh }, t + i);
  }
  actor(S, HERO2_OUT, o.hero, t); actor(S, FRIEND_OUT, o.friend, t); actor(S, BOB, o.boss, t);
  if (o.gift) {
    const g = o.gift;
    S.box(T(g[0], g[1], g[2]), 0.8, 0.6, 0.8, [0.85, 0.12, 0.15]);
    S.box(T(g[0], g[1], g[2]), 0.82, 0.62, 0.16, [1, 0.85, 0.2], 0.4);
    S.box(T(g[0], g[1], g[2]), 0.16, 0.62, 0.82, [1, 0.85, 0.2], 0.4);
    S.box(T(g[0], g[1] + 0.38, g[2]), 0.35, 0.16, 0.12, [1, 0.85, 0.2], 0.4);
  }
}

// Герои серии «Новый хозяин»
const HERO2 = { shirt: [0.12, 0.45, 0.45], pants: [0.15, 0.17, 0.28], hat: 'hair', hatCol: [0.35, 0.22, 0.12], glasses: true };
const HERO2_OUT = Object.assign({}, HERO2, { coat: [0.2, 0.24, 0.32], scarf: [0.85, 0.65, 0.1], hat: 'beanie', hatCol: [0.12, 0.45, 0.45] });
const FRIEND = { shirt: [0.62, 0.18, 0.16], pants: [0.22, 0.2, 0.18], hat: 'hair', hatCol: [0.62, 0.62, 0.64] };
const FRIEND_OUT = Object.assign({}, FRIEND, { coat: [0.35, 0.27, 0.2], scarf: [0.15, 0.3, 0.6] });
const BOB = { shirt: [0.42, 0.14, 0.4], pants: [0.2, 0.1, 0.2], hat: 'hair', hatCol: [0.95, 0.82, 0.35], tie: true, tieCol: [1, 0.8, 0.15], glasses: 'sun' };
const MANAGER = { shirt: [0.3, 0.32, 0.36], pants: [0.15, 0.15, 0.2], hat: 'hair', hatCol: [0.1, 0.08, 0.06], vest: true };
const LAWYER = { shirt: [0.32, 0.33, 0.37], pants: [0.2, 0.2, 0.24], hat: 'hair', hatCol: [0.2, 0.15, 0.1], tie: true, tieCol: [0.15, 0.25, 0.6], glasses: true };
