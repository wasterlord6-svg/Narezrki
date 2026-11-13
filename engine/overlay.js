'use strict';
// 2D-слой поверх кадра (1080x1920): субтитры по словам, крупные надписи, плашки, вспышки.
// Плюс общий цикл показа: window.renderFrame(t) рисует кадр и возвращает JPEG.

const FONT = '"Inter Display ExtraBold","Inter ExtraBold","Inter","DejaVu Sans",sans-serif';
const backOut = t => { t = clamp01(t); const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };

function strokeText(txt, x, y, size, fill, stroke, lw) {
  xo.font = `800 ${size}px ${FONT}`; xo.textAlign = 'center'; xo.textBaseline = 'middle';
  xo.lineJoin = 'round'; xo.lineWidth = lw; xo.strokeStyle = stroke; xo.strokeText(txt, x, y);
  xo.fillStyle = fill; xo.fillText(txt, x, y);
}

// Крупная «слэм»-надпись: влетает с перелётом масштаба.
function drawSlam(sl, t) {
  const a = t - sl.t; if (a < 0 || a > sl.dur) return;
  const k = backOut(a / 0.14), out = clamp01((sl.dur - a) / 0.08);
  let size = sl.size || 190;
  xo.font = `800 ${size}px ${FONT}`;
  const w = xo.measureText(sl.text).width; if (w > 960) size *= 960 / w;
  xo.save(); xo.globalAlpha = out;
  xo.translate(OW / 2, sl.y || 560); xo.rotate((sl.rot || -0.04) * k); xo.scale(0.4 + 0.6 * k, 0.4 + 0.6 * k);
  strokeText(sl.text, 0, 10, size, 'rgba(0,0,0,0.55)', 'rgba(0,0,0,0.55)', 34);
  strokeText(sl.text, 0, 0, size, sl.color || '#ffe21f', '#000', 26);
  xo.restore();
}

// Группы по 1–2 слова, активное слово зелёное.
function groupWords(words) {
  const g = [];
  for (let i = 0; i < words.length;) {
    const a = words[i], b = words[i + 1];
    const endsSentence = /[.!?…:]$/.test(a.text);
    if (b && !endsSentence && (a.text.length + b.text.length) <= 13 && b.start - a.end < 0.25) { g.push([a, b]); i += 2; }
    else { g.push([a]); i += 1; }
  }
  return g;
}

function drawSubs(groups, t) {
  for (let gi = 0; gi < groups.length; gi++) {
    const g = groups[gi], t0 = g[0].start, next = groups[gi + 1];
    const t1 = next ? Math.min(next[0].start, g[g.length - 1].end + 0.35) : g[g.length - 1].end + 0.35;
    if (t < t0 || t >= t1) continue;
    const k = backOut((t - t0) / 0.09), size = 118;
    xo.font = `800 ${size}px ${FONT}`;
    const txts = g.map(w => w.text.toUpperCase().replace(/[.,!?…:—-]+$/g, ''));
    const sp = size * 0.28, ws = txts.map(s => xo.measureText(s).width);
    let total = ws.reduce((a, b) => a + b, 0) + sp * (txts.length - 1), sc = total > 960 ? 960 / total : 1;
    xo.save(); xo.translate(OW / 2, 1250); xo.scale(sc * (0.6 + 0.4 * k), sc * (0.6 + 0.4 * k));
    let x = -total / 2;
    for (let i = 0; i < txts.length; i++) {
      const active = t >= g[i].start && (i === g.length - 1 || t < g[i + 1].start);
      strokeText(txts[i], x + ws[i] / 2, 0, size, active ? '#3dff6e' : '#ffffff', '#000', 22);
      x += ws[i] + sp;
    }
    xo.restore();
    return;
  }
}

function drawPlate(text, t) {
  const k = smooth(t / 0.3);
  xo.save(); xo.globalAlpha = k;
  xo.font = `800 44px ${FONT}`; const w = xo.measureText(text).width + 56;
  xo.fillStyle = '#ffe21f'; xo.fillRect(60, 210, w, 74);
  xo.fillStyle = '#000'; xo.textAlign = 'left'; xo.textBaseline = 'middle'; xo.fillText(text, 88, 249);
  xo.restore();
}

