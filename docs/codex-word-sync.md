# Codex-Wort-Synchronisierung

`sync:words` ist ein optionales Werkzeug für Formate mit einer aktiven Wort-für-Wort-Markierung.

Der aktuelle Standardstil dieses Repositories verwendet:

- weiße Untertitel ohne gelbe Wortmarkierung
- keine Karaoke-Animation
- keine schwarze Hintergrundbox
- Position unten bei 76 %

Deshalb ist ein aufwendiger Einzelwort-Sync für normale neue Reels **nicht erforderlich**. Cue-Zeiten und Szenen-Audio-Synchronisierung reichen aus.

## Standardworkflow ohne Wort-Highlight

```bash
npm run trim:pauses -- --dir "PFAD-ZUM-REEL"
npm run build:timeline -- --dir "PFAD-ZUM-REEL"
npm run sync:audio -- --dir "PFAD-ZUM-REEL" --strict
```

Der Render-Plan muss pro Cue enthalten:

```json
{
  "position": "lower",
  "verticalPositionPercent": 76,
  "textColor": "#F5F7FA",
  "highlightCurrentWord": false,
  "highlightColor": "#F5F7FA",
  "backgroundColor": "transparent"
}
```

## Optionaler Legacy-Workflow

Nur wenn später bewusst ein anderer Untertitelstil mit Wort-Highlight entwickelt wird:

```bash
npm run sync:words -- --dir "PFAD-ZUM-REEL"
```

Codex hört dann das lokale Voice-over ab und trägt echte Wortzeiten ein. Anschließend:

```bash
npm run sync:words -- \
  --dir "PFAD-ZUM-REEL" \
  --apply \
  --strict
```

Regeln für diesen optionalen Modus:

- keine gleichmäßige oder erfundene Zeitverteilung
- echte akustische Kontrolle
- kein externer Audio-Upload
- im strengen Lauf mindestens 0,85 Konfidenz
- Wortlaut und Reihenfolge unverändert

## Datenschutz

- kein Gemini-Aufruf
- kein externer Transkriptionsdienst
- kein zusätzlicher API-Schlüssel
- Voice-over bleibt lokal

## Grenze

Der aktuelle Standard-Renderer erwartet `highlightCurrentWord: false`. Ein aktivierter Wort-Highlight-Modus benötigt eine separate bewusste Design- und Validatoränderung.
