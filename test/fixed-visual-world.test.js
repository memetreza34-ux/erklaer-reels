# Die drei Produktionsphasen

`CURRENT_WORKFLOW.md` hat bei Widersprüchen Vorrang. Themenfokus: `REEL_THEMENFOKUS.md`. Bild↔Audio: `REEL_BILD_AUDIO_ZUORDNUNG.md`.

| Phase | Wer | Ergebnis |
|---|---|---|
| 1 | ChatGPT | Thema, Script, Bildprompts, Bild↔Audio-Mapping, Motion/SFX, Caption, Quellen |
| 2 | Arman | echtes Voice-over und alle echten Bilder |
| 3 | Antigravity | automatisch zusammengesetztes, geprüftes und gerendertes Reel |

Antigravity erzeugt **keine** Ersatzinhalte und verwendet niemals Assets aus einem anderen Reel.

---

## Phase 1 — ChatGPT

### Thema

Vor jeder autonomen Themenwahl:
1. `THEMEN_HISTORIE.md` prüfen
2. `REEL_THEMENFOKUS.md` prüfen

Standardfokus: **Politik, Geschichte, Geografie und Systeme einfach erklärt.** Off-Focus-Themen nur auf ausdrücklichen Nutzerwunsch.

### Inhalt

- 55–60 s
- 155–175 Wörter
- 8–10 narrative Szenen, Standard 9
- `adaptive-dense-v2`, `visualDensityVersion: 2`
- 8 Szenen → 19–21 Bilder
- 9 Szenen → 20–22 Bilder
- 10 Szenen → 21–24 Bilder
- Hook standardmäßig 2 Bildmomente
- danach 2 oder 3 Bilder pro Szene je nach echtem Gedankenwechsel
- 1 Bild = 1 klare gesprochene visuelle Kernaussage
- jeder interne Bildmoment besitzt eigenes gesprochenes `audioCue`
- unter **2.2 Sekunden** Bilddauer nur bei zwingendem Timing; häufig gut 2,5–3,8 s
- ab ca. 4,8 s Split prüfen

### Bildwelt

Nur **Serious Minimal Countryball Explainer** (`serious-minimal-countryball-explainer`).

- 9:16
- dicke schwarze Konturen
- flache 2D-Farben, minimale Schatten
- runde Kugelfiguren, wenn Akteure sinnvoll sind
- bei Politik/Geografie passende Flaggen, Karten, Grenzen, Institutionen und Dokumente natürlich nutzen
- 0–3 sinnvolle Zusatzobjekte
- `minimal-symbolic`, `supported-explainer`, `simple-mini-scene` mischen
- keine normalen Menschen, Foto-, Anime-, Clay- oder 3D/Pixar-Welt
- Prompts Englisch, sichtbarer Text Deutsch

### Bild↔Audio-Mapping

Für jeden Bildmoment:

```text
99-technik/BILD_AUDIO_ZUORDNUNG.json
```

Pflichtfelder u. a.:

```text
globalImageNumber
sceneId
phaseId
spokenText
startAnchor
endAnchor
```

`spokenText`-Bereiche sind chronologisch, vollständig und überlappungsfrei. Reale Sekunden bleiben in Phase 1 leer.

### Motion / SFX

Jeder Bildmoment erhält dezente Motion. Jeder sichtbare Szenen-/interne Bildwechsel erhält einen SFX aus `config/sound-library.json`.

### Phase-1-Checks

```bash
npm run export:prompts -- --dir "<reel>" --strict
npm run check:content -- --dir "<reel>" --strict
```

**Übergabe an Phase 2:** Masterprompt, Voice-Script und Bild↔Audio-Mapping sind fertig; nicht ausgeführte Checks werden nicht als bestanden markiert.

---

## Phase 2 — Arman

### Voice-over

Voice-over aus `01-voice-script/voice-script.txt` erzeugen und als Nutzeroriginal im aktuellen Reel ablegen.

### Bilder

`00-bildprompts/99-alle-bildprompts.txt` verwenden.

Flow arbeitet strikt seriell:

```text
World-Lock einmal setzen
→ Bild 01 erzeugen
→ warten
→ prüfen/benennen/ablegen
→ Bild 02
→ ...
→ Bild NN
```

