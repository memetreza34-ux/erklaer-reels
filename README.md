# Erklär-Reels

Produktionspipeline für visuelle Erklär-Reels zu Politik, Gesellschaft, Ländern, Geografie, Geschichte, Psychologie und menschlichem Verhalten.

> Warum Menschen, Länder und Gesellschaften so funktionieren.

## Verbindliche aktuelle Regeln

**`CURRENT_WORKFLOW.md` ist die Single Source of Truth für den aktuellen Produktionsablauf.**

Neue Chats, Codex, Antigravity und andere Repo-Agenten sollen diese Datei zuerst lesen. Bei einem Widerspruch mit älteren Dokumenten oder historischen Reel-Dateien gilt die Prioritätsreihenfolge aus `CURRENT_WORKFLOW.md`.

## Produktionsstandard

- 55–60 Sekunden Voice-over
- 155–175 deutsche Wörter
- 12–14 Szenen, Standard 13
- genau ein klarer Bildmoment pro Szene
- Bildwelt erst nach dem fertigen Script auswählen
- starkes Ende über mindestens zwei Szenen
- Schlussbild 0,7 Sekunden nach dem letzten gesprochenen Wort halten
- Voice-over exakt 1,10x mit erhaltener Tonhöhe
- −16 LUFS und höchstens −1,5 dBTP
- Untertitel bei exakt 58 % Bildhöhe
- Grundtext `#F5F7FA`; **nur das aktuell gesprochene Wort** wird anhand echter akustischer Wortzeiten in Braun `#B7794A` markiert
- 100 % des gesprochenen Voice-Scripts müssen in identischer Wortreihenfolge als Untertitel enthalten sein; `unassignedWords` muss 0 sein
- keine schwarze Box und keine Spring-/Zoom-Karaoke-Animation; ausschließlich Farbwechsel des aktiven Wortes
- ausschließlich harte Schnitte
- keine Hintergrundmusik

## Aktueller Bildworkflow mit Google Flow

Antigravity/Codex erstellen Script, Cover-Prompt, Szenenprompts und die Sammeldatei, **aber keine Bilder**.

Der Nutzer kopiert einmal die komplette Datei

```text
all-image-prompts/all-image-prompts.txt
```

in Google Flow und sendet sie ab.

Danach arbeitet Google Flow autonom und streng seriell:

```text
Bild 00 erzeugen
→ vollständig warten
→ sofort Bild 00.png nennen
→ prüfen
→ automatisch Bild 01 starten
→ vollständig warten
→ sofort Bild 01.png nennen
→ ...
→ bis zum letzten Bild
```

Dabei gilt:
- nie mehrere Bilder gleichzeitig
- keine Batch-/Queue-Verarbeitung
- nach einem Bild kein neues `Go`, `Weiter` oder `OK` vom Nutzer verlangen
- `Bild 00` ist Cover, sichtbare Hook und Style-Master für alle Szenen
- erst nach dem letzten Bild alle fertigen Bilder gemeinsam in den Sammelordner legen

Gemeinsamer sichtbarer Ordner:

```text
00-bildprompts/00-ALLE-BILDER-HIER-REIN/
```

Technisches Ziel:

```text
inbox/numbered-images/
```

Bevorzugte Benennung:

```text
Bild 00.png = Cover
Bild 01.png = Szene 1
Bild 02.png = Szene 2
...
```

Die Nummerierung dient beim Import nur als Routing-Hilfe. Die finale Zuordnung wird immer visuell geprüft.

## Fehlende Assets automatisch suchen

Bevor ein Agent meldet, dass Bilder oder Audio fehlen, muss er die Asset-Discovery ausführen:

```bash
npm run discover:assets -- --dir "PFAD-ZUM-REEL"
```

