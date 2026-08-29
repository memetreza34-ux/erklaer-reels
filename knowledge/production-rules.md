# Produktionsregeln

> Bei Widersprüchen gilt immer `CURRENT_WORKFLOW.md`.

## Ziel

Jedes Reel erklärt einen Begriff, ein System, ein Verhalten oder einen Zusammenhang so einfach, dass Zuschauer ihn ohne Vorwissen verstehen.

Die **Themenwelt ist offen**. Die **Bildwelt ist fest: `modern-countryball-explainer`**.

## Script

- ein durchgehender deutscher Erzähler
- direkte Hook ohne lange Einleitung
- 155–175 Wörter
- 55–60 Sekunden Voice-over nach Optimierung auf exakt 1,10x
- einfache, erwachsene und neutrale Sprache
- keine Dialogrollen
- politische Inhalte neutral und ohne Parteienwerbung
- Unsicherheit klar kennzeichnen
- letzte zwei narrative Szenen: persönliche Prüf-/Erkenntnisfrage → konkrete Lösung/Abschlusssatz

## Themenwahl

Es gibt keine feste Pillar-Quote und keine Beschränkung auf Länder, Geschichte, Politik oder Psychologie.

Geeignet sind grundsätzlich alle starken Erklärthemen, z. B. Alltag, Verhalten, Beziehungen, Gesellschaft, Kultur, Wissenschaft, Technik, Internet, Lernen, Arbeit, Wirtschaft, Gesundheit, Ernährung, Sprache, Geschichte, Geografie, Politik, Mythen oder kuriose Warum-Fragen.

Bei autonomer Auswahl zählen:
- Hook/Neugier
- klarer Aha-Moment
- faktische Belegbarkeit
- visuelle Klarheit
- Abwechslung gegenüber den letzten Reels
- Teilbarkeit oder Alltagsrelevanz

## Bildwelt — fest

Neue Reels verwenden:

```text
visualStyleId = "modern-countryball-explainer"
visualStyleReason = "Globale feste Bildwelt für alle neuen Erklär-Reels: moderner minimalistischer Countryball-Erklärstil."
```

Verbindliche Style-Bibel: `knowledge/fixed-visual-world.md`.

Die Bildwelt wird nicht pro Thema ausgewählt und nicht zwischen Reels rotiert.

### Kernregeln

- moderner minimalistischer Countryball-inspirierter 2D-Erklärgrafik-Stil
- runde Kugelfiguren für Menschen, Gruppen, Institutionen oder Länder
- Länder-/Regionsflaggen nur bei tatsächlicher geografischer Relevanz; sonst neutrale Kugeln
- einfache weiße expressive Augen, minimale Gesichtselemente
- dicke saubere schwarze Konturen
- sauberer flacher Vektor-/Comic-Look
- dezente weiche Schatten, höchstens sehr leichte Textur
- ein dominantes Hauptmotiv, wenige unterstützende Requisiten
- einfarbiger oder sanft texturierter Hintergrund
- klare Metapher, möglichst innerhalb ungefähr einer Sekunde verständlich
- keine realistischen Menschen, kein Fotorealismus, kein Anime, kein Clay, kein glänzendes 3D, keine Stockfoto-Ästhetik
- Prompts Englisch; sichtbarer Bildtext ausschließlich Deutsch

Reine Mechanismen, Gegenstände, Diagramme oder wissenschaftliche Symbole dürfen ohne Kugelfigur Hauptmotiv sein, müssen aber dieselbe Kontur-, Vereinfachungs- und 2D-Formsprache verwenden.

Historische Reels und Prompts bleiben Archivmaterial und dürfen keine abweichende Bildwelt reaktivieren.

## Bildprompts

Jeder visuelle Quellprompt ist konkret, eindeutig, auf Englisch und mit `modern-countryball-explainer` kompatibel.

Pflicht:

