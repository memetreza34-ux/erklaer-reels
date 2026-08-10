# AGENTS.md

## Pflicht: zuerst die aktuelle Repo-Regel lesen

Vor jeder Reel-Erstellung oder Änderung zuerst **`CURRENT_WORKFLOW.md`** lesen.

`CURRENT_WORKFLOW.md` ist die verbindliche Single Source of Truth. Wenn ältere Dokumente, Beispieltexte, historische Reel-Dateien oder frühere Produktionsaufträge widersprechen, gilt die Prioritätsreihenfolge aus `CURRENT_WORKFLOW.md`.

Ein normaler Auftrag wie „Mach ein neues Reel“ darf globale Regeln **nicht** nebenbei verändern.

---

## Pflichttrigger: „Mach ein neues Reel“

Bei „Mach ein neues Reel“, „Erstelle das nächste Reel“ oder sinngleichen Imperativen erstellt Codex selbstständig das vollständige Produktionspaket. Nicht nach Datum oder Thema fragen und nicht nach der Ordnererstellung stoppen.

1. `CURRENT_WORKFLOW.md`, `docs/autonomous-reel.md` und `CODEX_TASK.md` lesen.
2. `npm run next:slot -- --json` ausführen.
3. Wiederholungen vermeiden und ein Thema aus den erlaubten Säulen wählen.
4. Ein deutsches Voice-over mit genau einem Erzähler schreiben.
5. Reel mit `npm run create:reel -- --next-free` anlegen.
6. `production/agent-task.md` vollständig bearbeiten.
7. Cover, 12–14 Szenen, Bildprompts, Sammeldatei, Untertitel-/Effektplanung, Caption und Quellen fertigstellen.
8. `npm run export:prompts -- --dir "<reel-ordner>" --strict` ausführen.
9. `validate:reel` und `check:content --strict` ausführen, soweit die Umgebung dies tatsächlich erlaubt.
10. Wenn Bilder oder Audio scheinbar fehlen, **nicht sofort anhalten**, sondern zuerst `npm run discover:assets -- --dir "<reel-ordner>"` bzw. den normalen `organize:assets`-Lauf verwenden und die definierten Suchorte prüfen.
11. Gefundene ZIP-Dateien mit vollständiger `Bild 00 ... Bild XX`-Serie automatisch sicher entpacken und in `inbox/numbered-images/` übernehmen; danach weiterhin echte visuelle Zwei-Pass-QC durchführen.
12. Erst wenn die Asset-Suche nachweislich nichts Passendes findet oder mehrere unklare Kandidaten nicht sicher unterschieden werden können, den Nutzer informieren.
13. Sind alle Assets vorhanden und geprüft, ohne unnötige Pause bis zur tatsächlich geprüften MP4 weiterarbeiten.

---

## Kanal und Themen

Leitidee: **Warum Menschen, Länder und Gesellschaften so funktionieren.**

Erlaubt:
- Politik und Gesellschaft
- Länder, Geografie und Geschichte
- Psychologie und menschliches Verhalten

Nicht autonom verwenden:
- Körper und Biologie
- Finanzen
- Elektrotechnik
- KI-News
- tägliche politische Nachrichten
- Parteienwerbung

Politische Inhalte neutral erklären und Unsicherheiten in `sources/sources.md` dokumentieren.

---

## Verbindlicher Reel-Standard

Die aktuellen Werte stehen in `CURRENT_WORKFLOW.md`. Zentrale technische Grenzwerte liegen zusätzlich in `config/production-quality-gates.json`.

Kurzfassung:
- 155–175 Wörter
- 55–60 Sekunden Voice-over
- 12–14 Szenen, Standard 13
- exakt 1,10x Audio
- −16 LUFS, max. −1,5 dBTP
- Untertitel bei exakt 58 % Bildhöhe
- Grundtext `#F5F7FA`
- aktuell gesprochenes Wort exakt nach akustischen Wortzeiten in Braun `#B7794A`
- 100 % des gesprochenen Voice-Scripts müssen in derselben Wortreihenfolge als Untertitel vorhanden sein; kein Wort und kein Satz darf fehlen
- keine Untertitelbox, kein Springen, Zoomen oder sonstige Karaoke-Animation; nur die Farbe des aktiven Wortes wechselt
- nur harte Schnitte
- 0,7 Sekunden Schlussbild-Nachlauf
- Bildwelt erst nach dem Script auswählen und innerhalb des Reels konsistent halten