`organize:assets` führt diese Suche ebenfalls automatisch aus. Standardmäßig werden Reel-Ordner, `~/Downloads` und `~/Desktop` geprüft. Eine eindeutige vollständige ZIP mit `Bild 00 ... Bild XX` kann sicher entpackt und in `inbox/numbered-images/` übernommen werden. Auch danach bleibt die visuelle Zwei-Pass-QC Pflicht.

## Neues Reel

Bei „Mach ein neues Reel“ oder sinngleichen Aufträgen gilt der autonome Ablauf aus `CURRENT_WORKFLOW.md`, `AGENTS.md` und `docs/autonomous-reel.md`.

```bash
npm run next:slot -- --json
npm run create:reel -- \
  --title "TITEL" \
  --script-file input/script.txt \
  --next-free \
  --scenes 13
npm run export:prompts -- --dir "PFAD-ZUM-REEL" --strict
npm run validate:reel -- --dir "PFAD-ZUM-REEL"
npm run check:content -- --dir "PFAD-ZUM-REEL" --strict
```

Ein normaler neuer Reel-Auftrag verändert keine globalen Produktionsregeln.

## Sichtbare Ordnerstruktur

```text
reel-01_thema/
├── 00-bildprompts/
│   ├── 00-ALLE-BILDER-HIER-REIN/
│   ├── 00-cover/
│   ├── 01-scene-01/
│   ├── 02-scene-02/
│   ├── ...
│   └── 99-alle-bildprompts.txt
├── 01-voice-script/
├── 02-audio/
├── 03-caption/
├── 04-video/
└── 99-technik/
```

Das finale Video liegt technisch unter `output/` und ist nach erfolgreichem Render sichtbar über `04-video/FERTIGES-VIDEO/` erreichbar.

## Sichere Bildzuordnung

Die Dateinummer darf das vorgeschlagene Ziel vorsortieren, aber **niemals allein die finale Zuordnung bestätigen**.

Vor `--apply` jedes Bild tatsächlich öffnen und prüfen gegen `narration`, `audioCue`, `visualIdea`, `imageText` und `imagePrompt`, danach gegen vorherige und nächste Szene. Unter 0,90 Konfidenz nicht raten.

```bash
npm run organize:assets -- --dir "PFAD-ZUM-REEL"
# inbox/asset-map.json visuell vollständig prüfen
npm run organize:assets -- --dir "PFAD-ZUM-REEL" --apply
```

## Audio, vollständige Untertitel-Synchronisierung und Render

```bash
npm run trim:pauses -- --dir "PFAD-ZUM-REEL" --speed 1.10
npm run build:timeline -- --dir "PFAD-ZUM-REEL"
npm run sync:audio -- --dir "PFAD-ZUM-REEL" --strict
npm run sync:words -- --dir "PFAD-ZUM-REEL"
# jedes Wort im echten Audio akustisch prüfen
npm run sync:words -- --dir "PFAD-ZUM-REEL" --apply --strict
npm run check:visuals -- --dir "PFAD-ZUM-REEL" --strict
npm run finalize:reel -- --dir "PFAD-ZUM-REEL" --strict
npm run validate:render -- --dir "PFAD-ZUM-REEL"
npm run render:reel -- --dir "PFAD-ZUM-REEL"
```

Vor dem Render gilt zwingend: `coverage === 1`, `timedWords === totalWords`, `unassignedWords === 0`, und die gerenderte Untertitel-Wortfolge entspricht exakt `script/voice-script.txt`. Fehlt auch nur ein gesprochenes Wort, ist der Render blockiert.

Keine geplante oder nicht ausgeführte Stufe als bestanden ausgeben.

## Voraussetzungen

- Node.js 20 oder neuer
- FFmpeg und optional `ffprobe`
- Remotion-Pakete in identischer Version

## Bekannter Infrastrukturpunkt

Issue #19 (`package-lock.json` erzeugen und CI auf `npm ci` umstellen) bleibt offen. Keine Lockdatei manuell erfinden und keine nicht ausgeführten Tests als bestanden melden.
