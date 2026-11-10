#!/usr/bin/env python3
"""Привязывает текст с разметкой кадров к таймингам слов из транскрипции.

align.py <part.txt> <words_stt.json> <words_out.json> <shots_out.json>

В part.txt: {id_кадра|НАДПИСЬ} ставится перед словом, с которого кадр начинается,
[тег] — эмоция для озвучки. Транскрипция пишет числа цифрами и иногда ошибается,
поэтому слова сценария сопоставляются с ней выравниванием, а несовпавшие получают
время пропорционально длине.
"""
import difflib, json, re, sys

markup = open(sys.argv[1], encoding="utf8").read()
items = re.findall(r"\{[^}]*\}|\[[^\]]*\]|[^\s{}\[\]]+", markup)
tokens, marks = [], []
for it in items:
    if it[0] == "{":
        sid, _, slam = it[1:-1].partition("|")
        marks.append((len(tokens), sid, slam))
    elif it[0] != "[" and re.search(r"[A-Za-zА-Яа-яёЁ0-9]", it):
        tokens.append(it)

norm = lambda s: re.sub(r"[^a-zа-я0-9]", "", s.lower().replace("ё", "е"))
stt = [w for w in json.load(open(sys.argv[2], encoding="utf8")) if norm(w["text"])]
a, b = [norm(t) for t in tokens], [norm(w["text"]) for w in stt]
times = [None] * len(tokens)
for tag, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
    if tag == "equal":
        for k in range(i2 - i1):
            times[i1 + k] = (stt[j1 + k]["start"], stt[j1 + k]["end"])
    elif i2 > i1:
        if j2 > j1:
            t0, t1 = stt[j1]["start"], stt[j2 - 1]["end"]
        else:
            t0 = stt[j1 - 1]["end"] if j1 > 0 else 0.0
            t1 = stt[j1]["start"] if j1 < len(stt) else t0 + 0.3
        wts = [len(a[i]) + 1 for i in range(i1, i2)]
        acc = 0
        for i, wt in zip(range(i1, i2), wts):
            times[i] = (t0 + (t1 - t0) * acc / sum(wts), t0 + (t1 - t0) * (acc + wt) / sum(wts))
            acc += wt

words = [dict(text=t, start=round(s, 3), end=round(e, 3)) for t, (s, e) in zip(tokens, times)]
shots = [dict(t=words[i]["start"], id=sid, slam=slam) for i, sid, slam in marks]
json.dump(words, open(sys.argv[3], "w", encoding="utf8"), ensure_ascii=False, indent=1)
json.dump(shots, open(sys.argv[4], "w", encoding="utf8"), ensure_ascii=False, indent=1)
miss = sum(1 for x, y in zip(a, a) if x not in b)
print(f"слов {len(words)}, кадров {len(shots)}, длина {words[-1]['end']:.2f} с, не совпало с транскрипцией: {miss}")
gaps = [round(shots[i + 1]["t"] - shots[i]["t"], 2) for i in range(len(shots) - 1)]
print("длины кадров:", gaps)
