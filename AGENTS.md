# AGENTS.md

`CURRENT_WORKFLOW.md` ist die verbindliche Single Source of Truth. Bei Widersprüchen gilt immer die dort definierte Priorität.

## Neues Reel

Bei „Mach ein neues Reel“ autonom:

1. nächsten freien Slot bestimmen
2. Thema aus den erlaubten Säulen wählen
3. deutsches Voice-over mit 155–175 Wörtern schreiben
4. 12–14 narrative Szenen planen, Standard 13
5. **immer `round-country-characters` als aktive Kugel-Welt setzen**
6. Bildanzahl pro Reel und pro Szene individuell planen
7. Cover + alle Bildphasen-Prompts + Einzelprompt-Dateien + Controller + Caption + Quellen fertigstellen
8. keine Untertitel erzeugen
9. externe Assets zuerst suchen, bevor etwas als fehlend gemeldet wird
10. Assets zweifach visuell prüfen, Audio synchronisieren und nur nach echten QC-Gates rendern

## Aktive Bildwelt: nur Kugel-Welt

Für alle neuen Reels gilt `round-country-characters` als einzige aktive Bildwelt.

Andere Welten sind pausiert:
- `human-editorial-cartoon`
- `visual-metaphor`

Sie dürfen erst wieder verwendet werden, wenn der Nutzer sie ausdrücklich reaktiviert.

### Figurenregel für alle Themen

Jede anthropomorphe Hauptfigur ist eine **perfekt runde Kugel / ein kreisrunder Ball**.

- Länder-Themen: Flaggenmuster auf der Kugel
- Nicht-Länder-Themen: neutrale Kugelfiguren mit Farben/Symbolen/Rollenmerkmalen
- einfache weiße Augen
- höchstens winzige Arme/Beine
- keine normalen Menschen als Hauptfiguren
- keine menschlichen Köpfe/Torsi als Hauptbildwelt
- keine Länder-/Kartenform als Figurenkörper

Jeder neue Bildprompt muss sinngemäß erzwingen:

`Every anthropomorphic main character must be a complete perfectly round editorial ball/sphere character; never a map-shaped character and never a normal human character as the main figure.`

## Narrative Szenen ≠ Bildanzahl

Die frühere starre Annahme `13 Szenen = 13 Bilder` ist aufgehoben.

Jede narrative Szene besitzt:
- normalerweise 1 Bildphase
- 2 Bildphasen, wenn ein zweiter visueller Schritt Verständnis oder Rhythmus klar verbessert
- 3 Bildphasen nur selten bei echten dreistufigen Erklärungen

Wenn ein einziges Still-Bild ungefähr 3,5–4 Sekunden oder länger stehen würde, aktiv eine zweite Bildphase prüfen. **Nicht automatisch hinzufügen**, wenn sie keinen Mehrwert bringt.

Keine feste Gesamtzahl erzwingen.

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

## Google Flow — kein Mega-Prompt mehr

Repo-Agenten erzeugen keine Bilder selbst.

`npm run export:prompts` erzeugt ab jetzt:

```text
all-image-prompts/google-flow-controller.txt
all-image-prompts/all-image-prompts.txt
all-image-prompts/individual-prompts/Bild 00.txt
all-image-prompts/individual-prompts/Bild 01.txt
...
```

### Bedeutung

- `google-flow-controller.txt` = Steuerlogik und Reihenfolge für einen Agenten mit Repo-Zugriff
- `all-image-prompts.txt` = Manifest/Kompatibilitätsdatei
- `individual-prompts/Bild XX.txt` = der **einzige** Inhalt, der für dieses konkrete Bild an Google Flow gegeben wird

### Verbindlicher Ablauf

```text
Einzelprompt öffnen
→ nur diesen einen Prompt an Flow geben
→ genau ein Bild erzeugen
→ vollständig warten
→ Ergebnis prüfen
→ umbenennen
→ erst dann nächsten Einzelprompt öffnen
```

Strikt verboten:
- alle Bildprompts in eine Flow-Nachricht kopieren
- mehrere Generierungen gleichzeitig
- Batch
- Queue
- Preloading
- Kontaktbogen/Storyboard statt Einzelbildern

`Bild 00.png` bleibt Cover und Style-Master.

Die Bildnummer ist globale Bildreihenfolge, nicht automatisch Szenennummer.

## Workflow-Metadaten dürfen niemals im Bild erscheinen

Verboten als sichtbarer Bildtext sind insbesondere:
- Bildnummern
- `COVER`
- `SZENE` / `SCENE`
- `BILDPHASE` / `IMAGE PHASE`
- `DATEINAME`, Dateinamen und technische IDs
- `GOOGLE FLOW`, `PROMPT`, `STYLE-REFERENZ`, `ZIEL`

Für jeden Bildauftrag gilt eine harte Text-Whitelist:
- `imageText` bzw. Cover-Headline gesetzt → **nur exakt dieser Text darf lesbar sein**
- `imageText` leer → **kein lesbarer Text im Bild**

Die Einzelprompt-Datei selbst enthält keine Bildnummer, keinen Dateinamen und keine Szenen-/Phasenlabels.

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

Dateinummer ist nur Routing-Hilfe. Jede Bildphase tatsächlich öffnen und gegen Narration, Audio-Cue, Phasen-Visual-Idea, Bildtext und Prompt prüfen. Danach gegen vorherige und nächste Bildphase prüfen.

Zusätzlich prüfen:
- alle Hauptfiguren sind echte runde Kugeln
- keine map-shaped characters
- keine unerlaubten Workflow-Texte sichtbar

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
