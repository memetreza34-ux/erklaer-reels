# AGENTS.md

`CURRENT_WORKFLOW.md` ist die verbindliche Single Source of Truth. Bei Widersprüchen gilt immer die dort definierte Priorität.

## Drei Produktionsphasen

Phase 1 ChatGPT (Anlegen, Script, Prompts, Motion/SFX) → Phase 2 Arman (Audio, Bilder) → Phase 3 Antigravity (Zuordnung, Sync, QC, Render). Details stehen in `WORKFLOW_PHASEN.md`.

## Antigravity-Autopilot — keine unnötigen Zwischenfragen

Für Phase 3 gilt zusätzlich `ANTIGRAVITY_AUTOPILOT.md`.

Wenn der Nutzer sinngemäß „Mach das Reel fertig“, „Phase 3 starten“, „rendern“ oder „mach weiter bis fertig“ sagt, ist der komplette normale **nicht-destruktive** Phase-3-Lauf freigegeben. Antigravity fragt danach nicht vor jedem einzelnen Routinebefehl erneut um Erlaubnis.

Ohne Zwischenfrage ausführen: Asset-Discovery, sichere Organisation/Kopien, visuelle QC, Audio-Optimierung, Bild↔Audio-Ausrichtung, Sound-Bindung, Timeline, Finalizer, Render-QC, Render und Status-Updates. Eindeutig automatisch behebbaren Fehler zuerst selbst reparieren und den Check wiederholen.

Nur bei echten Blockern stoppen: Reel-Ziel unklar, Pflichtasset fehlt nach vollständiger Suche, destruktiver Eingriff in Nutzeroriginale wäre nötig, Bild-/Audio-Zuordnung bleibt wirklich mehrdeutig, ein Hard Gate lässt sich nicht mit vorhandenen Assets automatisch beheben oder eine externe irreversible/kostenpflichtige Aktion wäre nötig.

Routine-Phase-3 braucht keine Zwischencommits. Kein Commit nur wegen Asset-Suche, Audio-Trim, Timeline oder Render. Wenn wirklich committed wird, bleibt `npm test` vorher Pflicht.

Technischer Fast-Path:

```bash
npm run phase3:reel -- --dir "<reel>"
```

Dieser Lauf ist nicht-interaktiv und stoppt nur bei einem echten fehlgeschlagenen Gate/technischen Fehler. Plattform-/IDE-Sicherheitsdialoge können Repo-Regeln nicht abschalten und müssen weiterhin beachtet werden.

## Nutzerassets schützen

- Nutzerassets sind unveränderliche Originale.
- Nie Assets aus einem anderen Reel als Ersatz verwenden.
- Nie per `mv` zwischen Reels verschieben.
- Nie per `rm`, `git clean`, `git checkout` oder ähnlichem entfernen/zurücksetzen.
- Manuelle Übernahme nur als Kopie und ohne stilles Überschreiben.
- Bevorzugt `npm run import:user-asset -- --dir "<reel>" --source "<datei>" --kind images|audio`.

## Pflicht vor jedem Commit

`npm test` ausführen. **Die Suite muss grün sein.** Wer eine Regel ändert, zieht die zugehörigen Tests und Policy-Dateien mit.

Nicht ausgeführte Tests niemals als bestanden melden.

## Neues Reel

Bei „Mach ein neues Reel“ autonom:

1. nächsten freien Slot bestimmen
2. starkes, belegbares Thema wählen
3. 170–200 deutsche Wörter schreiben
4. 8–10 narrative Szenen planen, Standard 9
5. für jede Bildphase ausschließlich **Serious Minimal Countryball Explainer** verwenden
6. für neue Pakete `imageCountMode: "adaptive-dense-v2"` und `visualDensityVersion: 2` setzen
7. Hook mit 2 Bildern planen; spätere Szenen mit 2 oder 3 Bildern je nach gesprochenem Inhalt
8. Ziel: 8 Szenen 19–21 Bilder, 9 Szenen 20–22, 10 Szenen 21–24
9. **ein Bild = eine klare gesprochene visuelle Kernaussage**; komplexe Ursache→Wirkung-/Anatomie-/Technik-/Studienabschnitte gezielt splitten
10. jede interne Bildphase mit eigenem tatsächlich gesprochenem `audioCue` planen
11. lebendige Bildprompts, Motion-Plan, SFX-Plan, Caption und Quellen fertigstellen
12. keine Untertitel erzeugen
13. `check:content --strict` muss Quellen, Bildstruktur sowie Motion-/SFX-Hard-Gate bestehen
14. nach echten Assets Audio/Timeline/QC und Render nur über bestandene Hard-Gates

