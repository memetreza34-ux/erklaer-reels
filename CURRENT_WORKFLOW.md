# CURRENT WORKFLOW — VERBINDLICHE SINGLE SOURCE OF TRUTH

**Stand: 2026-09-02**

Diese Datei ist die verbindliche Repo-weite Produktionsregel für neue Chats, Codex, Antigravity und andere Repo-Agenten.

## Drei Produktionsphasen

Jedes Reel entsteht in drei Phasen mit klar getrennten Rollen:

1. **ChatGPT** legt das Reel an und schreibt Script, Bildprompts und Effektplan
2. **Arman** erzeugt Voice-over und Bilder und legt beide im Reel-Ordner ab
3. **Antigravity** führt alles zusammen, synchronisiert Bildwechsel/SFX am finalen Voice-over und rendert die MP4

Ausführlich in `WORKFLOW_PHASEN.md`.

## Priorität

1. aktuelle ausdrückliche Nutzeranweisung
2. `CURRENT_WORKFLOW.md`
3. `AGENTS.md`
4. `CODEX_TASK.md`
5. `PRODUCTION_STATUS.md`
6. `docs/` und `knowledge/`
7. ältere Reel-Dateien

## 0. Datensicherheit für Nutzerassets — Hard Gate

Nutzerdateien sind Originale und werden niemals als Wegwerf-Arbeitsdateien behandelt.

- Keine ZIP-, Bild-, Audio- oder Videodatei aus einem **anderen Reel** als Quelle für das aktuelle Reel verwenden.
- Nutzerassets niemals zwischen Reels mit `mv` verschieben.
- Nutzerassets niemals mit `rm`, `rm -rf`, `git clean`, `git checkout` oder vergleichbaren Aufräumkommandos entfernen/zurücksetzen.
- Manuelle Asset-Übernahme ausschließlich als **Kopie**; die Quelldatei bleibt bestehen.
- Bestehende Zieldateien niemals still überschreiben.
- Für einen manuellen Import bevorzugt:

```bash
npm run import:user-asset -- --dir "<aktuelles-reel>" --source "<datei>" --kind images
npm run import:user-asset -- --dir "<aktuelles-reel>" --source "<datei>" --kind audio
```

Der sichere Import blockiert Quellen aus anderen Reels und verwendet exklusives Kopieren ohne Überschreiben.

## 1. Standard eines Erklär-Reels

- 55–60 Sekunden Voice-over, Ziel ca. 58 Sekunden
- 155–175 deutsche Wörter, Ziel ca. 165
- 8–10 narrative Szenen, Standard 9
- ein deutscher Erzähler
- Hook ab Sekunde 0
- letzte zwei Szenen: Erkenntnis-/Prüffrage → konkrete Lösung/Abschlusssatz
- Schlussbild **0,6 Sekunden** nach Sprecherende halten; erlaubt 0,5–0,7 Sekunden
- Voice-over 1,10x bei erhaltener Tonhöhe
- −16 LUFS, höchstens −1,5 dBTP
- keine Untertitel
- kein aktiver Word-Sync für Untertitel
- harte Schnitte
- keine Hintergrundmusik
- jeder Szenenwechsel bekommt einen sauberen kurzen SFX
- jeder interne Bildwechsel bekommt ebenfalls einen kurzen SFX oder einen inhaltlich passenden Objekt-Sound

Die Themenwahl ist offen. Hook, Aha-Moment, Faktentreue, visuelle Klarheit, Abwechslung und Teilbarkeit entscheiden.

**Hook-Gate:** Szene 1 startet ohne Einleitung direkt mit Frage, Überraschung oder klarem Kontrast; generische Einstiege wie „In diesem Video …“ sind nicht zulässig.

## 2. Voice-over — lebendiger statt TTS-neutral

Die Stimme soll nicht wie ein gleichförmiger Vorlesetext klingen.

Für neue Reels gilt:
- Hook neugierig und etwas energischer sprechen
- Schlüsselwörter leicht betonen
- Satzenden nicht immer gleich abfallen lassen
- keine künstlichen langen Mikropausen zwischen kurzen Sätzen
- Erklärteile ruhig und klar, Aha-Momente merklich akzentuieren
- keine übertriebene Werbung, kein Radiomoderator-Stil
- die Stimme bleibt natürlicher Hauptfokus über allen SFX

