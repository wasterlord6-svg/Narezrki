'use strict';
// Бумажная аппликация: плоские куски цветной бумаги с рваными краями, тени между слоями,
// фактура бумаги, параллакс и «стоп-моушн» на 12 кадров в секунду.
// Рисует прямо в xo (1080x1920). Кадр серии задаётся функцией paint(P, tl, t, d).

const PAPER_FPS = 12;
const stepT = t => Math.floor(t * PAPER_FPS) / PAPER_FPS;

// ---------- текстура бумаги (один раз)
let GRAIN = null;
function grainPattern() {
  if (GRAIN) return GRAIN;
  const c = document.createElement('canvas'); c.width = c.height = 512;
  const g = c.getContext('2d'), im = g.createImageData(512, 512);
  for (let i = 0; i < 512 * 512; i++) {
    const v = 200 + (hash(i * 0.731) * 55) | 0;
    im.data[i * 4] = v; im.data[i * 4 + 1] = v; im.data[i * 4 + 2] = v - 6; im.data[i * 4 + 3] = 255;
  }
  g.putImageData(im, 0, 0);
  // волокна
  g.globalAlpha = 0.18; g.strokeStyle = '#8a8070'; g.lineWidth = 1;
  for (let i = 0; i < 900; i++) {
    const x = hash(i * 3.1) * 512, y = hash(i * 5.7) * 512, a = hash(i * 1.9) * 6.28, l = 6 + hash(i * 8.3) * 22;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  GRAIN = xo.createPattern(c, 'repeat');
  return GRAIN;
}

// ---------- геометрия
// рваный контур: дробим рёбра и смещаем точки поперёк
function torn(pts, seed, rough, step) {
  rough = rough == null ? 5 : rough; step = step || 22;
  const out = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i], b = pts[(i + 1) % pts.length];
    const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1, n = Math.max(1, Math.round(L / step));
    const nx = -dy / L, ny = dx / L;
    for (let k = 0; k < n; k++) {
      const u = k / n, j = (hash(seed * 13.1 + i * 7.7 + k * 3.3) - 0.5) * 2 * rough * (k ? 1 : 0.3);
      out.push([a[0] + dx * u + nx * j, a[1] + dy * u + ny * j]);
    }
  }
  return out;
}
const circlePts = (cx, cy, rx, ry, n) => { n = n || 28; const p = []; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; p.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * (ry || rx)]); } return p; };
const rectPts = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];
const shade = (hex, k) => {
  const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  const f = v => Math.max(0, Math.min(255, Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k))));
  return `rgb(${f(r)},${f(g)},${f(b)})`;
};

function pathOf(pts) { xo.beginPath(); xo.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) xo.lineTo(pts[i][0], pts[i][1]); xo.closePath(); }

// Кусок бумаги: тень, белый рваный край, цветная заливка, немного фактуры
function piece(pts, color, o) {
  o = o || {};
  const seed = o.seed || 1, depth = o.depth == null ? 1 : o.depth, rough = o.rough == null ? 4 : o.rough;
  const rim = torn(pts, seed, rough + 1.5), body = torn(pts, seed + 0.5, rough);
  xo.save();
  if (depth > 0) {
    xo.shadowColor = `rgba(20,12,4,${o.shadow == null ? 0.38 : o.shadow})`;
    xo.shadowBlur = 10 * depth; xo.shadowOffsetX = 4 * depth; xo.shadowOffsetY = 7 * depth;
  }
  pathOf(rim); xo.fillStyle = o.rimColor || '#f6f1e6'; xo.fill();
  xo.restore();
  pathOf(body);
  if (o.grad) {
    const gr = xo.createLinearGradient(0, o.grad[0], 0, o.grad[1]); gr.addColorStop(0, color); gr.addColorStop(1, o.grad[2]); xo.fillStyle = gr;
  } else xo.fillStyle = color;
  xo.fill();
  if (o.grain !== false) { xo.save(); xo.clip(); xo.globalAlpha = 0.16; xo.globalCompositeOperation = 'multiply'; xo.fillStyle = grainPattern(); xo.fillRect(-200, -200, OW + 400, OH + 400); xo.restore(); }
}

