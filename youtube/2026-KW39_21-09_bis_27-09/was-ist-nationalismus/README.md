# Was ist Nationalismus?

YouTube-Langvideo · Ziel ca. 2,5 Minuten · Deutsch · Visual Policy V5.

## Status

Phase 1 vollständig. Phase 2 wartet auf Google-Flow-Bilder und das finale Voice-over.

## Bildwelt

`serious-minimal-countryball-explainer-youtube-16x9`

Dieselbe Serious-Minimal-Countryball-DNA wie die Reels, nur 16:9. V5 ergänzt Premium Design Layer V1: bessere Komposition, kontrollierte Farbpaletten, stärkere Typografie, bewusstes Layering, sauberere Karten/Beziehungen und Adaptive Image Density V3.

## Geplante Assets

- Bild 01 = Cover + erste Videoszene
- Bild 01 exakt 3× erzeugen, genau 1 Gewinner behalten
- Bild 02–28 jeweils exakt 1× erzeugen
- maximal 5 aktive Generierungen gleichzeitig
- keine manuellen Prüfstopps nach 5er-Wellen
- keine Bild-zu-Bild-Referenzen
- finale Bilder ausschließlich unter `00-bildprompts/images/`
- genau ein finales Voice-over unter `02-audio/voiceover-final.*`

## Phase 3

```bash
npm run phase3:youtube -- --dir "youtube/2026-KW39_21-09_bis_DD-MM/was-ist-nationalismus"
```

Korrekte Projektwoche:

```bash
npm run phase3:youtube -- --dir "youtube/2026-KW39_21-09_bis_27-09/was-ist-nationalismus"
```

Phase 3 optimiert die Stimme auf 1,10x bei erhaltener Tonhöhe, −16 LUFS, max. −1,5 dBTP und 48 kHz, richtet danach die 28 Bildanker an echten Wortzeiten aus und rendert das finale Video.
