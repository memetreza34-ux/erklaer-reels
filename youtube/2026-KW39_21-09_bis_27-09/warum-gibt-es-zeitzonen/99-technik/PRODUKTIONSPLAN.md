# Produktionsplan — Warum gibt es Zeitzonen?

## Ziel

Ein deutsches YouTube-Erklärvideo von ungefähr 2 Minuten nach der verbindlichen YouTube-V2-Pipeline.

## Titel

**Warum gibt es Zeitzonen?**

Thumbnail-Text: **WARUM ZEITZONEN?**

## Upload-Metadaten

**YouTube-Titel:**
Warum gibt es Zeitzonen? In 2 Minuten erklärt

**Beschreibung:**
Warum zeigt die Uhr in anderen Ländern eine andere Zeit? Dieses Video erklärt in rund zwei Minuten, wie aus lokaler Sonnenzeit ein weltweites Zeitzonensystem wurde, warum 15 Längengrade ungefähr einer Stunde entsprechen, welche Rolle Greenwich spielt und warum die Datumsgrenze im Pazifik einen Zickzack-Kurs nimmt.

**Tags:**
Zeitzonen, Zeit, Weltzeit, UTC, Greenwich, Nullmeridian, Datumsgrenze, Geografie, einfach erklärt, Wissen

## Phase 1

- Thema auf Duplikate geprüft
- Recherche dokumentiert
- 338-Wörter-Skript fertig
- Ziel nach Phase-3-Audiooptimierung: ca. 120 Sekunden
- 19 Videobilder + 1 Thumbnail geplant
- 19 exakte Startanker im Skript
- neue YouTube-Bildwelt: `premium-editorial-explainer-illustration-youtube-16x9`
- jedes Bild individuell aus eigenem Textprompt
- keine Bild-zu-Bild-Referenzen
- deutscher sichtbarer Text hart gesperrt
- A–E-Komplexität hinterlegt
- SFX selektiv geplant
- Kapitel an Bildnummern gebunden

## Phase 2

Benötigt werden nur:

```text
00-bildprompts/google-flow-prompt.txt
01-voice-script/voice-script.txt
```

Google Flow:

```text
Bild 00 separat
Bild 01 separat aus eigenem Textprompt
Bild 02–05 jeweils unabhängig aus eigenem Textprompt
Bild 06–10 jeweils unabhängig aus eigenem Textprompt
Bild 11–15 jeweils unabhängig aus eigenem Textprompt
Bild 16–19 jeweils unabhängig aus eigenem Textprompt
```

**Nie ein vorheriges Bild als visuelle Referenz anhängen.** Die 5er-Wellen regeln nur, wie viele Generierungen gleichzeitig aktiv sein dürfen.

Qualitätsziel:
- hochwertige moderne 2D-Editorial-Illustration
- eigenständige Komposition pro Bild
- Perspektive/Layout/Hintergrund nicht mechanisch wiederholen
- kein Countryball-Zwang
- keine Stickfiguren
- kein billiger Cartoon-/Clipart-Look
- kein generisches KI-Template

Alle Videobilder danach flach nach:

```text
00-bildprompts/images/Bild NN.png
```

Eine einzige finale Stimme nach:

```text
02-audio/voiceover-final.wav
```

## Phase 3

Normalstart:

```bash
npm run phase3:youtube -- --dir "youtube/2026-KW39_21-09_bis_27-09/warum-gibt-es-zeitzonen"
```

Verbindliche Audio-Reihenfolge:

1. Nutzeroriginal unverändert lassen.
2. lange Pausen kürzen.
3. Anfangs-/Endstille bereinigen.
4. internes Voice-over auf exakt 1,10x beschleunigen, Tonhöhe erhalten.
5. −16 LUFS / max. −1,5 dBTP / 48 kHz.
6. erst danach Whisper-Wortzeiten messen.
7. Bildanker auf diesen echten Zeiten aufbauen.
8. Timeline, Motion, SFX und Render erzeugen.

## Abnahme

Das Video ist erst fertig, wenn:
- Bild 00 und Bild 01–19 vorhanden sind
- kein Bild als visuelle Vorlage für ein späteres Bild verwendet wurde
- jedes Bild eine eigenständige, zum Inhalt passende Komposition besitzt
- alle Bilder die Premium-Editorial-Illustrationsqualität und 16:9 einhalten
- sichtbarer Text ausschließlich Deutsch ist
- genau eine finale Nutzerstimme vorliegt
- 1,10x/Pausen-Audio-Hard-Gate bestanden ist
- alle Startanker real gemessen sind
- FINAL_TIMELINE.json existiert
- Pre-Render- und Post-Render-Gates Exit 0 liefern
- fertige MP4, Thumbnail, Titel, Beschreibung, Kapitel und Tags unter 03-export liegen
