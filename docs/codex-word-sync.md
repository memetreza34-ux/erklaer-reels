# Codex-Wort-Synchronisierung — LEGACY

> Bei Widersprüchen gilt `CURRENT_WORKFLOW.md`.

**Diese Datei beschreibt keinen aktiven Produktionsschritt mehr.** Der aktuelle Reel-Standard ist vollständig untertitelfrei und benötigt keinen Word-Sync.

## Aktueller Status

Für neue Reels gilt:

- keine Untertitel
- keine Wortmarkierung/Karaoke
- keine Subtitle-Cues
- keine Word-Timings als Render-Voraussetzung
- kein normaler `npm run sync:words`-Befehl im aktiven Workflow

Der frühere Befehl ist nur noch explizit als Legacy-Diagnose verfügbar:

```bash
npm run legacy:sync:words -- ...
```

Er darf bei einem normalen neuen Reel nicht autonom ausgeführt werden.

## Wann Legacy-Word-Sync überhaupt verwendet werden darf

Nur wenn ausdrücklich ein historisches Reel oder eine alte Timing-Datei untersucht werden soll.

Auch dann gilt:

- keine gleichmäßige, geschätzte oder erfundene Zeitverteilung
- echte Audiodaten verwenden
- Whisper/ASR-Werte nur als Kandidaten behandeln
- `reviewed: true` erst nach tatsächlicher akustischer Bestätigung
- Legacy-Ergebnisse dürfen keine aktuellen QC-Gates umgehen
- ein altes Subtitle-/Word-Sync-Artefakt darf neue Reels nicht wieder auf Untertitelbetrieb umstellen

## Aktiver Audio-Workflow stattdessen

```bash
npm run trim:pauses -- --dir "PFAD-ZUM-REEL" --speed 1.10
npm run build:timeline -- --dir "PFAD-ZUM-REEL"
npm run sync:audio -- --dir "PFAD-ZUM-REEL" --strict
```

Danach werden **nur narrative Szenenanker** über echte akustisch bestätigte `audioCue`-Zeitpunkte synchronisiert. Zusätzliche Bildphasen liegen über `startPercent` innerhalb der bestätigten Szene.

## Warum die Legacy-Datei erhalten bleibt

Sie dokumentiert historische Funktionen und verhindert, dass alte Helfer versehentlich wieder als aktueller Standard interpretiert werden.

Weitere Hinweise: `LEGACY_TOOLS.md`.