1. 9:16
2. konkrete Bildkomposition und Handlung
3. feste Bildwelt `modern-countryball-explainer`
4. exakt erlaubter deutscher Bildtext, falls vorgesehen
5. keine unerwarteten lesbaren Wörter
6. keine Workflow-Labels im Bild
7. volle 9:16-Fläche ohne künstliche Untertitelzone

Beim Export ergänzt das System den festen Style-Lock global und direkt vor jedem einzelnen Bildabschnitt. Widersprechende Stilbegriffe in einem Quellprompt werden dadurch überstimmt, ohne den konkreten Inhalt zu verändern.

`Bild 01` ist die erste Szene und zugleich das Titelbild, aber nicht der alleinige Style-Master. Die globale Repo-Bildwelt ist der Style-Master.

## Starkes Ende

Die letzten zwei narrativen Szenen müssen eine echte Auflösung bilden:

1. persönliche Prüf-, Erkenntnis- oder Entscheidungsfrage
2. konkrete Lösung und kurzer einprägsamer Abschlusssatz

Nach dem letzten gesprochenen Wort bleibt das letzte Bild 0,7 Sekunden unverändert stehen.

## Narrative Szenen und Bilddichte

Zentrale Quelle: `config/production-quality-gates.json`.

- 12–14 **narrative Szenen**, Standard 13
- Hook ab Sekunde 0
- narrative Szenen werden später über echte Audio-Cues synchronisiert
- **jeder Hauptsatz und jeder eigenständige Nebensatz bekommt möglichst einen eigenen Bildmoment**
- jede Szene erhält 2 oder 3 Bildphasen als Normalfall, 1 nur bei einem sehr kurzen Gedanken
- Bildanzahl und Szenenzahl sind nicht gleichgesetzt
- keine feste Gesamtbildzahl erzwingen; der Satzbau bestimmt die Dichte
- ein Bild steht 1,4 bis 3,2 Sekunden, im Schnitt etwa 2; bei rund 58 Sekunden ergibt das ungefähr 20 bis 30 Bilder
- **harte Untergrenze 1,2 Sekunden** pro Bild — darunter blockiert der Timeline-Check
- ein Satz, dessen Bild darunter fiele, gehört mit dem Nachbarsatz in einen Bildmoment
- `startPercent` setzt den Schnitt auf den Satzanfang, nicht auf ein gleichmäßiges Raster

Technisch:

```text
reel.json.imageCountMode = individual-per-reel
reel.json.plannedImageCount
scene.imageCount
scene.imagePhases[]
```

## Deutscher Text im Bild

Wo es zur Szene passt, wird kurzer deutscher Text direkt in das Bild integriert. Normalerweise 1–5 Wörter, exakter Wortlaut in `imageText` und im englischen Prompt.

- kein zusätzlicher englischer Text
- keine erfundene Schrift
- keine unnötigen Textblöcke
- keine Workflow-Metadaten im Bild
- wenn `imageText` leer ist: kein lesbarer Text

## Natürliche Komposition

- volle 9:16-Fläche natürlich nutzen
- keine künstliche Untertitelzone oder leeren horizontalen Streifen reservieren
- Hauptmotive dürfen die Bildmitte normal nutzen
- Illustration muss ohne Overlay vollständig funktionieren
- Plattform-UI-Sicherheitsabstände beachten, ohne das Motiv unnötig zusammenzudrücken

## Google Flow

Verbindliche Nutzerdatei:

```text
00-bildprompts/99-alle-bildprompts.txt
```

Sie enthält den kompletten seriellen Gesamtprompt mit Auftrag, Serienregeln, Dateinamen, dem festen globalen Style-Lock und allen vollständigen konkreten Bildprompts. Vor jedem Bildabschnitt wird derselbe Style-Lock erneut gesetzt.

`all-image-prompts/all-image-prompts.txt` ist die identische technische Spiegeldatei.

Der separate `google-flow-controller.txt` ist deaktiviert.

Flow muss streng seriell arbeiten:

