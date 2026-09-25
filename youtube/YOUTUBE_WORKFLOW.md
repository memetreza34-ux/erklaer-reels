# YOUTUBE WORKFLOW — VERBINDLICHE REGEL FÜR LANGVIDEOS

**Stand: 2026-09-25**  
**Visual Policy Version: 4**  
**Cover Policy Version: 1**  
**Topic Editor Version: 1**  
**Asset Generation Policy Version: 1**

Diese Datei gilt ausschließlich für YouTube-Langvideos.

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

Der Editor prüft:
1. `THEMEN_HISTORIE.md`
2. `config/youtube-topic-registry.json`
3. alle vorhandenen `youtube/**/99-technik/video.json`

Entscheidungen:
- `APPROVED_NEW` / `THEMEN-EDITOR: FREI` → produzieren erlaubt
- `REVIEW_SIMILAR` / `THEMEN-EDITOR: ÄHNLICH` → STOP
- `BLOCKED_DUPLICATE` / `THEMEN-EDITOR: DOPPELT` → STOP

Auch dieselbe Kernfrage in anderer Form wird blockiert.

**Reihenfolge:**
`Thema vorschlagen → Themen-Editor → nur bei FREI reservieren → erst dann Recherche/Skript/Bilder planen.`

## VERBINDLICHE YOUTUBE-BILDWELT — HARD LOCK

Neue YouTube-Videos verwenden wieder die ursprüngliche Serious-Minimal-Countryball-DNA:

```text
serious-minimal-countryball-explainer-youtube-16x9
```

Quelle:
```text
serious-minimal-countryball-explainer
```

YouTube ist nur auf **16:9 horizontal** angepasst. Die künstlerische DNA bleibt dieselbe wie bei den Reels.

Verbindlich:
- cleane, seriöse, minimalistische 2D-Countryball-Erklärwelt
- perfekt runde Countryball-Akteure, wenn Akteure gebraucht werden
- einfache weiße Augen
- kräftige schwarze Konturen
- flache kontrollierte Farben
- geringe bis mittlere Detaildichte
- starke Symbolik statt realistischer Vollszenen
- normalerweise 0–3 sinnvolle Zusatzobjekte
- keine normalen illustrierten Menschen
- keine humanoiden Cartoon-Personen
- keine Stickfiguren
- kein Fotorealismus
- kein 3D/Pixar/Clay/Anime
- nicht kindisch, nicht albern

Die Premium-Editorial-Bildwelt aus Visual Policy V3 ist für neue Schema-9+-Produktionen nicht mehr aktiv.

## FIRST SCENE = COVER HARD LOCK

- **Bild 01 ist Cover UND erste Videoszene.**
- Start bei **0,0 s**.
- starke kurze deutsche Cover-Überschrift.
- Bild 01 passt gleichzeitig zur ersten gesprochenen Aussage.
- `03-export/THUMBNAIL.png` = Kopie von `Bild 01.png`.
- kein Bild 00.
- kein separates Thumbnail.

## Sichtbare Struktur

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

Es gibt genau eine finale Voice-over-Datei.

## Phase 1 — ChatGPT

Nach bestandenem Themen-Editor erstellt Phase 1:
- Recherche
- Titel
- Gesamtskript
- einen Google-Flow-Masterprompt
- Bild↔Audio-Mapping
- A–E-Pacing
- Renderplan
- Kapitel
- Upload-Metadaten

Bild 01 wird von Anfang an als Cover + erste Szene geplant.

Vor Flow:

```bash
npm run validate:youtube-phase1 -- --dir "youtube/<woche>/<thema>"
```

Für neue Schema-9+-Projekte prüft das Gate zusätzlich:
- Visual Policy V4
- Serious-Minimal-Countryball-Style-ID
- Cover Policy V1
- Asset Generation Policy V1
- Themen-Editor
- kein Bild 00
- kein Referenzbild
- keine Premium-Editorial-V3-Pflicht

## Bildplanung

```text
A = sehr einfach → 4–5 s geplant
B = einfach      → 5–7 s
C = mittel       → 7–9 s
D = komplex      → 9–12 s
E = sehr komplex → 12–15 s
```

## Phase 2 — Nutzer + Google Flow

### SESSION RESET HARD LOCK

Durch die Rückkehr zur alten Bildwelt ist für neue/aktuelle Generierungen eine **frische Flow-Sitzung** Pflicht.

Wenn eine Sitzung noch `premium-editorial-explainer-illustration-youtube-16x9` als aktive Bildwelt nennt:

**STOP → frische Sitzung → aktuellen Masterprompt neu einfügen.**

### COVER = 3 CANDIDATES HARD LOCK

Nur Bild 01 bekommt mehrere Versuche:
1. Bild 01 exakt 3× generieren.
2. drei Cover vergleichen.
3. genau einen Gewinner auswählen.
4. Gewinner einmal final zu `Bild 01.png` umbenennen.
5. andere zwei verwerfen.

### NON-COVER = SINGLE GENERATION HARD LOCK

Bild 02 bis Bild NN:
- jedes Bild genau 1× generieren
- keine zweite Variante
- keine manuellen Prüfstopps nach 5er-Wellen
- kein Stop zwischen 02–05, 06–10 usw.
- jedes fertige Bild genau einmal final benennen

