#!/usr/bin/env python3
"""Отрезает «фразу-жертву» в конце озвучки и проверяет, что голос договорил.

voice_tail.py <in.wav> <stt_in.json> <out.wav> <stt_out.json>

Speko/ElevenLabs обрывает последнее слово озвучки на середине. Поэтому в конец
текста дописывается « [pause] Вот так.»: основная фраза договаривается целиком,
после неё идёт пауза, обрывается уже только «Вот так». По транскрипции находится
начало «Вот так», режется в паузе перед ним (остаётся 0,25 с тишины), слова
жертвы выкидываются из транскрипции. Если жертвы в транскрипции нет, перед ней
нет паузы или в конце результата звучит голос — ошибка, собирать дальше нельзя.
"""
import json, re, sys, wave
import numpy as np

SACRIFICE = ["вот", "так"]
src, stt_in, dst, stt_out = sys.argv[1:5]
w = wave.open(src); sr, ch = w.getframerate(), w.getnchannels()
a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
if ch > 1:
    a = a.reshape(-1, ch).mean(axis=1)
d = json.load(open(stt_in, encoding="utf8"))
words = d["words"] if isinstance(d, dict) else d
norm = lambda s: re.sub(r"[^а-яё]", "", s.lower())
tail = [norm(x["text"]) for x in words[-2:]]
if tail != SACRIFICE:
    sys.exit(f"ОШИБКА {src}: в конце транскрипции нет фразы-жертвы «Вот так» ({tail}) — проверь текст озвучки")
sac = words[-2]["start_ms"] / 1000
prev_end = words[-3]["end_ms"] / 1000

hop = int(sr * 0.01)
env = np.array([np.sqrt(np.mean(a[i:i + hop] ** 2)) for i in range(0, len(a) - hop, hop)])
quiet = env < 0.01
# самая длинная тихая полоса между концом последнего настоящего слова и началом жертвы (с запасом)
lo, hi = int((prev_end - 0.2) / 0.01), int((sac + 0.2) / 0.01)
best, k = None, lo
while k < hi:
    if quiet[k]:
        j = k
        while j < len(quiet) and quiet[j]:
            j += 1
        if best is None or j - k > best[1] - best[0]:
            best = (k, j)
        k = j
    else:
        k += 1
if best is None or (best[1] - best[0]) * 0.01 < 0.3:
    sys.exit(f"ОШИБКА {src}: перед «Вот так» нет паузы, голос мог оборваться — переозвучить")
s0 = best[0] * 0.01
cut = s0 + 0.25
out = a[:int(cut * sr)].copy()
fade = int(sr * 0.03)
out[-fade:] *= np.linspace(1, 0, fade)
loud = np.sqrt(np.mean(a[int((cut - 0.15) * sr):int(cut * sr)] ** 2))
if loud > 0.01:
    sys.exit(f"ОШИБКА {src}: в последних 150 мс громкость {loud:.3f}, голос не договорил")
o = wave.open(dst, "w"); o.setnchannels(1); o.setsampwidth(2); o.setframerate(sr)
o.writeframes((np.clip(out, -1, 1) * 32767).astype(np.int16).tobytes()); o.close()
keep = words[:-2]
json.dump({"words": keep}, open(stt_out, "w", encoding="utf8"), ensure_ascii=False)
print(f"{src}: было {len(a)/sr:.2f} с, режу на {cut:.2f} с, жертва с {sac:.2f} с; "
      f"последнее слово «{keep[-1]['text']}» до {keep[-1]['end_ms']/1000:.2f} с, громкость хвоста {loud:.4f}")
