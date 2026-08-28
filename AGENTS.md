# AGENTS.md

`CURRENT_WORKFLOW.md` ist die verbindliche Single Source of Truth. Bei Widersprüchen gilt immer die dort definierte Priorität.

## Neues Reel

Bei „Mach ein neues Reel“ autonom:

1. nächsten freien Slot bestimmen
2. starkes Thema aus dem offenen Themenuniversum wählen
3. deutsches Voice-over mit 155–175 Wörtern schreiben
4. 12–14 narrative Szenen planen, Standard 13
5. für Cover und jede Bildphase ausschließlich **Human Head Editorial Reel** verwenden
6. Bildanzahl pro Reel und Szene individuell planen
7. Cover + Bildphasen-Prompts + einen seriellen Google-Flow-Gesamtprompt + Universal-Caption + Quellen fertigstellen
8. keine Untertitel erzeugen
9. externe Assets zuerst suchen, bevor etwas als fehlend gemeldet wird
10. Assets visuell prüfen, Audio synchronisieren und nur nach echten QC-Gates rendern

## Reels und YouTube strikt trennen

Reels verwenden ausschließlich **Human Head Editorial Reel** (`human-head-editorial-reel`) in 9:16.

YouTube verwendet ausschließlich:

```text
youtube/YOUTUBE_WORKFLOW.md
youtube/YOUTUBE_VISUAL_WORLD.md
```

Nie automatisch übertragen:
- YouTube-Stick-Figuren auf Reels
- Reel-Human-Head-Editorial-Regeln auf YouTube
- 16:9 auf Reels
- 9:16-Reel-Regeln auf YouTube

## Eine einzige Reel-Bildwelt

Verbindlich definiert in:
- `knowledge/fixed-visual-world.md`
- `config/image-styles.json`
- `src/shared/fixed-visual-world.js`

Es gibt **genau eine** aktive Reel-Bildwelt. Keine Legacy-Countryball-Welt, keine zweite Clarity-Welt und keine themenspezifischen Unter-Bildwelten.

### Menschen / Köpfe

Wenn eine Person sinnvoll ist, muss sie eindeutig als vereinfachter echter Mensch lesbar sein:
- natürlicher ovaler oder weich gerundeter menschlicher Kopf
- Kopf darf editorial leicht betont sein, bleibt aber eindeutig menschlich
- Hals/Oberkörper, wenn sichtbar
- normale vereinfachte menschliche Proportionen
- einfache Augen, Brauen, Nase, Mund, Haare und Kleidung nach Bedarf
- Kopf/Close-up, Portrait, Oberkörper, Hände oder Ganzkörper je nach Szene

Ein Mensch oder Kopf ist **nicht in jedem Bild Pflicht**. Wenn ein Objekt, Mechanismus, Dokument, Gebäude, Pflanze, Landschaft oder physischer Prozess klarer erklärt, darf dieses Motiv alleine verwendet werden. Keinen Menschen nur zur Dekoration hinzufügen.

### Verboten

- Countryballs / Länderbälle
- Kugelmenschen / Ball-Maskottchen
- Stick-Figuren
- Fotorealismus
- Anime/Manga
- Clay/Knetstil
- glänzendes 3D / Pixar-Look
- technische Cutaway-/Blueprint-Welt als Standard
- eigene Unter-Bildwelt pro Thema
- generische Icon-Boards, Floating Cards und wiederholte Figur-mittig-plus-Icons-Kompositionen

Länder, Regierungen und Institutionen werden durch Menschen, Karten, Flaggen, Dokumente oder Gebäude dargestellt, nicht durch Bälle.

### Gestaltung

- 9:16
- clean hand-drawn 2D editorial cartoon
- klare schwarze Konturen
- niedrige bis mittlere Detaildichte
- flächige oder leicht cel-geschattete Farben
- normalerweise klare helle grafische Beleuchtung
- ein dominantes Hauptmotiv
- eine sichtbare Handlung oder Ursache-Folge-Beziehung
- 1–3 unterstützende Elemente
- möglichst innerhalb einer Sekunde verständlich