Audio wird technisch nachbearbeitet:
1. Anfangs-/Endstille und überlange Pausen straffen
2. 1,10x bei erhaltener Tonhöhe
3. auf −16 LUFS normalisieren
4. True Peak höchstens −1,5 dBTP
5. finale Audiodauer messen

Ein Reel darf nicht mehrere Sekunden still weiterlaufen. Nach dem letzten gesprochenen Inhalt folgt ausschließlich der definierte 0,5–0,7-s-Schluss-Hold.

## 3. Reels und YouTube bleiben vollständig getrennt

Für Reels gilt ausschließlich **eine** Bildwelt: **Modern Countryball Explainer** (`modern-countryball-explainer`).

Verbindliche Reel-Quellen:
- `knowledge/fixed-visual-world.md`
- `config/image-styles.json`
- `src/shared/fixed-visual-world.js`

Für YouTube gelten ausschließlich:
- `youtube/YOUTUBE_WORKFLOW.md`
- `youtube/YOUTUBE_VISUAL_WORLD.md`

YouTube-Stick-Figuren/16:9 dürfen nicht auf Reels übertragen werden. Reel-Regeln dürfen nicht auf YouTube übertragen werden.

## 4. Eine einzige Reel-Bildwelt — aber deutlich lebendiger

Der Stil bleibt Modern Countryball Explainer, **die bisherige Poster-Anmutung ist jedoch nicht mehr erwünscht**.

Wenn ein Akteur sinnvoll ist, zeigt das Bild eine eindeutig erkennbare runde Kugelfigur:
- exakt runder Kreis- bzw. Kugelkörper ohne separaten Kopf
- einfache weiße expressive Augen mit schwarzen Pupillen
- minimale Gesichtselemente
- höchstens kleine einfache Arme/Hände/Füße für echte Handlungen
- Flaggen-/Regionsmuster nur bei echter geografischer Relevanz
- sonst neutrale einfarbige Kugeln

Eine Kugelfigur ist nicht in jedem Bild Pflicht. Wenn Gegenstand, Mechanismus, Dokument, Gebäude, Karte, Pflanze, Landschaft oder physischer Prozess klarer erklärt, trägt dieses Motiv die Szene allein.

### Neue Pflicht für die Bildwirkung

Jede Bildphase soll wie ein **konkreter Moment einer visuellen Story** wirken:
- eine sichtbare Handlung, Reaktion, Veränderung oder Ursache-Folge-Beziehung
- ein dominantes Hauptmotiv
- 1–3 unterstützende Elemente
- wenn sinnvoll einfache Tiefe durch Vordergrund/Mittelgrund/Hintergrund
- kräftige, kontrollierte Farbkontraste
- kleine kontextuelle Umgebung statt leerer Fläche, wenn sie die Aussage verbessert
- abwechslungsreiche Perspektiven zwischen direkt aufeinanderfolgenden Bildern

Bevorzugte Perspektiven im Wechsel:
- Close-up
- Medium Shot
- einfache Weitaufnahme
- Objekt-Detail
- Kartenansicht
- leichte Draufsicht
- Off-Center-Komposition

**Verbot als wiederholtes Standardschema:** große Headline + einzelnes Symbol auf leerem Hintergrund.

Weitere Verbote:
- humanoide Cartoonmenschen
- menschliche Köpfe auf Kugeln
- Stick-Figuren
- Fotorealismus
- Anime/Manga
- Clay/Knetstil
- glänzendes 3D / Pixar-Look
- Stockfoto-/Concept-Art-Look
- sterile Icon-Boards
- UI-Karten und schwebende Reaktionskarten
- derselbe Center-Aufbau in mehreren direkt aufeinanderfolgenden Bildern

## 5. Bildtext — Cover Pflicht, danach nur wenn sinnvoll

Der alte Grundsatz „fast jedes Bild braucht Text“ ist aufgehoben.

### Bild 01 / Cover

- starke deutsche Headline Pflicht
- kurze, sofort lesbare Formulierung
- Headline darf nicht die eigentliche Illustration ersetzen

### Alle späteren Bilder

