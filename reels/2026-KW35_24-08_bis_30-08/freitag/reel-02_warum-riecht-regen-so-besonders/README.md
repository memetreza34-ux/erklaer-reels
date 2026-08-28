# Warum riecht Regen so besonders?

Test-Reel für die **eine feste Reel-Bildwelt Modern Countryball Explainer** (`modern-countryball-explainer`).

- Datum: 28.08.2026
- Thema: Alltag / Wissenschaft / Natur
- Format: Reel, 9:16
- Voice-over: 166 Wörter
- Narrative Szenen: 13
- Cover: Bild 00
- Szenenbilder: Bild 01 bis Bild 13
- Gesamt: 14 Bilder
- Prompts: Englisch
- sichtbarer Bildtext: Deutsch
- Untertitel: aus
- Bildwelt: `Modern Countryball Explainer`

Wenn Akteure vorkommen, sind sie runde Kugelfiguren mit einfachen weißen Augen und ohne separaten Kopf. Die Kugelgeometrie ist der Figurenanker: einzelne Kugel, kleine Kugelgruppe oder Kugel plus Objekt je nach Szene. Eine Kugelfigur ist aber **nicht in jedem Bild Pflicht**. Wenn Objekt, Naturprozess oder Umgebung die Aussage besser erklärt, bleibt die Szene ohne Akteur — in derselben Kontur- und Formsprache. Menschliche Köpfe auf Kugelkörpern, humanoide Cartoonmenschen und Stick-Figuren sind verboten.

Es gibt keine zweite Reel-Bildwelt und keine themenspezifische Unter-Bildwelt.

## Google Flow

Für die komplette Bildgenerierung gibt es genau eine Datei:

`00-bildprompts/99-alle-bildprompts.txt`

Es gibt keine zweite `all-image-prompts`-Spiegelkopie.

Flow arbeitet streng seriell: genau ein Bild erzeugen, vollständig warten, prüfen, umbenennen, sofort in den gemeinsamen Ordner `00-FERTIGE-REEL-BILDER` legen und erst danach das nächste Bild starten.

## Export

Am Ende liegen im sichtbaren Bereich `03-export/`:

- `FERTIGES-REEL.mp4`
- `UNIVERSELLE-CAPTION.txt`