// Финальная карточка серии.
function drawEndCard(card, t) {
  const a = t - card.t; if (a < 0) return;
  xo.fillStyle = `rgba(0,0,0,${0.55 * smooth(a / 0.25)})`; xo.fillRect(0, 0, OW, OH);
  const k = backOut(a / 0.18);
  xo.save(); xo.translate(OW / 2, 800); xo.scale(0.4 + 0.6 * k, 0.4 + 0.6 * k);
  xo.font = `800 230px ${FONT}`;
  const tw = xo.measureText(card.title).width, ts = tw > 940 ? 230 * 940 / tw : 230;
  strokeText(card.title, 0, 0, ts, '#ffe21f', '#000', 30);
  xo.restore();
  if (a > 0.35) {
    const k2 = backOut((a - 0.35) / 0.18);
    xo.save(); xo.translate(OW / 2, 1010); xo.scale(0.4 + 0.6 * k2, 0.4 + 0.6 * k2);
    strokeText(card.sub, 0, 0, 100, '#ffffff', '#000', 20);
    xo.restore();
  }
}

// SHOW = {duration, shots:[{t0,t1,env,build(S,tl,t),cam(tl,dur)}], slams, words, plate, endCard}
let SHOW = null, SUBG = null;
function setShow(show) { SHOW = show; SUBG = groupWords(show.words || []); if (!co) initCanvases(); }

function drawFrame(t, clean) {
  const sh = SHOW.shots.find(s => t >= s.t0 && t < s.t1) || SHOW.shots[SHOW.shots.length - 1];
  const tl = t - sh.t0, paper = !!sh.paint;
  if (!paper) { const S = new Scene(); sh.build(S, tl, t, sh.t1 - sh.t0); render3D(S, sh.cam(tl, sh.t1 - sh.t0), sh.env); }
  // эффекты склейки и тряска от слэмов
  const first = sh === SHOW.shots[0], punch = first ? 0 : Math.max(0, 1 - tl / 0.2);
  let dx = 0, dy = 0;
  for (const sl of SHOW.slams || []) {
    const k = Math.max(0, 1 - (t - sl.t) / 0.28);
    if (t >= sl.t && k > 0) { dx += Math.sin(t * 97) * 16 * k; dy += Math.cos(t * 83) * 16 * k; }
  }
  // длинный кадр перебивается наездом в середине
  const d = sh.t1 - sh.t0, mid = d > 2.7 && tl > d / 2 && !sh.card;
  const p2 = mid ? Math.max(0, 1 - (tl - d / 2) / 0.2) : 0;
  const fxz = { zoom: 1.02 + 0.09 * punch * punch + (mid ? 0.14 : 0) + 0.07 * p2 * p2, dx, dy, bloom: sh.bloom, vignette: sh.vignette };
  if (clean) { if (paper) paintFrame(sh, tl, t, d, { zoom: 1.02 }); else { composite({ zoom: 1.02, bloom: sh.bloom, vignette: sh.vignette }); if (sh.snow) drawSnow(t, sh.snow === true ? 1 : sh.snow); } return; }
  if (paper) paintFrame(sh, tl, t, d, fxz); else composite(fxz);
  if (!first && tl < 0.13) { xo.fillStyle = `rgba(255,255,255,${0.6 * (1 - tl / 0.13)})`; xo.fillRect(0, 0, OW, OH); }
  if (sh.snow && !paper) drawSnow(t, sh.snow === true ? 1 : sh.snow);
  if (sh.card) drawCard(sh.card, tl, d);
  if (SHOW.plate) drawPlate(SHOW.plate, t);
  for (const sl of SHOW.slams || []) drawSlam(sl, t);
  if (SHOW.endCard) drawEndCard(SHOW.endCard, t);
  if (!SHOW.endCard || t < SHOW.endCard.t) drawSubs(SUBG, t);
  const fade = Math.max(1 - t / 0.12, (t - (SHOW.duration - 0.35)) / 0.35);
  if (fade > 0) { xo.fillStyle = `rgba(0,0,0,${Math.min(1, fade)})`; xo.fillRect(0, 0, OW, OH); }
}

window.renderFrame = (t, quality) => { drawFrame(t); return co.toDataURL('image/jpeg', quality || 0.93).slice(23); };

