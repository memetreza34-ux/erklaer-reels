# Roadmap

> Bei Widersprüchen gilt `CURRENT_WORKFLOW.md`.

## Aktueller Stand: Produktionsbaseline

Die Produktionspipeline besitzt offene Themenwahl, individuelle Bilddichte und harte QC-Gates. Die frühere feste Bildwelt wurde am 2026-08-26 bewusst zurückgesetzt und ist derzeit **unassigned**.

### Produktionskern

- [x] Repository und stabile Reel-Ordnerstruktur
- [x] Wochen- und Tages-Slots automatisch bestimmen
- [x] 55–60 Sekunden Voice-over, Ziel ungefähr 58 Sekunden
- [x] 155–175 deutsche Wörter
- [x] 12–14 **narrative Szenen**, Standard 13
- [x] individuelle Bildanzahl über 1–3 `imagePhases` pro Szene
- [x] offenes Themenuniversum ohne feste Pillar-Quote
- [x] frühere feste Countryball-/Kugel-Bildwelt aus dem aktiven Workflow entfernt
- [x] neue Workspaces starten mit `visualStyleId: null`
- [x] Prompt-Exporter injiziert keine alte Bildwelt oder Golden Reference mehr
- [x] kompletter serieller Google-Flow-Gesamtprompt unter `00-bildprompts/99-alle-bildprompts.txt`
- [x] Workflow-Metadaten aus generierten Bildern ausgeschlossen
- [x] Quellen-QC für neue Reels auf Schema 3 erweitert

### Audio und Timeline

- [x] Voice-over-Pacing mit FFmpeg
- [x] exakt 1,10x mit erhaltener Tonhöhe
- [x] Lautheitsnormalisierung auf −16 LUFS und höchstens −1,5 dBTP
- [x] echte narrative Audio-Cues statt erfundener Zeitverteilung
- [x] interne Bildphasen/Visual-Shots über `startPercent`
- [x] 0,7 Sekunden ruhiger Schlussbild-Nachlauf
- [x] Untertitel global deaktiviert
- [x] Word-Sync aus dem aktiven Produktionsworkflow entfernt
- [x] historische Word-Sync-Helfer klar als Legacy markiert

### Bilder und Qualitätskontrolle

- [x] sichere Bildzuordnung anhand des sichtbaren Inhalts
- [x] zweite Prüfung gegen vorherige/nächste Bildphase
- [x] Mindestkonfidenz 0,90
- [x] unsichere Bilder bleiben unzugeordnet
- [x] technische Bildprüfung auf Format, Auflösung und Seitenverhältnis
- [x] alte Countryball-/Geometrie-/Golden-Reference-QC entfernt
- [x] visuelle QC prüft aktuell den konkreten Szeneninhalt und Bildprompt statt eine feste Bildwelt
- [x] sichtbare Text-Whitelist pro Bild
- [x] keine künstliche Untertitelzone
- [x] Render-Freigabe nur nach real bestandenen Qualitäts-Gates
- [x] unsicheren `force-render-state.js`-Helper entfernt

### Renderer

- [x] Remotion-Renderer
- [x] 1080 × 1920 bei 30 FPS
- [x] direkte harte Schnitte
- [x] mehrere Visual-Shots innerhalb einer narrativen Szene
- [x] dezente Zoom-/Pan-Bewegungen
- [x] Voice-over und optionale Soundeffekte
- [x] keine Subtitle-/Word-Highlight-Layer
- [x] fertige MP4 nur nach erfolgreicher Renderer-Validierung

### CI / Reproduzierbarkeit

- [x] echte `package-lock.json` vorhanden
- [x] GitHub Actions verwendet `npm ci`
- [x] npm-Cache in GitHub Actions aktiviert
- [x] Testausgabe wird als Artifact vorbereitet

Bekannte Infrastrukturgrenze: GitHub Actions hatte zuletzt einzelne Läufe mit leerer Step-Liste bzw. nicht abrufbaren Logs. Ein Testlauf gilt nur dann als bestanden, wenn die Schritte tatsächlich ausgeführt wurden und der Run erfolgreich abgeschlossen ist.

## Nächste sinnvolle Verbesserungen

- [ ] neue Bildwelt erst nach ausdrücklicher Nutzerentscheidung definieren und anschließend als eigenes klar versioniertes System einbauen
- [ ] E2E-Test: neuer Workspace bleibt ohne alte Bildwelt und Prompt-Exporter injiziert keine historischen Stilregeln
- [ ] automatischer Topic-Score für Hook, Aha-Moment, Faktenbasis, visuelle Klarheit, Abwechslung und Teilbarkeit
- [ ] feinere Quellenklassifizierung für medizinische/wissenschaftliche/aktuelle Themen
- [ ] robuste lokale/CI Smoke-Tests für kompletten neuen Reel-Workspace
- [ ] optionaler austauschbarer Voice-/TTS-Provider
- [ ] optionaler Bildgenerierungs-Provider, **ohne** die Nutzerregel zu umgehen, dass Repo-Agenten aktuell keine Reel-Bilder selbst erzeugen
- [ ] Social-Media-Veröffentlichung
- [ ] Analytics und Feedback aus veröffentlichten Reels

**Nicht geplant:** Batch-/Parallelgenerierung in Google Flow. Die aktuelle Nutzerregel verlangt streng serielle Bildgenerierung.

Globale Produktionsregeln werden nur nach ausdrücklicher Nutzerentscheidung geändert. Normale neue Reels verwenden die Baseline aus `CURRENT_WORKFLOW.md` und `PRODUCTION_STATUS.md`.
