# YOUTUBE WORKFLOW — VERBINDLICHE REGEL FÜR LANGVIDEOS

**Stand: 2026-10-05**  
**Visual Policy Version: 5**  
**Design Quality Version: 1**  
**Adaptive Pacing Version: 3**  
**Script Opening Policy Version: 1**  
**Scene Illustration Policy Version: 2**  
**Topic Visual Relevance Policy Version: 1**  
**Visual Flexibility Policy Version: 1**  
**End Hold Policy Version: 1**  
**Cover Policy Version: 2**  
**Topic Editor Version: 1**  
**Asset Generation Policy Version: 2**

Diese Datei gilt ausschließlich für YouTube-Langvideos. Reels bleiben davon getrennt und werden nicht verändert.

## Oberste Qualitätspriorität: aus JEDEM fertigen Langvideo lernen

**Nach jedem fertiggestellten YouTube-Langvideo** zuerst das reale Ergebnis (Hook, Story, Visuals, Timing, Audio, Cover, Metadaten und technische Qualität) soweit verfügbar kritisch prüfen. Die wichtigste belegte, wiederholbare Schwachstelle gezielt in den **zentralen YouTube-Vorlagen, Regeln, Validatoren oder Tests** für künftige Videos beheben, sofern der konkrete Mehrwert das Risiko rechtfertigt.

Pflichtverfahren: `docs/POST_VIDEO_IMPROVEMENT.md`. Bei fehlenden Belegen kein Qualitätsurteil erfinden; bei keinem klaren Mehrwert keine Änderung vornehmen. Die abgeschlossene Video-Produktion bleibt ohne ausdrücklichen Einzelvideo-Auftrag unangetastet. Aktuelle Nutzeranweisungen und Sicherheit haben Vorrang.

## Repo-Verbesserung schützt einzelne Videos

`docs/CHANGE_SAFETY_POLICY.md` gilt hier als übergreifende Schutzregel. „Verbessere den Kanal/das Repo“ verändert **ausschließlich wiederverwendbare Pipeline-Dateien, Template, Regeln und Tests**, nie automatisch alte oder gerade angelegte einzelne Videoprojekte. Analyse oder Feedback eines gerenderten Videos ist keine Freigabe, das Videoprojekt anzupassen. Nur bei ausdrücklich auf das konkrete Video bezogenem Auftrag ist eine gezielte Projektänderung zulässig.

Keine kosmetischen oder spekulativen Features ohne echten Mehrwert; niemals bestehende Videos, Exporte, Sprechtexte, Flow-Prompts oder Schemaversionen anderer Projekte als Nebenwirkung ändern. Vor Merge: kleinster sinnvoller Diff, Kompatibilität, vollständige Tests, betroffene Videoverzeichnisse auf Änderungen prüfen.


## Status der Testphase

Die YouTube-Testphase ist seit **27.09.2026 abgeschlossen**. Die Grundrichtung gilt als produktionsreif.

Verbindliche Learnings und die Schnellprüfung stehen zusätzlich in:

```text
youtube/PRODUKTIONSSTANDARD_NACH_TESTPHASE.md
```

Neue Videos laufen ab jetzt als reguläre Produktion. Änderungen an der Grundbildwelt erfolgen nur bei ausdrücklicher Nutzeranweisung; normale Verbesserungen sind gezielte Feinanpassungen einzelner Bilder, Bilddichte, Visual Forms oder Kompositionen.

## Priorität

1. aktuelle ausdrückliche Nutzeranweisung
2. `youtube/YOUTUBE_WORKFLOW.md`
3. `config/youtube-channel-policy.json`
4. `config/youtube-topic-registry.json`
5. `youtube/YOUTUBE_VISUAL_WORLD.md`
6. `youtube/PRODUKTIONSSTANDARD_NACH_TESTPHASE.md`
7. `youtube/ADAPTIVE_PACING_V3.md`
8. `youtube/PHASE3_HARD_GATE.md`
9. `THEMEN_HISTORIE.md`

## Kanalfokus — POLITIK ZUERST, BILDUNG UND GEOGRAFIE DAZU

**Hauptziel Weltlogik: Politik erklären und politische Bildung vermitteln.** Neue YouTube-Videos dürfen aktuelle politische Ereignisse und geopolitische Entwicklungen behandeln, aber ebenso **politische Begriffe, ihre Bedeutung und Herkunft, Ideologien, Staatssysteme, Institutionen, Gesetze, Bündnisse, Wahlen und politische Mechanismen**. Geografie, Regionen und Grenzen sind erlaubt und besonders wertvoll, wenn sie politische Zusammenhänge verständlich machen.

