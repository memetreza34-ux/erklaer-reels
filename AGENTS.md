# AGENTS.md

`CURRENT_WORKFLOW.md` ist die verbindliche Single Source of Truth. Bei Widersprüchen gilt immer die dort definierte Priorität.

## Neues Reel

Bei „Mach ein neues Reel“ autonom:

1. nächsten freien Slot bestimmen
2. starkes Thema aus dem offenen Themenuniversum wählen
3. deutsches Voice-over mit 155–175 Wörtern schreiben
4. 12–14 narrative Szenen planen, Standard 13
5. für Cover und jede Bildphase zwingend `modern-countryball-explainer` verwenden
6. Bildanzahl pro Reel und Szene individuell planen
7. Cover + Bildphasen-Prompts + kompletten seriellen Google-Flow-Gesamtprompt + Caption + Quellen fertigstellen
8. keine Untertitel erzeugen
9. externe Assets zuerst suchen, bevor etwas als fehlend gemeldet wird
10. Assets zweifach visuell prüfen, inklusive Stilkonformität, Audio synchronisieren und nur nach echten QC-Gates rendern

## Reels und YouTube strikt trennen

Reels und YouTube besitzen **getrennte Bildwelten**.

Für Reels gilt:

```text
modern-countryball-explainer
```

Für YouTube gilt ausschließlich:

```text
youtube/YOUTUBE_WORKFLOW.md
youtube/YOUTUBE_VISUAL_WORLD.md
```

Nie automatisch übertragen:

- YouTube-Stick-Figuren auf Reels
- Reel-Countryball-Regeln auf YouTube
- 16:9-YouTube-Komposition auf Reels
- 9:16-Reel-Regeln auf YouTube

## Themenwahl

Neue Reels dürfen aus praktisch jedem geeigneten Erklärbereich kommen: Psychologie, Alltag, Beziehungen, Gesellschaft, Geschichte, Geografie, Politik, Wissenschaft, Technik, Internet, Lernen, Arbeit, Wirtschaft, Gesundheit, Sprache, Mythen und andere starke Warum-Fragen.

Keine starre Themenrotation und keine Quote nach alten Säulen.

## Reel-Bildwelt — scene-first Editorial Countryball

Die globale Reel-Bildwelt ist verbindlich in `knowledge/fixed-visual-world.md` und `config/image-styles.json` definiert.

Neue Reels erhalten:

```text
visualStyleId: "modern-countryball-explainer"
visualStyleReason: "Globale feste Bildwelt für alle neuen Erklär-Reels: szenischer Editorial-Countryball-Erklärstil mit konkreten Umgebungen statt generischer Icon-Karten."
```

### Hauptregel

**Zuerst eine konkrete physische Mini-Szene bauen. Erst danach Symbole ergänzen.**

Das Bild soll wie ein eingefrorener Story-Moment wirken, nicht wie eine sterile Infografik.

### Kernregeln

- 9:16
- hand-drawn 2D vector-cartoon hybrid
- dicke leicht organische schwarze Konturen
- flächige Farben, dezente Schatten, höchstens leichte Korn-/Papiertextur
- ein dominantes Hauptmotiv und eine klare Handlung
- nur wenige unterstützende Requisiten
- konkrete Umgebung, wenn sie die Aussage verbessert
- Close-ups, Off-Center-Framing und einfacher Vorder-/Mittel-/Hintergrund ausdrücklich erlaubt
- Countryball-ähnliche Figuren nur wenn Akteure sinnvoll personifiziert werden
- Flaggen nur wenn Länder-/Regionsidentität relevant ist
- bei abstrakten Allgemeinthemen Gegenstand, Mechanismus oder Umgebung einer leeren neutralen Kugel vorziehen
- Prompts Englisch, sichtbarer Bildtext ausschließlich Deutsch

### Nicht als Standardlösung verwenden

- leere beige Kugel mittig
- schwebende Reaktionskarten
- generische Lob-/Kritik-Karten
- Kreise aus Sprechblasen
- Icon-Gitter
- UI-Boxen
- Figur-mittig-plus-Icons
- immer derselbe einfarbige Hintergrund
- Waage/Megafon als Universalmetapher
- doppelte identische Headline oben und unten

