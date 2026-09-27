# Anarchismus: Kann eine Gesellschaft ohne Staat funktionieren?

YouTube-Langvideo · Ziel ca. 2 Minuten · Deutsch · Schema 13 · Visual Flexibility V1.

## Status

Phase 1 vollständig. Phase 2 wartet auf Google-Flow-Bilder und das finale Voice-over.

## Einstieg

`Was ist Anarchismus? Denkst du dir gerade vielleicht.`

Danach folgt sofort die Kurzantwort und die Leitfrage, wie Ordnung ohne Regierung funktionieren soll.

## Bildwelt

`serious-minimal-countryball-explainer-youtube-16x9`

Dieselbe Serious-Minimal-Countryball-DNA wie die Reels, aber mit Visual Flexibility V1:

- Countryballs sind optional
- keine Figur wird auf Zwang eingefügt
- Objekt-only, Dokument-only und einfache Schemata sind erlaubt
- mehrere Akteure oder komplexe Szenen nur, wenn sie die Aussage wirklich verbessern
- Klarheit vor Komplexität
- keine Menschen, Silhouetten, realistischen Hände, Stickfiguren oder 3D

## Geplante Assets

- 362 Wörter
- 25 inhaltsgetriebene Bildmomente
- Bild 01 = Cover + erste Videoszene
- Bild 01 exakt 3× erzeugen, genau 1 Gewinner behalten
- Bild 02–25 jeweils exakt 1× erzeugen
- maximal 5 aktive Generierungen gleichzeitig
- keine Bild-zu-Bild-Referenzen
- finale Bilder ausschließlich unter `00-bildprompts/images/`
- ein finales Voice-over unter `02-audio/voiceover-final.*`

## Phase 3

```bash
npm run phase3:youtube -- --dir "youtube/2026-KW39_21-09_bis_27-09/anarchismus-gesellschaft-ohne-staat"
```

Phase 3 optimiert das Voice-over, erzeugt danach die Wortzeiten, richtet alle 25 Bildanker aus, baut Motion/SFX und rendert das finale Video mit 1,3 Sekunden Schluss-Hold.
