# Produktionsauftrag

Dieses Reel ist inhaltlich und promptseitig vorbereitet.

## Aktuell fertig
- deutsches Voice-Script: 157 Wörter
- 13 Szenen
- Cover = Bild 00
- Bild 01–13 Szenenprompts
- Google-Flow-Sammeldatei
- Caption und Quellen
- Untertitel-/Effektplanung

## Externe Assets
Repo-Agenten erzeugen keine Bilder. Der Nutzer startet Google Flow einmal mit `all-image-prompts/all-image-prompts.txt`. Flow erzeugt Bild 00 bis Bild 13 streng seriell und ohne weiteres Go.

Wenn Bilder oder Voice-over scheinbar fehlen, NICHT sofort stoppen. Zuerst `discover:assets` bzw. `organize:assets` ausführen und Reel-Ordner, Downloads und Desktop einschließlich ZIP-Dateien durchsuchen. Eine passende vollständige Bild-ZIP sicher entpacken, nummeriert importieren und danach jedes Bild visuell in zwei Durchgängen gegen die Szene prüfen.

Sobald das Voice-over vorhanden ist: Original verwenden, Pausen straffen, exakt 1,10x mit erhaltener Tonhöhe, echte Lautheit auf −16 LUFS / max. −1,5 dBTP messen, Timeline synchronisieren und jedes gesprochene Wort akustisch timen. `coverage === 1`, `unassignedWords === 0` und vollständige Wortfolge sind Pflicht. Aktives Wort `#B7794A`, Rest `#F5F7FA`.

Erst nach bestandener visueller QC, Audio-QC, Finalizer und Render-Validator rendern. Finale MP4 muss unter `04-video/FERTIGES-VIDEO/` sichtbar sein.

`npm test` und CLI-Validatoren sind in der Chat-Erstellung nicht ausgeführt worden und dürfen nicht als bestanden markiert werden.
