# Produktionsauftrag: Warum gibt es Zeitzonen?

## Status
Das redaktionelle Produktionspaket ist vorbereitet. Externe Bilder und Voice-over fehlen noch und dürfen nicht als vorhanden behauptet werden.

## Inhalt
- 172 Wörter deutsches Voice-Script
- 13 Szenen
- geplante Sprechdauer: 57,0 s
- geplanter Schlussbild-Nachlauf: 0,7 s
- Cover `Bild 00`
- Szenen `Bild 01` bis `Bild 13`
- visuelle Hauptwelt: `visual-metaphor`, konsistenter 2D-Editorial-Atlas
- vollständige Google-Flow-Sammeldatei unter `all-image-prompts/all-image-prompts.txt`
- Caption mit fünf Hashtags
- geprüfte Quellen unter `sources/sources.md`

## Externe Bildphase
Der Nutzer startet Google Flow genau einmal mit der vollständigen Sammeldatei. Google Flow arbeitet danach streng seriell ohne weiteres Go: Bild erzeugen → vollständig warten → sofort `Bild XX.png` nennen → Umbenennung prüfen → automatisch nächstes Bild.

`Bild 00.png` ist Cover und Style-Master. Erst nach allen 14 Bildern wird die komplette Serie gemeinsam in den Sammelordner gelegt.

## Nach Eintreffen der Assets
1. Vor einem Stop zuerst Asset-Discovery im Reel, `~/Downloads` und `~/Desktop` ausführen; vollständige eindeutige ZIP sicher entpacken.
2. Nummerierte Bilder nur vorsortieren; jedes Bild zweifach visuell gegen Narration, Audio-Cue, Visual-Idee, Bildtext und Prompt prüfen.
3. Voice-over vom Original aus auf exakt 1,10x bei erhaltener Tonhöhe verarbeiten.
4. Auf −16 LUFS und höchstens −1,5 dBTP normalisieren und tatsächlich nachmessen.
5. Timeline mit dem echten Audio synchronisieren.
6. Jedes gesprochene Wort akustisch mit echten Start-/Endzeiten bestätigen.
7. 100 % Abdeckung verlangen: `coverage === 1`, `timedWords === totalWords`, `unassignedWords === 0`.
8. Untertitel bei exakt 58 %: Grundtext `#F5F7FA`, aktuelles Sprecherwort `#B7794A`, keine Box und keine Bounce-/Zoom-Animation.
9. Visuelle QC, Finalizer und Render-Validator tatsächlich bestehen lassen.
10. Erst dann MP4 rendern; finale Datei über `04-video/FERTIGES-VIDEO/` sichtbar machen.

Keine nicht ausgeführten Tests, keine fehlenden Assets und keine geplanten QC-Stufen als bestanden melden.
