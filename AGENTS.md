# AGENTS.md

`CURRENT_WORKFLOW.md` ist die verbindliche Single Source of Truth. Bei Widersprüchen gilt immer die dort definierte Priorität.

## Neues Reel

Bei „Mach ein neues Reel“ autonom:

1. nächsten freien Slot bestimmen
2. Thema aus den erlaubten Säulen wählen
3. deutsches Voice-over mit 155–175 Wörtern schreiben
4. 12–14 narrative Szenen planen, Standard 13
5. **immer `round-country-characters` verwenden**, solange der Nutzer keine andere Welt ausdrücklich reaktiviert
6. Bildanzahl pro Reel und Szene individuell planen
7. Cover + Bildphasen-Prompts + Einzelprompt-Dateien + Flow-Controller + Caption + Quellen fertigstellen
8. keine Untertitel erzeugen
9. externe Assets zuerst suchen, bevor etwas als fehlend gemeldet wird
10. Assets zweifach visuell prüfen, Audio synchronisieren und nur nach echten QC-Gates rendern

## Aktive Bildwelt

Nur `round-country-characters` ist aktiv.

`human-editorial-cartoon` und `visual-metaphor` sind pausiert.

Die Kugel-Welt gilt für **alle Themen**, auch Psychologie, Gesellschaft, Verhalten und abstrakte Mechanismen.

### Figurenregel

Jede anthropomorphe Hauptfigur ist eine vollständige runde Kugel.

- Länder → runde Kugel + vereinfachtes Flaggenmuster
- nicht-länderspezifische Rollen → runde Kugel + neutrale Farben/Symbole
- einfache weiße Augen
- höchstens winzige Arme/Beine

Strikt verboten:
- Länderumriss/Kartenform als Figurenkörper
- Gesicht/Augen auf einer Kartenform
- unregelmäßige geografische Figuren
- menschliche Köpfe/Torsi als Hauptwelt

Jeder Bildprompt erzwingt sinngemäß:
`complete perfectly round circular character / country sphere; never a map-shaped or human-shaped character`.

## Narrative Szenen ≠ Bildanzahl

Jede narrative Szene besitzt normalerweise 1 Bildphase, 2 wenn ein zweiter visueller Schritt klar verbessert, 3 nur selten.

Wenn ein Still-Bild ungefähr 3,5–4 Sekunden oder länger stehen würde, aktiv eine weitere Bildphase prüfen. Keine feste Gesamtzahl erzwingen.

Technische Felder:
- `reel.json.imageCountMode = "individual-per-reel"`
- `reel.json.plannedImageCount`
- pro Szene `imageCount`
- pro Szene `imagePhases[]`

## Google Flow — neue Pflichtstruktur

**Nicht mehr:** einen riesigen Prompt mit allen Bildprompts an Flow geben.

**Stattdessen:**

```text
all-image-prompts/
  google-flow-controller.txt
  image-prompts/
    Bild 00.txt
    Bild 01.txt
    Bild 02.txt
    ...
  all-image-prompts.txt
```

`all-image-prompts.txt` ist nur Kompatibilitäts-/Indexdatei.

Der Nutzer startet Flow mit `google-flow-controller.txt`.

Der Agent arbeitet strikt:

```text
nur nächste Prompt-Datei öffnen
→ genau 1 Bild erzeugen
→ vollständig warten
→ umbenennen
→ prüfen
→ erst dann nächste Prompt-Datei öffnen
```

Strikt verboten:
- alle Prompt-Dateien vorab lesen
- Batch
- Queue
- Parallelgenerierung
- mehrere Bilder pro Auftrag
- nächstes Bild starten, bevor das aktuelle fertig ist

`Bild 00.png` ist Cover und Style-Master.

## Workflow-Metadaten dürfen nie im Bild erscheinen

Verboten als sichtbarer Bildtext:
- Bildnummern
- `COVER`
- `SZENE` / `SCENE`
- `BILDPHASE` / `IMAGE PHASE`
- `DATEINAME`, Dateinamen, technische IDs
- `GOOGLE FLOW`, `PROMPT`, `STYLE-REFERENZ`, `ZIEL`

Harte Text-Whitelist:
- `imageText`/Cover-Headline gesetzt → nur exakt dieser Text darf lesbar sein
- leer → kein lesbarer Text

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
- Szenen über echte akustisch bestätigte `audioCue`-Anker synchronisieren
- zusätzliche Bildphasen über `startPercent` innerhalb der bestätigten Szenendauer legen
- nach Audioänderung Timeline neu synchronisieren
- keine erfundenen Szenenanker

## Asset-Zuordnung

Dateinummer ist nur Routing-Hilfe. Jede Bildphase tatsächlich öffnen und gegen Narration, Audio-Cue, Visual-Idea, Bildtext und Prompt prüfen. Danach gegen vorherige und nächste Bildphase prüfen.

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