// ---------- примитивы
const P = {
  piece, torn, circlePts, rectPts, shade,
  rect: (x, y, w, h, c, o) => piece(rectPts(x, y, w, h), c, o),
  circle: (x, y, r, c, o) => piece(circlePts(x, y, r, r), c, Object.assign({ rough: 2.5 }, o)),
  ellipse: (x, y, rx, ry, c, o) => piece(circlePts(x, y, rx, ry), c, Object.assign({ rough: 2.5 }, o)),
  poly: (pts, c, o) => piece(pts, c, o),
  // повёрнутый прямоугольник вокруг точки крепления (ax, ay) — для рук и ног
  limb(ax, ay, w, h, ang, c, o) {
    const ca = Math.cos(ang), sa = Math.sin(ang), pts = [[-w / 2, 0], [w / 2, 0], [w / 2, h], [-w / 2, h]]
      .map(([x, y]) => [ax + x * ca - y * sa, ay + x * sa + y * ca]);
    piece(pts, c, Object.assign({ rough: 2 }, o));
    return [ax - h * sa, ay + h * ca];
  },
  // горный хребет: пики [[x, высота]...] от земли baseY
  ridge(x0, x1, baseY, peaks, c, o) {
    const pts = [[x0, baseY + 400]]; pts.push([x0, baseY]);
    peaks.forEach(p => pts.push([p[0], baseY - p[1]]));
    pts.push([x1, baseY]); pts.push([x1, baseY + 400]);
    piece(pts, c, o);
  },
  // снежная шапка: те же пики, только верх
  cap(peaks, baseY, frac, c, o) {
    peaks.forEach((p, i) => {
      if (p[1] < 120) return;
      const tx = p[0], ty = baseY - p[1], h = p[1] * frac, w = h * 0.9;
      piece([[tx, ty], [tx + w * 0.55, ty + h], [tx + w * 0.22, ty + h * 0.78], [tx, ty + h * 1.05], [tx - w * 0.25, ty + h * 0.8], [tx - w * 0.55, ty + h]], c, Object.assign({ seed: i + 40, depth: 0.4 }, o));
    });
  },
  cloud(x, y, s, c, o) {
    const pts = [];
    const bumps = [[-1.1, 0.1, 0.55], [-0.5, -0.25, 0.7], [0.25, -0.35, 0.8], [0.95, -0.05, 0.6], [1.4, 0.2, 0.42]];
    // контур облака: верхние дуги + плоский низ
    bumps.forEach(([bx, by, r]) => { for (let k = 0; k <= 8; k++) { const a = Math.PI + k / 8 * Math.PI; pts.push([x + (bx + Math.cos(a) * r) * s, y + (by + Math.sin(a) * r) * s]); } });
    pts.push([x + 1.8 * s, y + 0.45 * s]); pts.push([x - 1.65 * s, y + 0.45 * s]);
    piece(pts, c || '#f4f6fb', Object.assign({ rough: 3, depth: 0.8 }, o));
  },
  // текст, вырезанный из бумаги (полоска + надпись)
  label(text, x, y, size, bg, fg, o) {
    o = o || {};
    xo.font = `800 ${size}px ${FONT}`;
    const w = xo.measureText(text).width + size * 0.8, h = size * 1.35;
    xo.save(); xo.translate(x, y); xo.rotate(o.rot || 0);
    piece(rectPts(-w / 2, -h / 2, w, h), bg, { seed: o.seed || 3, depth: o.depth == null ? 1 : o.depth, rough: 3 });
    xo.fillStyle = fg; xo.textAlign = 'center'; xo.textBaseline = 'middle'; xo.fillText(text, 0, size * 0.04);
    xo.restore();
  },
};

// Бумажный человечек. o: x, y (точка ступней), s, face: 1 вправо / -1 влево, walk (фаза), swing,
// coat, pants, skin, hat ('wool'|'helmet'|'none'), hatCol, pack, packCol, oxygen, axe, goggles,
// armR/armL (угол), lean, seed
P.person = function (o) {
  const s = o.s || 1, f = o.face || 1, ph = o.walk || 0, sw = o.swing == null ? 0.5 : o.swing;
  const skin = o.skin || '#f0c8a0', coat = o.coat || '#8a5a3a', pants = o.pants || '#4a3a30';
  const seed = o.seed || 7;
  xo.save(); xo.translate(o.x, o.y); xo.scale(s * f, s); xo.rotate((o.lean || 0) * f);
  const legA = Math.sin(ph) * sw, armA = Math.sin(ph) * sw * 0.8;
  // дальние рука и нога
  P.limb(6, -118, 26, 70, -armA + (o.armL || 0.15), shade(coat, -0.2), { seed: seed + 1, depth: 0.5 });
  P.limb(4, -64, 28, 66, legA, shade(pants, -0.15), { seed: seed + 2, depth: 0.5 });
  P.rect(-8, -4 + Math.max(0, -legA) * 6, 36, 12, '#2a2420', { seed: seed + 3, depth: 0.3 });
  // рюкзак и кислородная рама
  if (o.pack) P.rect(-48, -132, 30, 62, o.packCol || '#6a6a3a', { seed: seed + 4, depth: 0.6 });
  if (o.oxygen) { P.rect(-54, -150, 14, 70, '#9aa4ac', { seed: seed + 5, depth: 0.5 }); P.rect(-38, -150, 14, 70, '#9aa4ac', { seed: seed + 6, depth: 0.5 }); }
  // корпус
  P.poly([[-26, -132], [26, -132], [30, -62], [-28, -62]], coat, { seed: seed + 7, depth: 0.7 });
  P.rect(-26, -78, 56, 8, shade(coat, -0.35), { seed: seed + 8, depth: 0.2 });
  // ближняя нога
  P.limb(-6, -64, 28, 66, -legA, pants, { seed: seed + 9, depth: 0.6 });
  P.rect(-14, -4 + Math.max(0, legA) * 6, 36, 12, '#2a2420', { seed: seed + 10, depth: 0.3 });
  // голова
  P.circle(4, -158, 26, skin, { seed: seed + 11, depth: 0.6 });
  if (o.hat === 'helmet') P.poly([[-24, -164], [30, -164], [26, -186], [-20, -188]], o.hatCol || '#e8a020', { seed: seed + 12, depth: 0.4 });
  else if (o.hat !== 'none') P.poly([[-24, -160], [30, -160], [24, -186], [4, -194], [-18, -186]], o.hatCol || '#b03a2e', { seed: seed + 12, depth: 0.4 });
  if (o.goggles) P.rect(4, -164, 26, 11, '#2b3440', { seed: seed + 13, depth: 0.2 });
  else { xo.fillStyle = '#2a1e18'; xo.fillRect(16, -160, 5, 6); }
  if (o.beard) P.poly([[-6, -146], [28, -146], [22, -132], [0, -132]], o.beard, { seed: seed + 14, depth: 0.2 });
  // ближняя рука и ледоруб
  const hand = P.limb(-2, -126, 26, 68, armA + (o.armR || -0.15), shade(coat, 0.08), { seed: seed + 15, depth: 0.7 });
  if (o.axe) {
    xo.save(); xo.translate(hand[0], hand[1]); xo.rotate(o.axeAng || 0.1);
    P.rect(-4, -20, 8, 96, '#7a5530', { seed: seed + 16, depth: 0.4 });
    P.poly([[-22, -26], [24, -26], [20, -14], [-18, -14]], '#a8aeb4', { seed: seed + 17, depth: 0.3 });
    xo.restore();
  }
  P.circle(hand[0], hand[1], 9, o.glove || '#3a2c22', { seed: seed + 18, depth: 0.3 });
  xo.restore();
};

