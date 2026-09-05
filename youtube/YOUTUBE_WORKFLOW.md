# YOUTUBE WORKFLOW — VERBINDLICHE REGEL FÜR LANGVIDEOS

**Stand: 2026-09-05**

Diese Datei ist die verbindliche Regelquelle für den YouTube-Langvideo-Bereich dieses Repositories.

## Priorität

Für YouTube gilt:

1. aktuelle ausdrückliche Nutzeranweisung im laufenden Chat
2. `youtube/YOUTUBE_WORKFLOW.md`
3. `youtube/YOUTUBE_VISUAL_WORLD.md`
4. `THEMEN_HISTORIE.md` für die formatübergreifende Duplicate-Prüfung
5. `CURRENT_WORKFLOW.md` nur für repo-weite Sicherheits- und Qualitätsprinzipien
6. ältere YouTube-Projekte

Reel-spezifische Gestaltungsregeln dürfen nicht ungefragt auf Langvideos übertragen werden.

## Ordnerlogik — verbindlich

Jedes produktive YouTube-Langvideo liegt nach diesem Muster:

```text
youtube/YYYY-KWNN_DD-MM_bis_DD-MM/themen-slug/
```

Beispiel:

```text
youtube/2026-KW36_31-08_bis_06-09/warum-hat-ein-tag-24-stunden/
```

Regeln:
- Die Wochenmappe entspricht Montag bis Sonntag und verwendet dasselbe Namensprinzip wie `reels/`.
- Unter der Woche kommt direkt das Thema als kurzer eindeutiger Slug.
- Es gibt keine `youtube/projects/`-Zwischenebene.
- Es gibt keinen `video-01_`-, `video-02_`- oder ähnlichen Nummernpräfix im Themenordner.
- Mehrere YouTube-Videos derselben Woche liegen als Geschwister-Themenordner in derselben Wochenmappe.
- `youtube/templates/`, `youtube/YOUTUBE_WORKFLOW.md` und `youtube/YOUTUBE_VISUAL_WORLD.md` bleiben globale Infrastruktur und gehören nicht in eine Woche.

Vor jeder neuen Anlage wird zuerst `THEMEN_HISTORIE.md` geprüft und danach die passende Kalenderwoche bestimmt.

## Die drei Produktionsphasen — verbindliche Rollen

### Phase 1 — ChatGPT

**Verantwortlich: ChatGPT.**

ChatGPT baut das komplette Produktionspaket, bevor der Nutzer Bilder oder Audio erzeugt:
- Thema auswählen und gegen `THEMEN_HISTORIE.md` prüfen
- Fakten recherchieren und Quellen dokumentieren
- starken finalen YouTube-Titel festlegen
- Thumbnail-Konzept und `THUMBNAIL-PROMPT.txt` schreiben
- vollständiges deutsches Voice-over-Script für mindestens 10 Minuten schreiben
- 50–80 Bildmomente planen, Standard etwa 60
- jeden Bildprompt auf Englisch und passend zur festen YouTube-Bildwelt schreiben
- Bildprompts in globale Reihenfolge `Bild 01` bis `Bild NN` bringen
- 10er-Paketstruktur anlegen
- Edit-Idee, Motion, SFX, Kapitel und Upload-Metadaten vorbereiten
- Status auf `phase1 complete / phase2 pending` setzen

Phase 1 erzeugt **keine echten Nutzerbilder, kein echtes Voice-over und keinen finalen Render**.

### Phase 2 — Nutzer / Arman

**Verantwortlich: Nutzer.**

Der Nutzer erzeugt die echten Assets:
- Voice-over aus `01-voice-script/voice-script.txt` erzeugen/sprechen
- echte Audiodatei unter `02-audio/` ablegen
- Google-Flow-Bilder strikt in 10er-Paketen erzeugen
- jedes Bild sofort prüfen und korrekt global benennen
- Paket 1 vollständig ablegen, erst dann Paket 2 beginnen usw.
- Thumbnail separat aus `THUMBNAIL-PROMPT.txt` erzeugen und als finales Asset bereitstellen

Bei 60 Bildern:
- Ordner 1 = Bild 01–10
- Ordner 2 = Bild 11–20
- Ordner 3 = Bild 21–30
- Ordner 4 = Bild 31–40
- Ordner 5 = Bild 41–50
- Ordner 6 = Bild 51–60

Phase 2 ist erst fertig, wenn:
- alle erwarteten Bildnummern vorhanden sind
- kein Bild fehlt oder doppelt ist
- die Bilder im richtigen 10er-Ordner liegen
- das finale Voice-over vorhanden ist
- das Thumbnail vorhanden oder eindeutig als noch offen markiert ist

### Phase 3 — Antigravity

**Verantwortlich: Antigravity.**

Antigravity baut aus den echten Assets das fertige YouTube-Video. Es darf keine fehlenden Nutzerbilder erfinden und keine Bilder aus anderen Projekten als Ersatz verwenden.