Keine Parallelgenerierung. Nummerierung `Bild 01.png` → `Bild NN.png` muss vollständig und eindeutig sein.

**Übergabe an Phase 3:** echtes Audio und alle erwarteten Bilder sind vorhanden.

---

## Phase 3 — Antigravity

Phase 3 ist bewusst einfach. **Ein Nutzerauftrag reicht für den kompletten normalen nicht-destruktiven Lauf.**

Bevorzugter Befehl:

```bash
npm run phase3:reel -- --dir "<reel>"
```

### Automatischer Ablauf

```text
Assets finden
→ nummerierte Bilder automatisch routen
→ schneller visueller Einmal-Check
→ Voice-over trimmen / 1,10x / Loudness
→ auto-align:reel
→ Timeline + Sounds
→ Finalizer
→ Render
→ finalen Export kurz ansehen
```

### 1. Assets

Technisch intern:

```bash
npm run discover:assets -- --dir "<reel>"
npm run organize:assets -- --dir "<reel>" --apply
```

`--apply` erzeugt für vollständige nummerierte Sets automatisch die Zuordnung nach globaler Bildreihenfolge. Keine manuelle asset-map-Runde nötig.

### 2. Schnelle visuelle QC

```bash
npm run check:visuals -- --dir "<reel>" --strict
```

Nur ein Durchgang. Keine schriftliche Bildbeschreibung, keine Match-Begründung und kein zweiter Sichtpass pro Bild.

Hard Fails:
- Bild fehlt/beschädigt
- falsches Format/Seitenverhältnis
- falsche/doppelte Bildnummer
- offensichtlicher Inhaltsfehler
- offensichtlicher Bruch der festen Bildwelt
- falscher Pflichttext

### 3. Audio

```bash
npm run trim:pauses -- --dir "<reel>" --speed 1.10
```

Ziel: −16 LUFS, max. −1,5 dBTP, Endstille ≤0,25 s.

### 4. Bild↔Audio automatisch grundausrichten

```bash
npm run auto-align:reel -- --dir "<reel>"
```

Die Bild-/Satz-Reihenfolge ist bereits aus Phase 1 fest. Das Tool verteilt die Bereiche monoton über das finale Audio und erzeugt `timeline/audio-sync.json`.

**Keine Nutzerfrage bei kleiner Anchor-Unschärfe.** Exakte Anchor-Suche ist hilfreich, aber nicht mehr Voraussetzung für jeden Bildmoment. Nach dem Render nur sichtbar schlechte Cuts selbst korrigieren.

### 5. Timeline / Sounds / Finalisierung / Render

```bash
npm run build:timeline -- --dir "<reel>" --strict
npm run finalize:reel -- --dir "<reel>" --strict
npm run render:reel -- --dir "<reel>"
```

`build:timeline` bindet die geplanten Sounds über die zentrale Library. Finalizer und Renderer prüfen die kritischen Hard Gates erneut, ohne dass Antigravity den Nutzer dazwischen fragt.

### Nur echte Blocker melden

Stop nur wenn:
- Reel-Ziel wirklich unklar
- Audio/Pflichtbild fehlt oder ist kaputt
- Bildnummern bleiben wirklich mehrdeutig
- Voice-over weicht strukturell stark vom Script ab
- Nutzeroriginal müsste destruktiv geändert werden
- Hard Gate bleibt nach automatischer Reparatur bestehen
- externe irreversible/kostenpflichtige Aktion nötig

Kleine Style-Abweichungen, fehlende schriftliche QC-Begründung, fehlender zweiter Sichtpass oder ein nicht wortgenau gefundener Anchor sind **keine** Blocker.

**Ergebnis:**

```text
03-export/FERTIGES-REEL.mp4
03-export/UNIVERSELLE-CAPTION.txt
```

---

## Definition der Übergaben

Phase 1 ist nicht fertig, wenn Bilddichte, Mapping, Motion/SFX oder Quellen fehlen.

Phase 2 ist nicht fertig, wenn echtes Audio oder erwartete Bilder fehlen.

Phase 3 ist nicht fertig, wenn Bildreihenfolge/Audio sichtbar nicht zusammenpassen, Audio-Ende falsch ist, Motion/SFX fehlen oder MP4/Caption nicht existieren.

Nicht ausgeführte Tests/QC niemals als bestanden melden.
