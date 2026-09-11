# AGENTS.md

`CURRENT_WORKFLOW.md` ist die verbindliche Single Source of Truth. Bei Widersprüchen gilt immer die dort definierte Priorität.

## Drei Produktionsphasen

Phase 1 ChatGPT (Anlegen, Script, Prompts, Motion/SFX) → Phase 2 Arman (Audio, Bilder) → Phase 3 Antigravity (Zuordnung, Sync, QC, Render). Details stehen in `WORKFLOW_PHASEN.md`.

## Antigravity-Autopilot — keine unnötigen Zwischenfragen

Für Phase 3 gilt zusätzlich `ANTIGRAVITY_AUTOPILOT.md`.

Wenn der Nutzer sinngemäß „Mach das Reel fertig“, „Phase 3 starten“, „rendern“ oder „mach weiter bis fertig“ sagt, ist der komplette normale **nicht-destruktive** Phase-3-Lauf freigegeben. Antigravity fragt danach nicht vor jedem einzelnen Routinebefehl erneut um Erlaubnis.

Ohne Zwischenfrage ausführen: Asset-Discovery, sichere Organisation/Kopien, visuelle QC, Audio-Optimierung, Bild↔Audio-Ausrichtung, Sound-Bindung, Timeline, Finalizer, Render-QC, Render und Status-Updates. Eindeutig automatisch behebbaren Fehler zuerst selbst reparieren und den Check wiederholen.

Nur bei echten Blockern stoppen: Reel-Ziel unklar, Pflichtasset fehlt nach vollständiger Suche, destruktiver Eingriff in Nutzeroriginale wäre nötig, Bild-/Audio-Zuordnung bleibt wirklich mehrdeutig, ein Hard Gate lässt sich nicht mit vorhandenen Assets automatisch beheben oder eine externe irreversible/kostenpflichtige Aktion wäre nötig.

Routine-Phase-3 braucht keine Zwischencommits. Kein Commit nur wegen Asset-Suche, Audio-Trim, Timeline oder Render. Wenn wirklich committed wird, bleibt `npm test` vorher Pflicht.

Technischer Fast-Path:

```bash
npm run phase3:reel -- --dir "<reel>"
```

Dieser Lauf ist nicht-interaktiv und stoppt nur bei einem echten fehlgeschlagenen Gate/technischen Fehler. Plattform-/IDE-Sicherheitsdialoge können Repo-Regeln nicht abschalten und müssen weiterhin beachtet werden.

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
5. für jede Bildphase ausschließlich **Modern Countryball Explainer** verwenden
6. für neue Pakete `imageCountMode: "adaptive-dense-v2"` und `visualDensityVersion: 2` setzen
7. Hook mit 2 Bildern planen; spätere Szenen mit 2 oder 3 Bildern je nach gesprochenem Inhalt
8. Ziel: 8 Szenen 19–21 Bilder, 9 Szenen 20–22, 10 Szenen 21–24
9. **ein Bild = eine klare gesprochene visuelle Kernaussage**; komplexe Ursache→Wirkung-/Anatomie-/Technik-/Studienabschnitte gezielt splitten
10. jede interne Bildphase mit eigenem tatsächlich gesprochenem `audioCue` planen
11. lebendige Bildprompts, Motion-Plan, SFX-Plan, Caption und Quellen fertigstellen
12. keine Untertitel erzeugen
13. `check:content --strict` muss Quellen, Bildstruktur sowie Motion-/SFX-Hard-Gate bestehen
14. nach echten Assets Audio/Timeline/QC und Render nur über bestandene Hard-Gates

Legacy-Pakete mit `one-hook-two-standard` bleiben unterstützt. Neue Phase-1-Reels sollen jedoch Adaptive Dense V2 verwenden.

`sync:words` ist für neue Reels **nicht erforderlich** und gehört nicht zum aktiven Workflow.

## Reel-Bildwelt

Reels: ausschließlich **Modern Countryball Explainer** (`modern-countryball-explainer`) in 9:16. YouTube-Regeln niemals auf Reels übertragen.

### World-Lock vor Bild 01

Der KI-Agent muss vor dem ersten Bild die **eine feste Projektwelt** setzen und danach beibehalten. Einzelprompts dürfen Motiv, Handlung, Perspektive und Umgebung verändern, aber niemals Konturstärke, Formsprache, Farbcharakter, grafische Schatten, Detailgrad, 2D-Rendering, Tiefenlogik oder Charakterlogik neu erfinden.

### Kugelfiguren nur mit Funktion

