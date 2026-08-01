# Autonomes neues Reel

Dieser Ablauf gilt immer, wenn der Nutzer sinngemäß schreibt:

- „Mach ein neues Reel.“
- „Erstelle das nächste Reel.“
- „Weiter mit dem nächsten Reel.“
- „Produziere ein neues Video.“

Codex darf diese Anweisung nicht nur als Ordnererstellung verstehen. Sie bedeutet: **den nächsten freien Produktionstag bestimmen und das vollständige interne Produktionspaket erstellen.**

## Verbindlicher Ablauf

### 1. Nächsten freien Tag bestimmen

```bash
npm run next:slot -- --json
```

Das System prüft den neuesten Wochenordner chronologisch von Montag bis Sonntag.

- Der erste Tag ohne `reel-*`-Ordner wird gewählt.
- Ist die neueste Woche vollständig belegt, wird der Montag der nächsten Kalenderwoche gewählt.
- Existiert noch kein Wochenordner, beginnt die Suche am aktuellen Wochentag.
- Bereits belegte Tage werden niemals überschrieben.

### 2. Thema selbstständig auswählen

Codex liest die vorhandenen `reel.json`-Dateien und prüft Titel sowie Themen.

Das neue Thema muss:

- zu den erlaubten Themenbereichen passen
- sich klar von vorhandenen Reels unterscheiden
- langfristig verständlich und nicht nur tagesaktuell sein
- visuell mit 8–12 Bildmomenten erklärbar sein
- eine starke, aber sachliche Hook ermöglichen

Der Nutzer muss nicht nach einem Thema gefragt werden, solange er keine besondere Richtung vorgibt.

### 3. Script erstellen

Codex schreibt selbstständig ein deutsches Voice-over-Script mit genau einem Erzähler.

- ungefähr 35–55 Sekunden
- einfache Sprache
- keine schulische Einleitung
- sofortige Hook
- sachlich und nachvollziehbar
- bei unsicheren Fakten klare Kennzeichnung und Quellen

Das Script wird temporär gespeichert und anschließend verwendet:

```bash
npm run create:reel -- \
  --title "GEWÄHLTER TITEL" \
  --script-file "PFAD-ZUM-SCRIPT" \
  --next-free \
  --scenes 10
```

### 4. Nicht nach der Ordnererstellung stoppen

Nach `create:reel` muss Codex sofort `production/agent-task.md` vollständig bearbeiten.

Pflichtbestandteile:

- finales Script und Voice-over-Script
- vollständige Szenenplanung
- 8–12 englische Bildprompts
- Untertitelplan
- Effektplan mit Hook ohne Übergang und danach ausschließlich direkten Schnitten
- Cover-Idee und Cover-Prompt
- Caption
- Quellen
- aktualisierte Status- und Planungsdateien

Danach zwingend:

```bash
npm run validate:reel -- --dir "PFAD-ZUM-REEL"
npm run check:content -- --dir "PFAD-ZUM-REEL" --strict
```

Alle Fehler werden behoben. Ein leerer Reel-Ordner, ein bloßer Produktionsauftrag oder eine Liste offener Aufgaben ist keine fertige Ausführung.

## Erlaubter Haltepunkt

Codex darf erst anhalten, wenn externe Dateien fehlen:

- Voice-over
- Szenenbilder
- Coverbild

Dann nennt Codex nur:

- den Reel-Ordner
- die Anzahl der Bildprompts
- die gewählte Bildwelt
- welche externen Dateien nun erzeugt werden müssen
- die Inbox-Pfade für Bilder und Audio

Sind externe Dateien bereits vorhanden, arbeitet Codex ohne Rückfrage weiter:

```text
Assets zuordnen
→ Voice-over-Pausen kürzen und Stimme leicht auf 1.05x beschleunigen
→ Timeline und Audio synchronisieren
→ Codex-Wortzeiten eintragen
→ Bilder visuell prüfen
→ direkte harte Schnitte prüfen
→ Abschlussprüfung
→ Renderer prüfen
→ MP4 rendern
```

Dabei sind Crossfades, Schwarzblenden und andere Übergangsanimationen verboten. Das neue Bild muss beim Schnitt sofort vollständig sichtbar sein.

## Keine Rückfragen bei normalen Standardfällen

Codex fragt nicht nach:

- Datum
- Wochentag
- Titel
- Thema
- Anzahl der Szenen
- Bildwelt

Codex entscheidet diese Punkte anhand der Repository-Regeln selbst. Rückfragen sind nur zulässig, wenn der Nutzer widersprüchliche Vorgaben gemacht hat oder eine zwingende externe Information fehlt.

## Abschlussmeldung

Codex meldet niemals nur „Ordner erstellt“.

Vor den externen Assets muss die Meldung bestätigen:

- nächster freier Tag wurde automatisch gewählt
- vollständiges Produktionspaket wurde erstellt
- strenge Inhaltsprüfung wurde ausgeführt
- Anzahl der Bildprompts
- nächster konkreter Schritt
