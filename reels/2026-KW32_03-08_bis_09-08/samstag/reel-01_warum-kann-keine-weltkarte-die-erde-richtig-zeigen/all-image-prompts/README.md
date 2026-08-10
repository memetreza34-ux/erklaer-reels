# Alle Bildprompts

`all-image-prompts.txt` vollständig **ein einziges Mal** in Google Flow einfügen. Danach arbeitet Google Flow ohne weiteres `Go`, aber streng seriell: `Bild 00 → fertig → umbenennen → prüfen → Bild 01 → ... → Bild 13`.

Nie parallel, kein Batch, keine Queue. `Bild 00` ist Cover, Hook und Style-Master; spätere Bilder verwenden `Bild 00.png` direkt als Stilreferenz. Erst nach allen 14 Bildern gemeinsamer Sammelordner. Repo-Agenten erzeugen keine Bilder.
