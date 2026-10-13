# Google Flow: verbindliche 5er-Gruppen für neue Weltlogik-Langvideos

**Gültig für NEUE Projekte ab dem 13.10.2026 mit `flowBatchPolicyVersion: 1`.** Frühere Videoprojekte, Reel-Pipeline, fertige Bildprompts und vorhandene Assets werden nicht rückwirkend verändert. Die Bildzahl selbst bleibt **inhaltlich adaptiv**; nur die technische Gruppengröße ist fünf.

## Ablauf — ohne fehlende Bilder

1. **Zuerst Cover**: Drei Kandidaten erstellen, den besten auswählen und als `03-export/THUMBNAIL.png` ablegen, **nicht** in `images/` und **nicht** als Bild 01.
2. **Erste feste Gruppe:** Ausschließlich `Bild 01` bis `Bild 05` gleichzeitig starten (maximal fünf Generierungen). Alle fünf Ergebnisse abwarten. Ein „45 %“-Platzhalter, fehlgeschlagener Flow-Job oder nur sichtbare Kachel **zählt nicht als fertige Bilddatei**.
3. **VOR dem Benennen** nachsehen: Sind tatsächlich alle fünf **downloadbaren Dateien** vorhanden? Entsprechen sie jeweils ihren expliziten Bildprompts? Eine eindeutige Quell-Datei-zu-Nummer-Liste anlegen. Niemals blind nach Zeitstempel, Finder-Reihenfolge oder Flow-Kachelposition nummerieren.
4. **Fehlt eines:** Genau dieses Bild nochmals mit dem zugehörigen Prompt erzeugen. Gruppe **nicht** als abgeschlossen melden und **nicht** mit Bild 06 anfangen. Bereits vorhandene Bilder nicht unnötig wiederholen.
5. **Erst nach allen fünf:** Ganze Gruppe **kontrolliert benennen/kopieren** als `Bild 01.png` bis `Bild 05.png` in `00-bildprompts/images/`. Ursprungsdateien bleiben erhalten. Kein stilles Überschreiben.
6. **Noch einmal dieselben fünf prüfen:** Sind die richtigen Bildnummern wirklich im finalen Ordner, eindeutige Dateien, 16:9-PNG, ohne falsch benannte oder zusätzliche Dateien? Erst wenn dieser Check grün ist, `Bild 06`–`Bild 10` beginnen. Danach `11`–`15` usw.
7. **Letzte Gruppe:** Bei 64 Bildern z. B. `61`–`64` als Gruppe aus **vier** Bildern abschließen. Keine künstliche Bild 65.
8. **Unabhängige Gesamtprüfung:** Nach dem letzten Bild alle erwarteten Nummern von 01 bis NN einmal **komplett** prüfen: lückenlos, genau ein korrekter Name je Nummer, keine fremden Zusatzdateien, keine binär duplizierten Dateien, Cover separat, genau ein flacher finaler Bilderordner. Fehlende/falsch zugeordnete Szenen gezielt nachholen; anschließend Gesamtprüfung wiederholen.

**Wichtig:** Der CLI prüft Datei-Existenz, Nummern, grundlegende PNG-Struktur und eindeutige Bytes. Eine automatische Prüfung kann nicht garantieren, dass die Szene das Sprecherwort wirklich illustriert oder ein Flow-Bild inhaltlich richtig aussieht. Für Qualitätsfreigabe bleibt die tatsächliche visuelle Kontrolle erforderlich. Der CLI bedient Google Flow nicht selbst und erstellt fehlende Bilder nicht selbstständig.

## Praktischer Check je Fünfergruppe

Beispielprojekt `youtube/<KW>/<Video>`. Flow-Ausgaben zunächst in einem temporären Eingang **außerhalb** des finalen `images/`-Ordners speichern. Den nachgewiesenen Zuordnungen ein Manifest geben, etwa `/Downloads/Flow-Import/batch-01.json`:

```json
{
  "images": [
    {"imageNumber": 1, "file": "flow-output-a.png"},
    {"imageNumber": 2, "file": "flow-output-b.png"},
    {"imageNumber": 3, "file": "flow-output-c.png"},
    {"imageNumber": 4, "file": "flow-output-d.png"},
    {"imageNumber": 5, "file": "flow-output-e.png"}
  ]
}
```

**Das Beispiel ist keine Annahme über die richtige Dateireihenfolge**: Datei A muss tatsächlich nachweislich zu Szene 01 gehören. Dateinamen im Manifest dürfen relativ zum Manifestpfad oder absolut sein.

```bash
npm run flow:youtube-batch -- --dir "youtube/<KW>/<Video>" --batch 1 --manifest "/Downloads/Flow-Import/batch-01.json"
```

Der Befehl verweigert die Freigabe, wenn eines der fünf Bilder fehlt, doppelt/falsch zugeordnet ist, keine plausible 16:9-PNG-Struktur besitzt, das Cover fehlt, eine vorherige Gruppe unvollständig ist oder das Ziel bereits mit anderem Inhalt belegt wurde. Im Erfolgsfall kopiert er alle fünf mit den kanonischen Namen, prüft sie nochmals und zeigt die **nächste erlaubte Gruppe** an.

Anschließend ein Manifest nur für `06`–`10` erstellen und `--batch 2` ausführen. Die letzte Gruppe darf weniger Einträge enthalten.

### Endkontrolle

```bash
npm run flow:youtube-batch -- --dir "youtube/<KW>/<Video>" --audit
npm run validate:youtube-phase2 -- --dir "youtube/<KW>/<Video>"
```

**Kein Abschlussbericht „alle Bilder fertig“, kein Render und keine automatische Fortsetzung bei roter Prüfung.** Defekte/fehlende Nummern werden einzeln gemeldet; der zuständige Flow-Agent muss diese nachgenerieren und richtig zuordnen. Etwaige sichtbare Textfehler, falsche Karten oder unpassende Countryballs bleiben zusätzlich ein visueller QC-Blocker.

### Bestandsschutz

- Nur neue YouTube-Langvideos mit der neuen `flowBatchPolicyVersion: 1`.
- Alte Projekte mit Asset Policy V1/V2 bleiben reproduzierbar; bestehende `youtube/<KW>/<video>/...`-Dateien werden nicht geändert.
- Reels behalten ihren separaten seriellen Google-Flow-Workflow.
- Cover V2, Bilderwelt, adaptive Bilddichte und Audio-/Renderregeln bleiben erhalten.