Legacy-Pakete mit `one-hook-two-standard` bleiben unterstützt. Neue Phase-1-Reels sollen jedoch Adaptive Dense V2 verwenden.

`sync:words` ist für neue Reels **nicht erforderlich** und gehört nicht zum aktiven Workflow.

## Bildwelten — zwei getrennte Kanäle

Verbindliche Quelle ist **`config/visual-worlds.json`**. Keine Style-ID wird irgendwo sonst neu definiert; Doku und Code lesen ausschließlich von dort.

| Kanal | Bildwelt | Format | Figuren | Ordner |
|---|---|---|---|---|
| Reel | `serious-minimal-countryball-explainer` | 9:16 | Countryball | `reels/` |
| YouTube | `youtube-editorial-stick-explainer` | 16:9 | Stick-Figure | `youtube/` |

Die frühere `modern-countryball-explainer`-Welt ist stillgelegt und in keinem Kanal mehr gültig.

**Die Trennung ist hart.** Eine Bildwelt im falschen Kanal ist ein Hard Blocker, kein Stilfehler:

- keine Countryballs in YouTube-Bildern, keine Stick-Figures in Reel-Bildern
- kein 16:9 im Reel-Ordner, kein 9:16 im YouTube-Ordner
- ein Bild aus einem Kanal wird nie im anderen wiederverwendet
- `assertVisualWorldForChannel()` aus `src/shared/visual-worlds.js` prüft das im Code

Zuordnung prüfen: `npm run check:worlds`

## Script-Aufbau — Frage zuerst

**Jedes Reel beginnt mit der Frage, die es beantwortet.** Der erste Satz startet mit einem
Fragewort und endet mit einem Fragezeichen:

```text
Was ist ein Vetorecht? Ein einziges Land sagt Nein — und niemand kann es überstimmen.
Warum haben Länder Grenzen? Sie wirken selbstverständlich — sind es aber nicht.
```

Nicht erlaubt: mit einer Aussage beginnen und die Frage erst später nachschieben. Der
Zuschauer muss im ersten Satz wissen, worum es geht. Geprüft von
`opensWithQuestion()` in `src/shared/reel-hook-quality.js`; ein Verstoß ist ein Hard Blocker.

Danach folgt immer dieselbe Gliederung:

| Teil | Szenen | Aufgabe |
|---|---|---|
| Hook | 1 | Die Frage stellen |
| Einleitung | 2–3 | Worum es geht und wo es passiert |
| Hauptteil | 3–5 | Wie es funktioniert, Schritt für Schritt |
| Schluss | 2 | Warum das zählt, mit einem Satz, der bleibt |

Die Szenentitel tragen ihren Strukturteil als Präfix (`Hook`, `Einleitung: …`,
`Hauptteil: …`, `Schluss: …`), damit die Gliederung im Reel-Ordner sichtbar bleibt.

## Was ein gutes Script ausmacht

**Klarheitstest:** Wenn jemand den Hook hört und nach zehn Sekunden nicht weiß,
worum es geht, ist er zu schwammig. Zu weich, zu allgemein, zu lang sind die
drei häufigsten Fehler.

**Erklär am Beispiel, nicht an der Definition.** Ein abstrakter Satz wie
"vierzehn Länder dafür, eines dagegen" ist eine Zahl, kein Bild im Kopf. Das
Beispiel muss aus dem Thema selbst kommen, nicht aus einer fremden Welt — für
das Vetorecht also ein Krisenfall im Sicherheitsrat, keine Pizzabestellung.

**Bild 01 ist immer das Cover.** Es ist der erste Frame im Feed und muss ohne Ton
sagen, worum es geht. Seine Headline benennt deshalb das Thema und wird aus dem
Reel-Titel abgeleitet — nicht eine Zwischenaussage aus dem Hook:

```text
Titel "Was ist ein Vetorecht?"  ->  Headline "WAS IST EIN VETORECHT?"
Titel "Warum haben Länder Grenzen?"  ->  "WARUM HABEN LÄNDER GRENZEN?"
```

`deriveCoverHeadline()` schlägt die Headline vor, `coverHeadlineMatchesTopic()` prüft
sie. Eine Headline ohne Themenbezug ist ein Hard Blocker. Die Bilder danach dürfen
freie Zwischenaussagen tragen — Bild 02 löst den Hook auf.

