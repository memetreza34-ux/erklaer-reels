# PRODUKTIONSPLAN — Was ist Föderalismus?

## Phase 1

- Format: Reel 9:16
- Themenfokus: Politik / Geschichte / Geografie / Systeme
- Bildwelt: `serious-minimal-countryball-explainer`
- Dichte: `adaptive-dense-v2`
- Szenen: 9
- Bildmomente: 20
- Voice-over: 175 Wörter
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
Szene 06 → Bild 11–12
Szene 07 → Bild 13–14
Szene 08 → Bild 15–17
Szene 09 → Bild 18–20
```

Jeder Bildmoment gehört zu genau einem gesprochenen Satz. Keine Bildphase nur zum künstlichen Beschleunigen.

## Bildwelt

Vor Bild 01 muss Flow die feste Serious-Minimal-Countryball-Welt übernehmen. Danach ändert sich nur das Motiv, niemals der Renderstil.

Besonders wichtig bei diesem Reel:
- Countryballs sind hier natürlich passend, weil Bund, Länder und politische Akteure erklärt werden
- Deutschland-Flagge nur beim Bund/Deutschland verwenden
- Bundesländer nicht als winzige Deko-Kugeln aufblasen; Karten, Regionen und Institutionen dürfen die Erklärung tragen
- Karten, Grenzen, Grundgesetz, Bundesrat, Schule, Polizei und Regierungsgebäude als einfache 2D-Requisiten verwenden
- maximal 0–3 Zusatzobjekte pro Bild, aber bewusst mehr Inhalt als nur Kugel + leerer Hintergrund
- keine realistischen Politiker, Menschen oder Parlamente
- keine UI-Infografik-Welt

## Prompt-Qualität

Die Prompts in `00-bildprompts/99-alle-bildprompts.txt` sind bewusst ausführlicher als zuvor:
- konkrete Komposition
- genaue Akteursgröße
- passende Requisiten
- Hintergrundlogik
- gewünschte Aussage
- sichtbarer Text exakt vorgegeben
- klare Negativregeln

Der KI-Agent darf sie nicht verkürzen oder zu generischen Ein-Satz-Prompts zusammenfassen.

## Motion-Plan

```text
Bild 01 → subtle-push-in
Bild 02 → pan-right
Bild 03 → slow-zoom-in
Bild 04 → ken-burns
Bild 05 → pan-left
Bild 06 → subtle-push-in
Bild 07 → pan-right
Bild 08 → slow-zoom-in
Bild 09 → subtle-pull-out
Bild 10 → pan-left
Bild 11 → ken-burns
Bild 12 → pan-right
Bild 13 → subtle-push-in
Bild 14 → slow-zoom-out
Bild 15 → ken-burns
Bild 16 → pan-right
Bild 17 → slow-zoom-in
Bild 18 → subtle-push-in
Bild 19 → pan-left
Bild 20 → slow-zoom-out
```

Jeder einzelne Bildmoment braucht sichtbare dezente Bewegung. `none` ist verboten.

## SFX-Plan

Nur Typen aus der zentralen Sound-Library:

```text
Szene 01 intern → soft-whoosh
Szene 02 rein → soft-swipe | intern → click
Szene 03 rein → soft-impact | intern → paper
Szene 04 rein → soft-whoosh | intern → click
Szene 05 rein → whoosh-up | intern → soft-impact
Szene 06 rein → soft-swipe | intern → click
Szene 07 rein → soft-impact | intern → tick
Szene 08 rein → whoosh-up | intern 1 → click | intern 2 → paper
Szene 09 rein → soft-whoosh | intern 1 → soft-impact | intern 2 → swoosh-reveal
```

SFX später ca. 0,04 s vor dem sichtbaren Cut. Stimme bleibt dominant.

## Phase 2

Arman erzeugt:
- echtes Voice-over
- `Bild 01.png` bis `Bild 20.png`

Flow streng seriell: ein Bild → warten → prüfen → benennen → ablegen → nächstes.

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