Die letzten zwei Szenen bilden ein starkes Ende:
1. persönliche Prüf-, Erkenntnis- oder Entscheidungsfrage
2. konkrete Lösung und kurzer einprägsamer Abschlusssatz

---

## Bildprompts und Google Flow

Jeder Szenenprompt liegt unter `scenes/scene-XX/image-prompt.txt`. Cover-Prompt liegt unter `cover/cover-prompt.txt`.

Danach zwingend:

```bash
npm run export:prompts -- --dir "<reel-ordner>" --strict
```

Die erzeugte `all-image-prompts/all-image-prompts.txt` muss dem aktuellen Google-Flow-Vertrag aus `CURRENT_WORKFLOW.md` entsprechen:

- Nutzer startet Google Flow einmal mit der kompletten Datei.
- Google Flow erzeugt streng **ein Bild nach dem anderen**.
- Kein Parallelisieren, kein Batch, keine Queue.
- Jedes Bild vollständig abwarten und sofort `Bild XX` nennen.
- Danach automatisch ohne weiteres `Go` mit dem nächsten Bild fortfahren.
- `Bild 00` ist Cover, sichtbare Hook und verbindlicher Style-Master.
- Erst nach dem letzten Bild alle fertigen Bilder gemeinsam in `00-bildprompts/00-ALLE-BILDER-HIER-REIN/` legen.

Antigravity, Codex und andere Repo-Agenten erzeugen selbst keine Cover- oder Szenenbilder.

---

## Fehlende Assets suchen, ZIPs entpacken und danach weiterarbeiten

Ein fehlendes Asset im Reel-Ordner bedeutet **nicht automatisch**, dass der Nutzer es noch nicht erstellt hat.

Vor jeder Meldung „Bilder fehlen“ oder „Audio fehlt“ muss der Agent zuerst suchen:

```bash
npm run discover:assets -- --dir "<reel-ordner>"
```

Der normale Befehl

```bash
npm run organize:assets -- --dir "<reel-ordner>"
```

führt diese Discovery ebenfalls automatisch vor der Zuordnung aus.

Standard-Suchorte:
- aktueller Reel-Ordner
- `~/Downloads`
- `~/Desktop`

Dabei gilt:

1. Nach losen unterstützten Bildern und Audio-Dateien suchen.
2. Besonders nach ZIP-Dateien suchen, weil Google Flow bzw. Downloads die komplette Bildserie als ZIP liefern können.
3. Eine ZIP nur automatisch verwenden, wenn sie eine **vollständige und eindeutige** nummerierte Serie für dieses Reel enthält: `Bild 00` bis zur letzten Szene.
4. Vor dem Entpacken Archivpfade auf unsichere `..`-/absolute Pfade prüfen.
5. ZIP in einen temporären Ordner entpacken und die Bilder standardisiert nach `inbox/numbered-images/Bild XX.<ext>` übernehmen.
6. Bereits vorhandene Bildnummern nicht überschreiben und keine doppelten Nummern erzeugen.
7. Auch nach einer erfolgreichen ZIP-Erkennung bleibt die Nummerierung nur Routing-Hilfe. Jedes Bild muss weiterhin tatsächlich visuell geprüft werden.
8. Bei Audio darf nur ein eindeutig plausibler einzelner Kandidat automatisch bereitgestellt werden. Mehrere/unklare Audio-Kandidaten müssen geprüft werden; niemals raten.
9. Wenn passende Assets gefunden und geprüft sind, automatisch mit Zuordnung, Audio-Pacing, Sync, Finalisierung und Render fortfahren.
10. Erst wenn die echte Suche nichts Passendes findet oder eine sichere Entscheidung unmöglich ist, den Nutzer um Hilfe bitten.

Die Suchdiagnose wird unter `inbox/asset-discovery.json` dokumentiert.

---

## Deutscher Bildtext

Wo es zur Aussage passt, kurzer deutscher Text direkt in die Illustration integrieren.

