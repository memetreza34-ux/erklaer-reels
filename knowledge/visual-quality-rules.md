# Visuelle Qualitäts- und Sicherheitsregeln

## Ziel

Fertige Szenenbilder müssen auf einem Smartphone lesbar bleiben und dürfen durch Untertitel, Plattform-Bedienelemente oder Kamerabewegungen keine wichtigen Inhalte verlieren.

## Technische Bildprüfung

- Zielformat: 1080 × 1920 Pixel im Seitenverhältnis 9:16.
- Mindestauflösung: 720 × 1280 Pixel.
- Unterstützte Formate: PNG, JPG, JPEG und WEBP.
- Bilder mit falschem Seitenverhältnis dürfen nicht unbemerkt in den Schnitt gelangen.
- Cover und Szenenbilder werden getrennt geprüft.

## Sichere Bereiche

- Wichtige Motive und Texte mindestens 6 % vom linken und rechten Rand entfernt halten.
- Oben mindestens 8 % Abstand für Plattform- und Gerätebereiche lassen.
- Unten mindestens 18 % Abstand für Caption, Profilinformationen und Bedienelemente lassen.
- Untertitel stehen normalerweise bei 65–75 % der Bildhöhe.
- In der Untertitelzone dürfen keine unverzichtbaren Bildtexte oder kleinen Details liegen.

## Bewegungssicherheit

- Prüfe das Bild nicht nur im Ausgangszustand, sondern auch mit dem geplanten Zoom und Schwenk.
- Ein Motiv, das durch den End-Zoom abgeschnitten wird, gilt als nicht sicher.
- Bildtext muss während der gesamten Kamerabewegung vollständig lesbar bleiben.
- Bei Konflikten Bewegung reduzieren oder auf `none` setzen.

## Manuelle visuelle Prüfung durch Codex

Codex betrachtet jedes fertige Bild und dokumentiert in `review/visual-inspection.json`:

- `mainSubjectSafe`: Hauptmotiv bleibt in der sicheren Zone.
- `textReadable`: sichtbarer Text ist auf Smartphone-Größe lesbar.
- `textAccurate`: sichtbarer Text stimmt mit der Planung überein und enthält keine Schreibfehler.
- `subtitleCollisionFree`: Untertitelzone kollidiert nicht mit Motiv oder Bildtext.
- `platformUiSafe`: wichtige Inhalte liegen nicht unter typischen Social-Media-Bedienelementen.
- `motionSafe`: Zoom und Schwenk schneiden nichts Wichtiges ab.
- `styleConsistent`: Stil, Figuren und Proportionen passen zum restlichen Reel.

Bei einem nicht bestandenen Punkt wird `status` auf `needs-fix` gesetzt und eine konkrete Notiz ergänzt. Es darf nicht geraten werden.

## Befehl

```bash
npm run check:visuals -- --dir "PFAD-ZUM-REEL"
```

Nach der manuellen Bildprüfung:

```bash
npm run check:visuals -- --dir "PFAD-ZUM-REEL" --strict
```

Der strenge Modus besteht erst, wenn alle Bilder vorhanden, technisch geeignet und manuell als sicher geprüft sind.
