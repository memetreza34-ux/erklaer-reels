# AGENTS.md

`CURRENT_WORKFLOW.md` ist die verbindliche Single Source of Truth. Bei Widersprüchen gilt immer die dort definierte Priorität.

## Drei Produktionsphasen

Phase 1 ChatGPT (Anlegen, Script, Prompts, Effekte) → Phase 2 Arman (Audio, Bilder) → Phase 3 Antigravity (Zusammenführen, Rendern). Wer welche Befehle ausführt, steht in `WORKFLOW_PHASEN.md`. Keine Phase überspringt oder übernimmt die Aufgaben einer anderen.

## Harte Datensicherheitsregel für Nutzerassets

Von Menschen erzeugte oder hochgeladene Medien sind **unveränderliche Originale**. Das gilt besonders für ZIPs, Bilder, Audio- und Videodateien in `00-bildprompts/00-ALLE-BILDER-HIER-REIN/`, `02-audio/AUDIO-HIER-EINFUEGEN/`, `inbox/` und `99-technik/inbox/`.

Verbindlich:
- Nutzerassets **niemals mit `mv` aus einem anderen Reel übernehmen**.
- Ein früheres Reel ist **niemals** eine Quelle für fehlende Assets des aktuellen Reels.
- Nutzerassets niemals mit `rm`, `rm -rf`, `git clean`, `git checkout` oder vergleichbaren Aufräumbefehlen entfernen oder zurücksetzen.
- Für manuelle Importe ausschließlich kopieren, Quelle unverändert lassen und kein bestehendes Ziel überschreiben.
- Bevorzugt `npm run import:user-asset -- --dir "<aktuelles-reel>" --source "<datei>" --kind images|audio` verwenden.
- Bei fehlenden Dateien nicht in alten Reels nach Ersatz suchen.

## Pflicht vor jedem Commit

`npm test` ausführen. **Die Suite muss grün sein.** Wer eine Regel ändert, zieht den zugehörigen Test mit.

Wer Bildwelt-, Untertitel- oder Workflow-Regeln anfasst, hält Runtime, Configs, Style-Bibel und Policy-Dateien synchron. `test/visual-world-single-source.test.js` schützt diese Single-Source-Regel.

## Neues Reel

Bei „Mach ein neues Reel“ autonom:

1. nächsten freien Slot bestimmen
2. starkes Thema aus dem offenen Themenuniversum wählen
3. deutsches Voice-over mit 155–175 Wörtern schreiben
4. 8–10 narrative Szenen planen, Standard 9
5. für jede Bildphase ausschließlich **Modern Countryball Explainer** verwenden
6. Bildanzahl nach fester Formel planen: Hook 1 Bild, jede weitere Szene 2
7. Bildprompts + seriellen Google-Flow-Gesamtprompt + Effekt-/Soundplan + Universal-Caption + Quellen fertigstellen
8. keine Untertitel erzeugen
9. `check:content --strict` muss Quellen, Bildstruktur und SFX-Coverage bestehen
10. externe Assets zuerst suchen, bevor etwas als fehlend gemeldet wird
11. Assets visuell prüfen, Audio synchronisieren und nur nach echten QC-Gates rendern

## Reels und YouTube strikt trennen

Reels verwenden ausschließlich **Modern Countryball Explainer** (`modern-countryball-explainer`) in 9:16.

YouTube verwendet ausschließlich:

```text
youtube/YOUTUBE_WORKFLOW.md
youtube/YOUTUBE_VISUAL_WORLD.md
```

Nie automatisch übertragen:
- YouTube-Stick-Figuren auf Reels
- Reel-Countryball-Regeln auf YouTube
- 16:9 auf Reels
- 9:16-Reel-Regeln auf YouTube

## Eine einzige Reel-Bildwelt

Verbindlich definiert in:
- `knowledge/fixed-visual-world.md`
- `config/image-styles.json`
- `src/shared/fixed-visual-world.js`

