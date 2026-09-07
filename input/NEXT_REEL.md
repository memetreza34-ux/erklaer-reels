# Nächstes Reel — 2026-09-07

## Thema

**Warum werden Finger im Wasser runzlig?**

## Phase 1

Fertiges Import-Paket:

```text
input/reel-paket-montag-2026-09-07.json
```

Enthält:
- 9 Szenen
- 17 Bildmomente
- 172 deutsche Narrationswörter
- ca. 58 s geplante Dauer
- Modern Countryball Explainer
- Bild↔Audio-Cues für jede zweite Bildphase
- Motion-Plan
- vollständige Szenen-/Bildwechsel-SFX
- 5 dokumentierte Fach-/Studienquellen
- Universal-Caption

## Import

```bash
npm run import:reel -- --file input/reel-paket-montag-2026-09-07.json --date 2026-09-07
```

Danach die aktiven Hard-Gates aus `CURRENT_WORKFLOW.md` verwenden.

Wichtig: `input/reel-paket.json` bleibt unverändert, damit das ältere Donnerstag-Paket nicht überschrieben wird.
