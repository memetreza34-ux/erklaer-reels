# YOUTUBE WORKFLOW — VERBINDLICHE REGEL FÜR LANGVIDEOS

**Stand: 2026-09-26**  
**Visual Policy Version: 5**  
**Design Quality Version: 1**  
**Adaptive Pacing Version: 3**  
**Script Opening Policy Version: 1**  
**Scene Illustration Policy Version: 2**  
**Topic Visual Relevance Policy Version: 1**  
**End Hold Policy Version: 1**  
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

Alle neu angelegten Schema-11+-YouTube-Skripte beginnen direkt mit der Frage, wegen der der Zuschauer geklickt hat.

Standard:

```text
[Direkte Videofrage]? Denkst du dir gerade vielleicht.
Kurz gesagt: [sehr kurze erste Antwort].
Aber [Leitfrage / Spannung für den Rest des Videos]?
```

Erlaubt ist statt `Kurz gesagt:` auch `Einfach gesagt:`.

Pflicht:
- erste Aussage = echte Videofrage
- direkt danach `Denkst du dir gerade vielleicht.`
- kurze erste Antwort
- anschließende Leit-/Spannungsfrage
- kein abstrakter Schulbuch-Einstieg vor der eigentlichen Frage
- kein generisches `In diesem Video erklären wir ...`

## VERBINDLICHE YOUTUBE-BILDWELT — HARD LOCK

Neue Videos verwenden:

```text
serious-minimal-countryball-explainer-youtube-16x9
```

Quelle:

```text
serious-minimal-countryball-explainer
```

Die Bildwelt bleibt dieselbe wie bei den Reels; nur das Format ist 16:9.

Unverändert:
- cleane, seriöse 2D-Countryball-Erklärwelt
- perfekt runde Countryballs
- einfache weiße Augen
- kräftige schwarze Konturen
- flache 2D-Farben
- keine normalen Menschen
- keine humanoiden Cartoon-Menschen
- keine menschlichen Silhouetten oder realistischen Hände
- keine Stickfiguren
- kein Fotorealismus
- kein 3D/Pixar/Clay/Anime

## SCENE ILLUSTRATION V2 — HARD LOCK

Für neue Schema-12+-Videos gilt:

**Anschauliche Illustration vor abstrakter Erklärtafel.**

Bevorzugt:
- erkennbare Orte oder Situationen
- thematisch passende Institutionen und Umgebungen
- Countryballs handeln sichtbar, wenn Akteure gebraucht werden
- Objekte in der Szene statt schwebender Icon-Sammlungen
- Vordergrund/Mittelgrund/Hintergrund
- kontrolliert lebendigere und wechselnde Farbwelten

Standardmäßig verboten:
- abstrakte Poster-/Präsentationstafeln
- Mehrspalten-Erklärbilder
- Dashboard-/Kachel-Look
- Icon-Raster als Hauptbild
- viele kleine Symbole gleichzeitig
- statisches Objekt auf leerem Hintergrund

Infografik nur, wenn der Inhalt nicht sinnvoll als konkrete Szene darstellbar ist; dann maximal eine klare Beziehung, kein Dashboard.

## TOPIC VISUAL RELEVANCE V1 — HARD LOCK

Für jedes Bild gilt ab Schema 12:

**Das Bild muss gleichzeitig zum gesprochenen Satz UND zum konkreten Videothema passen.**

Jeder Bildmoment erhält deshalb in Phase 1:

```text
Visual Purpose: ...
Topic Anchor: ...
Composition Mode: ...
Prompt: ...
```

`Topic Anchor` ist Pflicht und benennt das konkrete themenspezifische Element der Szene.

Prüffrage:

> Könnte dieses Bild nahezu unverändert in einem anderen Erklärvideo vorkommen?

Wenn ja, ist es zu generisch und wird neu geplant.

Regeln:
- themenspezifische Orte, Institutionen, Dokumente, Konflikte und Objekte bevorzugen
- generische Metapher nur, wenn keine bessere themenspezifische Szene existiert
- zufällige Länder-/Flaggen-Countryballs verboten
- Land/Flagge nur mit echtem narrativem oder historischem Grund
- keine Deutschland-/Frankreich-/USA-Figuren nur damit ein abstraktes Konzept „politisch“ aussieht
- letztes Bild fasst den **konkreten Themenkern** zusammen und endet nicht auf einer austauschbaren Moral

## PREMIUM COUNTRYBALL DESIGN V1 — HARD LOCK

Premium bedeutet bessere Gestaltung innerhalb derselben Bildwelt:
- klare Größen- und Blickhierarchie
- dominantes Hauptmotiv
- bewusstes Layering
- ausgewogene negative Fläche
- kontrollierte, aber abwechslungsreiche Palette
- hochwertige Typografie
- saubere Karten/Grenzen/Routen
- visuelle Beziehungen statt Objektlisten

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
- adaptive Bildplanung
- Renderplan
- Kapitel
- Upload-Metadaten

Vor Flow:

```bash
npm run validate:youtube-phase1 -- --dir "youtube/<woche>/<thema>"
```

Für Schema-12+-Projekte prüft das Gate zusätzlich:
- Scene Illustration Policy V2
- Topic Visual Relevance Policy V1
- `Topic Anchor` für jeden geplanten Bildmoment
- End Hold Policy V1

Weiterhin geprüft:
- Script Opening V1
- Visual Policy V5
- Design Quality V1
- Adaptive Pacing V3
- Countryball-Style-ID
- Cover Policy V1
- Asset Generation Policy V1
- Themen-Editor
- keine Bild-zu-Bild-Referenzen

