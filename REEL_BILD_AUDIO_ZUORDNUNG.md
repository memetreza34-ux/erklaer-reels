# Reel Bild↔Audio-Zuordnung — vereinfachte Phase-3-Regel

Diese Datei gilt nur für **Reels**. YouTube bleibt unter `youtube/YOUTUBE_WORKFLOW.md` separat.

## Ziel

Für jedes Reel existiert weiterhin:

```text
99-technik/BILD_AUDIO_ZUORDNUNG.json
```

Sie legt vor Phase 2 bereits fest:
- Bildnummer
- Szene/Phase
- exakten `spokenText`-Bereich
- Start-/Endanker
- Reihenfolge

Damit muss Antigravity in Phase 3 **nicht mehr neu entscheiden**, welcher Satz zu welchem Bild gehört.

## Adaptive Dense V2

Für neue Reels sind typischerweise etwa 19–24 Bildmomente vorgesehen, abhängig von 8–10 Szenen. Es gibt keine alte feste 17-Bilder-Regel mehr.

Richtwerte:
- 8 Szenen → 19–21 Bilder
- 9 Szenen → 20–22 Bilder
- 10 Szenen → 21–24 Bilder

Die technische Mindestdauer pro Bildphase liegt bei ca. **2,2 s**, häufig sinnvoll sind etwa 2,5–3,8 s. Die frühere pauschale 3,0-s-Mindestregel ist aufgehoben.

## Phase 1 — ChatGPT

ChatGPT definiert vorab für jeden Bildmoment:

```text
globalImageNumber
visibleImageFileName
sceneId
phaseId
spokenText
startAnchor
endAnchor
existingAudioCue
timingRole
cutLeadSeconds
```

Die Bereiche müssen vollständig, chronologisch und ohne Lücken sein.

## Phase 2 — Nutzer

Der Nutzer erzeugt Voice-over und Bilder. Die Bildnummern bleiben verbindlich:

```text
Bild 01.png
Bild 02.png
...
```

## Phase 3 — Antigravity

Das final optimierte Voice-over ist die Masterspur.

Normaler Simple-Mode:

```text
Voice-over optimieren
→ finale Audiodauer messen
→ BILD_AUDIO_ZUORDNUNG.json lesen
→ auto-align:reel ausführen
→ Timeline bauen
→ finalen Render kurz prüfen
```

Befehl:

```bash
npm run auto-align:reel -- --dir "<reel>"
```

### Was Auto-Alignment macht

Die bereits feste Bild-/Satz-Reihenfolge bleibt unangetastet. Die Startzeiten werden monoton aus der finalen Audiodauer und dem Gewicht der jeweiligen `spokenText`-Bereiche geschätzt. Satzzeichen bekommen kleine Zusatzgewichte, damit natürliche Pausen etwas besser berücksichtigt werden.

Das Ergebnis wird in:
- `BILD_AUDIO_ZUORDNUNG.json`
- `timeline/audio-sync.json`

geschrieben.

Die Methode ist ein **automatischer Grundwert**, kein Grund für Rückfragen.

## Schnittregeln

- Szenencut etwa 0,10 s vor dem Sprachbeginn der neuen Szene
- interner Bildcut etwa 0,08 s vor dem zugeordneten Sprachbeginn
- SFX etwa 0,04 s vor dem sichtbaren Cut
- technische Mindestdauer ca. 2,2 s
- keine starren gleich langen Bildblöcke

## Wann Antigravity nicht fragen soll

Keine Rückfrage, wenn:
- Bildnummern vollständig und eindeutig sind
- Script und Voice-over in derselben Reihenfolge verlaufen
- ein exakter Anchor nicht wortgenau gefunden wird, die chronologische Zuordnung aber klar bleibt
- nur ein einzelner Cut nach dem Auto-Alignment leicht korrigiert werden muss

Dann gilt:

```text
Auto-Alignment verwenden
→ finalen Render ansehen
→ auffällige Cuts selbst korrigieren
→ erneut rendern
```

## Wann wirklich blockieren

Nur wenn:
- ein Bild fehlt oder doppelt ist und die Zuordnung nicht eindeutig lösbar ist
- das Voice-over ganze Sätze auslässt, ergänzt oder stark umstellt
- Bild und `spokenText` offensichtlich nicht zusammenpassen
- die chronologische Reihenfolge nicht mehr rekonstruierbar ist

Dann nicht raten.

## Finale QC

Vor Abschluss reicht ein schneller Endcheck:
- Bildreihenfolge stimmt
- offensichtlicher Satz↔Bild-Bezug stimmt
- kein Cut fällt sichtbar grob zu früh oder zu spät
- kein langer statischer oder schwarzer Nachlauf
- Audio bleibt dominant

Die Mapping-Datei bleibt die Brücke **Script → Bild → Audio → Timeline**, aber Phase 3 soll sie automatisch nutzen statt jeden einzelnen Anchor mit dem Nutzer zu diskutieren.