```text
genau ein Bild generieren
→ vollständig warten
→ gegen aktuellen Bildprompt UND feste Bildwelt prüfen
→ korrekt umbenennen
→ erst dann nächstes Bild
```

Keine Queue, kein Batch, keine Parallelgenerierung.

## Quellen-QC

Neue Reels verwenden Quellen-Schema 3:

- mindestens zwei echte HTTPS-Quellen
- unterschiedliche Hosts
- vollständige Felder `Titel/Institution`, `URL`, `Datum/Zugriff`, `Quellentyp`, `Belegt`
- mindestens eine Primär-/offizielle oder wissenschaftliche Originalquelle
- mindestens eine unabhängige Sekundär-/Fachquelle
- `Belegt` nennt konkret die gestützte Reel-Aussage

Bestehende Schema-2-Reels bleiben rückwärtskompatibel.

Formale Felder ersetzen keine inhaltliche Prüfung.

## Sichere Bildzuordnung

Die Nummerierung `Bild 01`, `Bild 02` usw. ist nur Routing-Hilfe. Die finale Zuordnung erfordert echte Sichtprüfung.

### Erster Durchgang
- Bild tatsächlich öffnen
- sichtbaren Inhalt neutral in `visibleSummary` beschreiben
- mit `narration`, `audioCue`, `visualIdea`, `imageText` und `imagePrompt` vergleichen
- feste Bildwelt `modern-countryball-explainer` sichtbar prüfen
- konkrete `reason` schreiben

### Zweiter Durchgang
- gegen vorherige und nächste Bildphase prüfen
- `confirmedTarget` und Zielreihenfolge eintragen
- erst danach Bestätigung setzen
- unter 0,90 Konfidenz unmatched lassen

`filename-only` ist verboten.

## Untertitel

Global deaktiviert.

- keine Untertitel
- keine Karaoke-/Wortmarkierung
- keine Subtitle-Cues
- kein aktiver `sync:words`-Schritt
- keine Untertitel-Safe-Zone

Historische Word-Sync-Helfer sind ausschließlich Legacy-Diagnosewerkzeuge; siehe `LEGACY_TOOLS.md`.

## Audio

Zentrale Quelle: `src/shared/audio-pacing-style.js`.

- immer die ursprüngliche Audiodatei verarbeiten
- Pausen ab ungefähr 0,24 Sekunden kürzen
- exakt 1,10x, Tonhöhe erhalten
- −16 LUFS integrierte Lautheit
- höchstens −1,5 dBTP True Peak
- optimiertes Audio niemals erneut beschleunigen
- danach Timeline und Szenen-Cues neu synchronisieren
- Szenenanker müssen auf echten akustischen Cues beruhen
- gleichmäßig verteilte oder erfundene Zeiten sind verboten

## Bewegung, Übergänge und Sound

- nicht jedes Bild bewegen
- Zoom normalerweise 2–6 %, maximal 8 %
- Schwenk maximal 4 %
- Hook `none`, danach nur `cut`, Dauer 0
- keine Crossfades oder schwarzen Zwischenbilder
- Hintergrundmusik aus
- null bis zwei dezente Soundeffekte pro narrativer Szene
- Voice-over hat Vorrang

## Qualitätskontrolle

Vor Freigabe prüfen:
- 155–175 Wörter und 55–60 Sekunden Voice-over
- 12–14 narrative Szenen mit sinnvoller individueller Bilddichte
- Hook sofort sichtbar
- jedes Bild erklärt exakt seine Bildphase
- jedes Bild hält `modern-countryball-explainer` ein
- sichtbare Bildbeschreibung, Zuordnungsgrund und zweite Prüfung vorhanden
- keine Untertitel
- Voice-over exakt 1,10x, −16 LUFS und höchstens −1,5 dBTP real gemessen
- ausschließlich direkte harte Schnitte
- keine erfundenen QC-, Timing- oder Readiness-Werte
