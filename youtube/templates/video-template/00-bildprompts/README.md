# 00 – Bildprompts und Bildpakete

Hier liegen der vollständige Prompt-Satz für die YouTube-Szenenbilder sowie die fertig erzeugten Bildpakete.

## Verbindliche 10er-Regel

Bilder werden immer in Blöcken von maximal 10 organisiert. **Erzeugt werden sie innerhalb eines Blocks trotzdem immer einzeln und vollständig nacheinander.**

Beispiel bei 60 Bildern:

```text
01_bilder-01-bis-10/
02_bilder-11-bis-20/
03_bilder-21-bis-30/
04_bilder-31-bis-40/
05_bilder-41-bis-50/
06_bilder-51-bis-60/
```

Auch bei einem Auftrag wie **„erstelle alle Bilder“** arbeitet der Agent nicht parallel und erzeugt nicht zehn Bilder auf einmal.

Für jedes einzelne Bild gilt exakt:

```text
Prompt für Bild NN lesen
→ genau EIN Bild erzeugen
→ vollständig warten
→ Bild prüfen
→ falls nötig dieselbe Bildnummer neu erzeugen
→ sofort als Bild NN.png umbenennen
→ sofort in den aktuellen 10er-Ordner legen
→ Ablage prüfen
→ erst dann das nächste Bild erzeugen
```

Nach Bild 10 wird der erste Ordner vollständig geprüft. Erst wenn `Bild 01.png` bis `Bild 10.png` korrekt vorhanden sind, beginnt Bild 11. Dasselbe gilt für alle weiteren Pakete.

Verboten:
- mehrere Bilder gleichzeitig generieren
- mehrere Bildaufträge parallel starten
- eine Queue mit 10 oder mehr Bildern anlegen
- erst alle 10 Bilder erzeugen und danach umbenennen
- erst alle 50–90 Bilder erzeugen und danach sortieren
- bei einem fehlerhaften Bild einfach zur nächsten Nummer weitergehen

Die globale Nummerierung läuft lückenlos weiter. Der letzte Paketordner darf weniger als 10 Bilder enthalten. Bild 00/Thumbnail bleibt separat.

Die vollständigen Bildregeln kommen aus `youtube/YOUTUBE_WORKFLOW.md`, `youtube/YOUTUBE_VISUAL_WORLD.md` und für kommende V2-Projekte zusätzlich aus `youtube/ADAPTIVE_PACING_V2.md`.
