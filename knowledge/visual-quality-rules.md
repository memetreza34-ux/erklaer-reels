# Visuelle Qualitäts- und Sicherheitsregeln

> Bei Widersprüchen gilt `CURRENT_WORKFLOW.md`.

## Ziel

Fertige Cover- und Szenenbilder müssen auf einem Smartphone sofort verständlich, technisch geeignet, stilistisch konsistent und in der festen Kugel-Welt korrekt sein.

Untertitel sind deaktiviert. Es wird **keine Untertitelzone reserviert oder geprüft**.

## Technische Bildprüfung

- Zielformat: 1080 × 1920 Pixel im Seitenverhältnis 9:16
- Mindestauflösung: 720 × 1280 Pixel
- unterstützte Formate: PNG, JPG, JPEG und WEBP
- Bilder mit falschem Seitenverhältnis dürfen nicht unbemerkt in den Schnitt gelangen
- Cover und jede einzelne Bildphase werden separat geprüft

## Kugel-Welt-QC

Für jede anthropomorphe Hauptfigur gilt:

- vollständig runde Kugelform
- Länderrollen mit vereinfachtem Flaggenmuster auf der Kugel
- nicht-länderspezifische Rollen als neutrale Kugeln mit passenden Farben/Symbolen/Requisiten
- einfache weiße Augen; höchstens winzige Arme/Beine
- Karten- oder Länderformen bleiben gesichtslos
- keine menschlichen Köpfe/Torsi als Hauptwelt
- keine map-shaped characters

`Bild 00` ist Style-Master. Folgeframes müssen Papiertextur, Liniengewicht, Palette, Kugelproportionen und Editorial-Finish sichtbar matchen.

## Sichere Bereiche

Die volle 9:16-Komposition wird natürlich genutzt.

- wichtige Motive und eingebrannter Bildtext nicht unnötig direkt an den Rand setzen
- links/rechts ungefähr 6 % Sicherheitsabstand für unverzichtbare Details einplanen
- oben ungefähr 8 % und unten ungefähr 18 % für typische Plattform-UI berücksichtigen, wenn dort kritischer Text oder kleine Details liegen
- **keine künstliche horizontale Untertitelzone** freihalten
- Hauptfigur darf die Bildmitte normal und groß besetzen
- Cover-/Bildtext muss auf Smartphone-Größe lesbar bleiben

## Sichtbarer Text

Pro Bild gilt eine harte Whitelist:

- `imageText`/Cover-Headline gesetzt → nur exakt dieser lesbare Text ist erlaubt
- `imageText` leer → keinerlei lesbarer Text

Immer verboten:
- `BILD 00`, `BILD 01` usw.
- `COVER`
- `SZENE`, `SCENE`
- `BILDPHASE`, `IMAGE PHASE`
- Dateinamen, `DATEINAME`
- `GOOGLE FLOW`, `PROMPT`, technische IDs
- zusätzlicher englischer Text
- Fantasiewörter, Logos oder Wasserzeichen

## Bewegungssicherheit

- Bild nicht nur im Ausgangszustand, sondern auch mit geplantem Zoom/Schwenk prüfen
- ein Motiv, das durch den End-Zoom abgeschnitten wird, gilt als nicht sicher
- Bildtext muss während der gesamten Kamerabewegung vollständig lesbar bleiben
- bei Konflikten Bewegung reduzieren oder auf `none` setzen
- Zoom maximal 8 %, Schwenk maximal 4 %

## Zwei-Pass-Inhaltsprüfung

Die Dateinummer ist nur Routing-Hilfe.

### Pass 1
Für jede Bildphase prüfen und dokumentieren:
- `visibleSummary`: was tatsächlich sichtbar ist
- `mainSubjectSafe`: Hauptmotiv technisch sicher
- `textReadable`: erlaubter Text lesbar
- `textAccurate`: exakt geplanter Wortlaut, kein zusätzlicher Text
- `worldCompliant`: Kugel-Welt-Regeln eingehalten
- `platformUiSafe`: unverzichtbare Details nicht unter typischer Plattform-UI
- `motionSafe`: Bewegung schneidet nichts Wichtiges ab
- `styleConsistent`: Stil und Kugelproportionen passen zu Bild 00
- `semanticMatch`: sichtbarer Inhalt passt zu Narration, `visualIdea`, `imageText` und Prompt

### Pass 2
Danach gegen vorherige und nächste Bildphase prüfen:
- ist die Reihenfolge logisch?
- gibt es Verwechslung mit einer Nachbarphase?
- erklärt das Bild wirklich genau diesen Moment?
- ist der Zusatzbildwechsel inhaltlich sinnvoll?

Unter 0,90 Konfidenz nicht raten und nicht automatisch anwenden. `filename-only` ist verboten.

## Befehl

```bash
npm run check:visuals -- --dir "PFAD-ZUM-REEL"
```

Nach vollständiger tatsächlicher Bildprüfung:

```bash
npm run check:visuals -- --dir "PFAD-ZUM-REEL" --strict
```

Der strenge Modus besteht erst, wenn alle geplanten Bildphasen vorhanden, technisch geeignet und inhaltlich wirklich geprüft sind. Fehlende visuelle Prüfung darf nicht durch Dateinamen oder künstliche `passed: true`-Werte ersetzt werden.