**Ursprung und Geschichte sind ausdrücklich zulässig**, zum Beispiel die Entstehung der Begriffe „links“ und „rechts“ oder die historische Entwicklung eines politischen Systems. Eine ausführliche Rückblende ist sinnvoll, wenn sie die politische Leitfrage erklärt. Reine Geschichtserzählungen ohne politische/geografische Bildungsfrage bleiben außerhalb des autonomen Schwerpunkts.

**Aktuelle Themen sind erwünscht, aber kein Zwang.** Eine spannende zeitlose Begriffserklärung braucht keinen künstlichen News-Anlass. Themen nach Relevanz, Nutzen für Zuschauer, Faktenqualität, anschaulichem Erklärpotenzial und Reichweitenchance auswählen. Fakten prüfen, kontroverse Positionen fair erklären, ohne parteiische Überzeugungsabsicht; Viralität nie versprechen.

Verbindliches Vorgehen: `youtube/TOPIC_SELECTION_POLICY.md`, maschinenlesbarer Fokus: `config/youtube-channel-policy.json`. Bestehende Videoprojekte und ihre alten Themenkategorien unverändert schützen.

## SCHRITT 0 — THEMEN-EDITOR HARD LOCK

Vor neuem Projektordner, Skript oder Flow-Prompt:

```bash
npm run topic:youtube -- --topic "NEUES THEMA"
```

Nur `APPROVED_NEW / THEMEN-EDITOR: FREI` erlaubt die Produktion. `REVIEW_SIMILAR` und `BLOCKED_DUPLICATE` stoppen das Thema.

## SCRIPT OPENING V1 — HARD LOCK

Der Einstieg wird **für jedes Thema neu gewählt**. Es gibt kein festes Satzmuster mehr.

Ziel der ersten Sätze:
- sofort Interesse erzeugen
- das konkrete Thema früh erkennbar machen
- verständlich statt künstlich clever sein
- Unterhaltung und Information verbinden
- einen klaren Grund geben, warum der Zuschauer weiterhören sollte

Erlaubte Einstiegsformen:
- **konkrete Szene / Mini-Geschichte:** direkt in einen relevanten Moment springen
- **Moment in der Zeit:** mit Datum, Ort oder historischer Situation beginnen
- **überraschender Fakt:** eine starke, wahre Information als Türöffner verwenden
- **Konflikt:** zwei Interessen, Staaten oder Entwicklungen direkt gegeneinanderstellen
- **Paradox / Widerspruch:** etwas scheinbar Unlogisches erklären
- **direkte Frage:** wenn eine Frage wirklich die stärkste Form für dieses Thema ist

Beispiele für die Denkweise — nicht als feste Vorlagen kopieren:

```text
Berlin, Juni 1948. Plötzlich sind Straßen, Bahnlinien und Wasserwege nach West-Berlin blockiert. Jetzt hängt die Versorgung einer ganzen Stadt davon ab, ob Flugzeuge schnell genug Nachschub bringen können.
```

```text
Fast ein halbes Jahrhundert standen sich zwei Supermächte gegenüber, ohne einander direkt den Krieg zu erklären. Gleichzeitig starben in ihren Stellvertreterkriegen Millionen Menschen.
```

```text
Wie konnten die USA und die Sowjetunion gemeinsam Hitler besiegen und nur wenige Jahre später zu erbitterten Rivalen werden?
```

Pflicht:
- Hook passt konkret zum Thema und ist keine austauschbare Floskel
- Thema wird früh verständlich
- nach dem Hook folgt zügig Kontext, Konflikt oder Leitgedanke
- Ursache → Folge statt bloßer Faktenliste
- konkrete Beispiele und relevante Details liefern echten Mehrwert
- Sprache bleibt natürlich, gut sprechbar und leicht verständlich
- bei aufeinanderfolgenden Videos nicht immer denselben Opening-Typ benutzen

Nicht mehr als Standard verwenden:
- `Denkst du dir gerade vielleicht.`
- `Kurz gesagt:` / `Einfach gesagt:` als Pflichtformel
- immer Frage → Kurzantwort → zweite Frage

Verboten:
- `In diesem Video erklären wir ...`
- `Heute geht es um ...`
- abstrakter Lexikon-/Schulbuchstart
- leere Clickbait-Spannung ohne anschließenden Informationswert
- kopierte Opening-Schablone über mehrere Videos hinweg

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
- perfekt runde Countryballs, **wenn ein Countryball gebraucht wird**
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
- kontrolliert lebendigere und wechselnde Farbwelten

