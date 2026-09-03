# AGENTS.md

`CURRENT_WORKFLOW.md` ist die verbindliche Single Source of Truth. Bei Widersprüchen gilt immer die dort definierte Priorität.

## Drei Produktionsphasen

Phase 1 ChatGPT (Anlegen, Script, Prompts, Motion/SFX) → Phase 2 Arman (Audio, Bilder) → Phase 3 Antigravity (Zuordnung, Sync, QC, Render). Details stehen in `WORKFLOW_PHASEN.md`.

## Nutzerassets schützen

- Nutzerassets sind unveränderliche Originale.
- Nie Assets aus einem anderen Reel als Ersatz verwenden.
- Nie per `mv` zwischen Reels verschieben.
- Nie per `rm`, `git clean`, `git checkout` oder ähnlichem entfernen/zurücksetzen.
- Manuelle Übernahme nur als Kopie und ohne stilles Überschreiben.
- Bevorzugt `npm run import:user-asset -- --dir "<reel>" --source "<datei>" --kind images|audio`.

## Pflicht vor jedem Commit

`npm test` ausführen. **Die Suite muss grün sein.** Wer eine Regel ändert, zieht die zugehörigen Tests und Policy-Dateien mit.

Nicht ausgeführte Tests niemals als bestanden melden.

## Neues Reel

Bei „Mach ein neues Reel“ autonom:

1. nächsten freien Slot bestimmen
2. starkes, belegbares Thema wählen
3. 155–175 deutsche Wörter schreiben
4. 8–10 narrative Szenen planen, Standard 9
5. ausschließlich **Modern Countryball Explainer** verwenden
6. Hook 1 Bild, jede weitere Szene 2; Standard 9 Szenen = 17 Bilder
7. lebendige Bildprompts, Motion-Plan, SFX-Plan, Caption und Quellen fertigstellen
8. keine Untertitel
9. `check:content --strict` muss Quellen, Bildstruktur sowie Motion-/SFX-Hard-Gate bestehen
10. nach echten Assets Audio/Timeline/QC und Render nur über bestandene Hard-Gates

## Reel-Bildwelt

Reels: ausschließlich **Modern Countryball Explainer** (`modern-countryball-explainer`) in 9:16. YouTube-Regeln niemals auf Reels übertragen.

Wenn Akteure vorkommen:
- exakt runde Kugelfiguren ohne separaten menschlichen Kopf
- einfache weiße Augen
- Flaggen nur bei echter geografischer Relevanz
- neutrale Kugeln für allgemeine Akteure

Ein Akteur ist nicht Pflicht. Objekte, Mechanismen, Karten, Dokumente oder Umgebungen dürfen die Szene allein tragen.

### Bildwirkung

Jede Bildphase ist eine konkrete Mini-Szene:
- sichtbare Handlung/Reaktion/Ursache-Folge
- ein dominantes Motiv
- wenige unterstützende Elemente
- einfache Tiefe/Umgebung, wenn sinnvoll
- Perspektive zwischen benachbarten Bildern variieren
- keine textdominante Posterkarte
- keine wiederholte Center-Figur-plus-Icons-Komposition

Keine humanoiden Cartoonmenschen, Stick-Figuren, Fotorealismus, Anime, Clay oder glänzendes 3D/Pixar.

## Bildtext

- Prompts Englisch, sichtbarer Text Deutsch.
- Bild 01 braucht eine starke Headline.
- Danach Text optional; wenn vorhanden maximal 4 Wörter.
- Starke textfreie Bilder sind erwünscht.
- `imageText` leer → kein lesbarer Text.

## Bildanzahl und Cue-Timing

```text
Bilder = 1 + (Szenen − 1) × 2
```

- Hook exakt 1 Bildphase
- jede weitere Szene exakt 2
- keine dritte Phase
- mindestens 3 s pro Bildphase
- zweite Phase mit eigenem gesprochenen `audioCue`
- finaler interner Cut ca. 0,08 s vor Cue
- Szenencut ca. 0,10 s vor Cue

## Bewegung/Zoom — Hard Gate

Für neue Reels ab 2026-09-02 gilt: **Jeder Bildmoment bewegt sich sichtbar.** Kein längerer statischer Stillframe.

Kanonische Typen:
- `ken-burns`
- `subtle-push-in`, `subtle-pull-out`
- `slow-zoom-in`, `slow-zoom-out`
- `pan-left`, `pan-right`, `pan-up`, `pan-down`

Richtwerte:
- Zoom 2–4 %
- Pan 1–3 %
- weiches Easing
- Hook und zweite Bildphase bewegen sich ebenfalls
- `none` ist für neue Reels verboten

Bekannte Aliasnamen werden kanonisch aufgelöst; unbekannte Motion-Typen blockieren. Der Renderer besitzt zusätzlich einen Safety-Fallback gegen statische Frames.

## Soundeffekte — Hard Gate

Sounds werden ausschließlich als `type` aus `config/sound-library.json` geplant.

Pflicht:
- jeder Szenenwechsel nach der Hook: SFX
- jeder interne Bildwechsel: eigener SFX oder passender Objekt-Sound
- SFX ca. 0,04 s vor dem sichtbaren Cut starten
- typische Lautstärke 0,18–0,30, Standard ca. 0,22
- Stimme bleibt dominant
- `visualEvent` und `reason` Pflicht
- interne SFX über `targetId` an die Bildphase binden
- interne `audioCue`-Angabe muss zur Bildphase passen
- unbekannte Typen oder fehlende Sounddateien blockieren

`sync:sounds --strict` löst Typen gegen die zentrale Bibliothek auf. Falls ein Zwischenplan das `file`-Feld verliert, kann der Renderer bekannte Typen als Safety-Fallback erneut auflösen.

## Audio-Ende — Hard Gate

- Pausen und Endstille straffen
- 1,10x, Pitch erhalten
- −16 LUFS
- max. −1,5 dBTP
- finales Voice-over darf höchstens 0,25 s Endstille enthalten
- danach ausschließlich 0,5–0,7 s visueller Schluss-Hold, Ziel 0,6 s
- mehrsekündiger stiller Video-Nachlauf ist verboten und blockiert Finalizer/Renderer, auch mit `--force`

## Google Flow

Einzige Nutzerdatei: `00-bildprompts/99-alle-bildprompts.txt`.

Streng seriell: ein Bild → warten → prüfen → `Bild NN.png` → ablegen → prüfen → nächstes. Keine Queue, kein Batch, keine Parallelgenerierung.

## Quellen-QC

- mindestens zwei echte HTTPS-Quellen
- unterschiedliche Hosts
- mindestens eine Primär-/offizielle oder wissenschaftliche Quelle
- mindestens eine unabhängige Sekundär-/Fachquelle
- konkrete Belegzuordnung

## Phase 3 / Render

```bash
npm run trim:pauses -- --dir "<reel>" --speed 1.10
npm run sync:sounds -- --dir "<reel>" --strict
npm run build:timeline -- --dir "<reel>" --strict
npm run check:visuals -- --dir "<reel>" --strict
npm run finalize:reel -- --dir "<reel>" --strict
npm run validate:render -- --dir "<reel>"
npm run render:reel -- --dir "<reel>"
```

Motion/SFX-, Quellen-, Audio-Dateibindungs- und Endstille-Gates dürfen nicht per `--force` umgangen werden.

## Finaler Export

```text
03-export/
├── FERTIGES-REEL.mp4
└── UNIVERSELLE-CAPTION.txt
```