- `imageText` darf leer sein
- wenn Text verwendet wird: 1–4 deutsche Wörter
- ungefähr 35–60 % der Nicht-Cover-Bilder dürfen Text tragen
- ein starkes Bild ohne Text ist ausdrücklich erwünscht
- die Kernaussage muss auch ohne Text visuell erkennbar sein
- kein zusätzlicher lesbarer Text, keine Logos, keine Wasserzeichen

## 6. Bildanzahl folgt dem Satzbau

Narrative Szenenzahl und Bildanzahl sind getrennt.

- 8–10 narrative Szenen, Standard 9
- Hook exakt 1 Bildphase
- jede weitere Szene exakt 2 Bildphasen
- eine dritte Bildphase ist im aktiven Standard nicht vorgesehen
- feste Formel: `1 + (Szenen − 1) × 2`
- 8 Szenen = 15 Bilder
- 9 Szenen = 17 Bilder
- 10 Szenen = 19 Bilder
- jedes Bild mindestens 3 Sekunden sichtbar

Der zweite Bildmoment einer Szene besitzt ein eigenes `audioCue` aus 2–5 tatsächlich gesprochenen Wörtern.

`startPercent` bleibt Planungswert. Sobald das echte Voice-over vorliegt, bestimmt der gemessene Audio-Cue den finalen Schnitt.

## 7. Schnitt-Timing — Bild minimal vor dem Wort

Ein Bildwechsel soll nicht hörbar hinter dem Sprecher herlaufen.

Verbindlicher Standard:
- tatsächlicher Cue-Zeitpunkt = Moment, an dem die Cue-Wörter im finalen Voice-over beginnen
- interner Bildschnitt standardmäßig **0,08 Sekunden vor dem Cue**
- das entspricht bei 30 fps ungefähr **2–3 Frames vor dem Wort**
- Szenenwechsel liegen standardmäßig ungefähr **0,10 Sekunden vor ihrem Szenen-Cue**
- falls dadurch eine Bildphase unter 3 Sekunden fallen würde, hat die Mindestdauer Vorrang und der Cue muss sinnvoller gewählt werden
- kein weicher Crossfade; harter Cut bleibt Standard

Ziel: Das neue Bild ist bereits sichtbar, wenn das Schlüsselwort gesprochen wird.

## 8. Sounddesign — jeder relevante Wechsel muss hörbar unterstützt werden

Für neue Reels gilt:
- jeder Szenenwechsel: ein kurzer SFX
- jeder interne Bildwechsel: ein kurzer SFX oder ein passender Objekt-Sound
- SFX beginnt normalerweise **0,04 Sekunden vor dem Bildschnitt**
- hörbarer Akzent soll am Cut liegen
- Standardlautstärke ungefähr 0,22; sinnvoller Bereich 0,18–0,28
- Stimme bleibt deutlich dominant
- dieselbe Transition-Variante niemals zweimal direkt hintereinander
- Meme-Sounds und aufdringliche Effekte vermeiden

Bevorzugt:
1. inhaltlich passender Sound zum sichtbaren Ereignis
2. sonst Click/Pop/Tick für kleine Informationswechsel
3. sonst dezenter Whoosh/Swipe für reine Übergänge

Kein Bildwechsel soll versehentlich komplett stumm bleiben, wenn dort sichtbar ein neuer Informationsmoment beginnt.

## 9. Bewegung — auch zweite Bildphasen leben

Statische Einzelbilder wirken schnell wie Slides. Deshalb:
- leichte Bewegung ist der Normalfall
- Ken Burns, subtiler Push-in/Pull-out oder kleiner Pan
- Zoomänderung meist nur 2–4 %
- Pan meist maximal ca. 3 %
- weiches Easing
- keine hektischen Zooms
- auch die **zweite Bildphase einer Szene** bekommt standardmäßig eine dezente Bewegung
- nur bewusst grafische/komplexe Bilder dürfen statisch bleiben

Die Bewegung darf integrierten Bildtext nicht aus dem sicheren Bereich schieben.

## 10. Google Flow — genau eine Masterdatei

Die einzige Nutzerdatei mit allen Bildprompts ist:

```text
00-bildprompts/99-alle-bildprompts.txt
```

Der separate `google-flow-controller.txt` bleibt deaktiviert. Alle Steuerregeln stehen direkt im Masterprompt.

### Serielle Flow-Regel

