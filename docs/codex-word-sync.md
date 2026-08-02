# Codex-Wort-Synchronisierung

Die warmgelbe Wortmarkierung wird ohne Gemini, ohne externen Transkriptionsanbieter und ohne zusätzlichen API-Schlüssel vorbereitet.

## Prinzip

Der Node-Befehl erstellt eine lokale Arbeitsdatei. Codex hört anschließend das Voice-over ab, trägt die echten Wortzeiten ein und lässt die Daten streng validieren.

```text
Voice-over im Reel-Ordner
        ↓
sync:words erstellt Arbeitsdatei und Codex-Auftrag
        ↓
Codex hört das Audio lokal ab
        ↓
Codex trägt absolute Start- und Endzeiten ein
        ↓
sync:words --apply --strict prüft und übernimmt die Daten
        ↓
Mittige Untertitelpalette wird angewendet
        ↓
Timeline und Render-Plan werden neu gebaut
```

## 1. Vorbereitung

```bash
npm run sync:words -- --dir "PFAD-ZUM-REEL"
```

Erzeugt oder aktualisiert:

```text
subtitles/codex-word-sync.json
production/codex-word-sync-task.md
review/word-sync-report.json
```

Die Arbeitsdatei enthält jedes Wort aus `script/voice-script.txt` sowie leere Felder für:

- `startSeconds`
- `endSeconds`
- `confidence`
- `reviewed`

## 2. Arbeit durch Codex

Codex muss das lokale Voice-over tatsächlich anhören und pro Wort absolute Zeiten eintragen.

Verbindlich:

- keine gleichmäßige Verteilung über die Satzdauer
- keine erfundenen Wortzeiten
- ungefähr 0,01–0,03 Sekunden Genauigkeit
- `reviewed: true` erst nach akustischer Kontrolle
- im strengen Lauf mindestens `confidence: 0.85`
- Wortlaut und Reihenfolge nicht verändern
- keine Audiodatei an einen externen Transkriptionsdienst senden

## 3. Anwenden und prüfen

```bash
npm run sync:words -- \
  --dir "PFAD-ZUM-REEL" \
  --apply \
  --strict
```

Der Befehl:

- validiert mindestens 98 % Zeitabdeckung
- prüft Reihenfolge und übermäßige Überschneidungen
- prüft die akustische Bestätigung jedes Wortes
- erzeugt kurze Untertitelblöcke mit normalerweise 3–6 Wörtern
- schreibt exakte `wordTimings`
- setzt die Untertitel standardmäßig auf 68 % der Bildhöhe
- erlaubt ausschließlich den sicheren Bereich 64–72 %
- setzt normalen Text auf weiches Weiß `#F5F7FA`
- setzt das aktuelle Wort auf Warmgelb `#FFD84D`
- setzt eine dunkle halbtransparente Hintergrundbox
- erstellt `review/codex-word-sync-report.json`
- aktualisiert `review/word-sync-report.json`
- baut Timeline und Render-Plan neu

## Feste Untertitelpalette

```json
{
  "position": "safe-middle",
  "verticalPositionPercent": 68,
  "safeVerticalRangePercent": { "min": 64, "max": 72 },
  "textColor": "#F5F7FA",
  "highlightColor": "#FFD84D",
  "backgroundColor": "rgba(0, 0, 0, 0.72)"
}
```

Ohne gültige Wortzeiten bleibt der gesamte Cue in weichem Weiß. Warmgelb wird nur bei einem akustisch bestätigten aktiven Wort angezeigt.

## Nur validieren

```bash
npm run sync:words -- \
  --dir "PFAD-ZUM-REEL" \
  --validate-only \
  --strict
```

Dabei werden keine Untertiteldateien überschrieben.

## Datenschutz

- kein Gemini-Aufruf
- kein API-Schlüssel
- kein automatischer Upload
- das Voice-over bleibt im lokalen Reel-Ordner

## Grenze

Der Node-Prozess selbst kann das Audio nicht verstehen. Die akustische Prüfung ist eine Aufgabe für Codex im Arbeitsablauf. Ohne vollständig ausgefüllte und bestätigte Wortzeiten blockiert die strenge Freigabe den Renderer.
