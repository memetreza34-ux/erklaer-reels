# Codex-Hauptauftrag

Dieses Repository produziert visuelle Erklär-Reels. Der Nutzer erstellt Audio und Bilder außerhalb des Repositories. Codex übernimmt Planung, Dateien, Qualitätsprüfung und spätere Zuordnung der unsortierten Assets.

## Wenn der Nutzer ein neues Reel verlangt

1. Prüfe, ob ein deutsches Rohscript vorhanden ist. Wenn nur ein Thema genannt wurde, schreibe zuerst ein einfaches Voice-over-Script mit einem einzigen Erzähler.
2. Speichere das Rohscript als Textdatei, zum Beispiel unter `input/script.txt`.
3. Wähle die Bildanzahl nach der erwarteten Länge:
   - 35–44 Sekunden: normalerweise 8–10 Bildmomente
   - 45–55 Sekunden: normalerweise 10–12 Bildmomente
4. Erstelle den Reel-Ordner:

```bash
npm run create:reel -- \
  --title "TITEL" \
  --script-file input/script.txt \
  --date YYYY-MM-DD \
  --scenes 10
```

5. Öffne anschließend im erzeugten Reel-Ordner `production/agent-task.md` und arbeite den Auftrag vollständig ab.
6. Führe die strenge Inhaltsprüfung aus:

```bash
npm run check:content -- --dir "PFAD-ZUM-REEL" --strict
```

7. Behebe alle Fehler, bis das Inhaltspaket bestanden hat.
8. Teile dem Nutzer danach mit, dass Voice-over und Bilder extern erstellt werden können.

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
10. Vergleiche anschließend die echte Audiospur mit den geplanten `audioCue`-Feldern, dem Untertitelplan und `effects/effects-plan.json`.
11. Korrigiere erkennbare Abweichungen bei Bildwechseln, Untertiteln, Zooms, Übergängen und Soundeffekten, bevor ein späterer Videoschnitt beginnt.

## Verbindliche kreative Regeln

- Erkläre einen Begriff, ein System oder einen Zusammenhang so einfach, dass kein Vorwissen nötig ist.
- Das Hook-Bild ist ab Sekunde 0 sichtbar.
- Für 35–44 Sekunden werden normalerweise 8–10 Bildmomente verwendet.
- Für 45–55 Sekunden werden normalerweise 10–12 Bildmomente verwendet.
- Bilder wechseln oder verändern sich sichtbar ungefähr alle 3,5–5 Sekunden.
- Einfache Bilder dürfen kürzer stehen als komplexere Bilder.
- Jeder Bildmoment erhält ein `audioCue`, das den passenden gesprochenen Begriff oder Satzanfang nennt.
- Das neue Bild erscheint normalerweise 0,1–0,3 Sekunden vor dem `audioCue`.
- Innerhalb eines Reels bleibt die Bildwelt konsistent.
- Zwischen verschiedenen Reels darf die Bildwelt stark wechseln.
- Keine starre Build-up-Logik erzwingen.
- Texte im Bild sind kurze deutsche Schlüsselwörter, keine vollständigen Untertitel.
- Bildprompts sind auf Englisch.
- Politische Inhalte neutral erklären und keine Partei bewerben.
- Bei faktischen Themen Quellen und Unsicherheiten dokumentieren.

## Verbindliche Untertitelregeln

- Untertitel sind standardmäßig aktiv und werden in `subtitles/subtitle-plan.json` geplant.
- Position: untere Mitte bei ungefähr 65–75 % der Bildhöhe.
- Nicht exakt in der Bildschirmmitte und nicht ganz unten.
- Normalerweise 3–6 Wörter pro Einblendung, höchstens zwei Zeilen.
- Kurze Sinnabschnitte statt Wort-für-Wort-Karaoke.
- Den integrierten Bildtext nicht wortgleich wiederholen.
- Bei Konflikten mit Bildtext oder Hauptmotiv die Position innerhalb der sicheren Zone anpassen.
- Untertitel werden nicht in die Bildprompts eingebrannt.

## Verbindliche Effektregeln

- Plane Zooms, Kamerabewegungen, Übergänge und Soundeffekte in `effects/effects-plan.json`.
- Lies `knowledge/effects-rules.md` und `config/effects-rules.json`.
- Jeder Szeneneintrag benötigt `sceneId`, `transitionIn`, `cameraMotion` und `soundEffects`.
- Nicht jede Szene braucht Bewegung. Ohne inhaltlichen Nutzen bleibt der Effekt auf `none`.
- Zooms verändern die Bildgröße normalerweise um 2–6 Prozent und niemals um mehr als 8 Prozent.
- Schwenks bewegen das Bild höchstens 4 Prozent der Bildbreite oder Bildhöhe.
- Hook: kein Übergang, optional ein dezenter Push-in.
- Standardübergang: `cut`. Crossfades nur kurz und begründet.
- Keine auffälligen Glitch-, Spin-, Flash- oder 3D-Übergänge.
- Hintergrundmusik bleibt standardmäßig ausgeschaltet.
- Pro Szene normalerweise null bis zwei Soundeffekte.
- Soundeffekte nur an konkreten `audioCue`-Punkten oder visuellen Ereignissen einsetzen.
- Nicht jeden Schnitt mit einem Whoosh versehen.
- Voice-over hat Vorrang; Effekte dürfen wichtige Wörter nicht verdecken.
- Keine Meme-Sounds oder urheberrechtlich ungeklärte Musik.
- Bewegung darf Text, Hauptmotiv und Untertitel nicht aus der sicheren Zone schieben.

## Fertig bedeutet

Ein Reel-Inhaltspaket ist erst bereit, wenn:

- `npm run validate:reel` erfolgreich ist,
- `npm run check:content -- --strict` erfolgreich ist,
- alle Szenen gefüllte `scene.json`-Dateien besitzen,
- alle Szenen einen ausführlichen Bildprompt besitzen,
- alle Szenen ein `audioCue`, `leadInSeconds` und passende `subtitleCues` besitzen,
- `subtitles/subtitle-plan.json` vorhanden ist,
- `effects/effects-plan.json` vollständig ist und genau einen Eintrag pro Szene enthält,
- Cover, Caption und Quellen vorhanden sind,
- der Nutzer Audio und Bilder ohne Vorsortierung in die Inbox legen kann.
