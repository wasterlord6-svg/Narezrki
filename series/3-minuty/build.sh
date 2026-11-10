#!/usr/bin/env bash
# Сборка одной части: build.sh <номер> ["текст плашки про следующую часть"]
# Нужны build/pN_voice.wav и build/pN_stt.json (озвучка и транскрипция из Speko).
set -euo pipefail
cd "$(dirname "$0")"
k=$1; footer=${2:-"ЧАСТЬ $((k+1)) — В ПРОФИЛЕ"}; R=../..; B=build
python3 $R/tools/voice_prep.py $B/p${k}_voice.wav $B/p${k}_stt.json $B/p${k}_voice_tight.wav $B/p${k}_stt_tight.json
python3 $R/tools/align.py part$k.txt $B/p${k}_stt_tight.json $B/p${k}_words.json $B/p${k}_shots.json
A=(--show shots.js --words $B/p${k}_words.json --shots $B/p${k}_shots.json --plate "3 МИНУТЫ · ЧАСТЬ $k" --footer "$footer")
node $R/engine/render.cjs "${A[@]}" --meta $B/p${k}_meta.json --out $B/p${k}_video.mp4
python3 $R/tools/music.py $B/p${k}_meta.json $B/p${k}.wav
mkdir -p out
$R/tools/mix.sh $B/p${k}_video.mp4 $B/p${k}_voice_tight.wav $B/p${k} out/3-minuty-part$k.mp4
node $R/engine/render.cjs "${A[@]}" --cover "${COVER_T:-1.2}|3 МИНУТЫ|ЧАСТЬ $k" --out out/3-minuty-part$k-cover.jpg
