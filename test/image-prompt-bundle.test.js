# AGENTS.md

`CURRENT_WORKFLOW.md` ist die verbindliche Single Source of Truth. Details der Rollen stehen in `WORKFLOW_PHASEN.md`.

## Neues Reel

Bei „Mach ein neues Reel“ autonom:

1. `THEMEN_HISTORIE.md` prüfen
2. `REEL_THEMENFOKUS.md` prüfen
3. nächsten freien Slot bestimmen
4. Thema aus Politik, Geschichte, Geografie, Ideologien/Systemen oder passender Geopolitik wählen
5. 155–175 deutsche Wörter / 55–60 s / 8–10 Szenen
6. `adaptive-dense-v2`, Ziel 19–24 Bilder je nach Szenenzahl
7. **Serious Minimal Countryball Explainer** (`serious-minimal-countryball-explainer`) für jede Bildphase
8. 1 Bild = 1 gesprochene visuelle Kernaussage
9. Bild↔Audio-Mapping, Motion/SFX, Caption und Quellen fertigstellen
10. Google-Flow-Masterprompt exportieren
11. keine Untertitel, keine Hintergrundmusik
12. Checks nur dann als bestanden markieren, wenn sie tatsächlich ausgeführt wurden

Off-Focus-Themen wie Gesundheit/Psychologie/Alltag nicht autonom wählen, außer der Nutzer verlangt sie ausdrücklich.

## Reel-Bildwelt

- 9:16
- dicke schwarze Konturen
- flache kontrollierte Farben, minimale Schatten
- perfekt runde Countryball-artige Figuren, wenn Akteure sinnvoll sind
- Flaggen/Karten/Grenzen/Institutionen besonders bei Politik/Geografie natürlich nutzen
- 0–3 sinnvolle Zusatzobjekte
- `minimal-symbolic`, `supported-explainer`, `simple-mini-scene` variieren
- keine normalen illustrierten Menschen, realistischen Räume/Hände/Haut, Anime, Clay oder 3D/Pixar
- Prompts Englisch, sichtbarer Text Deutsch
- Bild 01 Headline Pflicht; danach Text optional max. 4 Wörter

YouTube-Regeln niemals auf Reels übertragen.

## Adaptive Dense V2

```text
8 Szenen  → 19–21 Bilder
9 Szenen  → 20–22 Bilder
10 Szenen → 21–24 Bilder
```

- Hook standardmäßig 2 Bildmomente
- spätere Szenen 2 oder 3 nach Inhalt
- min. ca. 2,2 s, häufig 2,5–3,8 s
- ab ca. 4,8 s Split prüfen
- jede interne Bildphase besitzt eigenes gesprochenes `audioCue`

## Phase 3 — Antigravity Simple Mode

Zusätzlich gilt `ANTIGRAVITY_AUTOPILOT.md`.

Wenn der Nutzer sinngemäß „Mach das Reel fertig“, „Phase 3 starten“, „rendern“ oder „mach weiter bis fertig“ sagt, ist der komplette normale nicht-destruktive Lauf freigegeben.

Bevorzugt:

```bash
npm run phase3:reel -- --dir "<reel>"
```

Ablauf:

```text
Assets
→ automatisches Routing Bild 01..NN
→ schneller visueller Einmal-Check
→ Audio
→ auto-align:reel
→ Timeline/Sounds
→ Finalizer
→ Render
→ kurzer Endcheck
```

Keine Routine-Zwischenfragen. Keine schriftliche QC-Begründung pro Bild. Kein zweiter visueller Prüfpass.

Nur bei echten Blockern stoppen: Pflichtasset fehlt/ist kaputt, Bildnummern bleiben unauflösbar mehrdeutig, Voice-over weicht strukturell stark vom Script ab, Nutzeroriginal müsste destruktiv verändert werden oder ein technischer Hard Gate bleibt nach automatischer Reparatur bestehen.

Kleine Anchor-Unschärfen, neu berechenbare Timeline/SFX und kleine Style-Unterschiede selbstständig bearbeiten.

## Nutzerassets schützen

- Nutzerassets sind unveränderliche Originale.
- Nie Assets aus einem **anderen Reel** als Ersatz verwenden.
- Nie mit `mv` zwischen Reels verschieben.
- Nie mit `rm`, `rm -rf`, `git clean`, `git checkout` oder ähnlichem entfernen/zurücksetzen.
- Nie still überschreiben.
- Manuelle Übernahme nur als Kopie.
- Bevorzugt `npm run import:user-asset -- --dir "<reel>" --source "<datei>" --kind images|audio`.

## Motion / SFX

Jeder Bildmoment sichtbar, aber dezent bewegen. Jeder visuelle Wechsel bekommt einen geplanten SFX aus `config/sound-library.json`.

Schnitt-Richtwerte:
- Szene ca. 0,10 s vor neuem Sprachbereich
- intern ca. 0,08 s davor
- SFX ca. 0,04 s vor sichtbarem Cut

## Commits

Normale Phase-3-Produktion braucht keinen Zwischencommit. Wenn Code/Policy geändert oder ein Commit ausdrücklich verlangt wird, `npm test` ausführen. Nicht ausgeführte Tests niemals als bestanden melden.
