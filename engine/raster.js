'use strict';
// Программный растеризатор блочного 3D. Работает в Chromium, рисует в canvas.
// 3D считается в 720x1280 с z-буфером, затем кадр растягивается до 1080x1920,
// поверх кладутся bloom, виньетка и 2D-надписи в родном разрешении.

const RW = 720, RH = 1280, OW = 1080, OH = 1920;

// ---------- математика
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mulS = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const norm = a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const lerp = (a, b, t) => a + (b - a) * t;
const lerp3 = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
const clamp01 = t => t < 0 ? 0 : t > 1 ? 1 : t;
const smooth = t => { t = clamp01(t); return t * t * (3 - 2 * t); };
const hash = n => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

// матрицы 4x4, построчно
function mmul(a, b) {
  const o = new Array(16);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++)
    o[r * 4 + c] = a[r * 4] * b[c] + a[r * 4 + 1] * b[4 + c] + a[r * 4 + 2] * b[8 + c] + a[r * 4 + 3] * b[12 + c];
  return o;
}
const M = (...ms) => ms.reduce(mmul);
const T = (x, y, z) => [1, 0, 0, x, 0, 1, 0, y, 0, 0, 1, z, 0, 0, 0, 1];
const Sc = (x, y, z) => [x, 0, 0, 0, 0, y, 0, 0, 0, 0, z, 0, 0, 0, 0, 1];
const Rx = a => { const c = Math.cos(a), s = Math.sin(a); return [1, 0, 0, 0, 0, c, -s, 0, 0, s, c, 0, 0, 0, 0, 1]; };
const Ry = a => { const c = Math.cos(a), s = Math.sin(a); return [c, 0, s, 0, 0, 1, 0, 0, -s, 0, c, 0, 0, 0, 0, 1]; };
const Rz = a => { const c = Math.cos(a), s = Math.sin(a); return [c, -s, 0, 0, s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]; };
const tp = (m, p) => [m[0] * p[0] + m[1] * p[1] + m[2] * p[2] + m[3], m[4] * p[0] + m[5] * p[1] + m[6] * p[2] + m[7], m[8] * p[0] + m[9] * p[1] + m[10] * p[2] + m[11]];
const td = (m, d) => [m[0] * d[0] + m[1] * d[1] + m[2] * d[2], m[4] * d[0] + m[5] * d[1] + m[6] * d[2], m[8] * d[0] + m[9] * d[1] + m[10] * d[2]];

// ---------- сцена
const BOX_FACES = [
  [[1, 3, 7, 5], [1, 0, 0]], [[0, 4, 6, 2], [-1, 0, 0]],
  [[2, 6, 7, 3], [0, 1, 0]], [[0, 1, 5, 4], [0, -1, 0]],
  [[4, 5, 7, 6], [0, 0, 1]], [[0, 2, 3, 1], [0, 0, -1]],
];

class Scene {
  constructor() { this.faces = []; this.lights = []; }
  // коробка с центром в начале координат матрицы m
  box(m, sx, sy, sz, col, em) {
    const hx = sx / 2, hy = sy / 2, hz = sz / 2, c = [];
    for (let i = 0; i < 8; i++) c.push(tp(m, [(i & 1) ? hx : -hx, (i & 2) ? hy : -hy, (i & 4) ? hz : -hz]));
    for (const [idx, n] of BOX_FACES)
      this.faces.push({ p: [c[idx[0]], c[idx[1]], c[idx[2]], c[idx[3]]], n: norm(td(m, n)), col, em: em || 0 });
  }
  quad(p, n, col, em) { this.faces.push({ p, n, col, em: em || 0 }); }
  light(pos, col, power) { this.lights.push({ pos, col, power }); }
  // плитка из квадов, чтобы вершинный свет давал пятна от ламп
  ground(x0, z0, x1, z1, step, col, jitter, y, seed) {
    y = y || 0; seed = seed || 0;
    for (let x = x0; x < x1 - 1e-6; x += step) for (let z = z0; z < z1 - 1e-6; z += step) {
      const j = (hash(x * 13.7 + z * 71.3 + seed) - 0.5) * 2 * (jitter || 0);
      this.quad([[x, y, z], [x, y, z + step], [x + step, y, z + step], [x + step, y, z]], [0, 1, 0],
        [col[0] + j, col[1] + j, col[2] + j]);
    }
  }
}

// ---------- растеризация
const cbuf = new Uint8ClampedArray(RW * RH * 4);
const zbuf = new Float32Array(RW * RH);

