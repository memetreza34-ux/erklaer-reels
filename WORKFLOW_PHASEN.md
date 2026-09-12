# Die drei Reel-Produktionsphasen

**Verbindliche Rollenverteilung.** `CURRENT_WORKFLOW.md` hat bei Widersprüchen Vorrang. YouTube besitzt einen eigenen Workflow.

| Phase | Wer | Ergebnis |
|---|---|---|
| 1 | ChatGPT | komplettes Reel-Paket: Script, Bildprompts, Bild↔Satz-Struktur, Motion/SFX, Caption, Quellen |
| 2 | Arman | echtes Voice-over und alle finalen nummerierten Bilder |
| 3 | Antigravity | automatisch zusammengesetztes, geprüftes und gerendertes Reel |

---

## Phase 1 — ChatGPT

Vor neuer Themenwahl `THEMEN_HISTORIE.md` und `config/reel-topic-focus.json` prüfen.

Für neue Reels gilt:
- 55–60 s Voice-over
- 155–175 deutsche Wörter
- 8–10 narrative Szenen, Standard 9
- `adaptive-dense-v2`
- 8 Szenen: 19–21 Bilder
- 9 Szenen: 20–22 Bilder
- 10 Szenen: 21–24 Bilder
- Hook normalerweise 2 Bildmomente
- weitere Szenen 2 oder 3 Bildmomente nach Inhalt
- ein Bild = eine klare gesprochene visuelle Kernaussage
- jede interne Bildphase besitzt ein echtes gesprochenes `audioCue`
- Bildprompts Englisch, sichtbarer Text Deutsch
- feste Reel-Bildwelt: `serious-minimal-countryball-explainer`
- keine Untertitel, keine Hintergrundmusik
- Motion und SFX bereits planen
- mindestens zwei hochwertige HTTPS-Quellen auf verschiedenen Hosts

Kanonische Übergabedateien:

```text
00-bildprompts/99-alle-bildprompts.txt
01-voice-script/voice-script.txt
99-technik/BILD_AUDIO_ZUORDNUNG.json
```

`BILD_AUDIO_ZUORDNUNG.json` legt schon in Phase 1 fest, welcher gesprochene Satz-/Teilbereich zu welchem Bild gehört. Die echten Sekundenwerte werden erst in Phase 3 aus dem finalen Audio erzeugt.

**Übergabe an Phase 2:** Script, Masterprompt, Mapping, Motion/SFX, Caption und Quellen sind fertig.

---

## Phase 2 — Arman

### Voice-over

Voice-over aus `01-voice-script/voice-script.txt` erzeugen und im aktuellen Reel unter

```text
02-audio/AUDIO-HIER-EINFUEGEN/
```

ablegen.

### Bilder

`00-bildprompts/99-alle-bildprompts.txt` verwenden. Google Flow arbeitet streng seriell:

```text
1 Bild erzeugen
→ vollständig warten
→ gegen Prompt + feste Bildwelt prüfen
→ exakt Bild NN.png benennen
→ in 00-bildprompts/00-ALLE-BILDER-HIER-REIN/ ablegen
→ erst dann das nächste Bild
```

Keine Queue, keine parallele Generierung, keine unbenannten Sammelbilder.

**Übergabe an Phase 3:** genau die erwarteten `Bild 01 ... Bild NN` plus genau ein aktuelles Voice-over liegen im Reel.

---

## Phase 3 — Antigravity — SIMPLE MODE

Normaler Einstieg ist **ein einziger Befehl**:

```bash
npm run phase3:reel -- --dir "<reel>"
```

Antigravity arbeitet danach nicht-interaktiv bis zum Render. **Keine Zwischenfragen und keine Freigabe nach jedem Schritt.**

Intern passiert automatisch:

```text
Assets finden
→ Bildnummern + Audio routen
→ Assets übernehmen
→ 1 schneller visueller QC-Durchgang
→ Voice-over trimmen / 1,10x / −16 LUFS / max. −1,5 dBTP
→ Bild↔Audio automatisch aus Phase-1-Reihenfolge ausrichten
→ SFX-Dateien binden
→ Timeline bauen
→ Finalizer
→ Render
```

### Routing

Die globale Nummerierung ist verbindlich:

```text
Bild 01 → erster geplanter Bildmoment
Bild 02 → zweiter geplanter Bildmoment
Bild 03 → dritter geplanter Bildmoment
...
```

Dafür sind **nicht** mehr nötig:
- sichtbare Bildbeschreibung pro Datei
- Match-Begründung pro Datei
- zweite Zuordnungsprüfung
- manuelle Bestätigung jedes Audio-Ankers

### Visuelle QC

Ein einziger schneller Durchgang prüft:
- Datei vorhanden/lesbar
- 9:16 und technisch brauchbar
- grob passender Inhalt zum bereits zugeordneten Satz
- feste Serious-Minimal-Countryball-Bildwelt
- geplanter Pflichttext korrekt, falls vorhanden

### Audio und Timing

Das finale Voice-over ist die Masterspur. Die Phase-1-Satz↔Bild-Struktur bleibt inhaltliche Autorität. Phase 3 erzeugt daraus automatisch eine monotone Startausrichtung; keine Einzel-Rückfragen für jeden Cue.

Timing:
- Szenencut ca. 0,10 s vor Cue
- interner Bildcut ca. 0,08 s vor Cue
- SFX ca. 0,04 s vor Cut
- Bildmoment technisch mindestens ca. 2,2 s
- häufig guter Bereich 2,5–3,8 s
- nach Sprecherende 0,5–0,7 s Schlussbild-Hold, Ziel 0,6 s

### Rückfragen nur bei echten Hard Blockern

Antigravity darf nur stoppen, wenn es nicht sicher autonom weitergehen kann, z. B.:
- Bild fehlt
- Bildnummer doppelt
- mehrere unklare Audio-Dateien
- Audio fehlt/ist kaputt
- Bild kaputt/unlesbar
- offensichtlicher falscher Inhalt/Reihenfolge/Stilbruch
- notwendige SFX-Datei fehlt
- Render-/Toolfehler

Dann nur den konkreten Blocker nennen. Keine allgemeinen Freigabefragen.

**Ergebnis:**

```text
03-export/FERTIGES-REEL.mp4
03-export/UNIVERSELLE-CAPTION.txt
```

Nicht ausgeführte Tests/QC niemals als bestanden melden.
