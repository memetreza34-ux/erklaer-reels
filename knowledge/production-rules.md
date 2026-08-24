# Produktionsregeln

> Bei Widersprüchen gilt immer `CURRENT_WORKFLOW.md`.

## Ziel

Jedes Reel erklärt einen Begriff, ein System, ein Verhalten oder einen Zusammenhang so einfach, dass Zuschauer ihn ohne Vorwissen verstehen.

Die **Themenwelt ist offen**, die **visuelle Welt ist fest**.

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
- visuelle Stärke in der Kugel-Welt
- Abwechslung gegenüber den letzten Reels
- Teilbarkeit oder Alltagsrelevanz

## Feste Bildwelt: Kugel-Welt

Nicht nach dem Script eine neue Bildwelt auswählen.

Bis der Nutzer ausdrücklich etwas anderes aktiviert, gilt immer:

```text
round-country-characters
```

- Länder → vollständige perfekt runde Kugeln mit vereinfachtem Flaggenmuster
- nicht-länderspezifische Personen/Rollen → neutrale runde Kugeln mit Farben/Symbolen
- Gruppen, Systeme, Gedanken, Gewohnheiten, Emotionen und abstrakte Kräfte dürfen ebenfalls durch Kugelfiguren dargestellt werden
- Karten und Länderumrisse bleiben gesichtslos
- niemals map-shaped characters
- keine menschlichen Köpfe/Torsi als Hauptwelt

## Bewährter Bildprompt-Look

Jeder visuelle Quellprompt bleibt ausführlich und konkret:

> Vertical 9:16 premium mature 2D editorial country-character illustration. Warm off-white textured paper background, deep navy borders and map shapes, muted rust, mustard, cobalt and forest-green accents, bold clean hand-inked outlines, flat geometric shading, subtle grain, high contrast, sophisticated documentary tone, not childish.

Danach folgen konkrete Bildkomposition, Handlung, Kugelfiguren, exakt erlaubter deutscher Bildtext und negative Regeln.

Workflow-Labels wie `BILD 00`, `COVER`, `SZENE`, `BILDPHASE` oder Dateinamen sind niemals Bildinhalt.

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
- jede Szene erhält 1, 2 oder selten 3 Bildphasen
- Bildanzahl und Szenenzahl sind nicht gleichgesetzt
- keine feste Gesamtbildzahl erzwingen
- bei ungefähr 3,5–4 Sekunden Stillstand aktiv prüfen, ob eine zweite Bildphase echten Mehrwert bringt
- Zusatzbilder nur bei Informations-, Fokus- oder Rhythmusgewinn

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

Sie enthält den kompletten seriellen Gesamtprompt mit Auftrag, Serienregeln, Dateinamen, Style-Master und allen vollständigen Bildprompts.

`all-image-prompts/all-image-prompts.txt` ist die identische technische Spiegeldatei.

Der separate `google-flow-controller.txt` ist deaktiviert.

Flow muss streng seriell arbeiten:

```text
genau ein Bild generieren
→ vollständig warten
→ korrekt umbenennen
→ prüfen
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

Die Nummerierung `Bild 00`, `Bild 01` usw. ist nur Routing-Hilfe. Die finale Zuordnung erfordert echte Sichtprüfung.

### Erster Durchgang
- Bild tatsächlich öffnen
- sichtbaren Inhalt neutral in `visibleSummary` beschreiben
- mit `narration`, `audioCue`, `visualIdea`, `imageText` und `imagePrompt` vergleichen
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
- feste Kugel-Welt konsequent
- starkes Ende plus 0,7 Sekunden Schlussbild
- jedes Bild erklärt exakt seine Bildphase
- sichtbare Bildbeschreibung, Zuordnungsgrund und zweite Prüfung vorhanden
- keine Untertitel
- Voice-over exakt 1,10x, −16 LUFS und höchstens −1,5 dBTP real gemessen
- ausschließlich direkte harte Schnitte
- keine erfundenen QC-, Timing- oder Readiness-Werte
