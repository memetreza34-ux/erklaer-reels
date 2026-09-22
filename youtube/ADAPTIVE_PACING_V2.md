# YouTube Adaptive Pacing V2

Gültig für neue Projekte mit `productionRulesVersion >= 2`.

## Grundidee

Die Bildanzahl wird aus dem Inhalt abgeleitet. **1 Bild = 1 klarer visueller Zweck.**

Neues Bild bei:
- neuem Kerngedanken
- neuem Beispiel
- neuem Ursache→Folge-Schritt
- Wechsel von Epoche, Ort oder Perspektive
- Vergleich A gegen B
- eigenständiger Zahl/Diagramm/Reveal
- zu langem oder inhaltlich überladenem Sprachabschnitt

## A–E-Komplexitätssteuerung

| Klasse | Bildtyp | geplanter Bereich | Standard-Ziel |
| --- | --- | ---: | ---: |
| A | sehr einfach: ein Objekt, ein Symbol, ein klarer Reveal | 4–5 s | 5 s |
| B | einfach: eine klare Szene oder einzelne Aussage | 5–7 s | 6 s |
| C | mittel: mehrere Elemente, Ursache/Folge oder kleiner Vergleich | 7–9 s | 8 s |
| D | komplex: Karte, historische Szene, Diagramm oder mehrere Zusammenhänge | 9–12 s | 10 s |
| E | sehr komplex: mehrere relevante Details oder große Übersicht | 12–15 s | 13 s |

Verbindlich:
- Phase 1 trägt `complexityLevel`, `complexityReason` und `plannedHoldSeconds` ins technische Mapping ein.
- Ein simples A-/B-Bild wird nicht künstlich 10–15 Sekunden gehalten.
- Ist der zugehörige Sprechabschnitt zu lang, wird ein weiterer sinnvoller Bildmoment geplant.
- D-/E-Bilder dürfen länger lesbar bleiben, aber Komplexität darf nicht erfunden werden, um einen langen Hold zu rechtfertigen.
- Phase 3 schneidet trotzdem am tatsächlich gemessenen Audio.

## Globale Timing-Grenzen

- 5–12 s: normal
- 12–14 s: okay bei ruhigen oder komplexen Momenten
- ab 14 s: Split bewusst prüfen
- ab 16 s: starke Split-Prüfung
- >=20,0 s: Hard Fail
- unter 4 s: auf unnötige Hektik prüfen
- unter 2 s: nur begründeter Reveal/Übergang

## Gesamtbildzahl

Es gibt **keine feste Soll-Bildzahl**. Sie ergibt sich aus Skript, visuellen Zwecken und A–E-Komplexität.

## Einfache sichtbare Dateien

Neue V2-Projekte verwenden standardmäßig genau diese menschlich relevanten Produktionsdateien:

```text
00-bildprompts/google-flow-prompt.txt
01-voice-script/voice-script.txt
02-audio/voiceover-final.*
```

Es werden **keine sichtbaren Script- oder Audio-Parts** mehr benötigt. Die technische Unterteilung wird aus `BILD_AUDIO_ZUORDNUNG.json`, den Sprachankern und den gemessenen Wortzeiten intern abgeleitet.

Legacy-Projekte mit mehreren Parts bleiben kompatibel, definieren aber nicht mehr die Struktur neuer Projekte.

## Google Flow: 5 Bilder gleichzeitig

Die 5er-Wellen stehen im **einen Masterprompt** und sind reine Ausführungslogik.

```text
Bild 00 separat

Welle 1: Bild 01–05 gleichzeitig
→ warten
→ prüfen
→ Fehler korrigieren
→ als Bild 01.png bis Bild 05.png ablegen

Welle 2: erst danach Bild 06–10
→ gleicher Ablauf

Welle 3: 11–15
→ usw.
```

Verboten:
- mehr als fünf aktive Generierungen gleichzeitig
- mehrere 5er-Wellen gleichzeitig offen halten
- nächste Welle starten, solange die aktuelle nicht vollständig geprüft ist
- sichtbare 10er-Promptordner nur wegen der Wellenlogik anlegen
- erst alles erzeugen und später gesammelt sortieren

Der letzte Block darf weniger als fünf Bilder enthalten. Bild 00 bleibt separat.

Alle Bilder werden flach unter `00-bildprompts/images/` abgelegt.

## Mapping

`99-technik/BILD_AUDIO_ZUORDNUNG.json` verbindet intern jedes Bild mit:
- `startAnchor`
- `endAnchor`
- `complexityLevel`
- `complexityReason`
- `plannedHoldSeconds`

Legacy-Felder wie `audioPartId`, `scriptPartFile` oder `audioPartFile` dürfen bei alten Projekten noch existieren, sind aber für neue Single-Audio-Projekte nicht erforderlich.

## Phase 3

Neue V2-Projekte verwenden eine finale Voice-over-Datei. Sie wird vollständig mit echten Wortzeitstempeln gemessen. Alle Bildanker werden monoton in diesem einen Wortstrom gefunden.

Falls ein Legacy-Projekt ausschließlich mehrere Audio-Parts besitzt, darf die bestehende Mehrpart-Logik weiterhin verwendet werden.

Normalstart:

```bash
npm run phase3:youtube -- --dir "youtube/<woche>/<thema>"
```

Der V2-Pacing-Check ist Teil dieses Ablaufs.
