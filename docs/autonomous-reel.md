# Autonomes neues Reel

Dieser Ablauf gilt bei „Mach ein neues Reel“, „Erstelle das nächste Reel“ und sinngleichen Imperativen.

## Zuerst lesen

1. `CURRENT_WORKFLOW.md`
2. `PRODUCTION_STATUS.md`
3. `AGENTS.md`
4. `CODEX_TASK.md`

`CURRENT_WORKFLOW.md` ist bei Widersprüchen maßgeblich.

## Ablauf

### 1. Nächsten freien Slot bestimmen

```bash
npm run next:slot -- --json
```

Belegte Slots niemals überschreiben.

### 2. Thema auswählen

Thema selbstständig aus den erlaubten Säulen wählen und Wiederholungen vermeiden.

### 3. Script schreiben

- genau ein deutscher Erzähler
- 155–175 Wörter
- 55–60 Sekunden nach Audiooptimierung
- Hook sofort
- erwachsene einfache Sprache
- starkes Ende über zwei Szenen

### 4. Workspace erstellen

```bash
npm run create:reel -- \
  --title "GEWÄHLTER TITEL" \
  --script-file "PFAD-ZUM-SCRIPT" \
  --next-free \
  --scenes 13
```

Die 13 sind **narrative Szenen**, nicht automatisch 13 Bilder.

### 5. Bilddichte individuell planen

Für jede Szene separat:
- 1 Bild, wenn ein starkes Motiv reicht
- 2 Bilder, wenn Überblick/Detail, Karte/Zoom, Ursache/Folge, Gesicht/Gedanke oder ein anderer echter zweiter visueller Schritt hilft
- 3 Bilder nur selten

Bei ungefähr 3,5–4 Sekunden oder längerem Stillstand eine zweite Bildphase aktiv prüfen. Keine künstlichen Zusatzbilder nur für eine Quote.

Danach:
- `reel.json.imageCountMode = "individual-per-reel"`
- `reel.json.plannedImageCount` auf tatsächliche Summe setzen
- pro Szene `imageCount` + `imagePhases[]`
- erste Phase `image-prompt.txt`
- zusätzliche Phasen `image-prompt-02.txt`, `image-prompt-03.txt`

### 6. Google-Flow-Sammeldatei

```bash
npm run export:prompts -- --dir "PFAD-ZUM-REEL" --strict
```

`Bild 00` bleibt Cover und Style-Master. Danach folgen alle Bildphasen fortlaufend in globaler Bildreihenfolge.

Die Bildnummer ist nicht mehr automatisch die Szenennummer. Beispiel:

```text
Bild 01 = Szene 1 / Phase 1
Bild 02 = Szene 2 / Phase 1
Bild 03 = Szene 2 / Phase 2
Bild 04 = Szene 3 / Phase 1
```

Flow arbeitet streng seriell und fragt nach dem einmaligen Start nicht erneut nach `Go`.

### 7. Inhaltsprüfung

```bash
npm run validate:reel -- --dir "PFAD-ZUM-REEL"
npm run check:content -- --dir "PFAD-ZUM-REEL" --strict
```

### 8. Externe Assets zuerst suchen

```bash
npm run discover:assets -- --dir "PFAD-ZUM-REEL"
```

Die Discovery erwartet automatisch die individuell geplante Bildreihe.

Bei mehreren ZIPs oder Audio-Kandidaten nicht raten.

### 9. Bildzuordnung

```bash
npm run organize:assets -- --dir "PFAD-ZUM-REEL"
```

Jede Bildphase wirklich öffnen. Dateinummer nur als Routing-Hilfe verwenden. Gegen Phasen-Prompt und Phasen-Visual-Idea prüfen, dann gegen vorherige und nächste Bildphase. Unter 0,90 Konfidenz nicht anwenden.

Danach:

```bash
npm run organize:assets -- --dir "PFAD-ZUM-REEL" --apply
```

### 10. Audio und Szenen-Sync

```bash
npm run trim:pauses -- --dir "PFAD-ZUM-REEL" --speed 1.10
npm run build:timeline -- --dir "PFAD-ZUM-REEL"
npm run sync:audio -- --dir "PFAD-ZUM-REEL" --strict
```

Narrative Szenen werden über echte akustisch bestätigte `audioCue`-Anker synchronisiert. Zusätzliche Bildphasen wechseln innerhalb der bestätigten Szene anhand `startPercent`.

Keine Untertitel und kein Word-Sync.

### 11. Finale QC und Render

```bash
npm run check:visuals -- --dir "PFAD-ZUM-REEL" --strict
npm run finalize:reel -- --dir "PFAD-ZUM-REEL" --strict
npm run validate:render -- --dir "PFAD-ZUM-REEL"
npm run render:reel -- --dir "PFAD-ZUM-REEL"
```

Jede geplante Bildphase muss die visuelle QC bestehen. Die letzte sichtbare Phase bleibt 0,7 Sekunden nach Sprecherende stehen.

## Keine Standardrückfragen

Nicht nach Datum, Thema, Szenenzahl, Bildwelt oder bereits heruntergeladenen Assets fragen, solange Repo und Asset-Suche die Information selbst liefern können.

## Abschlussmeldung

Nur tatsächlich erzeugte und geprüfte Schritte als fertig melden. Bilder, Audio, Tests, CI oder Render niemals als erfolgreich darstellen, wenn sie nicht wirklich ausgeführt wurden.
