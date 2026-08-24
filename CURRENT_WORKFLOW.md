# CURRENT WORKFLOW — VERBINDLICHE SINGLE SOURCE OF TRUTH

**Stand: 2026-08-24**

Diese Datei ist die verbindliche Repo-weite Produktionsregel für neue Chats, Codex, Antigravity und andere Repo-Agenten.

## Priorität bei Widersprüchen

1. **Explizite aktuelle Nutzeranweisung im laufenden Chat**
2. **`CURRENT_WORKFLOW.md`**
3. `AGENTS.md`
4. `CODEX_TASK.md`
5. `PRODUCTION_STATUS.md`
6. `docs/` und `knowledge/`
7. ältere Reel-Dateien und historische Produktionsaufträge

Globale Regeln werden nur durch eine ausdrückliche neue Nutzerentscheidung geändert.

---

## 1. Standard eines Erklär-Reels

- 55–60 Sekunden Voice-over, Ziel ungefähr 58 Sekunden
- 155–175 deutsche Wörter, Ziel ungefähr 165
- 12–14 narrative Szenen, Standard 13
- genau ein deutscher Erzähler
- Hook ab Sekunde 0
- letzte zwei Szenen: persönliche Prüf-/Erkenntnisfrage → konkrete Lösung/Abschlusssatz
- Schlussbild nach dem letzten gesprochenen Wort 0,7 Sekunden halten
- Voice-over exakt 1,10x bei erhaltener Tonhöhe
- −16 LUFS, höchstens −1,5 dBTP
- **keine Untertitel**
- **kein Word-Sync für Untertitel**
- **Untertitel wieder aktivieren ist ohne ausdrückliche neue Nutzerentscheidung verboten.**
- ausschließlich harte Schnitte
- keine Hintergrundmusik
- 0–2 dezente SFX pro narrativer Szene

### Themenuniversum: offen statt feste Säulen

Die visuelle Welt ist fest, **die Themenwahl ist ausdrücklich offen**.

Neue Reels sind nicht auf Geschichte, Politik, Länder/Geografie oder Psychologie beschränkt. Für autonome Themenwahl darf grundsätzlich jeder geeignete Erklärbereich verwendet werden, zum Beispiel:

- Psychologie und menschliches Verhalten
- Alltag und Gewohnheiten
- Beziehungen und soziale Dynamiken
- Gesellschaft und Kultur
- Geschichte
- Länder und Geografie
- Politik und staatliche Systeme
- Wissenschaft und Naturphänomene
- Technik und digitale Welt
- Internet und Social Media
- Lernen, Schule und Gedächtnis
- Arbeit und Beruf
- Wirtschaft und Geldmechanismen
- Gesundheit und Ernährung
- Sprache und Kommunikation
- Denkfehler, Mythen, kuriose Fakten und starke „Warum ist das so?“-Fragen

Diese Liste ist **nur beispielhaft und keine Begrenzung**.

Bei „Mach ein neues Reel“ darf kein altes Pillar-System die Auswahl einschränken. Es gibt keine feste Themenquote und keine starre Rotation. Themen werden nach diesen Kriterien gewählt:

1. starker Hook / Neugier in der ersten Sekunde
2. klarer Aha-Moment innerhalb von unter 60 Sekunden
3. faktisch sauber erklärbar
4. visuell stark in der Kugel-Welt umsetzbar
5. abwechslungsreich gegenüber den unmittelbar vorherigen Reels
6. teilbar, überraschend oder alltagsrelevant

Nicht automatisch mehrere neue Reels hintereinander nur über Länder, Grenzen, Hauptstädte, Geschichte oder Politik auswählen, nur weil die Kugel-Welt ursprünglich dort entstanden ist.

---

## 2. Verbindliche Hauptbildwelt: nur Kugel-Welt

Bis der Nutzer ausdrücklich etwas anderes aktiviert, gilt für **jedes neue Reel und jedes Thema** ausschließlich:

`round-country-characters`

Die früheren Welten `human-editorial-cartoon` und `visual-metaphor` sind vorerst **außer Kraft** und dürfen nicht autonom ausgewählt werden.

Diese Kugel-Welt ist **nicht auf Länder-/Geografie-Themen beschränkt**. Psychologie, Gesellschaft, Geschichte, Verhalten, Alltag, Wissenschaft, Technik, Wirtschaft, Gesundheit, Kultur und andere geeignete Themen werden mit runden Figuren, Symbolen, Karten, Objekten und metaphorischen Requisiten innerhalb derselben Kugel-Ästhetik erklärt.

### Nicht verhandelbare Figurenregel

