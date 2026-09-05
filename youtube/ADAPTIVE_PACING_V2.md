# YouTube Adaptive Pacing V2 — NUR FÜR KÜNFTIGE VIDEOS

**Gültig für neue YouTube-Projekte mit `productionRulesVersion >= 2`.**

Das bereits bestehende Projekt
`youtube/2026-KW36_31-08_bis_06-09/warum-hat-ein-tag-24-stunden/`
bleibt unverändert und ist ausdrücklich grandfathered. Diese V2-Regeln dürfen dessen Script, Bildprompts, Audio, Timeline oder Render nicht rückwirkend verändern.

## Grundidee

Die Bildanzahl wird ab V2 **nicht mehr auf eine feste Gesamtzahl wie 60 erzwungen**. Sie entsteht aus dem Inhalt.

Die 10er-Ordner bleiben nur die Produktions-/Dateistruktur. Sie bestimmen nicht, wie viele Bilder ein Kapitel inhaltlich haben darf.

**1 Bild = 1 klarer visueller Zweck.**

Ein neues Bild wird eingeplant, wenn mindestens einer dieser Punkte eintritt:
- neuer Kerngedanke oder neue Behauptung
- neues Beispiel
- neuer Ursache→Folge-Schritt
- Wechsel von Epoche, Ort oder Perspektive
- Vergleich A gegen B
- Zahl/Diagramm/Reveal, das visuell eigenständig erklärt werden muss
- bisheriges Bild müsste zwei oder mehr unterschiedliche Erklärjobs gleichzeitig übernehmen
- der zugehörige Sprachabschnitt wäre sonst sichtbar zu lang oder statisch

Nicht erlaubt: zusätzliche Bilder nur einbauen, um künstlich eine Zielzahl zu erreichen.

## Adaptive Bilddauer

Die Dauer jedes Bildes richtet sich nach Inhalt und echtem Voice-over.

Planungsbereiche:
- **5–12 s:** normaler Zielbereich
- **12–14 s:** für ruhige, einfache oder erzählerische Momente okay
- **ab 14 s:** bewusst prüfen, ob ein zweiter visueller Moment sinnvoll wäre
- **ab 16 s:** starke Split-Prüfung; bei mehr als einem Gedanken muss aufgeteilt werden
- **20,0 s oder länger:** für V2-Projekte **verboten / Hard Fail**
- **unter 4 s:** prüfen, ob der Wechsel wirklich nötig ist und nicht unnötig hektisch wirkt
- **unter 2 s:** normalerweise unzulässig, außer ausdrücklich begründeter sehr kurzer Reveal/Übergang

Es gibt **keinen Zwang**, alle Bilder ähnlich lang zu machen. Gleichmäßige Dauer ist kein Qualitätsziel.

Die Timeline soll sich natürlich an der Informationsdichte orientieren:
- dichter Erklärteil → häufiger Bildwechsel
- ruhiger einfacher Gedanke → längerer Hold möglich
- komplexer Abschnitt → mehr Bilder
- einfacher Abschnitt → weniger Bilder

## Adaptive Gesamtbildzahl

Für 10–12 Minuten sind ungefähr 50–90 Videobilder nur eine **Orientierung**, kein Sollwert.

Phase 1 muss zuerst Script und visuelle Gedanken sauber zerlegen. Erst danach steht die finale Bildzahl fest.

Beispiele:
- 57 Bilder → 6 Pakete, letztes Paket Bild 51–57
- 67 Bilder → 7 Pakete, letztes Paket Bild 61–67
- 83 Bilder → 9 Pakete, letztes Paket Bild 81–83

Die globale Nummerierung läuft immer lückenlos weiter.

## Script wird passend zu den 10er-Bildpaketen aufgeteilt

Der Nutzer muss das lange Voice-over nicht in einer einzigen Datei erzeugen.

Phase 1 erstellt zusätzlich zum vollständigen Master-Script einzelne **Script-Parts**, die exakt zu den Bildpaketen gehören.

Beispiel bei 67 Bildern:

```text
01-voice-script/
├── voice-script.txt                  # vollständiges Master-Script
├── 01_part-bilder-01-bis-10.txt
├── 02_part-bilder-11-bis-20.txt
├── 03_part-bilder-21-bis-30.txt
├── 04_part-bilder-31-bis-40.txt
├── 05_part-bilder-41-bis-50.txt
├── 06_part-bilder-51-bis-60.txt
└── 07_part-bilder-61-bis-67.txt
```

Verbindlich:
- Part 01 enthält ausschließlich den gesprochenen Text für Bild 01–10.
- Part 02 enthält ausschließlich den gesprochenen Text für Bild 11–20.
- usw.
- der letzte Part darf weniger als zehn Bilder enthalten.
- zwischen Parts gibt es **keine Textlücke und keine Textüberlappung**.
- `voice-script.txt` ist exakt die chronologische Zusammensetzung aller Parts.
- kein Satz darf versehentlich in zwei Parts doppelt vorkommen.
- ein Part endet an einer natürlichen Satz-/Gedankengrenze. Falls die 10er-Grenze mitten in einem ungeeigneten Satz läge, muss Phase 1 die Bild-/Satzplanung vorher so anpassen, dass die Grenze sauber wird.

