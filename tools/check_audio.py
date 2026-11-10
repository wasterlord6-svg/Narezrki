#!/usr/bin/env python3
"""Проверка готового ролика: голос есть от начала до конца и не обрывается.

check_audio.py <video.mp4> <voice.wav> <words.json>

1. Последние 150 мс голосовой дорожки — тишина (слово не оборвано).
2. Голосовая дорожка целиком помещается в ролик, после неё есть хвост.
3. В аудио ролика нет провалов тишины дольше 1,2 с, пока идёт голос.
4. Там, где в голосовой дорожке есть голос, он слышен и в ролике.
При любой проблеме — код ошибки 1.
"""
import json, subprocess, sys, wave
import numpy as np

video, voice, words_p = sys.argv[1:4]
err = []
w = wave.open(voice); sr = w.getframerate()
a = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float32) / 32768
vlen = len(a) / sr
tail = np.sqrt(np.mean(a[-int(0.15 * sr):] ** 2))
if tail > 0.01:
    err.append(f"голос обрывается: громкость последних 150 мс {tail:.3f}")
words = json.load(open(words_p, encoding="utf8"))
dur = float(subprocess.check_output(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", video]))
adur = float(subprocess.check_output(["ffprobe", "-v", "error", "-select_streams", "a", "-show_entries", "stream=duration", "-of", "csv=p=0", video]))
if vlen > adur - 0.3:
    err.append(f"голос {vlen:.2f} с не помещается в звук ролика {adur:.2f} с")
if words[-1]["end"] > dur - 0.5:
    err.append(f"последнее слово кончается в {words[-1]['end']:.2f} с, ролик {dur:.2f} с — нет хвоста")
pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", video, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True).stdout
m = np.frombuffer(pcm, dtype=np.int16).astype(np.float32) / 32768
env = np.array([np.sqrt(np.mean(m[i:i + 1600] ** 2)) for i in range(0, len(m) - 1600, 1600)])
run, worst = 0, 0
for e in env[: int(vlen * 10)]:
    run = run + 1 if e < 0.003 else 0
    worst = max(worst, run)
if worst > 12:
    err.append(f"провал звука {worst/10:.1f} с внутри ролика")
# 4. Везде, где в голосовой дорожке звучит голос, звук ролика не должен проваливаться
v16 = np.interp(np.arange(0, vlen, 1 / 16000), np.arange(len(a)) / sr, a)
venv = np.array([np.sqrt(np.mean(v16[i:i + 1600] ** 2)) for i in range(0, len(v16) - 1600, 1600)])
n = min(len(venv), len(env))
lost = [i / 10 for i in range(n) if venv[i] > 0.03 and env[i] < venv[i] * 0.15]
if lost:
    err.append(f"голос пропадает в ролике: {len(lost) / 10:.1f} с, первое место {lost[0]:.1f} с")
print(f"{video}: ролик {dur:.2f} с, голос {vlen:.2f} с, хвост голоса {tail:.4f}, последнее слово до {words[-1]['end']:.2f} с")
if err:
    print("ОШИБКА: " + "; ".join(err)); sys.exit(1)
print("звук ок")
