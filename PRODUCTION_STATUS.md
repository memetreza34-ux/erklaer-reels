# Produktionsstatus

**Status: PRODUKTIONSLOGIK BEREIT — FESTE BILDWELT AKTIV — TECHNISCHER E2E BESTANDEN — GOLDEN-E2E MIT ECHTEN ASSETS AUSSTEHEND**

## Was der E2E-Durchlauf am 2026-08-29 gezeigt hat

Die vollständige Kette wurde einmal durchlaufen: Reel anlegen, Script und alle
Bildprompts ausschreiben, Quellen belegen, Assets zuordnen, Audio-Pacing messen,
Timeline bauen, visuelle Freigabe eintragen, finalisieren und rendern.

Ergebnis: `03-export/FERTIGES-REEL.mp4`, H.264, 1080x1920, 30 fps, 58,75 Sekunden,
AAC-Ton, 9 Szenen, 17 Bilder.

Dabei kamen zwei Blocker ans Licht, die inzwischen behoben sind: Die Inhaltsprüfung
verlangte noch eine leere `visualStyleId` und lehnte damit jedes neue Reel ab, und
der Renderer scheiterte am eigenen Ausgabe-Symlink, weil Remotion beim Bündeln
`realpath` auf jeden Eintrag im Reel-Ordner ruft.

**Noch offen ist der Golden-E2E mit echten Assets:** Bilder aus Google Flow statt
Platzhaltern und ein echtes Voice-over statt eines Testsignals. Erst danach gilt der
Status als vollständig produktionsvalidiert.

## Verbindliche Quelle

`CURRENT_WORKFLOW.md` ist die Single Source of Truth.

## Aktueller Reel-Standard

- 55–60 Sekunden Voice-over
- 155–175 deutsche Wörter
- 8–10 **narrative Szenen**, Standard 9
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

## Bildanzahl — feste Regel

Die alte Gleichsetzung `13 Szenen = 13 Bilder` ist aufgehoben, ebenso die frühere
freie Wahl der Bilddichte.

Es gilt:
- die Hook besitzt genau eine Bildphase
- jede weitere Szene besitzt genau zwei
- eine dritte Bildphase ist nicht vorgesehen
- die Gesamtzahl ergibt sich daraus zwingend: `1 + (Szenen − 1) × 2`

| Szenen | Bilder |
|---|---|
| 8 | 15 |
| 9 | 17 |
| 10 | 19 |

Der zweite Bildmoment einer Szene setzt an einem eigenen `audioCue` aus tatsächlich gesprochenen Wörtern an; `startPercent` wird aus dessen Position in der Narration abgeleitet und steht mindestens 3 Sekunden. `check:content --strict` weist jede Abweichung
für neue Reels als Fehler zurück; Archiv-Reels behalten ihre frühere Struktur.

Technisch:
- `imageCountMode: "one-hook-two-standard"`
- `plannedImageCount`
- `scene.imageCount`
- `scene.imagePhases[]`
- zweiter Prompt als `image-prompt-02.txt`; eine dritte Bildphase ist im aktiven Standard nicht vorgesehen

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
- alle geplanten Bildphasen vorhanden sind
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
- die feste Bildregel wird geplant und exportiert: Hook eins, jede weitere Szene zwei
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