Es gibt genau eine aktive Reel-Bildwelt. Keine Menschen-/Köpfe-Welt, keine zweite Clarity-Welt und keine themenspezifischen Unter-Bildwelten.

### Kugelfiguren

Wenn ein Akteur sinnvoll ist:
- exakt runder Kreis- bzw. Kugelkörper ohne separaten Kopf
- einfache weiße expressive Augen mit schwarzen Pupillen
- minimale Gesichtselemente
- höchstens kleine einfache Arme/Hände/Füße für konkrete Handlungen
- Flaggen-/Regionsmuster nur bei echter geografischer Relevanz, sonst neutrale Kugeln

Eine Kugelfigur ist **nicht in jedem Bild Pflicht**. Objekt, Mechanismus, Dokument, Gebäude, Karte, Pflanze, Landschaft oder physischer Prozess darf die Szene allein tragen, wenn das klarer erklärt.

### Gestaltung — lebendige Mini-Szene statt Posterkarte

- 9:16, Smartphone-first
- sauberer 2D-Vektor-/Comic-Look
- dicke schwarze Konturen
- niedrige bis mittlere Detaildichte
- kräftige, kontrollierte Farben
- dezente Schatten und einfache Tiefe
- sichtbare Handlung, Reaktion, Veränderung oder Ursache-Folge-Beziehung
- ein dominantes Hauptmotiv und 1–3 unterstützende Elemente
- wenn sinnvoll Vordergrund/Mittelgrund/Hintergrund
- kontextuelle Umgebung statt leerer Fläche, wenn sie die Aussage stärkt
- Perspektive zwischen benachbarten Bildern sichtbar variieren
- möglichst innerhalb einer Sekunde verständlich

Verboten als wiederholtes Standardschema:
- große Headline + einzelnes Symbol auf leerem Hintergrund
- textdominante Lernposter
- dieselbe zentrierte Komposition in mehreren Bildern hintereinander
- generische Icon-Boards, Floating Cards und UI-Boxen
- menschliche Köpfe auf Kugeln, humanoide Cartoonmenschen, Stick-Figuren
- Fotorealismus, Anime/Manga, Clay, glänzendes 3D / Pixar-Look
- technische Cutaway-/Blueprint-Welt als Standard

## Bildtext

Prompts sind Englisch. Sichtbarer Text ist ausschließlich Deutsch.

- Bild 01/Cover braucht eine starke Headline.
- Danach ist Text optional.
- Wenn Nicht-Cover-Text verwendet wird: 0–4 deutsche Wörter.
- Ziel: ungefähr 35–60 % der Nicht-Cover-Bilder mit Text.
- Ein starkes textfreies Bild ist ausdrücklich erwünscht.
- Das Motiv muss auch ohne Text verständlich sein.

`imageText` gesetzt → nur exakt dieser deutsche Text. Leer → kein lesbarer Text.

## Narrative Szenen ≠ Bildanzahl

Feste Regel:

```text
Bilder = 1 + (Szenen − 1) × 2
```

- 8 Szenen = 15 Bilder
- 9 Szenen = 17 Bilder
- 10 Szenen = 19 Bilder
- Hook exakt 1 Bildphase
- jede weitere Szene exakt 2
- keine dritte Bildphase
- harte Untergrenze 3 Sekunden pro Bildphase

Die zweite Bildphase besitzt ein eigenes `audioCue` aus tatsächlich gesprochenen Wörtern. `startPercent` ist nur Planungswert; nach echtem Voice-over bestimmt `phaseCueTimings[].cueTimeSeconds` den finalen Cue.

## Schnitt-Timing

- Szenenwechsel standardmäßig ca. **0,10 s vor dem Szenen-Cue**
- interner Bildwechsel standardmäßig ca. **0,08 s vor dem Bild-Cue**
- bei 30 fps sind das ungefähr 2–3 Frames vor dem Wort
- harter Cut, kein Crossfade
- Mindestdauer von 3 Sekunden hat Vorrang

