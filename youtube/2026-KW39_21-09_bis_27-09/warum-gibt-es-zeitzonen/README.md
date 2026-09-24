# Warum gibt es Zeitzonen?

YouTube-V2-Testprojekt · KW39 2026  
Visual Policy: **V3**

- Format: YouTube Longform
- Zieldauer: ca. 2:00 min nach Audio-Optimierung
- Sprache: Deutsch
- Voice-Skript: 338 Wörter
- Kanalfokus: Länder, Geografie, Grenzen und Territorien + historischer Bezug
- Bildwelt: `premium-editorial-explainer-illustration-youtube-16x9`
- Bilder: 19 Videobilder + Bild 00 als Thumbnail
- Google Flow: maximal 5 aktive Bildgenerierungen gleichzeitig
- Audio Phase 3: lange Pausen kürzen, Endstille entfernen, 1,10x, Pitch erhalten, −16 LUFS, max. −1,5 dBTP

## Vor Google Flow — zwingend

Für dieses Video **eine frische Flow-Sitzung / ein frisches Flow-Projekt verwenden**.

Nicht mit einer alten Sitzung weitermachen, wenn dort noch steht:
- Countryball als YouTube-Stil
- Bild 01 als Master-Style-Frame
- Bild 01 als Referenz für spätere Bilder
- Stickman als aktive Bildwelt

Der aktuelle Masterprompt beginnt mit:

```text
YOUTUBE_VISUAL_POLICY_VERSION: 3
ACTIVE_STYLE_ID: premium-editorial-explainer-illustration-youtube-16x9
```

Vor Übergabe an Flow:

```bash
npm run validate:youtube-phase1 -- --dir "youtube/2026-KW39_21-09_bis_27-09/warum-gibt-es-zeitzonen"
```

## Bildwelt

Dieses Video nutzt hochwertige, lebendige 2D-Editorial-/Dokumentar-Erklärillustrationen:
- erwachsener Magazin-/Infografik-Look
- szenenspezifische Art Direction
- klare visuelle Hierarchie
- geschichtete Tiefe
- bewusstes Licht und kontrollierte Farbpaletten
- jede Illustration erklärt eine Beziehung, Ursache/Wirkung, Bewegung oder räumliche Idee
- keine generische KI-Schablone

## Anti-Lifeless

Ein Bild wird regeneriert, wenn es:
- leer oder steril wirkt
- nur ein kleines Objekt mittig auf leerem Hintergrund zeigt
- wie eine Präsentationskarte/Icon-Collage aussieht
- dieselbe Komposition wie das vorherige Bild wiederholt
- trotz passendem Inhalt keine Tiefe, Richtung, Beziehung oder Spannung zeigt, obwohl der Inhalt das ermöglicht

**Clean ≠ leer. Minimal ≠ leblos.**

## Keine Bildvorlagen

- Bild 01 ist kein Master-Style-Frame.
- Bild 02–19 bekommen Bild 01 nicht als Referenz.
- Kein vorheriges Bild wird an Flow angehängt.
- Jedes Bild entsteht aus seinem eigenen Prompt.
- Konsistenz kommt ausschließlich aus dem geschriebenen Style-Lock.

## Deutsch-Hard-Lock

Jeder sichtbare lesbare Text muss Deutsch sein. Englischer Text oder Pseudo-Schrift = Hard Fail und Regeneration.

## Wellenlogik

`Bild 00 separat → Bild 01 separat → 02–05 einzeln ohne Referenz → prüfen → 06–10 → 11–15 → 16–19`

Die Wellen regeln nur die Anzahl gleichzeitig aktiver Generierungen. Jedes Bild bleibt unabhängig.

## Phase 1 abgeschlossen

Vorbereitet sind:
- Kanalfokus + Duplicate-Check
- Recherche und Quellen
- finaler Titel
- Visual Policy V3
- Session-Reset-Schutz
- Anti-Lifeless-Regeln
- ein Google-Flow-Masterprompt
- vollständiges 338-Wörter-Voice-over-Skript
- 19 individuell art-directete Videobilder
- exakte Textanker für jedes Bild
- A–E-Komplexität
- Motion-/SFX-Plan
- Kapitelplan
- Upload-Metadaten

## Phase 2

1. **Frische Flow-Sitzung öffnen.**
2. aktuellen `00-bildprompts/google-flow-prompt.txt` vollständig verwenden.
3. Bild 00 separat erzeugen.
4. Bild 01 separat aus seinem eigenen Prompt erzeugen.
5. Bilder 02–05 jeweils unabhängig und ohne Referenzbild erzeugen.
6. Danach 06–10, 11–15 und 16–19 genauso.
7. Leblose/sterile oder schablonenhafte Ergebnisse regenerieren.
8. Alle Bilder als `Bild NN.png` unter `00-bildprompts/images/` ablegen.
9. Voice-over unter `02-audio/voiceover-final.*` ablegen.

## Phase 3

```bash
npm run phase3:youtube -- --dir "youtube/2026-KW39_21-09_bis_27-09/warum-gibt-es-zeitzonen"
```

Phase 3 führt zuerst erneut das Visual-Policy-V3-Gate aus. Danach: Audio intern auf 1,10x/Pausenregeln optimieren → Whisper messen → Timeline → Motion/SFX → Render.