- Jede anthropomorphe Hauptfigur ist eine **vollständig runde Kugel / Country-Ball-artige Figur**.
- Bei Ländern liegt das vereinfachte Flaggenmuster auf der Kugel.
- Bei nicht-länderspezifischen Rollen werden neutrale runde Kugelfiguren mit passenden Farben/Symbolen verwendet.
- Nicht-Länder-Kugeln dürfen Personen, Gruppen, Rollen, Systeme, Gedanken, Gewohnheiten, Emotionen oder abstrakte Kräfte repräsentieren.
- einfache weiße Augen; höchstens winzige Arme/Beine
- Karten-/Länderumrisse dürfen nur gesichtslose Hintergrundgrafik sein
- niemals Augen, Mund oder Gliedmaßen auf Kartenformen
- niemals unregelmäßige Länderform als Figur
- keine menschlichen Köpfe/Torsi als Hauptfiguren

Jeder Prompt muss diese Form erzwingen:

> complete perfectly round circular character / country sphere; never a map-shaped character

---

## 3. Verbindlicher alter Bildprompt-Aufbau

Die frühere ausführliche Bildprompt-Struktur ist der Standard, weil sie qualitativ bessere Ergebnisse geliefert hat.

### Bindender Stil-Master

Neue Bildprompts orientieren sich an diesem bewährten Aufbau und Look:

> Vertical 9:16 premium mature 2D editorial country-character illustration. Warm off-white textured paper background, deep navy borders and map shapes, muted rust, mustard, cobalt and forest-green accents, bold clean hand-inked outlines, flat geometric shading, subtle grain, high contrast, sophisticated documentary tone, not childish.

Dazu immer passend zur Szene:
- vollständige runde Kugelcharaktere
- Länder mit vereinfachtem Flaggenmuster auf der Kugel
- einfache weiße Augen, höchstens winzige Arme/Beine
- Karten/Länderumrisse nur gesichtslos als Hintergrund oder Erklärung
- klare 1-Sekunden-Lesbarkeit
- starke zentrale Komposition statt generischem Symbolbrei
- `Bild 00` ist visueller Style-Master; spätere Bilder matchen dessen Liniengewicht, Papiertextur, Palette, Proportionen und Editorial-Finish

### Reihenfolge innerhalb jedes visuellen Prompts

Jede `cover/cover-prompt.txt`, `image-prompt.txt`, `image-prompt-02.txt` usw. ist ein vollwertiger visueller Prompt:

1. Format + vollständiger Stil
2. konkrete Szene / Komposition / Handlung
3. genau erlaubter deutscher Bildtext, falls vorhanden
4. negative Regeln: kein anderer lesbarer Text, kein Englisch, keine Logos, kein Wasserzeichen, kein 3D, keine Fotorealistik
5. volle 9:16-Fläche, keine Untertitel-Safe-Zone, kein künstliches leeres Untertitelband

Bei späteren Bildphasen darf `Match Bild 00.png exactly` verwendet werden, aber nie als Ersatz für eine konkrete Bildidee.

### Interne Einzelprompt-Sicherungen

`all-image-prompts/image-prompts/Bild NN.txt` darf zusätzlich als interne Sicherung existieren und muss den visuellen Quellprompt wortgetreu enthalten. Dort keine Workflow-Wrapper hineinmischen.

Die **verbindliche Datei für Google Flow ist aber nicht mehr diese Einzeldatei-Struktur**, sondern wieder der komplette Gesamtprompt unter `00-bildprompts/99-alle-bildprompts.txt`.

---

## 4. Bildanzahl immer individuell

Narrative Szenenzahl und Bildanzahl sind getrennt.

- 12–14 narrative Szenen bleiben der Strukturrahmen.
- Jede Szene bekommt 1, 2 oder selten 3 Bildphasen.
- Die Gesamtzahl wird pro Reel nach Inhalt und Rhythmus entschieden.
- keine feste Zielsumme wie 13, 16 oder 18
- `reel.json.imageCountMode = "individual-per-reel"`
- `reel.json.plannedImageCount` enthält die echte geplante Zahl

**1 Bild:** ein starkes Motiv trägt den Gedanken.

**2 Bilder:** ein echter zweiter visueller Schritt hilft, z. B. Überblick → Detail, Ursache → Folge, Ausgangslage → Vergleich, Karte → Zoom, Figur → Mechanismus.

**3 Bilder:** nur bei wirklich dreistufigen Erklärungen.

Wenn ein Still-Bild ungefähr 3,5–4,0 Sekunden oder länger stehen würde, aktiv prüfen, ob eine weitere Bildphase verbessert. Kein zusätzliches Bild nur für eine Quote.

---

## 5. Sichtbarer Text: harte Firewall

Workflow- und Produktionsdaten sind niemals Bildinhalt.

