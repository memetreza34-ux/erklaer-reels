# AGENTS.md

`CURRENT_WORKFLOW.md` ist die verbindliche Single Source of Truth. Bei Widersprüchen gilt immer die dort definierte Priorität.

## Neues Reel

Bei „Mach ein neues Reel“ autonom:

1. nächsten freien Slot bestimmen
2. **ein starkes Thema aus dem offenen Themenuniversum wählen; keine Beschränkung auf alte Säulen wie Geschichte, Politik, Länder oder Psychologie**
3. deutsches Voice-over mit 155–175 Wörtern schreiben
4. 12–14 narrative Szenen planen, Standard 13
5. **immer `round-country-characters` verwenden**, solange der Nutzer keine andere Welt ausdrücklich reaktiviert
6. Bildanzahl pro Reel und Szene individuell planen
7. Cover + Bildphasen-Prompts + **kompletten alten seriellen Google-Flow-Gesamtprompt** + Caption + Quellen fertigstellen
8. keine Untertitel erzeugen
9. externe Assets zuerst suchen, bevor etwas als fehlend gemeldet wird
10. Assets zweifach visuell prüfen, Audio synchronisieren und nur nach echten QC-Gates rendern

## Themenwahl — offen und abwechslungsreich

Die Bildwelt ist fest, **die Themenwelt ist offen**.

Neue Reels dürfen aus praktisch jedem geeigneten Erklärbereich kommen. Beispiele:
- Psychologie und menschliches Verhalten
- Alltag und Gewohnheiten
- Beziehungen und soziale Dynamiken
- Gesellschaft und Kultur
- Geschichte
- Länder und Geografie
- Politik und staatliche Systeme
- Wissenschaft und Naturphänomene
- Technik und digitale Welt
- Internet und Social Media
- Lernen, Schule und Gedächtnis
- Arbeit und Beruf
- Wirtschaft und Geldmechanismen
- Gesundheit und Ernährung
- Sprache und Kommunikation
- überraschende Alltagsfragen, Denkfehler, Mythen und „Warum ist das so?“-Themen

Diese Liste ist **keine Begrenzung**. Ein Thema darf gewählt werden, wenn es als verständliches, faktenbasiertes Erklär-Reel funktioniert und sich visuell sinnvoll in der Kugel-Welt erzählen lässt.

Verboten ist eine starre Themenrotation oder eine Quote nach alten Säulen. Nicht automatisch mehrere Reels hintereinander nur über Länder/Geschichte/Politik wählen. Bei autonomer Themenwahl auf Abwechslung, Neugier, klaren Aha-Moment, Teilbarkeit und visuelle Erklärbarkeit achten.

Die Kugeln müssen nicht immer Länder darstellen. Bei nicht-länderspezifischen Themen dürfen neutrale Kugelfiguren Personen, Gruppen, Rollen, Systeme, Gedanken, Gewohnheiten oder abstrakte Kräfte repräsentieren.

## Aktive Bildwelt

Nur `round-country-characters` ist aktiv.

`human-editorial-cartoon` und `visual-metaphor` sind pausiert.

Die Kugel-Welt gilt für **alle Themen**, auch Psychologie, Gesellschaft, Verhalten, Wissenschaft, Technik, Alltag, Gesundheit, Wirtschaft, Kultur und abstrakte Mechanismen.

### Figurenregel

Jede anthropomorphe Hauptfigur ist eine vollständige runde Kugel.

- Länder → runde Kugel + vereinfachtes Flaggenmuster
- nicht-länderspezifische Rollen → runde Kugel + neutrale Farben/Symbole
- einfache weiße Augen
- höchstens winzige Arme/Beine

Strikt verboten:
- Länderumriss/Kartenform als Figurenkörper
- Gesicht/Augen auf einer Kartenform
- unregelmäßige geografische Figuren
- menschliche Köpfe/Torsi als Hauptwelt

Jeder Bildprompt erzwingt sinngemäß:
`complete perfectly round circular character / country sphere; never a map-shaped or human-shaped character`.

## Bildprompt-Autorenschaft — alten Aufbau verwenden

Die Visual-Prompts dürfen nicht als generische Kurzprompts geschrieben werden. Der frühere detaillierte Editorial-Aufbau ist verbindlich.

Jede `cover-prompt.txt`, `image-prompt.txt`, `image-prompt-02.txt` usw. enthält:

1. `Vertical 9:16 premium mature 2D editorial country-character illustration ...`
2. vollständige Stilwelt: warm off-white textured paper, deep navy borders/map shapes, muted rust, mustard, cobalt, forest-green, bold clean hand-inked outlines, flat geometric shading, subtle grain, high contrast, sophisticated documentary tone, not childish
3. konkrete Szene und klare Komposition
4. vollständige runde Kugelfiguren passend zum Thema
5. exakt erlaubten deutschen Bildtext, falls vorhanden
6. `No other readable text, no English, no logos, no watermark`
7. `No 3D, no photorealism`
8. volle 9:16-Fläche, keine Subtitle-Safe-Zone

`Match Bild 00.png exactly` darf genutzt werden, aber niemals als Ersatz für eine konkrete Bildidee.

## Narrative Szenen ≠ Bildanzahl

Jede narrative Szene besitzt normalerweise 1 Bildphase, 2 wenn ein zweiter visueller Schritt klar verbessert, 3 nur selten.

Wenn ein Still-Bild ungefähr 3,5–4 Sekunden oder länger stehen würde, aktiv eine weitere Bildphase prüfen. Keine feste Gesamtzahl erzwingen.

Technische Felder:
- `reel.json.imageCountMode = "individual-per-reel"`
- `reel.json.plannedImageCount`
- pro Szene `imageCount`
- pro Szene `imagePhases[]`

