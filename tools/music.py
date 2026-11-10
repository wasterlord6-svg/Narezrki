#!/usr/bin/env python3
"""Синтез музыки и эффектов под ролик.

music.py <meta.json> <out.wav>
meta: {duration, cuts:[с], hits:[с], bell:с} — пишет render.cjs.
Музыка 126 BPM: бас, аккорды, арпеджио, барабаны. «Вуш» на склейках, удар на крупных надписях, колокол в конце.
"""
import json, sys
import numpy as np
import wave

meta = json.load(open(sys.argv[1]))
SR, BPM = 44100, 126
dur = meta["duration"]
n = int(dur * SR)
rng = np.random.default_rng(7)
mus, sfx = np.zeros(n), np.zeros(n)

def put(buf, t, sig, gain=1.0):
    i = int(t * SR)
    if i >= n or i < 0:
        return
    sig = sig[: n - i]
    buf[i:i + len(sig)] += sig * gain

def tone(freq, length, decay, harm=(1, 0.5, 0.25)):
    t = np.arange(int(length * SR)) / SR
    s = sum(a * np.sin(2 * np.pi * freq * (k + 1) * t) for k, a in enumerate(harm))
    return s * np.exp(-t * decay)

def midi(m):
    return 440 * 2 ** ((m - 69) / 12)

beat = 60 / BPM
chords = [[57, 60, 64], [53, 57, 60], [48, 52, 55], [55, 59, 62]]  # Am F C G
kick_t = np.arange(int(0.22 * SR)) / SR
kick = np.sin(2 * np.pi * (45 * kick_t + 70 * (1 - np.exp(-kick_t * 28)) / 28)) * np.exp(-kick_t * 14)
hat = rng.standard_normal(int(0.05 * SR)) * np.exp(-np.arange(int(0.05 * SR)) / SR * 90)
hat = np.diff(hat, prepend=0)
snare = rng.standard_normal(int(0.16 * SR)) * np.exp(-np.arange(int(0.16 * SR)) / SR * 26) * 0.6 + tone(190, 0.16, 30, (1,)) * 0.5

b = 0
while b * beat < dur:
    t0, ch = b * beat, chords[(b // 4) % 4]
    put(mus, t0, kick, 0.9)
    if b % 2 == 1:
        put(mus, t0, snare, 0.35)
    put(mus, t0 + beat / 2, hat, 0.22)
    put(mus, t0 + beat / 4, hat, 0.1); put(mus, t0 + 3 * beat / 4, hat, 0.1)
    put(mus, t0, tone(midi(ch[0] - 24), beat * 0.9, 5, (1, 0.6, 0.2)), 0.42)
    put(mus, t0 + beat / 2, tone(midi(ch[0] - 12), beat * 0.4, 9, (1, 0.5)), 0.2)
    if b % 4 == 0:
        for m in ch:
            pad = tone(midi(m), beat * 4, 0.5, (1, 0.3, 0.15, 0.08))
            pad[: int(0.05 * SR)] *= np.linspace(0, 1, int(0.05 * SR))
            put(mus, t0, pad, 0.07)
    for k in range(4):
        m = (ch + [ch[0] + 12])[(k + b) % 4] + 12
        put(mus, t0 + k * beat / 4, tone(midi(m), 0.2, 16, (1, 0.4, 0.2)), 0.11)
    b += 1

def whoosh(length=0.3):
    m = int(length * SR)
    x = rng.standard_normal(m)
    y, acc = np.zeros(m), 0.0
    cut = np.linspace(0.02, 0.6, m)
    for i in range(m):  # ФНЧ с открывающимся срезом
        acc += cut[i] * (x[i] - acc); y[i] = acc
    env = np.concatenate([np.linspace(0, 1, int(m * 0.75)) ** 2, np.linspace(1, 0, m - int(m * 0.75))])
    return y * env

def impact():
    t = np.arange(int(0.5 * SR)) / SR
    s = np.sin(2 * np.pi * (38 * t + 90 * (1 - np.exp(-t * 20)) / 20)) * np.exp(-t * 7)
    click = rng.standard_normal(len(t)) * np.exp(-t * 60) * 0.5
    return s + click

def bell():
    t = np.arange(int(2.4 * SR)) / SR
    return sum(a * np.sin(2 * np.pi * 660 * r * t) * np.exp(-t * d)
               for r, a, d in [(1, 1, 1.6), (2.0, 0.5, 2.2), (2.76, 0.35, 3), (5.4, 0.2, 5)])

for c in meta.get("cuts", []):
    put(sfx, c - 0.22, whoosh(), 0.75)
for h in meta.get("hits", []):
    put(sfx, h, impact(), 0.8)
if meta.get("bell") is not None:
    put(sfx, meta["bell"], bell(), 0.35)

fade = int(0.35 * SR)
mus[-fade:] *= np.linspace(1, 0, fade)

def save(path, x):
    x = x / max(1e-9, np.abs(x).max()) * 0.89
    w = wave.open(path, "w"); w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((x * 32767).astype(np.int16).tobytes()); w.close()

out = sys.argv[2]
save(out.replace(".wav", "_music.wav"), mus)
save(out.replace(".wav", "_sfx.wav"), sfx)
print("музыка и эффекты:", round(dur, 2), "с")
