# Visuelle Qualitäts- und Sicherheitsregeln

> Bei Widersprüchen gilt `CURRENT_WORKFLOW.md`.

## Ziel

Fertige Cover- und Szenenbilder müssen auf einem Smartphone sofort verständlich, technisch geeignet, inhaltlich eindeutig dem jeweiligen Bildmoment zugeordnet und sichtbar Teil derselben festen Bildwelt sein.

**Aktive Repo-Bildwelt: `modern-countryball-explainer`.**

Untertitel sind deaktiviert. Es wird **keine Untertitelzone reserviert oder geprüft**.

## Technische Bildprüfung

- Zielformat: 1080 × 1920 Pixel im Seitenverhältnis 9:16
- Mindestauflösung: 720 × 1280 Pixel
- unterstützte Formate: PNG, JPG, JPEG und WEBP
- Bilder mit falschem Seitenverhältnis dürfen nicht unbemerkt in den Schnitt gelangen
- Cover und jede einzelne Bildphase werden separat geprüft

## Feste Stil-QC

Für jedes Bild sichtbar prüfen:

- moderner minimalistischer Countryball-inspirierter Erklärgrafik-Look
- dicke saubere schwarze Konturen
- flacher sauberer 2D-Vektor-/Comic-Look
- runde Kugelfigur, wenn ein Mensch, eine Gruppe, Institution oder ein Land als Akteur dargestellt wird
- einfache weiße expressive Augen und minimale Gesichtselemente
- Länder-/Regionsflaggen nur bei inhaltlich relevanter geografischer Identität; sonst neutrale Kugeln
- reine Objekte/Mechanismen nur in derselben vereinfachten Kontur- und 2D-Formsprache
- ein dominantes Hauptmotiv und wenige Requisiten
- ruhiger einfarbiger oder sanft texturierter Hintergrund
- dezente weiche Schatten, höchstens sehr leichte Textur
- klare visuelle Metapher, möglichst innerhalb ungefähr einer Sekunde verständlich
- keine realistischen Menschen oder Gesichter
- kein Fotorealismus, Anime/Manga, Clay, glänzendes 3D, cinematic realism oder Stockfoto-Look
- kein Stilwechsel zwischen Cover und Szenen oder zwischen Themen

`Bild 00` ist das Cover, aber nicht der alleinige Style-Master. Die globale Style-Bibel `knowledge/fixed-visual-world.md` ist der Style-Master.

## Sichere Bereiche

Die volle 9:16-Komposition wird natürlich genutzt.

- wichtige Motive und eingebrannter Bildtext nicht unnötig direkt an den Rand setzen
- links/rechts ungefähr 6 % Sicherheitsabstand für unverzichtbare Details einplanen
- oben ungefähr 8 % und unten ungefähr 18 % für typische Plattform-UI berücksichtigen, wenn dort kritischer Text oder kleine Details liegen
- **keine künstliche horizontale Untertitelzone** freihalten
- Hauptmotiv darf die Bildmitte normal und groß besetzen
- Cover-/Bildtext muss auf Smartphone-Größe lesbar bleiben

## Sichtbarer Text

Pro Bild gilt eine harte Whitelist:

- `imageText`/Cover-Headline gesetzt → nur exakt dieser **deutsche** lesbare Text ist erlaubt
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
- `plannedGermanTextExact`: exakt geplanter Wortlaut, kein zusätzlicher Text
- `platformUiSafe`: unverzichtbare Details nicht unter typischer Plattform-UI
- `motionSafe`: Bewegung schneidet nichts Wichtiges ab
- `sceneMeaningMatchesNarration`: sichtbarer Inhalt passt zur Narration
- `sceneMatchesVisualIdea`: Bild erklärt die konkrete visuelle Idee
- `oneClearMoment`: ein klar lesbarer Bildmoment statt unverständlicher Überladung
- Stilkonformität mit `modern-countryball-explainer`

### Pass 2
Danach gegen vorherige und nächste Bildphase prüfen:
- ist die Reihenfolge logisch?
- gibt es Verwechslung mit einer Nachbarphase?
- erklärt das Bild wirklich genau diesen Moment?
- bleibt die Bildsprache sichtbar dieselbe?
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
