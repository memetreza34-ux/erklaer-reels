# Phase 2 — finales Voice-over

Für dieses Video wird **eine einzige finale Audiodatei** verwendet.

Empfohlener Dateiname:

```text
voiceover-final.wav
```

Alternativ funktionieren auch MP3, M4A, AAC, FLAC, OGG oder OPUS.

Regeln:
- das komplette `01-voice-script/voice-script.txt` wortgetreu sprechen
- keine zusätzlichen Begrüßungen oder Outros außerhalb des Skripts
- keine Musik in die Voice-over-Datei mischen
- keine künstlich langen Pausen
- Anfang und Ende sauber schneiden
- nur **eine** finale Voice-over-Datei unter `02-audio/` ablegen

Die frühere sichtbare Aufteilung in mehrere Audio-Parts wird nicht mehr benötigt. Phase 3 findet die Bildanker selbst im vollständigen Audio und erledigt die technische Unterteilung intern.

Danach:

```bash
npm run phase3:youtube -- --dir "youtube/2026-KW39_21-09_bis_27-09/warum-ging-das-roemische-reich-unter"
```
