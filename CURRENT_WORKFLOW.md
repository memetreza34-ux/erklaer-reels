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
- 12–14 **narrative Szenen**, Standard 13
- genau ein deutscher Erzähler
- Hook ab Sekunde 0
- **für alle neuen Reels ausschließlich die Kugel-Welt `round-country-characters` verwenden**
- andere Bildwelten sind pausiert und dürfen von Agenten nicht autonom gewählt werden
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

## 2. Verbindliche Hauptbildwelt: Kugeln für alle Themen

`round-country-characters` ist ab sofort die **einzige aktive Standardbildwelt** für neue Reels und wird themenübergreifend eingesetzt.

Das gilt ausdrücklich auch für Themen, die früher mit Köpfen oder Metaphern umgesetzt worden wären, zum Beispiel:
- Psychologie und menschliches Verhalten
- Politik und Gesellschaft
- Länder, Geografie und Geschichte
- abstrakte Ursache-Wirkung-Erklärungen

### Figurenregel

Jede anthropomorphe Hauptfigur ist eine **vollständig runde Kugel / ein perfekter kreisrunder Ball**.

- Bei Ländern: vereinfachtes, klar erkennbares Flaggenmuster auf der Kugel.
- Bei nicht-länderbezogenen Rollen oder Konzepten: neutrale runde Kugelfigur mit klarer Farbe, einfachem Symbol oder passendem visuellen Merkmal.
- einfache weiße Augen; höchstens winzige Arme/Beine
- keine menschlichen Köpfe, Torsi oder normalen Menschen als Hauptfiguren
- keine Karten-/Länderform als Figurenkörper
- Länder-/Kartenformen dürfen nur gesichtslose Hintergrund- oder Erklärgrafik sein

Jeder neue Bildprompt muss sinngemäß erzwingen:

> complete perfectly round editorial ball/sphere character; never a map-shaped character and never a normal human character

### Pausierte Welten

Bis zu einer ausdrücklichen neuen Nutzerentscheidung sind diese Welten **außer Kraft**:
- `human-editorial-cartoon`
- `visual-metaphor`

Sie bleiben nur für historische Reels/Abwärtskompatibilität im Repo dokumentiert und dürfen nicht für neue Reels ausgewählt werden.

---

## 3. Bildanzahl immer individuell

**Narrative Szenenzahl und Bildanzahl sind getrennt.**

Es gilt ausdrücklich nicht:

> 13 Szenen = 13 Bilder

Stattdessen:

- 12–14 narrative Szenen bleiben der Strukturrahmen.
- Jede narrative Szene bekommt **1, 2 oder selten 3 Bildphasen**.
- Die tatsächliche Gesamtzahl der Bilder wird **für jedes Reel individuell nach Inhalt und Rhythmus entschieden**.
- Es gibt **keine feste Zielsumme** wie 13, 16 oder 18 Bilder.
- `reel.json` verwendet `imageCountMode: "individual-per-reel"` und speichert die tatsächlich geplante Summe in `plannedImageCount`.

### Entscheidung pro Szene

**1 Bild**, wenn ein starkes Motiv den gesamten Gedanken klar und interessant trägt.

**2 Bilder**, wenn ein zweiter visueller Schritt einen echten Mehrwert bietet, zum Beispiel:
- Überblick → Detail
- Karte → Zoom
- Ursache → Folge
- Ausgangslage → Vergleich
- Figur → innerer/gedanklicher Mechanismus
- Symbol → sichtbare Konsequenz

**3 Bilder** nur selten, wenn die Erklärung tatsächlich drei klar getrennte visuelle Schritte braucht.

### Prüftrigger gegen zu lange Stillstände

Wenn ein einzelnes Still-Bild ungefähr **3,5–4,0 Sekunden oder länger** stehen würde, muss aktiv geprüft werden, ob eine zweite Bildphase das Reel verbessert.

Das ist **kein Automatismus**: Ein sehr starkes Einzelbild darf länger stehen, wenn ein zusätzlicher Schnitt nur künstlich wäre.

**Kein zusätzliches Bild darf nur erzeugt werden, um eine Zahl oder Quote zu erfüllen.** Jeder zusätzliche Bildwechsel braucht einen sichtbaren Informations-, Fokus- oder Rhythmusgewinn.

---

