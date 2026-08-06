# Erklär-Reels

Produktionspipeline für visuelle Erklär-Reels zu Politik, Gesellschaft, Ländern, Geografie, Geschichte, Psychologie und menschlichem Verhalten.

> Warum Menschen, Länder und Gesellschaften so funktionieren.

## Produktionsstandard

- 55–60 Sekunden Voice-over
- 155–175 deutsche Wörter
- 12–14 Szenen, Standard 13
- genau ein klarer Bildmoment pro Szene
- Bildwelt erst nach dem fertigen Script auswählen
- starkes Ende über mindestens zwei Szenen
- Schlussbild bleibt nach dem letzten Wort 0,7 Sekunden ohne neuen Untertitel stehen
- Voice-over exakt 1,10x mit erhaltener Tonhöhe
- −16 LUFS und höchstens −1,5 dBTP
- weiße Untertitel exakt mittig bei 50 %
- keine gelben Wörter und keine schwarze Box
- direkte harte Schnitte
- natürliche Bildkomposition ohne künstliche Untertitelfläche

## Szenenrhythmus

- Hook: 4,2–5,5 Sekunden
- normale Szenen: 3,2–5,5 Sekunden
- letzte Szene inklusive Schlussbild-Nachlauf: 4,0–6,5 Sekunden
- kein Erklärmoment unter 3,2 Sekunden
- Dauersprung zwischen benachbarten Szenen höchstens 2,5 Sekunden
- Untertitel enden mit dem Voice-over und nicht erst nach dem ruhigen Schlussbild

Die Grenzwerte stehen in `config/production-quality-gates.json` und werden in der strengen Timeline-Prüfung kontrolliert.

## Bildwelten

Erst das Script fertigstellen, danach die passendste Hauptwelt wählen. Innerhalb eines Reels bleibt sie konsistent.

Bei `round-country-characters` bestehen Figuren vollständig aus runden Kugelkörpern mit einfachen weißen Augen und höchstens kleinen Armen und Beinen. Karten, Landschaften und Gegenstände dürfen vorkommen, behalten aber dieselben Konturen, Farben und dieselbe Bildsprache.

## Deutscher Text im Bild

- bevorzugt in ungefähr 55–85 % der passenden Szenen
- meistens 1–5 Wörter; ein einzelnes Wort reicht
- klein, mittel oder groß je nach Motiv
- exakter Wortlaut in `scene.imageText` und im englischen Prompt
- keine wortgleiche Wiederholung durch Untertitel
- kein englischer sichtbarer Text, keine Fantasiewörter und keine langen Textblöcke

## Sichere Bildzuordnung

Bilder werden nicht nach Upload-Reihenfolge, Dateiname, Nummer oder Erstellungszeit zugeordnet.

### Erster Durchgang

1. Bild öffnen und den Dateinamen ignorieren.
2. Sichtbaren Inhalt in `visibleSummary` beschreiben.
3. Mit `narration`, `visualIdea`, `imageText` und `imagePrompt` vergleichen.
4. Konkrete `reason` mit sichtbaren Objekten und Handlungen eintragen.

### Zweiter Durchgang

1. Gewählte Szene gegen vorherige und nächste Szene prüfen.
2. `confirmedTarget` und `confirmedSceneOrder` exakt bestätigen.
3. Erst danach `sceneOrderConfirmed` und `secondPassConfirmed` setzen.
4. Unter 0,90 Konfidenz nicht raten, sondern unmatched lassen.

```bash
npm run organize:assets -- --dir "PFAD-ZUM-REEL"
# inbox/asset-map.json vollständig ausfüllen
npm run organize:assets -- --dir "PFAD-ZUM-REEL" --apply
```

Pflichtberichte:

```text
review/scene-asset-verification.json
review/visual-inspection.json
review/visual-quality-report.json
```

Jede Szene braucht eine sichtbare Bildbeschreibung, konkrete Zuordnungsbegründung, bestätigte Reihenfolge, passende Hauptbildwelt und exakt richtigen deutschen Bildtext.

## Untertitel

- `position: center`
- exakt 50 % Bildhöhe
- Weiß `#F5F7FA`
- dunkle Kontur und Schatten
- transparenter Hintergrund
- 3–6 Wörter, höchstens zwei Zeilen
- kein Wort-Highlight und keine Karaoke-Animation

## Audio und Timeline

```bash
npm run trim:pauses -- --dir "PFAD-ZUM-REEL" --speed 1.10
npm run build:timeline -- --dir "PFAD-ZUM-REEL"
npm run sync:audio -- --dir "PFAD-ZUM-REEL" --strict
```

Die Verarbeitung startet immer von der ursprünglichen Voice-over-Datei. Pausen werden gestrafft, das Audio auf exakt 1,10x beschleunigt, die Tonhöhe erhalten und die Lautheit normalisiert. Die Timeline hängt automatisch 0,7 Sekunden ruhiges Schlussbild an.

## Neues Reel

```bash
npm run create:reel -- \
  --title "Was ist Demokratie?" \
  --script-file input/script.txt \
  --next-free \
  --scenes 13
```

Danach:

```bash
npm run export:prompts -- --dir "PFAD-ZUM-REEL" --strict
npm run validate:reel -- --dir "PFAD-ZUM-REEL"
npm run check:content -- --dir "PFAD-ZUM-REEL" --strict
```

## Ordnerstruktur

```text
reel-01_thema/
├── 00-bildprompts/
│   ├── 00-cover/
│   ├── 01-scene-01/
│   ├── ...
│   ├── 13-scene-13/
│   └── 99-alle-bildprompts.txt
├── 01-voice-script/
├── 02-audio/
├── 03-caption/
├── 04-video/
└── 99-technik/
```

## Prüfung und Render

```bash
npm run check:visuals -- --dir "PFAD-ZUM-REEL" --strict
npm run finalize:reel -- --dir "PFAD-ZUM-REEL" --strict
npm run validate:render -- --dir "PFAD-ZUM-REEL"
npm run render:reel -- --dir "PFAD-ZUM-REEL"
```

Die Freigabe blockiert falsche Szenenzuordnungen, fehlende zweite Bildprüfung, unausgeglichene Szenendauern, ein abruptes Ende, altes 1,05x-Audio, fehlende Lautheitsnormalisierung, falsche Untertitelwerte und nicht geprüfte Bilder.

## Voraussetzungen

- Node.js 20 oder neuer
- FFmpeg und optional `ffprobe`
- Remotion-Pakete in identischer Version
- aktuelle Remotion-Lizenzbedingungen vor geschäftlicher Nutzung prüfen
