# Reel-Produktionsplan

## Kerndaten
- Titel: Warum kann keine Weltkarte die Erde richtig zeigen?
- Datum: 2026-08-08
- Themenbereich: Länder, Geografie und Geschichte
- Szenen: 13
- Script: 171 Wörter
- Ziel-Voice-over: 57,3 s
- Zielvideo: 58,0 s inklusive 0,7 s Schlussbild
- Format: 1080 × 1920, 30 fps, 9:16
- Bildstil: visual-metaphor / reife 2D-Editorial-Kartografie
- Musik: keine
- SFX: 0–2 leise Effekte pro Szene
- Voice-over Playback: 1,10×, Tonhöhe erhalten

## Bildworkflow
Der Nutzer fügt `all-image-prompts/all-image-prompts.txt` genau einmal in Google Flow ein. Dieses eine Absenden ist die vollständige Freigabe. Google Flow arbeitet danach streng seriell und autonom: Bild erzeugen → vollständig warten → sofort umbenennen → Dateinamen prüfen → automatisch nächstes Bild. Kein Batch, keine Queue, niemals parallel und kein weiteres Go. `Bild 00.png` ist Cover, Hook und Style-Master. Erst nach `Bild 13.png` alle 14 Bilder gemeinsam in `inbox/numbered-images/` legen. Repo-Agenten erzeugen selbst keine Bilder.

## Untertitel und Schnitt
- exakte akustische Wort-Synchronisation erst nach finalem Audio
- Position 58 %, Farbe #F5F7FA, maximal 2 Zeilen, keine Box/Karaoke-Markierung
- nur harte Schnitte
- subtile Bewegung nur wenn sinnvoll
- Schlussbild 0,7 s halten
- keine Hintergrundmusik