Reihenfolge:
1. `youtube/YOUTUBE_WORKFLOW.md`, `youtube/YOUTUBE_VISUAL_WORLD.md`, aktuellen `PRODUKTIONSPLAN.md` und `status.json` lesen.
2. Alle 10er-Bildordner vollständig prüfen: erwartete Nummern, keine Duplikate, keine Lücken.
3. Bildinhalte gegen Prompt und Scriptabschnitt prüfen; nicht nur nach Dateinamen vertrauen.
4. Finales Voice-over prüfen und seine echte Dauer bestimmen.
5. Script anhand des echten Voice-overs in Bildabschnitte/Cues aufteilen.
6. Jedes Bild dem passenden gesprochenen Abschnitt zuordnen.
7. Timeline voice-over-getrieben bauen: Bildwechsel nach Inhalt, nicht starr nach gleichen Sekundenwerten.
8. Normalerweise etwa 6–12 Sekunden pro Bild; ruhige Storybilder bis etwa 15 Sekunden, schnellere Erklär-/Vergleichsbilder kürzer.
9. Jedes Bild erhält subtile Bewegung: Push-in, Pull-out, Pan oder Ken-Burns. Keine längeren komplett statischen Frames.
10. Harte saubere Cuts als Standard; keine unnötigen Crossfades oder Effektsprünge.
11. SFX gezielt an sichtbare Ereignisse, Kapitelwechsel, Zahlen-Reveals oder Objekte setzen. Nicht jeder Cut braucht zwingend einen Sound wie bei Reels.
12. Voice-over bleibt deutlich dominant. Keine Meme-Sounds. Hintergrundmusik standardmäßig aus, außer der Nutzer verlangt sie ausdrücklich.
13. Keine automatischen Untertitel in das Bild brennen, außer der Nutzer verlangt sie ausdrücklich.
14. Thumbnail nicht in die Videotimeline einbauen; es bleibt separates Upload-Asset.
15. Finales Video in 16:9 als 1920×1080, 30 fps, H.264 mit sauberem AAC-Audio exportieren.
16. Finale QC durchführen: mindestens 10:00, keine fehlenden Bilder, keine falsche Reihenfolge, keine unnötig langen Standbilder, keine langen stillen Enden, kein schwarzer Rest am Ende, Audio synchron, Bildwelt konsistent.
17. Nur nach bestandener QC `03-export/FERTIGES-VIDEO.mp4` ablegen und `status.json` auf fertig setzen.

**Phase 3 darf nichts als fertig melden, was nicht tatsächlich geprüft oder gerendert wurde.**

## YouTube-Längenstandard

- Neue YouTube-Langvideos sind mindestens 10 Minuten lang.
- Normaler Zielbereich: ungefähr 10–12 Minuten.
- Inhalt wird nicht künstlich gestreckt; wenn mehr Erklärung nötig ist, darf ein Video länger werden.
- Als Startwert sind ungefähr 50–80 Szenenbilder sinnvoll, Standard etwa 60.
- Bildwechsel meist alle 6–12 Sekunden; ein normales Einzelbild sollte in der Regel nicht länger als ca. 15 Sekunden unverändert stehen.
- Jedes Szenenbild erhält dezente Bewegung wie Push-in, Pull-out, Pan oder Ken-Burns, damit keine lange Diashow-Wirkung entsteht.

## Feste YouTube-Bildwelt

Für alle neuen YouTube-Langvideos gilt:

```text
visualStyleId = "youtube-editorial-stick-explainer"
```

Verbindliche Style-Bibel:

```text
youtube/YOUTUBE_VISUAL_WORLD.md
```

Kernmerkmale:
- 16:9
- hand-drawn 2D editorial explainer style
- einfache Stick-Figure-ähnliche Menschen
- runde oder leicht ovale Köpfe
- minimale Gesichtszüge
- klare schwarze Linien
- warme, leicht gedämpfte Farben
- ruhige erzählerische Komposition
- einfache historische, natürliche oder reduzierte Umgebungen
- keine fotorealistischen Menschen
- keine 3D-/Pixar-/Clay-Optik
- keine Countryballs als YouTube-Standard

Prompts werden auf Englisch geschrieben. Sichtbarer Text richtet sich nach der Projektsprache.

## Standardstruktur eines Themenordners

```text
themen-slug/
├── 00-bildprompts/
│   ├── 01_bilder-01-bis-10/
│   ├── 02_bilder-11-bis-20/
│   ├── ... weitere 10er-Pakete nach Bedarf ...
│   ├── 99-alle-bildprompts.txt
│   └── THUMBNAIL-PROMPT.txt
├── 01-voice-script/
│   └── voice-script.txt
├── 02-audio/
├── 03-export/
│   ├── FERTIGES-VIDEO.mp4
│   ├── THUMBNAIL.png
│   ├── YOUTUBE-TITEL.txt
│   ├── YOUTUBE-BESCHREIBUNG.txt
│   ├── YOUTUBE-KAPITEL.txt
│   └── YOUTUBE-TAGS.txt
└── 99-technik/
    ├── PRODUKTIONSPLAN.md
    ├── status.json
    └── video.json
```