function tri(x0, y0, z0, r0, g0, b0, x1, y1, z1, r1, g1, b1, x2, y2, z2, r2, g2, b2) {
  const minx = Math.max(0, Math.floor(Math.min(x0, x1, x2))), maxx = Math.min(RW - 1, Math.ceil(Math.max(x0, x1, x2)));
  const miny = Math.max(0, Math.floor(Math.min(y0, y1, y2))), maxy = Math.min(RH - 1, Math.ceil(Math.max(y0, y1, y2)));
  if (minx > maxx || miny > maxy) return;
  const area = (x1 - x0) * (y2 - y0) - (y1 - y0) * (x2 - x0);
  if (Math.abs(area) < 1e-7) return;
  const ia = 1 / area;
  // веса линейны по x, считаем приращениями
  const dw0 = -(y2 - y1) * ia, dw1 = -(y0 - y2) * ia;
  for (let y = miny; y <= maxy; y++) {
    const py = y + 0.5, px = minx + 0.5;
    let w0 = ((x1 - px) * (y2 - py) - (y1 - py) * (x2 - px)) * ia;
    let w1 = ((x2 - px) * (y0 - py) - (y2 - py) * (x0 - px)) * ia;
    let i = y * RW + minx;
    for (let x = minx; x <= maxx; x++, i++, w0 += dw0, w1 += dw1) {
      const w2 = 1 - w0 - w1;
      if (w0 < -1e-5 || w1 < -1e-5 || w2 < -1e-5) continue;
      const z = w0 * z0 + w1 * z1 + w2 * z2;
      if (z <= zbuf[i]) continue;
      zbuf[i] = z;
      const k = i * 4;
      cbuf[k] = (w0 * r0 + w1 * r1 + w2 * r2) * 255;
      cbuf[k + 1] = (w0 * g0 + w1 * g1 + w2 * g2) * 255;
      cbuf[k + 2] = (w0 * b0 + w1 * b1 + w2 * b2) * 255;
    }
  }
}

function render3D(S, cam, env) {
  // небо
  for (let y = 0; y < RH; y++) {
    const c = lerp3(env.skyTop, env.skyBot, Math.pow(y / RH, 0.8));
    const r = c[0] * 255, g = c[1] * 255, b = c[2] * 255;
    let k = y * RW * 4;
    for (let x = 0; x < RW; x++, k += 4) { cbuf[k] = r; cbuf[k + 1] = g; cbuf[k + 2] = b; cbuf[k + 3] = 255; }
  }
  if (env.stars) for (let i = 0; i < 220; i++) {
    const x = Math.floor(hash(i * 3.1) * RW), y = Math.floor(hash(i * 7.7) * RH * 0.55), k = (y * RW + x) * 4;
    const v = 120 + hash(i * 1.3) * 135; cbuf[k] = v; cbuf[k + 1] = v; cbuf[k + 2] = v + 20;
  }
  zbuf.fill(0);

  const eye = cam.eye, f = norm(sub(cam.target, eye)), r = norm(cross(f, [0, 1, 0])), u = cross(r, f);
  const focal = (RH / 2) / Math.tan((cam.fov * Math.PI / 180) / 2), NEAR = 0.15;
  const amb = env.amb, sunD = norm(env.sunDir), sunC = env.sunCol, fogC = env.fog || env.skyBot, fogK = env.fogK || 0;
  const L = S.lights;

  for (const F of S.faces) {
    const p = F.p, n = F.n;
    const cx = (p[0][0] + p[2][0]) / 2, cy = (p[0][1] + p[2][1]) / 2, cz = (p[0][2] + p[2][2]) / 2;
    if (n[0] * (eye[0] - cx) + n[1] * (eye[1] - cy) + n[2] * (eye[2] - cz) <= 0) continue;
    const hemi = 0.72 + 0.28 * n[1], sd = Math.max(0, dot(n, sunD));
    let poly = [];
    for (let i = 0; i < 4; i++) {
      const P = p[i];
      let lr = amb[0] * hemi + sunC[0] * sd, lg = amb[1] * hemi + sunC[1] * sd, lb = amb[2] * hemi + sunC[2] * sd;
      for (let j = 0; j < L.length; j++) {
        const lp = L[j].pos, dx = lp[0] - P[0], dy = lp[1] - P[1], dz = lp[2] - P[2], d2 = dx * dx + dy * dy + dz * dz;
        const d = Math.sqrt(d2) || 1, ndl = (n[0] * dx + n[1] * dy + n[2] * dz) / d;
        if (ndl <= 0) continue;
        const a = L[j].power * ndl / (1 + d2 * 0.22);
        lr += L[j].col[0] * a; lg += L[j].col[1] * a; lb += L[j].col[2] * a;
      }
      let cr = F.col[0] * lr + F.col[0] * F.em, cg = F.col[1] * lg + F.col[1] * F.em, cb = F.col[2] * lb + F.col[2] * F.em;
      const dxe = P[0] - eye[0], dye = P[1] - eye[1], dze = P[2] - eye[2];
      const vz = dxe * f[0] + dye * f[1] + dze * f[2];
      if (fogK && F.em < 1) {
        const fg = 1 - Math.exp(-Math.max(0, vz) * fogK);
        cr = lerp(cr, fogC[0], fg); cg = lerp(cg, fogC[1], fg); cb = lerp(cb, fogC[2], fg);
      }
      poly.push([dxe * r[0] + dye * r[1] + dze * r[2], dxe * u[0] + dye * u[1] + dze * u[2], vz, cr, cg, cb]);
    }
    // отсечение ближней плоскостью
    if (poly.some(v => v[2] < NEAR)) {
      const out = [];
      for (let i = 0; i < poly.length; i++) {
        const a = poly[i], b = poly[(i + 1) % poly.length], ain = a[2] >= NEAR, bin = b[2] >= NEAR;
        if (ain) out.push(a);
        if (ain !== bin) { const t = (NEAR - a[2]) / (b[2] - a[2]); out.push(a.map((v, k) => lerp(v, b[k], t))); }
      }
      poly = out;
      if (poly.length < 3) continue;
    }
    for (const v of poly) { const iz = 1 / v[2]; v[0] = RW / 2 + v[0] * iz * focal; v[1] = RH / 2 - v[1] * iz * focal; v[2] = iz; }
    for (let i = 1; i + 1 < poly.length; i++) {
      const a = poly[0], b = poly[i], c = poly[i + 1];
      tri(a[0], a[1], a[2], a[3], a[4], a[5], b[0], b[1], b[2], b[3], b[4], b[5], c[0], c[1], c[2], c[3], c[4], c[5]);
    }
  }
}

