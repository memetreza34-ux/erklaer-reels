# Autonomes neues Reel

Dieser Ablauf gilt bei „Mach ein neues Reel“, „Erstelle das nächste Reel“ und sinngleichen Imperativen.

## Zuerst lesen

1. `CURRENT_WORKFLOW.md`
2. `AGENTS.md`
3. `CODEX_TASK.md`
4. `PRODUCTION_STATUS.md`

`CURRENT_WORKFLOW.md` ist bei Widersprüchen maßgeblich.

## Ablauf

### 1. Nächsten freien Slot bestimmen

```bash
npm run next:slot -- --json
```

Belegte Slots niemals überschreiben.

### 2. Thema auswählen

Thema selbstständig aus dem **offenen Themenuniversum** wählen.

Keine feste Pillar-Quote und keine Beschränkung auf Geschichte, Politik, Länder oder Psychologie. Entscheidend sind Hook, Aha-Moment, Faktenbasis, visuelle Klarheit, Abwechslung und Teilbarkeit.

### 3. Script schreiben

- genau ein deutscher Erzähler
- 155–175 Wörter
- 55–60 Sekunden nach Audiooptimierung
- Hook sofort
- erwachsene einfache Sprache
- starkes Ende über zwei narrative Szenen

### 4. Workspace erstellen

```bash
npm run create:reel -- \
  --title "GEWÄHLTER TITEL" \
  --script-file "PFAD-ZUM-SCRIPT" \
  --next-free \
  --scenes 13
```

Die 13 sind **narrative Szenen**, nicht automatisch 13 Bilder.

Neue Reels verwenden automatisch Quellen-Schema 3 und starten aktuell ohne feste Bildwelt:

```text
visualStyleId = null
visualStyleReason = ""
```

### 5. Keine alte Bildwelt übernehmen

Bis der Nutzer ausdrücklich eine neue Bildwelt definiert, keine frühere Stilwelt autonom auswählen oder aus historischen Reels ableiten.

Nicht automatisch aktivieren:

- `round-country-characters`
- Countryball-/Kugel-Regeln
- Golden References
- `human-editorial-cartoon`
- `visual-metaphor`
- feste Figuren-Geometrie
- feste Farbpalette oder Papiertextur
- alten Premium-Editorial-Look

Historische Reels sind Archivmaterial.

### 6. Bilddichte individuell planen

Für jede narrative Szene separat:
- 1 Bild, wenn ein starkes Motiv reicht
- 2 Bilder, wenn Überblick/Detail, Ursache/Folge oder ein anderer echter zweiter visueller Schritt hilft
- 3 Bilder nur selten

Bei ungefähr 3,5–4 Sekunden oder längerem Stillstand eine zweite Bildphase aktiv prüfen. Keine künstlichen Zusatzbilder nur für eine Quote.

Danach:
- `reel.json.imageCountMode = "individual-per-reel"`
- `reel.json.plannedImageCount` auf tatsächliche Summe setzen
- pro Szene `imageCount` + `imagePhases[]`
- erste Phase `image-prompt.txt`
- zusätzliche Phasen `image-prompt-02.txt`, `image-prompt-03.txt`

### 7. Bildprompts und Google-Flow-Gesamtprompt

Bildprompts konkret für den jeweiligen Bildmoment schreiben. Keine alte Repo-Bildwelt, Golden Reference, Figurenform, Palette oder Textur automatisch ergänzen.

Dann:

```bash
npm run export:prompts -- --dir "PFAD-ZUM-REEL" --strict
```

Die verbindliche Nutzerdatei ist:

```text
00-bildprompts/99-alle-bildprompts.txt
```

`Bild 00` ist aktuell nur Cover und nicht automatisch Style-Master. Danach folgen alle Bildphasen fortlaufend in globaler Bildreihenfolge.

Flow arbeitet streng seriell und fragt nach dem einmaligen Start nicht erneut nach `Go`:

```text
genau ein Bild → vollständig warten → gegen aktuellen Prompt prüfen → umbenennen → nächstes Bild
```

Keine Queue, kein Batch, keine Parallelgenerierung.

### 8. Quellen ausfüllen

Für neue Reels gilt Schema 3:

- mindestens zwei echte HTTPS-Quellen
- unterschiedliche Hosts
- mindestens eine Primär-/offizielle oder wissenschaftliche Originalquelle
- mindestens eine unabhängige Sekundär-/Fachquelle
- konkrete `Belegt`-Angabe pro Quelle

Die formale Struktur ersetzt keine inhaltliche Quellenprüfung.

### 9. Inhaltsprüfung

```bash
npm run validate:reel -- --dir "PFAD-ZUM-REEL"
npm run check:content -- --dir "PFAD-ZUM-REEL" --strict
```

### 10. Externe Assets zuerst suchen

```bash
npm run discover:assets -- --dir "PFAD-ZUM-REEL"
```

Die Discovery erwartet automatisch die individuell geplante Bildreihe.

Bei mehreren ZIPs oder Audio-Kandidaten nicht raten.

### 11. Bildzuordnung

```bash
npm run organize:assets -- --dir "PFAD-ZUM-REEL"
```

Jede Bildphase wirklich öffnen. Dateinummer nur als Routing-Hilfe verwenden. Gegen Phasen-Prompt und `visualIdea` prüfen, dann gegen vorherige und nächste Bildphase. Unter 0,90 Konfidenz nicht anwenden.

Danach:

```bash
npm run organize:assets -- --dir "PFAD-ZUM-REEL" --apply
```

### 12. Audio und Szenen-Sync

```bash
npm run trim:pauses -- --dir "PFAD-ZUM-REEL" --speed 1.10
npm run build:timeline -- --dir "PFAD-ZUM-REEL"
npm run sync:audio -- --dir "PFAD-ZUM-REEL" --strict
```

Narrative Szenen werden über echte akustisch bestätigte `audioCue`-Anker synchronisiert. Zusätzliche Bildphasen wechseln innerhalb der bestätigten Szene anhand `startPercent`.

Keine Untertitel und kein aktiver Word-Sync.

### 13. Finale QC und Render

```bash
npm run check:visuals -- --dir "PFAD-ZUM-REEL" --strict
npm run finalize:reel -- --dir "PFAD-ZUM-REEL" --strict
npm run validate:render -- --dir "PFAD-ZUM-REEL"
npm run render:reel -- --dir "PFAD-ZUM-REEL"
```

Jede geplante Bildphase muss die visuelle QC gegen ihren konkreten Inhalt und Prompt bestehen. Die letzte sichtbare Phase bleibt 0,7 Sekunden nach Sprecherende stehen.

## Keine Standardrückfragen

Nicht nach Datum, Thema, Szenenzahl oder bereits heruntergeladenen Assets fragen, solange Repo und Asset-Suche die Information selbst liefern können. Wegen der Bildwelt keine alte Stilentscheidung selbst treffen; solange keine neue Bildwelt festgelegt wurde, bleibt sie unassigned.

## Abschlussmeldung

Nur tatsächlich erzeugte und geprüfte Schritte als fertig melden. Bilder, Audio, Tests, CI oder Render niemals als erfolgreich darstellen, wenn sie nicht wirklich ausgeführt wurden.