## 4. Technisches Bildphasen-Schema

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

Regeln:
- erste Phase startet immer bei `startPercent: 0`
- weitere Startwerte liegen streng aufsteigend zwischen 0 und 1
- die erste Phase bleibt für alte Reels kompatibel mit `image-prompt.txt` und `scene-XX.png`
- zusätzliche Phasen verwenden `image-prompt-02.txt`, `image-prompt-03.txt` usw.
- `scene-index.json` und jede `scene.json` müssen synchron bleiben

---

## 5. Sichtbarer Text in Bildern — harte Whitelist

Workflow- und Produktionsdaten sind **niemals Bildinhalt**.

Strikt verboten als sichtbarer Bildtext:
- Bildnummern wie `BILD 00`, `Bild 01`
- `COVER`
- `SZENE`, `SCENE`
- `BILDPHASE`, `IMAGE PHASE`
- `DATEINAME`, Dateinamen und Dateiendungen
- `GOOGLE FLOW`, `PROMPT`, `STYLE-REFERENZ`, `ZIEL`
- technische IDs
- sonstige Steuertexte

Für jede einzelne Bildphase gilt:
- `imageText`/Cover-Headline gesetzt → **nur exakt dieser Text darf lesbar sein**
- `imageText` leer → **gar kein lesbarer Text im Bild**

---

## 6. Rollenverteilung bei Bildern

### Repo-Agenten / Codex / Antigravity

Sie erzeugen keine Bilder selbst. Sie erstellen:
- Script
- narrative Szenen
- individuelle Bildphasen
- Cover-Prompt
- Prompt pro Bildphase
- **einen separaten Prompt pro tatsächlichem Bild**
- `all-image-prompts/google-flow-controller.txt`
- `all-image-prompts/individual-prompts/Bild 00.txt`, `Bild 01.txt`, ...
- `all-image-prompts/all-image-prompts.txt` nur noch als Manifest/Kompatibilitätsdatei, **nicht als Mega-Prompt**
- Caption und Quellen
- Asset-Suche, QC, Zuordnung, Timeline und Render

### Nutzer / Browser-Agent

Google Flow darf **immer nur genau einen Einzelprompt gleichzeitig erhalten**.

Der Controller ist für einen Agenten gedacht, der auf die Repo-Dateien zugreifen kann. Er öffnet die Einzelprompt-Dateien nacheinander. Der Controller selbst wird nicht als Bildprompt verwendet.

---

## 7. Google Flow — Qualitätsmodus: ein Prompt, ein Bild

Die frühere One-Paste-Mega-Prompt-Strategie ist aufgehoben, weil Flow mehrere enthaltene Bildaufträge parallelisieren oder qualitativ schlechter behandeln kann.

### Nicht erlaubt

- mehrere Bildprompts in einer einzigen Flow-Nachricht
- Batch-Generierung
- Queue mehrerer Bilder
- parallele Generierung
- Kontaktbogen/Collage/Storyboard als Ersatz für Einzelbilder
- nächstes Bild starten, solange das aktuelle Bild noch generiert wird

### Verbindlicher Ablauf

Für jedes Bild:

1. genau **eine** Datei aus `all-image-prompts/individual-prompts/` öffnen
2. ausschließlich den Inhalt dieser einen Datei an Google Flow geben
3. genau **ein** Bild erzeugen
4. vollständig warten, bis dieses Bild fertig ist
5. Ergebnis auf Qualität und Textfehler prüfen
6. extern auf den vorgesehenen Dateinamen `Bild XX.png` umbenennen
7. erst danach die nächste Einzelprompt-Datei öffnen

`Bild 00.png` ist Cover und Style-Master.

Danach folgen alle Bildphasen in globaler Bildreihenfolge.

### Wichtig

**Die Bildnummer ist globale Bildreihenfolge und nicht automatisch Szenennummer.**

Beispiel:

```text
Bild 01 = Szene 1 · Bildphase 1
Bild 02 = Szene 2 · Bildphase 1
Bild 03 = Szene 2 · Bildphase 2
Bild 04 = Szene 3 · Bildphase 1
```

### Controller-Datei

`all-image-prompts/google-flow-controller.txt` enthält nur Reihenfolge und Steuerlogik. Sie enthält **keine vollständigen Visual-Prompts** und darf nicht als Mega-Prompt zur gleichzeitigen Generierung interpretiert werden.

