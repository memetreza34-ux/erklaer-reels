# Master-Timeline und Audio-Synchronisierung

## Ziel

Die Master-Timeline verbindet Szenen, Voice-over, Untertitel, Bildwechsel, Zooms, Übergänge und Soundeffekte in einer einzigen zeitlich eindeutigen Struktur.

## Ablauf nach dem Asset-Import

1. Audio und Bilder mit `organize:assets` übernehmen.
2. Master-Timeline erstmals erzeugen:

```bash
npm run build:timeline -- --dir "PFAD-ZUM-REEL"
```

3. Das System sucht die Voice-over-Datei im Reel-Ordner.
4. Wenn `ffprobe` installiert ist, wird die echte Audiodauer automatisch gelesen.
5. Ohne `ffprobe` kann die Dauer ausdrücklich übergeben werden:

```bash
npm run sync:audio -- --dir "PFAD-ZUM-REEL" --audio-duration 48.7
```

6. Beim ersten Lauf entsteht `timeline/audio-sync.json`.
7. Codex hört das Voice-over ab und trägt für jede Szene den echten Zeitpunkt von `audioCue` als `cueTimeSeconds` ein.
8. Danach wird `sync:audio` erneut ausgeführt.

## Audio-Sync-Datei

```json
{
  "audioDurationSeconds": 48.7,
  "timingStatus": "verified",
  "cueTimings": [
    {
      "sceneId": "scene-03",
      "audioCue": "Beim Warten",
      "cueTimeSeconds": 8.4,
      "leadInSeconds": 0.2,
      "confidence": 0.98
    }
  ]
}
```

Das Szenenbild beginnt in diesem Beispiel bei 8,2 Sekunden. Die Hook beginnt unabhängig davon immer bei Sekunde 0.

## Erzeugte Dateien

- `timeline/audio-sync.json` – echte Audio-Cue-Zeitpunkte
- `timeline/timeline-plan.json` – zentrale Master-Timeline
- `render/render-plan.json` – renderer-neutrale Ausgabe mit Sekunden und Frames
- `review/final-video-report.json` – Vorabprüfung für Schnitt und Rendering

## Timing-Status

- `estimated`: nur geplante Szenendauern bekannt
- `audio-duration-synced`: echte Audiodauer bekannt, aber noch nicht alle Audio-Cues exakt markiert
- `audio-synced`: Audiodauer und alle Szenen-Cues sind verifiziert

## Qualitätsregeln

- Hook startet bei Sekunde 0.
- Szenen dürfen keine unbeabsichtigten Lücken oder Überlappungen erzeugen.
- Die letzte Szene endet mit der Voice-over-Dauer.
- Untertitel dürfen sich nicht überlappen.
- Jeder Soundeffekt muss innerhalb seiner Szene liegen.
- Ein strenger Lauf darf erst bestehen, wenn Audio und alle Szenenbilder vorhanden sind.
- `render-plan.json` ist nur `ready-for-renderer`, wenn Voice-over und alle Szenenbilder bereit sind.

## Wichtige Grenze

Die Audiodauer kann lokal automatisch über `ffprobe` gelesen werden. Das genaue Erkennen gesprochener Phrasen benötigt weiterhin eine geprüfte Transkription, einen Forced-Alignment-Anbieter oder eine visuelle beziehungsweise akustische Prüfung durch Codex. Das Repository stellt dafür die stabile Schnittstelle `timeline/audio-sync.json` bereit und rät keine unsicheren Cue-Zeiten.
