# PRODUKTIONSPLAN — Warum ist Gähnen ansteckend?

## Phase 1

- Format: Reel 9:16
- Bildwelt: `modern-countryball-explainer`
- Dichte: `adaptive-dense-v2`
- Szenen: 9
- Bildmomente: 21
- Voice-over: 161 Wörter
- Ziel: ca. 55–60 s
- Untertitel: aus
- Hintergrundmusik: aus
- harte Cuts
- Bildwechsel später am echten Voice-over-Cue, nicht nach gleichmäßigen Sekunden

## Bilddichte

```text
Szene 01 → Bild 01–02
Szene 02 → Bild 03–04
Szene 03 → Bild 05–06
Szene 04 → Bild 07–08
Szene 05 → Bild 09–10
Szene 06 → Bild 11–13
Szene 07 → Bild 14–16
Szene 08 → Bild 17–18
Szene 09 → Bild 19–21
```

Die 3-Bild-Szenen besitzen jeweils drei echte gesprochene Gedanken. Keine zusätzliche Bildphase nur für Tempo.

## World-Lock

Vor Bild 01 muss Flow die eine feste Reel-Welt übernehmen. Danach ändert sich nur das Motiv, niemals der Renderstil.

Besonders wichtig bei diesem Reel:
- Kugelfiguren nur groß und funktional einsetzen
- niemals kleine Kugeln als Deko im Hintergrund
- Hirn-, TMS- und Forschungsbilder dürfen ohne zusätzliche Figur auskommen
- neutrale Kugeln, keine Länderflaggen
- keine neue Medizin-/Labor-Unterwelt
- kein Foto-plus-Cartoon-Mix

## Motion-Plan

- Szene 01: `subtle-push-in`
- Szene 02: `pan-right`
- Szene 03: `slow-zoom-in`
- Szene 04: `ken-burns`
- Szene 05: `subtle-push-in`
- Szene 06: `pan-left`
- Szene 07: `ken-burns`
- Szene 08: `subtle-pull-out`
- Szene 09: `slow-zoom-out`

Jeder einzelne Bildmoment braucht sichtbare dezente Bewegung. `none` ist verboten.

## SFX-Plan

Nur Typen aus der zentralen Sound-Library:

```text
Szene 01 intern → soft-whoosh
Szene 02 rein → soft-swipe | intern → click
Szene 03 rein → soft-impact | intern → tick
Szene 04 rein → soft-whoosh | intern → click
Szene 05 rein → soft-swipe | intern → soft-impact
Szene 06 rein → whoosh-up | intern 1 → click | intern 2 → soft-impact
Szene 07 rein → paper | intern 1 → click | intern 2 → soft-swipe
Szene 08 rein → soft-impact | intern → tick
Szene 09 rein → whoosh-up | intern 1 → soft-whoosh | intern 2 → soft-impact
```

SFX später ca. 0,04 s vor dem sichtbaren Cut. Stimme bleibt dominant.

## Phase 2

Arman erzeugt:
- echtes Voice-over
- `Bild 01.png` bis `Bild 21.png`

Flow-Bilder streng seriell: ein Bild → warten → prüfen → benennen → ablegen → nächstes.

## Phase 3

Antigravity:
1. echte Assets prüfen
2. Voice-over optimieren
3. `BILD_AUDIO_ZUORDNUNG.json` gegen das finale Audio auflösen
4. echte `actualStartSeconds` / `actualEndSeconds` setzen
5. Cuts ca. 0,08 s vor dem jeweiligen Bild-Cue
6. Motion + SFX binden
7. Endstille entfernen; danach nur ca. 0,6 s Schlussbild-Hold
8. QC + finaler Render

Nicht nach pauschaler Bilddauer schneiden.
