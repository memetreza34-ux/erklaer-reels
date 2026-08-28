# Produktionsstatus

**Status: PRODUKTIONSLOGIK BEREIT — FESTE BILDWELT AKTIV — E2E-PRODUKTIONSTEST AUSSTEHEND**

## Verbindliche Quelle

`CURRENT_WORKFLOW.md` ist die Single Source of Truth.

## Aktueller Reel-Standard

- 55–60 Sekunden Voice-over
- 155–175 deutsche Wörter
- 12–14 **narrative Szenen**, Standard 13
- Hook ab Sekunde 0
- Voice-over exakt 1,10x, Pitch erhalten
- −16 LUFS, max. −1,5 dBTP
- keine Untertitel und kein aktiver Word-Sync
- harte Schnitte
- 0,7 Sekunden Schlussbild-Nachlauf

## Themen und Bildwelt

Die Themenwahl ist offen. Es gibt keine feste Pillar-Quote mehr.

Für alle neuen Reels ist die feste Bildwelt aktiv:

```text
visualWorldMode: fixed
visualStyleId: modern-countryball-explainer
visualStyleReason: "Globale feste Bildwelt für alle neuen Erklär-Reels: moderner minimalistischer Countryball-Erklärstil."
```

Verbindliche Style-Bibel: `knowledge/fixed-visual-world.md`.

Der Stil bleibt über alle Themen identisch: moderner minimalistischer Countryball-inspirierter 2D-Erklärlook, dicke schwarze Konturen, runde Kugelfiguren für Akteure, ruhige einfarbige Hintergründe, wenige Requisiten und eine klare visuelle Metapher. Länderflaggen werden nur verwendet, wenn geografische Identität wirklich relevant ist; allgemeine Themen nutzen neutrale Kugeln oder passende Objekte in derselben Formsprache.

Prompts sind Englisch, sichtbarer Bildtext ist ausschließlich Deutsch.

## Bildanzahl — individuell

Die alte Gleichsetzung `13 Szenen = 13 Bilder` ist aufgehoben.

Ab sofort:
- jede narrative Szene besitzt 1, 2 oder selten 3 Bildphasen
- die Gesamtzahl der Bilder wird pro Reel individuell gewählt
- keine fixe Sollzahl pro Reel
- ein Stillstand von ungefähr 3,5–4 Sekunden ist ein Trigger, eine zweite Bildphase zu prüfen, aber keine automatische Pflicht
- jedes Zusatzbild braucht einen echten Informations-, Fokus- oder Rhythmusgewinn

Technisch:
- `imageCountMode: "individual-per-reel"`
- `plannedImageCount`
- `scene.imageCount`
- `scene.imagePhases[]`
- zusätzliche Prompts als `image-prompt-02.txt`, `image-prompt-03.txt`

## Google Flow

Verbindliche Nutzerdatei:

```text
00-bildprompts/99-alle-bildprompts.txt
```

Der Exporter ergänzt `modern-countryball-explainer` global und zusätzlich direkt vor jedem einzelnen Bildabschnitt. Dadurch bleibt die Bildwelt auch bei komplett unterschiedlichen Themen stabil.

`Bild 01.png` ist die erste Szene und zugleich das Titelbild, aber nicht der alleinige Style-Master. Die globale Repo-Bildwelt ist der Style-Master.

Danach bezeichnet die Nummer die **globale Bildreihenfolge**, nicht automatisch die Szenennummer.

Flow arbeitet nach dem einmaligen Start vollständig selbstständig, aber streng seriell. Zuerst wird genau **ein gemeinsamer Ausgabeordner für das Reel** erstellt. Danach gilt:

```text
genau ein Bild erzeugen
→ vollständig warten
→ gegen den aktuellen Bildprompt und die feste Bildwelt prüfen
→ exakt als Bild NN.png umbenennen
→ in den gemeinsamen Ausgabeordner legen
→ Dateiname und Ablage prüfen
→ erst dann das nächste Bild starten
```

Kein Batch, keine Queue, kein Parallelisieren und keine Mehrfachvarianten. Wenn Umbenennen oder Ablage nicht bestätigt werden kann, stoppt Flow statt weitere Bilder zu erzeugen.

