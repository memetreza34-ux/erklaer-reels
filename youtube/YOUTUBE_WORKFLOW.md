# YOUTUBE WORKFLOW — VERBINDLICHE REGEL FÜR LANGVIDEOS

**Stand: 2026-09-25**  
**Visual Policy Version: 3**  
**Cover Policy Version: 1**  
**Topic Editor Version: 1**

Diese Datei gilt ausschließlich für YouTube-Langvideos. Reel-Code und Reel-Bildwelt werden dadurch nicht verändert.

## Priorität

1. aktuelle ausdrückliche Nutzeranweisung
2. `youtube/YOUTUBE_WORKFLOW.md`
3. `config/youtube-channel-policy.json`
4. `config/youtube-topic-registry.json`
5. `youtube/YOUTUBE_VISUAL_WORLD.md`
6. `youtube/PHASE3_HARD_GATE.md`
7. `youtube/ADAPTIVE_PACING_V2.md`
8. `THEMEN_HISTORIE.md`

## Kanalfokus — HARD LOCK

Autonom gewählte YouTube-Themen bleiben in Politik/Staatssystemen, Geschichte, Ländern/Geografie/Grenzen, Ideologien/Gesellschaftssystemen sowie internationalen Beziehungen/Geopolitik. Außerhalb nur bei ausdrücklicher Nutzeranweisung.

## SCHRITT 0 — THEMEN-EDITOR HARD LOCK

**Bevor ein neuer YouTube-Projektordner, Skript oder Flow-Prompt erstellt wird**, muss der Kandidat durch den technischen Themen-Editor:

```bash
npm run topic:youtube -- --topic "NEUES THEMA"
```

Der Editor prüft gleichzeitig:

1. `THEMEN_HISTORIE.md`
2. `config/youtube-topic-registry.json` inklusive bekannter Umformulierungen/Aliase
3. alle vorhandenen `youtube/**/99-technik/video.json`

Entscheidungen:

- `APPROVED_NEW` / `THEMEN-EDITOR: FREI` → Thema darf reserviert und produziert werden.
- `REVIEW_SIMILAR` / `THEMEN-EDITOR: ÄHNLICH` → **STOP**. Kein Projekt automatisch anlegen; erst bewusst ein anderes Thema wählen oder Nutzerentscheidung einholen.
- `BLOCKED_DUPLICATE` / `THEMEN-EDITOR: DOPPELT` → **STOP**. Thema nicht produzieren.

Nicht nur identische Titel zählen. Auch dieselbe Kernfrage in anderer Form wird blockiert, z. B. `Wie wurde Korea geteilt?` gegen `Warum gibt es zwei Koreas?`.

Für neue Schema-8-Projekte wird die Themenfreigabe in `99-technik/video.json` gespeichert und vom normalen Phase-1-Gate nochmals gegen Historie, Register und alle **anderen** Projektordner geprüft. Ein vergessenes manuelles History-Update kann damit keine Duplikate mehr unbemerkt erlauben.

**Reihenfolge ist verbindlich:**

`Thema vorschlagen → Themen-Editor → nur bei FREI reservieren → erst dann Recherche/Skript/Bilder planen.`

## FIRST SCENE = COVER HARD LOCK

Für **jedes neue YouTube-Video** gilt ohne Ausnahme:

- **Bild 01 ist das Cover UND die erste Videoszene.**
- Bild 01 startet bei **0,0 s** in der Timeline.
- Bild 01 trägt eine starke, kurze deutsche Cover-Überschrift.
- Bild 01 muss gleichzeitig zur ersten gesprochenen Aussage passen; es ist kein losgelöstes Werbe-Thumbnail.
- `03-export/THUMBNAIL.png` wird direkt aus **Bild 01.png** kopiert.
- Es gibt **kein separates Bild 00** mehr.
- Ein zusätzliches Thumbnail-Bild außerhalb der Timeline ist bei neuen Projekten verboten.
- Cover und erste Szene sind **dieselbe Datei**, nicht nur dieselbe Idee.

Dadurch kann nicht mehr passieren, dass Thumbnail und Videoanfang visuell auseinanderlaufen.

## Sichtbare Struktur neuer Videos

```text
youtube/YYYY-KWNN_DD-MM_bis_DD-MM/themen-slug/
├── 00-bildprompts/
│   ├── google-flow-prompt.txt
│   └── images/Bild 01.png ... Bild NN.png
├── 01-voice-script/
│   └── voice-script.txt
├── 02-audio/
│   └── voiceover-final.*
├── 03-export/
└── 99-technik/
```

Es gibt **eine einzige finale Voice-over-Datei**.

## Phase 1 — ChatGPT

Phase 1 beginnt **erst nach bestandenem Themen-Editor** und erstellt dann Recherche, Titel, einen Masterprompt, ein Gesamtskript, Bild↔Audio-Mapping, A–E-Pacing, Renderplan, Kapitel und Upload-Metadaten. **Bild 01 wird von Anfang an als Cover + erste Szene geplant.**

Vor Übergabe an Flow:

```bash
npm run validate:youtube-phase1 -- --dir "youtube/<woche>/<thema>"
```

Das Gate blockiert bei neuen Schema-8-Projekten auch eine ungültige/überholte Themenfreigabe. Zusätzlich blockiert es veraltete Countryball-/Master-Reference-Prompts, falsche Style-ID, fehlende Policy-Marker, fehlenden Kanalfokus und jede alte `Bild 00 = Thumbnail`-Regel.

## Bildplanung

```text
A = sehr einfach → 4–5 s geplant
B = einfach      → 5–7 s
C = mittel       → 7–9 s
D = komplex      → 9–12 s
E = sehr komplex → 12–15 s
```

