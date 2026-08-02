# Erklär-Reels

KI-gestützte Produktionspipeline für visuelle Erklär-Reels zu Politik, Gesellschaft, Geschichte, Psychologie, Körper und Biologie.

Aus einem Thema oder deutschen Rohscript entsteht ein vollständiges Reel mit:

- geprüftem Voice-over-Script
- 8–12 Bildmomenten
- englischen Bildprompts
- gestrafftem und leicht beschleunigtem Voice-over
- leicht unterhalb der Bildmitte positionierten Untertiteln
- weichem weißem Normaltext und warmgelber Synchronmarkierung
- direkten harten Schnitten ohne Fades oder Schwarzbilder
- dezenten Zooms, Schwenks und Soundeffekten
- Master-Timeline und Audio-Synchronisierung
- technischer und visueller Qualitätsprüfung
- fertiger MP4-Datei über Remotion

Der Nutzer erzeugt Voice-over und Bilder extern. Codex übernimmt Planung, Zuordnung, Audio-Pacing, lokale Audio-Prüfung, Wortzeiten, Qualitätskontrolle und Rendering.

## Voraussetzungen

- Node.js 20 oder neuer
- `npm install`
- FFmpeg und optional `ffprobe`
- aktuelle Remotion-Lizenzbedingungen vor geschäftlicher Nutzung prüfen

Für den Wort-Sync wird kein Gemini-Key und kein anderer Transkriptions-Key benötigt.

## Wichtigste Produktionsregeln

- Hook-Bild ab Sekunde 0
- 35–44 Sekunden: normalerweise 8–10 Bildmomente
- 45–55 Sekunden: normalerweise 10–12 Bildmomente
- sichtbare Veränderung ungefähr alle 3,5–5 Sekunden
- Voice-over vor der Timeline mit `trim:pauses` straffen
- Voice-over standardmäßig mit `1.05x` leicht beschleunigen, Tonhöhe erhalten
- Untertitel standardmäßig bei 68 % der Bildhöhe
- sichere Untertitelzone 64–72 %
- normaler Text in weichem Weiß `#F5F7FA`
- aktuell gesprochenes Wort in Warmgelb `#FFD84D`
- dunkle halbtransparente Hintergrundbox mit ungefähr 72 % Deckkraft
- 3–6 Wörter, höchstens zwei Zeilen
- warmgelbe Markierung nur anhand akustisch bestätigter Wortzeiten
- Zoom normalerweise 2–6 %, maximal 8 %
- Schwenk maximal 4 %
- Hook ohne Übergang
- danach ausschließlich direkte harte Schnitte mit Dauer 0
- keine Crossfades, Schwarzblenden, Slides oder schwarzen Zwischenframes
- Hintergrundmusik standardmäßig ausgeschaltet
- Ausgabeformat 1080 × 1920 bei 30 FPS

Die Untertitel stehen bewusst nicht exakt bei 50 %. Dort liegen bei Erklärbildern häufig Gesichter, Figuren und zentrale Motive. 68 % wirkt mittig, bleibt aber meist unterhalb des Hauptmotivs.

## Autonomes neues Reel

Wenn Codex im Repository arbeitet und der Nutzer sagt:

> Mach ein neues Reel.

wählt Codex automatisch den nächsten freien Wochentag, erstellt das vollständige interne Produktionspaket und hält erst an, wenn externe Bilder oder das Voice-over fehlen.

```bash
npm run next:slot -- --json
```

## Vollständiger Ablauf

```text
Thema oder Rohscript
        ↓
Script, Szenen, Bildprompts, Untertitel und Effekte planen
        ↓
Inhalt streng prüfen
        ↓
Voice-over und Bilder extern erzeugen
        ↓
Dateien unsortiert in die Inbox legen
        ↓
Assets inhaltsbasiert zuordnen
        ↓
Pausen kürzen und Voice-over leicht beschleunigen
        ↓
Timeline und Audio-Cues synchronisieren
        ↓
Codex hört das optimierte Voice-over ab und trägt Wortzeiten ein
        ↓
Untertitelposition und Farbpalette prüfen
        ↓
Bilder technisch und visuell prüfen
        ↓
Reel vollständig freigeben
        ↓
Remotion rendert die MP4 mit direkten Schnitten
```

## 1. Neues Reel anlegen

```bash
npm run create:reel -- \
  --title "Was bedeutet links und rechts?" \
  --script-file input/script.txt \
  --next-free \
  --scenes 10
```

Danach bearbeitet Codex `production/agent-task.md` vollständig und führt aus:

```bash
npm run validate:reel -- --dir "PFAD-ZUM-REEL"
npm run check:content -- --dir "PFAD-ZUM-REEL" --strict
```

## 2. Externe Dateien ablegen

```text
reel-ordner/
└── inbox/
    ├── images/
    │   ├── beliebiges-bild.png
    │   ├── download-final.jpg
    │   └── cover-version3.webp
    └── audio/
        └── voice-final.mp3
```

Dateinamen und Reihenfolge sind egal.

## 3. Assets erkennen und übernehmen

```bash
npm run organize:assets -- --dir "PFAD-ZUM-REEL"
npm run organize:assets -- --dir "PFAD-ZUM-REEL" --apply
```

Codex betrachtet jedes Bild und ordnet es anhand von Sprechertext, Bildtext, Motiv, Metapher und Komposition zu. Unter 0,75 Konfidenz wird nicht geraten.

## 4. Voice-over-Pacing optimieren

Dieser Schritt ist vor der finalen Timeline verpflichtend:

```bash
npm run trim:pauses -- --dir "PFAD-ZUM-REEL"
```