**Bewährte Hook-Formen:**

| Form | Muster |
|---|---|
| Myth | "Alle denken X. Stimmt aber nicht." |
| Problem | "Wenn dein X so aussieht, liegt es daran…" |
| Contra | "Mach diesen Fehler nicht bei X" |
| Mini-Story | "Ich dachte jahrelang X, bis…" |

**Erwartung aufbauen, dann brechen.** Der stärkste Moment entsteht, wenn eine
Szene bewusst eine falsche Erwartung setzt ("klingt nach normaler Abstimmung")
und die nächste sie zerstört ("ist es aber nicht"). Dieser Moment bekommt drei
Bildphasen statt zwei.

**Das Schlussbild greift das Anfangsbild wieder auf.** Wiederholungen und Loops
werden vom Algorithmus stark gewichtet. Nur der Bildtext ändert sich, damit die
Prüfung auf doppelte Bildtexte nicht anschlägt.

**Sprache:** gesprochenes Deutsch. Keine Konjunktive, kein Amtsdeutsch, keine
Inversionen. "Damit etwas durchgeht" statt "für einen Beschluss", "wer einfach
nichts sagt" statt "wer sich enthält".

## Themen — jedes Thema genau einmal

Verbindliche Quelle ist **`config/topics.json`**; `THEMEN_HISTORIE.md` ist die Ansicht davon.

Vor jedem neuen Reel und jedem neuen YouTube-Video:

```bash
npm run check:topic -- "<Thementitel>"
```

Identischer Slug oder identische Kernaussage = Hard Blocker, kanalübergreifend. Hohe Ähnlichkeit wird als Verdachtsfall gemeldet und vom Nutzer entschieden — der Agent entscheidet das nicht selbst. Ein neu gewähltes Thema wird sofort in `config/topics.json` **und** `THEMEN_HISTORIE.md` eingetragen.

### World-Lock vor Bild 01

Der KI-Agent setzt vor dem ersten Bild genau eine feste Projektwelt und behält sie danach bei. Einzelprompts ändern Motiv, Requisiten, Hintergrundfarbe und Perspektive, aber nicht Konturen, Kugelgeometrie, Augen-/Mimik-Sprache, flaches 2D-Rendering, minimale Schatten, Hintergrundlogik oder Typografie.

### Figurenlogik

Wenn Akteure vorkommen:
- perfekt runde Kugelfiguren
- einfache weiße Augen
- reduzierte kontrollierte Mimik
- kein separater Kopf, Hals, Haar oder menschliches Gesicht
- Flaggen nur bei echter geografischer, politischer oder kultureller Relevanz
- sonst neutrale einfarbige Kugeln
- keine zufälligen Zungen, Grimassen oder Gimmicks ohne inhaltlichen Grund

Keine normalen illustrierten Menschen, keine humanoiden Cartoonmenschen und keine Stick-Figuren.

Ein Akteur ist nicht Pflicht. Bei abstrakten, technischen oder medizinischen Aussagen darf ein vereinfachtes Symbol/Objekt die Szene tragen, muss aber dieselbe 2D-Kontur- und Farbsprache behalten.

### Drei Kompositionsmodi

Damit die Serie einheitlich, aber nicht langweilig wird:

1. `minimal-symbolic`: großes Hauptmotiv + 0–1 sinnvolles Symbol
2. `supported-explainer`: Hauptmotiv + 1–3 passende Requisiten/Symbole
3. `simple-mini-scene`: Hauptmotiv + ein einfacher Kontext wie Tür, Tisch, Buch, Grabstein, Spotlight oder Screen

Regeln:
- nicht jedes Bild nur Kugel + leerer Hintergrund
- aber auch keine detaillierten realistischen Räume
- 0–3 Zusatzobjekte sind normalerweise genug
- jedes Zusatzobjekt muss die gesprochene Aussage sichtbar stärken
- keine winzigen Deko-Kugeln
- ein dominantes Motiv pro Bild
- Hintergrund meist einfarbig/gedämpft, leichter Verlauf oder subtile Textur
- seriös, clean, reduziert, nicht kindisch oder übermäßig süß

### Bildwirkung

- ein Bild = eine visuelle Kernaussage
- starke Smartphone-Lesbarkeit
- klare schwarze Konturen
- flache kontrollierte Farben
- minimale grafische Schatten
- kurze symbolische Bildidee oder einfache Mini-Szene
- Komposition zwischen benachbarten Bildern variieren
- keine detaillierten Foto-/Editorial-Menschen-Szenen

