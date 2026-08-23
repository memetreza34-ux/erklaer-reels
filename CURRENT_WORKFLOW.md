# CURRENT WORKFLOW — VERBINDLICHE SINGLE SOURCE OF TRUTH

**Stand: 2026-08-23**

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
- ausschließlich harte Schnitte
- keine Hintergrundmusik
- 0–2 dezente SFX pro narrativer Szene

---

## 2. Verbindliche Hauptbildwelt: nur Kugel-Welt

Bis der Nutzer ausdrücklich etwas anderes aktiviert, gilt für **jedes neue Reel und jedes Thema** ausschließlich:

`round-country-characters`

Die früheren Welten `human-editorial-cartoon` und `visual-metaphor` sind vorerst **außer Kraft** und dürfen nicht autonom ausgewählt werden.

Diese Kugel-Welt ist **nicht auf Länder-/Geografie-Themen beschränkt**. Auch Psychologie, Gesellschaft, Geschichte, Verhalten und andere erlaubte Themen werden mit runden Figuren, Symbolen, Karten, Objekten und metaphorischen Requisiten innerhalb derselben Kugel-Ästhetik erklärt.

### Nicht verhandelbare Figurenregel

- Jede anthropomorphe Hauptfigur ist eine **vollständig runde Kugel / Country-Ball-artige Figur**.
- Bei Ländern liegt das vereinfachte Flaggenmuster auf der Kugel.
- Bei nicht-länderspezifischen Rollen werden neutrale runde Kugelfiguren mit passenden Farben/Symbolen verwendet.
- einfache weiße Augen; höchstens winzige Arme/Beine
- Karten-/Länderumrisse dürfen nur gesichtslose Hintergrundgrafik sein
- niemals Augen, Mund oder Gliedmaßen auf Kartenformen
- niemals unregelmäßige Länderform als Figur
- keine menschlichen Köpfe/Torsi als Hauptfiguren

Jeder Prompt muss diese Form erzwingen:

> complete perfectly round circular character / country sphere; never a map-shaped character

---

## 3. Bildanzahl immer individuell

Narrative Szenenzahl und Bildanzahl sind getrennt.

- 12–14 narrative Szenen bleiben der Strukturrahmen.
- Jede Szene bekommt 1, 2 oder selten 3 Bildphasen.
- Die Gesamtzahl wird pro Reel nach Inhalt und Rhythmus entschieden.
- keine feste Zielsumme wie 13, 16 oder 18
- `reel.json.imageCountMode = "individual-per-reel"`
- `reel.json.plannedImageCount` enthält die echte geplante Zahl

### Entscheidung pro Szene

**1 Bild:** ein starkes Motiv trägt den Gedanken.

**2 Bilder:** ein echter zweiter visueller Schritt hilft, z. B. Überblick → Detail, Ursache → Folge, Ausgangslage → Vergleich, Karte → Zoom, Figur → Mechanismus.

**3 Bilder:** nur bei wirklich dreistufigen Erklärungen.

Wenn ein Still-Bild ungefähr 3,5–4,0 Sekunden oder länger stehen würde, aktiv prüfen, ob eine weitere Bildphase verbessert. Kein zusätzliches Bild nur für eine Quote.

---

## 4. Sichtbarer Text: harte Firewall

Workflow- und Produktionsdaten sind niemals Bildinhalt.

In einem generierten Bild dürfen niemals sichtbar erscheinen:
- Bildnummern (`BILD 00`, `Bild 01` usw.)
- `COVER`
- `SZENE` / `SCENE`
- `BILDPHASE` / `IMAGE PHASE`
- `DATEINAME`, Dateinamen, Dateiendungen
- `GOOGLE FLOW`, `PROMPT`, `STYLE-REFERENZ`, `ZIEL`
- technische IDs

Pro Bild gilt eine harte Text-Whitelist:
- `imageText`/Cover-Headline gesetzt → nur exakt dieser Text darf lesbar sein
- `imageText` leer → keinerlei lesbarer Text im Bild

---

## 5. Google Flow: Einzeldateien statt Mega-Sammelprompt

Die bisherige Methode, **alle visuellen Prompts direkt in einen riesigen Google-Flow-Prompt zu packen**, ist deaktiviert, weil der Agent sonst mehrere Bilder zusammen/zu schnell erzeugen und die Qualität verschlechtern kann.

### Neue verbindliche Exportstruktur

```text
all-image-prompts/
  google-flow-controller.txt
  image-prompts/
    Bild 00.txt
    Bild 01.txt
    Bild 02.txt
    ...
  all-image-prompts.txt
```

`all-image-prompts.txt` bleibt nur als **Kompatibilitäts-/Indexdatei** und darf nicht als eigentlicher Mega-Generierungsprompt verwendet werden.

### Google-Flow-Ablauf

Der Nutzer startet den Agenten mit `google-flow-controller.txt`.

Der Controller darf **niemals alle Bildprompts auf einmal einlesen**.

Für jedes Bild strikt:

1. nur die nächste Datei `image-prompts/Bild NN.txt` öffnen
2. genau **ein** Bild generieren
3. vollständig warten, bis die Generierung fertig ist
4. Ergebnis exakt in `Bild NN.png` umbenennen
5. Dateiname und Ergebnis prüfen
6. erst danach die nächste Prompt-Datei öffnen

**Verboten:**
- mehrere Prompt-Dateien vorab lesen
- Batch
- Queue
- Parallelgenerierung
- mehrere Bilder in einem Generierungsauftrag
- das nächste Bild starten, solange das aktuelle noch läuft

`Bild 00.png` ist Cover und Style-Master. Ab Bild 01 wird Bild 00 als Stilreferenz verwendet, aber der Cover-Text niemals automatisch übernommen.

---

## 6. Technisches Bildphasen-Schema

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

## 7. Rollenverteilung

Repo-Agenten / Codex / Antigravity erzeugen keine Bilder. Sie erstellen Script, Szenen, individuelle Bildphasen, Cover-Prompt, Prompt pro Bildphase, Controller, Einzelprompt-Dateien, Caption, Quellen, Asset-Suche, QC, Timeline und Render.

Der Nutzer startet Google Flow einmal mit dem Controller. Google Flow arbeitet danach strikt seriell bis zum letzten Bild.

---

## 8. Bildimport und visuelle QC

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

## 9. Fehlende Assets zuerst suchen

Vor jeder Meldung, dass Bilder oder Audio fehlen:

```bash
npm run discover:assets -- --dir "<reel-ordner>"
```

Bei mehreren vollständigen ZIPs oder Audio-Kandidaten niemals blind wählen; inhaltlich prüfen.

---

## 10. Voice-over, Szenen-Sync und interne Bildwechsel

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

---

## 11. Standardbefehle

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

---

## 12. Abschlussprinzip

Ein Reel ist erst fertig, wenn Script/Quellen geprüft, alle Bildphasen vorhanden und zweifach visuell bestätigt, finales Audio gemessen und synchronisiert, interne Bildwechsel korrekt, keine Untertitel vorhanden und Finalizer/Render-Validator bestanden sind. Nicht ausgeführte Stufen niemals als bestanden melden.
