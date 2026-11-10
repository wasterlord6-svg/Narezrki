'use strict';
// Тизер серии «3 минуты»: первые фразы части 1 и финальная карточка.
// window.WORDS = [{text,start,end}] в секундах, приходит из транскрипции озвучки.

(function () {
  const W = window.WORDS;
  // начало n-го слова, которое начинается с prefix
  const at = (prefix, n) => {
    let k = 0;
    for (const w of W) if (w.text.toLowerCase().replace(/[^a-zа-яё0-9]/gi, '').startsWith(prefix) && k++ === (n || 0)) return w.start;
    throw new Error('нет слова: ' + prefix);
  };
  const end = W[W.length - 1].end;
  const cB = at('и'), cC = at('за'), cD = at('25'), cD2 = at('чиню') - 0.05, cE = end + 0.3, dur = cE + 2.6;

  const shots = [
    { t0: 0, t1: cB, env: ENV_NIGHT, bloom: 0.55,
      build: (S, tl, t) => sceneStreet(S, t),
      cam: (tl, d) => ({ eye: [4.6 - tl * 0.5, 2.9, 9.4 - tl * 0.8], target: [0.3, 1.5, 0.2], fov: 60 }) },
    { t0: cB, t1: cC, env: ENV_OFFICE, bloom: 0.35, vignette: 0.7,
      build: (S, tl, t) => sceneOffice(S, t),
      cam: (tl, d) => ({ eye: [0.9, 2.05, 3.9 - tl * 1.2], target: [0.25, 1.75, -2.5], fov: 58 - 16 * smooth(tl / d) }) },
    { t0: cC, t1: cD, env: ENV_OFFICE, bloom: 0.2, vignette: 0.75,
      build: (S, tl, t) => { const d = cD - cC; sceneOffice(S, t, { clock: { h: 3, m: 12 + Math.min(3, Math.floor(tl / (d / 4))) }, noHero: true }); },
      cam: (tl, d) => ({ eye: [-2.4 + 0.5, 3.0, 1.6 - tl * 0.5], target: [-2.4, 3.3, -3.94], fov: 50 }) },
    { t0: cD, t1: cD2, env: ENV_DAY, bloom: 0.3, vignette: 0.45,
      build: (S, tl, t) => sceneYard(S, t),
      cam: (tl, d) => ({ eye: [3 - tl * 1.2, 6.2, 15 - tl * 0.8], target: [0, 1.0, 0.5], fov: 62 }) },
    { t0: cD2, t1: cE, env: ENV_DAY, bloom: 0.3, vignette: 0.45,
      build: (S, tl, t) => sceneYard(S, t),
      cam: (tl, d) => ({ eye: [1.6 - tl * 0.3, 1.95, 9.6 - tl * 0.25], target: [0, 1.6, 6.2], fov: 44 }) },
    { t0: cE, t1: dur, env: ENV_NIGHT, bloom: 0.55,
      build: (S, tl, t) => sceneStreet(S, t),
      cam: (tl, d) => ({ eye: [-4 + tl * 0.5, 3.6, 10.5], target: [0, 1.2, 0], fov: 62 }) },
  ];

  const slams = [
    { t: at('20'), dur: cB - at('20') - 0.02, text: '20 ЧАСОВ', y: 540 },
    { t: at('уволили'), dur: cC - at('уволили') - 0.02, text: 'УВОЛЕН?', y: 520, color: '#ff3b30', rot: 0.05 },
    { t: at('3'), dur: cD - at('3') - 0.02, text: '3 МИНУТЫ', y: 500, rot: 0.03 },
    { t: at('25'), dur: cD2 - at('25') - 0.02, text: '25 ЛЕТ', y: 520 },
    { t: at('водоканал'), dur: cE - at('водоканал') - 0.02, text: 'ВОДОКАНАЛ', y: 400, color: '#4fc3ff', rot: 0.03, size: 160 },
  ];

  window.SHOW_DEF = { duration: dur, shots, slams, words: W, plate: 'ИСТОРИЯ С REDDIT',
    endCard: { t: cE + 0.25, title: '3 МИНУТЫ', sub: 'ЧАСТЬ 1 · СКОРО' },
    cuts: shots.slice(1).map(s => s.t0), hits: slams.map(s => s.t), bell: cE + 0.25 };
})();
