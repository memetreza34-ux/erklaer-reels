# Reel-Fortschritt

> Bei Widersprüchen gilt `CURRENT_WORKFLOW.md`.

Der Produktionsstand eines einzelnen Reel-Ordners kann jederzeit berechnet werden:

```bash
npm run status:reel -- \
  --dir "reels/.../reel-01_titel"
```

Maschinenlesbare Ausgabe:

```bash
npm run status:reel -- \
  --dir "reels/.../reel-01_titel" \
  --json
```

## Produktionsbereiche

Der Status trennt insbesondere:

- **Vorproduktion:** Script, offene Themenentscheidung, narrative Szenen, individuelle Bildphasen, konkrete Bildprompts, Flow-Gesamtprompt, Caption, Quellen und Inhaltsprüfung. Eine feste Bildwelt gehört aktuell ausdrücklich nicht zur Vorproduktion.
- **Externe Assets:** alle tatsächlich geplanten Bildphasen, Voice-over und sichere Zuordnung.
- **Postproduktion:** reales Audio-Pacing, verifizierte narrative Audio-Cues, visuelle Zwei-Pass-QC, Timeline, Finalizer, Render-Validierung und echte MP4.

Die genaue Prozentgewichtung wird vom aktuellen Status-Code bestimmt. Dokumentation darf keine feste Prozentzahl als Wahrheit annehmen, wenn der Code sie ändert.

## Wichtige Regeln

- 13 narrative Szenen bedeuten nicht automatisch 13 Bilder.
- Die Asset-Vollständigkeit richtet sich nach `plannedImageCount` und allen `imagePhases`.
- Neue Workspaces starten aktuell mit `visualStyleId: null`; alte Bildwelten werden nicht automatisch übernommen.
- Quellen-Schema 3 gilt für neu erstellte Reels; bestehende Schema-2-Reels bleiben kompatibel.
- Untertitel und Word-Sync sind kein aktiver Produktionsfortschritt.
- Ein vorhandener Dateiname ist keine bestandene visuelle QC.
- Nicht ausgeführte Prüfungen zählen nicht als bestanden.
- Ein Readiness-Status darf nicht künstlich erzwungen werden.

Die Ausgabe nennt den nächsten sinnvollen Schritt, zum Beispiel:

- Produktionsauftrag fertigstellen
- Quellen-/Inhaltsprüfung bestehen
- externes Voice-over oder Bilder erzeugen
- unsortierte Assets visuell zuordnen
- Audio-Cues verifizieren
- visuelle QC abschließen
- Finalizer/Render-Validierung ausführen
