# Roadmap

## Aktueller Stand: Produktionsbaseline

Die kreative Testphase ist abgeschlossen. Neue Reels werden als normale Produktion behandelt; es werden keine zusätzlichen Test-Reels benötigt, um den bestehenden Standard zu verändern oder zu bestätigen.

### Produktionskern

- [x] Repository und stabile Reel-Ordnerstruktur
- [x] Wochen- und Tages-Slots automatisch bestimmen
- [x] stabile Szenen-IDs und Asset-Manifest
- [x] 55–60 Sekunden Voice-over, Ziel ungefähr 58 Sekunden
- [x] 155–175 deutsche Wörter
- [x] 12–14 Szenen, Standard 13
- [x] Script-, Szenen-, Cover-, Caption- und Quellenpaket
- [x] englische Bildprompts mit optionalem kurzem deutschen Bildtext
- [x] konsistente Bildwelt pro Reel
- [x] Prompt-Sammeldatei mit Cover und Szenen

### Audio, Untertitel und Timeline

- [x] Voice-over-Pacing mit FFmpeg
- [x] exakt 1,10x mit erhaltener Tonhöhe
- [x] Lautheitsnormalisierung auf −16 LUFS und höchstens −1,5 dBTP
- [x] Timeline mit echten Audio-Cues
- [x] Untertitel in weichem Weiß `#F5F7FA`
- [x] Untertitel exakt bei 58 % Bildhöhe
- [x] keine Wortmarkierung und keine schwarze Box
- [x] lokale akustische Wort-Synchronisierung vor dem finalen Render
- [x] automatische Invalidierung alter Wortzeiten nach Audioänderungen
- [x] 0,7 Sekunden ruhiger Schlussbild-Nachlauf

### Bilder und Qualitätskontrolle

- [x] sichere Bildzuordnung anhand des sichtbaren Inhalts
- [x] zweite Prüfung gegen Nachbarszenen
- [x] Mindestkonfidenz 0,90
- [x] unsichere Bilder bleiben unzugeordnet
- [x] technische Bildprüfung auf Format, Auflösung und Seitenverhältnis
- [x] manuelle/agentische semantische Bildprüfung
- [x] Visual-QC gegen den zentralen Untertitelstandard
- [x] Render-Freigabe nur nach bestandenen Qualitäts-Gates

### Renderer

- [x] Remotion-Renderer
- [x] 1080 × 1920 bei 30 FPS
- [x] direkte harte Schnitte
- [x] dezente Zoom-/Pan-Bewegungen
- [x] Voice-over und optionale Soundeffekte
- [x] fertiges MP4 nach erfolgreicher Renderer-Validierung

## Wartung

- [ ] Issue #19: echte `package-lock.json` mit dem npm-Client erzeugen
- [ ] CI anschließend von `npm install` auf reproduzierbares `npm ci` umstellen
- [ ] npm-Cache in GitHub Actions aktivieren

Die Lockdatei darf nicht manuell konstruiert oder aus einer fremden Umgebung übernommen werden.

## Spätere Automatisierung

Diese Punkte sind Erweiterungen und keine Voraussetzung für die aktuelle Reel-Produktion:

- [ ] austauschbarer Voice-/TTS-Provider
- [ ] austauschbarer Bildgenerierungs-Provider
- [ ] optionales automatisches Forced Alignment statt lokaler Wortprüfung
- [ ] optionales Vision-Modell für zusätzliche Bild-QC
- [ ] Batch-/Queue-Produktion für größere Mengen
- [ ] Social-Media-Veröffentlichung
- [ ] Analytics und Feedback aus veröffentlichten Reels

Globale Produktionsregeln werden nur nach ausdrücklicher Entscheidung geändert. Normale neue Reels verwenden die eingefrorene Produktionsbaseline aus `PRODUCTION_STATUS.md`.