In einem generierten Bild dürfen niemals sichtbar erscheinen:
- Bildnummern (`BILD 00`, `Bild 01` usw.)
- `COVER`
- `SZENE` / `SCENE`
- `BILDPHASE` / `IMAGE PHASE`
- `DATEINAME`, Dateinamen, Dateiendungen
- `GOOGLE FLOW`, `PROMPT`, `STYLE-REFERENZ`, `ZIEL`
- technische IDs

Pro Bild gilt:
- `imageText`/Cover-Headline gesetzt → nur exakt dieser Text darf lesbar sein
- `imageText` leer → keinerlei lesbarer Text im Bild

Die Überschriften im Gesamtprompt sind reine Workflow-Steuerung und ausdrücklich niemals Bildinhalt.

---

## 6. Google Flow: wieder kompletter Gesamtprompt wie früher

Die bevorzugte Nutzerstruktur ist wieder der frühere komplette serielle Prompt in **einer Datei / einer Nachricht**.

Verbindliche Datei:

```text
00-bildprompts/99-alle-bildprompts.txt
```

Technische identische Spiegeldatei:

```text
all-image-prompts/all-image-prompts.txt
```

Der separate `google-flow-controller.txt` ist deaktiviert und wird nicht mehr als Startdatei verwendet.

### Aufbau des Gesamtprompts

Genau wie beim bewährten alten Aufbau:

1. `GOOGLE FLOW – KOMPLETTER SERIELLER BILDLAUF`
2. `AUFTRAG`
3. `WICHTIG – DIESE EINE NACHRICHT IST DIE KOMPLETTE FREIGABE`
4. `STRENG SERIELL – NIE PARALLEL`
5. komplette `DATEINAMEN`-Liste
6. `STYLE-MASTER`
7. Text-/Workflow-Regeln
8. `ENDE`
9. danach für **jedes Bild** ein eigener Abschnitt:
   - `BILD NN – COVER/SZENE ...`
   - `DATEINAME NACH FERTIGSTELLUNG: Bild NN.png`
   - vollständiger alter hochwertiger Visual-Prompt

### Harte Serienregel trotz Gesamtprompt

Dass alle Bildprompts bereits in einer Nachricht sichtbar sind, ist **keine Freigabe für Parallelgenerierung**.

Für jedes Bild zwingend:

1. nur den aktuellen Bildabschnitt ausführen
2. exakt **einen** Bildgenerator-Aufruf starten
3. niemals zwei oder mehr Generierungsaktionen im selben Agent-Schritt, Tool-Batch oder Turn auslösen
4. warten, bis das aktuelle Bild sichtbar vollständig fertig ist
5. exakt umbenennen
6. prüfen, dass die Umbenennung erfolgreich war
7. erst danach den nächsten Bildabschnitt ausführen

Wenn noch ein Job aktiv/queued/pending ist oder der Status unklar ist: **warten und keinen neuen Job starten**.

Verboten:
- parallele Generierungen
- Batch-Generierung
- mehrere Bildgenerator-Aufrufe in einem Schritt
- Queueing kommender Bilder
- mehrere Varianten auf einmal
- nächstes Bild starten, bevor das vorige sichtbar fertig, umbenannt und geprüft wurde

Falls Flow versehentlich mehrere Jobs startet, keine weiteren starten und spätere parallele Jobs abbrechen.

`Bild 00.png` ist Cover und Style-Master. Der Cover-Text wird auf spätere Bilder nicht übernommen.

---

## 7. Technisches Bildphasen-Schema

Pro narrativer Szene:

```json
{
  "sceneId": "scene-02",
  "imageCount": 2,
  "imagePhases": [
    {
      "phaseId": "scene-02-image-01",
      "order": 1,
      "startPercent": 0,
      "promptFileName": "image-prompt.txt",
      "expectedImageFileName": "scene-02.png",
      "visualIdea": "...",
      "imageText": "...",
      "rationale": "..."
    },
    {
      "phaseId": "scene-02-image-02",
      "order": 2,
      "startPercent": 0.52,
      "promptFileName": "image-prompt-02.txt",
      "expectedImageFileName": "scene-02-image-02.png",
      "visualIdea": "...",
      "imageText": "...",
      "rationale": "..."
    }
  ]
}
```

Erste Phase startet immer bei `startPercent: 0`; weitere Werte steigen zwischen 0 und 1. `scene-index.json` und `scene.json` bleiben synchron.

---

## 8. Rollenverteilung

Repo-Agenten / Codex / Antigravity erzeugen keine Bilder. Sie erstellen Script, Szenen, individuelle Bildphasen, vollwertige Bildprompts im bewährten alten Aufbau, **den kompletten seriellen Google-Flow-Gesamtprompt**, Caption, Quellen, Asset-Suche, QC, Timeline und Render.

