#!/usr/bin/env python3
"""Ускоряет озвучку без изменения высоты голоса и пересчитывает тайминги слов.

voice_tempo.py <in.wav> <stt_in.json> <out.wav> <stt_out.json> <темп, напр. 1.2>
Нужен для голосов, у которых нет параметра скорости (например, Google Charon).
"""
import json, subprocess, sys

src, stt_in, dst, stt_out, k = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4], float(sys.argv[5])
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", src, "-af", f"atempo={k}", "-ac", "1", dst], check=True)
d = json.load(open(stt_in, encoding="utf8"))
words = d["words"] if isinstance(d, dict) else d
for w in words:
    w["start_ms"] = int(w["start_ms"] / k); w["end_ms"] = int(w["end_ms"] / k)
json.dump({"words": words}, open(stt_out, "w", encoding="utf8"), ensure_ascii=False)
print(f"{src}: темп ×{k}")