// ---------- экранные карточки поверх затемнённой сцены
function panel(x, y, w, h, col, border) {
  xo.fillStyle = col; xo.beginPath(); xo.roundRect(x, y, w, h, 36); xo.fill();
  if (border) { xo.lineWidth = 8; xo.strokeStyle = border; xo.stroke(); }
}
function txt(s, x, y, size, col, align) {
  xo.font = `800 ${size}px ${FONT}`; xo.textAlign = align || 'center'; xo.textBaseline = 'middle'; xo.fillStyle = col; xo.fillText(s, x, y);
}
function fitSize(s, size, maxW) { xo.font = `800 ${size}px ${FONT}`; const w = xo.measureText(s).width; return w > maxW ? size * maxW / w : size; }

function drawCard(c, tl, d) {
  xo.fillStyle = `rgba(0,0,12,${0.62 * smooth(tl / 0.15)})`; xo.fillRect(0, 0, OW, OH);
  const k = backOut(tl / 0.16);
  xo.save(); xo.translate(OW / 2, 800); xo.scale(0.5 + 0.5 * k, 0.5 + 0.5 * k); xo.translate(-OW / 2, -800);
  if (c.type === 'board') {
    panel(90, 520, 900, 540, '#10141c', '#ffb21f');
    txt(c.head, 540, 620, 62, '#9fb3c8');
    xo.shadowColor = '#ffb21f'; xo.shadowBlur = 45;
    txt(c.big, 540, 850, fitSize(c.big, 250, 800), '#ffb21f');
    xo.shadowBlur = 0;
  } else if (c.type === 'log') {
    panel(70, 430, 940, 740, '#0d1320', '#7fd4ff');
    txt(c.head, 540, 520, 58, '#7fd4ff');
    c.rows.forEach((r, i) => {
      if (tl < i * d * 0.16) return;
      const y = 660 + i * 125;
      if (r[2]) { xo.fillStyle = `rgba(255,50,40,${0.3 + 0.25 * Math.sin(tl * 16)})`; xo.fillRect(90, y - 55, 900, 110); }
      txt(r[0], 120, y, 46, '#c8d3e0', 'left'); txt(r[1], 960, y, 58, r[2] ? '#ff5548' : '#ffffff', 'right');
    });
  } else if (c.type === 'list') {
    panel(110, 430, 860, 740, '#f4f1e6', '#333');
    txt(c.head, 540, 520, 54, '#222');
    c.rows.forEach((r, i) => {
      const y = 660 + i * 125;
      txt(r, 180, y, 62, '#222', 'left');
      if (i === c.strike) {
        const w = xo.measureText(r).width + 60, p = clamp01((tl - 0.2 * d) / (0.25 * d));
        xo.strokeStyle = '#e01010'; xo.lineWidth = 9; xo.lineCap = 'round';
        xo.beginPath(); xo.moveTo(150, y); xo.lineTo(150 + w * p, y - 6); xo.stroke();
      }
    });
  } else if (c.type === 'counter') {
    panel(140, 480, 800, 640, '#10141c', '#9fb3c8');
    txt(c.head, 540, 580, 62, '#9fb3c8');
    const n = Math.round(lerp(c.from, c.to, clamp01((tl - 0.3 * d) / (0.4 * d))));
    const col = n >= c.from ? '#3dff6e' : n > c.to ? '#ffe21f' : '#ff4b3e';
    xo.shadowColor = col; xo.shadowBlur = 50; txt(String(n), 540, 860, 440, col); xo.shadowBlur = 0;
  } else if (c.type === 'chart') {
    panel(90, 470, 900, 660, '#10141c', '#9fb3c8');
    txt(c.head, 540, 560, 56, '#9fb3c8');
    const pts = [[0, 0.2], [0.18, 0.16], [0.36, 0.26], [0.52, 0.5], [0.72, 0.72], [1, 0.93]], p = clamp01(tl / (d * 0.75));
    const X = u => 160 + u * 760, Y = v => 650 + v * 420;
    xo.strokeStyle = '#ff4b3e'; xo.lineWidth = 16; xo.lineJoin = 'round'; xo.lineCap = 'round'; xo.beginPath();
    let lx = X(0), ly = Y(pts[0][1]); xo.moveTo(lx, ly);
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i]; if (p <= a[0]) break;
      const q = clamp01((p - a[0]) / (b[0] - a[0])); lx = X(lerp(a[0], b[0], q)); ly = Y(lerp(a[1], b[1], q)); xo.lineTo(lx, ly);
    }
    xo.stroke();
    xo.fillStyle = '#ffe21f'; xo.beginPath(); xo.arc(lx, ly, 46, 0, 7); xo.fill(); txt('₽', lx, ly + 4, 60, '#000');
  } else if (c.type === 'docs') {
    c.docs.forEach((dc, i) => {
      if (tl < i * 0.35) return;
      const k2 = backOut((tl - i * 0.35) / 0.16), x = c.docs.length > 1 ? 300 + i * 480 : 540, rot = (i ? 0.06 : -0.06);
      xo.save(); xo.translate(x, 820); xo.rotate(rot); xo.scale(k2, k2);
      panel(-210, -300, 420, 600, '#f6f1e3', '#555');
      txt(dc.title, 0, -220, 58, '#1d2a44');
      for (let j = 0; j < 6; j++) { xo.fillStyle = '#b9b3a3'; xo.fillRect(-160, -120 + j * 50, j % 3 === 2 ? 200 : 320, 14); }
      xo.strokeStyle = '#c0241c'; xo.lineWidth = 10; xo.beginPath(); xo.arc(90, 200, 70, 0, 7); xo.stroke();
      txt(dc.stamp || 'ПАТЕНТ', 90, 202, 30, '#c0241c');
      xo.restore();
    });
    if (c.head) strokeText(c.head, 540, 470, fitSize(c.head, 120, 940), '#ffe21f', '#000', 22);
  } else if (c.type === 'offer') {
    panel(90, 470, 900, 700, '#f6f1e3', '#222');
    txt(c.head, 540, 560, 60, '#222');
    c.rows.forEach((r, i) => {
      if (tl < 0.15 + i * d * 0.18) return;
      txt(r[0], 150, 700 + i * 140, 62, r[1] || '#222', 'left');
    });
  } else if (c.type === 'question') {
    txt('ПИШИ В КОММЕНТАРИЯХ', 540, 470, 50, '#ffffff');
    c.lines.forEach((ln, i) => strokeText(ln, 540, 660 + i * 190, fitSize(ln, 165, 940), '#ffe21f', '#000', 26));
    if (c.footer && tl > 0.5) {
      const y = 660 + c.lines.length * 190 + 10; xo.font = `800 50px ${FONT}`;
      const w = xo.measureText(c.footer).width + 70;
      panel(540 - w / 2, y - 48, w, 96, '#ffffff'); txt(c.footer, 540, y + 2, 50, '#000');
    }
  }
  xo.restore();
}

