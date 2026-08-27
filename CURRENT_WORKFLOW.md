# CURRENT WORKFLOW — VERBINDLICHE SINGLE SOURCE OF TRUTH

**Stand: 2026-08-27**

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

### Themenuniversum

Die Themenwahl ist offen. Neue Reels dürfen aus Psychologie, Alltag, Gesellschaft, Geschichte, Geografie, Politik, Wissenschaft, Technik, Internet, Lernen, Arbeit, Wirtschaft, Gesundheit, Sprache, Mythen oder anderen geeigneten Erklärbereichen kommen.

Keine feste Themenquote und keine starre Rotation. Entscheidend sind Hook, Aha-Moment, Faktentreue, visuelle Umsetzbarkeit, Abwechslung und Teilbarkeit.

---

## 2. Reels und YouTube sind vollständig getrennt

**Reels und YouTube besitzen getrennte Bildwelten und getrennte Produktionsregeln.**

Für Reels gilt ausschließlich:

```text
modern-countryball-explainer
```

Für YouTube-Langvideos gilt ausschließlich die separate Regelquelle unter:

```text
youtube/YOUTUBE_WORKFLOW.md
youtube/YOUTUBE_VISUAL_WORLD.md
```

Strikt verboten:

- YouTube-Stick-Figuren automatisch auf Reels übertragen
- Reel-Countryball-Regeln automatisch auf YouTube übertragen
- 16:9-YouTube-Kompositionen als Reel-Stil verwenden
- 9:16-Reel-Regeln als globale YouTube-Regeln interpretieren

---

## 3. Reel-Bildwelt: scene-first Editorial Countryball

**Für alle neuen Reels bleibt die Style-ID `modern-countryball-explainer` aktiv, aber die verbindliche Ausführung ist jetzt szenisch statt infographic-first.**

Verbindliche Style-Bibel:

```text
knowledge/fixed-visual-world.md
```

Verbindliche Style-Konfiguration:

```text
config/image-styles.json
```

Neue Workspaces setzen:

```text
visualStyleId = "modern-countryball-explainer"
visualStyleReason = "Globale feste Bildwelt für alle neuen Erklär-Reels: szenischer Editorial-Countryball-Erklärstil mit konkreten Umgebungen statt generischer Icon-Karten."
```

### Wichtigstes Bildprinzip

**Erst eine konkrete physische Mini-Szene bauen, danach Symbole ergänzen.**

Ein Bild soll wie ein eingefrorener Story-Moment wirken, nicht wie ein Icon-Board.

### Kernmerkmale

- vertikal 9:16, Smartphone-first
- hand-drawn 2D vector-cartoon hybrid
- dicke, leicht organische schwarze Konturen
- flächige Farben, leichte Cel-Shading-Anmutung
- dezente weiche Schatten, sehr leichte Papier-/Korntextur erlaubt
- ein dominantes Hauptmotiv und eine klare Handlung
- 1–3 unterstützende Requisiten
- konkrete Umgebung, wenn sie die Aussage verbessert
- Close-up, Off-Center, Vorder-/Mittel-/Hintergrund und einfache Weitwinkel-Szenen erlaubt
- klare negative Fläche, starke Silhouette
- Bedeutung innerhalb ungefähr einer Sekunde verständlich

### Figuren

Countryball-ähnliche Figuren werden verwendet, wenn Länder, Regionen, Institutionen, Gruppen oder gesellschaftliche Akteure sinnvoll personifiziert werden.

- einfache weiße expressive Augen
- kleine Arme/Hände/Beine nur für konkrete Handlung
- Flaggenmuster nur wenn geografische Identität inhaltlich relevant ist
- keine zufälligen Länderflaggen

Bei Psychologie, Alltag, Technik, Gesundheit oder anderen abstrakten Allgemeinthemen gilt:

**Nicht automatisch eine leere beige Kugel in die Mitte setzen.**

Wenn ein Gegenstand, Mechanismus, Raum, Gebäude, Dokument, Landschaft oder anthropomorphes Objekt die Aussage besser erklärt, hat dieses Motiv Vorrang.

### Bevorzugte Szenenobjekte

Zum Beispiel Türen, Ruinen, Straßen, Räume, Bühnen, Karten, Tische, Werkzeuge, Dokumente, Koffer, Gebäude, Landschaften, Gewichte, Thermometer, Schilder, Bücher oder einfache Maschinen.