Ziel: Das neue Bild ist bereits sichtbar, wenn das Schlüsselwort gesprochen wird.

## Bewegung

Leichte Bewegung ist Standard:
- Ken Burns, subtiler Push-in/Pull-out oder kleiner Pan
- Zoom meist 2–4 %
- Pan maximal etwa 3 %
- weiches Easing
- auch zweite Bildphasen bekommen standardmäßig dezente Bewegung
- nur bewusst grafische/informationsdichte Bilder dürfen statisch bleiben

## Soundeffekte

Sounds werden als `type` aus `config/sound-library.json` geplant.

Für neue Reels ab 2026-09-02 ist SFX-Coverage ein **Hard Gate**:
- jeder Szenenwechsel nach der Hook braucht einen kurzen SFX
- jeder interne Bildwechsel braucht einen kurzen SFX oder passenden Objekt-Sound
- SFX beginnt standardmäßig ca. **0,04 s vor dem sichtbaren Cut**
- Lautstärke meist 0,18–0,28, Standard ca. 0,22
- Stimme bleibt klar dominant
- gleiche Transition-Variante nicht direkt zweimal hintereinander
- inhaltlich passender Sound bevorzugt; sonst Click/Pop/Tick oder dezenter Whoosh/Swipe
- keine Meme-Sounds

`npm run check:content -- --dir "<reel>" --strict` blockiert fehlende Wechsel-SFX.

## Google Flow — nur eine Masterdatei

Verbindliche Nutzerdatei:

```text
00-bildprompts/99-alle-bildprompts.txt
```

Hard Serial Lock:

```text
nur aktuellen Bildabschnitt ausführen
→ genau 1 Bildgenerator-Aufruf
→ vollständig warten
→ gegen Prompt UND Modern Countryball Explainer prüfen
→ zusätzlich Anti-Poster/Textdominanz/Perspektive prüfen
→ exakt als Bild NN.png umbenennen
→ in gemeinsamen Ausgabeordner legen
→ Ablage prüfen
→ erst dann nächstes Bild
```

Keine Queue, kein Batch, keine Parallelgenerierung, keine Mehrfachvarianten.

## Quellen-QC

Neue Reels:
- mindestens zwei echte HTTPS-Quellen
- unterschiedliche Hosts
- mindestens eine Primär-/offizielle oder wissenschaftliche Originalquelle
- mindestens eine unabhängige Sekundär-/Fachquelle
- konkret dokumentieren, welche Reel-Aussage belegt wird

## Untertitel und Audio

- keine Untertitel
- kein aktiver Word-Sync
- keine Subtitle-Safe-Zone
- finales Audio ist einzige Zeitquelle
- Anfangs-/Endstille und überlange Pausen straffen
- 1,10x, Pitch erhalten
- −16 LUFS
- max. −1,5 dBTP
- natürlicher Vortrag statt flacher TTS-Kadenz; Hook etwas energischer, Schlüsselwörter betonen
- nach letztem gesprochenen Wort nur **0,5–0,7 s** Schluss-Hold, Ziel **0,6 s**
- mehrsekündiger stiller Video-Nachlauf ist verboten

## Asset-Zuordnung

Dateinummer ist nur Routing-Hilfe. Bilder tatsächlich gegen Narration, Bildtext, Prompt, Modern Countryball Explainer und benachbarte Bildphasen prüfen. Unter 0,90 Konfidenz nicht raten.

## Finaler Reel-Export

```text
03-export/
├── FERTIGES-REEL.mp4
└── UNIVERSELLE-CAPTION.txt
```

## Render

Nur nach tatsächlich bestandenen Prüfungen. Nicht ausgeführte Tests, QC-Stufen oder Render niemals als bestanden melden.
