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
10. Erst bei fehlenden externen Bildern oder Voice-over anhalten.
11. Sind Assets vorhanden, bis zur tatsächlich geprüften MP4 weiterarbeiten.

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
- Untertitel bei 58 % Bildhöhe, `#F5F7FA`, keine Box/Karaoke-Markierung
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

Keine geschätzten oder gleichmäßig verteilten Wortzeiten als final akzeptieren.

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

Ein Reel darf nur als fertig gelten, wenn Inhalt, Audio, Lautheit, Audio-Sync, exakte Wort-Synchronisierung, sichere Bildzuordnung, visuelle Prüfung, Szenenrhythmus, Schlussbild-Nachlauf und Renderer-Eingabe **tatsächlich** bestanden sind.

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