## 10-Bilder-Paketregel — verbindlich

YouTube-Szenenbilder werden immer in Arbeitsblöcken von maximal 10 Bildern erzeugt und abgelegt.

Bei 60 Bildern ist die Struktur exakt:

```text
00-bildprompts/
├── 01_bilder-01-bis-10/
├── 02_bilder-11-bis-20/
├── 03_bilder-21-bis-30/
├── 04_bilder-31-bis-40/
├── 05_bilder-41-bis-50/
└── 06_bilder-51-bis-60/
```

Ablauf pro Paket:
1. Nur die nächsten 10 vorgesehenen Bilder bearbeiten.
2. Die Bilder innerhalb dieses Pakets nacheinander in Google Flow erzeugen und prüfen.
3. Dateien eindeutig als `Bild 01.png`, `Bild 02.png` usw. benennen; ab Paket 2 läuft die globale Nummerierung weiter (`Bild 11.png` usw.).
4. Alle 10 korrekt benannten Bilder in den zugehörigen Bereichsordner verschieben.
5. Prüfen, dass genau die erwarteten Bildnummern im Ordner liegen und kein Bild fehlt oder doppelt ist.
6. Erst nachdem das Paket vollständig und sauber abgelegt ist, mit dem nächsten 10er-Paket beginnen.

Wichtig:
- Nicht zuerst 50–80 Bilder erzeugen und erst am Ende sortieren.
- Nicht mehrere 10er-Pakete gleichzeitig offen bearbeiten.
- Bei einem fehlerhaften Bild dieses zuerst ersetzen, bevor das Paket abgeschlossen wird.
- Der letzte Ordner darf weniger als 10 Bilder enthalten, wenn die Gesamtzahl nicht durch 10 teilbar ist.
- Das Thumbnail zählt nicht zu diesen 10er-Paketen und bleibt separat.

## Google Flow

- Szenenbilder 16:9.
- Alle Bilder behalten dieselbe feste YouTube-Bildwelt.
- Bildprompts einzeln und klar formulieren.
- Keine unnötigen Labels oder Untertitel in normalen Szenenbildern.
- Innerhalb eines Pakets seriell arbeiten: ein Bild erzeugen → prüfen → korrekt benennen → nächstes Bild.
- Nach spätestens 10 Bildern Paket abschließen, in den richtigen 10er-Ordner verschieben und erst dann weitermachen.

## Thumbnail

Jedes Video braucht:
- einen finalen Upload-Titel
- ein eigenes Thumbnail-Konzept
- einen fertigen Thumbnail-Prompt
- später ein tatsächliches `03-export/THUMBNAIL.png`

Thumbnail darf stärker, kontrastreicher und fokussierter als normale Szenenbilder sein, bleibt aber in der gleichen Figuren-/Zeichenwelt.

## YouTube-Export

`03-export/` ist der einzige finale Upload-Bereich. Für YouTube-Langvideos gibt es ausdrücklich keine `UNIVERSELLE-CAPTION.txt`.

## Interner Status

`99-technik/status.json` ist die kanonische Statusdatei. Sie muss Phase 1/2/3 mit Verantwortlichem und tatsächlichem Stand abbilden. `99-technik/video.json` enthält die internen Projektmetadaten. Nichts als fertig markieren, was nicht tatsächlich erzeugt oder geprüft wurde.

## Schutz gegen Struktur-Rückfall

Neue Chats und Agenten dürfen nicht:
- `youtube/projects/` wieder als aktive Produktionsstruktur einführen
- Themenordner wieder mit `video-01_`, `video-02_` usw. nummerieren
- Wochenordner überspringen
- die Reel-Bildwelt automatisch auf YouTube übertragen
- den 10-Minuten-Mindeststandard ohne ausdrückliche Nutzerentscheidung wieder auf 5–6 Minuten zurücksetzen
- alle geplanten YouTube-Bilder erst komplett erzeugen und erst danach sortieren
- die 10-Bilder-Paketgrenzen überspringen
- Phase 1/2/3 vermischen
- Antigravity fehlende Nutzerassets erfinden oder aus anderen Projekten übernehmen lassen
- eine `UNIVERSELLE-CAPTION.txt` für YouTube erzeugen
- fehlende Bilder, Audio, Thumbnail oder Renderstatus als fertig melden

Bei Unsicherheit zuerst diese Datei, danach `YOUTUBE_VISUAL_WORLD.md`, `THEMEN_HISTORIE.md` und anschließend `99-technik/status.json` des aktuellen Themenprojekts lesen.
