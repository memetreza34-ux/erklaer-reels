# Google-Flow-Bildprompts

Google Flow wird weiterhin **streng seriell** über `google-flow-controller.txt` gesteuert.

Die visuelle Prompt-Qualität bleibt aber im früheren bewährten Aufbau. Jede Datei unter `image-prompts/Bild NN.txt` enthält ausschließlich den eigentlichen visuellen Quellprompt aus `cover/cover-prompt.txt` bzw. `scenes/.../image-prompt*.txt` — wortgetreu und ohne technische Wrapper.

Verbindlicher Ablauf:

1. nur `Bild 00.txt` lesen
2. genau ein Bild erzeugen
3. vollständig warten
4. in `Bild 00.png` umbenennen und prüfen
5. erst danach `Bild 01.txt` öffnen
6. so seriell bis zum letzten Bild fortfahren

Keine Queue, kein Batch, keine parallelen Generierungen und niemals mehrere Prompt-Dateien vorab einlesen.

`all-image-prompts.txt` ist nur eine Kompatibilitäts-/Indexdatei und darf nicht als Generierungsprompt verwendet werden.

**Wichtig:** Steuertexte wie Dateinamen, Bildnummern, Szenenlabels, `GENERATE EXACTLY ONE IMAGE`, `VISIBLE TEXT FIREWALL`, `ROUND SPHERE WORLD` oder `QUALITY GATE` gehören nicht in die einzelnen Visual-Prompts. Der Visual-Prompt selbst bleibt im alten detaillierten Editorial-Aufbau.

Erzeugen oder aktualisieren:

```bash
npm run export:prompts -- --dir "reels/2026-KW35_24-08_bis_30-08/freitag/reel-01_warum-gehoert-alaska-zu-den-usa" --strict
```
