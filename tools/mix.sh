#!/usr/bin/env bash
# Сведение: голос (loudnorm -14 LUFS) + музыка под сайдчейном + эффекты, затем лимитер. Склейка с видео.
# mix.sh <video.mp4> <voice.wav> <audio_prefix> <out.mp4>   (ищет <prefix>_music.wav и <prefix>_sfx.wav)
#
# Голос нормализуется отдельным проходом в файл и добивается тишиной до длины музыки.
# Раньше loudnorm стоял в общем графе вместе с asplit и sidechaincompress, и на конце
# голоса весь микс глох за 2–3 с до конца фразы. Теперь все входы одной длины.
set -euo pipefail
video=$1; voice=$2; pre=$3; out=$4
tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "${pre}_music.wav")
ffmpeg -y -loglevel error -i "$voice" -af "aresample=44100,loudnorm=I=-14:TP=-1.5:LRA=7,aresample=44100" -ar 44100 -ac 1 "$tmp/v_norm.wav"
ffmpeg -y -loglevel error -i "$tmp/v_norm.wav" -af "apad=whole_dur=${dur}" -ar 44100 -ac 1 "$tmp/v.wav"
ffmpeg -y -loglevel error -i "$video" -i "$tmp/v.wav" -i "${pre}_music.wav" -i "${pre}_sfx.wav" -filter_complex "
[1:a]asplit=2[v][vk];
[2:a]volume=0.5[m];
[m][vk]sidechaincompress=threshold=0.03:ratio=6:attack=15:release=260[md];
[3:a]volume=0.55[fx];
[v][md][fx]amix=inputs=3:duration=first:normalize=0,alimiter=limit=0.9,atrim=0:${dur}[a]" \
  -map 0:v -map "[a]" -c:v copy -c:a aac -b:a 192k -movflags +faststart "$out"