Standardmäßig vermeiden:
- abstrakte Poster-/Präsentationstafeln
- Mehrspalten-Erklärbilder
- Dashboard-/Kachel-Look
- Icon-Raster als Hauptbild
- viele kleine Symbole gleichzeitig

Eine einfache Sachillustration, ein Einzelobjekt oder ein kurzes Schema ist ausdrücklich zulässig, wenn es die Aussage besser erklärt als eine vollständige Szene.

## VISUAL FLEXIBILITY V1 — HARD LOCK

Für neue Schema-13+-Videos gilt:

**Inhalt vor Figur. So einfach wie möglich, so komplex wie nötig.**

Countryballs sind pro Bild optional. Vor jedem Bild wird zuerst die beste Darstellungsform gewählt.

Ausdrücklich erlaubt:
- `object-only`
- `map-only`
- `document-only`
- `simple-schema`
- `countryball-action`
- `multi-actor`
- `multi-element`
- `full-scene`

Regeln:
- Countryball niemals nur wegen der Kanaloptik einfügen
- einzelne Objekte, Karten, Dokumente, Gebäude oder Schemata dürfen ein komplettes Bild tragen
- mehrere Countryballs oder mehrere Elemente nur, wenn die Aussage sie wirklich braucht
- keine zusätzliche Komplexität nur damit ein Bild „premium“ wirkt
- Vordergrund/Mittelgrund/Hintergrund nur wenn hilfreich
- einfache Komposition ist kein Qualitätsfehler
- komplexe Szene ist erlaubt, wenn sie das Verständnis verbessert
- gleiche visuelle DNA bleibt unabhängig von der gewählten Visual Form erhalten

## TOPIC VISUAL RELEVANCE V1 — HARD LOCK

Für jedes Bild gilt ab Schema 12:

**Das Bild muss gleichzeitig zum gesprochenen Satz UND zum konkreten Videothema passen.**

Jeder Bildmoment erhält deshalb in Phase 1:

```text
Visual Purpose: ...
Topic Anchor: ...
Visual Form: ...
Composition Mode: ...
Prompt: ...
```

`Topic Anchor` ist Pflicht und benennt das konkrete themenspezifische Element der Szene. Für Schema 13 ist zusätzlich `Visual Form` Pflicht.

Prüffrage:

> Könnte dieses Bild nahezu unverändert in einem anderen Erklärvideo vorkommen?

Wenn ja, ist es zu generisch und wird neu geplant.

Regeln:
- themenspezifische Orte, Institutionen, Dokumente, Konflikte und Objekte bevorzugen
- generische Metapher nur, wenn keine bessere themenspezifische Darstellung existiert
- zufällige Länder-/Flaggen-Countryballs verboten
- Land/Flagge nur mit echtem narrativem oder historischem Grund
- keine Deutschland-/Frankreich-/USA-Figuren nur damit ein abstraktes Konzept „politisch“ aussieht
- letztes Bild fasst den **konkreten Themenkern** zusammen und endet nicht auf einer austauschbaren Moral

## DIE 5 FESTEN LEARNINGS AUS DER TESTPHASE

1. **Inhalt vor Figur:** Countryball nur, wenn er wirklich hilft.
2. **So einfach wie möglich, so komplex wie nötig:** Ein Objekt oder Schema kann völlig ausreichen.
3. **Anschauliche Illustration vor abstrakter Tafel:** konkrete Darstellung statt Dashboard-/Poster-Look.
4. **Jedes Bild muss zum konkreten Thema gehören:** Satz + Topic Anchor müssen gleichzeitig stimmen.
5. **Dichte Stellen früher splitten:** lieber ein sinnvolles Zusatzbild als ein überladenes Bild oder zu langer Hold.

Die ausführliche Fassung steht in `youtube/PRODUKTIONSSTANDARD_NACH_TESTPHASE.md`.

## PREMIUM COUNTRYBALL DESIGN V1 — HARD LOCK

Premium bedeutet bessere Gestaltung innerhalb derselben Bildwelt:
- klare Größen- und Blickhierarchie
- dominantes Hauptmotiv, wenn mehrere Elemente vorkommen
- bewusstes Layering nur wenn hilfreich
- ausgewogene negative Fläche
- kontrollierte, aber abwechslungsreiche Palette
- hochwertige Typografie
- saubere Karten/Grenzen/Routen
- visuelle Beziehungen statt Objektlisten

