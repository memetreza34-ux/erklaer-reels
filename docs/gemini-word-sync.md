# Automatische Wort-Synchronisierung mit Gemini

Der Befehl `sync:words` transkribiert das fertige Voice-over mit der Gemini Interactions API und fordert Zeitstempel auf Wortebene an. Daraus entstehen neue Untertitel-Cues mit exakten `wordTimings` für die gelbe Wortmarkierung.

## Einrichtung

1. `.env.example` nach `.env` kopieren.
2. Den Schlüssel nur lokal eintragen:

```env
GEMINI_API_KEY=dein_schluessel
GEMINI_TRANSCRIBE_MODEL=gemini-3.6-flash
```

`.env` wird von Git ignoriert und darf niemals committed werden.

## Voraussetzung

Vor der Wortsynchronisierung müssen vorhanden sein:

- fertiges Voice-over im Reel-Ordner
- `timeline/timeline-plan.json`
- verifizierte Szenengrenzen aus `sync:audio`

## Ausführen

```bash
npm run sync:words -- \
  --dir "PFAD-ZUM-REEL" \
  --strict
```

Optional:

```bash
npm run sync:words -- \
  --dir "PFAD-ZUM-REEL" \
  --model "gemini-3.6-flash" \
  --language "de-DE" \
  --strict
```

Dry-Run ohne Dateiänderungen:

```bash
npm run sync:words -- --dir "PFAD-ZUM-REEL" --dry-run
```

Test mit vorhandener JSON-Transkription ohne API-Aufruf:

```bash
npm run sync:words -- \
  --dir "PFAD-ZUM-REEL" \
  --transcript-json "transcript.json"
```

## Automatischer Ablauf

1. Voice-over finden.
2. Audiodatei an Gemini senden.
3. Deutsche Transkription mit Wort-Start- und Endzeiten anfordern.
4. Wörter anhand der Master-Timeline den Szenen zuordnen.
5. In kurze Blöcke mit normalerweise 3–6 Wörtern teilen.
6. `subtitles/subtitle-plan.json` mit echten Wortzeiten ersetzen.
7. Timeline und Render-Plan neu erzeugen.
8. Prüfbericht schreiben.

## Erzeugte Dateien

```text
review/
├── gemini-transcript.json
├── word-sync-report.json
└── subtitle-plan-before-word-sync.json
```

`subtitle-plan-before-word-sync.json` wird nur beim ersten Lauf als Sicherung erzeugt.

## Qualitätsregeln

- mindestens 98 % der erkannten Wörter müssen einer Szene zugeordnet werden
- jede Szene muss gesprochene Wörter enthalten
- die Wortliste muss vollständig zum sichtbaren Untertiteltext passen
- Wortzeiten müssen chronologisch sein
- gelbe Markierung wird nur mit gültigen Wortzeiten freigegeben
- Untertitel bleiben bei 79,5 % der Bildhöhe in der sicheren Zone

## Danach

```bash
npm run finalize:reel -- --dir "PFAD-ZUM-REEL" --strict
npm run validate:render -- --dir "PFAD-ZUM-REEL"
npm run render:reel -- --dir "PFAD-ZUM-REEL"
```

## Datenschutz und Grenzen

- Die Audiodatei wird zur Transkription an die Gemini API gesendet.
- Die Anfrage setzt `store: false`.
- Die Wortzeiten stammen aus automatischer Spracherkennung und sollten beim ersten echten Reel visuell und akustisch kontrolliert werden.
- Nach Änderungen am Audio oder nach `trim:pauses` muss `sync:words` erneut ausgeführt werden.