Der Nutzer sendet Google Flow einmal `00-bildprompts/99-alle-bildprompts.txt`. Flow arbeitet danach selbstständig, aber strikt Bild für Bild.

### Quellen-QC für neue Reels

Neu erstellte Reels verwenden `sourceQualitySchemaVersion: 3`.

Pflicht:
- mindestens zwei echte HTTPS-Quellen
- unterschiedliche Hosts/Domains
- vollständige Felder `Titel/Institution`, `URL`, `Datum/Zugriff`, `Quellentyp`, `Belegt`
- mindestens eine Primär-/offizielle Quelle oder wissenschaftliche Originalquelle
- mindestens eine davon unabhängige Sekundär-/Fachquelle
- unter `Belegt` konkret benennen, welche Reel-Aussage die Quelle stützt

Die formale Quellen-QC ersetzt keine inhaltliche Prüfung. Bei Gesundheit, Wissenschaft, Wirtschaft, Politik und aktuellen technischen Fakten besonders auf Aktualität, Primärbezug und tatsächliche Belegbarkeit achten.

Bestehende Schema-2-Reels bleiben rückwärtskompatibel und werden nicht nur wegen der Schema-3-Einführung umgeschrieben.

---

## 9. Bildimport und visuelle QC

Fertige Bilder kommen nach

```text
00-bildprompts/00-ALLE-BILDER-HIER-REIN/
```

bzw. technisch nach

```text
inbox/numbered-images/
```

Die Nummer ist nur Routing-Hilfe. Jede Bildphase sichtbar prüfen gegen Narration, `audioCue`, `visualIdea`, `imageText`, Prompt und anschließend gegen vorherige/nächste Bildphase. Unter 0,90 Konfidenz nicht raten. `filename-only` ist verboten.

---

## 10. Fehlende Assets zuerst suchen

Vor jeder Meldung, dass Bilder oder Audio fehlen:

```bash
npm run discover:assets -- --dir "<reel-ordner>"
```

Bei mehreren vollständigen ZIPs oder Audio-Kandidaten niemals blind wählen; inhaltlich prüfen.

---

## 11. Voice-over, Szenen-Sync und interne Bildwechsel

Das finale Voice-over ist die einzige Zeitquelle.

1. Original-Audio verwenden
2. Pausen straffen
3. exakt 1,10x bei erhaltener Tonhöhe
4. −16 LUFS / max. −1,5 dBTP messen und bestätigen
5. narrative Szenen über echte akustisch bestätigte `audioCue`-Anker synchronisieren
6. zusätzliche Bildphasen über `startPercent` auf die bestätigte Szenendauer legen
7. jeden Bildwechsel visuell prüfen
8. letztes Bild nach Sprecherende 0,7 Sekunden halten

Whisper/ASR darf Kandidaten liefern, aber keine geschätzten Szenenanker als geprüft markieren. Kein Untertitel- oder Word-Sync-Schritt.

Historische Word-Sync-Helfer sind nur Legacy-Diagnosewerkzeuge und dürfen für neue Reels nicht als Pflichtschritt eingeführt werden.

---

## 12. Standardbefehle

```bash
npm run export:prompts -- --dir "<reel-ordner>" --strict
npm run validate:reel -- --dir "<reel-ordner>"
npm run check:content -- --dir "<reel-ordner>" --strict
npm run discover:assets -- --dir "<reel-ordner>"
npm run organize:assets -- --dir "<reel-ordner>" --apply
npm run trim:pauses -- --dir "<reel-ordner>" --speed 1.10
npm run build:timeline -- --dir "<reel-ordner>"
npm run sync:audio -- --dir "<reel-ordner>" --strict
npm run check:visuals -- --dir "<reel-ordner>" --strict
npm run finalize:reel -- --dir "<reel-ordner>" --strict
npm run validate:render -- --dir "<reel-ordner>"
npm run render:reel -- --dir "<reel-ordner>"
```

`npm run sync:words` gehört **nicht** zum aktiven Workflow. Falls historische Diagnose ausdrücklich nötig ist, existiert nur der klar gekennzeichnete Legacy-Befehl `npm run legacy:sync:words`.

---

## 13. Abschlussprinzip

Ein Reel ist erst fertig, wenn Script/Quellen geprüft, alle Bildphasen vorhanden und zweifach visuell bestätigt, finales Audio gemessen und synchronisiert, interne Bildwechsel korrekt, keine Untertitel vorhanden und Finalizer/Render-Validator bestanden sind. Nicht ausgeführte Stufen niemals als bestanden melden.
