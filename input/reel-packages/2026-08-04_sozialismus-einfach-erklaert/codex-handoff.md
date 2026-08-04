# Codex-Übergabe

Nutze dieses Kreativpaket als verbindliche Inhaltsquelle und erledige nur noch die technische Repo-Arbeit.

## Quelle

```text
input/reel-packages/2026-08-04_sozialismus-einfach-erklaert/
```

## Aufgabe

1. Lies `AGENTS.md`, `CODEX_TASK.md` und die aktuellen zentralen Regeln.
2. Bestimme mit `npm run next:slot -- --json` den nächsten freien Produktionsplatz.
3. Erzeuge einen Reel-Arbeitsordner mit:

```bash
npm run create:reel -- \
  --title "Sozialismus einfach erklärt" \
  --script-file "input/reel-packages/2026-08-04_sozialismus-einfach-erklaert/voice-script.txt" \
  --next-free \
  --scenes 10
```

4. Übernimm `voice-script.txt` unverändert nach `script/final-script.txt` und `script/voice-script.txt`.
5. Setze in `reel.json`:

```json
{
  "topicArea": "Politik und Gesellschaft",
  "visualStyleId": "human-editorial-cartoon",
  "visualStyleReason": "Der handgezeichnete Editorial-Cartoon erklärt Eigentum, wirtschaftliche Macht und unterschiedliche sozialistische Strömungen neutral durch klare menschliche Figuren und visuelle Metaphern."
}
```

6. Übertrage die zehn Szenen aus `creative-package.md` vollständig nach `scenes/scene-index.json` und in die jeweiligen `scenes/scene-XX/scene.json`.
7. Verteile die zehn chronologischen Abschnitte aus `all-image-prompts.txt` einzeln nach `scenes/scene-XX/image-prompt.txt`.
8. Erzeuge danach die offizielle Sammeldatei erneut:

```bash
npm run export:prompts -- --dir "<REEL-ORDNER>" --strict
```

9. Übertrage Cover, Caption und Quellen in die vorgesehenen Reel-Dateien.
10. Fülle den Untertitelplan mit `center`, exakt 50 % Bildhöhe, `#F5F7FA`, `#FFD84D` und `rgba(0, 0, 0, 0.72)`.
11. Fülle den Effektplan aus `creative-package.md` aus. Szene 1 verwendet `none`, alle weiteren Szenen `cut`, jeweils Dauer 0.
12. Führe aus und behebe alle echten Fehler:

```bash
npm run validate:reel -- --dir "<REEL-ORDNER>"
npm run check:content -- --dir "<REEL-ORDNER>" --strict
```

13. Stoppe erst, wenn nur noch externe Szenenbilder, Cover und Voice-over-Datei fehlen.
14. Nach Eingang der Dateien: Assets visuell zuordnen, Audio straffen, Cue- und Wortzeiten prüfen, visuelle Kontrolle durchführen, finalisieren und über Remotion bis zur MP4 rendern.

## Nicht neu erfinden

- kein neues Thema auswählen
- Voice-over nicht umschreiben
- Bildstil nicht wechseln
- keine zusätzlichen Szenen hinzufügen
- keine politische Bewertung ergänzen
- keine geschätzten Wortzeiten eintragen

Das Kreativpaket ist fertig. Codex übernimmt ausschließlich Struktur, Validierung, Asset-Verarbeitung, Synchronisierung und Render.
