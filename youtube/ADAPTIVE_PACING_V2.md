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

## A–E-Komplexitätssteuerung — verbindlich für neue Videos

Jeder Bildmoment wird bereits in Phase 1 nach seiner visuellen und gedanklichen Komplexität eingestuft. Die Klasse steuert, wie lange der Zuschauer ungefähr Zeit bekommen soll, bevor zum nächsten Bild gewechselt wird.

| Klasse | Bildtyp | geplanter Bereich | Standard-Ziel |
| --- | --- | ---: | ---: |
| A | sehr einfach: ein Objekt, ein Symbol, ein sehr klarer Reveal | 4–5 s | 5 s |
| B | einfach: eine klare Szene oder eine einzelne Aussage | 5–7 s | 6 s |
| C | mittel: mehrere Elemente, Ursache/Folge oder kleiner Vergleich | 7–9 s | 8 s |
| D | komplex: Karte, historische Szene, Diagramm oder mehrere Zusammenhänge | 9–12 s | 10 s |
| E | sehr komplex: mehrere relevante Details, große Übersicht oder mehrstufiger Zusammenhang | 12–15 s | 13 s |

Verbindliche Planungsregel:
- Phase 1 trägt für jedes Bild `complexityLevel`, `complexityReason` und `plannedHoldSeconds` in `BILD_AUDIO_ZUORDNUNG.json` ein.
- Ein simples A-/B-Bild wird nicht künstlich 10–15 Sekunden gehalten.
- Braucht der zugehörige Sprechabschnitt länger als die sinnvolle Klasse, wird der Inhalt in einen weiteren klaren Bildmoment geteilt.
- Ein komplexes D-/E-Bild darf bewusst länger lesbar bleiben, aber niemals nur deshalb komplex genannt werden, um einen langen Hold zu rechtfertigen.
- Die Klassen bestimmen die **Anchor-Dichte in Phase 1**. In Phase 3 bleibt das tatsächlich gesprochene Audio die exakte Timing-Masterquelle; geschnitten wird am gemessenen nächsten Anchor.

Dadurch rotiert das Bildsystem automatisch schneller bei einfachen Motiven und langsamer bei komplexen Motiven, ohne starre Einheitsdauer.

## Adaptive Bilddauer

- 5–12 s: normal
- 12–14 s: okay bei ruhigen oder komplexen Momenten
- ab 14 s: Split bewusst prüfen
- ab 16 s: starke Split-Prüfung
- >=20,0 s: Hard Fail
- unter 4 s: auf unnötige Hektik prüfen
- unter 2 s: nur begründeter kurzer Reveal/Übergang

Die A–E-Klasse ist die primäre Planungsorientierung; diese globalen Grenzen bleiben das Sicherheitsnetz für die gemessene finale Timeline.

## Gesamtbildzahl

Es gibt **keine feste Soll-Bildzahl**. Sie ergibt sich aus Skript, visuellen Zwecken und A–E-Komplexität. Für 10–12 Minuten sind ungefähr 50–90 Videobilder nur Orientierung. Für kürzere Videos wird genauso individuell geplant.

## Google Flow: 5 Bilder gleichzeitig

Die 10er-Ordner bleiben Produktions-/Dateiblöcke, aber Google Flow arbeitet innerhalb dieser Ordner in **5er-Wellen**.

Beispiel bei Bild 21–30:

```text
Welle 1: Bild 21–25 gleichzeitig
→ warten
→ alle fünf prüfen
→ Fehler korrigieren
→ umbenennen und ablegen
→ Paketcheck 21–25

Welle 2: erst danach Bild 26–30 gleichzeitig
→ gleicher Ablauf
→ abschließender Check 21–30
```

Verboten:
- mehr als fünf aktive Generierungen gleichzeitig
- gesamten 10er-Ordner gleichzeitig generieren
- mehrere 5er-Wellen gleichzeitig offen halten
- nächste Welle starten, solange die aktuelle nicht vollständig geprüft ist
- erst alles erzeugen und später gesammelt sortieren

Der letzte Block darf weniger als fünf Bilder enthalten. Bild 00 bleibt separat.

## Script- und Audio-Parts

Zu jedem 10er-Bildpaket existiert ein Script-Part und später ein Audio-Part. Der letzte Part darf kleiner sein.

```text
01-voice-script/01_part-bilder-01-bis-10.txt
02-audio/01_part-bilder-01-bis-10.<audio>
```

`BILD_AUDIO_ZUORDNUNG.json` verbindet jedes Bild eindeutig mit:
- `audioPartId`
- `scriptPartFile`
- `audioPartFile`
- `startAnchor`
- `endAnchor`
- `complexityLevel`
- `complexityReason`
- `plannedHoldSeconds`

## Phase 3

V2-Audio-Parts werden nicht nach geschätzten Längen verteilt. Jeder Part wird separat mit echten Wortzeitstempeln gemessen. Danach werden die absoluten Zeiten über die chronologischen Part-Offets zusammengesetzt.

Der normale Befehl ist:

```bash
npm run phase3:youtube -- --dir "youtube/<woche>/<thema>"
```

Der V2-Pacing-Check ist Teil dieses Ablaufs.
