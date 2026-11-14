'use strict';
// Собирает показ из разметки: window.SHOTS = [{t, id, slam}] (из tools/align.py),
// window.WORDS — слова с таймингами, presets — словарь кадров серии.
window.buildShow = function (presets, cfg) {
  let W = window.WORDS, SH = window.SHOTS, dur = W[W.length - 1].end + (cfg.tail || 1.3);
  // для длинной склейки: без финального кадра с вопросом
  if (cfg.cutQuestion) { dur = SH[SH.length - 1].t - 0.08; SH = SH.slice(0, -1); W = W.filter(w => w.start < dur); }
  const shots = SH.map((s, i) => {
    const p = presets[s.id];
    if (!p) throw new Error('нет пресета кадра: ' + s.id);
    let card = p.card;
    if (card && card.type === 'question') card = Object.assign({}, card, { lines: s.slam.split('/'), footer: cfg.footer });
    return Object.assign({}, p, { id: s.id, card, t0: i ? Math.max(0, s.t - 0.05) : 0, t1: i + 1 < SH.length ? SH[i + 1].t - 0.05 : dur });
  });
  const slams = [];
  SH.forEach((s, i) => {
    if (!s.slam || presets[s.id].card) return;
    const sh = shots[i], t = sh.t0 + 0.12;
    slams.push({ t, dur: Math.min(sh.t1 - t - 0.02, 2.4), text: s.slam, y: presets[s.id].slamY || 520,
      color: /УВОЛЕН|БУНТ/.test(s.slam) ? '#ff3b30' : undefined, rot: i % 2 ? 0.04 : -0.04 });
  });
  window.SHOW_DEF = { duration: dur, shots, slams, words: W, plate: cfg.plate, paper: shots.some(x => x.paint), slamBg: presets._slamBg, slamFg: presets._slamFg,
    cuts: shots.slice(1).map(s => s.t0), hits: slams.map(s => s.t), bell: cfg.cutQuestion ? null : shots[shots.length - 1].t0 };
};
