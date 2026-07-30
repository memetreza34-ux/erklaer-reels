# Input

Lege hier das deutsche Rohscript für ein neues Reel als `.txt`-Datei ab.

Beispiel:

```text
input/
└── script.txt
```

Danach:

```bash
npm run create:reel -- \
  --title "Titel des Reels" \
  --script-file input/script.txt \
  --scenes 9
```

Codex darf die Datei als Ausgangspunkt lesen, verändert sie aber nicht. Die überarbeitete Fassung wird im erzeugten Reel-Ordner unter `script/final-script.txt` und `script/voice-script.txt` gespeichert.
