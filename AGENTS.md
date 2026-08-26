# AGENTS.md

`CURRENT_WORKFLOW.md` ist die verbindliche Single Source of Truth. Bei Widersprüchen gilt immer die dort definierte Priorität.

## Neues Reel

Bei „Mach ein neues Reel“ autonom:

1. nächsten freien Slot bestimmen
2. **ein starkes Thema aus dem offenen Themenuniversum wählen; keine Beschränkung auf alte Säulen wie Geschichte, Politik, Länder oder Psychologie**
3. deutsches Voice-over mit 155–175 Wörtern schreiben
4. 12–14 narrative Szenen planen, Standard 13
5. **für Cover und jede Bildphase zwingend die feste Bildwelt `modern-countryball-explainer` verwenden**
6. Bildanzahl pro Reel und Szene individuell planen
7. Cover + Bildphasen-Prompts + kompletten seriellen Google-Flow-Gesamtprompt + Caption + Quellen fertigstellen
8. keine Untertitel erzeugen
9. externe Assets zuerst suchen, bevor etwas als fehlend gemeldet wird
10. Assets zweifach visuell prüfen, inklusive Stilkonformität, Audio synchronisieren und nur nach echten QC-Gates rendern

## Themenwahl — offen und abwechslungsreich

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

Diese Liste ist **keine Begrenzung**. Verboten ist eine starre Themenrotation oder eine Quote nach alten Säulen.

## Bildwelt — fest: modern-countryball-explainer

Die globale Bildwelt ist verbindlich in `knowledge/fixed-visual-world.md` und `config/image-styles.json` definiert.

Neue Reels erhalten:

```text
visualStyleId: "modern-countryball-explainer"
visualStyleReason: "Globale feste Bildwelt für alle neuen Erklär-Reels: moderner minimalistischer Countryball-Erklärstil."
```

Die Bildwelt wird **nicht** pro Thema neu gewählt und nicht rotiert.

Kernregeln:
- 9:16
- moderner minimalistischer Countryball-inspirierter Erklärgrafik-Stil
- runde Ball-Figuren für Personen, Gruppen, Institutionen oder Länder
- Länderflaggen nur bei inhaltlich relevanter Länder-/Regionsidentität; sonst neutrale Kugeln
- dicke saubere schwarze Konturen
- einfache weiße expressive Augen, minimale Gesichtselemente
- flacher sauberer 2D-Vektor-/Comic-Look
- dezente weiche Schatten, höchstens leichte Textur
- ein dominantes Hauptmotiv, wenige unterstützende Requisiten
- einfarbiger oder sanft texturierter Hintergrund; Farbe darf pro Szene wechseln
- eine sofort verständliche visuelle Metapher
- keine realistischen Menschen, kein Fotorealismus, kein Anime, kein Clay, kein glänzendes 3D, keine Stockfoto-Ästhetik
- Bildprompts Englisch; sichtbarer Bildtext ausschließlich Deutsch

Reine Gegenstände oder Mechanismen dürfen ohne Kugelfigur Hauptmotiv sein, müssen aber dieselbe Kontur-, 2D- und Vereinfachungslogik verwenden.

Historische Reel-Prompts dürfen Inhalt inspirieren, aber **keine** abweichende alte Bildwelt reaktivieren.

## Bildprompt-Autorenschaft

Die Visual-Prompts dürfen nicht als generische unklare Kurzprompts geschrieben werden. Sie sollen die **konkrete Szene** präzise beschreiben und mit der festen Bildwelt kompatibel sein.

Jede `cover-prompt.txt`, `image-prompt.txt`, `image-prompt-02.txt` usw. enthält mindestens:

1. Format 9:16
2. konkrete Szene und klare Komposition
3. festen Stil `modern-countryball-explainer`
4. exakt erlaubten deutschen Bildtext, falls vorhanden
5. `No other readable text, no English, no logos, no watermark`, sofern nicht ausdrücklich anders gewünscht
6. volle 9:16-Fläche, keine Subtitle-Safe-Zone

Der Exporter ergänzt zusätzlich automatisch einen globalen und per-Bild Style-Lock. Bei Konflikten überstimmt der feste Style-Lock nur widersprechende Stilbegriffe; Inhalt, Metapher, Komposition und deutscher Text bleiben bestehen.

`Bild 00.png` ist das Cover, aber nicht der alleinige Style-Master. Die globale Repo-Bildwelt ist der Style-Master.

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

`all-image-prompts/all-image-prompts.txt` ist eine identische technische Kopie.

Die Einzeldateien unter `all-image-prompts/image-prompts/` dürfen als interne Sicherung bleiben, sind aber **nicht** der normale Google-Flow-Einstieg.

Der separate `google-flow-controller.txt` ist deaktiviert.

Der Gesamtprompt enthält die feste Bildwelt global und erneut direkt vor jedem Bildabschnitt.

### Hard Serial Lock

Obwohl alle Prompts in einer Nachricht stehen, darf immer nur **eine** Generierung laufen.

```text
nur aktuellen Bildabschnitt ausführen
→ genau 1 Bildgenerator-Aufruf
→ vollständig warten
→ gegen aktuellen Bildprompt UND feste Bildwelt prüfen
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
- nächstes Bild starten, bevor das aktuelle sichtbar fertig, stilkonform und geprüft ist

Wenn ein Job noch läuft, queued/pending ist oder der Status unklar ist: warten.

## Workflow-Metadaten dürfen nie im Bild erscheinen

Verboten als sichtbarer Bildtext:
- Bildnummern
- `COVER`
- `SZENE` / `SCENE`
- `BILDPHASE` / `IMAGE PHASE`
- `DATEINAME`, Dateinamen, technische IDs
- `GOOGLE FLOW`, `PROMPT`, `STYLE-REFERENZ`, `ZIEL`

Der eigentliche visuelle Prompt trägt die Textregel selbst:
- `imageText`/Cover-Headline gesetzt → nur exakt dieser deutsche Text darf lesbar sein
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

Dateinummer ist nur Routing-Hilfe. Jede Bildphase tatsächlich öffnen und gegen Narration, Audio-Cue, Visual-Idea, Bildtext und Prompt prüfen. Zusätzlich die feste Bildwelt prüfen. Danach gegen vorherige und nächste Bildphase prüfen.

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