Maximal fünf aktive Generierungen gleichzeitig. Das ist nur Parallelitätslogik.

### FINAL IMAGE FOLDER HARD LOCK

Am Ende:

```text
00-bildprompts/images/
├── Bild 01.png
├── Bild 02.png
├── Bild 03.png
└── ... bis Bild NN.png
```

Dort nur finale Bilder, keine Unterordner, keine Cover-A/B/C-Versionen, keine Extras, kein Bild 00.

Prüfung:

```bash
npm run validate:youtube-phase2 -- --dir "youtube/<woche>/<thema>"
```

### HARD LOCK: kein Referenzbild

Die alte **Bildwelt** ist zurück, aber die alte problematische Master-Reference-Regel bleibt abgeschafft:
- kein erzeugtes Bild als Vorlage für spätere Bilder
- Bild 01 ist kein Master-Style-Frame
- kein vorheriges Bild an Flow anhängen
- Konsistenz kommt aus dem geschriebenen Style-Lock

### HARD LOCK: Serious Minimal Countryball

Aktive Style-ID:

```text
serious-minimal-countryball-explainer-youtube-16x9
```

Historische, politische und geografische Inhalte werden in dieselbe reduzierte 2D-Formsprache übersetzt. Keine realistischen Konferenzräume, Menschenmengen, cineastischen Kriegsszenen oder detailreichen Gemälde als Standard.

Wenn ein Countryball-Akteur gebraucht wird: perfekt rund, einfache weiße Augen, kräftige schwarze Kontur, kontrollierte Mimik. Wenn Karte/Objekt/Symbol besser erklärt, darf das Bild auch ohne Countryball funktionieren.

### ANTI-LIFELESS HARD LOCK

Minimal bleibt minimal, aber nicht leblos:
- kein winziges Motiv verloren auf riesiger Leerfläche
- keine sinnlose Icon-Collage
- keine mechanisch identische Anordnung in jedem Bild
- unterschiedliche sinnvolle Positionierung, Größenverhältnisse, Pfeile, Wege und Symbole

**Clean ≠ leer. Minimal ≠ leblos.**

### Sichtbarer Text — Deutsch-Hard-Lock

Bei deutschen Projekten muss jeder sichtbare lesbare Text Deutsch sein. Englisch/Pseudo-Schrift = Hard Fail in der Promptplanung.

## YouTube-Audio-Pacing

- lange Sprechpausen automatisch kürzen
- kurze natürliche Pausen erhalten
- Anfangsstille straffen
- Endstille entfernen
- Voice-over exakt **1,10x**
- Tonhöhe erhalten
- **−16 LUFS**
- True Peak max. **−1,5 dBTP**
- 48 kHz
- Nutzeroriginal nie verändern

Whisper misst erst das optimierte Audio.

## Phase 3

```bash
npm run phase3:youtube -- --dir "youtube/<woche>/<thema>"
```

Reihenfolge:
1. Phase-1-Gate inkl. Themen-, Visual-, Cover- und Asset-Policy
2. Phase-2-Asset-Gate
3. finale Bilder + genau eine Nutzerstimme bestimmen
4. Audio intern optimieren
5. Whisper-Wortzeiten messen
6. Bildanker bestimmen
7. Audio-Hard-Gate
8. `FINAL_TIMELINE.json`, Bild 01 bei 0,0 s
9. A–E-Pacing
10. Pre-Render-Hard-Gate
11. Motion + SFX
12. Export; `THUMBNAIL.png = Bild 01.png`
13. Post-Render-Hard-Gate

## Verboten

- neues Projekt vor Themenfreigabe
- Duplikat nur umformulieren
- Premium-Editorial-V3 als Bildwelt für neue Schema-9+-Projekte
- normales Mensch-/Stickman-Design statt Countryball-DNA
- separates Bild 00
- Cover ≠ erste Szene
- weniger/mehr als 3 Cover-Kandidaten
- mehrere finale Cover behalten
- Bild 02..NN mehrfach generieren
- Prüfstopps nach 5er-Wellen
- Varianten/Extras im finalen Bilderordner
- Bild-zu-Bild-Referenzen
- Wortzeiten am unoptimierten Audio
- andere Geschwindigkeit als 1,10x
- Nutzeroriginal überschreiben

## Finaler Export

```text
03-export/FERTIGES-VIDEO.mp4
03-export/THUMBNAIL.png
03-export/YOUTUBE-TITEL.txt
03-export/YOUTUBE-BESCHREIBUNG.txt
03-export/YOUTUBE-KAPITEL.txt
03-export/YOUTUBE-TAGS.txt
```

## Definition of Done

Fertig erst wenn:
- Themen-Editor `APPROVED_NEW`
- Visual Policy V4 aktiv
- `serious-minimal-countryball-explainer-youtube-16x9` aktiv
- Bild 01 = Cover + erste Szene
- Cover 3× → 1 Gewinner
- Bild 02..NN je 1×
- alle finalen Bilder in genau einem flachen Ordner
- kein Bild 00
- keine Referenzbilder
- Serious-Minimal-Countryball-DNA eingehalten
- Audio 1,10x / −16 LUFS / max. −1,5 dBTP
- Pre-/Post-Render-Gates bestanden
