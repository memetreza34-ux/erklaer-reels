# Verbindliches 3-Phasen-System

Dieses Repository ist die Produktionsumgebung für **Phase 3 mit Antigravity**. Kreative Neuerstellung gehört nicht zu Antigravity.

## Phase 1 — normales ChatGPT

ChatGPT erstellt das vollständige kreative Paket:

- Thema, Recherche, Voice-Script und Szenenplan
- genau eine der drei erlaubten Bildwelten
- Cover-Prompt, Szenenprompts und Google-Flow-Sammeldatei
- Caption und Quellen

Erlaubte Bildwelten:

1. `human-editorial-cartoon`
2. `round-country-characters`
3. `visual-metaphor`

Andere Bildwelten sind für neue Reels gesperrt.

## Phase 2 — Arman

Arman erzeugt extern:

- mit Google Flow `Bild 00` bis `Bild XX`
- das Voice-over-Audio mit dem gewünschten externen Sprachwerkzeug

Danach legt er die vollständige Bildserie und das unbearbeitete Audio in die sichtbaren Übergabeordner des Reels. In dieser Phase verändert Antigravity keine Inhalte und erzeugt keine Medien.

## Phase 3 — Antigravity

Antigravity übernimmt ab der vollständigen Übergabe alles Weitere:

- Assets suchen, sicher übernehmen und zuordnen
- jedes Bild in zwei visuellen Durchgängen prüfen
- Audio auf exakt 1,10x bringen und normalisieren
- Timeline und Bildwechsel an echte Audio-Cues binden
- Whisper-Wortzeiten abgleichen und 100-%-Untertitelabdeckung herstellen
- alle Inhalts-, Audio-, Bild-, Sync- und Render-Gates ausführen
- Reel rendern und die fertige MP4 vollständig prüfen

Antigravity darf in Phase 3 Thema, Script, Bildwelt oder Bildprompts nicht eigenständig neu erstellen. Bei einem inhaltlich unvollständigen Phase-1-Paket oder fehlenden Phase-2-Assets meldet Antigravity die konkrete Lücke. Es springt nicht in eine frühere Phase zurück.

Vor dem Start:

```bash
npm run verify:handoff -- --dir "PFAD-ZUM-REEL"
```

Nur ein bestandener Übergabecheck gibt Phase 3 frei.

## Startsignal und stiller Durchlauf

Mit `Antigravity los, erstelle das Reel`, `Antigravity los` oder einem sinngleichen eindeutigen Auftrag startet Arman den vollständigen Phase-3-Lauf.

Antigravity arbeitet danach ohne Zwischenmeldungen und ohne routinemäßige Rückfragen bis zu genau einem dieser Ergebnisse:

1. **Blockierender Fehler:** Erst nachdem Asset-Suche, sichere automatische Prüfungen, Wiederholungen und vorhandene Alternativen ausgeschöpft wurden. Die Nachricht nennt das konkrete fehlerhafte Gate und die benötigte Nutzeraktion.
2. **Reel fertig:** Alle Quality-Gates und die finale Video-QC sind bestanden. Die Nachricht nennt den Pfad zur geprüften MP4.

Laufender Fortschritt, Wartezeit oder ein selbst lösbares Problem sind kein Grund, Arman zu kontaktieren.

## YouTube-Langvideos

Das gleiche Rollen- und Kommunikationsprinzip gilt für YouTube, aber mit eigenem Standard aus `youtube/YOUTUBE_WORKFLOW.md`: 16:9, `german-simple-explainer-cartoon`, 8–12 Minuten und keine Untertitel oder Textkarten. Startsignal: `Antigravity los, erstelle das YouTube-Video`.
