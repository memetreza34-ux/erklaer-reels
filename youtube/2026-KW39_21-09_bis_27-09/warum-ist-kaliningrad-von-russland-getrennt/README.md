# Warum ist Kaliningrad von Russland getrennt?

YouTube · ca. 2:30 min · Phase 1 komplett

## Thema

Geschichte + Grenzen + Geografie + Sowjetunion + europäische Nachkriegsordnung.

Der technische Themen-Editor hat das Thema **vor Projekterstellung als `APPROVED_NEW`** eingestuft. Es behandelt nicht erneut Korea, Zeitzonen oder das Römische Reich.

## Produktion

- 442 Wörter Voice-over
- Ziel nach 1,10x/Pausenoptimierung: ca. 150 s
- 24 Videobilder
- Bild 01 = Cover + erste Videoszene + Thumbnail-Quelle
- kein Bild 00
- 16:9
- **Visual Policy V4**
- **Serious Minimal Countryball Explainer**
- Style-ID: `serious-minimal-countryball-explainer-youtube-16x9`
- Cover Policy V1
- Asset Generation Policy V1
- jedes Bild unabhängig aus seinem eigenen Textprompt
- kein vorheriges Bild als Referenz
- keine normalen illustrierten Menschen / keine Stickfiguren / keine realistischen Vollszenen
- sichtbarer Text ausschließlich Deutsch
- keine Hintergrundmusik

Die zuvor erzeugten Premium-Editorial-Bilder gehören zur verworfenen V3-Bildwelt und dürfen für dieses Projekt nicht verwendet werden.

## Phase 2

**Eine komplett frische Google-Flow-Sitzung verwenden.** Die alte Sitzung mit `premium-editorial-explainer-illustration-youtube-16x9` nicht fortsetzen.

1. `00-bildprompts/google-flow-prompt.txt` vollständig einfügen.
2. **Bild 01 exakt dreimal** als temporäre Cover-Kandidaten erzeugen.
3. Genau **einen** Cover-Gewinner auswählen und genau einmal zu `Bild 01.png` umbenennen; die anderen zwei verwerfen.
4. **Bild 02–24 jeweils genau einmal** generieren.
5. Keine manuelle Prüfung und kein Stop nach 02–05, 06–10 usw.; maximal fünf Generierungen gleichzeitig ist nur Parallelitätslogik.
6. Jedes Nicht-Cover-Bild genau einmal auf seinen finalen Namen `Bild NN.png` bringen.
7. Kein erzeugtes Bild an eine spätere Generierung anhängen.
8. Am Ende müssen **exakt Bild 01.png bis Bild 24.png** gemeinsam flach unter `00-bildprompts/images/` liegen — keine Cover-Kandidaten, Varianten, Unterordner, Zusatz-PNGs oder Bild 00.
9. `01-voice-script/voice-script.txt` einmal vollständig vertonen.
10. Finale Stimme als `02-audio/voiceover-final.*` ablegen.

Danach Asset-Gate:

```bash
npm run validate:youtube-phase2 -- --dir "youtube/2026-KW39_21-09_bis_27-09/warum-ist-kaliningrad-von-russland-getrennt"
```

## Phase 3

```bash
npm run phase3:youtube -- --dir "youtube/2026-KW39_21-09_bis_27-09/warum-ist-kaliningrad-von-russland-getrennt"
```

Phase 3 prüft zuerst Themen-Editor/Visual/Cover-/Asset-Policy sowie den finalen Bildordner, optimiert dann die Stimme auf 1,10x mit erhaltener Tonhöhe, kürzt lange Pausen, entfernt Endstille und misst erst danach die Whisper-Zeitanker.
