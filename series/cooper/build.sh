#!/usr/bin/env bash
# Сборка одной части: build.sh <номер> ["текст плашки про следующую часть"]
# Нужны voice/raw/pN_voice_padded.wav + voice/raw/pN_stt_padded.json (озвучка с « [pause] Вот так.» в конце
# и её транскрипция из Speko) либо уже обрезанные voice/pN_voice.wav + voice/pN_stt.json.
# В конце проверяется звук готового ролика; при обрыве голоса сборка падает.
set -euo pipefail
cd "$(dirname "$0")"
k=$1; footer=${2:-"ЧАСТЬ $((k+1)) — В ПРОФИЛЕ"}; R=../..; B=build
mkdir -p $B
# медленный голос без параметра скорости (Google Charon): ускорить, тайминги пересчитать
if [ -f voice/raw/p${k}_voice_slow.wav ]; then
  python3 $R/tools/voice_tempo.py voice/raw/p${k}_voice_slow.wav voice/raw/p${k}_stt_slow.json voice/raw/p${k}_voice_padded.wav voice/raw/p${k}_stt_padded.json ${TEMPO:-1.2}
fi
# если есть сырая озвучка с фразой-жертвой — отрезать её и проверить, что голос договорил
if [ -f voice/raw/p${k}_voice_padded.wav ]; then
  python3 $R/tools/voice_tail.py voice/raw/p${k}_voice_padded.wav voice/raw/p${k}_stt_padded.json voice/p${k}_voice.wav voice/p${k}_stt.json
fi
python3 $R/tools/voice_prep.py voice/p${k}_voice.wav voice/p${k}_stt.json $B/p${k}_voice_tight.wav $B/p${k}_stt_tight.json
python3 $R/tools/align.py part$k.txt $B/p${k}_stt_tight.json $B/p${k}_words.json $B/p${k}_shots.json
A=(--show scenes.js,shots.js --words $B/p${k}_words.json --shots $B/p${k}_shots.json --plate "ДЕЛО КУПЕРА · ЧАСТЬ $k" --footer "$footer")
node $R/engine/render.cjs "${A[@]}" --meta $B/p${k}_meta.json --out $B/p${k}_video.mp4
python3 $R/tools/music.py $B/p${k}_meta.json $B/p${k}.wav
mkdir -p out
$R/tools/mix.sh $B/p${k}_video.mp4 $B/p${k}_voice_tight.wav $B/p${k} out/delo-kupera-part$k.mp4
python3 $R/tools/check_audio.py out/delo-kupera-part$k.mp4 $B/p${k}_voice_tight.wav $B/p${k}_words.json
# обложка: COVER_ID — id кадра из partN.txt (берётся середина первого такого кадра), иначе COVER_T
if [ -n "${COVER_ID:-}" ]; then
  COVER_T=$(python3 -c "import json,sys;s=json.load(open('$B/p${k}_shots.json'));i=[j for j,x in enumerate(s) if x['id']=='$COVER_ID'][0];e=s[i+1]['t'] if i+1<len(s) else s[i]['t']+2;print(round((s[i]['t']+e)/2,2))")
fi
node $R/engine/render.cjs "${A[@]}" --cover "${COVER_T:-1.2}|ДЕЛО КУПЕРА|ЧАСТЬ $k" --out out/delo-kupera-part$k-cover.jpg
