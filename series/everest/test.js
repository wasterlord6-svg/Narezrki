'use strict';
(function () {
  const PR = {
    wide: { vignette: 0.4, paint: (P, tl, t, d) => evWide(P, tl, { sky: 'dawn', sun: true, cloudsBack: true, cam: { x: tl * 20, zoom: 1 + tl * 0.02 },
      climbers: [{ x: 420, y: 1600, s: 0.9, walk: tl * 5, coat: '#7a5232', hatCol: '#b03a2e', pack: true, axe: true },
                 { x: 600, y: 1590, s: 0.9, walk: tl * 5 + 1.5, coat: '#5a6a3a', hatCol: '#2e5a8a', oxygen: true, axe: true, goggles: true }] }) },
    storm: { vignette: 0.55, paint: (P, tl, t, d) => evWide(P, tl, { sky: 'storm', clouds: Math.min(1, tl / 2), snow: 90, cam: { zoom: 1.05 } }) },
    close: { vignette: 0.45, paint: (P, tl, t, d) => { evWide(P, tl, { sky: 'day', cam: { x: 0, y: 260, zoom: 1.6 } });
      P.person({ x: 470, y: 1650, s: 3.2, walk: tl * 4, coat: '#7a5232', hatCol: '#b03a2e', pack: true, axe: true, seed: 5 }); P.snow(tl, 50); } },
  };
  window.buildShow(PR, window.CFG || {});
})();
