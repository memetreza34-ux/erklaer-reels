# YOUTUBE WORKFLOW — VERBINDLICHE REGEL FÜR LANGVIDEOS

**Stand: 2026-09-26**  
**Visual Policy Version: 5**  
**Design Quality Version: 1**  
**Adaptive Pacing Version: 3**  
**Script Opening Policy Version: 1**  
**Cover Policy Version: 1**  
**Topic Editor Version: 1**  
**Asset Generation Policy Version: 1**

Diese Datei gilt ausschließlich für YouTube-Langvideos. Reels bleiben davon getrennt und werden nicht verändert.

## Priorität

1. aktuelle ausdrückliche Nutzeranweisung
2. `youtube/YOUTUBE_WORKFLOW.md`
3. `config/youtube-channel-policy.json`
4. `config/youtube-topic-registry.json`
5. `youtube/YOUTUBE_VISUAL_WORLD.md`
6. `youtube/ADAPTIVE_PACING_V3.md`
7. `youtube/PHASE3_HARD_GATE.md`
8. `THEMEN_HISTORIE.md`

## Kanalfokus — HARD LOCK

Autonom gewählte YouTube-Themen bleiben in Politik/Staatssystemen, Geschichte, Ländern/Geografie/Grenzen, Ideologien/Gesellschaftssystemen sowie internationalen Beziehungen/Geopolitik. Außerhalb nur bei ausdrücklicher Nutzeranweisung.

## SCHRITT 0 — THEMEN-EDITOR HARD LOCK

Vor neuem Projektordner, Skript oder Flow-Prompt:

```bash
npm run topic:youtube -- --topic "NEUES THEMA"
```

Nur `APPROVED_NEW / THEMEN-EDITOR: FREI` erlaubt die Produktion. `REVIEW_SIMILAR` und `BLOCKED_DUPLICATE` stoppen das Thema.

## SCRIPT OPENING V1 — HARD LOCK

Alle **neu angelegten Schema-11+-YouTube-Skripte** beginnen **nicht** mit einer abstrakten Definition oder einer allgemeinen Einleitung. Der Zuschauer soll sofort die Frage hören, wegen der er geklickt hat. Bestehende Schema-10-Projekte bleiben reproduzierbar und werden nicht rückwirkend gebrochen.

Verbindliche Reihenfolge, sofern der Nutzer nicht ausdrücklich für genau dieses Video einen anderen Einstieg verlangt:

```text
[Direkte Videofrage]? Denkst du dir gerade vielleicht.
Kurz gesagt: [sehr kurze erste Antwort].
Aber [Leitfrage / Spannung für den Rest des Videos]?
```

Erlaubt ist statt `Kurz gesagt:` auch `Einfach gesagt:`.

Beispiel:

```text
Was ist Nationalismus? Denkst du dir gerade vielleicht.
Kurz gesagt: Nationalismus ist die Idee, dass die eigene Nation eine besonders wichtige Rolle in der Politik spielen soll.
Aber was bedeutet das genau – und wo liegt der Unterschied zu Patriotismus?
```

Pflicht:
- die **erste Aussage ist eine echte Frage** und steht direkt am Anfang
- vor dem ersten Fragezeichen höchstens ca. 120 Zeichen
- direkt danach folgt die Zuschaueransprache `Denkst du dir gerade vielleicht.`
- danach folgt eine sehr kurze erste Antwort mit `Kurz gesagt:` oder `Einfach gesagt:`
- anschließend folgt eine zweite Frage oder klare Spannungsfrage, die ins Video führt
- keine Sätze wie `X gehört zu den Begriffen ...`, `Seit Jahrhunderten ...` oder lange Definitionen **vor** der eigentlichen Videofrage
- kein generisches `In diesem Video erklären wir ...`

Ziel: Der Einstieg soll sich so anfühlen, als beantworte das Video **sofort die Frage im Kopf des Zuschauers**.

Das Phase-1-Gate prüft diese Struktur für Schema 11+ technisch. Ein abweichender Einstieg ist nur zulässig, wenn eine aktuelle ausdrückliche Nutzeranweisung ihn für das konkrete Video verlangt und dies im Projekt als Override dokumentiert wird.

## VERBINDLICHE YOUTUBE-BILDWELT — HARD LOCK

Neue Schema-10+-Videos verwenden:

```text
serious-minimal-countryball-explainer-youtube-16x9
```

Quelle:

```text
serious-minimal-countryball-explainer
```

Die **Bildwelt bleibt dieselbe wie bei den Reels**; nur das Format ist 16:9. V5 ist kein Stilwechsel, sondern ein Qualitätsupgrade innerhalb dieser Welt.