Bild 01 zählt normal zur Bildanzahl und zur Timeline. Es hat zusätzlich die Cover-Aufgabe.

## Phase 2 — Nutzer + Google Flow

### SESSION RESET HARD LOCK

Wenn die bestehende Flow-Sitzung alte Stil- oder Coverregeln enthält:

**STOP → frische Flow-Sitzung / frisches Flow-Projekt öffnen → aktuellen Masterprompt vollständig neu einfügen.**

Veraltet sind insbesondere Countryball als YouTube-Standard, Bild 01 als Master-Style-Referenz, Bild-zu-Bild-Referenzen sowie **Bild 00 als separates Thumbnail**.

### Google Flow — unabhängige Bilder + 5er-Wellen

```text
Bild 01 separat erzeugen und streng prüfen: COVER + ERSTE SZENE
Bild 02–05 separat aus eigenen Textprompts → prüfen
06–10 separat → prüfen
11–15 ...
```

Maximal fünf aktive Generierungen gleichzeitig. 5er-Wellen sind nur Last-/Arbeitslogik.

### HARD LOCK: kein Referenzbild

- kein erzeugtes Bild dient einem späteren Bild als Vorlage
- Bild 01 ist Cover, aber **kein Master-Style-Frame**
- kein vorheriges Bild an Flow anhängen
- Konsistenz nur durch den geschriebenen Style-Lock

### HARD LOCK: Premium Editorial + Visual Storytelling

Aktive Style-ID: `premium-editorial-explainer-illustration-youtube-16x9`

Verbindlich: hochwertige 2D-Editorial-/Dokumentar-Erklärillustration, erwachsen, klar, hochwertig, szenenspezifisch art-directed, sinnvolle Tiefe und Perspektive, keine Countryballs als Standard, keine Stickfiguren, kein generisches KI-Template, kein kindlicher Cartoon-Look, kein 3D/Pixar/Clay/Anime/Fotorealismus als Standard.

### ANTI-LIFELESS HARD LOCK

Regenerieren, wenn ein Bild leer/steril wirkt, nur ein kleines Objekt mittig zeigt, wie eine Präsentationskarte wirkt, dieselbe Komposition wiederholt oder trotz geeignetem Inhalt keine Tiefe, Richtung, Beziehung oder Spannung besitzt.

**Clean ≠ leer. Minimal ≠ leblos.**

### Sichtbarer Text — Deutsch-Hard-Lock

Bei deutschen Projekten ist jeder lesbare Text Deutsch. Englischer Text oder Pseudo-Schrift = Hard Fail.

## Verbindliches YouTube-Audio-Pacing

- überlange Sprechpausen automatisch kürzen
- kurze natürliche Pausen erhalten
- Anfangsstille straffen
- Endstille entfernen
- Voice-over exakt **1,10x**
- Tonhöhe erhalten
- **−16 LUFS**
- True Peak höchstens **−1,5 dBTP**
- 48 kHz
- Nutzeroriginal nie verändern

Audio wird zuerst optimiert; **erst danach misst Whisper** die Wortzeiten.

## Phase 3 — gemessene Produktion

```bash
npm run phase3:youtube -- --dir "youtube/<woche>/<thema>"
```

Reihenfolge:
1. Phase-1-Policy-Gate einschließlich Themen-Editor und Cover Policy
2. aktuelle Bilder, Mapping und genau eine finale Nutzerstimme bestimmen
3. internes Voice-over optimieren: Pausen, Endstille, 1,10x, −16 LUFS / max. −1,5 dBTP
4. erst danach Whisper-Wortzeiten messen
5. echte Bildanker finden
6. Audio-Hard-Gate
7. `FINAL_TIMELINE.json`; **Bild 01 beginnt bei 0,0 s**
8. A–E-Pacing prüfen
9. Pre-Render-Hard-Gate
10. Motion + SFX rendern
11. Export finalisieren; **THUMBNAIL.png = Kopie von Bild 01.png**
12. Post-Render-Hard-Gate

## Verboten

- neues Projekt vor Themen-Editor-Freigabe
- automatisches Weiterarbeiten bei `REVIEW_SIMILAR`
- Duplikat nur durch Umformulierung des Titels
- separates Bild 00/Extra-Thumbnail bei neuen Projekten
- Thumbnail, das nicht aus Bild 01 stammt
- Timeline, deren erstes Bild nicht Bild 01 ist
- Wortzeiten am unoptimierten Original messen
- Render mit anderer Geschwindigkeit als 1,10x
- Nutzer-Voice-over überschreiben
- altes Flow-Projekt mit widersprüchlichen Regeln weiterverwenden
- Bild-zu-Bild-Referenzen
- leblose Präsentationskarten

## Finaler Export

```text
03-export/FERTIGES-VIDEO.mp4
03-export/THUMBNAIL.png   ← identische Datei zu Bild 01.png
03-export/YOUTUBE-TITEL.txt
03-export/YOUTUBE-BESCHREIBUNG.txt
03-export/YOUTUBE-KAPITEL.txt
03-export/YOUTUBE-TAGS.txt
```

## Definition of Done

Ein neues YouTube-Video ist erst fertig, wenn Themen-Editor `APPROVED_NEW` bestätigt, Bild 01 Cover + erste Timeline-Szene ist, THUMBNAIL.png daraus exportiert wird, kein Bild 00 existiert, Visual Policy V3 / Cover Policy V1 bestehen, Bilder hochwertig und individuell sind, deutscher Text stimmt, Audio 1,10x / −16 LUFS / max. −1,5 dBTP besteht und Pre-/Post-Render-Gates erfolgreich sind.
