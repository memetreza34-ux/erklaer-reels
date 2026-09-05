# 01 – Voice-Script — V2

Für neue Projekte mit `productionRulesVersion >= 2` liegt hier nicht nur ein langes Master-Script, sondern zusätzlich **ein eigener Script-Part pro 10er-Bildpaket**.

Beispiel:

```text
voice-script.txt
01_part-bilder-01-bis-10.txt
02_part-bilder-11-bis-20.txt
03_part-bilder-21-bis-30.txt
...
```

Regeln:
- `voice-script.txt` bleibt das vollständige Master-Script.
- Part 01 enthält ausschließlich den gesprochenen Text für Bild 01–10.
- Part 02 enthält ausschließlich den gesprochenen Text für Bild 11–20.
- usw.
- letzter Part darf weniger als 10 Bilder abdecken.
- keine Textlücken zwischen Parts.
- keine Textüberlappungen oder doppelte Sätze.
- Part-Grenzen müssen an einer natürlichen Satz-/Gedankengrenze liegen.
- die chronologische Zusammensetzung aller Parts muss exakt `voice-script.txt` ergeben.

Die 10er-Grenze ist eine Produktionsgrenze. Falls sie mitten in einem ungeeigneten Satz liegen würde, muss Phase 1 die Bild-/Satzplanung vorher sauber anpassen.

Details: `youtube/ADAPTIVE_PACING_V2.md`.
