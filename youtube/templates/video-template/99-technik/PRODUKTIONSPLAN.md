# Interner YouTube-Produktionsplan

## Thema + Duplicate-Prüfung

- Arbeitstitel:
- Kernfrage:
- `THEMEN_HISTORIE.md` geprüft: ja/nein
- Thema reserviert: ja/nein
- Zielgruppe:
- Nutzen/Aha-Punkt:
- Hook/Ansatz:

## Mindeststandard

- mindestens 10 Minuten finales Voice-over
- Ziel normalerweise 10–12 Minuten
- ungefähr 50–80 Bildmomente, Standard etwa 60
- Bildwechsel meist alle 6–12 Sekunden, **aber final ausschließlich nach echtem Voice-over-Timing**
- jedes Bild im Edit subtil bewegen
- 16:9
- feste Bildwelt `youtube-editorial-stick-explainer`

## Recherche

Für jede wichtige Aussage Quelle, Datum und kurze Begründung dokumentieren. Unsicherheiten klar markieren. Mindestens eine hochwertige Primär-/offizielle/Fachquelle verwenden.

## Titel

- finaler Upload-Titel:
- warum klickbar, aber sachlich korrekt:
- Zusammenspiel mit Thumbnail:

## Thumbnail

- Bild 00 ist ausschließlich das Thumbnail
- Thumbnail-Text:
- Hauptmotiv:
- Kontrastidee:
- fertiger Prompt unter `00-bildprompts/00_thumbnail/Bild 00 - Thumbnail.txt`
- fertiges PNG erst als vorhanden markieren, wenn es wirklich erzeugt wurde

## Script-Planung

- Outline:
- Dramaturgie:
- Schluss/Auflösung:
- Wortzahl:
- erwartete Sprechdauer:

## Bildplanung

Script in visuell klare Momente zerlegen. Jeder Bildmoment erhält einen echten Erklär-/Storyfortschritt und darf nicht nur eine kosmetische Variante des vorherigen Bildes sein.

Pflicht:
- `99-technik/BILD_AUDIO_ZUORDNUNG.json`
- für jedes Videobild exakter `startAnchor` und `endAnchor`
- chronologische, lückenlose Voice-over-Abdeckung
- Bild 00 besitzt keine Audio-Zuordnung

## Google Flow

Masterdatei: `00-bildprompts/99-alle-bildprompts.txt`.

Streng seriell und in 10er-Paketen:

```text
aktuelles 10er-Paket wählen
→ genau 1 Bild erzeugen
→ prüfen
→ exakt Bild NN.png nennen
→ in aktuellen Paketordner legen
→ erst nächstes Bild
→ erst nach vollständigem Paket nächster Ordner
```

## Assets

Nur tatsächlich verwendete Bilder, Grafiken und Audio dokumentieren. Fehlende Assets nicht als vorhanden markieren.

## Phase 3 — Audio ist Master

Antigravity darf **niemals** die Videolänge durch die Bildanzahl teilen und daraus gleich lange Holds erzeugen.

Vor dem Render:
1. finales Voice-over eindeutig bestimmen
2. für jeden Mapping-Eintrag den echten `startAnchor` im finalen Audio finden
3. `actualStartSeconds`, `actualEndSeconds`, `alignmentConfidence` eintragen
4. unter 0,95 Konfidenz nicht raten
5. `99-technik/FINAL_TIMELINE.json` aus den echten Audio-Zeiten erzeugen
6. Bild 01 beginnt bei 0:00; spätere Bilder ca. 0,08 s vor ihrem echten Anchor
7. jedes Bild endet am Start des nächsten Bildes
8. letztes Bild endet nach Voice-over plus ca. 0,60 s sauberem Schluss-Hold
9. danach zwingend:

```bash
npm run validate:youtube-phase3 -- --dir "<projekt>"
```

**Nur Exit-Code 0 erlaubt den Render.**

## Edit

- Motion/Zoom auf jedem Bild
- Kapitelwechsel-SFX:
- Objekt-/Informations-SFX:
- Hintergrundmusik: projektbezogene Entscheidung
- keine hektischen Reel-Zooms
- keine minutenlangen Standbilder
- keine starre Slideshow mit identischen Bilddauern

## Post-Render-QC

Nach dem Render zwingend:

```bash
npm run validate:youtube-render -- --dir "<projekt>"
```

Das Video ist erst fertig, wenn auch dieser Gate Exit-Code 0 liefert. Langer stiller Nachlauf nach dem Voice-over ist verboten.

Details: `youtube/PHASE3_HARD_GATE.md`.

## Upload

Der Upload verwendet ausschließlich die finalen Dateien aus `03-export/`: YouTube-Titel, Beschreibung, Kapitel, optionale Tags, Thumbnail und Video. Keine Reel-Universal-Caption verwenden.
