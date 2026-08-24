# Legacy-Werkzeuge

`CURRENT_WORKFLOW.md` ist immer maßgeblich. Diese Datei dokumentiert historische Helfer, damit sie nicht versehentlich wieder Teil des aktiven Produktionsworkflows werden.

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

## Aus dem aktiven Root entfernt

Die folgenden historischen Einmal- oder Bypass-Helfer wurden aus dem aktiven Repository entfernt. Ihre frühere Implementierung bleibt über die Git-Historie nachvollziehbar, darf aber nicht wieder als normaler Produktionsweg eingeführt werden:

- `force-render-state.js` – erzeugte künstliche Timings, Subtitle-Cues und gefälschte QC-/Audio-Freigaben.
- `approve-visuals.js` – setzte visuelle Checks pauschal auf bestanden, ohne echte Bildprüfung.
- `confirm-assets.js` – setzte Asset-Matching, Konfidenz und Zweitprüfung pauschal auf bestätigt.
- `do-sync.js` – verteilte Szenen und Wörter rechnerisch über eine feste Dauer und bezeichnete das Ergebnis als audio-synchron.
- `auto-sync.js` – erzeugte synthetische Szenen- und Wortzeiten aus Textlängen statt aus dem echten Voice-over.
- `auto-cues.js` – erzeugte alte Subtitle-Cues und gehört nicht mehr zur untertitelfreien Pipeline.
- `fill-codex.js` – verteilte Wortzeiten künstlich und markierte sie anschließend als geprüft.
- `fix-content.js`, `fix-narration.js`, `fix-reel.js`, `fill-ki-app-scenes.js` – hart codierte Reparaturskripte für einzelne historische Reels, nicht allgemeine Produktionswerkzeuge.

## Unverhandelbare Sicherheitsregel

Legacy-Code darf niemals:

- echte QC-Gates umgehen
- Messwerte erfinden
- ungeprüfte Timings als verifiziert markieren
- `confidence: 1` oder `reviewed: true` ohne echte Prüfung setzen
- eine visuelle Prüfung simulieren
- Untertitel für neue Reels reaktivieren
- einen Render als bereit markieren, wenn die realen Voraussetzungen fehlen

Für neue Reels gelten die Kernmodule unter `src/`, die offiziellen CLI-Befehle in `package.json` und die aktuellen Regeln in `CURRENT_WORKFLOW.md`. Wenn ein historischer Helfer im Widerspruch dazu steht, wird er nicht verwendet.
