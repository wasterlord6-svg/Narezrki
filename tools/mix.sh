#!/usr/bin/env bash
# Сведение: голос (loudnorm -14 LUFS) + музыка под сайдчейном + эффекты, затем лимитер. Склейка с видео.
# mix.sh <video.mp4> <voice.wav> <audio_prefix> <out.mp4>   (ищет <prefix>_music.wav и <prefix>_sfx.wav)
set -euo pipefail
ffmpeg -y -loglevel error -i "$1" -i "$2" -i "$3_music.wav" -i "$3_sfx.wav" -filter_complex "
[1:a]aresample=44100,loudnorm=I=-14:TP=-1.5:LRA=7,asplit=2[v][vk];
[2:a]volume=0.5[m];
[m][vk]sidechaincompress=threshold=0.03:ratio=6:attack=15:release=260[md];
[3:a]volume=0.55[fx];
[v][md][fx]amix=inputs=3:duration=longest:normalize=0,alimiter=limit=0.9[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$4"
