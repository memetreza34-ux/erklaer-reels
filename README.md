# Erklär-Reels

Produktionspipeline für visuelle Erklär-Reels mit offenem Themenuniversum und **einer einzigen festen Reel-Bildwelt**.

**`CURRENT_WORKFLOW.md` ist die Single Source of Truth.**

## Produktionsstandard

- 55–60 Sekunden Voice-over
- 155–175 deutsche Wörter
- 12–14 narrative Szenen, Standard 13
- Bildanzahl individuell pro Reel
- pro Szene 1, 2 oder selten 3 Bildphasen
- Voice-over 1,10x bei erhaltener Tonhöhe
- −16 LUFS, höchstens −1,5 dBTP
- keine Untertitel
- kein aktiver Word-Sync-Workflow
- harte Schnitte
- keine Hintergrundmusik
- Schlussbild 0,7 Sekunden nach dem letzten gesprochenen Wort halten

## Eine feste Reel-Bildwelt — Human Editorial Explainer

Für alle neuen Reels gilt **Human Editorial Explainer**.

Wenn eine Person vorkommt, ist sie eine vereinfachte, eindeutig erkennbare menschliche Figur:
- natürlicher ovaler oder leicht runder menschlicher Kopf
- Hals und Oberkörper, wenn sichtbar
- vereinfachte normale menschliche Proportionen
- einfache Augen, Brauen, Nase, Mund und Haare nach Bedarf
- Kopf/Portrait, Oberkörper, Hände oder Ganzkörper je nach Szene

Ein Mensch ist nicht in jedem Bild Pflicht. Ein Objekt, Mechanismus, Dokument, Gebäude, Pflanze, Landschaft oder physischer Prozess darf Hauptmotiv sein, wenn die Aussage dadurch klarer wird.

Nicht Teil der Reel-Bildwelt:
- Countryballs / Länderbälle
- Kugelmenschen / Ball-Maskottchen
- Stick-Figuren
- Fotorealismus
- Anime/Manga
- Clay/Knetstil
- glänzendes 3D / Pixar-Look
- technische Cutaway-/Blueprint-Welt als Standard
- eigene Unter-Bildwelt für Technik, Flugzeuge, Medizin, Geschichte usw.

Länder, Regierungen und Institutionen werden durch Menschen, Karten, Flaggen, Dokumente oder Gebäude dargestellt — nicht durch Länderbälle.

Gestaltung:
- 9:16, Smartphone-first
- clean hand-drawn 2D editorial cartoon
- klare schwarze Konturen
- niedrige bis mittlere Detaildichte
- flächige oder leicht cel-geschattete Farben
- klare, normalerweise helle grafische Beleuchtung
- eine dominante Kernaussage
- eine sichtbare Handlung oder Ursache-Folge-Beziehung
- 1–3 unterstützende Elemente
- möglichst in etwa einer Sekunde verständlich

Vollständige Style-Bibel:

```text
knowledge/fixed-visual-world.md
```

Maschinenlesbare Konfiguration:

```text
config/image-styles.json
```

Der technische Legacy-ID `modern-countryball-explainer` bleibt intern nur aus Kompatibilitätsgründen bestehen. Er ist **keine Countryball-Stilanweisung mehr**.

## Google Flow — nur eine Datei

Die einzige Masterdatei mit allen Bildprompts ist:

```text
00-bildprompts/99-alle-bildprompts.txt
```

Es gibt keine zweite Spiegeldatei unter `all-image-prompts/`. Der alte Doppelordner ist Legacy und wird entfernt.

Flow arbeitet streng seriell:

```text
Bild erzeugen → vollständig warten → prüfen → umbenennen → in gemeinsamen Ausgabeordner legen → Ablage prüfen → nächstes Bild
```

Keine Queue, kein Batch, keine Parallelgenerierung.

Fertige Bilder werden als `Bild 00.png`, `Bild 01.png` usw. gemeinsam importiert nach:

```text
00-bildprompts/00-ALLE-BILDER-HIER-REIN/
```

## Sichtbare Reel-Struktur

```text
reel-XX_thema/
├── 00-bildprompts/
│   ├── 99-alle-bildprompts.txt
│   └── 00-ALLE-BILDER-HIER-REIN/
├── 01-voice-script/
├── 02-audio/
├── 03-export/
│   ├── FERTIGES-REEL.mp4
│   └── UNIVERSELLE-CAPTION.txt
└── 99-technik/
```

Kein separater sichtbarer Caption- oder Video-Ordner.

## Universal-Caption

`03-export/UNIVERSELLE-CAPTION.txt` ist die plattformneutrale Caption für Kurzvideo-Social-Media:
- passend zum konkreten Video
- starker klarer Einstieg
- 60–130 Wörter
- 3–6 passende Hashtags
- keine plattformspezifischen Duett-/Remix-/Link-in-Bio-Hinweise

## Reels und YouTube

Reels und YouTube bleiben vollständig getrennt. Für YouTube gelten ausschließlich:

```text
youtube/YOUTUBE_WORKFLOW.md
youtube/YOUTUBE_VISUAL_WORLD.md
```

Die YouTube-Stick-Figure-/16:9-Welt darf nicht auf Reels übertragen werden und umgekehrt.

## Quellen, Assets und Render

Mindestens zwei nachvollziehbare HTTPS-Quellen mit unterschiedlichen Hosts verwenden; möglichst eine Primär-/offizielle oder wissenschaftliche Quelle plus eine unabhängige Sekundärquelle.

Vor einer Meldung, dass Assets fehlen:

```bash
npm run discover:assets -- --dir "PFAD-ZUM-REEL"
```

Sichere Zuordnung:

```bash
npm run organize:assets -- --dir "PFAD-ZUM-REEL" --apply
```

Audio und Render:

```bash
npm run trim:pauses -- --dir "PFAD-ZUM-REEL" --speed 1.10
npm run build:timeline -- --dir "PFAD-ZUM-REEL"
npm run check:visuals -- --dir "PFAD-ZUM-REEL" --strict
npm run finalize:reel -- --dir "PFAD-ZUM-REEL" --strict
npm run validate:render -- --dir "PFAD-ZUM-REEL"
npm run render:reel -- --dir "PFAD-ZUM-REEL"
```

Keine nicht ausgeführte Stufe als bestanden ausgeben.

## Voraussetzungen

- Node.js 20 oder neuer
- FFmpeg und optional `ffprobe`
- Remotion-Pakete in identischer Version
