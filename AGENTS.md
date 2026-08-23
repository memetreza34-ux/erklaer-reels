# AGENTS.md

`CURRENT_WORKFLOW.md` ist die verbindliche Single Source of Truth. Bei Widersprüchen gilt immer die dort definierte Priorität.

## Neues Reel

Bei „Mach ein neues Reel“ autonom:

1. nächsten freien Slot bestimmen
2. Thema aus den erlaubten Säulen wählen
3. deutsches Voice-over mit 155–175 Wörtern schreiben
4. 12–14 narrative Szenen planen, Standard 13
5. Bildwelt nach dem fertigen Script wählen
6. **Bildanzahl pro Reel und pro Szene individuell planen**
7. Cover + alle Bildphasen-Prompts + Google-Flow-Sammeldatei + Caption + Quellen fertigstellen
8. keine Untertitel erzeugen
9. externe Assets zuerst suchen, bevor etwas als fehlend gemeldet wird
10. Assets zweifach visuell prüfen, Audio synchronisieren und nur nach echten QC-Gates rendern

## Narrative Szenen ≠ Bildanzahl

Die frühere starre Annahme `13 Szenen = 13 Bilder` ist aufgehoben.

Jede narrative Szene besitzt:
- normalerweise 1 Bildphase
- 2 Bildphasen, wenn ein zweiter visueller Schritt Verständnis oder Rhythmus klar verbessert
- 3 Bildphasen nur selten bei echten dreistufigen Erklärungen

Wenn ein einziges Still-Bild ungefähr 3,5–4 Sekunden oder länger stehen würde, aktiv eine zweite Bildphase prüfen. **Nicht automatisch hinzufügen**, wenn sie keinen Mehrwert bringt.

Keine feste Gesamtzahl erzwingen. Länder-Reels können häufiger zusätzliche Karten-/Zoom-/Vergleichsbilder brauchen; Köpfe- oder Metaphern-Reels können mit weniger Wechseln funktionieren. Entscheidend ist immer der konkrete Inhalt.

Technische Felder:
- `reel.json.imageCountMode = "individual-per-reel"`
- `reel.json.plannedImageCount`
- pro Szene `imageCount`
- pro Szene `imagePhases[]`

Erste Phase:
- `image-prompt.txt`
- beginnt bei `startPercent: 0`

Zusätzliche Phasen:
- `image-prompt-02.txt`
- `image-prompt-03.txt`
- eigener visueller Gedanke und eigener Grund für den Bildwechsel

## Google Flow

Repo-Agenten erzeugen keine Bilder selbst. Der Nutzer startet Google Flow einmal mit:

```text
all-image-prompts/all-image-prompts.txt
```

Danach arbeitet Flow streng seriell und ohne weiteres `Go`:

```text
Bild erzeugen → vollständig warten → sofort umbenennen → prüfen → nächstes Bild
```

`Bild 00.png` = Cover und Style-Master.

Danach ist die Nummer **globale Bildreihenfolge**, nicht automatisch Szenennummer. Wenn Szene 2 zwei Bilder besitzt, können Bild 02 und Bild 03 beide zu Szene 2 gehören.

Keine Batch-/Queue-/Parallelgenerierung.

### Workflow-Metadaten dürfen niemals im Bild erscheinen

Die Sammeldatei enthält technische Steuerinformationen. Diese sind **niemals visueller Inhalt**.

Verboten als sichtbarer Bildtext sind insbesondere:
- Bildnummern (`BILD 00`, `Bild 01` usw.)
- `COVER`
- `SZENE` / `SCENE`
- `BILDPHASE` / `IMAGE PHASE`
- `DATEINAME`, Dateinamen und technische IDs
- `GOOGLE FLOW`, `PROMPT`, `STYLE-REFERENZ`, `ZIEL`

Für jeden Bildauftrag gilt eine harte Text-Whitelist:
- `imageText` bzw. Cover-Headline gesetzt → **nur exakt dieser Text darf lesbar sein**
- `imageText` leer → **kein lesbarer Text im Bild**

Die Prompt-Sammeldatei muss diese Regel vor jedem einzelnen Bildprompt ausdrücklich wiederholen.

## Bildwelten

### `human-editorial-cartoon`
Köpfe-Welt: große dominante Gesichter/Köpfe, starke Mimik, wenig Körper, Close-ups und mentale Mechanismen direkt am Kopf. Keine generischen überfüllten Gruppenszenen.

### `round-country-characters`
Länder-Welt: **jede anthropomorphe Länderfigur ist eine vollständig runde Kugel** mit vereinfachtem Flaggenmuster und einfachen weißen Augen. Höchstens winzige Arme/Beine.

Strikt verboten:
- Länderumriss/Karten-Silhouette als Figurenkörper
- Gesicht oder Augen auf einer Kartenform
- unregelmäßige Länderform mit Flagge statt runder Kugel

Karten- und Länderumrisse dürfen nur als **gesichtslose Hintergrund-/Erklärgrafiken** vorkommen. Diese Welt darf besonders häufig 2 Bildphasen in einer Szene nutzen, aber nie nach fixer Quote.

Jeder Länder-Welt-Prompt muss sinngemäß erzwingen:
`complete perfectly round country sphere / circular country ball; never a map-shaped character`.

### `visual-metaphor`
Starke zentrale Metapher; zweite Phase nur, wenn Folge oder Auflösung sichtbar einen neuen Schritt liefert.

## Untertitel

Global deaktiviert:
- keine Untertitel
- keine Karaoke-Markierung
- kein `sync:words`
- keine künstliche Untertitel-Safe-Zone

## Audio

- finale Audiodatei ist einzige Zeitquelle
- Pausen straffen
- exakt 1,10x, Pitch erhalten
- −16 LUFS
- max. −1,5 dBTP
- narrative Szenen über echte akustisch bestätigte `audioCue`-Anker synchronisieren
- zusätzliche Bildphasen über `startPercent` innerhalb der bestätigten Szenendauer legen
- nach Audioänderung Timeline neu synchronisieren
- keine erfundenen Szenenanker

## Asset-Zuordnung

Dateinummer ist nur Routing-Hilfe. Jede Bildphase tatsächlich öffnen und gegen Narration, Audio-Cue, Phasen-Visual-Idea, Bildtext und Prompt prüfen. Danach gegen vorherige und nächste **Bildphase** prüfen.

Unter 0,90 Konfidenz nicht raten. `filename-only` ist verboten.

## Render

Nur nach tatsächlich bestandenen Prüfungen:

```bash
npm run check:content -- --dir "<reel>" --strict
npm run discover:assets -- --dir "<reel>"
npm run organize:assets -- --dir "<reel>" --apply
npm run trim:pauses -- --dir "<reel>" --speed 1.10
npm run build:timeline -- --dir "<reel>"
npm run sync:audio -- --dir "<reel>" --strict
npm run check:visuals -- --dir "<reel>" --strict
npm run finalize:reel -- --dir "<reel>" --strict
npm run validate:render -- --dir "<reel>"
npm run render:reel -- --dir "<reel>"
```

Nicht ausgeführte Tests, QC-Stufen oder Render niemals als bestanden melden.