**Erst konkrete Szene, dann zusätzliche Symbole.**

## Bildprompts

Jeder Cover-/Szenenprompt ist Englisch und beschreibt den konkreten physischen Moment. Sichtbarer Bildtext ist ausschließlich Deutsch.

Jeder Prompt enthält:
1. 9:16
2. Kernaussage
3. Hauptmotiv
4. Ort/Umgebung
5. sichtbare Handlung
6. passenden Bildausschnitt: Kopf, Portrait, Oberkörper, Ganzkörper, Close-up, Objekt oder Umgebung
7. wenige Requisiten
8. exakt erlaubten deutschen Text, falls vorhanden
9. kein zusätzlicher lesbarer Text, keine Logos/Wasserzeichen

## Narrative Szenen ≠ Bildanzahl

Pro narrativer Szene normalerweise 1 Bildphase, 2 bei echtem visuellen Fortschritt, 3 nur selten. Wenn ein Still ca. 3,5–4 Sekunden oder länger stehen würde, zusätzliche Phase aktiv prüfen. Keine feste Gesamtbildzahl erzwingen.

## Google Flow — nur eine Masterdatei

Verbindliche Nutzerdatei:

```text
00-bildprompts/99-alle-bildprompts.txt
```

Es gibt keine zweite Kopie unter `all-image-prompts/`. Der alte Doppelordner ist Legacy und wird entfernt.

Der separate `google-flow-controller.txt` ist deaktiviert. Alle Steuerregeln stehen in der einen Masterdatei.

### Hard Serial Lock

```text
nur aktuellen Bildabschnitt ausführen
→ genau 1 Bildgenerator-Aufruf
→ vollständig warten
→ gegen Prompt UND Human Head Editorial Reel prüfen
→ exakt als Bild NN.png umbenennen
→ in den gemeinsamen Reel-Ausgabeordner legen
→ Ablage prüfen
→ erst dann nächstes Bild
```

Keine Queue, kein Batch, keine Parallelgenerierung, keine Mehrfachvarianten.

## Workflow-Metadaten nie im Bild

Verboten als sichtbarer Bildtext:
- Bildnummern
- COVER / SZENE / BILDPHASE
- DATEINAME und Dateinamen
- GOOGLE FLOW / PROMPT / STYLE-REFERENZ / ZIEL

`imageText` gesetzt → nur exakt dieser deutsche Text. Leer → kein lesbarer Text.

## Quellen-QC

Neue Reels:
- mindestens zwei echte HTTPS-Quellen
- unterschiedliche Hosts
- möglichst mindestens eine Primär-/offizielle oder wissenschaftliche Originalquelle
- mindestens eine unabhängige Sekundär-/Fachquelle
- konkret dokumentieren, welche Reel-Aussage belegt wird

## Untertitel und Audio

- keine Untertitel
- kein aktiver Word-Sync
- keine Subtitle-Safe-Zone
- finales Audio ist einzige Zeitquelle
- Pausen straffen
- 1,10x, Pitch erhalten
- −16 LUFS
- max. −1,5 dBTP
- Szenen über echte Audio-Cues synchronisieren

## Asset-Zuordnung

Dateinummer ist nur Routing-Hilfe. Bilder tatsächlich gegen Narration, Bildtext, Prompt, Human Head Editorial Reel und benachbarte Bildphasen prüfen. Unter 0,90 Konfidenz nicht raten.

## Finaler Reel-Export

```text
03-export/
├── FERTIGES-REEL.mp4
└── UNIVERSELLE-CAPTION.txt
```

Kein separater sichtbarer Caption- oder Video-Ordner.

## Render

Nur nach tatsächlich bestandenen Prüfungen. Nicht ausgeführte Tests, QC-Stufen oder Render niemals als bestanden melden.