// ---------- вывод кадра
let c3, x3, cs, xs, co, xo, img;
function initCanvases() {
  c3 = document.createElement('canvas'); c3.width = RW; c3.height = RH; x3 = c3.getContext('2d');
  cs = document.createElement('canvas'); cs.width = RW / 4; cs.height = RH / 4; xs = cs.getContext('2d');
  co = document.createElement('canvas'); co.width = OW; co.height = OH; xo = co.getContext('2d');
  document.body.appendChild(co);
  img = new ImageData(cbuf, RW, RH);
}

// fx: {zoom, dx, dy, bloom, vignette}
function composite(fx) {
  x3.putImageData(img, 0, 0);
  xs.filter = 'blur(5px) contrast(1.9) brightness(0.95)';
  xs.drawImage(c3, 0, 0, cs.width, cs.height);
  xs.filter = 'none';
  xo.setTransform(1, 0, 0, 1, 0, 0);
  xo.globalAlpha = 1; xo.globalCompositeOperation = 'source-over';
  xo.fillStyle = '#000'; xo.fillRect(0, 0, OW, OH);
  const z = fx.zoom || 1;
  xo.translate(OW / 2 + (fx.dx || 0), OH / 2 + (fx.dy || 0)); xo.scale(z, z); xo.translate(-OW / 2, -OH / 2);
  xo.imageSmoothingEnabled = true; xo.imageSmoothingQuality = 'high';
  xo.drawImage(c3, 0, 0, OW, OH);
  xo.globalCompositeOperation = 'screen'; xo.globalAlpha = fx.bloom == null ? 0.5 : fx.bloom;
  xo.drawImage(cs, 0, 0, OW, OH);
  xo.globalCompositeOperation = 'source-over'; xo.globalAlpha = 1;
  xo.setTransform(1, 0, 0, 1, 0, 0);
  const g = xo.createRadialGradient(OW / 2, OH / 2, OH * 0.28, OW / 2, OH / 2, OH * 0.62);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${fx.vignette == null ? 0.6 : fx.vignette})`);
  xo.fillStyle = g; xo.fillRect(0, 0, OW, OH);
}
