# Die drei Produktionsphasen

**Verbindliche Rollenverteilung für jedes Reel.** `CURRENT_WORKFLOW.md` hat bei Widersprüchen Vorrang.

| Phase | Wer | Ergebnis |
|---|---|---|
| 1 | ChatGPT | Reel-Ordner mit Script, Bildprompts, Motion-/SFX-Plan, Caption und Quellen |
| 2 | Arman | echtes Voice-over und alle Bilder im aktuellen Reel-Ordner |
| 3 | Antigravity | synchronisiertes, geprüftes Reel mit MP4 + Caption |

Niemand übernimmt Nutzerassets aus einem anderen Reel. Antigravity erzeugt keine Ersatzbilder.

---

## Phase 1 — ChatGPT

### Slot und Thema

Chronologisch nächsten freien Wochentag verwenden. Themenuniversum ist offen; entscheidend sind Hook, Aha-Moment, Belegbarkeit, visuelle Stärke und Abwechslung.

### Reel-Paket

Das vollständige Paket kann über `input/reel-paket.json` importiert werden:

```bash
npm run import:reel -- --file input/reel-paket.json --check
npm run import:reel -- --file input/reel-paket.json
```

Alternativ Workspace direkt anlegen:

```bash
npm run create:reel -- --title "Warum …?" --script-file input/script.txt --next-free --scenes 9
```

### Inhaltspflichten

- 155–175 deutsche Wörter
- 8–10 narrative Szenen, Standard 9
- Hook exakt 1 Bild
- jede weitere Szene exakt 2 Bilder
- 9 Szenen = 17 Bildphasen
- zweite Bildphase mit eigenem gesprochenen `audioCue`
- jede Bildphase mindestens 3 s
- Bildprompts Englisch
- Bild 01 mit deutscher Headline
- spätere `imageText` optional, wenn vorhanden max. 4 Wörter
- mindestens zwei hochwertige HTTPS-Quellen auf verschiedenen Hosts
- plattformneutrale Caption mit 60–130 Wörtern und 3–6 Hashtags

### Bildwelt

Ausschließlich **Modern Countryball Explainer** (`modern-countryball-explainer`). Bilder sollen konkrete lebendige Mini-Szenen sein, keine statischen Lernposter.

### Motion — Pflicht

Jeder Bildmoment bekommt sichtbare dezente Bewegung:
- `ken-burns`
- `subtle-push-in` / `subtle-pull-out`
- `slow-zoom-in` / `slow-zoom-out`
- `pan-left/right/up/down`

Zoom meist 2–4 %, Pan 1–3 %, weiches Easing. Hook und zweite Bildphase bewegen sich ebenfalls. `none` ist für neue Reels nicht zulässig. Bekannte Aliasnamen werden kanonisch aufgelöst; unbekannte Motion-Typen blockieren.

### SFX — Pflicht

- jeder Szenenwechsel ab Szene 2: SFX
- jeder interne Bildwechsel: eigener SFX mit `targetId`
- interne SFX möglichst mit demselben `audioCue` wie die Bildphase
- `visualEvent` und `reason` Pflicht
- ausschließlich `type` aus `config/sound-library.json`
- typische Lautstärke 0,18–0,30

Vor Übergabe:

```bash
npm run check:content -- --dir "<reel>" --strict
npm run export:prompts -- --dir "<reel>" --strict
```

`check:content --strict` blockiert fehlende Motion-/SFX-Coverage.

**Übergabe an Phase 2:** `00-bildprompts/99-alle-bildprompts.txt` und `01-voice-script/voice-script.txt` sind fertig.

---

## Phase 2 — Arman

### Voice-over

`01-voice-script/voice-script.txt` sprechen/generieren und Original unter

```text
02-audio/AUDIO-HIER-EINFUEGEN/
```

ablegen. Original nicht überschreiben.

### Bilder

`00-bildprompts/99-alle-bildprompts.txt` einmal vollständig an Google Flow geben. Flow arbeitet streng seriell:

```text
1 Bild erzeugen → warten → prüfen → Bild NN.png → ablegen → prüfen → nächstes
```

Bei 9 Szenen: `Bild 01.png` bis `Bild 17.png`.

Bilder gesammelt nach:

```text
00-bildprompts/00-ALLE-BILDER-HIER-REIN/
```

**Übergabe an Phase 3:** aktuelles Reel enthält echtes Audio und alle Bilder.

---

## Phase 3 — Antigravity

Antigravity führt ausschließlich die echten aktuellen Assets zusammen.

### 1. Assets finden und prüfen

```bash
npm run discover:assets -- --dir "<reel>"
npm run organize:assets -- --dir "<reel>" --apply
npm run check:visuals -- --dir "<reel>" --strict
```

Bilder nicht nur nach Dateinummer zuordnen, sondern gegen Prompt/Narration/Bildphase prüfen. Unter 0,90 Konfidenz nicht raten.

### 2. Audio wirklich fertig machen

```bash
npm run trim:pauses -- --dir "<reel>" --speed 1.10
```

Pflicht:
- Anfangs-/lange Pausen straffen
- Endstille entfernen
- 1,10x bei erhaltener Tonhöhe
- −16 LUFS
- max. −1,5 dBTP
- echte Nachmessung

Das finale Voice-over darf höchstens **0,25 s Endstille** enthalten. Der separate Schlussbild-Hold kommt erst in der Timeline und beträgt 0,5–0,7 s, Ziel 0,6 s.

### 3. Sounds binden

```bash
npm run sync:sounds -- --dir "<reel>" --strict
```

Jeder geplante Soundtyp muss eine reale Datei aus der zentralen Library besitzen. Unbekannte Typen oder fehlende Dateien blockieren.

### 4. Timeline

```bash
npm run build:timeline -- --dir "<reel>" --strict
```

- Szenencut ca. 0,10 s vor echtem Szenen-Cue
- interner Bildcut ca. 0,08 s vor echtem Bild-Cue
- SFX ca. 0,04 s vor sichtbarem Cut
- Hook und alle Bildphasen mit sichtbarer Motion
- keine Crossfades

### 5. Finalisieren und rendern

```bash
npm run finalize:reel -- --dir "<reel>" --strict
npm run validate:render -- --dir "<reel>"
npm run render:reel -- --dir "<reel>"
```

Finalizer und Renderer prüfen Motion-/SFX-Coverage, Soundbibliothek, aktuelle Audio-Dateibindung und Endstille erneut. Diese Gates gelten auch bei `--force`.

**Ergebnis:**

```text
03-export/FERTIGES-REEL.mp4
03-export/UNIVERSELLE-CAPTION.txt
```

---

## Definition der Übergaben

Phase 1 ist nicht fertig, wenn Motion oder Wechsel-SFX nur „später geplant“ sind.

Phase 2 ist nicht fertig, wenn Audio/Bilder aus einem anderen Reel stammen oder Dateien fehlen.

Phase 3 ist nicht fertig, wenn:
- ein Bildmoment statisch bleibt
- ein visueller Wechsel stumm bleibt
- ein Soundtyp keine echte Library-Datei besitzt
- Voice-over mehrere Sekunden Endstille enthält
- Cue-Zeiten nicht am echten finalen Audio liegen
- visuelle QC nicht bestanden ist
- finale MP4/Caption nicht existieren

Nicht ausgeführte Tests oder QC-Stufen niemals als bestanden melden.
