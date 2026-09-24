# YouTube Adaptive Pacing V2

Gültig für neue Projekte mit `productionRulesVersion >= 2`.

## Grundidee

Die Bildanzahl wird aus dem Inhalt abgeleitet. **1 Bild = 1 klarer visueller Zweck.**

Neues Bild bei neuem Kerngedanken, Beispiel, Ursache→Folge-Schritt, Wechsel von Epoche/Ort/Perspektive, Vergleich, eigenständiger Zahl/Diagramm/Reveal oder einem zu langen Sprachabschnitt.

## Cover Policy V1

Für neue Projekte zählt **Bild 01 normal zur Timeline und ist gleichzeitig das Cover**:
- Bild 01 beginnt bei 0,0 s.
- Bild 01 muss Cover-Hierarchie und ersten gesprochenen Gedanken zusammenführen.
- `THUMBNAIL.png` wird aus Bild 01 exportiert.
- kein separates Bild 00.

## A–E-Komplexitätssteuerung

| Klasse | Bildtyp | Phase-1-Ziel | echter Timeline-Hard-Max |
| --- | --- | ---: | ---: |
| A | sehr einfach: ein Objekt, Symbol, klarer Reveal | 4–5 s | 6,5 s |
| B | einfach: eine klare Szene oder Aussage | 5–7 s | 8,5 s |
| C | mittel: mehrere Elemente, Ursache/Folge, kleiner Vergleich | 7–9 s | 10,5 s |
| D | komplex: Karte, historische Szene, Diagramm, mehrere Zusammenhänge | 9–12 s | 13,5 s |
| E | sehr komplex: große Übersicht mit mehreren relevanten Details | 12–15 s | 16,0 s |

Verbindlich:
- Phase 1 trägt `complexityLevel`, `complexityReason` und `plannedHoldSeconds` ins Mapping ein.
- Ein simples A-/B-Bild wird nicht künstlich lange gehalten.
- Ist der Sprechabschnitt zu lang, wird ein weiterer sinnvoller Bildmoment geplant.
- D-/E-Bilder dürfen länger lesbar bleiben, aber Komplexität darf nicht erfunden werden.
- Phase 3 schneidet am tatsächlich gemessenen Audio.
- Phase 3 prüft zusätzlich die echte Bilddauer gegen den klassenabhängigen Hard-Max.

## Globale Timing-Grenzen

- ab 14 s: Split bewusst prüfen
- ab 16 s: starke Split-Prüfung
- >=20,0 s: globaler Hard Fail
- sehr kurze Bilder: Hektik prüfen

Der klassenabhängige Hard-Max kann früher blockieren als die globale 20-s-Grenze.

## Gesamtbildzahl

Es gibt **keine feste Soll-Bildzahl**. Sie ergibt sich aus Skript, visuellen Zwecken und A–E-Komplexität. Bild 01 ist Teil dieser Zahl.

## Einfache sichtbare Dateien

Neue V2-Projekte verwenden standardmäßig:

```text
00-bildprompts/google-flow-prompt.txt
01-voice-script/voice-script.txt
02-audio/voiceover-final.*
```

**Keine sichtbaren Script- oder Audio-Parts.** Technische Zuordnung liegt unter `99-technik/`.

## Google Flow: 5 Bilder gleichzeitig

Die 5er-Wellen stehen im einen Masterprompt und sind reine Ausführungslogik.

```text
Bild 01 separat: COVER + ERSTE SZENE → prüfen
Welle 1: Bild 02–05 jeweils unabhängig → warten → prüfen → korrigieren → ablegen
Welle 2: erst danach 06–10
Welle 3: 11–15
...
```

Verboten:
- Bild 00 bei neuen Projekten
- mehr als fünf aktive Generierungen gleichzeitig
- mehrere Wellen gleichzeitig offen halten
- nächste Welle vor abgeschlossener Prüfung starten
- sichtbare 10er-Promptordner nur wegen der Wellenlogik
- Bild-zu-Bild-Referenzen

Alle Bilder liegen flach unter `00-bildprompts/images/`.

## Mapping

`99-technik/BILD_AUDIO_ZUORDNUNG.json` verbindet jedes Bild mit `startAnchor`, `endAnchor`, `complexityLevel`, `complexityReason` und `plannedHoldSeconds`. Cover Policy V1 verlangt zusätzlich `coverImageNumber: 1`, `thumbnailImageNumber: 1` und `videoFirstImageNumber: 1`.

Bei Phase 1 benötigt ein neues Single-Audio-Projekt keine sichtbaren oder paketbezogenen Audiofelder. Phase 3 normalisiert intern auf die tatsächlich vorhandene finale Audiodatei.

## Endstille

Whisper liefert den Zeitpunkt des letzten gesprochenen Worts. Ist die verbleibende Audiofahne länger als die konfigurierte Toleranz, wird nur `99-technik/YOUTUBE_AUDIO_MASTER.wav` gekürzt. Die Nutzerdatei bleibt unverändert.

## Motion

Die Standard-Motion `complexity-v1` berücksichtigt A–E automatisch. Komplexere Bilder erhalten ruhigere Bewegungen und mehr Lesbarkeit statt derselben Zoom-Rotation für jedes Bild.

## Phase 3

```bash
npm run phase3:youtube -- --dir "youtube/<woche>/<thema>"
```

Der V2-Pacing-Check mit den realen A–E-Zeiten und die Cover-Policy-Prüfung sind Teil dieses Ablaufs.
