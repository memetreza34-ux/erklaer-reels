# Phase 1 — kreatives Reel-Paket mit normalem ChatGPT

Dieser Ablauf gehört ausschließlich zu normalem ChatGPT. Antigravity führt ihn nicht aus.

## Vor jeder Produktion zwingend lesen

1. `CURRENT_WORKFLOW.md`
2. `PRODUCTION_STATUS.md`
3. `AGENTS.md`
4. `CODEX_TASK.md`

`CURRENT_WORKFLOW.md` ist bei Widersprüchen maßgeblich. Ein normaler neuer Reel-Auftrag darf **keine globalen Produktionsregeln** verändern.

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

ChatGPT erzeugt selbst keine Bilder oder Audios. Diese Medien erstellt der Nutzer in Phase 2.

### 6. Übergabe an den Nutzer

ChatGPT liefert das vollständige kreative Paket. Der Nutzer erzeugt danach alle Bilder und das Voice-over-Audio. Antigravity beginnt erst anschließend mit:

```bash
npm run verify:handoff -- --dir "PFAD-ZUM-REEL"
```

### 7. Inhaltsprüfung

```bash
npm run validate:reel -- --dir "PFAD-ZUM-REEL"
npm run check:content -- --dir "PFAD-ZUM-REEL" --strict
```

Fehler beheben. Keine Prüfung als bestanden melden, wenn sie nicht tatsächlich ausgeführt werden konnte.

### 7. Externe Assets zuerst aktiv suchen

Wenn Bilder oder Voice-over im Reel-Ordner nicht gefunden werden, **nicht sofort anhalten**.

Zuerst:

```bash
npm run discover:assets -- --dir "PFAD-ZUM-REEL"
```

Der normale Lauf

```bash
npm run organize:assets -- --dir "PFAD-ZUM-REEL"
```

führt dieselbe Suche ebenfalls automatisch aus.

Standardmäßig werden Reel-Ordner, `~/Downloads` und `~/Desktop` durchsucht.

Wenn eine eindeutige vollständige ZIP mit `Bild 00` bis zur letzten Szene gefunden wird, wird sie sicher geprüft, temporär entpackt und in `inbox/numbered-images/` übernommen. Bereits vorhandene Bildnummern werden nicht überschrieben.

Wenn **mehrere** vollständige ZIPs gefunden werden, darf nicht blind die neueste verwendet werden. Der Agent prüft die Kandidaten inhaltlich und kann danach gezielt ausführen:

```bash
npm run discover:assets -- --dir "PFAD-ZUM-REEL" --zip "PFAD-ZUR-GEPRÜFTEN-ZIP"
```

Auch nach dem ZIP-Import bleibt die visuelle Zwei-Pass-QC Pflicht. Dateinummern sind nur Routing-Hilfe.

Bei Audio werden aktuelle Kandidaten gesucht. Genau ein eindeutig als Voice-over erkennbarer Kandidat kann bereitgestellt werden; bei mehreren/unklaren Kandidaten muss der Agent prüfen und darf nicht raten.

Die Suchdiagnose liegt unter `inbox/asset-discovery.json`.

### 8. Untertitel vollständig am Sprecher synchronisieren

Nach dem finalen Audio:

```bash
npm run sync:words -- --dir "PFAD-ZUM-REEL"
node scripts/sync-whisper.js whisper_out.json "PFAD-ZUM-REEL"
npm run sync:words -- --dir "PFAD-ZUM-REEL" --apply --strict
```

Verbindlich:
- jedes gesprochene Wort besitzt echte akustische Start-/Endzeiten
- Whisper wurde auf dem finalen verarbeiteten Audio ausgeführt
- `fallbackCount === 0`; kein Wort und kein Bild-Cue verwendet eine Schätzung
- `coverage === 1`
- `timedWords === totalWords`
- `unassignedWords === 0`
- die komplette gerenderte Untertitel-Wortfolge entspricht exakt `script/voice-script.txt`
- Grundtext bleibt `#F5F7FA`
- vertikale Position bleibt exakt bei 58 % der Bildhöhe
- nur das aktuell gesprochene Wort wird synchron in Braun `#B7794A` markiert
- keine Box und keine zusätzliche Spring-/Zoom-Karaoke-Animation
- fehlt auch nur ein Wort, darf nicht gerendert werden

## Quellenstandard

- zentrale Tatsachenbehauptungen vor Veröffentlichung prüfen
- Primärquellen oder seriöse Fach-/Institutionenquellen bevorzugen
- bei wichtigen oder strittigen Aussagen nach Möglichkeit **mindestens zwei voneinander unabhängige Quellen** verwenden
- konkrete URLs bzw. eindeutig auffindbare Quellen in `sources/sources.md`
- keine erfundenen Quellen oder Platzhalterlinks

## Audio-Nachweis

Die Zielwerte allein reichen nicht als Nachweis. Vor einer finalen Freigabe müssen die **tatsächlichen LUFS und True Peak** des verarbeiteten Voice-overs gemessen und im Prüfbericht gespeichert sein, sobald das aktuelle Audio-Pacing-Schema diese Messung verlangt.

## Erlaubter Haltepunkt

Erst anhalten, wenn **nach der verbindlichen Asset-Suche** externe Dateien tatsächlich nicht auffindbar sind oder mehrere Kandidaten nicht sicher unterschieden werden können.

Sind Assets vorhanden oder wurden sie gefunden:

```text
ZIP ggf. sicher entpacken
→ Bilder/Audio bereitstellen
→ Assets visuell prüfen
→ nummerierte Dateien nur als Routing-Hilfe verwenden
→ Voice-over exakt 1,10x / −16 LUFS / max. −1,5 dBTP verarbeiten
→ tatsächliche LUFS und True Peak nachmessen
→ Timeline synchronisieren
→ jedes gesprochene Wort akustisch synchronisieren
→ 100-%-Untertitelabdeckung prüfen
→ aktuelles Wort braun #B7794A markieren
→ visuelle Zwei-Pass-QC
→ finale Freigabe
→ MP4 rendern
→ fertige MP4 unter 04-video/FERTIGES-VIDEO bereitstellen
```

## Keine Standardrückfragen

Nicht nach Datum, Thema, Szenenzahl, Bildwelt oder bereits heruntergeladenen Assets fragen, solange die Repo-Suche diese Information selbst finden kann. Nur bei einer wirklich nicht auflösbaren Mehrdeutigkeit oder tatsächlich fehlenden externen Datei nachfragen.

## Abschlussmeldung

Vor externen Assets nur bestätigen, was tatsächlich erstellt/geprüft wurde. Bilder, Audio, Tests, CI oder Render niemals als vorhanden/erfolgreich darstellen, wenn sie nicht wirklich erzeugt oder ausgeführt wurden.
