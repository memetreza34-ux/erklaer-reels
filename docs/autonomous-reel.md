# Autonomes neues Reel

Dieser Ablauf gilt bei „Mach ein neues Reel“, „Erstelle das nächste Reel“ und sinngleichen Imperativen.

## Vor jeder Produktion zwingend lesen

1. `CURRENT_WORKFLOW.md`
2. `PRODUCTION_STATUS.md`
3. `AGENTS.md`
4. `CODEX_TASK.md`

`CURRENT_WORKFLOW.md` ist bei Widersprüchen maßgeblich. Ein normaler neuer Reel-Auftrag darf globale Produktionsregeln **nicht** verändern.

## Ablauf

### 1. Nächsten freien Tag bestimmen

```bash
npm run next:slot -- --json
```

Bereits belegte Slots niemals überschreiben.

### 2. Thema auswählen

Thema selbstständig aus den erlaubten Säulen wählen, Wiederholungen vermeiden und keine Standardrückfrage zu Datum, Thema, Szenenzahl oder Bildwelt stellen.

### 3. Script schreiben

- genau ein deutscher Erzähler
- 155–175 Wörter
- 55–60 Sekunden nach 1,10x-Audiooptimierung
- sofortige sachliche Hook
- einfache, erwachsene Sprache
- starkes Ende über zwei Szenen

### 4. Reel erstellen

```bash
npm run create:reel -- \
  --title "GEWÄHLTER TITEL" \
  --script-file "PFAD-ZUM-SCRIPT" \
  --next-free \
  --scenes 13
```

Danach `production/agent-task.md` vollständig bearbeiten.

Pflichtumfang:
- finales Script und Voice-Script
- 12–14 Szenen mit je einem klaren Moment
- Cover-Prompt
- vollständige englische Szenenprompts
- Caption
- Quellen
- Untertitel-/Effektplanung
- Statusdateien
- vollständige Prompt-Sammeldatei

### 5. Google-Flow-Sammeldatei erzeugen

```bash
npm run export:prompts -- --dir "PFAD-ZUM-REEL" --strict
```

Die generierte `all-image-prompts/all-image-prompts.txt` muss automatisch dem aktuellen Vertrag aus `CURRENT_WORKFLOW.md` entsprechen:

- Nutzer startet Google Flow einmal mit der kompletten Datei.
- Google Flow arbeitet autonom ohne weiteres `Go`.
- Trotzdem streng seriell: ein Bild → vollständig warten → sofort umbenennen → prüfen → automatisch nächstes Bild.
- Kein Parallelisieren, Batch oder Queue.
- `Bild 00` ist Cover, Hook und Style-Master.
- Erst nach dem letzten Bild alle fertigen Bilder gemeinsam in den Sammelordner.

Repo-Agenten erzeugen selbst keine Bilder.

### 6. Inhaltsprüfung

```bash
npm run validate:reel -- --dir "PFAD-ZUM-REEL"
npm run check:content -- --dir "PFAD-ZUM-REEL" --strict
```

Fehler beheben. Keine Prüfung als bestanden melden, wenn sie nicht tatsächlich ausgeführt werden konnte.

## Quellenstandard

- zentrale Tatsachenbehauptungen vor Veröffentlichung prüfen
- Primärquellen oder seriöse Fach-/Institutionenquellen bevorzugen
- bei strittigen/aktuellen Aussagen mehrere unabhängige Quellen verwenden
- konkrete URLs bzw. eindeutig auffindbare Quellen in `sources/sources.md`
- keine erfundenen Quellen oder Platzhalterlinks

## Erlaubter Haltepunkt

Erst anhalten, wenn externe Dateien fehlen: Voice-over oder Bilder.

Sind Assets vorhanden:

```text
Assets visuell prüfen
→ nummerierte Dateien nur als Routing-Hilfe verwenden
→ Voice-over exakt 1,10x / −16 LUFS / max. −1,5 dBTP verarbeiten
→ Audio wirklich nachmessen
→ Timeline synchronisieren
→ exakte akustische Wort-Synchronisierung
→ visuelle Zwei-Pass-QC
→ finale Freigabe
→ MP4 rendern
```

## Keine Standardrückfragen

Nicht nach Datum, Thema, Szenenzahl oder Bildwelt fragen, solange keine wirklich widersprüchliche Vorgabe oder zwingend fehlende Information vorliegt.

## Abschlussmeldung

Vor externen Assets nur bestätigen, was tatsächlich erstellt/geprüft wurde. Bilder, Audio, Tests, CI oder Render niemals als vorhanden/erfolgreich darstellen, wenn sie nicht wirklich erzeugt oder ausgeführt wurden.
