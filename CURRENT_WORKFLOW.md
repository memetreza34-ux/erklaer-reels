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
- Bildwelt erst nach dem fertigen Script wählen
- innerhalb eines Reels eine konsistente Hauptbildwelt
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

## 2. Verbindliche neue Regel: Bildanzahl immer individuell

**Narrative Szenenzahl und Bildanzahl sind ab sofort getrennt.**

Es gilt ausdrücklich nicht mehr:

> 13 Szenen = 13 Bilder

Stattdessen:

- 12–14 narrative Szenen bleiben der Strukturrahmen.
- Jede narrative Szene bekommt **1, 2 oder selten 3 Bildphasen**.
- Die tatsächliche Gesamtzahl der Bilder wird **für jedes Reel individuell nach Inhalt und Rhythmus entschieden**.
- Es gibt **keine feste Zielsumme** wie 13, 16 oder 18 Bilder, die mechanisch erfüllt werden muss.
- `reel.json` verwendet `imageCountMode: "individual-per-reel"` und speichert die tatsächlich geplante Summe in `plannedImageCount`.

### Entscheidung pro Szene

**1 Bild**, wenn ein starkes Motiv den gesamten Gedanken klar und interessant trägt.

**2 Bilder**, wenn ein zweiter visueller Schritt einen echten Mehrwert bietet, zum Beispiel:
- Überblick → Detail
- Karte → Zoom
- Ursache → Folge
- Ausgangslage → Vergleich
- Gesicht → Gedanken-/Detailansicht
- Metapher → sichtbare Konsequenz

**3 Bilder** nur selten, wenn die Erklärung tatsächlich drei klar getrennte visuelle Schritte braucht.

### Prüftrigger gegen zu lange Stillstände

Wenn ein einzelnes Still-Bild ungefähr **3,5–4,0 Sekunden oder länger** stehen würde, muss aktiv geprüft werden, ob eine zweite Bildphase das Reel verbessert.

Das ist **kein Automatismus**: Ein sehr starkes Einzelbild darf länger stehen, wenn ein zusätzlicher Schnitt nur künstlich wäre.

**Kein zusätzliches Bild darf nur erzeugt werden, um eine Zahl oder Quote zu erfüllen.** Jeder zusätzliche Bildwechsel braucht einen sichtbaren Informations-, Fokus- oder Rhythmusgewinn.

---

## 3. Bilddichte und die drei Bildwelten

Die Bildanzahl bleibt auch innerhalb der Bildwelten individuell.

### 1. `human-editorial-cartoon` — Köpfe-Welt

- dominante große Köpfe/Gesichter
- starke Mimik und Close-ups
- wenig Körper
- kleine Gruppen
- Gedanken, Wahrnehmung und mentale Mechanismen direkt am/in/um den Kopf visualisieren
- keine generischen Klassenraum- oder Menschenmengen-Kompositionen

Zusätzliche Bildphasen sind sinnvoll, wenn z. B. von Gesicht/Emotion zu Gedankenmechanismus oder Detail gewechselt wird.

### 2. `round-country-characters` — Länder-Welt

Diese Welt darf besonders häufig mehrere Bildphasen nutzen, weil geografische Erklärungen oft von **Überblick → Zoom → Vergleich** profitieren.

Typische Wechsel:
- Welt-/Kontinentkarte → Land
- Land → Grenz-/Nachbardetail
- ein Land → Vergleich mit anderem Land
- historische Karte → heutige Situation

Trotzdem gibt es **keine feste Mindest- oder Sollzahl an Bildern**.

### 3. `visual-metaphor` — Metaphern-Welt

Ein starkes Symbol kann eine ganze Szene alleine tragen. Eine zweite Bildphase ist sinnvoll, wenn erst die Metapher und danach ihre Folge/Auflösung gezeigt werden soll.

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

## 5. Rollenverteilung bei Bildern

### Repo-Agenten / Codex / Antigravity

Sie erzeugen keine Bilder selbst. Sie erstellen:
- Script
- narrative Szenen
- individuelle Bildphasen
- Cover-Prompt
- Prompt pro Bildphase
- `all-image-prompts/all-image-prompts.txt`
- Caption und Quellen
- Asset-Suche, QC, Zuordnung, Timeline und Render

### Nutzer

Der Nutzer startet Google Flow einmal mit der vollständigen Sammeldatei.

### Google Flow

Google Flow arbeitet danach ohne weiteres `Go`, `Weiter` oder `OK` bis zum letzten Bild.

---

## 6. Google Flow — streng seriell

Niemals parallel, niemals Batch, niemals Queue.

Für jedes Bild:

**Prompt lesen → genau ein Bild erzeugen → vollständig warten → sofort umbenennen → Dateiname prüfen → automatisch nächstes Bild starten**

`Bild 00.png` ist immer Cover und Style-Master.

Danach folgen alle Bildphasen in **globaler Bildreihenfolge**:

```text
Bild 00.png = Cover
Bild 01.png = erste Bildphase des Reels
Bild 02.png = zweite Bildphase des Reels
Bild 03.png = dritte Bildphase des Reels
...
```

### Sehr wichtig

**Die Google-Flow-Bildnummer ist nicht mehr automatisch die Szenennummer.**

Beispiel:

```text
Bild 01 = Szene 1 · Bildphase 1
Bild 02 = Szene 2 · Bildphase 1
Bild 03 = Szene 2 · Bildphase 2
Bild 04 = Szene 3 · Bildphase 1
```

Die Sammeldatei erzeugt diese Zuordnung automatisch.

---

## 7. Bildimport und visuelle QC

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

Danach zweite Prüfung gegen die **vorherige und nächste Bildphase**.

Unter 0,90 Konfidenz nicht raten. `filename-only` ist verboten.

Erlaubte Match-Methoden:
- `visual-content-review`
- `visual-text-and-content-review`

---

## 8. Fehlende Assets zuerst suchen

Vor jeder Meldung, dass Bilder oder Audio fehlen:

```bash
npm run discover:assets -- --dir "<reel-ordner>"
```

Die Asset-Discovery erwartet bei neuen Reels automatisch die individuell geplante Bildreihe von `Bild 00` bis zur letzten Bildphase und nicht mehr nur `Bild 00` bis `Bild 13`.

Bei mehreren vollständigen ZIPs oder mehreren Audio-Kandidaten niemals blind wählen; inhaltlich prüfen.

---

## 9. Voice-over, Szenen-Sync und interne Bildwechsel

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

## 10. Standardbefehle

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

## 11. Sichtbare Reel-Struktur

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

Technische Prompt-Sammeldatei:

```text
all-image-prompts/all-image-prompts.txt
```

---

## 12. Abschlussprinzip

Ein Reel ist erst fertig, wenn:
- Script und Quellen geprüft sind
- alle individuell geplanten Bildphasen vorhanden sind
- jede Bildphase visuell zweifach bestätigt ist
- das finale Audio gemessen und synchronisiert ist
- narrative Szenen und interne Bildwechsel korrekt zur finalen Audiodatei passen
- keine Untertitel gerendert werden
- Finalizer und Render-Validator bestanden sind
- die echte MP4 erzeugt wurde

Geplante, geschätzte oder nicht ausgeführte Stufen dürfen niemals als bestanden gemeldet werden.