// Обложка: чистый кадр без субтитров и крупное название.
window.renderCover = (t, title, sub) => {
  drawFrame(t, true);
  xo.fillStyle = 'rgba(0,0,0,0.25)'; xo.fillRect(0, 0, OW, OH);
  strokeText(title, 540, 560, fitSize(title, 240, 960), '#ffe21f', '#000', 34);
  xo.font = `800 120px ${FONT}`; const w = xo.measureText(sub).width + 110;
  panel(540 - w / 2, 720, w, 190, '#ff3b30'); txt(sub, 540, 818, 120, '#ffffff');
  return co.toDataURL('image/jpeg', 0.92).slice(23);
};

// ---------- снегопад поверх 3D-кадра (экранные снежинки с глубиной)
function drawSnow(t, k) {
  const n = Math.round(260 * (k == null ? 1 : k));
  for (let i = 0; i < n; i++) {
    const depth = 0.35 + hash(i * 1.7) * 0.65, sp = 70 + depth * 190;
    const x = (hash(i * 3.1) * (OW + 200) - 100 + Math.sin(t * (0.6 + hash(i) * 0.9) + i) * 38 * depth + t * 25 * depth) % (OW + 200) - 100;
    const y = (hash(i * 7.3) * (OH + 100) + t * sp) % (OH + 100) - 50;
    const r = 2.5 + depth * 6;
    xo.fillStyle = `rgba(255,255,255,${0.35 + depth * 0.55})`;
    xo.fillRect(x, y, r, r);
  }
}
