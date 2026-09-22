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

## Adaptive Bilddauer

- 5–12 s: normal
- 12–14 s: okay bei ruhigen Momenten
- ab 14 s: Split bewusst prüfen
- ab 16 s: starke Split-Prüfung
- >=20,0 s: Hard Fail
- unter 4 s: auf unnötige Hektik prüfen
- unter 2 s: nur begründeter kurzer Reveal/Übergang

## Gesamtbildzahl

Für 10–12 Minuten sind ungefähr 50–90 Videobilder nur Orientierung. Keine feste Sollzahl.

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

## Phase 3

V2-Audio-Parts werden nicht nach geschätzten Längen verteilt. Jeder Part wird separat mit echten Wortzeitstempeln gemessen. Danach werden die absoluten Zeiten über die chronologischen Part-Offets zusammengesetzt.

Der normale Befehl ist:

```bash
npm run phase3:youtube -- --dir "youtube/<woche>/<thema>"
```

Der V2-Pacing-Check ist Teil dieses Ablaufs.
