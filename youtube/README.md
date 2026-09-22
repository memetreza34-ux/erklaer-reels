# YouTube

Dieser Bereich ist die eigenständige Produktionspipeline für YouTube-Langvideos. **Reels bleiben vollständig getrennt unter `reels/` und werden durch diese Regeln nicht verändert.**

## Verbindliche Reihenfolge

1. `youtube/YOUTUBE_WORKFLOW.md`
2. `youtube/PHASE3_HARD_GATE.md`
3. `youtube/YOUTUBE_VISUAL_WORLD.md`
4. bei `productionRulesVersion >= 2`: `youtube/ADAPTIVE_PACING_V2.md`

## Drei Phasen

```text
Phase 1 — ChatGPT
→ Thema, Recherche, Titel, Thumbnail/Bild 00, Script, Bildprompts,
  Bild↔Voice-over-Zuordnung, Edit-Plan und Upload-Metadaten

Phase 2 — Nutzer + Google Flow
→ Voice-over und Bilder erzeugen. Videobilder werden in 5er-Wellen produziert.

Phase 3 — Antigravity / Repo-CLI
→ echte Whisper-Wortzeiten messen, Audio-Fingerprints sichern,
  FINAL_TIMELINE automatisch bauen, Gates prüfen, rendern, Post-QC prüfen
```

## Google Flow — ab sofort verbindlich: 5 Bilder gleichzeitig

Die 10er-Ordner bleiben als Dateistruktur bestehen, bestimmen aber **nicht** mehr die Parallelität.

Beispiel für `01_bilder-01-bis-10/`:

```text
Welle A: Bild 01–05 gleichzeitig starten
→ auf ALLE fünf Ergebnisse warten
→ jedes Bild gegen Prompt + Bildwelt prüfen
→ fehlerhafte Bilder innerhalb derselben Welle neu erzeugen
→ alle fünf exakt umbenennen und ablegen
→ prüfen: 01–05 vollständig, keine Lücke, kein Duplikat

Welle B: erst danach Bild 06–10 gleichzeitig starten
→ gleicher Prüfablauf
→ danach den vollständigen 10er-Ordner prüfen
```

Verbindlich:
- maximal **5 aktive Bildgenerierungen gleichzeitig**
- niemals Bild 01–10 oder das komplette Set gleichzeitig starten
- nächste 5er-Welle erst, wenn die vorherige vollständig fertig und geprüft ist
- bei einem fehlerhaften Bild bleibt die aktuelle 5er-Welle offen; die nächste Welle startet noch nicht
- Bildnummerierung global lückenlos
- letzter 5er-Block darf weniger als fünf Bilder enthalten
- Bild 00/Thumbnail bleibt separat und zählt nicht zu den 5er-Wellen

## Bild 00

**Bild 00 ist ausschließlich das Thumbnail.** Es gehört nie in die Videotimeline.

## Audio-Synchronisation

Die finale Stimme ist die Timing-Masterspur. Geschätzte Zeiten oder `Videolänge ÷ Bildanzahl` sind verboten.

Phase 3 verwendet:

```bash
npm run auto-align:youtube -- --dir "youtube/<woche>/<thema>"
npm run build:youtube-timeline -- --dir "youtube/<woche>/<thema>"
```

`auto-align:youtube`:
- transkribiert das echte Audio mit Whisper-Wortzeitstempeln
- sucht jeden `startAnchor` monoton im gesprochenen Wortstrom
- schreibt `actualStartSeconds`, `actualEndSeconds`, `alignmentConfidence`
- bindet die Messung per SHA-256 an die echte Audiodatei
- erzeugt bei V2 aus den Audio-Parts eine interne Master-Audiospur

`build:youtube-timeline` erzeugt daraus `99-technik/FINAL_TIMELINE.json`.

## Ein normaler Phase-3-Start

```bash
npm run phase3:youtube -- --dir "youtube/<woche>/<thema>"
```

Dieser Ablauf führt automatisch aus:
1. echtes Audio-Alignment
2. FINAL_TIMELINE
3. Adaptive-Pacing-V2-Gate (bei V2)
4. Pre-Render-Hard-Gate
5. YouTube-Render
6. Post-Render-Hard-Gate

Nur wenn alle Schritte erfolgreich sind, ist `03-export/FERTIGES-VIDEO.mp4` gültig.

## YouTube-Standard

- 16:9, 1920×1080, 30 fps
- normalerweise 10–12 Minuten
- Bildanzahl nach Inhalt, nicht nach starrer Zielzahl
- V2: ungefähr 50–90 Bilder nur als Orientierung
- meist 5–12 s pro Bild
- ab 14 s bewusst prüfen
- ab 16 s starke Split-Prüfung
- >=20,0 s bei V2 = Hard Fail
- `youtube-editorial-stick-explainer`
- subtile Motion auf jedem Bild
- keine eingebrannten Untertitel standardmäßig
- Hintergrundmusik standardmäßig aus

## Finaler Export

```text
03-export/
├── FERTIGES-VIDEO.mp4
├── THUMBNAIL.png
├── YOUTUBE-TITEL.txt
├── YOUTUBE-BESCHREIBUNG.txt
├── YOUTUBE-KAPITEL.txt
└── YOUTUBE-TAGS.txt
```