**Premium ≠ realistisch. Premium ≠ neue Bildwelt. Premium ≠ kompliziert.**

## SEPARATE COVER — EXPORT ONLY HARD LOCK

Für NEUE Projekte mit **Cover Policy V2**:

- Cover wird separat für den Export erzeugt: `03-export/THUMBNAIL.png`.
- Cover gehört **niemals** zur Videotimeline.
- `Bild 01.png` ist eine normale, zum ersten gesagten Satz passende Szene **ohne Cover-Headline**.
- Das Video beginnt mit `Bild 01.png` bei 0,0 Sekunden.
- Cover exakt drei Kandidaten → besten wählen → nur `THUMBNAIL.png` behalten.
- Bild 01–NN jeweils exakt ein normaler Bildmoment und je einmal erzeugt.
- Keine Cover-Kandidaten, keine Cover-Kopie oder Bild 00 im Ordner `images/`.
- Vor Render Bild 01 und Cover per Hash prüfen: identische Datei ist ein Fehler.

**Alte Projekte mit Cover Policy V2 bleiben reproduzierbar.**

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

Für Schema-13+-Projekte prüft das Gate zusätzlich:
- Scene Illustration Policy V2
- Topic Visual Relevance Policy V1
- Visual Flexibility Policy V1
- `Topic Anchor` für jeden geplanten Bildmoment
- `Visual Form` für jeden geplanten Bildmoment
- keine erzwungene Countryball-Pflicht
- End Hold Policy V1

Weiterhin geprüft:
- Script Opening V1
- Visual Policy V5
- Design Quality V1
- Adaptive Pacing V3
- Countryball-Style-ID
- Cover Policy V2
- Asset Generation Policy V2
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
- eigenständigem Objekt/Begriff
- Wechsel Erklärung → Beispiel
- zu langem einfachen Hold

Ziel:
- durchschnittlich ca. 4,5–7,5 s pro Bild
- ab 9 s Split prüfen
- ab 11 s Split stark bevorzugen
- 16 s Hard-Max
- keine Füllbilder

Komplexe Passage = eher früher sinnvoll splitten. Einfache Passage = nicht künstlich aufblähen.

## Phase 2 — Nutzer + Google Flow

### COVER = 3 CANDIDATES HARD LOCK

Das COVER ist eine eigenständige Bildgenerierung, **keine Videoszene**:
1. Drei separate Cover-Kandidaten.
2. Einen Gewinner auswählen.
3. Als `03-export/THUMBNAIL.png` ablegen, nicht als `Bild 01.png`.
4. Zwei ungewählte Kandidaten entfernen.

### NON-COVER = SINGLE GENERATION HARD LOCK

- Jede normale Szene **Bild 01–NN** wird einmal erfolgreich erzeugt; fehlgeschlagene oder fehlende Bilder erneut erzeugen, nicht beliebige Varianten.
- **NEUER STANDARD für Projekte ab 13.10.2026: genau fünf Bilder pro Durchlauf (letzte Gruppe ggf. kleiner).** Maximal fünf aktive Google-Flow-Generierungen gleichzeitig, **keine nächste Gruppe**, solange nicht alle fünf fertig, kontrolliert und korrekt nummeriert sind. Dies ist ein automatischer Vollständigkeitscheck, kein manueller kreativer Freigabestopp.
- Cover zuerst: 3 Kandidaten → Gewinner als separates `03-export/THUMBNAIL.png` festlegen. Erst danach Bild 01–05 starten.
- Die fertigen 5 Google-Flow-Ausgaben zuerst **sammeln**; dann alle 5 auf Existenz, eindeutige Szenenzuordnung, technische PNG-Gültigkeit und Nummern prüfen.
- **Erst wenn die Gruppe vollständig ist**, die Quellen kontrolliert als `Bild NN.png` in `00-bildprompts/images/` übernehmen. Bei fehlendem/defektem Bild genau dieses Bild nachgenerieren; Vorhandene nicht wahllos neu erstellen.
- Danach **denselben 5er-Block noch einmal im finalen Ordner kontrollieren**. Erst wenn jede Nummer vorhanden und eindeutig ist, Gruppe 06–10 usw. starten.
- Alle Quellbilder mit expliziten `imageNumber`-Zuordnungen erfassen; niemals aus Dateidatum oder Finder-Sortierung auf die richtige Szene schließen. Ursprungsdownloads nicht überschreiben.
- **Letzte Gesamtprüfung** auf genau `Bild 01.png` bis `Bild NN.png`, weder Lücken noch Duplikate/falsche Namen, keine Cover-Kandidaten oder zusätzliche Dateien; separate Thumbnail prüfen. Ohne grünen Audit kein Render.
- Verbindliches Verfahren: `youtube/FLOW_BATCH_5_POLICY.md`; technischer Batch-Check: `npm run flow:youtube-batch`. Gilt nicht rückwirkend für Altprojekte und nicht für die getrennte Reel-Pipeline.