- bevorzugt ungefähr 55–85 % der Szenen
- meist 1–5 Wörter
- `scene.imageText` enthält den exakten Wortlaut
- derselbe Wortlaut steht exakt im englischen Prompt
- kein englischer sichtbarer Text, keine Fantasieschrift oder zufälligen Wörter
- Bildtext und Untertitel nicht wortgleich doppeln
- Text weglassen, wenn das Bild ohne Text besser funktioniert

---

## Sichere Bildzuordnung

Die feste Nummerierung darf nur das **vorgeschlagene Ziel vorsortieren**. Sie ist nie die finale inhaltliche Bestätigung.

Für jedes Bild:

### Durchgang 1
1. Bild tatsächlich öffnen.
2. Dateinamen zunächst ignorieren.
3. `visibleSummary` neutral beschreiben.
4. Mit `narration`, `audioCue`, `visualIdea`, `imageText` und `imagePrompt` vergleichen.
5. Konkrete `reason` schreiben.

### Durchgang 2
1. Gegen vorherige und nächste Szene prüfen.
2. `confirmedTarget` und `confirmedSceneOrder` eintragen.
3. Erst dann `sceneOrderConfirmed: true` und `secondPassConfirmed: true`.
4. Unter 0,90 Konfidenz `unmatched` lassen.

Erlaubte `matchMethod`:
- `visual-content-review`
- `visual-text-and-content-review`

`filename-only` ist verboten.

---

## Audio und Untertitel

Zentrale Quellen:
- `src/shared/subtitle-style.js`
- `src/shared/audio-pacing-style.js`

```bash
npm run trim:pauses -- --dir "<reel-ordner>" --speed 1.10
npm run build:timeline -- --dir "<reel-ordner>"
npm run sync:audio -- --dir "<reel-ordner>" --strict
npm run sync:words -- --dir "<reel-ordner>"
# production/codex-word-sync-task.md akustisch vollständig bearbeiten
npm run sync:words -- --dir "<reel-ordner>" --apply --strict
```

Verbindlich:
- keine geschätzten oder gleichmäßig verteilten Wortzeiten als final akzeptieren
- jedes Wort des tatsächlichen Voice-overs akustisch abhören und mit Start-/Endzeit bestätigen
- 100 % Wortabdeckung; `unassignedWords` muss exakt `0` sein
- die komplette gerenderte Untertitel-Wortfolge muss exakt der Wortfolge von `script/voice-script.txt` entsprechen
- das aktuell gesprochene Wort wird mit `#B7794A` markiert, alle anderen Wörter bleiben `#F5F7FA`
- bei einer Pause darf kein falsches Folgewort vorzeitig braun werden
- fehlt auch nur ein gesprochenes Wort, bleibt `wordSync = needs-review` und der Render ist blockiert

---

## Finale Prüfung

```bash
npm run organize:assets -- --dir "<reel-ordner>" --apply
npm run check:visuals -- --dir "<reel-ordner>" --strict
npm run build:timeline -- --dir "<reel-ordner>"
npm run sync:audio -- --dir "<reel-ordner>" --strict
npm run sync:words -- --dir "<reel-ordner>" --apply --strict
npm run finalize:reel -- --dir "<reel-ordner>" --strict
npm run validate:render -- --dir "<reel-ordner>"
npm run render:reel -- --dir "<reel-ordner>"
```

Ein Reel darf nur als fertig gelten, wenn Inhalt, Audio, Lautheit, Audio-Sync, **100-%-Untertitelabdeckung**, exakte akustische Wort-Synchronisierung, braune Sprecher-Markierung, sichere Bildzuordnung, visuelle Prüfung, Szenenrhythmus, Schlussbild-Nachlauf und Renderer-Eingabe **tatsächlich** bestanden sind.

---

## Technische Schutzregeln

- stabile IDs wie `scene-01`
- `scene-index.json` und jede `scene.json` synchron halten
- Rohscript nicht überschreiben
- API-Schlüssel niemals committen
- fehlende/unsichere Assets im Status sichtbar halten
- Pipeline-Stufen einzeln wiederholbar halten
- zentrale Logik testen
- keine Tests, CI-Läufe, Bilder, Audios oder Render als erfolgreich behaupten, wenn sie nicht tatsächlich erzeugt/geprüft wurden
- Issue #19 zur Lockdatei/CI nicht durch eine erfundene `package-lock.json` umgehen