Verboten: Fotorealismus, realistische Hände/Haut, normale illustrierte Menschen, realistische Innenräume, Foto+Cartoon, Anime, Clay, 3D/Pixar, Stockfoto-Look, detaillierte 3D-Anatomie, Floating-UI-Boards und überladene Icon-Collagen.

## Bildtext

- Prompts Englisch, sichtbarer Text Deutsch.
- **Flaggen immer einzeln benennen.** "Five flag-patterned countryballs" reicht nicht — das
  Bildmodell erfindet dann Länder. Im Vetorecht-Reel kamen so Deutschland und Brasilien in ein
  Bild über die fünf Vetomächte. Richtig ist die Aufzählung: "United States stars and stripes,
  Russian white-blue-red bands, Chinese red with yellow stars, French blue-white-red vertical
  bands, British union pattern". `check:content` blockiert Prompts, die Flaggen ohne Länder
  verlangen oder deren Länderzahl nicht zur geforderten Ballzahl passt.
- Bild 01 braucht eine starke Headline.
- Danach Text optional; wenn vorhanden maximal 4 Wörter.
- Starke textfreie Bilder sind erwünscht.
- `imageText` leer → kein lesbarer Text.
- Text bevorzugt fett, klar, Smartphone-lesbar, weiß/schwarz mit deutlicher Gegenkontur.

**Hard Gate ab 2026-09-19:** Der geplante `imageText` wird per OCR **im gelieferten Bild**
nachgewiesen, nicht nur im Prompt. Weicht die Headline ab, blockiert das Reel — auch mit
`--force`. Anlass: Das Vetorecht-Cover trug "ENTSCHEIDET DIE MEHRHEIT?" statt der geplanten
Themenfrage "WAS IST EIN VETORECHT?", und jede Prüfung meldete bestanden, weil sie nur den
Prompt gelesen hatte.

## Bildanzahl und Cue-Timing — Adaptive Dense V2

Für neue Phase-1-Pakete:

```text
8 Szenen  → 19–21 Bilder
9 Szenen  → 20–22 Bilder
10 Szenen → 21–24 Bilder
```

- Hook exakt 2 Bildphasen
- jede weitere Szene 2 oder 3
- dritte Phase nur bei echtem neuen visuellen Gedanken
- harte technische Untergrenze ca. 2,2 s pro Bildphase
- häufig guter Bereich 2,5–3,8 s
- ab ca. 4,8 s aktiv Split prüfen
- jede interne Phase mit eigenem gesprochenem `audioCue`
- finaler interner Cut ca. 0,08 s vor Cue
- Szenencut ca. 0,10 s vor Cue
- keine pauschal gleich langen Bildblöcke

## Bildschnitte — am Wort gemessen, nicht geschätzt

Ab 2026-09-19 stammen alle Bildzeitpunkte aus einer Whisper-Wortmessung am **finalen**
Voice-over:

```bash
npm run auto-align:reel -- --dir "<reel>"
```

Der Befehl transkribiert das Voice-over mit Wortzeitstempeln, sucht jeden `audioCue` im
gemessenen Wortstrom und schreibt den echten Zeitpunkt nach `timeline/audio-sync.json`
(`source: "measured-word-timings-v1"`). Das Transkript liegt unter
`timeline/voice-word-timings.json` und ist gegen den SHA-256 der Audiodatei gebunden —
nach jeder Audioänderung misst der Befehl automatisch neu.

Die Suche läuft **monoton**: Ein späterer Bildmoment kann nie vor einem früheren liegen,
sonst zieht eine im Script wiederholte Formulierung den Schnitt an die falsche Stelle.
Deutsche Zahlwörter und Ziffern gelten als dasselbe Wort, weil der Plan "fünfzehn" schreibt
und Whisper "15".

Findet die Messung einen Cue nicht, bricht der Befehl ab und nennt ihn. Dann ist der
`audioCue` an den tatsächlich gesprochenen Wortlaut anzupassen — nicht die Messung zu
umgehen.

**Warum das ein Hard Gate ist:** Bis hierher verteilte `buildSequentialAudioSync` die
Gesamtdauer proportional zum Wortgewicht der Textabschnitte und schrieb das Ergebnis
trotzdem als `audio-synced` und `exact-audio-cue` weg. Am Vetorecht-Reel gegen die echte
Messung geprüft:

