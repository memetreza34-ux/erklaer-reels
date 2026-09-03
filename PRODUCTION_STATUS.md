# Produktionsstatus

**Status: PRODUKTIONSLOGIK GEHÄRTET — MOTION/SFX/ENDSTILLE ALS HARD GATES — GOLDEN-E2E MIT ECHTEN ASSETS NOCH AUSSTEHEND**

`CURRENT_WORKFLOW.md` ist die verbindliche Single Source of Truth.

## Historischer technischer E2E

Am 2026-08-29 wurde die vollständige technische Kette einmal mit Testassets durchlaufen: Workspace → Script/Prompts → Quellen → Assets → Audio-Pacing → Timeline → visuelle Freigabe → Finalizer → Render. Dabei entstand eine 1080x1920-H.264-MP4 mit 9 Szenen und 17 Bildern.

Dieser Lauf beweist die technische Grundkette, aber **nicht** den heutigen Qualitätsstandard mit echten Bildern, echter Stimme, verpflichtender Motion/SFX-Coverage und Endstille-Gate.

## Feedback-Härtung 2026-09-03

Ein realer Reel-Export zeigte drei systemische Probleme, die für zukünftige Reels nicht mehr durchrutschen dürfen:

1. einzelne Bildphasen konnten statisch bleiben, wenn nicht-kanonische Motion-Namen verwendet wurden
2. geplante SFX konnten im Weg Effektplan → Timeline → Renderplan ihr `file` verlieren und dadurch vom Renderer übersprungen werden
3. eine lange stille Audio-Fahne konnte die Videodauer unnötig um mehrere Sekunden verlängern

Dafür wurden zusätzliche technische Sicherheitsstufen eingebaut.

## Aktueller Pflichtstandard

- 55–60 s Voice-over
- 155–175 deutsche Wörter
- 8–10 Szenen, Standard 9
- Hook 1 Bild, jede weitere Szene 2
- 9 Szenen = 17 Bilder
- Modern Countryball Explainer
- keine Untertitel
- keine Hintergrundmusik
- 1,10x Voice-over
- −16 LUFS / max. −1,5 dBTP
- Szenencut ca. 0,10 s vor Cue
- interner Bildcut ca. 0,08 s vor Cue
- SFX ca. 0,04 s vor Cut
- visueller Schluss-Hold 0,5–0,7 s, Ziel 0,6 s

## Motion-Hard-Gate

Für neue Reels ab 2026-09-02 muss **jeder Bildmoment sichtbar bewegt sein**.

- kanonische Motion-Typen aus `config/effects-rules.json`
- Zoom meist 2–4 %
- Pan 1–3 %
- Hook bewegt sich ebenfalls
- zweite Bildphasen bewegen sich ebenfalls
- `none` blockiert neue Reels
- bekannte ältere Aliasnamen werden kanonisch aufgelöst
- unbekannte Motion-Typen blockieren
- Renderer besitzt zusätzlich einen Motion-Fallback gegen statische Frames

## SFX-Hard-Gate

- jeder Szenenwechsel ab Szene 2 braucht SFX
- jeder interne Bildwechsel braucht eigenen zielgebundenen SFX
- ausschließlich Typen aus `config/sound-library.json`
- `sync:sounds --strict` bindet Typen an echte Dateien
- unbekannte Typen und fehlende Library-Dateien blockieren
- Renderer besitzt einen Safety-Fallback Typ → kanonische SFX-Datei, falls ein Zwischenplan das `file`-Feld verliert
- typische SFX-Lautstärke 0,18–0,30

## Audio-Endstille-Hard-Gate

Das finale Voice-over darf höchstens **0,25 s Endstille** enthalten. Mehrsekündige Audio-Fahnen werden nicht als normale Videodauer akzeptiert.

`trim:pauses` entfernt Endstille bereits aktiv. Zusätzlich messen Finalizer und Renderer die finale Voice-over-Datei erneut. Erst danach wird der separate visuelle Schluss-Hold angehängt.

## Mehrfach abgesicherte Einstiegspfade

Die neuen Regeln sind nicht nur Dokumentation:

- `check:content --strict` → Motion-/SFX-Coverage
- `build:timeline --strict` → Motion-/SFX-Coverage + Soundbibliothek
- `finalize:reel` / `finalizeReel()` → Motion/SFX + Soundbibliothek + Endstille
- `validate:render` / `render:reel` / `renderReel()` → dieselben Gates erneut

`--force` darf diese zentralen Gates nicht umgehen.

## Noch offen

Ein neuer **Golden-E2E mit echten aktuellen Assets** muss nach diesen Änderungen tatsächlich durchgeführt werden:

1. neues Reel importieren/anlegen
2. echte Google-Flow-Bilder
3. echtes Voice-over
4. `trim:pauses`
5. `sync:sounds --strict`
6. echte Cue-Synchronisierung
7. Motion-/SFX-/Visual-QC
8. Finalizer
9. Render
10. finale MP4 technisch und sichtbar prüfen

Erst wenn dieser Durchlauf tatsächlich bestanden ist, darf der neue Stand als vollständig produktionsvalidiert bezeichnet werden.

## Teststatus

Repo-Änderungen enthalten zusätzliche Regressionstests für Motion/SFX und Endstille. **Die vollständige `npm test`-Suite ist nach den neuesten Änderungen noch nicht als ausgeführt/grün bestätigt.** Nicht ausgeführte Tests werden nicht als bestanden gemeldet.
