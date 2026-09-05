# 02 – Audio — V2

Für neue Projekte mit `productionRulesVersion >= 2` darf und soll das Voice-over **in mehreren Teilen** erzeugt werden. Eine einzige lange Audiodatei ist nicht erforderlich.

Benennung passend zu den Script-Parts:

```text
01_part-bilder-01-bis-10.<audio>
02_part-bilder-11-bis-20.<audio>
03_part-bilder-21-bis-30.<audio>
...
```

Regeln:
- jeder Audio-Part gehört exakt zum gleichnamigen Script-Part
- Part 01 deckt Bild 01–10 ab
- Part 02 deckt Bild 11–20 ab
- usw.
- letzter Part darf weniger als 10 Bilder abdecken
- keine Parts überspringen oder doppelt anlegen
- keine lange führende/abschließende Stille
- Phase 3 setzt die Parts chronologisch zusammen
- zwischen zwei Parts darf keine ungeplante hörbare Pause über 0,25 s entstehen
- echte Bild-Anker werden innerhalb des jeweils richtigen Audio-Parts gemessen

Weitere tatsächlich verwendete Audiodateien müssen klar benannt bleiben.

Details: `youtube/ADAPTIVE_PACING_V2.md`.
