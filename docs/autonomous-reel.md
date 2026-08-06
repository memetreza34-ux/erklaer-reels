# Autonomes neues Reel

Dieser Ablauf gilt bei „Mach ein neues Reel“, „Erstelle das nächste Reel“ und sinngleichen Imperativen. Die Anweisung bedeutet: nächsten freien Produktionstag bestimmen und das vollständige interne Produktionspaket erstellen.

## Ablauf

### 1. Nächsten freien Tag bestimmen

```bash
npm run next:slot -- --json
```

Bereits belegte Tage werden niemals überschrieben.

### 2. Thema auswählen

Das Thema muss zu den erlaubten Säulen passen, sich von vorhandenen Reels unterscheiden, langfristig verständlich sein und sich in 12–14 klaren Bildmomenten erklären lassen.

### 3. Ein-Minuten-Script schreiben

- genau ein deutscher Erzähler
- 155–175 Wörter
- 55–60 Sekunden nach Optimierung auf 1,10x
- sofortige sachliche Hook
- einfache, erwachsene Sprache
- starkes Ende über zwei Szenen: persönliche Prüffrage, danach Lösung und einprägsamer Abschlusssatz

```bash
npm run create:reel -- \
  --title "GEWÄHLTER TITEL" \
  --script-file "PFAD-ZUM-SCRIPT" \
  --next-free \
  --scenes 13
```

### 4. Produktionspaket fertigstellen

Nach `create:reel` sofort `production/agent-task.md` vollständig bearbeiten:

- finales Script und Voice-over-Script
- 12–14 Szenen mit je genau einem klaren Moment
- Cover und vollständige englische Bildprompts
- Prompt-Sammeldatei mit Cover an erster Stelle
- mittiger weißer Untertitelplan ohne Box
- Effektplan mit Hook ohne Übergang und danach nur harten Schnitten
- Caption, Quellen und Statusdateien

```bash
npm run validate:reel -- --dir "PFAD-ZUM-REEL"
npm run check:content -- --dir "PFAD-ZUM-REEL" --strict
```

Alle Fehler werden behoben. Ein leerer Ordner oder eine offene Aufgabenliste ist keine fertige Ausführung.

## Erlaubter Haltepunkt

Codex darf erst anhalten, wenn externe Dateien fehlen: Voice-over, Szenenbilder oder Coverbild. Sind sie vorhanden, arbeitet Codex weiter:

```text
Assets prüfen
→ ursprüngliches Voice-over auf exakt 1,10x, −16 LUFS und −1,5 dBTP verarbeiten
→ Timeline und Audio-Cues synchronisieren
→ Bilder visuell prüfen
→ mittige Untertitel bei 50 % prüfen
→ direkte harte Schnitte prüfen
→ finale Freigabe
→ MP4 rendern
```

Jedes Bild muss natürlich komponiert sein, genau einen klaren Moment zeigen und darf die Hauptperson nicht mehrfach darstellen. Für die mittigen Untertitel wird keine leere Bildzone erzeugt.

## Keine Standardrückfragen

Codex fragt nicht nach Datum, Thema, Szenenzahl oder Bildwelt, solange keine widersprüchliche Vorgabe oder zwingend fehlende externe Information vorliegt.

## Abschlussmeldung

Vor externen Assets bestätigt Codex den gewählten Tag, das vollständige Produktionspaket, die ausgeführte Inhaltsprüfung, die Zahl der Prompts und den nächsten konkreten Schritt. Keine Prüfung als bestanden bezeichnen, wenn sie nicht tatsächlich ausgeführt werden konnte.