`all-image-prompts/all-image-prompts.txt` ist nur ein Manifest/Kompatibilitätshinweis und darf ebenfalls nicht als Sammel-Bildprompt verwendet werden.

---

## 8. Bildimport und visuelle QC

Alle fertigen Bilder werden nach Abschluss gemeinsam nach

```text
00-bildprompts/00-ALLE-BILDER-HIER-REIN/
```

bzw. technisch nach

```text
inbox/numbered-images/
```

übernommen.

Die laufende Nummer ist nur Routing-Hilfe. Vor `--apply` muss **jede einzelne Bildphase** sichtbar geprüft werden gegen:
- `narration`
- `audioCue`
- Bildphasen-`visualIdea`
- Bildphasen-`imageText`
- Bildphasen-`imagePrompt`
- Kugel-Welt-Regel
- sichtbare Text-Whitelist

Danach zweite Prüfung gegen die **vorherige und nächste Bildphase**.

Unter 0,90 Konfidenz nicht raten. `filename-only` ist verboten.

Erlaubte Match-Methoden:
- `visual-content-review`
- `visual-text-and-content-review`

---

## 9. Fehlende Assets zuerst suchen

Vor jeder Meldung, dass Bilder oder Audio fehlen:

```bash
npm run discover:assets -- --dir "<reel-ordner>"
```

Die Asset-Discovery erwartet bei neuen Reels automatisch die individuell geplante Bildreihe von `Bild 00` bis zur letzten Bildphase.

Bei mehreren vollständigen ZIPs oder mehreren Audio-Kandidaten niemals blind wählen; inhaltlich prüfen.

---

## 10. Voice-over, Szenen-Sync und interne Bildwechsel

Das finale Voice-over bleibt die einzige Zeitquelle.

1. Original-Audio verwenden
2. Pausen straffen
3. exakt 1,10x bei erhaltener Tonhöhe
4. −16 LUFS / max. −1,5 dBTP messen und bestätigen
5. narrative Szenen über echte akustisch bestätigte `audioCue`-Anker synchronisieren
6. zusätzliche Bildphasen innerhalb einer Szene über ihre geplanten `startPercent`-Werte auf die bestätigte Szenendauer legen
7. jeden resultierenden Bildwechsel visuell prüfen
8. letztes Bild nach Sprecherende 0,7 Sekunden halten

Whisper/ASR darf Kandidaten liefern, aber keine geschätzten Szenenanker als geprüft markieren. Nicht erkannte Anker bleiben offen.

Es gibt keinen Untertitel- oder Word-Sync-Schritt.

---

## 11. Standardbefehle

```bash
npm run export:prompts -- --dir "<reel-ordner>" --strict
npm run validate:reel -- --dir "<reel-ordner>"
npm run check:content -- --dir "<reel-ordner>" --strict
npm run discover:assets -- --dir "<reel-ordner>"
npm run organize:assets -- --dir "<reel-ordner>"
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

## 12. Sichtbare Reel-Struktur

```text
00-bildprompts/
01-voice-script/
02-audio/
03-caption/
04-video/
99-technik/
```

Finale MP4:

```text
04-video/FERTIGES-VIDEO/
```

Bildprompt-Ausgabe:

```text
all-image-prompts/google-flow-controller.txt
all-image-prompts/all-image-prompts.txt
all-image-prompts/individual-prompts/Bild 00.txt
all-image-prompts/individual-prompts/Bild 01.txt
...
```

---

## 13. Abschlussprinzip

Ein Reel ist erst fertig, wenn:
- Script und Quellen geprüft sind
- alle individuell geplanten Bildphasen vorhanden sind
- jede Bildphase visuell zweifach bestätigt ist
- alle neuen Bilder die Kugel-Welt einhalten
- kein unerlaubter Workflow-Text sichtbar ist
- das finale Audio gemessen und synchronisiert ist
- narrative Szenen und interne Bildwechsel korrekt zur finalen Audiodatei passen
- keine Untertitel gerendert werden
- Finalizer und Render-Validator bestanden sind
- die echte MP4 erzeugt wurde

Geplante, geschätzte oder nicht ausgeführte Stufen dürfen niemals als bestanden gemeldet werden.