## Google Flow — kompletter serieller Gesamtprompt

Die verbindliche Nutzerdatei ist:

```text
00-bildprompts/99-alle-bildprompts.txt
```

Sie muss so aufgebaut sein wie die frühere funktionierende Variante:

```text
GOOGLE FLOW – KOMPLETTER SERIELLER BILDLAUF
AUFTRAG
WICHTIG – DIESE EINE NACHRICHT IST DIE KOMPLETTE FREIGABE
STRENG SERIELL – NIE PARALLEL
DATEINAMEN
STYLE-MASTER
TEXTREGEL
ENDE
────────────────────────────────────────
BILD 00 – COVER
DATEINAME NACH FERTIGSTELLUNG: Bild 00.png
<vollständiger Visual-Prompt>
BILD 01 – SZENE 1
...
```

`all-image-prompts/all-image-prompts.txt` ist eine identische technische Kopie.

Die Einzeldateien unter `all-image-prompts/image-prompts/` dürfen als interne Sicherung bleiben, sind aber **nicht** der normale Google-Flow-Einstieg.

Der separate `google-flow-controller.txt` ist deaktiviert.

### Hard Serial Lock

Obwohl alle Prompts in einer Nachricht stehen, darf immer nur **eine** Generierung laufen.

Für jedes Bild:

```text
nur aktuellen Bildabschnitt ausführen
→ genau 1 Bildgenerator-Aufruf
→ vollständig warten
→ umbenennen
→ prüfen
→ erst dann nächster Bildabschnitt
```

Strikt verboten:
- zwei oder mehr Bildgenerator-Aufrufe im selben Agent-Schritt / Tool-Batch / Turn
- Batch
- Queue
- Parallelgenerierung
- mehrere Varianten gleichzeitig
- nächstes Bild starten, bevor das aktuelle sichtbar fertig und geprüft ist

Wenn ein Job noch läuft, queued/pending ist oder der Status unklar ist: warten. Wenn versehentlich mehrere Jobs gestartet wurden, keine weiteren starten und spätere parallele Jobs abbrechen.

`Bild 00.png` ist Cover und Style-Master.

## Workflow-Metadaten dürfen nie im Bild erscheinen

Verboten als sichtbarer Bildtext:
- Bildnummern
- `COVER`
- `SZENE` / `SCENE`
- `BILDPHASE` / `IMAGE PHASE`
- `DATEINAME`, Dateinamen, technische IDs
- `GOOGLE FLOW`, `PROMPT`, `STYLE-REFERENZ`, `ZIEL`

Die Überschriften im Gesamtprompt sind reine Workflow-Steuerung. Der eigentliche visuelle Prompt trägt die Textregel selbst:
- `imageText`/Cover-Headline gesetzt → nur exakt dieser Text darf lesbar sein
- leer → kein lesbarer Text

## Quellen-QC

Für **neu erstellte Reels** gilt Quellen-Schema 3.

Mindestens:
- zwei echte HTTPS-Quellen
- zwei unterschiedliche Hosts/Domains
- vollständige Felder `Titel/Institution`, `URL`, `Datum/Zugriff`, `Quellentyp`, `Belegt`
- mindestens eine Primär-/offizielle Quelle oder wissenschaftliche Originalquelle
- mindestens eine davon unabhängige Sekundär-/Fachquelle

Unter `Belegt` muss konkret stehen, welche Aussage des Reels die jeweilige Quelle stützt. Die formale QC ersetzt keine inhaltliche Prüfung der Quelle.

Bestehende Schema-2-Reels bleiben rückwärtskompatibel und werden nicht künstlich umgeschrieben.

## Untertitel

Global deaktiviert:
- keine Untertitel
- keine Karaoke-Markierung
- keine künstliche Untertitel-Safe-Zone
- `sync:words` ist **nicht erforderlich** und darf im aktiven Produktionsworkflow nicht ausgeführt werden

Historische Word-Sync-Helfer dürfen nur explizit als Legacy-Diagnosewerkzeuge verwendet werden; niemals als Pflichtschritt für neue Reels.

## Audio

- finale Audiodatei ist einzige Zeitquelle
- Pausen straffen
- exakt 1,10x, Pitch erhalten
- −16 LUFS
- max. −1,5 dBTP
- Szenen über echte akustisch bestätigte `audioCue`-Anker synchronisieren
- zusätzliche Bildphasen über `startPercent` innerhalb der bestätigten Szenendauer legen
- nach Audioänderung Timeline neu synchronisieren
- keine erfundenen Szenenanker

## Asset-Zuordnung

Dateinummer ist nur Routing-Hilfe. Jede Bildphase tatsächlich öffnen und gegen Narration, Audio-Cue, Visual-Idea, Bildtext und Prompt prüfen. Danach gegen vorherige und nächste Bildphase prüfen.

Unter 0,90 Konfidenz nicht raten. `filename-only` ist verboten.

## Render

Nur nach tatsächlich bestandenen Prüfungen:

```bash
npm run check:content -- --dir "<reel>" --strict
npm run discover:assets -- --dir "<reel>"
npm run organize:assets -- --dir "<reel>" --apply
npm run trim:pauses -- --dir "<reel>" --speed 1.10
npm run build:timeline -- --dir "<reel>"
npm run sync:audio -- --dir "<reel>" --strict
npm run check:visuals -- --dir "<reel>" --strict
npm run finalize:reel -- --dir "<reel>" --strict
npm run validate:render -- --dir "<reel>"
npm run render:reel -- --dir "<reel>"
```

Nicht ausgeführte Tests, QC-Stufen oder Render niemals als bestanden melden.
