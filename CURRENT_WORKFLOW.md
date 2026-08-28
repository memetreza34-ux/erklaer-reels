# CURRENT WORKFLOW — VERBINDLICHE SINGLE SOURCE OF TRUTH

**Stand: 2026-08-28**

Diese Datei ist die verbindliche Repo-weite Produktionsregel für neue Chats, Codex, Antigravity und andere Repo-Agenten.

## Priorität

1. aktuelle ausdrückliche Nutzeranweisung
2. `CURRENT_WORKFLOW.md`
3. `AGENTS.md`
4. `CODEX_TASK.md`
5. `PRODUCTION_STATUS.md`
6. `docs/` und `knowledge/`
7. ältere Reel-Dateien

## 1. Standard eines Erklär-Reels

- 55–60 Sekunden Voice-over, Ziel ca. 58 Sekunden
- 155–175 deutsche Wörter, Ziel ca. 165
- 12–14 narrative Szenen, Standard 13
- ein deutscher Erzähler
- Hook ab Sekunde 0
- letzte zwei Szenen: Erkenntnis-/Prüffrage → konkrete Lösung/Abschlusssatz
- Schlussbild 0,7 Sekunden nach Sprecherende halten
- Voice-over 1,10x bei erhaltener Tonhöhe
- −16 LUFS, höchstens −1,5 dBTP
- keine Untertitel
- kein aktiver Word-Sync für Untertitel
- harte Schnitte
- keine Hintergrundmusik
- 0–2 dezente SFX pro narrativer Szene

Die Themenwahl ist offen. Hook, Aha-Moment, Faktentreue, visuelle Klarheit, Abwechslung und Teilbarkeit entscheiden.

## 2. Reels und YouTube bleiben vollständig getrennt

Für Reels gilt ausschließlich **eine** Bildwelt: **Human Head Editorial Reel** (`human-head-editorial-reel`).

Verbindliche Reel-Quellen:
- `knowledge/fixed-visual-world.md`
- `config/image-styles.json`
- `src/shared/fixed-visual-world.js`

Für YouTube gelten ausschließlich:
- `youtube/YOUTUBE_WORKFLOW.md`
- `youtube/YOUTUBE_VISUAL_WORLD.md`

YouTube-Stick-Figuren/16:9 dürfen nicht auf Reels übertragen werden. Reel-Regeln dürfen nicht auf YouTube übertragen werden.

## 3. Eine einzige Reel-Bildwelt: Human Head Editorial Reel

Es gibt **keine mehreren Reel-Welten und keine themenspezifischen Unter-Bildwelten**.

Wenn eine Person sinnvoll ist, zeigt das Bild einen vereinfachten, eindeutig erkennbaren **echten Menschen**:
- natürliche ovale oder weich gerundete menschliche Kopfform
- Kopf darf editorial leicht betont sein, bleibt aber eindeutig menschlich
- Hals und Oberkörper bei Portrait-/Oberkörperszenen
- vereinfachte normale menschliche Körperproportionen
- einfache Augen, Brauen, Nase, Mund und Haare, wenn passend
- Kopf/Close-up, Portrait, Oberkörper, Hände oder Ganzkörper je nach Szene
- klare menschliche Körpersprache und Kleidung

Ein Mensch oder Kopf ist **nicht in jedem Bild Pflicht**. Wenn ein Gegenstand, Mechanismus, Dokument, Gebäude, Pflanze, Landschaft oder physischer Prozess die Aussage klarer erklärt, darf dieses Motiv alleine verwendet werden. Es wird kein Mensch nur zur Dekoration erzwungen.

Verboten in Reels:
- Countryballs / Länderbälle
- kugelförmige Menschen oder Ball-Maskottchen
- Stick-Figuren
- Fotorealismus
- Anime/Manga
- Clay/Knetstil
- glänzendes 3D / Pixar-Look
- Stockfoto-/Concept-Art-Look
- technische Cutaway-/Blueprint-Welt als Standard
- eigene Bildwelt für Flugzeuge, Technik, Medizin, Geschichte usw.

Bei Ländern, Regierungen und Institutionen werden Menschen, Karten, Flaggen, Dokumente oder Gebäude verwendet — keine Länderbälle.

Gestaltung:
- vertikal 9:16
- clean hand-drawn 2D editorial cartoon
- klare schwarze Konturen
- flächige oder leicht cel-geschattete Farben
- niedrige bis mittlere Detaildichte
- normalerweise klares, helles, grafisches Licht
- eine dominante Kernaussage
- eine klare sichtbare Handlung/Ursache-Folge-Beziehung
- 1–3 unterstützende Elemente
- Bedeutung möglichst innerhalb einer Sekunde verständlich

**Erst konkrete Szene, dann zusätzliche Symbole.** Kein Icon-Board als Standard.

## 4. Bildprompts

Jeder Bildprompt ist Englisch und beschreibt den konkreten Bildmoment. Sichtbarer Bildtext ist ausschließlich Deutsch.