### Verbotene Stilabweichungen

- Fotorealismus
- realistische Menschen/Gesichter
- Anime/Manga
- Clay/Knetstil
- glänzendes 3D/Pixar-Look
- Stockfoto-Ästhetik
- YouTube-Stick-Figure-/Ink-Explainer-Look
- 16:9-Komposition

## Bildprompt-Autorenschaft

Jede `cover-prompt.txt`, `image-prompt.txt`, `image-prompt-02.txt` usw. beschreibt eine **konkrete Szene**.

Jeder Prompt enthält mindestens:

1. Format 9:16
2. Hauptmotiv
3. Ort/Umgebung
4. physische Handlung
5. Perspektive/Komposition
6. nur wenige unterstützende Requisiten
7. festen Stil `modern-countryball-explainer`
8. exakt erlaubten deutschen Bildtext, falls vorhanden
9. `No other readable text, no English, no logos, no watermark`
10. volle 9:16-Fläche, keine Subtitle-Safe-Zone

Der Exporter ergänzt den globalen und per-Bild Style-Lock automatisch.

`Bild 00.png` ist das Cover, aber nicht der alleinige Style-Master.

## Narrative Szenen ≠ Bildanzahl

Jede narrative Szene besitzt normalerweise 1 Bildphase, 2 wenn ein echter zweiter visueller Schritt hilft, 3 nur selten.

Wenn ein Still ungefähr 3,5–4 Sekunden oder länger stehen würde, aktiv eine weitere Bildphase prüfen. Keine feste Gesamtzahl erzwingen.

Technische Felder:

- `reel.json.imageCountMode = "individual-per-reel"`
- `reel.json.plannedImageCount`
- pro Szene `imageCount`
- pro Szene `imagePhases[]`

## Google Flow

Verbindliche Nutzerdatei:

```text
00-bildprompts/99-alle-bildprompts.txt
```

`all-image-prompts/all-image-prompts.txt` ist die identische technische Kopie.

Der separate `google-flow-controller.txt` ist deaktiviert.

### Hard Serial Lock

```text
nur aktuellen Bildabschnitt ausführen
→ genau 1 Bildgenerator-Aufruf
→ vollständig warten
→ gegen aktuellen Bildprompt UND feste Reel-Bildwelt prüfen
→ umbenennen
→ prüfen
→ erst dann nächster Bildabschnitt
```

Keine Queue, kein Batch, keine Parallelgenerierung, keine Mehrfachvarianten.

## Workflow-Metadaten nie im Bild

Verboten als sichtbarer Bildtext:

- Bildnummern
- `COVER`
- `SZENE` / `SCENE`
- `BILDPHASE` / `IMAGE PHASE`
- `DATEINAME`, Dateinamen
- `GOOGLE FLOW`, `PROMPT`, `STYLE-REFERENZ`, `ZIEL`

`imageText` gesetzt → nur exakt dieser deutsche Text. Leer → kein lesbarer Text.

## Quellen-QC

Neue Reels verwenden Quellen-Schema 3:

- mindestens zwei echte HTTPS-Quellen
- unterschiedliche Hosts
- mindestens eine Primär-/offizielle oder wissenschaftliche Originalquelle
- mindestens eine unabhängige Sekundär-/Fachquelle
- unter `Belegt` konkrete gestützte Reel-Aussage nennen

## Untertitel

Global deaktiviert:

- keine Untertitel
- keine Karaoke-Markierung
- keine künstliche Subtitle-Safe-Zone
- `sync:words` ist nicht erforderlich

## Audio

- finale Audiodatei ist einzige Zeitquelle
- Pausen straffen
- exakt 1,10x, Pitch erhalten
- −16 LUFS
- max. −1,5 dBTP
- Szenen über echte akustische `audioCue`-Anker synchronisieren
- zusätzliche Bildphasen über `startPercent`
- nach Audioänderung Timeline neu synchronisieren

## Asset-Zuordnung

Dateinummer ist nur Routing-Hilfe. Jede Bildphase tatsächlich öffnen und gegen Narration, Audio-Cue, Visual-Idea, Bildtext, Prompt, feste Reel-Bildwelt und benachbarte Bildphasen prüfen.

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
