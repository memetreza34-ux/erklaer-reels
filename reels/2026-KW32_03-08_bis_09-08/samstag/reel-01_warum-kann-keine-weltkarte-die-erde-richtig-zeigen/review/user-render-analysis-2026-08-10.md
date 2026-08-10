# Nutzer-Render-Analyse — 2026-08-10

Analysierter externer Render: `reel-01_warum-kann-keine-weltkarte-die-erde-richtig-zeigen.mp4`.

## Verifizierte technische Beobachtungen

- Dauer des analysierten MP4: ca. **65,9 Sekunden**. Das liegt über dem aktuellen Reel-Ziel von 55–60 Sekunden und deutlich über dem bevorzugten Wert von ungefähr 58 Sekunden.
- Gemessene Audiospur des analysierten MP4: ungefähr **−16,49 LUFS** Integrated Loudness und **−1,45 dBTP** True Peak. Das liegt nahe am Produktionsziel; diese Einzelmessung ersetzt aber nicht die normalen Repo-QC-Gates.
- Untertitel sind in das Video eingebrannt und nicht als separater Subtitle-Stream vorhanden.
- Die sichtbaren Untertitel arbeiten im analysierten Render als statische Textblöcke und nicht als exakt sprecher-synchrone aktive Wortmarkierung.
- Der Nutzer meldet fehlende Sätze bzw. unvollständige Untertitel. Der alte Render darf deshalb nicht als final behandelt werden.

## Gefundene Pipeline-Ursache

Im bisherigen Word-Sync-Pfad konnten akustisch getimte Wörter nach der Szenenzuordnung als `unassignedWords` übrig bleiben, ohne dass diese Zahl in allen nachgelagerten Gates zwingend auf `0` geprüft wurde. Dadurch konnten gesprochene Wörter aus den erzeugten Untertitel-Cues herausfallen.

Die neue Regel verlangt deshalb end-to-end:

```text
coverage === 1
timedWords === totalWords
unassignedWords === 0
```

Zusätzlich muss die vollständige gerenderte Untertitel-Wortfolge exakt der Wortfolge aus `script/voice-script.txt` entsprechen.

## Neuer Untertitelstil

- Grundtext: `#F5F7FA`
- aktuell gesprochenes Wort: `#B7794A`
- Markierung nur anhand echter akustischer Start-/Endzeiten
- keine schwarze Box
- keine Bounce-, Zoom- oder Größenanimation; nur Farbwechsel des aktiven Wortes

## Visuelles Feedback zum analysierten Render

- Die handgezeichnete Editorial-/Kartografie-Bildwelt ist insgesamt konsistent und wirkt erwachsen.
- Mehrere Bilder funktionieren inhaltlich schnell und klar.
- An einzelnen Stellen konkurrieren großer eingebrannter Bildtext und die Untertitel um Aufmerksamkeit.
- In einem späteren Abschnitt wirkt ein sehr großer Cover-artiger Hook erneut verwendet; bei der nächsten visuellen QC prüfen, dass der Cover-Hook nicht versehentlich in spätere Szenen übernommen wurde.

## Nächster echter Produktionsschritt

Der hochgeladene MP4 selbst wird durch diese Repo-Änderung nicht rückwirkend verändert. Für einen korrigierten Render müssen das tatsächliche Voice-over und die Bildassets im lokalen Produktionslauf gefunden/bereitgestellt werden. Danach: Audio-Pacing → Timeline → vollständiger akustischer Word-Sync → 100-%-Abdeckungsprüfung → visuelle QC → Finalizer → Render.
