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
- Visual Policy V3
- Cover Policy V1
- jedes Bild unabhängig generieren
- kein vorheriges Bild als Referenz
- Premium-Editorial-Erklärillustration
- sichtbarer Text ausschließlich Deutsch
- keine Hintergrundmusik

## Phase 2

Google Flow in einer frischen Sitzung:

1. `00-bildprompts/google-flow-prompt.txt` vollständig einfügen.
2. Bild 01 separat erzeugen und als Cover + erste Szene prüfen.
3. Bild 02–05 unabhängig erzeugen und prüfen.
4. Danach 06–10, 11–15, 16–20, 21–24.
5. Kein erzeugtes Bild an eine spätere Generierung anhängen.
6. Fertige Bilder als `00-bildprompts/images/Bild NN.png` ablegen.
7. `01-voice-script/voice-script.txt` einmal vollständig vertonen.
8. Finale Stimme als `02-audio/voiceover-final.*` ablegen.

## Phase 3

```bash
npm run phase3:youtube -- --dir "youtube/2026-KW39_21-09_bis_27-09/warum-ist-kaliningrad-von-russland-getrennt"
```

Phase 3 prüft zuerst Themen-Editor/Visual/Cover-Policy, optimiert dann die Stimme auf 1,10x mit erhaltener Tonhöhe, kürzt lange Pausen, entfernt Endstille und misst erst danach die Whisper-Zeitanker.
