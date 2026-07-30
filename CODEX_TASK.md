# Codex-Hauptauftrag

Dieses Repository produziert visuelle Erklär-Reels. Der Nutzer erstellt Audio und Bilder außerhalb des Repositories. Codex übernimmt Planung, Dateien, Qualitätsprüfung und spätere Zuordnung der unsortierten Assets.

## Wenn der Nutzer ein neues Reel verlangt

1. Prüfe, ob ein deutsches Rohscript vorhanden ist. Wenn nur ein Thema genannt wurde, schreibe zuerst ein einfaches Voice-over-Script mit einem einzigen Erzähler.
2. Speichere das Rohscript als Textdatei, zum Beispiel unter `input/script.txt`.
3. Erstelle den Reel-Ordner:

```bash
npm run create:reel -- \
  --title "TITEL" \
  --script-file input/script.txt \
  --date YYYY-MM-DD \
  --scenes 9
```

4. Öffne anschließend im erzeugten Reel-Ordner `production/agent-task.md` und arbeite den Auftrag vollständig ab.
5. Führe die strenge Inhaltsprüfung aus:

```bash
npm run check:content -- --dir "PFAD-ZUM-REEL" --strict
```

6. Behebe alle Fehler, bis das Inhaltspaket bestanden hat.
7. Teile dem Nutzer danach mit, dass Voice-over und Bilder extern erstellt werden können.

## Wenn der Nutzer Audio und Bilder zurückgibt

1. Lege alle Bilder mit beliebigen Dateinamen und in beliebiger Reihenfolge in `inbox/images/`.
2. Lege die Audiodatei in `inbox/audio/`.
3. Erstelle das Inventar:

```bash
npm run organize:assets -- --dir "PFAD-ZUM-REEL"
```

4. Betrachte jedes Bild visuell. Vergleiche es mit:
   - Sprechertext
   - `imageText`
   - `visualIdea`
   - Bildprompt
   - Figuren, Gegenständen, Symbolen und Komposition
5. Schreibe die Zuordnung nach `inbox/asset-map.json`.
6. Verwende jedes Bild und jedes Ziel höchstens einmal.
7. Weise nur bei mindestens 0,75 Konfidenz zu. Unsichere Bilder bleiben unter `unmatched`.
8. Wende die Zuordnung an:

```bash
npm run organize:assets -- --dir "PFAD-ZUM-REEL" --apply
```

9. Prüfe den Bericht unter `review/asset-matching-report.json`.

## Verbindliche kreative Regeln

- Erkläre einen Begriff, ein System oder einen Zusammenhang so einfach, dass kein Vorwissen nötig ist.
- Ein Reel hat normalerweise 8–10 Bildmomente für ungefähr 35–55 Sekunden.
- Die Bilder wechseln oder verändern sich sichtbar ungefähr alle 4–6 Sekunden.
- Innerhalb eines Reels bleibt die Bildwelt konsistent.
- Zwischen verschiedenen Reels darf die Bildwelt stark wechseln.
- Keine starre Build-up-Logik erzwingen.
- Texte im Bild sind kurze deutsche Schlüsselwörter, keine vollständigen Untertitel.
- Bildprompts sind auf Englisch.
- Politische Inhalte neutral erklären und keine Partei bewerben.
- Bei faktischen Themen Quellen und Unsicherheiten dokumentieren.

## Fertig bedeutet

Ein Reel-Inhaltspaket ist erst bereit, wenn:

- `npm run validate:reel` erfolgreich ist,
- `npm run check:content -- --strict` erfolgreich ist,
- alle Szenen gefüllte `scene.json`-Dateien besitzen,
- alle Szenen einen ausführlichen Bildprompt besitzen,
- Cover, Caption und Quellen vorhanden sind,
- der Nutzer Audio und Bilder ohne Vorsortierung in die Inbox legen kann.
