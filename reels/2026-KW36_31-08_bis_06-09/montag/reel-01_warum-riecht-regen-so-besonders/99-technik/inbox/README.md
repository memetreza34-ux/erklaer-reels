# Externe Dateien und sichere Zuordnung

Die Hook besitzt genau **eine** Bildphase, jede weitere Szene genau **zwei**. Eine dritte Bildphase ist im aktuellen Workflow nicht vorgesehen. Die erste Bildphase einer Szene nutzt `image-prompt.txt`, die zweite `image-prompt-02.txt`.

Bei unsortierten Bildern gilt zwingend:

1. Sichtbaren Inhalt ohne Dateinamen beschreiben.
2. Mit der konkreten Bildphase und ihren Szenenfeldern vergleichen.
3. Gewählte Bildphase gegen vorherige und nächste Bildphase prüfen.
4. Niemals allein nach Upload-Reihenfolge oder Dateinummer zuordnen.
5. Unter 0,90 Konfidenz nicht raten.
6. `visualReviewed`, `secondPassConfirmed`, `sceneOrderConfirmed`, `visibleSummary`, `reason`, `comparedFields`, `confirmedTarget` und `confirmedSceneOrder` eintragen.

Die fortlaufende Google-Flow-Nummer beschreibt die **Bildreihenfolge**, nicht mehr automatisch die Szenennummer. Beispiel: Wenn Szene 2 zwei Bilder hat, kann Bild 02 die erste Phase von Szene 2 und Bild 03 die zweite Phase von Szene 2 sein.

Nach der Zuordnung müssen `review/scene-asset-verification.json` und die strenge visuelle Prüfung vollständig bestanden sein.

Es gibt kein separates Cover mehr: Die erste Szene ist zugleich das Titelbild. Lege das ursprüngliche Voice-over nach `audio/`.