```
mittlere Abweichung  1,44 s
größte Abweichung    2,94 s
über 0,25 s daneben  15 von 16 Schnitten
Richtung             durchgehend ZU FRÜH
```

Beim geplanten Schnitt auf "Damit etwas durchgeht" (30,36 s) lief noch der Satz davor
("Die Gewinner des Zweiten Weltkriegs"); das Wort fällt erst bei 33,30 s. Über weite
Strecken sah man also bereits das nächste Bild zum vorherigen Satz.

`--estimate` erzwingt notfalls die alte Schätzung, das Reel gilt dann aber nicht als
audio-synchron und der Render bleibt blockiert.

Nebenwirkung der Messung: Echte Sprechpausen verteilen sich anders als die Schätzung sie
verteilt hat. Bildphasen können dadurch unter die Mindestdauer von 2,2 s fallen — im
Vetorecht-Reel drei Stück bei 1,86 s. Das ist kein neuer Fehler, sondern einer, den die
Schätzung mit gleichmäßigen Dauern kaschiert hat. Behoben wird er in der Planung: in
diesen Szenen eine Bildphase weniger oder einen späteren Cue wählen.

## Bewegung/Zoom — Hard Gate

Für neue Reels ab 2026-09-02 gilt: **Jeder Bildmoment bewegt sich sichtbar.** Kein längerer statischer Stillframe.

Kanonische Typen:
- `ken-burns`
- `subtle-push-in`, `subtle-pull-out`
- `slow-zoom-in`, `slow-zoom-out`
- `pan-left`, `pan-right`, `pan-up`, `pan-down`

Richtwerte:
- Zoom 2–4 %
- Pan 1–3 %
- weiches Easing
- Hook und alle internen Bildphasen bewegen sich ebenfalls
- `none` ist für neue Reels verboten

Bekannte Aliasnamen werden kanonisch aufgelöst; unbekannte Motion-Typen blockieren. Der Renderer besitzt zusätzlich einen Safety-Fallback gegen statische Frames.

**Die Zahlen müssen zum Typnamen passen.** Ein `pan-left` mit `panXPercent: 0` und ein
`slow-zoom-out` mit `1.0 → 1.03` blockieren jetzt. Vorher trug das Vetorecht-Reel zehn
verschiedene Bewegungsnamen und renderte zehnmal denselben 3-Prozent-Push-in.
Tabelle und Richtungsprüfung liegen gemeinsam in `src/shared/camera-motion.js`; Renderer,
Effects-Guard und Timeline benutzen ausschließlich diese eine Quelle. Interne Bildphasen
bekommen automatisch die Gegenbewegung zur Szenenbewegung.

## Soundeffekte — Hard Gate

Sounds werden ausschließlich als `type` aus `config/sound-library.json` geplant.

Pflicht:
- jeder Szenenwechsel nach der Hook: SFX
- **jeder** interne Bildwechsel: eigener SFX oder passender Objekt-Sound
- SFX ca. 0,04 s vor dem sichtbaren Cut starten
- typische Lautstärke 0,18–0,30, Standard ca. 0,22
- Stimme bleibt dominant
- `visualEvent` und `reason` Pflicht
- interne SFX über `targetId` an die konkrete Bildphase binden, auch Bildphase 3
- interne `audioCue`-Angabe muss zur Bildphase passen
- unbekannte Typen oder fehlende Sounddateien blockieren

`sync:sounds --strict` löst Typen gegen die zentrale Bibliothek auf. Falls ein Zwischenplan das `file`-Feld verliert, kann der Renderer bekannte Typen als Safety-Fallback erneut auflösen.

## Audio-Ende — Hard Gate

- Pausen und Endstille straffen
- 1,10x, Pitch erhalten
- −16 LUFS
- max. −1,5 dBTP
- finales Voice-over darf höchstens 0,25 s Endstille enthalten
- danach ausschließlich 0,5–0,7 s visueller Schluss-Hold, Ziel 0,6 s
- mehrsekündiger stiller Video-Nachlauf ist verboten und blockiert Finalizer/Renderer, auch mit `--force`

## Google Flow / KI-Agent

Einzige Nutzerdatei: `00-bildprompts/99-alle-bildprompts.txt`.

Vor Bild 01: neue globale Bildwelt einmal festsetzen. Danach streng seriell:

```text
World-Lock lesen
→ ein Bild erzeugen
→ warten
→ Inhalt + Serious-Minimal-World prüfen
→ normales Menschendesign / realistische Umgebung ablehnen
→ 0–3 Zusatzobjekte nur wenn sinnvoll
→ Bild NN.png
→ ablegen
→ prüfen
→ nächstes
```

