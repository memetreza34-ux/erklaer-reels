# Antigravity-Auftrag – Nutzer erstellt alle Bilder selbst

## Reel
- Titel: **Warum verfolgen dich peinliche Erinnerungen noch Jahre später?**
- Datum/Slot: **Freitag, 2026-08-07**
- Bereich: **Psychologie und menschliches Verhalten**
- Ziel: **13 Szenen, 175 Wörter, ca. 57,2 s Voice-over + 0,7 s Schlussbild**
- Hauptstil: `human-editorial-cartoon`
- Repo-Pfad: `reels/2026-KW32_03-08_bis_09-08/freitag/reel-01_warum-verfolgen-dich-peinliche-erinnerungen`

## NEUE UNVERHANDELBARE ROLLENVERTEILUNG

**Antigravity darf KEINE Bilder mehr erzeugen.**

Das gilt für Cover und alle Szenenbilder.

Antigravity darf insbesondere NICHT:
- Image 3 oder ein anderes Bildmodell selbst starten,
- Bilder generieren oder regenerieren,
- Bilder stellvertretend für den Nutzer erstellen,
- nach einem fehlgeschlagenen Bildmodell auf ein anderes Modell ausweichen,
- den Nutzer-Bildschritt überspringen.

**Nur der Nutzer erstellt die Bilder selbst anhand der vorbereiteten Bildprompts.**

Antigravity ist nur für Vorbereitung und Verarbeitung zuständig:
1. Reel-Workspace und Pflichtdateien vervollständigen.
2. Cover-Prompt und alle Szenen-Bildprompts vollständig vorbereiten.
3. `all-image-prompts/all-image-prompts.txt` erzeugen bzw. aktualisieren.
4. Danach STOPPEN und auf die vom Nutzer erstellten Bilder warten.
5. Erst nachdem die Nutzerbilder im Sammelordner liegen, visuelle Prüfung, sichere Zuordnung, QC und weitere Pipeline-Schritte ausführen.

## Manueller Bildablauf des Nutzers

Die Prompts müssen so vorbereitet sein, dass der Nutzer sofort erkennt, welches Bild er gerade erstellt:

- `Bild 00` = Cover → `Bild 00.png`
- `Bild 01` = Szene 1 → `Bild 01.png`
- `Bild 02` = Szene 2 → `Bild 02.png`
- fortlaufend bis `Bild 13` = Szene 13 → `Bild 13.png`

Der Nutzer arbeitet streng einzeln:

**Prompt lesen → genau EIN Bild selbst erstellen → sofort korrekt umbenennen → erst dann den nächsten Prompt verwenden.**

Wenn alle 14 Bilder fertig und korrekt benannt sind, legt der Nutzer sie gemeinsam in:

`00-bildprompts/00-ALLE-BILDER-HIER-REIN/`

Technischer Zielordner:

`inbox/numbered-images/`

Die Bilder werden nicht manuell auf einzelne Cover- oder Szenenordner verteilt.

## Antigravity vor Eintreffen der Bilder

Antigravity darf:
- `reel.json`, Scriptdateien und Szenendaten pflegen,
- standardmäßige `scene.json`, `image-prompt.txt`, Cover-, Caption-, Subtitle-, Effects-, Review- und Manifest-Dateien vorbereiten,
- `sourceQualitySchemaVersion: 2` erhalten,
- ausschließlich `reels/...`-Pfade verwenden,
- die Prompt-Sammeldatei mit folgendem Befehl aktualisieren:

```bash
npm run export:prompts -- --dir "reels/2026-KW32_03-08_bis_09-08/freitag/reel-01_warum-verfolgen-dich-peinliche-erinnerungen" --strict
```

**Nach der Prompt-Vorbereitung keine Bildgenerierung starten. Auf den Nutzer warten.**

## Nach Eintreffen der Nutzerbilder

Erst wenn der Nutzer die fertigen nummerierten Bilder in den Sammelordner gelegt hat:

```bash
npm run organize:assets -- --dir "reels/2026-KW32_03-08_bis_09-08/freitag/reel-01_warum-verfolgen-dich-peinliche-erinnerungen"
```

Danach jedes Bild wirklich öffnen und gegen `narration`, `visualIdea`, `imageText` und `imagePrompt` prüfen. Die Nummer ist nur ein Zielvorschlag und niemals der finale Inhaltsnachweis.

Pflicht:
- Zwei-Pass-Asset-QC durchführen,
- Nachbarszenen ausschließen,
- unter 0,90 Konfidenz keine Zuordnung erzwingen,
- erst nach bestandener Sichtprüfung anwenden.

```bash
npm run organize:assets -- --dir "reels/2026-KW32_03-08_bis_09-08/freitag/reel-01_warum-verfolgen-dich-peinliche-erinnerungen" --apply
npm run check:visuals -- --dir "reels/2026-KW32_03-08_bis_09-08/freitag/reel-01_warum-verfolgen-dich-peinliche-erinnerungen" --strict
```

## Audio und Render

Das Voice-over wird ebenfalls extern bereitgestellt. Sobald Audio und Nutzerbilder vorhanden und geprüft sind, dürfen die bestehenden Audio-, Word-Sync-, Finalisierungs- und Render-Schritte ausgeführt werden.

## Fertig bedeutet

Antigravity darf den Bildschritt niemals selbst übernehmen. Der korrekte Ablauf lautet:

1. Inhalte und Prompts vorbereiten.
2. **Auf die manuell vom Nutzer erstellten Bilder warten.**
3. Nutzer legt `Bild 00` bis `Bild 13` gemeinsam in den Sammelordner.
4. Antigravity prüft und ordnet die vorhandenen Nutzerbilder sicher zu.
5. QC, Audio-Sync und Render erst mit vorhandenen echten Assets fortsetzen.

**Keine Bildgenerierung durch Antigravity. Keine Ausnahme.**
