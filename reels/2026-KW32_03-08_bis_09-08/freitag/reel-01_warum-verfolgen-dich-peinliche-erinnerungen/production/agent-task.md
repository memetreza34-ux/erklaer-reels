# Antigravity-Auftrag – neues Erklär-Reel

## Reel
- Titel: **Warum verfolgen dich peinliche Erinnerungen noch Jahre später?**
- Datum/Slot: **Freitag, 2026-08-07**
- Bereich: **Psychologie und menschliches Verhalten**
- Ziel: **13 Szenen, 175 Wörter, ca. 57,2 s Voice-over + 0,7 s Schlussbild**
- Hauptstil: `human-editorial-cartoon`
- Repo-Pfad: `reels/2026-KW32_03-08_bis_09-08/freitag/reel-01_warum-verfolgen-dich-peinliche-erinnerungen`

## Unverhandelbare Bildregel

**Du bist Google Antigravity und musst für dieses Reel alle Bilder selbst mit Image 3 erzeugen.**

- Verwende **Image 3** für das Cover und alle 13 Szenenbilder.
- Insgesamt müssen **14 echte Bilder** entstehen.
- Nicht nur Prompts vorbereiten oder ausgeben.
- Kein anderes Bildmodell stillschweigend einsetzen.
- Wenn Image 3 nicht verfügbar ist, sofort melden und nicht substituieren.
- Format immer **vertikal 9:16**.
- Bildtext nur exakt wie im Prompt. Keine Zusatzwörter, Logos oder Wasserzeichen.
- Dieselbe Hauptperson in allen Szenen: kurze dunkle Haare, ockerfarbener Hoodie, dunkle Hose.
- **Alle 14 erzeugten Bilder bleiben zusammen in EINEM Sammelordner:** `00-bildprompts/00-ALLE-BILDER-HIER-REIN/`.
- **Nach der Generierung jedes Bild chronologisch umbenennen:** `Bild 00` = Cover, `Bild 01` = Szene 1, `Bild 02` = Szene 2 und fortlaufend bis `Bild 13` = Szene 13.
- Standard-Dateinamen bei PNG: `Bild 00.png`, `Bild 01.png`, `Bild 02.png` ... `Bild 13.png`.
- Bilder NICHT manuell in einzelne Szenenordner verteilen. Die Pipeline erkennt anhand der Nummer das vorgesehene Ziel.
- Danach jedes Bild öffnen, sichtbaren Inhalt prüfen und die bestehende Zwei-Pass-Asset-QC durchführen.
- Unter 0,90 Konfidenz keine Zuordnung erzwingen.
- Erst nach bestandener Sichtprüfung in die finalen Cover-/Szenenpfade übernehmen.

## Pflicht vor Bildgenerierung

Materialisiere den normalen Reel-Workspace anhand der vorhandenen Pipeline und dieses fertigen Inhalts:
- `reel.json`, Scriptdateien und `scenes/scene-index.json` sind bereits vorhanden.
- Erzeuge/aktualisiere alle standardmäßigen `scene.json`, `image-prompt.txt`, Cover-, Caption-, Subtitle-, Effects-, Review- und Manifest-Dateien so, wie es die aktuelle `main`-Pipeline verlangt.
- Verwende **keine alten `content/...`-Pfade**, ausschließlich `reels/...`.
- Erhalte `sourceQualitySchemaVersion: 2`.
- Danach `npm run export:prompts -- --dir "reels/2026-KW32_03-08_bis_09-08/freitag/reel-01_warum-verfolgen-dich-peinliche-erinnerungen" --strict` ausführen.
- Lies die erzeugte `all-image-prompts/all-image-prompts.txt` vollständig. Ganz am Ende steht die verbindliche Bildnummerierung nochmals explizit.
- Dann erst die 14 Bilder mit Image 3 wirklich generieren, chronologisch nummerieren und gemeinsam in den Sammelordner legen.

## Fertiges Voice-over-Script