## Phase 2 — Audio ebenfalls pro Part

Der Nutzer erzeugt das Voice-over paketweise:

```text
02-audio/
├── 01_part-bilder-01-bis-10.<audio>
├── 02_part-bilder-11-bis-20.<audio>
├── 03_part-bilder-21-bis-30.<audio>
├── ...
└── NN_part-bilder-XX-bis-YY.<audio>
```

Jede Audiodatei muss zum gleichnamigen Script-Part gehören.

Es ist **nicht erforderlich**, vor Phase 3 eine einzige lange Audio-Datei manuell zu erzeugen.

## Mapping zwischen Bild, Script-Part und Audio-Part

`99-technik/BILD_AUDIO_ZUORDNUNG.json` bekommt für V2 zusätzlich pro Bild:

```json
{
  "imageNumber": 17,
  "audioPartId": 2,
  "scriptPartFile": "01-voice-script/02_part-bilder-11-bis-20.txt",
  "audioPartFile": "02-audio/02_part-bilder-11-bis-20.wav",
  "startAnchor": "...",
  "endAnchor": "..."
}
```

Damit ist für Antigravity eindeutig:
**Bild → Satz/Satzteil → Script-Part → Audio-Part.**

## Phase 3 — mehrere Audio-Parts korrekt zusammensetzen

Antigravity muss bei V2:
1. alle Audio-Parts lückenlos in Part-Reihenfolge erkennen
2. jeden Part gegen seinen Script-Part prüfen
3. überlange führende und abschließende Stille jedes Parts entfernen
4. jeden Bild-Anker **innerhalb des richtigen Audio-Parts** messen
5. die Parts danach chronologisch zu einer Master-Timeline zusammensetzen
6. Part-Grenzen natürlich halten; keine hörbare künstliche Pause erzeugen
7. zwischen zwei Parts keine zusätzliche Stille über 0,25 s zulassen, außer sie ist im Script ausdrücklich dramaturgisch vorgesehen
8. `FINAL_TIMELINE.json` aus den realen Part-Längen + realen Bild-Ankern bauen
9. erst danach rendern

Die absolute Startzeit eines Bildes ergibt sich aus:

```text
Dauer aller vorherigen Audio-Parts
+ lokaler Anchor-Zeitstempel im aktuellen Part
- Cut-Lead
```

Antigravity darf also nie wieder einfach Bildnummern gleichmäßig über die Gesamtlänge verteilen.

## Abschnitts-Pacing

Jeder Script-/Audio-Part wird separat auf Pacing geprüft.

Ein 10er-Part darf nicht automatisch bedeuten, dass jedes Bild ein Zehntel der Part-Dauer bekommt.

Beispiel:

```text
Part 03 / Bild 21–30
Bild 21 = 6,1 s
Bild 22 = 8,4 s
Bild 23 = 5,7 s
Bild 24 = 12,6 s
...
```

Die Unterschiede sind gewollt, wenn sie zum gesprochenen Inhalt passen.

## Harte V2-QC vor Render

Für V2-Projekte muss zusätzlich zum normalen YouTube-Hard-Gate gelten:
- Script-Parts entsprechen exakt den 10er-Bildpaketen
- Audio-Parts sind vollständig und chronologisch
- jedes Bild verweist auf den richtigen Audio-Part
- kein Bildhold >= 20,0 s
- kein Abschnitt wurde künstlich auf gleich lange Holds verteilt
- bei Holds >= 16 s wurde sichtbar geprüft, ob ein Split nötig ist
- Part-Grenzen erzeugen keine lange Stille
- finale Bildzahl entspricht dem Inhalt und nicht einem vorab erzwungenen Sollwert

## Schutz gegen Rückfall

Für `productionRulesVersion >= 2` ist ausdrücklich verboten:
- pauschal immer 60 Bilder planen
- Bildanzahl gleichmäßig auf Kapitel verteilen
- 10er-Pakete als inhaltliches Limit missverstehen
- das gesamte Voice-over zwingend als eine einzige Nutzeraudiodatei verlangen
- einen Script-Part über mehrere Bildpakete laufen lassen
- Audio-Part und Bildpaket falsch koppeln
- ein Bild 20 Sekunden oder länger stehen lassen
- lange Erklärpassagen mit nur einem Bild kaschieren
- komplexe Abschnitte nicht aufzuteilen, nur um die bestehende Bildnummerierung zu behalten

**Diese Regeln gelten nur für neue V2-Projekte. Das bereits vorhandene KW36-Video bleibt unverändert.**
