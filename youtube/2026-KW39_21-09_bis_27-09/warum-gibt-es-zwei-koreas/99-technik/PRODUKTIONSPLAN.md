# Produktionsplan — Warum gibt es zwei Koreas?

## Ziel

Ein deutsches YouTube-Erklärvideo von ungefähr 2,5 Minuten im Kernbereich Geschichte, Grenzen, Staatenbildung und Geopolitik.

## Titel

**Warum gibt es zwei Koreas?**

Cover-Text auf Bild 01: **WARUM ZWEI KOREAS?**

## Upload-Metadaten

**YouTube-Titel:**
Warum gibt es zwei Koreas? Die Teilung in 2,5 Minuten erklärt

**Beschreibung:**
Warum existieren heute Nord- und Südkorea? Dieses Video erklärt in rund zweieinhalb Minuten, wie aus einer zunächst provisorischen Teilung nach dem Zweiten Weltkrieg zwei Staaten entstanden, wie der Kalte Krieg die Grenze verhärtete, warum der Koreakrieg die Teilung festschrieb und weshalb bis heute kein endgültiger Friedensschluss die Trennung beendet hat.

**Tags:**
Nordkorea, Südkorea, Korea, Koreakrieg, Kalter Krieg, 38. Breitengrad, DMZ, Geopolitik, Geschichte, Grenzen, einfach erklärt, Politik

## Phase 1

- Thema auf Duplikate geprüft
- Thema liegt direkt im Kanalfokus
- Recherche und Quellen dokumentiert
- ca. 445-Wörter-Skript fertig
- Ziel nach Phase-3-Audiooptimierung: ca. 150 Sekunden
- 24 Videobilder geplant
- Bild 01 = Cover + erste Videoszene
- kein separates Bild 00
- 24 exakte Startanker im Skript
- aktive YouTube-Bildwelt: `premium-editorial-explainer-illustration-youtube-16x9`
- jedes Bild individuell aus eigenem Textprompt
- keine Bild-zu-Bild-Referenzen
- deutscher sichtbarer Text hart gesperrt
- A–E-Komplexität hinterlegt
- SFX selektiv geplant
- Kapitel an Bildnummern gebunden

## Phase 2

Benötigt werden:

```text
00-bildprompts/google-flow-prompt.txt
01-voice-script/voice-script.txt
```

Google Flow:

```text
Bild 01 separat: COVER + ERSTE VIDEOSZENE
Bild 02–05 jeweils unabhängig
Bild 06–10 jeweils unabhängig
Bild 11–15 jeweils unabhängig
Bild 16–20 jeweils unabhängig
Bild 21–24 jeweils unabhängig
```

**Nie ein vorheriges Bild als visuelle Referenz anhängen.** Die 5er-Wellen regeln nur, wie viele Generierungen gleichzeitig aktiv sein dürfen.

Qualitätsziel:
- hochwertige moderne 2D-Editorial-Illustration
- erwachsener Doku-/Magazin-Look
- eigenständige Komposition pro Bild
- Karten nur dort, wo die Geografie selbst erklärt werden muss
- klare Ursache-Wirkung bei historischen Übergängen
- keine Countryball-Schablone
- keine Stickfiguren
- kein billiger Cartoon-/Clipart-Look
- kein generisches KI-Template
- kein 3D/Pixar/Clay/Anime/Fotorealismus als Standard

Alle Bilder danach flach nach:

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
npm run phase3:youtube -- --dir "youtube/2026-KW39_21-09_bis_27-09/warum-gibt-es-zwei-koreas"
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
9. `THUMBNAIL.png` direkt aus `Bild 01.png` exportieren.

## Abnahme

Das Video ist erst fertig, wenn:
- Bild 01 bis Bild 24 vorhanden sind
- Bild 01 erste Timeline-Szene und Thumbnail-Quelle ist
- kein Bild 00 existiert
- kein Bild als visuelle Vorlage für ein späteres Bild verwendet wurde
- jedes Bild eine eigenständige, zum Inhalt passende Komposition besitzt
- alle Bilder 16:9 und Premium-Editorial-Qualität einhalten
- sichtbarer Text ausschließlich Deutsch ist
- genau eine finale Nutzerstimme vorliegt
- 1,10x/Pausen-Audio-Hard-Gate bestanden ist
- alle Startanker real gemessen sind
- FINAL_TIMELINE.json existiert
- Pre-Render- und Post-Render-Gates Exit 0 liefern
- fertige MP4, Thumbnail, Titel, Beschreibung, Kapitel und Tags unter 03-export liegen
