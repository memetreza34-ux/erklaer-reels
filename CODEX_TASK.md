# Codex-Hauptauftrag

Dieses Repository produziert vollständige visuelle Erklär-Reels. **`CURRENT_WORKFLOW.md` ist bei Widersprüchen maßgeblich.** Der Nutzer erzeugt Voice-over und Bilder extern. Codex übernimmt Planung, Prompt-Sammlung, Suche nach Assets/ZIPs, Prüfung, Audio-Pacing, sichere Bildzuordnung, Synchronisierung und Remotion-Render.

## Neues Reel

- genau ein deutscher Erzähler
- 155–175 Wörter
- 55–60 Sekunden Voice-over nach Audiooptimierung
- 12–14 Bildmomente, Standard 13
- Geschwindigkeit exakt 1,10x

```bash
npm run create:reel -- \
  --title "TITEL" \
  --script-file input/script.txt \
  --next-free \
  --scenes 13
```

Danach `production/agent-task.md` vollständig bearbeiten. Pflichtdateien sind Script, `reel.json`, Szenendaten, alle Bildprompts, Cover, Prompt-Sammeldatei, Untertitel, Effekte, Caption und Quellen.

```bash
npm run export:prompts -- --dir "PFAD-ZUM-REEL" --strict
npm run validate:reel -- --dir "PFAD-ZUM-REEL"
npm run check:content -- --dir "PFAD-ZUM-REEL" --strict
```

## Aufbau und Bildwelt

- Thema sofort nennen und direkt erklären
- Hook-Bild ab Sekunde 0
- jede Szene zeigt genau einen klaren Moment
- Bildwelt erst nach dem fertigen Script auswählen und innerhalb des Reels konsistent halten
- politische Inhalte neutral; Quellen und Unsicherheiten dokumentieren
- Ende über mindestens zwei Szenen: persönliche Prüf-/Erkenntnisfrage → konkrete Lösung/einprägsamer Satz
- nach dem letzten gesprochenen Wort 0,7 Sekunden Schlussbild ohne neuen Untertitel

## Szenenrhythmus

Zentrale Quelle: `config/production-quality-gates.json`.

- Hook: 4,2–5,5 Sekunden
- normale Szenen: 3,2–5,5 Sekunden
- letzte Szene inklusive Nachlauf: 4,0–6,5 Sekunden
- kein Erklärmoment unter 3,2 Sekunden
- Dauersprung zwischen benachbarten Szenen höchstens 2,5 Sekunden
- Bildwechsel 0,1–0,3 Sekunden vor dem gesprochenen `audioCue`

## Bildprompts und Google Flow

Bildprompts sind Englisch. Sichtbarer Bildtext ist, wenn sinnvoll, kurz und Deutsch. Die komplette Sammeldatei wird einmal in Google Flow gesendet. Google Flow erzeugt danach streng seriell `Bild 00` bis zum letzten Bild und fragt nicht erneut nach `Go`.

`Bild 00` ist Cover, sichtbare Hook und Style-Master. Der Cover-Hook darf nicht automatisch in spätere Szenen kopiert werden.

## Fehlende Assets und ZIPs

Wenn Bilder oder Audio scheinbar fehlen, nicht sofort stoppen:

```bash
npm run discover:assets -- --dir "PFAD-ZUM-REEL"
```

Standard-Suchorte sind Reel-Ordner, `~/Downloads` und `~/Desktop`. Eine eindeutige vollständige ZIP mit `Bild 00 ... Bild XX` darf nach Sicherheitsprüfung temporär entpackt und in `inbox/numbered-images/` übernommen werden. Mehrere vollständige ZIPs müssen inhaltlich geprüft werden; niemals blind die neueste wählen.

Die Nummerierung ist nur Routing-Hilfe. Vor `--apply` bleibt die echte visuelle Zwei-Pass-QC verpflichtend.

## Sichere Bildzuordnung

Für jedes Bild:

