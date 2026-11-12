'use strict';
// Кадры серии «Новый хозяин». Зима: снег на всех уличных локациях.
(function () {
  setWinter(true);
  const ENV_WINTER = { skyTop: [0.36, 0.44, 0.58], skyBot: [0.72, 0.77, 0.86], fog: [0.72, 0.77, 0.86], fogK: 0.007,
    amb: [0.48, 0.5, 0.57], sunDir: [0.3, 0.8, 0.5], sunCol: [0.4, 0.4, 0.44] };
  const W = { env: ENV_WINTER, bloom: 0.18, vignette: 0.5, snow: true };
  const O = { env: ENV_OFFICE, bloom: 0.35, vignette: 0.7 };
  const F = { env: Object.assign({}, ENV_OFFICE, { skyTop: [0.35, 0.37, 0.4], skyBot: [0.35, 0.37, 0.4] }), bloom: 0.3, vignette: 0.6 };
  const WH = { env: ENV_OFFICE, bloom: 0.35, vignette: 0.6 };
  const mk = (base, build, cam, extra) => Object.assign({}, base, { build, cam }, extra || {});
  const BOB_DESK = { x: 0.25, z: -2.5, yaw: 0 };
  const off = (o) => Object.assign({ mgmt: true, bossLook: BOB, heroLook: HERO2 }, o);

  const P = {
    // ---- кабинет Боба
    bob_point: mk(O, (S, tl, t) => sceneOffice(S, t, off({ noHero: true, boss: Object.assign({ pose: 'point' }, BOB_DESK) })),
      (tl, d) => ({ eye: [0.8, 1.95, 2.2 - tl * 0.5], target: [0.25, 2.0, -2.5], fov: 50 - 10 * smooth(tl / d) })),
    bob_close: mk(O, (S, tl, t) => sceneOffice(S, t, off({ noHero: true, boss: Object.assign({ pose: 'talk' }, BOB_DESK) })),
      (tl) => ({ eye: [0.4, 2.1, 0.2 - tl * 0.2], target: [0.25, 2.15, -2.5], fov: 36 })),
    bob_shrug: mk(O, (S, tl, t) => sceneOffice(S, t, off({ boss: Object.assign({ pose: 'shrug' }, BOB_DESK), hero: { x: -0.6, z: 1.6, yaw: Math.PI } })),
      (tl) => ({ eye: [1.0, 2.3, 3.0 - tl * 0.2], target: [0.25, 2.0, -2.5], fov: 44 })),
    bob_wave: mk(O, (S, tl, t) => sceneOffice(S, t, off({ noHero: true, boss: Object.assign({ pose: 'wave' }, BOB_DESK) })),
      (tl) => ({ eye: [1.2, 2.0, 1.2 - tl * 0.2], target: [0.25, 2.1, -2.5], fov: 42 })),
    bob_lean: mk(O, (S, tl, t) => sceneOffice(S, t, off({ noHero: true, boss: Object.assign({ pose: 'shrug' }, BOB_DESK) })),
      (tl) => ({ eye: [-0.9, 2.0, 1.0 - tl * 0.25], target: [0.25, 2.1, -2.5], fov: 42 })),
    bob_phone: mk(O, (S, tl, t) => sceneOffice(S, t, off({ noHero: true, boss: { x: 1.8, z: -2.5, yaw: -0.5, pose: 'phone' } })),
      (tl) => ({ eye: [-0.8 + tl * 0.2, 2.1, 1.4], target: [1.8, 2.1, -2.5], fov: 44 })),
    bob_alone: mk(Object.assign({}, O, { vignette: 0.85 }), (S, tl, t) => sceneOffice(S, t, off({ noHero: true, boss: Object.assign({ pose: 'slump' }, BOB_DESK) })),
      (tl) => ({ eye: [2.6 - tl * 0.25, 3.4, 4.2], target: [0.25, 1.6, -2.4], fov: 56 })),
    friend_office: mk(O, (S, tl, t) => sceneOffice(S, t, off({ heroLook: FRIEND, boss: Object.assign({ pose: 'leanback' }, BOB_DESK), hero: { x: -0.4, z: 1.4, yaw: Math.PI, pose: 'talk' } })),
      (tl) => ({ eye: [2.2, 2.3, 3.8 - tl * 0.3], target: [-0.1, 1.9, -0.6], fov: 54 })),
    handshake: mk(O, (S, tl, t) => sceneOffice(S, t, off({ papers: 3, heroLook: FRIEND, boss: { x: 0.45, z: -0.1, yaw: -1.57, pose: 'shake' }, hero: { x: -0.75, z: -0.1, yaw: 1.57, pose: 'shake' } })),
      (tl) => ({ eye: [-0.1, 2.3, 3.6 - tl * 0.35], target: [-0.15, 1.8, -0.2], fov: 50 })),
    hero_nod: mk(O, (S, tl, t) => sceneOffice(S, t, off({ noBoss: true, hero: { x: -0.6, z: 1.6, yaw: Math.PI, pose: 'nod' } })),
      (tl) => ({ eye: [0.2, 2.0, -1.8 + tl * 0.15], target: [-0.6, 1.85, 1.6], fov: 40 })),
    lawyer: mk(O, (S, tl, t) => sceneOffice(S, t, off({ papers: 7, bossLook: LAWYER, noHero: true, boss: Object.assign({ pose: 'talk' }, BOB_DESK) })),
      (tl) => ({ eye: [1.4, 2.4, 2.4 - tl * 0.3], target: [0.2, 1.6, -1.8], fov: 48 })),
    hero_lawyer: mk(O, (S, tl, t) => sceneOffice(S, t, off({ papers: 4, bossLook: LAWYER, boss: Object.assign({ pose: 'talk' }, BOB_DESK), hero: { x: 0.9, z: 0.9, yaw: 3.0, pose: 'talk' } })),
      (tl) => ({ eye: [-2.2 + tl * 0.2, 2.4, 3.6], target: [0.4, 1.9, -0.7], fov: 52 })),
    // ---- цех
    shop_run: mk(F, (S, tl, t) => sceneShop(S, t),
      (tl) => ({ eye: [0.3, 4.2, 9.5 - tl * 0.8], target: [0, 1.2, -2.5], fov: 66 })),
    shop_friend: mk(F, (S, tl, t) => sceneShop(S, t, { friend: { x: -1.0, z: 3.4, yaw: 0.5, pose: 'talk' }, hero: { x: 0.4, z: 3.9, yaw: -2.4, pose: 'look' } }),
      (tl) => ({ eye: [-1.2 + tl * 0.2, 2.2, 8.6], target: [-0.3, 2.0, 3.5], fov: 46 })),
    shop_dark: mk(Object.assign({}, F, { bloom: 0.25, vignette: 0.85 }), (S, tl, t) => sceneShop(S, t, { dark: true }),
      (tl) => ({ eye: [0.3, 4.2, 8.5 - tl * 0.5], target: [0, 1.2, -3], fov: 66 })),
    machine_close: mk(F, (S, tl, t) => sceneShop(S, t, { workers: [] }),
      (tl) => ({ eye: [0.2, 2.7, 2.2 - tl * 0.3], target: [-3.3, 1.5, -3.2], fov: 56 })),
    shop_workers: mk(F, (S, tl, t) => sceneShop(S, t, { workers: [[-1.2, 1, 0.4, 'shrug'], [0.8, 1.4, -0.4, 'look'], [-0.2, -0.2, 0.1, 'talk']] }),
      (tl) => ({ eye: [0.6, 2.3, 6.5 - tl * 0.3], target: [-0.2, 1.8, 0.6], fov: 52 })),
    machine_stop: mk(F, (S, tl, t, d) => sceneShop(S, t, { workers: [], off: tl > d * 0.35 ? 1 : 0 }),
      (tl) => ({ eye: [-0.1, 2.5, -0.6 - tl * 0.3], target: [-3.3, 1.8, -5], fov: 50 })),
    shop_off: mk(F, (S, tl, t) => sceneShop(S, t, { off: 1 }),
      (tl) => ({ eye: [1.5 - tl * 0.4, 4.6, 9], target: [0, 1.2, -2.5], fov: 66 })),
    shop_open: mk(F, (S, tl, t) => sceneShop(S, t, { off: 1, open: [0, 3], workers: [[-1.5, -5.7, -1.2, 'shrug'], [-1.3, -4.2, -1.9, 'look']] }),
      (tl) => ({ eye: [1.2, 2.4, -1.0 - tl * 0.2], target: [-2.6, 1.4, -5], fov: 52 })),
    // ---- склад
    wh_fill: mk(WH, (S, tl, t, d) => sceneWarehouse(S, t, { stock: 0.3 + 0.6 * smooth(tl / d), forklift: 2.5 - tl * 0.6, manager: { x: -1.5, z: 3, yaw: 2.8, pose: 'look' } }),
      (tl) => ({ eye: [3.5, 3.4, 9.5 - tl * 0.4], target: [0, 2.2, -2], fov: 58 })),
    wh_full: mk(WH, (S, tl, t) => sceneWarehouse(S, t, { stock: 1 }),
      (tl) => ({ eye: [-3.5 + tl * 0.5, 2.8, 8.5], target: [0, 2.4, -2.5], fov: 58 })),
    wh_drain: mk(WH, (S, tl, t, d) => sceneWarehouse(S, t, { stock: 0.75 - 0.6 * smooth(tl / d), forklift: 1 + tl * 0.8, manager: { x: -1.5, z: 3, yaw: 2.8, pose: 'shrug' } }),
      (tl) => ({ eye: [3.5, 3.4, 9.5 - tl * 0.4], target: [0, 2.2, -2], fov: 58 })),
    wh_empty: mk(Object.assign({}, WH, { vignette: 0.8 }), (S, tl, t) => sceneWarehouse(S, t, { stock: 0, forklift: 5.5, manager: { x: 0.2, z: 2.4, yaw: 3.1, pose: 'slump' } }),
      (tl) => ({ eye: [0.3, 2.4, 8.5 - tl * 0.5], target: [0, 2.0, -2.5], fov: 56 })),
    // ---- двор цеха в снегу
    lot_wide: mk(W, (S, tl, t) => sceneLot(S, t, { crowd: true }),
      (tl) => ({ eye: [-4 + tl * 0.7, 4.6, 8.4], target: [0, 2.6, -7], fov: 64 })),
    hero_leave: mk(W, (S, tl, t, d) => sceneLot(S, t, { hero: { path: [-1, -2.5, -0.4, 7], k: tl / d } }),
      (tl) => ({ eye: [1.2, 2.3, 11], target: [-0.6, 1.9, 2.5], fov: 46 })),
    truck_load: mk(W, (S, tl, t) => sceneLot(S, t, { crowd: true, truck: 0 }),
      (tl) => ({ eye: [8 - tl * 0.4, 3.4, 6.5], target: [1.8, 2.0, -4], fov: 56 })),
    truck_away: mk(W, (S, tl, t, d) => sceneLot(S, t, { truck: smooth(tl / d) }),
      (tl) => ({ eye: [-5.5, 3.6, 15], target: [1.8, 2.0, -0.5], fov: 54 })),
    workers_leave: mk(W, (S, tl, t, d) => sceneLot(S, t, { truck: false, leaving: tl / d * 1.2 }),
      (tl) => ({ eye: [3.2, 2.6, 15.5], target: [-1, 2.0, 3], fov: 56 })),
    hero_phone: mk(W, (S, tl, t) => sceneLot(S, t, { truck: false, hero: { x: 1.2, z: 11.5, yaw: 0.15, pose: 'phone' } }),
      (tl) => ({ eye: [3.0, 2.2, 15.2 - tl * 0.3], target: [1.2, 2.1, 11.5], fov: 40 })),
    hero_close: mk(W, (S, tl, t) => sceneLot(S, t, { truck: false, hero: { x: 0, z: 10.8, yaw: 0.05, pose: 'talk' } }),
      (tl) => ({ eye: [0.4 - tl * 0.1, 2.15, 14.4 - tl * 0.15], target: [0, 2.1, 10.8], fov: 40 })),
    gift: mk(W, (S, tl, t) => sceneLot(S, t, { truck: false, hero: { x: -0.85, z: 11, yaw: 1.05, pose: 'give' }, friend: { x: 0.85, z: 11, yaw: -1.05, pose: 'look' }, gift: [0, 1.25, 11.25] }),
      (tl) => ({ eye: [0.4, 2.0, 15 - tl * 0.25], target: [0, 1.7, 10.7], fov: 44 })),
    friend_snow: mk(W, (S, tl, t) => sceneLot(S, t, { truck: false, friend: { x: 0, z: 10.8, yaw: -0.05, pose: 'nod' } }),
      (tl) => ({ eye: [-0.4, 2.15, 14.4 - tl * 0.15], target: [0, 2.1, 10.8], fov: 40 })),
  };

  // ---- карточки
  const card = (base, c) => Object.assign({}, base, { card: c });
  P.offer = card(P.bob_close, { type: 'offer', head: 'УСЛОВИЕ БОБА', rows: [['− ЗАРПЛАТА', '#c0241c'], ['− СОЦПАКЕТ', '#c0241c'], ['ИЛИ УВОЛЕН', '#222']] });
  P.patents = card(P.shop_run, { type: 'docs', docs: [{ title: 'ПАТЕНТ 1' }, { title: 'ПАТЕНТ 2' }] });
  P.contract = card(P.lot_wide, { type: 'board', head: 'МОЙ КОНТРАКТ', big: 'ИСТЕКАЕТ' });
  P.machines = card(P.shop_off, { type: 'board', head: 'РАБОТАЕТ СТАНКОВ', big: '2/3' });
  P.question = card(P.hero_close, { type: 'question' });
  P.question_shop = card(P.shop_run, { type: 'question' });

  window.PRESETS = P;
  window.buildShow(P, window.CFG || {});
})();
