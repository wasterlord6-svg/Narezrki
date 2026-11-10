'use strict';
// Кадры серии «3 минуты». Ключ — id из разметки partN.txt.
// build(S, tl, t, d): tl — время от начала кадра, t — время ролика, d — длина кадра.

(function () {
  const N = { env: ENV_NIGHT, bloom: 0.55 }, D = { env: ENV_DAY, bloom: 0.3, vignette: 0.45 };
  const O = { env: ENV_OFFICE, bloom: 0.35, vignette: 0.7 };
  const BOSS_DESK = { x: 0.25, z: -2.5, yaw: 0 };
  const DIR = { x: 0, y: -0.28, z: -2.5, yaw: 0, noShadow: true };
  const mk = (base, build, cam, extra) => Object.assign({}, base, { build, cam }, extra || {});

  const P = {
    // ---- ночная улица
    street_dig: mk(N, (S, tl, t) => sceneStreet(S, t),
      (tl) => ({ eye: [4.6 - tl * 0.5, 2.9, 9.4 - tl * 0.8], target: [0.3, 2.1, 0.2], fov: 60 })),
    street_dig2: mk(N, (S, tl, t) => sceneStreet(S, t, { water: false }),
      (tl) => ({ eye: [2.9, 1.3, 4.6 - tl * 0.3], target: [-0.3, 1.7, 0.4], fov: 55 })),
    street_wide: mk(N, (S, tl, t) => sceneStreet(S, t),
      (tl) => ({ eye: [-6 + tl * 0.7, 6.5, 12], target: [0, 2.6, -1], fov: 62 })),
    street_leave: mk(N, (S, tl, t, d) => sceneStreet(S, t, { water: false, shovel: true, hero: { path: [0.4, 2.2, -3.4, -0.4], k: tl / d } }),
      (tl) => ({ eye: [3.8, 2.3, 8.2], target: [-1.0, 2.0, 0.6], fov: 56 })),
    duty_crew: mk(N, (S, tl, t) => sceneStreet(S, t, { hero: false, crew: true }),
      (tl) => ({ eye: [4.4, 2.7, 8.6 - tl * 0.5], target: [0.3, 2.0, 0.3], fov: 58 })),
    duty_crew2: mk(N, (S, tl, t) => sceneStreet(S, t, { hero: false, crew: true }),
      (tl) => ({ eye: [-4.8 + tl * 0.4, 3.4, 7.8], target: [0.6, 2.0, 0], fov: 58 })),
    // ---- та же улица днём
    day_dig_leave: mk(D, (S, tl, t, d) => sceneStreet(S, t, tl < 0.55
        ? { day: true, water: false }
        : { day: true, water: false, shovel: true, hero: { path: [1.2, 1.8, 4.6, 3.6], k: (tl - 0.55) / d } }),
      (tl) => ({ eye: [4.8, 2.7, 9.2], target: [0.9, 2.1, 0.8], fov: 60 })),
    pit_empty: mk(D, (S, tl, t) => sceneStreet(S, t, { day: true, water: false, hero: false, mate: false, shovel: true }),
      (tl) => ({ eye: [3.4, 1.6, 5.6 - tl * 0.4], target: [0.6, 1.5, 0.4], fov: 55 })),
    pit_empty2: mk(D, (S, tl, t) => sceneStreet(S, t, { day: true, water: false, hero: false, mate: false, shovel: true }),
      (tl) => ({ eye: [-3.6 + tl * 0.5, 3.8, 7.2], target: [0.6, 1.9, 0], fov: 55 })),
    day_dig: mk(D, (S, tl, t) => sceneStreet(S, t, { day: true, water: false }),
      (tl) => ({ eye: [3.2, 1.5, 5.0 - tl * 0.3], target: [-0.3, 1.8, 0.4], fov: 55 })),
    // ---- кабинет начальника
    boss_point: mk(O, (S, tl, t) => sceneOffice(S, t),
      (tl, d) => ({ eye: [0.9, 2.05, 3.9 - tl * 1.2], target: [0.25, 2.15, -2.5], fov: 58 - 16 * smooth(tl / d) })),
    boss_point2: mk(O, (S, tl, t) => sceneOffice(S, t, { noHero: true }),
      (tl) => ({ eye: [0.8, 1.95, 1.6 - tl * 0.25], target: [0.25, 1.95, -2.5], fov: 44 })),
    boss_angry: mk(O, (S, tl, t) => sceneOffice(S, t, { noHero: true, boss: Object.assign({ pose: 'angry' }, BOSS_DESK) }),
      (tl) => ({ eye: [-0.4, 1.9, 1.4 - tl * 0.2], target: [0.25, 1.95, -2.5], fov: 42 })),
    boss_window: mk(O, (S, tl, t) => sceneOffice(S, t, { noHero: true, boss: { x: 2.2, z: -2.6, yaw: -1.9, pose: 'angry' } }),
      (tl) => ({ eye: [-2.6 + tl * 0.2, 2.1, -1.2], target: [2.2, 2.0, -2.6], fov: 46 })),
    boss_walk: mk(O, (S, tl, t, d) => sceneOffice(S, t, { noHero: true, boss: { path: [1.6, -2.6, -1.4, 1.2], k: tl / d } }),
      (tl) => ({ eye: [3.4, 2.6, 5.0], target: [-0.6, 2.0, 0.2], fov: 60 })),
    office_enter: mk(O, (S, tl, t, d) => sceneOffice(S, t, { boss: Object.assign({ pose: 'angry' }, BOSS_DESK), hero: { path: [2.6, 5.4, -0.7, 1.9], k: tl / (d * 0.85) } }),
      (tl) => ({ eye: [-3.6, 2.7, 4.6], target: [0.3, 2.0, -0.4], fov: 60 })),
    hero_office: mk(O, (S, tl, t) => sceneOffice(S, t, { noBoss: true, hero: { x: -0.7, z: 1.9, yaw: Math.PI, pose: 'look' } }),
      (tl) => ({ eye: [0.6, 2.0, -2.4 + tl * 0.15], target: [-0.7, 1.8, 1.9], fov: 44 })),
    hero_office_nod: mk(O, (S, tl, t) => sceneOffice(S, t, { noBoss: true, hero: { x: -0.7, z: 1.9, yaw: Math.PI, pose: 'nod' } }),
      (tl) => ({ eye: [-1.7, 1.95, -1.7], target: [-0.7, 1.8, 1.9], fov: 38 })),
    clock: mk(O, (S, tl, t, d) => sceneOffice(S, t, { noHero: true, clock: { h: 3, m: 12 + Math.min(3, Math.floor(tl / (d / 4))) } }),
      (tl) => ({ eye: [-1.9, 3.0, 1.6 - tl * 0.5], target: [-2.4, 3.7, -3.94], fov: 50 }), { bloom: 0.2 }),
    clock2: mk(O, (S, tl, t) => sceneOffice(S, t, { noHero: true, clock: { h: 7, m: 30 } }),
      (tl) => ({ eye: [-2.9, 3.0, 2.0 - tl * 0.6], target: [-2.4, 3.7, -3.94], fov: 50 }), { bloom: 0.2 }),
    // ---- кабинет руководства
    mgmt_rant: mk(O, (S, tl, t) => sceneOffice(S, t, { mgmt: true, noHero: true, director: DIR, boss: { x: -1.2, z: 0.6, yaw: 2.77, pose: 'rant' } }),
      (tl) => ({ eye: [3.0 - tl * 0.3, 2.3, 4.6], target: [-0.9, 1.9, -0.4], fov: 58 })),
    mgmt_door: mk(O, (S, tl, t) => sceneOffice(S, t, { mgmt: true, noHero: true, director: DIR, boss: { x: 0.9, z: 0.4, yaw: 2.9, pose: 'rant' } }),
      (tl) => ({ eye: [-0.4, 2.2, 4.6 + tl * 0.35], target: [0.2, 2.0, -2], fov: 50 })),
    mgmt_hero: mk(O, (S, tl, t) => sceneOffice(S, t, { mgmt: true, noBoss: true, hero: { x: 0.6, z: 1.2, yaw: Math.PI, pose: 'talk' } }),
      (tl) => ({ eye: [-0.7, 2.0, -2.7 + tl * 0.15], target: [0.6, 1.8, 1.2], fov: 44 })),
    mgmt_turn: mk(O, (S, tl, t) => sceneOffice(S, t, { mgmt: true, director: Object.assign({ headYaw: -0.8 * smooth(tl / 0.35) }, DIR),
        boss: { x: -1.7, z: 0.4, yaw: 2.6, pose: 'shrink' }, hero: { x: 1.2, z: 0.9, yaw: Math.PI } }),
      (tl) => ({ eye: [0.4 - tl * 0.2, 2.7, 5.6], target: [-0.2, 1.8, -0.8], fov: 60 })),
    // ---- двор
    yard_wide: mk(D, (S, tl, t) => sceneYard(S, t),
      (tl) => ({ eye: [3 - tl * 1.2, 6.2, 15 - tl * 0.8], target: [0, 2.6, 0.5], fov: 62 })),
    hero_close: mk(D, (S, tl, t) => sceneYard(S, t),
      (tl) => ({ eye: [1.6 - tl * 0.3, 1.95, 9.6 - tl * 0.25], target: [0, 2.05, 6.2], fov: 44 }), { slamY: 400 }),
    yard_hero_walk: mk(D, (S, tl, t, d) => sceneYard(S, t, { hero: { path: [0, -1, 0, 8.5], k: tl / d } }),
      (tl) => ({ eye: [1.2, 1.8, 12.5], target: [0, 2.1, 3], fov: 46 })),
    boss_box: mk(D, (S, tl, t, d) => sceneYard(S, t, { noHero: true, boss: { path: [-3.5, 3, 2.5, 9.5], k: tl / d, pose: 'box' } }),
      (tl) => ({ eye: [3.2, 2.1, 13], target: [0, 2.1, 6], fov: 48 })),
    gate_morning: mk(D, (S, tl, t, d) => sceneYard(S, t, { gate: true, hero: { path: [0, 14.5, 0, 8], k: tl / d } }),
      (tl) => ({ eye: [1.6, 2.2, 3.4], target: [0, 2.5, 10], fov: 56 })),
    gate_morning2: mk(D, (S, tl, t, d) => sceneYard(S, t, { gate: true, hero: { path: [0, 14.5, 0, 7.5], k: tl / d },
        boss: { x: 2.3, z: 7.6, yaw: -2.2, pose: 'angry' } }),
      (tl) => ({ eye: [1.1, 2.2, 2.4], target: [1.1, 2.3, 9], fov: 58 })),
    gate_early: mk({ env: ENV_DAWN, bloom: 0.4, vignette: 0.5 }, (S, tl, t) => sceneYard(S, t, { gate: true, crowd: false, hero: { x: 0, z: 7.6, yaw: Math.PI, pose: 'look' } }),
      (tl) => ({ eye: [1.8 - tl * 0.3, 2.2, 1.6], target: [0, 2.4, 10], fov: 56 })),
    gate_group: mk(D, (S, tl, t) => sceneYard(S, t, { gate: true, group: true, hero: { x: 0, z: 7.4, yaw: Math.PI } }),
      (tl) => ({ eye: [0.8, 2.2, 2.2 + tl * 0.3], target: [0, 2.4, 8], fov: 58 })),
  };

  // ---- карточки поверх сцены
  const card = (base, card) => Object.assign({}, base, { card });
  P.board_1730 = card(P.yard_wide, { type: 'board', head: 'МОЙ ГРАФИК', big: 'ДО 17:30' });
  P.board_0315 = card(P.street_wide, { type: 'board', head: 'КОНЕЦ СМЕНЫ', big: '03:15' });
  P.board_sched = card(P.yard_wide, { type: 'board', head: 'ГРАФИК', big: '07:30–17:30' });
  P.screen_log = card(P.boss_angry, { type: 'log', head: 'СИСТЕМА УЧЁТА',
    rows: [['ПРИХОД', 'ПТ 07:30', 0], ['УХОД', 'СБ 03:12', 0], ['КОНЕЦ СМЕНЫ', 'СБ 03:15', 0], ['ОТКЛОНЕНИЕ', '−3 МИН', 1]] });
  P.call_list = card(P.street_wide, { type: 'list', head: 'ЭКСТРЕННЫЕ ВЫЗОВЫ', rows: ['БРИГАДА 1', 'БРИГАДА 2', 'Я, 25 ЛЕТ СТАЖА', 'БРИГАДА 4'], strike: 2 });
  P.counter = card(P.yard_wide, { type: 'counter', head: 'ЗАЯВОК В ДЕНЬ', from: 7, to: 4 });
  P.chart = card(P.boss_angry, { type: 'chart', head: 'ПРЕМИЯ НАЧАЛЬНИКА' });
  P.question = card(P.hero_close, { type: 'question' });

  window.PRESETS = P;
  window.buildShow(P, window.CFG || {});
})();
