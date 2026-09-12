# Was ist Föderalismus?

Slot: Mittwoch, KW37 · 09.09.2026

## Status

Phase 1 — ChatGPT: **inhaltlich vorbereitet, strikte lokale Validierung noch offen**

- 175 Wörter Voice-over
- 9 narrative Szenen
- 20 Bildmomente mit `adaptive-dense-v2`
- fester Reel-Themenfokus: Politik / Geschichte / Geografie / Systeme
- feste Bildwelt `serious-minimal-countryball-explainer`
- bewusst längere und konkretere Bildprompts als beim vorherigen Reel
- Karten, Bund/Länder, Bundesrat, Grundgesetz, Schule, Polizei und politische Ebenen als natürliche Bildelemente
- exakte Bild↔Audio-Anker für Bild 01–20
- Motion-Plan für jeden Bildmoment
- SFX-Plan für jeden visuellen Wechsel
- Quellen und Caption fertig

Das vorherige Mittwoch-Reel zum Thema Schluckauf wurde ersetzt und gehört nicht mehr zum aktiven Wochenordner.

Offen vor formaler Phase-2-Freigabe:
- `npm test`
- `npm run check:content -- --dir "reels/2026-KW37_07-09_bis_13-09/mittwoch/reel-01_was-ist-foederalismus" --strict`

Diese Prüfungen wurden über den GitHub-Connector nicht ausgeführt und werden deshalb nicht als bestanden markiert.

Phase 2 — Arman: **noch blockiert bis zur strikten Validierung**

Danach:
1. Voice-over aus `01-voice-script/voice-script.txt` erzeugen.
2. `00-bildprompts/99-alle-bildprompts.txt` an Google Flow geben.
3. Bilder strikt seriell Bild 01 → prüfen/benennen/ablegen → Bild 02 → … → Bild 20 erzeugen.

Phase 3 — Antigravity: **blockiert bis Phase 2 komplett ist**.
