# Konservatismus: Bewahren statt radikal verändern?

YouTube-Langvideo · Ziel ca. 2 Minuten · Deutsch · Schema 12 · Visual Policy V5.

## Status

Phase 1 vollständig. Phase 2 wartet auf Google-Flow-Bilder und das finale Voice-over.

## Script Opening V1

Der Sprecher startet direkt mit der Zuschauerfrage:

`Was ist Konservatismus? Denkst du dir gerade vielleicht.`

Danach folgen kurze Erstantwort und Leitfrage. Kein abstrakter Schulbuch-Einstieg.

## Bildwelt

`serious-minimal-countryball-explainer-youtube-16x9`

Dieselbe Serious-Minimal-Countryball-DNA wie die Reels, nur 16:9. Die 26 Bildmomente nutzen Scene Illustration V2 und Topic Visual Relevance V1: konkrete Gerichte, Rathäuser, Archive, Brücken, Märkte, Bahnhöfe und demokratische Institutionen statt abstrakter Poster-/Dashboard-Welten.

**Akteure:** ausschließlich Countryballs, wenn Akteure sinnvoll sind. Keine Menschen, menschlichen Silhouetten, realistischen Hände, humanoiden Figuren oder menschlichen Menschenmengen.

**Themenbindung:** Jedes Bild besitzt einen konkreten Topic Anchor. Frankreich erscheint nur beim Kontext der Französischen Revolution; Großbritannien nur beim Edmund-Burke-Kontext. Keine zufälligen Länderflaggen.

## Geplante Assets

- 365 Wörter im Voice-over-Skript
- 26 inhaltsgetriebene Bildmomente
- Bild 01 = Cover + erste Videoszene
- Bild 01 exakt 3× erzeugen, genau 1 Gewinner behalten
- Bild 02–26 jeweils exakt 1× erzeugen
- maximal 5 aktive Generierungen gleichzeitig
- keine manuellen Prüfstopps nach 5er-Wellen
- keine Bild-zu-Bild-Referenzen
- finale Bilder ausschließlich unter `00-bildprompts/images/`
- genau ein finales Voice-over unter `02-audio/voiceover-final.*`

## Sauberes Ende

Das letzte Bild bleibt nach dem letzten gesprochenen Wort 1,3 Sekunden sichtbar. Audio-Stille ersetzt diesen Timeline-Hold nicht.

## Phase 3

```bash
npm run phase3:youtube -- --dir "youtube/2026-KW39_21-09_bis_27-09/konservatismus-bewahren-statt-radikal-veraendern"
```

Phase 3 optimiert die Stimme zuerst auf 1,10x bei erhaltener Tonhöhe, −16 LUFS, max. −1,5 dBTP und 48 kHz. Erst danach werden Whisper-Wortzeiten erzeugt, die 26 Bildanker ausgerichtet, Motion/SFX gebaut und das finale Video mit 1,3-s-Schluss-Hold gerendert.
