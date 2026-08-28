# Audio-Pacing und Legacy-Untertitelhinweis

> Bei Widersprüchen gilt `CURRENT_WORKFLOW.md`.

Der Dateiname ist historisch. **Untertitel sind im aktuellen Reel-Workflow vollständig deaktiviert.** Diese Datei beschreibt deshalb nur das aktive Voice-over-Pacing und markiert frühere Word-Sync-Regeln ausdrücklich als Legacy.

## Untertitelstatus

Für neue Reels gilt:

- keine Untertitel
- keine Karaoke-/Wortmarkierung
- keine Subtitle-Cues
- kein aktiver `sync:words`-Schritt
- keine Untertitel-Safe-Zone im Bild
- Renderer und Finalizer dürfen keine Word-Timings verlangen

Historische Untertitel- und Wort-Synchronisierung ist nur für ausdrücklich angeforderte Diagnose alter Reels zulässig. Dafür existiert höchstens:

```bash
npm run legacy:sync:words -- ...
```

Siehe auch `LEGACY_TOOLS.md`.

## Voice-over optimieren

Zentrale Quelle: `src/shared/audio-pacing-style.js`.

```bash
npm run trim:pauses -- --dir "PFAD-ZUM-REEL" --speed 1.10
```

Verbindlich:

- Pausen ab ungefähr 0,24 Sekunden kürzen
- kurze natürliche Restpause behalten
- exakt 1,10x bei erhaltener Tonhöhe
- −16 LUFS integrierte Lautheit
- höchstens −1,5 dBTP True Peak
- Ziel-LRA 11
- immer von der ursprünglichen Audiodatei starten
- bereits optimiertes Audio nicht erneut beschleunigen
- Messwerte tatsächlich aus dem final verwendeten Audio ableiten

## Danach

```bash
npm run build:timeline -- --dir "PFAD-ZUM-REEL"
npm run sync:audio -- --dir "PFAD-ZUM-REEL" --strict
```

Narrative Szenen werden anschließend über echte akustisch bestätigte `audioCue`-Anker synchronisiert.

Whisper/ASR darf Zeitkandidaten liefern, aber:

- Kandidaten sind nicht automatisch verifiziert
- keine gleichmäßige oder erfundene Zeitverteilung
- `reviewed: true` nur nach echter akustischer Bestätigung
- unsichere Szene bleibt unbestätigt

## Bildkomposition

Da keine Untertitel gerendert werden:

- volle 9:16-Fläche natürlich nutzen
- keinen künstlichen horizontalen Freiraum für Untertitel lassen
- wichtige Motive dürfen die Bildmitte normal besetzen
- nur Plattform-UI und tatsächlich eingebrannten deutschen Bildtext berücksichtigen

## Qualitätsgrenze

Pacing darf niemals durch erfundene Messwerte oder künstliche Readiness-Reports als bestanden markiert werden. `finalize:reel --strict` und `validate:render` dürfen nur mit dem real gemessenen finalen Audio bestehen.