Vor Bild 01 erstellt Flow genau einen gemeinsamen Ausgabeordner für das Reel.

Für jedes Bild:
1. nur aktuellen Bildabschnitt verwenden
2. genau einen Bildgenerator-Aufruf starten
3. vollständig warten
4. Inhalt + Modern Countryball Explainer prüfen
5. zusätzlich prüfen: keine Posterkarte, kein textdominantes Bild, genug visueller Kontext/Tiefe wenn sinnvoll
6. bei Fehler nur dasselbe Bild neu erzeugen
7. `Bild NN.png` exakt umbenennen
8. sofort in den gemeinsamen Reel-Ordner legen
9. Ablage prüfen
10. erst dann nächstes Bild starten

Keine Queue, kein Batch, keine Parallelgenerierung und keine Mehrfachvarianten.

## 11. Sichtbare Reel-Struktur

```text
reel-XX_thema/
├── 00-bildprompts/
│   ├── 99-alle-bildprompts.txt
│   └── 00-ALLE-BILDER-HIER-REIN/
├── 01-voice-script/
├── 02-audio/
├── 03-export/
│   ├── FERTIGES-REEL.mp4
│   └── UNIVERSELLE-CAPTION.txt
└── 99-technik/
```

Kein separater sichtbarer Caption- oder Video-Ordner. Kein `all-image-prompts/`-Doppelordner.

## 12. Universal-Caption

Die Universal-Caption liegt nur unter `03-export/UNIVERSELLE-CAPTION.txt`.

- plattformneutral für Kurzvideo-Social-Media
- passend zum konkreten Reel
- starker klarer Einstieg
- sinnvoll ausführlich
- 60–130 Wörter
- 3–6 passende Hashtags
- keine plattformspezifischen Funktionen wie Duett/Remix/Link in Bio

## 13. Quellen und QC

Neue Reels brauchen mindestens zwei echte HTTPS-Quellen mit unterschiedlichen Hosts. Möglichst eine Primär-/offizielle oder wissenschaftliche Quelle und eine unabhängige Sekundär-/Fachquelle.

Bild-QC prüft:
- konkrete Narration und Bildphase
- Modern Countryball Explainer
- keine Poster-/Headline-plus-Icon-Komposition als Standard
- Text dominiert die Szene nicht
- Perspektive unterscheidet sich sinnvoll vom vorherigen Bild
- sichtbarer deutscher Text exakt, falls Text geplant ist
- keine ungeplanten Texte/Logos/Wasserzeichen
- exakt runde Kugelgeometrie, wenn ein Akteur vorkommt
- keine menschlichen Köpfe, humanoiden Figuren oder Stick-Figuren
- 9:16

Unter 0,90 Zuordnungskonfidenz nicht raten.

## 14. Audio, Timeline und Render

Das finale Voice-over ist die einzige Zeitquelle.

1. Audio importieren
2. Pausen und Endstille straffen
3. 1,10x bei erhaltener Tonhöhe
4. −16 LUFS / max. −1,5 dBTP messen
5. Szenen anhand echter Audio-Cues synchronisieren
6. interne Bildphasen ca. 0,08 s vor ihrem echten Cue schneiden
7. SFX ca. 0,04 s vor dem jeweiligen Cut starten
8. visuelle QC
9. letztes Bild nur 0,5–0,7 s nach Sprecherende halten; Ziel 0,6 s
10. final validieren und rendern

Der aktive Workflow enthält keinen Untertitel- oder Word-Sync-Schritt. `npm run legacy:sync:words` ist Legacy.

## 15. Standardbefehle

```bash
npm run export:prompts -- --dir "<reel-ordner>" --strict
npm run validate:reel -- --dir "<reel-ordner>"
npm run discover:assets -- --dir "<reel-ordner>"
npm run organize:assets -- --dir "<reel-ordner>" --apply
npm run trim:pauses -- --dir "<reel-ordner>" --speed 1.10
npm run build:timeline -- --dir "<reel-ordner>"
npm run check:visuals -- --dir "<reel-ordner>" --strict
npm run finalize:reel -- --dir "<reel-ordner>" --strict
npm run validate:render -- --dir "<reel-ordner>"
npm run render:reel -- --dir "<reel-ordner>"
```

Keine nicht ausgeführte Stufe als bestanden markieren.
