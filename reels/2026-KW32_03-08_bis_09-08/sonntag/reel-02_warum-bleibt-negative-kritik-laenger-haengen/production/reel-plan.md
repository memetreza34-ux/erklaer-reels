# Reel-Produktionsplan

## Kerndaten
- Titel: Warum bleibt ein negativer Kommentar länger hängen als viele positive?
- Datum: 2026-08-09
- Szenen: 13
- Script: 175 Wörter
- Ziel-Voice-over: 57,2 s
- Zielvideo: 57,9 s inklusive 0,7 s Schlussbild
- Format: 1080 × 1920, 30 fps, 9:16
- Bildstil: human-editorial-cartoon
- Bilder: **werden ausschließlich vom Nutzer selbst anhand der Bildprompts erstellt**
- Agent-Bildgenerierung: verboten
- Musik: keine
- SFX: 0–2 leise Effekte pro Szene
- Voice-over Playback: 1,10×, Tonhöhe erhalten

## Untertitel
- exakte akustische Wort-Synchronisation erst nach finalem Audio
- Position: zentriert, vertikal 58 %
- Farbe: #F5F7FA
- Font-Größe: 54
- Gewicht: 800
- maximal 2 Zeilen
- maximale Breite: 88 %
- kein Karaoke-Highlight
- keine Box
- transparenter Hintergrund

## Schnitt und Bewegung
- harte Schnitte
- keine übertriebenen Übergänge
- subtile Zooms, Parallax oder Fokusbewegungen nur wenn sie die Aussage unterstützen
- Schlussbild 0,7 s halten
- keine Hintergrundmusik

## Bildworkflow
Verbindlich ist `all-image-prompts/all-image-prompts.txt`.

**Nur der Nutzer erstellt die Bilder.** Antigravity, Codex und andere Agenten dürfen keine Bilder erzeugen oder regenerieren.

Der Nutzer arbeitet strikt einzeln:
Prompt lesen → genau ein Bild selbst erstellen → sofort in die angegebene `Bild XX.png` umbenennen → erst dann nächster Prompt.

Erst nach Bild 13 werden alle 14 Dateien gemeinsam in `inbox/numbered-images/` gelegt.
Danach dürfen Agenten mit visueller Zwei-Pass-QC und anschließend `organize:assets --apply` fortfahren.
