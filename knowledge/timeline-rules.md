# Master-Timeline und Audio-Synchronisierung

> Bei Widersprüchen gilt `CURRENT_WORKFLOW.md`.

## Ziel

Die Master-Timeline verbindet narrative Szenen, interne Bildphasen, Voice-over, harte Schnitte, dezente Bewegungen und Soundeffekte in einer zeitlich eindeutigen Struktur.

**Untertitel und Word-Sync sind kein Bestandteil der aktiven Timeline.**

## Ablauf nach dem Asset-Import

1. Audio und Bilder mit `organize:assets` übernehmen.
2. Das echte Voice-over zuerst auf exakt 1,10x und die verbindliche Lautheit optimieren.
3. Master-Timeline erstmals erzeugen:

```bash
npm run build:timeline -- --dir "PFAD-ZUM-REEL"
```

4. Das System sucht die finale Voice-over-Datei im Reel-Ordner.
5. Wenn `ffprobe` installiert ist, wird die echte Audiodauer automatisch gelesen.
6. Ohne `ffprobe` darf eine tatsächlich ermittelte Audiodauer ausdrücklich übergeben werden:

```bash
npm run sync:audio -- --dir "PFAD-ZUM-REEL" --audio-duration 57.0
```

7. Beim ersten Lauf entsteht `timeline/audio-sync.json`.
8. Für jede narrative Szene wird der echte Zeitpunkt ihres `audioCue` akustisch geprüft und als `cueTimeSeconds` bestätigt.
9. Danach wird `sync:audio --strict` erneut ausgeführt.
10. Zusätzliche `imagePhases` werden innerhalb der verifizierten narrativen Szene über `startPercent` als harte Bildwechsel verteilt.

## Audio-Sync-Datei

Beispiel:

```json
{
  "audioDurationSeconds": 57.0,
  "timingStatus": "verified",
  "cueTimings": [
    {
      "sceneId": "scene-03",
      "audioCue": "Beim Warten",
      "cueTimeSeconds": 8.4,
      "leadInSeconds": 0.2,
      "confidence": 0.98,
      "reviewed": true
    }
  ]
}
```

Ein maschinell gefundener Whisper-/ASR-Wert darf nur als Kandidat gespeichert werden. Er wird nicht automatisch zu `cueTimeSeconds` und nicht automatisch `reviewed: true`.

## Narrative Szenen und Visual Shots

Die narrativen Szenengrenzen kommen aus dem finalen Voice-over.

Eine Szene kann mehrere visuelle Phasen besitzen. Beispiel:

```text
Szene 5: 12,0–16,4 s
Phase 1 startPercent 0.00 → 12,0 s
Phase 2 startPercent 0.55 → ca. 14,4 s
```

Der interne Bildwechsel verändert nicht die narrative Szenengrenze und braucht keinen neuen Sprecher-Cue.

## Erzeugte Dateien

- `timeline/audio-sync.json` – echte bzw. noch offene Audio-Cue-Zeitpunkte
- `timeline/timeline-plan.json` – zentrale Master-Timeline
- `render/render-plan.json` – renderer-neutrale Ausgabe mit Szenen und Visual Shots
- Review-/Readiness-Berichte – nur auf Basis tatsächlich bestandener Prüfungen

## Timing-Status

- `estimated`: nur geplante Szenendauern bekannt
- `audio-duration-synced`: echte Audiodauer bekannt, aber noch nicht alle Audio-Cues bestätigt
- `audio-synced`: Audiodauer und alle erforderlichen narrativen Szenen-Cues verifiziert

Kein Status darf durch gleichmäßiges Verteilen oder Schätzen künstlich auf `audio-synced` gesetzt werden.

## Qualitätsregeln

- Hook startet bei Sekunde 0.
- Szenen dürfen keine unbeabsichtigten Lücken oder Überlappungen erzeugen.
- Die letzte sichtbare Bildphase hält nach dem letzten gesprochenen Wort 0,7 Sekunden.
- Jeder Soundeffekt muss innerhalb seines vorgesehenen Zeitbereichs liegen.
- zusätzliche Bildphasen müssen streng innerhalb ihrer narrativen Szene liegen
- Bildwechsel sind harte Schnitte
- ein strenger Lauf darf erst bestehen, wenn reales Audio, verifizierte Szenenanker und alle benötigten Bilder vorhanden sind
- `render-plan.json` ist nur `ready-for-renderer`, wenn die realen QC-Gates bestanden sind
- Untertitelspur bleibt leer

## Wichtige Grenze

Die Audiodauer kann lokal automatisch über `ffprobe` gelesen werden. Das Erkennen gesprochener Phrasen kann durch ASR unterstützt werden, ersetzt aber nicht die erforderliche Verifikation. Das Repository rät keine unsicheren Cue-Zeiten und erzeugt keine synthetischen Timings.