Wenn Akteure vorkommen:
- exakt runde Kugelfiguren ohne separaten menschlichen Kopf
- einfache weiße Augen
- Flaggen nur bei echter geografischer Relevanz
- neutrale Kugeln für allgemeine Akteure
- keine zufälligen Zungen/Grimassen ohne inhaltlichen Grund

Ein Akteur ist **nicht Pflicht**. Objekte, Mechanismen, Anatomie, Karten, Dokumente oder Umgebungen dürfen die Szene allein tragen.

Hard-Guidance:
- keine winzige dekorative Kugel als Stil-Sticker
- Kugel nur, wenn sie Handlung, Reaktion, Vergleich oder Perspektive wirklich verbessert
- wenn Anatomie/Mechanismus/Objekt/Prozess klarer allein erklärt: **keine Kugel hinzufügen**
- wenn eine Kugel vorkommt, muss sie als bewusster Akteur lesbar und nicht zufällig klein sein

### Bildwirkung

Jede Bildphase ist eine konkrete Mini-Szene:
- sichtbare Handlung/Reaktion/Ursache-Folge
- ein Bild = eine visuelle Kernaussage
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

## Bildanzahl und Cue-Timing — Adaptive Dense V2

Für neue Phase-1-Pakete:

```text
8 Szenen  → 19–21 Bilder
9 Szenen  → 20–22 Bilder
10 Szenen → 21–24 Bilder
```

- Hook exakt 2 Bildphasen
- jede weitere Szene 2 oder 3
- dritte Phase nur bei echtem neuen visuellen Gedanken
- harte technische Untergrenze ca. 2,2 s pro Bildphase
- häufig guter Bereich 2,5–3,8 s
- ab ca. 4,8 s aktiv Split prüfen
- jede interne Phase mit eigenem gesprochenem `audioCue`
- finaler interner Cut ca. 0,08 s vor Cue
- Szenencut ca. 0,10 s vor Cue
- keine pauschal gleich langen Bildblöcke

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
- Hook und alle internen Bildphasen bewegen sich ebenfalls
- `none` ist für neue Reels verboten

Bekannte Aliasnamen werden kanonisch aufgelöst; unbekannte Motion-Typen blockieren. Der Renderer besitzt zusätzlich einen Safety-Fallback gegen statische Frames.

## Soundeffekte — Hard Gate

Sounds werden ausschließlich als `type` aus `config/sound-library.json` geplant.

Pflicht:
- jeder Szenenwechsel nach der Hook: SFX
- **jeder** interne Bildwechsel: eigener SFX oder passender Objekt-Sound
- SFX ca. 0,04 s vor dem sichtbaren Cut starten
- typische Lautstärke 0,18–0,30, Standard ca. 0,22
- Stimme bleibt dominant
- `visualEvent` und `reason` Pflicht
- interne SFX über `targetId` an die konkrete Bildphase binden, auch Bildphase 3
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

## Google Flow / KI-Agent

Einzige Nutzerdatei: `00-bildprompts/99-alle-bildprompts.txt`.

Vor Bild 01: globale Bildwelt einmal festsetzen. Danach streng seriell:

```text
World-Lock lesen
→ ein Bild erzeugen
→ warten
→ Inhalt + World-Lock prüfen
→ unnötige Mini-Kugel ablehnen
→ Bild NN.png
→ ablegen
→ prüfen
→ nächstes
```

Keine Queue, kein Batch, keine Parallelgenerierung.

## Quellen-QC

- mindestens zwei echte HTTPS-Quellen
- unterschiedliche Hosts
- mindestens eine Primär-/offizielle oder wissenschaftliche Quelle
- mindestens eine unabhängige Sekundär-/Fachquelle
- konkrete Belegzuordnung

## Phase 3 / Render

Bevorzugt nach der inhaltlichen Bild↔Audio-Ausrichtung den Ein-Kommando-Fast-Path verwenden:

```bash
npm run phase3:reel -- --dir "<reel>"
```

Der Fast-Path führt seriell Asset-Discovery/-Organisation, visuelle QC, Audio-Optimierung, Sound-Bindung, Timeline, Finalizer, Render-Validierung und Render aus. Bei einem echten Hard-Gate-Fehler stoppt er mit Blockermeldung statt interaktiver Zwischenfrage.

Einzelschritte für Diagnose/Reparatur bleiben verfügbar:

```bash
npm run discover:assets -- --dir "<reel>"
npm run organize:assets -- --dir "<reel>" --apply
npm run check:visuals -- --dir "<reel>" --strict
npm run trim:pauses -- --dir "<reel>" --speed 1.10
npm run sync:sounds -- --dir "<reel>" --strict
npm run build:timeline -- --dir "<reel>" --strict
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
