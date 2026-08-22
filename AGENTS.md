# AGENTS.md

## Pflicht: zuerst die aktuelle Repo-Regel lesen

Vor jeder Reel-Erstellung oder Änderung zuerst **`CURRENT_WORKFLOW.md`** lesen.

`CURRENT_WORKFLOW.md` ist die verbindliche Single Source of Truth. Wenn ältere Dokumente, Beispieltexte, historische Reel-Dateien oder frühere Produktionsaufträge widersprechen, gilt die Prioritätsreihenfolge aus `CURRENT_WORKFLOW.md`.

Ein normaler Auftrag wie „Mach ein neues Reel“ darf globale Regeln nicht nebenbei verändern.

---

## Pflichttrigger: „Mach ein neues Reel“

Bei „Mach ein neues Reel“, „Erstelle das nächste Reel“ oder sinngleichen Imperativen erstellt Codex selbstständig das vollständige Produktionspaket.

1. `CURRENT_WORKFLOW.md`, `docs/autonomous-reel.md` und `CODEX_TASK.md` lesen.
2. `npm run next:slot -- --json` ausführen.
3. Wiederholungen vermeiden und ein Thema aus den erlaubten Säulen wählen.
4. Ein deutsches Voice-over mit genau einem Erzähler schreiben.
5. Reel mit `npm run create:reel -- --next-free` anlegen.
6. `production/agent-task.md` vollständig bearbeiten.
7. Cover, 12–14 Szenen, Bildprompts, Sammeldatei, Effektplanung, Caption und Quellen fertigstellen.
8. **Keine Untertitel erstellen, keine Subtitle-Cues befüllen und keinen Word-Sync-Schritt ausführen.**
9. `npm run export:prompts -- --dir "<reel-ordner>" --strict` ausführen.
10. `validate:reel` und `check:content --strict` ausführen, soweit die Umgebung dies tatsächlich erlaubt.
11. Wenn Bilder oder Audio scheinbar fehlen, zuerst `discover:assets` bzw. `organize:assets` verwenden.
12. Gefundene ZIP-Dateien mit vollständiger `Bild 00 ... Bild XX`-Serie sicher entpacken und danach echte visuelle Zwei-Pass-QC durchführen.
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

- 155–175 Wörter
- 55–60 Sekunden Voice-over
- 12–14 Szenen, Standard 13
- exakt 1,10x Audio
- −16 LUFS, max. −1,5 dBTP
- **keine Untertitel**
- **keine Wortmarkierung / kein Karaoke / kein Word-Sync für Untertitel**
- Bilder nutzen die volle 9:16-Fläche; keine künstliche Untertitel-Safe-Zone
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
- Google Flow erzeugt streng ein Bild nach dem anderen.
- Kein Parallelisieren, kein Batch, keine Queue.
- Jedes Bild vollständig abwarten und sofort `Bild XX` nennen.
- Danach automatisch ohne weiteres `Go` mit dem nächsten Bild fortfahren.
- `Bild 00` ist Cover, sichtbare Hook und verbindlicher Style-Master.
- Erst nach dem letzten Bild alle fertigen Bilder gemeinsam in `00-bildprompts/00-ALLE-BILDER-HIER-REIN/` legen.

Antigravity, Codex und andere Repo-Agenten erzeugen selbst keine Cover- oder Szenenbilder.

---

## Fehlende Assets suchen, ZIPs entpacken und danach weiterarbeiten

Vor jeder Meldung „Bilder fehlen“ oder „Audio fehlt“ zuerst suchen:

```bash
npm run discover:assets -- --dir "<reel-ordner>"
```

Der normale Befehl

```bash
npm run organize:assets -- --dir "<reel-ordner>"
```

führt die Discovery ebenfalls aus.

Standard-Suchorte:
- aktueller Reel-Ordner
- `~/Downloads`
- `~/Desktop`

Nummerierung ist nur Routing-Hilfe. Jedes Bild muss visuell gegen `narration`, `audioCue`, `visualIdea`, `imageText` und `imagePrompt` geprüft werden. Unter 0,90 Konfidenz nicht raten.

---

## Audio und Szenen-Sync

```bash
npm run trim:pauses -- --dir "<reel-ordner>" --speed 1.10
npm run build:timeline -- --dir "<reel-ordner>"
npm run sync:audio -- --dir "<reel-ordner>" --strict
```

Verbindlich:
- nur die endgültige verarbeitete Audiodatei als Zeitquelle verwenden
- Szenenwechsel über echte, akustisch bestätigte `audioCue`-Zeitpunkte ausrichten
- keine geschätzten, mathematisch verteilten oder künstlich geklemmten Szenenanker akzeptieren
- jede Änderung am finalen Voice-over invalidiert die Szenen-Timeline
- `sync:words` ist für neue Reels nicht erforderlich

---

## Finale Prüfung

```bash
npm run organize:assets -- --dir "<reel-ordner>" --apply
npm run check:visuals -- --dir "<reel-ordner>" --strict
npm run build:timeline -- --dir "<reel-ordner>"
npm run sync:audio -- --dir "<reel-ordner>" --strict
npm run finalize:reel -- --dir "<reel-ordner>" --strict
npm run validate:render -- --dir "<reel-ordner>"
npm run render:reel -- --dir "<reel-ordner>"
```

Ein Reel darf nur als fertig gelten, wenn Inhalt, Audio, Lautheit, Szenen-Sync, sichere Bildzuordnung, visuelle Prüfung, Szenenrhythmus, Schlussbild-Nachlauf und Renderer-Eingabe tatsächlich bestanden sind.

---

## Technische Schutzregeln

- interne Quality-Checks niemals mit `--force` oder temporären Bypasses umgehen
- stabile IDs wie `scene-01`
- `scene-index.json` und jede `scene.json` synchron halten
- Rohscript nicht überschreiben
- API-Schlüssel niemals committen
- fehlende/unsichere Assets im Status sichtbar halten
- Pipeline-Stufen einzeln wiederholbar halten
- zentrale Logik testen
- **Untertitel nicht wieder aktivieren, auch nicht aus historischen Reel-Dateien**
- keine Tests, CI-Läufe, Bilder, Audios oder Render als erfolgreich behaupten, wenn sie nicht tatsächlich erzeugt/geprüft wurden
