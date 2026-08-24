# Legacy-Werkzeuge

`CURRENT_WORKFLOW.md` ist immer maßgeblich. Diese Datei dokumentiert nur historische Helfer, damit sie nicht versehentlich wieder Teil des aktiven Produktionsworkflows werden.

## Word-Sync / Untertitel

Der aktuelle Reel-Standard ist vollständig untertitelfrei.

Darum gilt:

- kein `sync:words` im aktiven Workflow
- keine Subtitle-Cues
- keine Karaoke-/Word-Highlight-Timings
- keine Word-Timings als Voraussetzung für Finalizer oder Render

Historische Word-Sync-Helfer bleiben nur für alte Reels oder gezielte Diagnose verfügbar.

Der npm-Befehl wurde deshalb bewusst in einen eindeutigen Legacy-Namensraum verschoben:

```bash
npm run legacy:sync:words -- ...
```

Er darf bei einem normalen neuen Reel **nicht** autonom ausgeführt werden.

`scripts/sync-whisper.js` darf ebenfalls nur für historische Diagnose oder ausdrücklich angeforderte Audioanalyse verwendet werden. Seine Kandidaten ersetzen niemals akustisch bestätigte Szenenanker.

## Entfernt: `force-render-state.js`

Die frühere Root-Datei `force-render-state.js` wurde aus dem aktiven Repository entfernt.

Grund: Sie erzeugte künstlich verteilte Timings, Subtitle-Cues und gefälschte `passed: true`-/Audio-Messberichte. Das widerspricht den aktuellen QC-Regeln und hätte einen unberechtigten Ready-for-Render-Zustand erzeugen können.

Die historische Version bleibt über die Git-Historie nachvollziehbar, darf aber nicht wieder als Produktionswerkzeug eingeführt werden.

## Grundregel

Legacy-Code darf niemals:

- echte QC-Gates umgehen
- Messwerte erfinden
- ungeprüfte Timings als verifiziert markieren
- Untertitel für neue Reels reaktivieren
- einen Render als bereit markieren, wenn die realen Voraussetzungen fehlen

Wenn ein Legacy-Werkzeug im Widerspruch zu `CURRENT_WORKFLOW.md` steht, wird es nicht verwendet.
