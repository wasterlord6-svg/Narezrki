#!/usr/bin/env bash
# Длинная склейка всех частей для YouTube: без карточек с вопросом в частях 1–2, финальный вопрос только в конце.
# Сначала должны быть собраны части (build.sh 1..3).
set -euo pipefail
cd "$(dirname "$0")"
R=../..; B=build
for k in 1 2 3; do
  A=(--show shots.js --words $B/p${k}_words.json --shots $B/p${k}_shots.json --plate "3 МИНУТЫ" --footer "ПОДПИШИСЬ — БУДУТ НОВЫЕ ИСТОРИИ")
  [ $k -lt 3 ] && A+=(--cutq)
  node $R/engine/render.cjs "${A[@]}" --meta $B/l${k}_meta.json --out $B/l${k}_video.mp4
  python3 $R/tools/music.py $B/l${k}_meta.json $B/l${k}.wav
  $R/tools/mix.sh $B/l${k}_video.mp4 $B/p${k}_voice_tight.wav $B/l${k} $B/l${k}.mp4
done
ffmpeg -y -loglevel error -i $B/l1.mp4 -i $B/l2.mp4 -i $B/l3.mp4 -filter_complex "[0:v][0:a][1:v][1:a][2:v][2:a]concat=n=3:v=1:a=1[v][a]" \
  -map "[v]" -map "[a]" -c:v libx264 -crf 21 -preset slow -pix_fmt yuv420p -c:a aac -b:a 192k -movflags +faststart out/3-minuty-full.mp4