## ADAPTIVE IMAGE DENSITY V3 — HARD LOCK

Es gibt keine feste Bildzahl.

**1 Bild = 1 klare visuelle Kernaussage.**

Zusätzliches Bild bei:
- neuem Kerngedanken
- Ursache → Folge
- Vorher → Nachher
- Orts-/Epochen-/Perspektivwechsel
- neuem Akteur
- eigenständigem Karten-/Grenz-/Routenschritt
- Wechsel Erklärung → Beispiel
- zu langem einfachen Hold

Ziel:
- durchschnittlich ca. 4,5–7,5 s pro Bild
- ab 9 s Split prüfen
- ab 11 s Split stark bevorzugen
- 16 s Hard-Max
- keine Füllbilder

## Phase 2 — Nutzer + Google Flow

### COVER = 3 CANDIDATES HARD LOCK

Nur Bild 01:
1. exakt 3× generieren
2. genau einen Gewinner auswählen
3. Gewinner zu `Bild 01.png`
4. andere zwei verwerfen

### NON-COVER = SINGLE GENERATION HARD LOCK

Bild 02 bis Bild NN:
- jedes Bild exakt 1×
- keine zweite Variante
- keine Prüfstopps nach 5er-Wellen
- maximal 5 aktive Generierungen gleichzeitig
- jedes Bild genau einmal final benennen

### FINAL IMAGE FOLDER HARD LOCK

Nur:

```text
00-bildprompts/images/Bild 01.png ... Bild NN.png
```

Keine Unterordner, Varianten, Extras oder Bild 00.

## Sichtbarer Text

Bei deutschen Projekten muss jeder sichtbare lesbare Text Deutsch sein. Englisch/Pseudo-Schrift = Hard Fail.

## YouTube-Audio-Pacing

- **überlange Sprechpausen automatisch kürzen**
- natürliche kurze Pausen erhalten
- Endstille entfernen
- Voice-over 1,10x, Tonhöhe erhalten
- −16 LUFS
- True Peak max. −1,5 dBTP
- 48 kHz
- Nutzeroriginal nie verändern
- Audio zuerst vollständig optimieren; **erst danach Whisper**-Wortzeiten erzeugen

## END HOLD V1 — HARD LOCK

Neue Schema-12+-Videos enden nicht unmittelbar nach dem letzten Wort.

- letztes Bild bleibt **1,2–1,5 Sekunden** nach dem letzten gesprochenen Wort sichtbar
- Zielwert: **1,3 Sekunden**
- dieser Hold gehört zur Timeline und wird nicht durch Stille im Voice-over simuliert
- die Timeline liest den Wert aus `99-technik/video.json -> renderPolicy.endHoldSeconds`
- Werte außerhalb 1,2–1,5 s blockieren Schema-12+-Timeline-Build

Dadurch bekommt der letzte Gedanke sichtbar Zeit zu wirken und das Video endet nicht abgeschnitten.

## Phase 3

```bash
npm run phase3:youtube -- --dir "youtube/<woche>/<thema>"
```

Reihenfolge:
1. Phase-1-Gate
2. Phase-2-Asset-Gate
3. finale Bilder + genau eine Nutzerstimme
4. Audio optimieren
5. Whisper-Wortzeiten
6. Bildanker
7. Audio-Hard-Gate
8. `FINAL_TIMELINE.json`, Bild 01 bei 0,0 s
9. Adaptive Pacing prüfen
10. Pre-Render-Hard-Gate
11. Motion + SFX
12. letzter Bildmoment mit konfiguriertem End Hold
13. Export; `THUMBNAIL.png = Bild 01.png`
14. Post-Render-Hard-Gate

## Verboten

- neues Projekt vor Themenfreigabe
- Duplikat nur umformulieren
- abstrakter Definitions-Einstieg bei neuen Schema-11+-Projekten
- Stilwechsel unter dem Wort „Premium“
- normale Menschen/Stickfiguren/Realismus
- abstrakte Poster-/Dashboard-Bilder als Standard bei Schema 12+
- generische austauschbare Bilder ohne Topic Anchor
- zufällige Länder/Flaggen ohne narrativen Grund
- generisches Schlussbild ohne Bezug zum konkreten Thema
- separates Bild 00
- Cover ≠ erste Szene
- weniger/mehr als 3 Cover-Kandidaten
- Bild 02..NN mehrfach generieren
- Referenzbilder
- starre Bildanzahl
- End Hold unter 1,2 s oder über 1,5 s bei Schema 12+
- Audio-Stille als Ersatz für den Schlussbild-Hold

## Definition of Done für neue Schema-12+-Projekte

Fertig erst wenn:
- Themen-Editor `APPROVED_NEW`
- Script Opening V1 bestanden
- Visual Policy V5
- Design Quality V1
- Scene Illustration V2
- Topic Visual Relevance V1
- jeder Bildmoment besitzt einen konkreten Topic Anchor
- keine beliebigen Länder-/Flaggen-Countryballs
- Adaptive Pacing V3
- Bildzahl inhaltsgetrieben
- Bild 01 = Cover + erste Szene
- Cover 3× → 1 Gewinner
- Bild 02..NN je 1×
- alle finalen Bilder in einem flachen Ordner
- keine Referenzbilder
- Audio 1,10x / −16 LUFS / max. −1,5 dBTP
- letztes Bild hält nach dem letzten Wort 1,2–1,5 s, Ziel 1,3 s
- finale Szene fasst den konkreten Themenkern zusammen
- Pre-/Post-Render-Gates bestanden