1. Bild öffnen und Dateinamen zunächst ignorieren.
2. `visibleSummary` neutral beschreiben.
3. Mit `narration`, `audioCue`, `visualIdea`, `imageText` und `imagePrompt` vergleichen.
4. konkrete `reason` schreiben.
5. gegen vorherige und nächste Szene prüfen.
6. `confirmedTarget`, `confirmedSceneOrder`, `sceneOrderConfirmed` und `secondPassConfirmed` erst danach setzen.
7. Unter 0,90 Konfidenz `unmatched` lassen.

Erlaubte `matchMethod`:
- `visual-content-review`
- `visual-text-and-content-review`

`filename-only` ist verboten.

## Untertitel — verbindlicher aktueller Standard

Zentrale Quelle: `src/shared/subtitle-style.js`.

- horizontal zentriert
- vertikal exakt **58 %** Bildhöhe
- Grundtext `#F5F7FA`
- das **aktuell gesprochene Wort** wird anhand echter akustischer Wortzeiten in Braun **`#B7794A`** markiert
- keine schwarze Box/Balken
- keine Bounce-, Zoom-, Größen- oder Positionsanimation; nur der Farbwechsel des aktiven Wortes
- normalerweise 3–6 Wörter pro Cue, höchstens zwei Zeilen
- jedes gesprochene Wort muss enthalten sein
- `coverage === 1`
- `timedWords === totalWords`
- `unassignedWords === 0`
- die komplette gerenderte Untertitel-Wortfolge muss exakt `script/voice-script.txt` entsprechen
- geschätzte Cue-/Wortzeiten sind verboten
- fehlt auch nur ein gesprochenes Wort, darf nicht gerendert werden

## Audio und Wort-Sync

```bash
npm run trim:pauses -- --dir "PFAD-ZUM-REEL" --speed 1.10
npm run build:timeline -- --dir "PFAD-ZUM-REEL"
npm run sync:audio -- --dir "PFAD-ZUM-REEL" --strict
npm run sync:words -- --dir "PFAD-ZUM-REEL"
# production/codex-word-sync-task.md vollständig akustisch bearbeiten
npm run sync:words -- --dir "PFAD-ZUM-REEL" --apply --strict
```

Audio-Standard:
- ursprüngliche Voice-over-Datei verwenden
- Pausen ab ungefähr 0,24 Sekunden kürzen
- exakt 1,10x bei erhaltener Tonhöhe
- −16 LUFS und höchstens −1,5 dBTP
- optimierte Datei nicht erneut beschleunigen
- jedes Wort im echten lokalen Audio akustisch bestätigen
- keine gleichmäßige oder erfundene Zeitverteilung

## Visuelle Prüfung und Render

```bash
npm run organize:assets -- --dir "PFAD-ZUM-REEL" --apply
npm run check:visuals -- --dir "PFAD-ZUM-REEL" --strict
npm run build:timeline -- --dir "PFAD-ZUM-REEL"
npm run sync:audio -- --dir "PFAD-ZUM-REEL" --strict
npm run sync:words -- --dir "PFAD-ZUM-REEL" --apply --strict
npm run finalize:reel -- --dir "PFAD-ZUM-REEL" --strict
npm run validate:render -- --dir "PFAD-ZUM-REEL"
npm run render:reel -- --dir "PFAD-ZUM-REEL"
```

Nur rendern, wenn Inhalt, Audio, Lautheit, Audio-Sync, **100-%-Untertitelabdeckung**, exakte akustische Wort-Synchronisierung, braune Sprecher-Markierung, sichere Bildzuordnung, visuelle Prüfung, Szenenrhythmus, 0,7-Sekunden-Schlussbild und Renderer-Eingabe tatsächlich bestanden sind.

Das finale Video ist sichtbar unter:

```text
04-video/FERTIGES-VIDEO/
```

Keine geplante Stufe als abgeschlossen bezeichnen und keine nicht ausgeführten Tests als bestanden melden.
