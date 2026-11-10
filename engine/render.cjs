#!/usr/bin/env node
'use strict';
// Рендер показа в видео или контрольные кадры.
//   node engine/render.cjs --show <show.js> --words <words.json> --out <video.mp4>
//   node engine/render.cjs --show <show.js> --words <words.json> --stills 0.5,2.1 --outdir <dir>
//   ... --cover "4.2|НАЗВАНИЕ|ЧАСТЬ 1" --out cover.jpg
// --cutq убирает финальный кадр с вопросом (для длинной склейки).
// --show принимает несколько файлов через запятую; --shots <shots.json>, --plate и --footer уходят в show.js.
// Дополнительно: --meta <file.json> сохраняет длительность, склейки и удары для звука.
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const arg = n => { const i = process.argv.indexOf('--' + n); return i < 0 ? null : process.argv[i + 1]; };
const FPS = 30;

(async () => {
  const show = arg('show'), words = JSON.parse(fs.readFileSync(arg('words'), 'utf8'));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 400, height: 300 } });
  page.on('pageerror', e => { console.error('ошибка страницы:', e.message); process.exit(1); });
  await page.setContent('<html><body style="margin:0;background:#000"></body></html>');
  const shotsData = arg('shots') ? JSON.parse(fs.readFileSync(arg('shots'), 'utf8')) : null;
  await page.evaluate(([w, s, c]) => { window.WORDS = w; window.SHOTS = s; window.CFG = c; },
    [words, shotsData, { plate: arg('plate'), footer: arg('footer'), cutQuestion: process.argv.includes('--cutq') }]);
  for (const f of ['raster.js', 'world.js', 'scenes.js', 'overlay.js', 'show.js']) await page.addScriptTag({ path: path.join(__dirname, f) });
  for (const f of show.split(',')) await page.addScriptTag({ path: f });
  await page.evaluate(() => document.fonts.load('800 100px "Inter Display ExtraBold"'));
  const meta = await page.evaluate(() => { setShow(window.SHOW_DEF); const d = window.SHOW_DEF; return { duration: d.duration, cuts: d.cuts, hits: d.hits, bell: d.bell }; });
  if (arg('meta')) fs.writeFileSync(arg('meta'), JSON.stringify(meta));

  if (arg('cover')) {
    const [t, title, sub] = arg('cover').split('|');
    fs.writeFileSync(arg('out'), Buffer.from(await page.evaluate(([t, a, b]) => window.renderCover(t, a, b), [Number(t), title, sub]), 'base64'));
  } else if (arg('stills')) {
    const dir = arg('outdir'); fs.mkdirSync(dir, { recursive: true });
    for (const t of arg('stills').split(',').map(Number)) {
      const b64 = await page.evaluate(t => window.renderFrame(t, 0.9), t);
      fs.writeFileSync(path.join(dir, `t${t.toFixed(2)}.jpg`), Buffer.from(b64, 'base64'));
    }
  } else {
    const n = Math.round(meta.duration * FPS);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '17', '-preset', 'medium', arg('out')], { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let i = 0; i < n; i++) {
      const b64 = await page.evaluate(t => window.renderFrame(t), i / FPS);
      if (!ff.stdin.write(Buffer.from(b64, 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
      if (i % 60 === 0) console.log(`кадр ${i}/${n}, ${((Date.now() - t0) / 1000).toFixed(0)} с`);
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
    console.log(`готово: ${n} кадров, ${meta.duration.toFixed(2)} с`);
  }
  await browser.close();
})();