Nach Abschluss liegen alle Bilder gemeinsam in diesem einen Flow-Ordner und werden für den Repo-Import gesammelt nach `00-bildprompts/00-ALLE-BILDER-HIER-REIN/` übernommen.

Der separate `google-flow-controller.txt` ist deaktiviert.

## Sichtbarer finaler Reel-Export

Der einzige sichtbare finale Upload-Bereich ist:

```text
03-export/
├── FERTIGES-REEL.mp4
└── UNIVERSELLE-CAPTION.txt
```

Es gibt keinen separaten sichtbaren Caption- oder Video-Ordner. Die Universal-Caption muss die Regeln aus `UNIVERSAL_CAPTION_POLICY.md` erfüllen und zum konkreten Reel passen.

## Quellen-QC

Neue Reels verwenden Quellen-Schema 3:
- mindestens zwei echte HTTPS-Quellen mit unterschiedlichen Hosts
- vollständige Quellenfelder inklusive `Quellentyp`
- mindestens eine Primär-/offizielle bzw. wissenschaftliche Originalquelle
- mindestens eine unabhängige Sekundär-/Fachquelle
- konkrete Zuordnung unter `Belegt`

Bestehende Schema-2-Reels bleiben rückwärtskompatibel.

## Qualitätsprinzip

Ein Reel ist erst fertig, wenn:
- Script und Quellen tatsächlich geprüft wurden
- alle individuell geplanten Bildphasen vorhanden sind
- jede Bildphase zweifach visuell gegen ihren konkreten Inhalt und Prompt geprüft wurde
- die feste Bildwelt sichtbar eingehalten wird
- das finale Voice-over real gemessen wurde
- narrative Szenen am finalen Audio synchronisiert sind
- interne Bildphasen passend innerhalb der Szenen liegen
- die Universal-Caption vollständig und gültig ist
- Finalizer und Renderer-Prüfung tatsächlich bestanden sind
- die echte MP4 erzeugt wurde
- finale MP4 und Universal-Caption unter `03-export/` verfügbar sind

Nicht ausgeführte Tests oder geplante Produktionsstufen niemals als bestanden melden. Messwerte und Readiness-Reports dürfen niemals künstlich erzeugt oder erzwungen werden.

## Runtime-/E2E-Validierung

Nach Aktivierung der festen Bildwelt muss der nächste vollständige E2E-Test insbesondere prüfen:

- neuer Workspace startet mit `visualStyleId: "modern-countryball-explainer"`
- `config/image-styles.json` und `config/content-rules.json` zeigen dieselbe feste Bildwelt
- individuelle Bildphasen werden korrekt geplant und exportiert
- Google-Flow-Gesamtprompt enthält den globalen Style-Lock und wiederholt ihn direkt vor jedem Bildabschnitt
- Google Flow legt alle seriell erzeugten und korrekt umbenannten Bilder in genau einem gemeinsamen Ausgabeordner ab
- sichtbarer Bildtext bleibt Deutsch; Prompttext bleibt Englisch
- konkrete Themen ändern nur Inhalt, Metapher und ggf. Hintergrundfarbe, nicht die grundlegende Bildsprache
- echte Bilder werden visuell zugeordnet und zweifach gegen konkrete Prompts geprüft
- echtes Voice-over wird verarbeitet, gemessen und als einzige Timeline-Quelle verwendet
- Universal-Caption wird vor dem Render geprüft und zusammen mit der finalen MP4 nach `03-export/` ausgegeben
- Finalizer und Render-Validator blockieren fehlende oder ungeprüfte Voraussetzungen
- finale MP4 wird tatsächlich erzeugt

Erst nach diesem vollständigen Durchlauf darf der Status als vollständig E2E-produktionsvalidiert bezeichnet werden.

## Legacy

`sync:words` gehört nicht zum aktiven Workflow. Historische Word-Sync-Helfer sind nur unter dem expliziten Legacy-Namensraum zulässig. Historische Reel-Bildprompts definieren keine abweichende aktive Bildwelt.

## Infrastruktur

Die GitHub-Actions-CI hatte zuletzt Läufe mit leerer Step-Liste bzw. nicht abrufbaren Logs. Ein grüner CI-Status darf nur gemeldet werden, wenn ein Lauf tatsächlich erfolgreich abgeschlossen wurde.
