# Produktionsplan — Suezkanal: Wie ein Schiff den Welthandel ausbremste

**Format:** Deutsch, ca. 6–7 Minuten, 16:9.
**Skript:** 1041 Wörter in 8 gegliederten Absätzen.
**Bildanzahl:** 67 nach inhaltlichen Perspektivwechseln, circa 379 Sekunden Plan-Holds.
**Cover:** EIN SCHIFF. WELTWEITER STAU.
**Quellen:** Siehe RECHERCHE_QUELLEN.md (6 verifizierte Quellen).

## Inhaltliche Dramaturgie
1. Festfahren der Ever Given im März 2021 (Hook).
2. Suez als Abkürzung zwischen Europa und Asien; Alternativroute Afrika.
3. Lieferketten, Staus und Mehrkosten, ohne pauschale Preiserhöhung zu behaupten.
4. Geschichte 1859–1869, 1956 und Schließung 1967–1975.
5. Rückkehr zu 2021: Wind, Bergung, wartende Schiffe.
6. Ursachen der Anfälligkeit globaler Engstellen und verständliches Schlussbild.

## Strikte Bildregeln
Serious Minimal Countryball Visual Policy V5, Visual Flexibility V1: Karten, Objekte, Schiffe, Häfen und Dokumente je nach Punkt; Countryballs nur zur echten staatlichen Interaktion. Kein Foto, kein 3D, keine Menschen, keine Zufallsflaggen. Jeder Bildblock: individueller Sprecheranker, konkrete themenspezifische Szene und Visual Form.

## Phase 1 prüfen
```bash
npm run validate:youtube-phase1 -- --dir "youtube/2026-KW41_05-10_bis_11-10/suezkanal-wie-ein-schiff-den-welthandel-ausbremste"
```

## Phase 2
- Bild 01 als Cover exakt 3×, einen Gewinner wählen.
- Bilder 02–67 jeweils genau 1×, maximal 5 gleichzeitig, ohne Wellenstop.
- Nur 67 final beschriftete PNG in 00-bildprompts/images/.
- Genau ein komplettes Voice-over in 02-audio/voiceover-final.wav.
- Keine alten Bilder als Referenz.

## Phase 3
```bash
npm run phase3:youtube -- --dir "youtube/2026-KW41_05-10_bis_11-10/suezkanal-wie-ein-schiff-den-welthandel-ausbremste"
```
Erst nachdem Phase 2 fertig ist. Voice-over 1,10×, Tonhöhe erhalten, −16 LUFS, Wortzeiten über Whisper, Motion/SFX, Schlussbild 1,3 s halten. Dann MP4, Thumbnail, Upload-Text und Zeittranskript.