Standard:

```text
lange Pause:       ab ungefähr 0,24 Sekunden
Restpause-Filter:  0,05 Sekunden
Sprechtempo:       1.05x
Tonhöhe:           bleibt erhalten
```

Erzeugt:

```text
audio/voiceover-tight.m4a
review/audio-pacing-report.json
```

Details: `docs/pacing-hard-cuts.md`.

## 5. Timeline und Audio synchronisieren

```bash
npm run build:timeline -- --dir "PFAD-ZUM-REEL"
```

Ohne `ffprobe`:

```bash
npm run sync:audio -- \
  --dir "PFAD-ZUM-REEL" \
  --audio-duration 48.7
```

Danach die echten Szenen-Cues eintragen und prüfen:

```bash
npm run sync:audio -- --dir "PFAD-ZUM-REEL" --strict
```

## 6. Wortzeiten durch Codex synchronisieren

Vorbereitung:

```bash
npm run sync:words -- --dir "PFAD-ZUM-REEL"
```

Dadurch entstehen:

```text
subtitles/codex-word-sync.json
production/codex-word-sync-task.md
review/word-sync-report.json
```

Codex hört anschließend das optimierte lokale Voice-over ab und trägt pro Wort Startzeit, Endzeit, Konfidenz und akustische Bestätigung ein.

Danach:

```bash
npm run sync:words -- \
  --dir "PFAD-ZUM-REEL" \
  --apply \
  --strict
```

Der strenge Lauf verlangt mindestens 98 % Zeitabdeckung und blockiert unbestätigte oder unsichere Wortzeiten. Er erzeugt gleichzeitig die mittige Untertitelposition und die feste Farbpalette.

Details: `docs/codex-word-sync.md`.

## 7. Bilder prüfen

```bash
npm run check:visuals -- --dir "PFAD-ZUM-REEL"
npm run check:visuals -- --dir "PFAD-ZUM-REEL" --strict
```

Geprüft werden unter anderem:

- 9:16 und ausreichende Auflösung
- Textlesbarkeit und Textfehler
- sichere Position von Hauptmotiven
- Untertitelzone 64–72 % verdeckt keine wichtigen Inhalte
- weiches Weiß und Warmgelb bleiben klar unterscheidbar
- Untertitel- und Plattform-UI-Kollisionen
- Zoom- und Schwenksicherheit
- Stilkonsistenz

## 8. Zentrale Abschlussprüfung

```bash
npm run finalize:reel -- --dir "PFAD-ZUM-REEL" --strict
```

Die Freigabe wird unter anderem blockiert, wenn:

- das Audio-Pacing nicht abgeschlossen wurde
- die Timeline nicht exakt synchronisiert ist
- die Codex-Wortzeiten fehlen
- Untertitelposition oder Farbpalette falsch sind
- die visuelle Prüfung fehlt

## 9. Renderer prüfen

```bash
npm run validate:render -- --dir "PFAD-ZUM-REEL"
```

Die Prüfung akzeptiert nur:

- `none` für die Hook
- `cut` mit Dauer 0 für alle weiteren Szenen
- optimiertes Voice-over im leicht beschleunigten Zielbereich
- lückenlose Frames
- gültige Untertitel- und Wortzeiten
- Untertitelhöhe 64–72 %, Standard 68 %
- Normaltext `#F5F7FA`
- Synchronfarbe `#FFD84D`

## 10. Fertige MP4 erzeugen

```bash
npm run render:reel -- --dir "PFAD-ZUM-REEL"
```

Standardausgabe:

```text
PFAD-ZUM-REEL/output/REEL-ID.mp4
```

Der Remotion-Renderer zeigt beim Szenenwechsel sofort das neue Bild. Es gibt keine Fade-Animation, kein Schwarzbild und keine künstliche Übergangsverzögerung. Die Untertitel stehen leicht unterhalb der Bildmitte auf einer dunklen Box; das aktuelle Wort leuchtet warmgelb.

## Befehle

```bash
npm run next:slot
npm run create:reel
npm run prepare:reel
npm run validate:reel
npm run check:content
npm run organize:assets
npm run trim:pauses
npm run build:timeline
npm run sync:audio
npm run sync:words
npm run check:visuals
npm run finalize:reel
npm run validate:render
npm run render:reel
npm run studio
npm run status:reel
npm test
```

## Wichtige Dateien

- `AGENTS.md` – verbindliche Regeln für Codex
- `CODEX_TASK.md` – vollständiger Produktionsablauf
- `docs/autonomous-reel.md` – autonomer Reel-Start
- `docs/pacing-hard-cuts.md` – Audio-Pacing und direkte Schnitte
- `docs/codex-word-sync.md` – lokaler Codex-Wort-Sync
- `docs/remotion-renderer.md` – Renderer-Dokumentation
- `knowledge/subtitle-pacing-rules.md` – Position, Farben und Synchronmarkierung
- `src/shared/subtitle-style.js` – zentraler Untertitelstil
- `src/core/audio-tightener.js` – Pausenkürzung und leichte Tempoerhöhung
- `src/core/render-validator.js` – Renderer-Vorprüfung
- `src/renderer/ReelComposition.jsx` – MP4-Komposition mit direkten Schnitten

## Noch nicht enthalten

- automatische Bild- oder Voice-over-Erzeugung
- automatische Social-Media-Veröffentlichung

Der Node-Prozess selbst versteht das Audio nicht. Codex übernimmt die akustische Kontrolle im Arbeitsablauf. Ohne bestätigte Wortzeiten wird der finale Render im strengen Modus blockiert.
