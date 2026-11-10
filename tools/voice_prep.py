#!/usr/bin/env python3
"""Ужимает паузы в озвучке и пересчитывает тайминги слов.

voice_prep.py <voice.wav> <stt.json> <out.wav> <words.json> [макс_пауза_с]

Границы пауз берутся по реальной тишине в сигнале рядом с границами слов из
транскрипции (у неё шаг 100 мс), поэтому слова не обрезаются.
"""
import json, sys, wave
import numpy as np

src, stt, out_wav, out_words = sys.argv[1:5]
max_gap = float(sys.argv[5]) if len(sys.argv) > 5 else 0.22

w = wave.open(src)
sr, ch = w.getframerate(), w.getnchannels()
a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
if ch > 1:
    a = a.reshape(-1, ch).mean(axis=1)
words = [dict(text=x["text"], start=x["start_ms"] / 1000, end=x["end_ms"] / 1000) for x in json.load(open(stt))["words"]]

# огибающая громкости, окно 10 мс
hop = int(sr * 0.01)
env = np.array([np.sqrt(np.mean(a[i:i + hop] ** 2)) for i in range(0, len(a) - hop, hop)])
quiet = env < max(0.012, env.max() * 0.04)

cuts = []  # (с, по) в секундах: что вырезать
for i in range(len(words) - 1):
    g0, g1 = words[i]["end"], words[i + 1]["start"]
    if g1 - g0 < max_gap + 0.1:
        continue
    lo, hi = int((g0 - 0.15) / 0.01), int((g1 + 0.15) / 0.01)
    idx = [k for k in range(max(lo, 0), min(hi, len(quiet))) if quiet[k]]
    if not idx:
        continue
    # самый длинный непрерывный тихий участок
    best, cur = [], [idx[0]]
    for k in idx[1:]:
        if k == cur[-1] + 1:
            cur.append(k)
        else:
            best = max(best, cur, key=len); cur = [k]
    best = max(best, cur, key=len)
    s0, s1 = best[0] * 0.01, (best[-1] + 1) * 0.01
    if s1 - s0 > max_gap:
        keep = max_gap / 2
        cuts.append((s0 + keep, s1 - keep))

pieces, pos, fade = [], 0.0, int(sr * 0.004)
for c0, c1 in cuts:
    seg = a[int(pos * sr):int(c0 * sr)].copy()
    seg[-fade:] *= np.linspace(1, 0, fade)
    pieces.append(seg); pos = c1
tail = a[int(pos * sr):].copy()
pieces.append(tail)
for p in pieces[1:]:
    p[:fade] *= np.linspace(0, 1, fade)
res = np.concatenate(pieces)

def shift(t):
    return t - sum(min(max(t - c0, 0), c1 - c0) for c0, c1 in cuts)

for x in words:
    x["start"], x["end"] = round(shift(x["start"]), 3), round(shift(x["end"]), 3)

o = wave.open(out_wav, "w"); o.setnchannels(1); o.setsampwidth(2); o.setframerate(sr)
o.writeframes((np.clip(res, -1, 1) * 32767).astype(np.int16).tobytes()); o.close()
json.dump(words, open(out_words, "w"), ensure_ascii=False, indent=1)
print(f"было {len(a)/sr:.2f} с, стало {len(res)/sr:.2f} с, вырезано пауз: {len(cuts)}")
