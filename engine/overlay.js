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

function drawFrame(t) {
  const sh = SHOW.shots.find(s => t >= s.t0 && t < s.t1) || SHOW.shots[SHOW.shots.length - 1];
  const tl = t - sh.t0, S = new Scene();
  sh.build(S, tl, t);
  render3D(S, sh.cam(tl, sh.t1 - sh.t0), sh.env);
  // эффекты склейки и тряска от слэмов
  const first = sh === SHOW.shots[0], punch = first ? 0 : Math.max(0, 1 - tl / 0.2);
  let dx = 0, dy = 0;
  for (const sl of SHOW.slams || []) {
    const k = Math.max(0, 1 - (t - sl.t) / 0.28);
    if (t >= sl.t && k > 0) { dx += Math.sin(t * 97) * 16 * k; dy += Math.cos(t * 83) * 16 * k; }
  }
  composite({ zoom: 1.02 + 0.09 * punch * punch, dx, dy, bloom: sh.bloom, vignette: sh.vignette });
  if (!first && tl < 0.13) { xo.fillStyle = `rgba(255,255,255,${0.6 * (1 - tl / 0.13)})`; xo.fillRect(0, 0, OW, OH); }
  if (SHOW.plate) drawPlate(SHOW.plate, t);
  for (const sl of SHOW.slams || []) drawSlam(sl, t);
  if (SHOW.endCard) drawEndCard(SHOW.endCard, t);
  if (!SHOW.endCard || t < SHOW.endCard.t) drawSubs(SUBG, t);
  const fade = Math.max(1 - t / 0.12, (t - (SHOW.duration - 0.35)) / 0.35);
  if (fade > 0) { xo.fillStyle = `rgba(0,0,0,${Math.min(1, fade)})`; xo.fillRect(0, 0, OW, OH); }
}

window.renderFrame = (t, quality) => { drawFrame(t); return co.toDataURL('image/jpeg', quality || 0.93).slice(23); };