### FINAL IMAGE FOLDER HARD LOCK

`00-bildprompts/images/` enthält ausschließlich `Bild 01.png` bis `Bild NN.png`.
`03-export/THUMBNAIL.png` wird separat erzeugt und nie als Timelinebild benutzt.

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
13. Export: separat generiertes `THUMBNAIL.png` bleibt außerhalb der Timeline.
14. Post-Render-Hard-Gate: genau vier Dateien (Video, Cover, Upload mit Titel/Beschreibung/Caption, zeitgestempelter Sprechertext)

## Verboten

- neues Projekt vor Themenfreigabe
- Duplikat nur umformulieren
- abstrakter Definitions-Einstieg bei neuen Schema-11+-Projekten
- generische Video-Ansage statt inhaltlichem Hook
- identische Frage-/Kurzantwort-Schablone als Standard für jedes Video
- Stilwechsel unter dem Wort „Premium“
- normale Menschen/Stickfiguren/Realismus
- Countryball in jedem Bild erzwingen
- komplexe Szene erzwingen, obwohl Objekt/Karte/Dokument/Schema klarer wäre
- abstrakte Poster-/Dashboard-Bilder als Standard
- generische austauschbare Bilder ohne Topic Anchor
- zufällige Länder/Flaggen ohne narrativen Grund
- generisches Schlussbild ohne Bezug zum konkreten Thema
- Cover in der Videotimeline (V2)
- Bild 01 als Cover statt normaler Szene (V2)
- weniger/mehr als 3 separate Cover-Kandidaten
- Bild 01..NN mehrfach generieren
- Referenzbilder
- starre Bildanzahl
- dichte Passage unnötig in ein einziges überladenes Bild pressen
- End Hold unter 1,2 s oder über 1,5 s bei Schema 12+
- Audio-Stille als Ersatz für den Schlussbild-Hold

## Definition of Done für neue Schema-13+-Projekte

Fertig erst wenn:
- Themen-Editor `APPROVED_NEW`
- Script Opening V1 bestanden
- Einstieg wurde passend zum konkreten Thema gewählt und nicht aus einer festen Standardformel kopiert
- Visual Policy V5
- Design Quality V1
- Scene Illustration V2
- Topic Visual Relevance V1
- Visual Flexibility V1
- jeder Bildmoment besitzt einen konkreten Topic Anchor
- jeder Bildmoment besitzt eine bewusst gewählte Visual Form
- kein Countryball wurde nur wegen der Kanaloptik erzwungen
- einfache Bilder dürfen einfach bleiben
- komplexe Stellen wurden bei Bedarf sinnvoll auf zusätzliche Bilder verteilt
- keine beliebigen Länder-/Flaggen-Countryballs
- Adaptive Pacing V3
- Bildzahl inhaltsgetrieben
- Bild 01 = normale erste Szene; Cover getrennt im Export
- Separates Cover 3× → 1 Gewinner
- Bild 01..NN je 1×
- alle finalen Bilder in einem flachen Ordner
- keine Referenzbilder
- Audio 1,10x / −16 LUFS / max. −1,5 dBTP
- letztes Bild hält nach dem letzten Wort 1,2–1,5 s, Ziel 1,3 s
- finale Szene fasst den konkreten Themenkern zusammen
- Pre-/Post-Render-Gates bestanden

## EXPORT V2 — NUR VIER DATEIEN

Der Ordner `03-export/` enthält nach Phase 3 **exakt**:

```text
FERTIGES-VIDEO.mp4
THUMBNAIL.png
YOUTUBE-UPLOAD.txt
YOUTUBE-UNTERTITEL-ZEITABSCHNITTE.txt
```

`YOUTUBE-UPLOAD.txt` enthält ausschließlich **TITEL**, **BESCHREIBUNG**, **CAPTION** als drei Abschnitte. Keine getrennte Titel-, Kapitel-, Beschreibung-, Tags- oder Caption-Datei. Kapitel bleiben intern oder können bei Bedarf in die Beschreibung aufgenommen werden. Zeittranskript benutzt echte Whisper-Zeitstempel. Das Cover wird außerhalb der Timeline erzeugt.
