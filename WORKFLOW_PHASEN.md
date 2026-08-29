# Die drei Produktionsphasen

**Verbindliche Rollenverteilung für jedes Reel.** Jede Phase hat genau einen
Verantwortlichen und ein klar definiertes Übergabeergebnis.

| Phase | Wer | Ergebnis |
|---|---|---|
| 1 | ChatGPT | Reel-Ordner mit Script, Bildprompts, Szenen- und Effektplan |
| 2 | Arman | Audio als MP3/M4A und alle Bilder als ZIP im Reel-Ordner |
| 3 | Antigravity | fertige MP4 im Upload-Bereich |

Niemand überspringt eine Phase und niemand übernimmt die Aufgabe einer anderen.
Insbesondere gilt weiterhin: **Antigravity erzeugt niemals selbst Bilder**
(`ANTIGRAVITY_IMAGE_POLICY.md`).

---

## Phase 1 — ChatGPT: Reel anlegen und vollständig ausschreiben

### Slot bestimmen

Die Reels liegen in Wochenordnern (`2026-KW35_24-08_bis_30-08`) und darin in
Wochentagsordnern. Den nächsten freien Tag ermittelt:

```bash
npm run next:slot
```

Der Befehl nennt Wochentag, Datum, Wochenordner und Zielpfad. Es wird immer der
chronologisch nächste freie Tag genommen, keine Lücke übersprungen.

### Thema wählen

Die Themenwelt ist offen — Psychologie, Länder, Technik, Alltag, Natur, Geschichte,
Wirtschaft und alles andere mit Erklärwert. Ausgeschlossen sind nur tägliche
Breaking-News, Parteienwerbung und reine Produktwerbung.

Entscheidend sind Hook, klarer Aha-Moment, Belegbarkeit, visuelle Klarheit und
Abwechslung zu den letzten Reels.

### Anlegen

```bash
npm run create:reel -- --title "Warum …?" --script-file input/script.txt --next-free
```

Das Gerüst entsteht mit 9 Szenen, der festen Bildwelt und je zwei Bildphasen
(Hook: eine).

### Ausschreiben

Vollständig zu füllen sind:

- `script/voice-script.txt` — 155–175 Wörter, ein deutscher Erzähler
- pro Szene `narration`, `imageText`, `visualIdea`, `continuityNotes`, `audioCue`
- pro Bildphase ein englischer Bildprompt in `image-prompt.txt` bzw. `image-prompt-02.txt`
- `effects/effects-plan.json` — Kamerabewegung und Soundeffekte je Szene
- `caption/caption.txt` — Text plus 3–6 Hashtags
- `sources/sources.md` — mindestens zwei unabhängige Quellen mit unterschiedlichen Domains

Die letzten zwei Szenen brauchen eine Prüffrage und einen Abschlusssatz mit
zwei unterschiedlichen Bildideen.

### Abschließen

```bash
npm run check:content -- --dir "<reel-ordner>" --strict
npm run export:prompts -- --dir "<reel-ordner>" --strict
```

**Übergabe an Phase 2:** `00-bildprompts/99-alle-bildprompts.txt` und
`01-voice-script/voice-script.txt` sind fertig.

---

## Phase 2 — Arman: Audio und Bilder erzeugen

### Voice-over

`01-voice-script/voice-script.txt` in die Sprachausgabe geben und die fertige Datei
als MP3 oder M4A ablegen unter:

```text
02-audio/AUDIO-HIER-EINFUEGEN/
```

Das Original bleibt unbearbeitet — Tempo, Lautheit und Pausen macht Phase 3.

### Bilder

`00-bildprompts/99-alle-bildprompts.txt` **einmal vollständig** an Google Flow
schicken. Flow arbeitet streng seriell und legt alle Bilder in den gemeinsamen
Ordner `00-FERTIGE-REEL-BILDER`.

Bei 9 Szenen sind das 17 Bilder: `Bild 01.png` bis `Bild 17.png`. Bild 01 ist die
erste Szene und zugleich das Titelbild.

Die fertigen Bilder als ZIP oder einzeln ablegen unter:

```text
00-bildprompts/00-ALLE-BILDER-HIER-REIN/
```

**Übergabe an Phase 3:** Audio und Bilder liegen im Reel-Ordner.

---

## Phase 3 — Antigravity: alles zu einem Reel machen

Antigravity erzeugt **keine** Inhalte, sondern führt zusammen und rendert.

```bash
npm run discover:assets -- --dir "<reel-ordner>"
npm run organize:assets -- --dir "<reel-ordner>"
npm run check:visuals  -- --dir "<reel-ordner>" --strict
npm run trim:pauses    -- --dir "<reel-ordner>"
npm run build:timeline -- --dir "<reel-ordner>"
npm run finalize:reel  -- --dir "<reel-ordner>" --strict
npm run render:reel    -- --dir "<reel-ordner>"
```

- `discover:assets` findet die ZIP und entpackt sie
- `organize:assets` ordnet die Bilder den Bildphasen zu — **niemals nach Dateinummer
  allein**, sondern über sichtbaren Inhalt, mit Konfidenz ab 0,90
- `check:visuals --strict` verlangt die eingetragene visuelle Freigabe je Bild
- `trim:pauses` strafft Pausen, setzt 1,10x und normalisiert auf −16 LUFS / −1,5 dBTP
- `build:timeline` synchronisiert Szenen an echten Audio-Cues und löst dabei die
  geplanten Sound-Typen gegen `assets/sfx/` auf
- `finalize:reel --strict` gibt frei; ohne `--strict` bleibt `Renderer-bereit: nein`
- `render:reel` erzeugt die MP4

**Ergebnis:** `03-export/FERTIGES-REEL.mp4` und `03-export/UNIVERSELLE-CAPTION.txt`.

---

## Was jede Phase blockiert

Die Gates lassen nichts durch, was unfertig ist:

- ohne zwei belegte Quellen auf verschiedenen Domains kein Render
- ohne gemessene Lautheit kein Render
- ohne visuelle Freigabe im strengen Modus kein Render
- Caption ohne 3–6 Hashtags blockiert
- Bildphasen unter 3 Sekunden blockieren
- eine Szene ohne Sound am Wechsel wird gemeldet

Diese Blockaden sind gewollt. Sie lassen sich auch mit `--force` nicht umgehen.
