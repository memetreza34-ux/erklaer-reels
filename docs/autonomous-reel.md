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
- Effektplanung
- Statusdateien
- vollständige Prompt-Sammeldatei
- **Untertitel deaktiviert lassen**

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

### 8. Audio und Szenen synchronisieren

Nach dem finalen Audio:

```bash
npm run trim:pauses -- --dir "PFAD-ZUM-REEL" --speed 1.10
npm run build:timeline -- --dir "PFAD-ZUM-REEL"
npm run sync:audio -- --dir "PFAD-ZUM-REEL" --strict
```

Verbindlich:
- exakt 1,10x bei erhaltener Tonhöhe
- −16 LUFS und höchstens −1,5 dBTP
- tatsächliche Lautheit nachmessen
- jeder Szenenwechsel basiert auf dem passenden `audioCue` der finalen Audiodatei
- keine geschätzten, gleichmäßig verteilten oder künstlich geklemmten Szenenanker
- jede spätere Änderung am Voice-over macht die Szenen-Timeline ungültig
- **kein `sync:words` und keine Untertitel**

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
→ Szenen-Timeline mit echten Audio-Cues synchronisieren
→ visuelle Zwei-Pass-QC
→ finale Freigabe
→ MP4 ohne Untertitel rendern
→ fertige MP4 unter 04-video/FERTIGES-VIDEO bereitstellen
```

## Keine Standardrückfragen

Nicht nach Datum, Thema, Szenenzahl, Bildwelt oder bereits heruntergeladenen Assets fragen, solange die Repo-Suche diese Information selbst finden kann. Nur bei einer wirklich nicht auflösbaren Mehrdeutigkeit oder tatsächlich fehlenden externen Datei nachfragen.

## Abschlussmeldung

Vor externen Assets nur bestätigen, was tatsächlich erstellt/geprüft wurde. Bilder, Audio, Tests, CI oder Render niemals als vorhanden/erfolgreich darstellen, wenn sie nicht wirklich erzeugt oder ausgeführt wurden.