Keine Queue, kein Batch, keine Parallelgenerierung.

## Quellen-QC

- mindestens zwei echte HTTPS-Quellen
- unterschiedliche Hosts
- mindestens eine Primär-/offizielle oder wissenschaftliche Quelle
- mindestens eine unabhängige Sekundär-/Fachquelle
- konkrete Belegzuordnung

## Phase 3 / Render

Bevorzugt nach der inhaltlichen Bild↔Audio-Ausrichtung den Ein-Kommando-Fast-Path verwenden:

```bash
npm run phase3:reel -- --dir "<reel>"
```

Der Fast-Path führt seriell Asset-Discovery/-Organisation, visuelle QC, Audio-Optimierung, Sound-Bindung, Timeline, Finalizer, Render-Validierung und Render aus. Bei einem echten Hard-Gate-Fehler stoppt er mit Blockermeldung statt interaktiver Zwischenfrage.

Einzelschritte für Diagnose/Reparatur bleiben verfügbar:

```bash
npm run discover:assets -- --dir "<reel>"
npm run organize:assets -- --dir "<reel>" --apply
npm run check:visuals -- --dir "<reel>" --strict
npm run trim:pauses -- --dir "<reel>" --speed 1.10
npm run sync:sounds -- --dir "<reel>" --strict
npm run build:timeline -- --dir "<reel>" --strict
npm run finalize:reel -- --dir "<reel>" --strict
npm run validate:render -- --dir "<reel>"
npm run render:reel -- --dir "<reel>"
```

### Gates, die `--force` nicht übergeht

| Gate | Blockiert |
|---|---|
| Quellen-QC | fehlende oder unbelegte Quellen |
| Motion/SFX | statische Bildmomente, stumme Wechsel, Bewegung passt nicht zum Typnamen |
| Audio-Dateibindung | Timeline gegen ein anderes Voice-over als das gemessene |
| Endstille | langes stilles Audio-Ende |
| **Bildschnitt** | Zeitpunkte geschätzt statt am Voice-over gemessen, oder Schnitt > 0,25 s neben dem Cue-Wort |
| **Bildstand** | Manifest, Timeline und Bilddateien beschreiben verschiedene Bildfolgen |
| **Bildtext** | geplanter deutscher Text steht nicht im gelieferten Bild (OCR) |

Die letzten drei Gates sind neu. Sie decken die Fehler ab, die im Vetorecht-Reel unbemerkt
bis ins fertige Video durchgelaufen sind: Bildwechsel im Mittel 1,44 s vor dem passenden
Satz, drei importierte Bilder, die in keiner Bildphase vorkamen (Manifest führte 24,
Timeline zeigte 21), und ein Cover mit der falschen Headline.

### Bildwelt — messbar statt erbeten

Der World-Lock nennt fünf Hintergrundfarben, und die visuelle QC misst sie am Bildrand
nach (ΔE ≤ 12 gegen `config/visual-quality-rules.json` → `backgroundPalette`):

```
Tiefes Navy        #222C4C
Warmes Creme       #FAF3DC
Schiefer-Blaugrau  #8A9FA6
Gedämpftes Salbei  #8AB0A8
Warmer Ton         #A08878
```

Die Werte stammen aus den Tönen, die das Bildmodell nachweislich trifft: Im Vetorecht-Reel
lagen 14 von 21 Bildern bereits innerhalb (ΔE 1–9), die 7 Ausreißer bei ΔE 14–25. Ohne
Palette wanderten die Hintergründe über 64 Sekunden durch Navy, Creme, Violett, Rosa,
Lachs, Hellblau und Oliv.

Zusätzlich prüft die QC per OCR, ob sichtbarer Text in der Safe Zone bleibt
(seitlich 6 %, oben 8 %, unten 18 %) — unten liegen im Feed Caption und Buttons darüber.

### Bildauflösung

Bilder müssen **nativ 1080×1920** liefern. Das alte Minimum von 720×1280 hat 768×1376-Bilder
durchgelassen, die der Renderer auf 1080×1920 hochskaliert und die Kamerafahrt noch einmal
vergrößert — das gesamte Vetorecht-Reel läuft dadurch bei rund 69 % der Zielauflösung.

## Finaler Export

```text
03-export/
├── FERTIGES-REEL.mp4
└── UNIVERSELLE-CAPTION.txt
```
