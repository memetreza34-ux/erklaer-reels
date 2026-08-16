# Externe Dateien und sichere Zuordnung

Lege Bilder bevorzugt direkt in den passenden Ordner `scenes/scene-XX/` und benenne sie `scene-XX.png`. Auch dann muss Codex jedes Bild tatsächlich öffnen und gegen Sprechertext, Audio-Cue, visuelle Idee, Bildtext und Prompt prüfen.

Bei unsortierten Bildern in `inbox/images/` gilt zwingend:

1. Sichtbaren Inhalt ohne Dateinamen beschreiben.
2. Mit allen Szenenfeldern vergleichen.
3. Gewählte Szene gegen vorherige und nächste Szene prüfen.
4. Niemals nach Upload-Reihenfolge oder Dateinummer zuordnen.
5. Unter 0,90 Konfidenz nicht raten.
6. `visualReviewed`, `secondPassConfirmed`, `sceneOrderConfirmed`, `visibleSummary`, `reason`, `comparedFields`, `confirmedTarget` und `confirmedSceneOrder` eintragen.

Nach der Zuordnung müssen `review/scene-asset-verification.json` und die strenge visuelle Prüfung vollständig bestanden sein.

Lege das Cover nach `cover/cover.png` und das ursprüngliche Voice-over nach `audio/`.
