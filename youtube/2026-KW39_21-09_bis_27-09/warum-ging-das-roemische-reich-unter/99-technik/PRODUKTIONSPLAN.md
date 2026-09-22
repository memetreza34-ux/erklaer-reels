# Produktionsplan

## Phase 1 — COMPLETE
- Thema geprüft und reserviert
- Recherche abgeschlossen
- Titel final
- ein Google-Flow-Masterprompt für Bild 00–38
- ein vollständiges Voice-over-Skript mit 877 Wörtern
- geplante Dauer: ca. 5:20 min
- 38 Videobilder aus Inhalt und A–E-Pacing abgeleitet
- internes Bild↔Audio-Mapping vollständig
- Edit-/Motion-/SFX-Plan vorhanden
- Upload-Metadaten vorhanden

## Sichtbare Arbeitsdateien

```text
00-bildprompts/google-flow-prompt.txt
01-voice-script/voice-script.txt
02-audio/voiceover-final.*
```

Keine sichtbaren Prompt-, Script- oder Audio-Pakete. Segmentierung bleibt intern.

## Phase 2 — PENDING
1. Masterprompt einmal an Google Flow geben.
2. Bild 00 separat erzeugen.
3. Flow arbeitet selbstständig: 01–05 → Check → 06–10 → Check → ... → 36–38.
4. Alle Bilder flach unter `00-bildprompts/images/` als `Bild NN.png` ablegen.
5. Aus `voice-script.txt` eine vollständige finale Voice-over-Datei erzeugen und unter `02-audio/` ablegen.

## Phase 3 — BLOCKED bis Phase 2 vollständig

Danach:

```bash
npm run phase3:youtube -- --dir "youtube/2026-KW39_21-09_bis_27-09/warum-ging-das-roemische-reich-unter"
```

Phase 3 erledigt Wortmessung, interne Segmentierung, Timeline, Render und QC automatisch.