### Anti-Generic-Regeln

Nicht als Standardlösung verwenden:

- schwebende Reaktionskarten
- generische Lob-/Kritik-Karten
- Kreise aus Sprechblasen
- Icon-Gitter
- UI-artige Boxen
- sterile Infografik-Kacheln
- wiederholte Figur-mittig-plus-Icons-Komposition
- immer derselbe einfarbige Hintergrund
- unnötige Pfeilketten
- Waage oder Megafon als Universalmetapher
- identische Headline oben und unten

Solche Elemente sind nur erlaubt, wenn genau sie inhaltlich notwendig sind.

### Verbotene Stilabweichungen

- Fotorealismus
- realistische Menschen oder Gesichter
- Anime/Manga
- Clay/Knetstil
- glänzendes 3D / Pixar-Look
- Stockfoto-Ästhetik
- komplexe realistische Kulissen
- YouTube-Stick-Figure-/Ink-Explainer-Look
- 16:9-Komposition

Prompts sind Englisch. Sichtbarer Bildtext ist ausschließlich Deutsch.

---

## 4. Bildprompts mit Repo-Stil-Lock

Jede `cover/cover-prompt.txt`, `image-prompt.txt`, `image-prompt-02.txt` usw. beschreibt den **konkreten physischen Bildmoment auf Englisch**.

Jeder Prompt muss beantworten:

1. Wer oder was ist das Hauptmotiv?
2. Wo befindet es sich?
3. Was passiert physisch im Bild?
4. Welche wenigen Objekte/Umgebung erklären die Aussage?
5. Welche Perspektive und Komposition wird genutzt?
6. Welcher exakte deutsche Bildtext ist erlaubt, falls vorhanden?

Verbindlich zusätzlich:

- Format 9:16
- feste Bildwelt `modern-countryball-explainer`
- kein anderer lesbarer Text, kein Englisch, keine Logos, kein Wasserzeichen
- volle 9:16-Fläche, keine künstliche Untertitelzone
- keine generische Karten-/Icon-Lösung, wenn eine konkrete Szene möglich ist

Der Exporter ergänzt den festen Style-Lock global und direkt vor jedem einzelnen Bildabschnitt.

`Bild 00.png` ist das Cover, aber nicht der alleinige Style-Master. Die globale Reel-Bildwelt ist der Style-Master.

---

## 5. Bildanzahl immer individuell

Narrative Szenenzahl und Bildanzahl sind getrennt.

- 12–14 narrative Szenen bleiben der Strukturrahmen
- jede Szene bekommt 1, 2 oder selten 3 Bildphasen
- keine feste Gesamtzahl wie 13, 16 oder 18 erzwingen
- `reel.json.imageCountMode = "individual-per-reel"`
- `reel.json.plannedImageCount` enthält die echte geplante Zahl

**1 Bild:** ein starkes Motiv trägt den Gedanken.

**2 Bilder:** echter visueller Fortschritt, z. B. Überblick → Detail, Ursache → Folge, Ausgangslage → Konsequenz.

**3 Bilder:** nur bei wirklich dreistufigen Erklärungen.

Wenn ein Still ungefähr 3,5–4 Sekunden oder länger stehen würde, aktiv eine weitere Bildphase prüfen. Keine zusätzliche Phase nur für eine Quote.

---

## 6. Sichtbarer Text: harte Firewall

Workflow- und Produktionsdaten sind niemals Bildinhalt.

Verboten:

- Bildnummern
- `COVER`
- `SZENE` / `SCENE`
- `BILDPHASE` / `IMAGE PHASE`
- `DATEINAME` und Dateinamen
- `GOOGLE FLOW`, `PROMPT`, `STYLE-REFERENZ`, `ZIEL`
- technische IDs

Pro Bild:

- `imageText`/Cover-Headline gesetzt → nur exakt dieser **deutsche** Text
- `imageText` leer → keinerlei lesbarer Text
- dieselbe Headline niemals oben und unten doppeln

---

## 7. Google Flow: kompletter serieller Gesamtprompt

Verbindliche Nutzerdatei:

```text
00-bildprompts/99-alle-bildprompts.txt
```

Identische technische Spiegeldatei:

```text
all-image-prompts/all-image-prompts.txt
```

Der separate `google-flow-controller.txt` ist deaktiviert.