Warum verfolgen dich peinliche Erinnerungen noch Jahre später? Einfach erklärt:
Dein Gehirn speichert Alltagsszenen unterschiedlich. Intensive Gefühle ziehen mehr Aufmerksamkeit an.
Peinlichkeit ist selbstbezogen: Plötzlich siehst du dich durch die vermuteten Augen anderer.
Dieser soziale Fokus kann den Moment wichtiger wirken lassen, als er für andere war.
Später reicht ein ähnlicher Ort, Name oder Satz, und die Erinnerung springt wieder an.
Dann beginnt oft Grübeln: Du spielst dieselbe Szene erneut durch und suchst nach besserem Verhalten.
Dieses Wiederholen kann die Erinnerung leichter abrufbar halten, statt sie verblassen zu lassen.
Das Gemeine: Andere merken sich deine kleinen Fehler oft viel weniger stark als du selbst.
Wir überschätzen außerdem häufig, wie negativ andere harmlose soziale Patzer bewerten.
Darum fühlt sich alte Peinlichkeit riesig an, obwohl sie für dein Umfeld längst bedeutungslos sein kann.
Die Prüffrage lautet: Lernst du daraus – oder spielst du nur dieselbe Szene wieder ab?
Wenn es nur Grübeln ist, richte deine Aufmerksamkeit bewusst auf das, was heute passiert.
Peinliche Erinnerungen verschwinden nicht auf Knopfdruck. Aber du kannst aufhören, ihnen neue Bedeutung zu geben.

## Cover

**Headline:** `WARUM IMMER NOCH?`

**Image-3-Prompt:**
Vertical 9:16 hand-drawn 2D editorial cartoon for a mature German social-media explainer. Simplified human characters with expressive faces, bold clean outlines, warm muted colors with one red accent for embarrassing memories, natural full-frame composition, clear depth, no split panels, no photorealism, no 3D render, no logos, no watermark, no subtitle bar. Cover composition: the same young adult in an ochre hoodie looks over their shoulder at a huge glowing red memory bubble showing a tiny awkward social moment, while people in the present continue walking normally. Strong emotional contrast: the memory feels enormous to the main character but unimportant to everyone else. Include exactly this large visible German headline: "WARUM IMMER NOCH?". No other readable words. High-impact thumbnail composition, immediate curiosity, clean background, no subtitle area, no extra labels.

## 13 Szenen und Image-3-Prompts

### scene-01 — Hook: Peinliche Erinnerung
- Sprechertext: Warum verfolgen dich peinliche Erinnerungen noch Jahre später? Einfach erklärt:
- Bildtext: WARUM IMMER NOCH?
- Dauer: 4,8 s
- Prompt für Image 3:
Vertical 9:16 hand-drawn 2D editorial cartoon for a mature German social-media explainer. Simplified human characters with expressive faces, bold clean outlines, warm muted colors with one red accent for embarrassing memories. A young adult with short dark hair, ochre hoodie and dark trousers stands calmly in the present while behind them a huge glowing red memory bubble repeats an old awkward social moment like a stage scene. Include exactly the German text "WARUM IMMER NOCH?" and no other readable words. Natural full-frame composition, no split panels, no logos, no watermark, no subtitle bar.

### scene-02 — Gefühle ziehen Aufmerksamkeit
- Sprechertext: Dein Gehirn speichert Alltagsszenen unterschiedlich. Intensive Gefühle ziehen mehr Aufmerksamkeit an.
- Bildtext: STARKE GEFÜHLE
- Dauer: 4,3 s
- Prompt für Image 3:
Vertical 9:16 hand-drawn 2D editorial cartoon, same main character and outfit. The character walks through many pale ordinary everyday moments while one glowing red embarrassing memory is strongly highlighted by a large symbolic spotlight. Include exactly the German text "STARKE GEFÜHLE". No other readable words, no split panels, no logos, no watermark, no subtitle bar.

### scene-03 — Blick durch andere
- Sprechertext: Peinlichkeit ist selbstbezogen: Plötzlich siehst du dich durch die vermuteten Augen anderer.
- Bildtext: WAS DENKEN DIE?
- Dauer: 4,3 s
- Prompt für Image 3:
Vertical 9:16 mature 2D editorial cartoon, same main character. The person stands nervously in the center surrounded by several clearly symbolic eye-shaped mirrors that reflect the same person back at them, visualizing imagined social observation. Include exactly the German text "WAS DENKEN DIE?". Warm muted palette, red accent, no extra words, no logos, no watermark.

### scene-04 — Moment wirkt größer
- Sprechertext: Dieser soziale Fokus kann den Moment wichtiger wirken lassen, als er für andere war.
- Bildtext: RIESIG FÜR DICH
- Dauer: 4,2 s
- Prompt für Image 3:
Vertical 9:16 hand-drawn 2D editorial cartoon. For the same main character, the embarrassing memory appears as an enormous red stage dominating the scene, while surrounding people calmly continue walking and barely look at it. Include exactly the German text "RIESIG FÜR DICH". One coherent scene, no duplicate real character, no extra text, no watermark.