Unverändert:
- cleane, seriöse 2D-Countryball-Erklärwelt
- perfekt runde Countryballs, wenn Akteure gebraucht werden
- einfache weiße Augen
- kräftige schwarze Konturen
- flache kontrollierte Farben
- keine normalen Menschen
- keine Stickfiguren
- kein Fotorealismus
- kein 3D/Pixar/Clay/Anime
- nicht kindisch, nicht albern

## PREMIUM COUNTRYBALL DESIGN V1 — HARD LOCK

Neue Bilder müssen hochwertiger art-direktiert sein, ohne die Bildwelt zu verlassen.

Pflicht:
- klare Größen- und Blickhierarchie
- ein dominantes Hauptmotiv
- bewusste, ausgewogene negative Fläche
- hochwertige kontrollierte Palette statt zufälliger Buntheit
- normalerweise 1 dominante Grundfarbe + 1–2 Akzentfarben
- sinnvolle Überlagerung und Layering
- einfache Vordergrund-/Mittelgrund-/Hintergrund-Ebenen, wenn hilfreich
- Text als Teil der Komposition, nicht bloß als Label
- Karten mit klaren Grenzen, Routen und Prioritäten
- Beziehungen zeigen: vorher/nachher, Ursache/Folge, Trennung, Bewegung, Vergleich
- keine generische Icon-Liste als Ersatz für eine Szene

**Premium ≠ realistisch. Premium ≠ neue Bildwelt.**

## FIRST SCENE = COVER HARD LOCK

- Bild 01 = Cover UND erste Videoszene
- Start bei 0,0 s
- starke kurze deutsche Cover-Überschrift
- `03-export/THUMBNAIL.png` = Kopie von `Bild 01.png`
- kein Bild 00
- kein separates Thumbnail

## Sichtbare Struktur

```text
youtube/YYYY-KWNN_DD-MM_bis_DD-MM/themen-slug/
├── 00-bildprompts/
│   ├── google-flow-prompt.txt
│   └── images/Bild 01.png ... Bild NN.png
├── 01-voice-script/voice-script.txt
├── 02-audio/voiceover-final.*
├── 03-export/
└── 99-technik/
```

## Phase 1 — ChatGPT

Nach Themenfreigabe erstellt Phase 1:
- Recherche
- Titel
- Gesamtskript
- Google-Flow-Masterprompt
- Bild↔Audio-Mapping
- adaptive Bildplanung nach V3
- Renderplan
- Kapitel
- Upload-Metadaten

Vor Flow:

```bash
npm run validate:youtube-phase1 -- --dir "youtube/<woche>/<thema>"
```

Für neue Schema-11+-Projekte prüft das Gate zusätzlich:
- Script Opening Policy V1

Für Schema-10+-Projekte prüft es weiterhin:
- Visual Policy V5
- Design Quality V1
- Adaptive Pacing V3
- Serious-Minimal-Countryball-Style-ID
- Cover Policy V1
- Asset Generation Policy V1
- Themen-Editor
- kein Bild 00
- keine Bild-zu-Bild-Referenz
- Premium-Design ohne Stilwechsel

## ADAPTIVE IMAGE DENSITY V3 — HARD LOCK

Es gibt **keine feste Bildzahl**.

**1 Bild = 1 klare visuelle Kernaussage.**

Ein zusätzliches Bild wird geplant, wenn mindestens eines zutrifft:
- neuer Kerngedanke
- Ursache → Folge
- Vorher → Nachher
- Orts-/Epochen-/Perspektivwechsel
- neuer Akteur
- eigenständiger Grenz-/Karten-/Routenschritt
- eigenständige Zahl/Datenidee
- Wechsel von Erklärung zu Beispiel
- ein einfacher Bildmoment würde zu lange gehalten

Ziel:
- durchschnittlich ca. **4,5–7,5 s pro Bild**
- ab 9 s Split prüfen
- ab 11 s Split stark bevorzugen
- 16 s globaler Hard-Max
- unter 2,5 s nur bei bewusstem Reveal/Übergang

Komplexe Passage lieber in **mehrere hochwertige Bilder** teilen, statt ein Bild mit zu vielen Symbolen zu überladen.

Verboten:
- starre Zielzahl wie 20/24 Bilder
- Füllbilder ohne neue Aussage
- dasselbe Motiv nur leicht verschoben als neuer Bildmoment
- redundante Karten ohne neuen Informationsschritt

Details: `youtube/ADAPTIVE_PACING_V3.md`.