Der Gesamtprompt enthält:

1. Auftrag
2. Hard Serial Lock
3. globale feste Reel-Bildwelt
4. Dateinamenliste
5. Text-/Workflow-Regeln
6. für jedes Bild erneut den Style-Lock plus konkreten Visual-Prompt

### Hard Serial Lock

Für jedes Bild zwingend:

1. nur aktuellen Bildabschnitt ausführen
2. exakt einen Bildgenerator-Aufruf starten
3. vollständig warten
4. Ergebnis gegen konkreten Prompt **und Reel-Bildwelt** prüfen
5. bei falschem Inhalt oder Stil dasselbe Bild neu erzeugen
6. korrekt umbenennen
7. Umbenennung prüfen
8. erst dann nächstes Bild

Keine Queue, kein Batch, keine Parallelgenerierung, keine Mehrfachvarianten.

---

## 8. Technisches Bildphasen-Schema

Pro Szene:

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

Erste Phase immer `startPercent: 0`; weitere Werte streng steigend zwischen 0 und 1. `scene-index.json` und `scene.json` bleiben synchron.

---

## 9. Rollenverteilung und Quellen

Repo-Agenten / Codex / Antigravity erzeugen keine Bilder. Sie erstellen Script, Szenen, Bildphasen, konkrete englische Bildprompts, Gesamtprompt, Caption, Quellen, Asset-Suche, QC, Timeline und Render.

Neu erstellte Reels verwenden Quellen-Schema 3:

- mindestens zwei echte HTTPS-Quellen
- unterschiedliche Hosts
- mindestens eine Primär-/offizielle oder wissenschaftliche Originalquelle
- mindestens eine unabhängige Sekundär-/Fachquelle
- unter `Belegt` konkret die gestützte Reel-Aussage nennen

---

## 10. Bildimport und visuelle QC

Fertige Bilder kommen nach:

```text
00-bildprompts/00-ALLE-BILDER-HIER-REIN/
```

bzw. technisch nach:

```text
inbox/numbered-images/
```

Jede Bildphase sichtbar gegen Narration, `audioCue`, `visualIdea`, `imageText`, Prompt, feste Bildwelt und benachbarte Bildphasen prüfen. Unter 0,90 Konfidenz nicht raten. `filename-only` ist verboten.

Typische Stilfehler:

- Fotorealismus / realistische Menschen
- 3D-/Clay-/Anime-Abweichung
- dünne YouTube-Stick-Figure-Linien
- generische Karten-/Icon-Collage
- wiederholte Figur-mittig-plus-Icons-Komposition
- leere beige Kugel ohne inhaltlichen Grund
- unnötig komplexe Kulisse
- zufällige Flaggen
- sichtbarer englischer oder ungeplanter Text
- doppelte Headline oben und unten

---

## 11. Fehlende Assets zuerst suchen

Vor jeder Meldung, dass Bilder oder Audio fehlen:

```bash
npm run discover:assets -- --dir "<reel-ordner>"
```

Bei mehreren Kandidaten niemals blind wählen; inhaltlich prüfen.

---

## 12. Voice-over und Szenen-Sync

Das finale Voice-over ist die einzige Zeitquelle.

1. Original-Audio verwenden
2. Pausen straffen
3. exakt 1,10x bei erhaltener Tonhöhe
4. −16 LUFS / max. −1,5 dBTP messen
5. narrative Szenen über echte akustische `audioCue`-Anker synchronisieren
6. zusätzliche Bildphasen über `startPercent` legen
7. jeden Bildwechsel visuell prüfen
8. letztes Bild nach Sprecherende 0,7 Sekunden halten

Whisper/ASR darf Kandidaten liefern, aber keine geschätzten Anker als geprüft markieren. Der aktive Workflow enthält **keinen Untertitel- oder Word-Sync-Schritt**.

---

## 13. Standardbefehle

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

`npm run sync:words` gehört nicht zum aktiven Workflow.

---

## 14. Abschlussprinzip

Ein Reel ist erst fertig, wenn Script/Quellen geprüft, alle Bildphasen vorhanden und visuell bestätigt, die **verbesserte scene-first Reel-Bildwelt** eingehalten, finales Audio gemessen und synchronisiert, keine Untertitel vorhanden und Finalizer/Render-Validator bestanden sind.

Nicht ausgeführte Stufen niemals als bestanden melden.