### scene-05 — Auslöser holen ihn zurück
- Sprechertext: Später reicht ein ähnlicher Ort, Name oder Satz, und die Erinnerung springt wieder an.
- Bildtext: kein Bildtext
- Dauer: 4,4 s
- Prompt für Image 3:
Vertical 9:16 mature 2D editorial cartoon, same main character walking past a café. A small familiar detail triggers the same glowing red memory bubble to suddenly reappear behind the person. Show one clear trigger-to-memory moment, warm muted colors, no readable text anywhere, no logos, no watermark, no subtitle bar.

### scene-06 — Grübeln startet
- Sprechertext: Dann beginnt oft Grübeln: Du spielst dieselbe Szene erneut durch und suchst nach besserem Verhalten.
- Bildtext: HÄTTE ICH DOCH ...
- Dauer: 4,5 s
- Prompt für Image 3:
Vertical 9:16 hand-drawn 2D editorial cartoon. The same main character sits on the edge of the bed at night while above them three small film-frame thought images repeat the same awkward moment in a circular mental loop. The repeated figures exist only inside thought frames. Include exactly the German text "HÄTTE ICH DOCH ...". No extra words, no logos, no watermark.

### scene-07 — Wiederholen hält abrufbar
- Sprechertext: Dieses Wiederholen kann die Erinnerung leichter abrufbar halten, statt sie verblassen zu lassen.
- Bildtext: IMMER WIEDER
- Dauer: 4,3 s
- Prompt für Image 3:
Vertical 9:16 mature 2D editorial cartoon. A thin fading drawing represents the memory, while the main character repeatedly traces the same line with a symbolic thought-pencil, making the red memory line strong again. Include exactly the German text "IMMER WIEDER". Clear visual metaphor, no brain anatomy, no extra text, no watermark.

### scene-08 — Andere vergessen schneller
- Sprechertext: Das Gemeine: Andere merken sich deine kleinen Fehler oft viel weniger stark als du selbst.
- Bildtext: kein Bildtext
- Dauer: 4,3 s
- Prompt für Image 3:
Vertical 9:16 hand-drawn 2D editorial cartoon. The same main character carries an oversized red memory backpack, while two other people walk past relaxed with only tiny nearly transparent memory symbols. Friendly neutral tone, one coherent scene, no readable text, no logos, no watermark.

### scene-09 — Urteil wird überschätzt
- Sprechertext: Wir überschätzen außerdem häufig, wie negativ andere harmlose soziale Patzer bewerten.
- Bildtext: SIE URTEILEN WENIGER
- Dauer: 4,2 s
- Prompt für Image 3:
Vertical 9:16 mature 2D editorial cartoon. The main character expects a huge severe red judgment reaction after a small harmless social blunder, but the surrounding people show only mild neutral expressions and small reactions. Include exactly the German text "SIE URTEILEN WENIGER". No star-rating UI, no apps, no extra words, no watermark.

### scene-10 — Für dich groß, für andere klein
- Sprechertext: Darum fühlt sich alte Peinlichkeit riesig an, obwohl sie für dein Umfeld längst bedeutungslos sein kann.
- Bildtext: kein Bildtext
- Dauer: 4,5 s
- Prompt für Image 3:
Vertical 9:16 hand-drawn 2D editorial cartoon. The same main character sees an enormous red memory sphere directly in front of their face, while in the deeper background other people perceive that same symbolic sphere as tiny and distant. One coherent perspective metaphor, no split screen, no readable text, no watermark.

### scene-11 — Prüfe den Gedanken
- Sprechertext: Die Prüffrage lautet: Lernst du daraus – oder spielst du nur dieselbe Szene wieder ab?
- Bildtext: LERNEN ODER GRÜBELN?
- Dauer: 4,4 s
- Prompt für Image 3:
Vertical 9:16 mature 2D editorial cartoon. The same main character stands before two symbolic mental paths: one leads to a small note representing a clear lesson, the other to a circular film strip endlessly replaying the same awkward moment. Include exactly the German text "LERNEN ODER GRÜBELN?". Balanced non-judgmental composition, no extra words, no watermark.

### scene-12 — Auf heute zurücklenken
- Sprechertext: Wenn es nur Grübeln ist, richte deine Aufmerksamkeit bewusst auf das, was heute passiert.
- Bildtext: ZURÜCK INS JETZT
- Dauer: 4,4 s
- Prompt für Image 3:
Vertical 9:16 hand-drawn 2D editorial cartoon. The main character turns away from a fading red memory bubble and directs a bright symbolic spotlight toward the real present: a street, friends and a current everyday task. Shift from red memory tones toward a brighter present. Include exactly the German text "ZURÜCK INS JETZT". No extra text or watermark.

