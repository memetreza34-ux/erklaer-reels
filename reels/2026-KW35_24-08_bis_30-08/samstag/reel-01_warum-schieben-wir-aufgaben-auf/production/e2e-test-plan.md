# E2E-Produktionstest – Abnahmeplan

## Zweck
Dieser Reel-Durchlauf ist der erste bewusst vollständige Nicht-Länder-Test nach der Workflow-Konsolidierung. Er soll beweisen, dass offene Themenwahl und feste Kugel-Welt gemeinsam funktionieren.

## Phase 1 – jetzt vorbereitet
- neues Reel im nächsten freien Slot
- Nicht-Länder-Thema: Psychologie/Alltag
- 167-Wort-Script, 13 narrative Szenen
- 18 individuell geplante Szenenbilder + Cover
- Quellen-Schema 3 mit offizieller Fachquelle, unabhängiger Meta-Analyse und aktueller Originalstudie
- feste `round-country-characters`-Welt mit neutralen Kugelfiguren
- keine Untertitel, kein Word-Sync
- hochwertige Einzelprompts + serieller Google-Flow-Gesamtprompt

## Phase 2 – externe Assets
1. Google Flow bekommt einmal `00-bildprompts/99-alle-bildprompts.txt`.
2. Flow muss Bild 00 bis Bild 18 streng einzeln erzeugen: nie parallel, nie Batch, erst fertigstellen/benennen/pruefen, dann nächstes Bild.
3. Alle 19 Dateien gemeinsam in den nummerierten Bild-Drop legen.
4. Finales deutsches Voice-over in den Audio-Drop legen.

## Phase 3 – echte Pipeline-Abnahme
- Asset Discovery statt blindem Missing-Status
- visuelle Zuordnung jeder Bildphase anhand Inhalt, Narration, visualIdea und imageText
- Zwei-Pass-Visual-QC für alle 19 visuellen Assets einschließlich Cover
- Audio-Pausenbearbeitung und exakt 1,10x bei erhaltener Tonhöhe
- echte Messung auf −16 LUFS und maximal −1,5 dBTP
- akustisch bestätigte Szenen-Cues; keine geschätzten/fabrizierten Timings
- interne Bildphasen über startPercent auf echte Szenendauer legen und visuell prüfen
- Finalizer + Render-Validator müssen tatsächlich bestehen
- finale MP4 erzeugen und inhaltlich ansehen

## Bestehen
Der E2E-Test gilt erst als bestanden, wenn alle realen Stufen mit echten Assets ausgeführt wurden. Bis dahin bleibt `e2eTest` ausdrücklich auf waiting/pending.