Jeder Prompt beantwortet:
1. Was ist die Kernaussage?
2. Wer oder was ist das Hauptmotiv?
3. Was passiert sichtbar?
4. Welche wenigen Requisiten/Umgebung sind nötig?
5. Welcher Bildausschnitt passt: Kopf, Portrait, Oberkörper, Ganzkörper, Close-up, Objekt oder Umgebung?
6. Welcher exakte deutsche Text ist erlaubt?

Wenn kein Text geplant ist, darf keinerlei lesbarer Text erscheinen. Keine Logos, Wasserzeichen, Workflow-Labels oder Dateinamen im Bild.

## 5. Bildanzahl ist individuell

Narrative Szenenzahl und Bildanzahl sind getrennt.

- 12–14 narrative Szenen
- pro Szene 1, 2 oder selten 3 Bildphasen
- keine feste Gesamtbildzahl erzwingen
- weitere Bildphase nur bei echtem visuellen Fortschritt
- wenn ein Still ca. 3,5–4 Sekunden oder länger stehen würde, zusätzliche Bildphase aktiv prüfen

## 6. Google Flow — genau eine Masterdatei

Die **einzige** Nutzerdatei mit allen Bildprompts ist:

```text
00-bildprompts/99-alle-bildprompts.txt
```

Es gibt **keine zweite Spiegeldatei** unter `all-image-prompts/`. Der alte Ordner `all-image-prompts/` ist Legacy und wird entfernt.

Der separate `google-flow-controller.txt` ist deaktiviert. Alle Steuerregeln stehen direkt im Masterprompt.

### Serielle Flow-Regel

Vor Bild 00 erstellt Flow genau einen gemeinsamen Ausgabeordner für das Reel.

Für jedes Bild:
1. nur aktuellen Bildabschnitt verwenden
2. genau einen Bildgenerator-Aufruf starten
3. vollständig warten
4. Inhalt + Human Head Editorial Reel prüfen
5. bei Fehler nur dasselbe Bild neu erzeugen
6. `Bild NN.png` exakt umbenennen
7. sofort in den gemeinsamen Reel-Ordner legen
8. Ablage prüfen
9. erst dann nächstes Bild starten

Keine Queue, kein Batch, keine Parallelgenerierung und keine Mehrfachvarianten.

## 7. Sichtbare Reel-Struktur

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

Kein separater sichtbarer Caption- oder Video-Ordner. Kein `all-image-prompts/`-Doppelordner.

## 8. Universal-Caption

Die Universal-Caption liegt nur unter `03-export/UNIVERSELLE-CAPTION.txt`.

- plattformneutral für Kurzvideo-Social-Media
- passend zum konkreten Reel
- starker klarer Einstieg
- sinnvoll ausführlich, nicht nur ein kurzer Satz
- 60–130 Wörter
- 3–6 passende Hashtags
- keine plattformspezifischen Funktionen wie Duett/Remix/Link in Bio

## 9. Quellen und QC

Neue Reels brauchen mindestens zwei echte HTTPS-Quellen mit unterschiedlichen Hosts. Möglichst eine Primär-/offizielle oder wissenschaftliche Quelle und eine unabhängige Sekundär-/Fachquelle.

Bild-QC prüft:
- konkrete Narration und Bildphase
- sichtbaren deutschen Text
- Human Head Editorial Reel
- eindeutig menschliche Figur, wenn eine Person vorkommt
- kein Mensch dekorativ erzwungen, wenn Objekt/Mechanismus klarer ist
- keine Countryballs/Kugelmenschen/Stick-Figuren
- keine unerlaubte technische, themenspezifische oder cinematic Unter-Bildwelt
- 9:16
- keine ungeplanten Texte/Logos/Wasserzeichen

Unter 0,90 Zuordnungskonfidenz nicht raten.

## 10. Audio, Timeline und Render

Das finale Voice-over ist die einzige Zeitquelle.

1. Audio importieren
2. Pausen straffen
3. 1,10x bei erhaltener Tonhöhe
4. −16 LUFS / max. −1,5 dBTP messen
5. Szenen anhand echter Audio-Cues synchronisieren
6. Bildphasen über `startPercent` setzen
7. visuelle QC
8. letztes Bild 0,7 Sekunden halten
9. final validieren und rendern

Aktiver Workflow ohne Untertitel und ohne Word-Sync-Schritt.

## 11. Standardbefehle

```bash
npm run export:prompts -- --dir "<reel-ordner>" --strict
npm run validate:reel -- --dir "<reel-ordner>"
npm run discover:assets -- --dir "<reel-ordner>"
npm run organize:assets -- --dir "<reel-ordner>" --apply
npm run trim:pauses -- --dir "<reel-ordner>" --speed 1.10
npm run build:timeline -- --dir "<reel-ordner>"
npm run check:visuals -- --dir "<reel-ordner>" --strict
npm run finalize:reel -- --dir "<reel-ordner>" --strict
npm run validate:render -- --dir "<reel-ordner>"
npm run render:reel -- --dir "<reel-ordner>"
```

Keine nicht ausgeführte Stufe als bestanden markieren.