### scene-13 — Bedeutung nicht neu füttern
- Sprechertext: Peinliche Erinnerungen verschwinden nicht auf Knopfdruck. Aber du kannst aufhören, ihnen neue Bedeutung zu geben.
- Bildtext: NICHT WEITER FÜTTERN
- Dauer: 4,6 s
- Prompt für Image 3:
Vertical 9:16 mature 2D editorial cartoon. The same main character calmly walks forward while the old red memory bubble behind them becomes smaller because no new thought-arrows are feeding or enlarging it. Quiet final image, no cure promise. Include exactly the German text "NICHT WEITER FÜTTERN". No extra words, no logos, no watermark.

## Verbindliche Nummerierung nach der Generierung

Alle erzeugten Bilder bleiben gemeinsam im Sammelordner `00-bildprompts/00-ALLE-BILDER-HIER-REIN/`.

- `Bild 00` = Cover
- `Bild 01` = Szene 1
- `Bild 02` = Szene 2
- `Bild 03` = Szene 3
- `Bild 04` = Szene 4
- `Bild 05` = Szene 5
- `Bild 06` = Szene 6
- `Bild 07` = Szene 7
- `Bild 08` = Szene 8
- `Bild 09` = Szene 9
- `Bild 10` = Szene 10
- `Bild 11` = Szene 11
- `Bild 12` = Szene 12
- `Bild 13` = Szene 13

Diese Reihenfolge ist verbindlich. Jedes Bild erhält genau eine Nummer. Keine Nummer doppelt verwenden, keine Nummer vertauschen und die Bilder nicht vorab auf einzelne Szenenordner verteilen.

## Quellen

Die vorhandene `sources/sources.md` ist verbindlich. Keine Quellen entfernen oder durch erfundene Quellen ersetzen.

## Bild-QC und Pipeline

Nach der Image-3-Generierung:

```bash
npm run organize:assets -- --dir "reels/2026-KW32_03-08_bis_09-08/freitag/reel-01_warum-verfolgen-dich-peinliche-erinnerungen"
# inbox/asset-map.json ausschließlich nach echter Sichtung ausfüllen
npm run organize:assets -- --dir "reels/2026-KW32_03-08_bis_09-08/freitag/reel-01_warum-verfolgen-dich-peinliche-erinnerungen" --apply
npm run check:visuals -- --dir "reels/2026-KW32_03-08_bis_09-08/freitag/reel-01_warum-verfolgen-dich-peinliche-erinnerungen" --strict
```

Wenn das externe Voice-over vorliegt:

```bash
npm run trim:pauses -- --dir "reels/2026-KW32_03-08_bis_09-08/freitag/reel-01_warum-verfolgen-dich-peinliche-erinnerungen" --speed 1.10
npm run build:timeline -- --dir "reels/2026-KW32_03-08_bis_09-08/freitag/reel-01_warum-verfolgen-dich-peinliche-erinnerungen"
npm run sync:audio -- --dir "reels/2026-KW32_03-08_bis_09-08/freitag/reel-01_warum-verfolgen-dich-peinliche-erinnerungen" --strict
npm run sync:words -- --dir "reels/2026-KW32_03-08_bis_09-08/freitag/reel-01_warum-verfolgen-dich-peinliche-erinnerungen"
# production/codex-word-sync-task.md akustisch vollständig bearbeiten
npm run sync:words -- --dir "reels/2026-KW32_03-08_bis_09-08/freitag/reel-01_warum-verfolgen-dich-peinliche-erinnerungen" --apply --strict
npm run check:visuals -- --dir "reels/2026-KW32_03-08_bis_09-08/freitag/reel-01_warum-verfolgen-dich-peinliche-erinnerungen" --strict
npm run finalize:reel -- --dir "reels/2026-KW32_03-08_bis_09-08/freitag/reel-01_warum-verfolgen-dich-peinliche-erinnerungen" --strict
npm run validate:render -- --dir "reels/2026-KW32_03-08_bis_09-08/freitag/reel-01_warum-verfolgen-dich-peinliche-erinnerungen"
npm run render:reel -- --dir "reels/2026-KW32_03-08_bis_09-08/freitag/reel-01_warum-verfolgen-dich-peinliche-erinnerungen"
```

## Fertig bedeutet wirklich fertig

Nicht stoppen, sobald Prompts existieren. Dieser Auftrag verlangt ausdrücklich:
1. Standard-Reel-Dateien vervollständigen.
2. Cover + 13 Szenen **mit Image 3 erzeugen**.
3. Alle 14 Bilder gemeinsam nach `Bild 00` bis `Bild 13` benennen und im Sammelordner lassen.
4. Alle Bilder visuell prüfen.
5. Bestehende QC-Gates bestehen.
6. Nach Eintreffen des Voice-overs Audio, Word-Sync und Render fertigstellen.