## Phase 2 — Nutzer + Google Flow

### SESSION RESET HARD LOCK

Für V5 neue Flow-Sitzung verwenden. V3-/V4-Sitzungen gelten für neue Schema-10+-Projekte als veraltet.

### COVER = 3 CANDIDATES HARD LOCK

Nur Bild 01 bekommt mehrere Versuche:
1. exakt 3× generieren
2. genau einen Gewinner auswählen
3. Gewinner einmal zu `Bild 01.png` benennen
4. andere zwei verwerfen

### NON-COVER = SINGLE GENERATION HARD LOCK

Bild 02 bis Bild NN:
- jedes Bild genau 1× generieren
- keine zweite Variante
- keine manuellen Prüfstopps nach 5er-Wellen
- jedes fertige Bild genau einmal final benennen
- maximal 5 aktive Generierungen gleichzeitig

### FINAL IMAGE FOLDER HARD LOCK

Am Ende nur:

```text
00-bildprompts/images/Bild 01.png ... Bild NN.png
```

Keine Unterordner, keine Cover-A/B/C-Versionen, keine Extras, kein Bild 00.

Prüfung:

```bash
npm run validate:youtube-phase2 -- --dir "youtube/<woche>/<thema>"
```

### HARD LOCK: kein Referenzbild

- kein erzeugtes Bild als Vorlage für spätere Bilder
- Bild 01 ist kein Master-Style-Frame
- Konsistenz kommt aus vollständigem geschriebenem Style-Lock

### Sichtbarer Text

Bei deutschen Projekten muss jeder sichtbare lesbare Text Deutsch sein. Englisch/Pseudo-Schrift = Hard Fail in der Promptplanung.

## YouTube-Audio-Pacing

- überlange Sprechpausen automatisch kürzen
- kurze natürliche Pausen erhalten
- Anfangsstille straffen
- Endstille entfernen
- Voice-over exakt 1,10x
- Tonhöhe erhalten
- −16 LUFS
- True Peak max. −1,5 dBTP
- 48 kHz
- Nutzeroriginal nie verändern

Whisper misst erst das optimierte Audio.

## Phase 3

```bash
npm run phase3:youtube -- --dir "youtube/<woche>/<thema>"
```

Reihenfolge:
1. Phase-1-Gate
2. Phase-2-Asset-Gate
3. finale Bilder + genau eine Nutzerstimme bestimmen
4. Audio optimieren
5. Whisper-Wortzeiten
6. Bildanker
7. Audio-Hard-Gate
8. `FINAL_TIMELINE.json`, Bild 01 bei 0,0 s
9. Adaptive Pacing V3 prüfen
10. Pre-Render-Hard-Gate
11. Motion + SFX
12. Export; `THUMBNAIL.png = Bild 01.png`
13. Post-Render-Hard-Gate

## Verboten

- neues Projekt vor Themenfreigabe
- Duplikat nur umformulieren
- bei neuen Schema-11+-Projekten: abstrakter Definitions-Einstieg vor der eigentlichen Videofrage
- generisches `In diesem Video erklären wir ...`
- Stilwechsel unter dem Wort „Premium“
- realistische Editorial-/Menschenwelt statt Countryball-DNA
- normales Mensch-/Stickman-Design
- separates Bild 00
- Cover ≠ erste Szene
- weniger/mehr als 3 Cover-Kandidaten
- Bild 02..NN mehrfach generieren
- Prüfstopps nach 5er-Wellen
- Varianten/Extras im finalen Bilderordner
- Bild-zu-Bild-Referenzen
- starre Bildanzahl unabhängig vom Inhalt
- lange einfache Holds nur um weniger Bilder zu erzeugen
- überladene Einzelbilder statt sinnvoller Splits
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

## Definition of Done für neu angelegte Schema-11+-Projekte

Fertig erst wenn:
- Themen-Editor `APPROVED_NEW`
- Script Opening Policy V1 bestanden
- Visual Policy V5
- Design Quality V1
- Adaptive Pacing V3
- gleiche Serious-Minimal-Countryball-DNA wie Reels
- Premium-Komposition innerhalb dieser Welt
- Bildzahl inhaltsgetrieben
- komplexe Passagen sinnvoll gesplittet
- Bild 01 = Cover + erste Szene
- Cover 3× → 1 Gewinner
- Bild 02..NN je 1×
- alle finalen Bilder in einem flachen Ordner
- kein Bild 00
- keine Referenzbilder
- Audio 1,10x / −16 LUFS / max. −1,5 dBTP
- Pre-/Post-Render-Gates bestanden
