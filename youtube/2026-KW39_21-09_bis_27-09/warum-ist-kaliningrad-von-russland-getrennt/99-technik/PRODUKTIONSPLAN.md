# Produktionsplan — Warum ist Kaliningrad von Russland getrennt?

## Ziel

Deutsches YouTube-Erklärvideo von ungefähr 2,5 Minuten im Kanalgenre Geschichte / Grenzen / Geopolitik.

## Themen-Editor

**Ergebnis vor Projekterstellung:** `APPROVED_NEW`

Geprüft gegen:
- `THEMEN_HISTORIE.md`
- `config/youtube-topic-registry.json`
- vorhandene `youtube/**/99-technik/video.json`

Bei `REVIEW_SIMILAR` oder `BLOCKED_DUPLICATE` darf künftig kein neues Projekt automatisch angelegt werden.

## Titel

**Warum ist Kaliningrad von Russland getrennt?**

Cover-Text: **KALININGRAD: WARUM RUSSISCH?**

## Upload-Metadaten

**YouTube-Titel:**
Warum ist Kaliningrad von Russland getrennt? In 2,5 Minuten erklärt

**Beschreibung:**
Kaliningrad gehört zu Russland, liegt aber zwischen Polen und Litauen und hat keine direkte Landverbindung zum russischen Kernland. Dieses Video erklärt, wie Königsberg nach dem Zweiten Weltkrieg sowjetisch wurde, was Potsdam damit zu tun hatte und warum der Zerfall der Sowjetunion Kaliningrad 1991 zur russischen Exklave machte.

**Tags:**
Kaliningrad, Königsberg, Russland, Ostpreußen, Sowjetunion, Potsdam, Grenzen, Exklave, Geschichte, Geopolitik, Europa, einfach erklärt

## Phase 1

- Themen-Editor bestanden
- Recherche dokumentiert
- 442-Wörter-Skript fertig
- Ziel nach Audiooptimierung: ca. 150 Sekunden
- 24 Bilder nach Inhaltsdichte geplant
- Bild 01 = Cover + erste Videoszene
- kein Bild 00
- 24 monotone Audioanker
- jedes Bild eigener vollständiger Flow-Prompt
- keine Bild-zu-Bild-Referenzen
- Visual Policy V3 / Cover Policy V1
- Premium-Editorial-Stil
- A–E-Komplexität hinterlegt
- SFX selektiv geplant
- Kapitel an Bildnummern gebunden

## Phase 2

Benötigt:

```text
00-bildprompts/google-flow-prompt.txt
01-voice-script/voice-script.txt
```

Flow-Reihenfolge:

```text
Bild 01 separat
02–05 unabhängig
06–10 unabhängig
11–15 unabhängig
16–20 unabhängig
21–24 unabhängig
```

Maximal fünf aktive Generierungen gleichzeitig. Die Wellen sind nur Arbeitslogik, keine Stil- oder Referenzvererbung.

## Audio-Regel

1. Nutzeroriginal unverändert lassen.
2. lange Pausen kürzen.
3. Anfangs-/Endstille bereinigen.
4. internes Produktionsaudio exakt 1,10x, Tonhöhe erhalten.
5. −16 LUFS / max. −1,5 dBTP / 48 kHz.
6. erst danach Whisper-Wortzeiten messen.
7. Timeline daraus bauen.

## Abnahme

Fertig erst wenn:
- Themen-Editor im Phase-1-Gate weiterhin `APPROVED_NEW` liefert
- Bild 01 Cover + Timeline-Start + Thumbnail-Quelle ist
- Bild 01–24 vollständig sind
- keine Bild-zu-Bild-Referenz benutzt wurde
- Bilder individuell, lebendig und szenenspezifisch sind
- deutscher Bildtext korrekt ist
- Audio-Hard-Gate bestanden ist
- Timeline auf echten Wortzeiten basiert
- Pre-/Post-Render-Gates Exit 0 liefern
