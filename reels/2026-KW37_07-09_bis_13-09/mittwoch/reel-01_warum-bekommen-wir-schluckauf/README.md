# Warum bekommen wir Schluckauf?

Slot: Mittwoch, KW37 · 09.09.2026

## Status

Phase 1 — ChatGPT: **inhaltlich vorbereitet, strikte lokale Validierung noch offen**

- 174 Wörter Voice-over
- 9 narrative Szenen
- 21 Bildmomente mit `adaptive-dense-v2`
- neue feste Reel-Bildwelt `serious-minimal-countryball-explainer`
- cleane, seriöse Countryball-Kompositionen mit 0–3 passenden Zusatzobjekten statt immer nur Kugel + leerer Hintergrund
- exakte Bild↔Audio-Anker für Bild 01–21
- Motion-Plan für jeden Bildmoment
- SFX-Plan für jeden visuellen Wechsel
- Quellen und Caption fertig

Offen vor formaler Phase-2-Freigabe:
- `npm test`
- `npm run check:content -- --dir "reels/2026-KW37_07-09_bis_13-09/mittwoch/reel-01_warum-bekommen-wir-schluckauf" --strict`

Diese Prüfungen wurden über den GitHub-Connector nicht ausgeführt und werden deshalb nicht als bestanden markiert.

Phase 2 — Arman: **noch blockiert bis zur strikten Validierung**

Danach:
1. Voice-over aus `01-voice-script/voice-script.txt` erzeugen.
2. `00-bildprompts/99-alle-bildprompts.txt` an Google Flow geben.
3. Bilder strikt seriell Bild 01 → prüfen/benennen/ablegen → Bild 02 → … → Bild 21 erzeugen.

Phase 3 — Antigravity: **blockiert bis Phase 2 komplett ist**.