// Параллакс: слой с глубиной par (0 — небо, 1 — передний план) сдвигается и масштабируется камерой.
// cam: {x, y, zoom}
P.layer = function (cam, par, draw) {
  xo.save();
  const z = 1 + ((cam.zoom || 1) - 1) * par;
  xo.translate(OW / 2, OH / 2); xo.scale(z, z); xo.translate(-OW / 2 - (cam.x || 0) * par, -OH / 2 - (cam.y || 0) * par);
  draw();
  xo.restore();
};

// Небо-градиент на весь кадр
P.sky = function (top, bot) {
  const g = xo.createLinearGradient(0, 0, 0, OH); g.addColorStop(0, top); g.addColorStop(1, bot);
  xo.fillStyle = g; xo.fillRect(-300, -300, OW + 600, OH + 600);
  xo.save(); xo.globalAlpha = 0.14; xo.globalCompositeOperation = 'multiply'; xo.fillStyle = grainPattern(); xo.fillRect(-300, -300, OW + 600, OH + 600); xo.restore();
};

// Бумажный снег: кружочки, падают ступеньками (12 к/с)
P.snow = function (t, n, col) {
  t = stepT(t);
  for (let i = 0; i < (n || 70); i++) {
    const depth = 0.4 + hash(i * 1.7) * 0.6, r = 5 + depth * 9;
    const x = (hash(i * 3.1) * (OW + 100) + Math.sin(t * 0.8 + i) * 30) % (OW + 100) - 50;
    const y = (hash(i * 7.3) * (OH + 100) + t * (90 + depth * 160)) % (OH + 100) - 50;
    piece(circlePts(x, y, r, r, 10), col || '#ffffff', { seed: i, depth: 0.25 * depth, rough: 1.2, grain: false, shadow: 0.25 });
  }
};

// Вызов из drawFrame для кадров с paint
function paintFrame(sh, tl, t, d, fx) {
  xo.setTransform(1, 0, 0, 1, 0, 0); xo.globalAlpha = 1; xo.globalCompositeOperation = 'source-over';
  xo.fillStyle = '#e9e1d0'; xo.fillRect(0, 0, OW, OH);
  // стоп-моушн: время ступеньками, лёгкое дрожание кадра на каждой «фазе»
  const qt = stepT(t), qtl = Math.max(0, qt - sh.t0), jit = Math.floor(t * PAPER_FPS);
  const jx = (hash(jit * 1.3) - 0.5) * 3, jy = (hash(jit * 2.7) - 0.5) * 3;
  const z = fx.zoom || 1;
  xo.translate(OW / 2 + (fx.dx || 0) + jx, OH / 2 + (fx.dy || 0) + jy); xo.scale(z, z); xo.translate(-OW / 2, -OH / 2);
  sh.paint(P, qtl, qt, d);
  xo.setTransform(1, 0, 0, 1, 0, 0);
  // общая виньетка, тёплая
  const g = xo.createRadialGradient(OW / 2, OH / 2, OH * 0.3, OW / 2, OH / 2, OH * 0.66);
  g.addColorStop(0, 'rgba(40,20,0,0)'); g.addColorStop(1, `rgba(40,20,0,${sh.vignette == null ? 0.45 : sh.vignette})`);
  xo.fillStyle = g; xo.fillRect(0, 0, OW, OH);
}
