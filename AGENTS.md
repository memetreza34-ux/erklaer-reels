# AGENTS.md

## Pflicht: zuerst die aktuelle Repo-Regel lesen

Vor jeder Reel-Erstellung oder Änderung zuerst **`CURRENT_WORKFLOW.md`** lesen.

`CURRENT_WORKFLOW.md` ist die verbindliche Single Source of Truth. Wenn ältere Dokumente, Beispieltexte, historische Reel-Dateien oder frühere Produktionsaufträge widersprechen, gilt die Prioritätsreihenfolge aus `CURRENT_WORKFLOW.md`.

Ein normaler Auftrag wie „Mach ein neues Reel“ darf globale Regeln **nicht** nebenbei verändern.

---

## Pflicht: Antigravity arbeitet nur in Phase 3

Dieses Repository ist ausschließlich die Produktionsumgebung für Antigravity nach der kreativen Erstellung und externen Mediengenerierung.

1. Phase 1: Normales ChatGPT erstellt Thema, Script, 12–14 Szenen, eine der drei erlaubten Bildwelten, alle Bildprompts, Caption und Quellen.
2. Phase 2: Der Nutzer erstellt mit Google Flow alle Bilder und extern das Voice-over-Audio.
3. Phase 3: Antigravity übernimmt danach den vollständigen technischen Abschluss bis zur geprüften MP4.

Antigravity darf kein Thema wählen, kein Voice-Script schreiben, keine Bildwelt wählen, keine Bildprompts erstellen und keine Bilder oder Audios generieren. Es darf fehlende kreative Inhalte nicht selbst ergänzen.

Vor jeder Phase-3-Produktion zwingend:

```bash
npm run verify:handoff -- --dir "<reel-ordner>"
```

Ist die Übergabe vollständig, arbeitet Antigravity ohne unnötige Pause durch Asset-Discovery, sichere Übernahme, Zwei-Pass-QC, Audio-Pacing, Timeline, Whisper-Sync, Untertitel, Finalisierung, Render und finale Video-QC. Ist sie unvollständig, meldet Antigravity nur die konkrete fehlende Phase-1- oder Phase-2-Komponente.

## Pflichttrigger: „Antigravity los, erstelle das Reel“

Dieser Satz, `Antigravity los` und sinngleiche eindeutige Startaufträge geben den vollständigen Phase-3-Lauf frei.

Danach gilt:

- selbstständig bis zur geprüften MP4 durcharbeiten
- keine Zwischenstände oder routinemäßigen Rückfragen an den Nutzer senden
- intern weiterarbeiten, auch wenn ein Schritt Suche, Prüfung oder sichere Wiederholung benötigt
- erst melden, wenn ein nach allen sicheren Eigenlösungen weiterhin blockierender Fehler vorliegt oder das Reel vollständig fertig und geprüft ist
- Fehlermeldung: konkretes Gate plus konkret benötigte Nutzeraktion
- Fertigmeldung: geprüfter MP4-Pfad plus bestandener Endstatus

Ein bloß schwieriger, langsamer oder noch laufender Schritt ist kein Meldegrund.

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

Diese Prompts stammen aus Phase 1. Antigravity erzeugt oder verändert sie in Phase 3 nicht und erstellt selbst keine Cover- oder Szenenbilder.

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
node scripts/sync-whisper.js <whisper_out.json> "<reel-ordner>"
npm run sync:words -- --dir "<reel-ordner>" --apply --strict
```

Verbindlich:
- keine geschätzten oder gleichmäßig verteilten Wortzeiten als final akzeptieren (ein manuelles "Mocking" oder rechnerisches Schätzen der Wortzeiten ist strengstens verboten!)
- **WICHTIG:** `sync-whisper.js` immer mit Whisper-Zeiten aus dem finalen, bereits gestrafften und auf 1,10x verarbeiteten Audio ausführen.
- der Whisper-Abgleich muss `fallbackCount: 0` sowie exakte Treffer für alle Scriptwörter und Bild-Cues melden; sonst bleibt der Render blockiert
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

- Vor jeder Arbeit `npm run verify:production-lock` ausführen. Schlägt der Produktions-Lock fehl, nicht weiterarbeiten und keine Hashes automatisch aktualisieren.
- Dateien aus `config/locked-production-baseline.json` dürfen nur nach einer ausdrücklichen aktuellen Nutzeranweisung geändert werden. Eine normale Reel- oder YouTube-Produktion ist keine Freigabe dafür.
- Lock-Hashes niemals nebenbei, automatisch oder nur zum Bestehen von CI aktualisieren. Eine Hash-Änderung ist eine bewusste Freigabe des neuen globalen Produktionsvertrags.
- **NIEMALS** interne Quality-Checks (wie `validate:render` oder `sync:words --strict`) mithilfe von `--force` oder durch temporäre Code-Anpassungen (Bypasses) überspringen! Die Pipeline hat immer recht.
- stabile IDs wie `scene-01`
- `scene-index.json` und jede `scene.json` synchron halten
- Rohscript nicht überschreiben
- API-Schlüssel niemals committen
- fehlende/unsichere Assets im Status sichtbar halten
- Pipeline-Stufen einzeln wiederholbar halten
- zentrale Logik testen
- keine Tests, CI-Läufe, Bilder, Audios oder Render als erfolgreich behaupten, wenn sie nicht tatsächlich erzeugt/geprüft wurden
- die versionierte `package-lock.json` verwenden und Abhängigkeiten mit `npm ci` installieren

---

## YouTube-Langvideos — getrennte Pflichtregeln

Vor jeder Arbeit unter `youtube/` zuerst `youtube/YOUTUBE_WORKFLOW.md` und `youtube/YOUTUBE_VISUAL_WORLD.md` lesen. Reel-spezifische Untertitel- und 9:16-Regeln dürfen nicht auf YouTube übertragen werden.

Für YouTube gilt:

- 16:9, 8–12 Minuten, eigene Bildwelt `german-simple-explainer-cartoon`
- ausschließlich Bilder, deutsches Voice-over und sparsame SFX
- keine eingebrannten Untertitel, Karaoke-Wörter oder Textkarten
- gleiches 3-Phasen-Prinzip: ChatGPT erstellt → Nutzer erzeugt Bilder/Audio → Antigravity finalisiert
- `npm run verify:youtube-handoff -- --dir "<youtube-projekt>"` vor Phase 3
- `Antigravity los, erstelle das YouTube-Video` startet den stillen Durchlauf bis Fehler oder geprüfter MP4
- Antigravity meldet keine Zwischenstände und legt die finale Datei unter `10-output/` ab
