# AGENTS.md

`CURRENT_WORKFLOW.md` ist die verbindliche Single Source of Truth. Bei Widersprüchen gilt immer die dort definierte Priorität.

## Drei Produktionsphasen

Phase 1 ChatGPT (Anlegen, Script, Prompts, Effekte) → Phase 2 Arman (Audio, Bilder) →
Phase 3 Antigravity (Zusammenführen, Rendern). Wer welche Befehle ausführt, steht in
`WORKFLOW_PHASEN.md`. Keine Phase überspringt oder übernimmt die Aufgaben einer anderen.

## Harte Datensicherheitsregel für Nutzerassets

Von Menschen erzeugte oder hochgeladene Medien sind **unveränderliche Originale**. Das gilt besonders für ZIPs, Bilder, Audio- und Videodateien in `00-bildprompts/00-ALLE-BILDER-HIER-REIN/`, `02-audio/AUDIO-HIER-EINFUEGEN/`, `inbox/` und `99-technik/inbox/`.

Verbindlich:
- Nutzerassets **niemals mit `mv` aus einem anderen Reel übernehmen**.
- Ein früheres Reel ist **niemals** eine Quelle für fehlende Assets des aktuellen Reels, selbst wenn Dateiname oder Dateityp passen.
- Nutzerassets niemals mit `rm`, `rm -rf`, `git clean`, `git checkout` oder vergleichbaren Aufräumbefehlen entfernen oder zurücksetzen.
- Für manuelle Importe ausschließlich **kopieren**, Quelle unverändert lassen und kein bestehendes Ziel überschreiben.
- Dafür bevorzugt `npm run import:user-asset -- --dir "<aktuelles-reel>" --source "<datei>" --kind images|audio` verwenden. Der Befehl blockiert Quellen aus anderen Reels und Überschreiben.
- Bei fehlenden Dateien nicht in alten Reels nach Ersatz suchen. Stattdessen die aktuellen Eingabeordner, Downloads/Desktop über die vorhandene Discovery prüfen; bleibt das Asset fehlend, als fehlend melden.
- Technische Aufräumlogik darf automatisch nur eigene Symlinks/temporäre Verknüpfungen löschen. Physische Dateien oder Ordner mit möglichem Nutzerinhalt bleiben bestehen.

Diese Regel hat Vorrang vor Bequemlichkeit oder Aufräumzielen. Ein unordentlicher Ordner ist akzeptabel; verlorene Nutzerdaten sind es nicht.

## Pflicht vor jedem Commit

`npm test` ausführen. **Die Suite muss grün sein.** Wer eine Regel ändert, zieht
den zugehörigen Test mit — Test und Code dürfen nie gegenläufige Aussagen treffen.

Wer eine Bildwelt-, Untertitel- oder Workflow-Regel anfasst, ändert sie an **allen**
Stellen gleichzeitig: Runtime unter `src/shared/`, beide Configs unter `config/`,
die Style-Bibel unter `knowledge/` sowie `AGENTS.md`, `CURRENT_WORKFLOW.md`,
`README.md`, `CODEX_TASK.md`, `PRODUCTION_STATUS.md` und `docs/`. Eine halb
umgestellte Regel ist schlimmer als gar keine: Im August 2026 trug das Repo drei
widersprüchliche Bildwelt-Definitionen gleichzeitig, und jeder Agent baute je nach
gelesener Datei ein anderes Reel. `test/visual-world-single-source.test.js` fängt
genau diesen Fall ab.

Die GitHub-Actions-CI startet nicht (Billing), daher greift serverseitig nichts.
Der `pre-push`-Hook unter `scripts/hooks/` ist das einzige Netz.

## Neues Reel

Bei „Mach ein neues Reel“ autonom:

1. nächsten freien Slot bestimmen
2. starkes Thema aus dem offenen Themenuniversum wählen
3. deutsches Voice-over mit 155–175 Wörtern schreiben
4. 8–10 narrative Szenen planen, Standard 9
5. für jede Bildphase ausschließlich **Modern Countryball Explainer** verwenden
6. Bildanzahl pro Reel und Szene individuell planen
7. Bildphasen-Prompts + einen seriellen Google-Flow-Gesamtprompt + Universal-Caption + Quellen fertigstellen; Szene 1 ist zugleich das Titelbild
8. keine Untertitel erzeugen
9. externe Assets zuerst suchen, bevor etwas als fehlend gemeldet wird
10. Assets visuell prüfen, Audio synchronisieren und nur nach echten QC-Gates rendern

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

Es gibt **genau eine** aktive Reel-Bildwelt. Keine Menschen-/Köpfe-Welt, keine zweite Clarity-Welt und keine themenspezifischen Unter-Bildwelten.

### Kugelfiguren

Wenn ein Akteur sinnvoll ist, muss er eindeutig als runde Kugelfigur lesbar sein:
- exakt runder Kreis- bzw. Kugelkörper ohne separaten Kopf
- einfache weiße expressive Augen mit schwarzen Pupillen
- minimale Gesichtselemente, nur wenn sie die Aussage tragen
- höchstens kleine einfache Arme, Hände oder Füße für konkrete Handlungen
- Flaggen-/Regionsmuster nur bei echter geografischer Relevanz, sonst neutrale einfarbige Kugeln
- einzelne Kugel, kleine Kugelgruppe, Kugel plus Objekt oder Kartenansicht je nach Szene

Eine Kugelfigur ist **nicht in jedem Bild Pflicht**. Wenn ein Objekt, Mechanismus, Dokument, Gebäude, Karte, Pflanze, Landschaft oder physischer Prozess klarer erklärt, darf dieses Motiv alleine verwendet werden — in derselben Kontur- und Formsprache. Keine Kugelfigur nur zur Dekoration hinzufügen.

### Verboten

- menschliche Köpfe auf Kugelfiguren
- humanoide Cartoonmenschen als Akteure
- Stick-Figuren
- ovale, bohnenförmige oder eiförmige Figurenkörper
- Fotorealismus
- Anime/Manga
- Clay/Knetstil
- glänzendes 3D / Pixar-Look
- technische Cutaway-/Blueprint-Welt als Standard
- eigene Unter-Bildwelt pro Thema
- generische Icon-Boards, Floating Cards und wiederholte Figur-mittig-plus-Icons-Kompositionen

Länder, Regierungen und Institutionen werden durch flaggenmarkierte oder neutrale Kugeln mit Karten, Grenzen, Dokumenten oder Gebäuden dargestellt, nicht durch realistische Menschen.

### Gestaltung

- 9:16
- sauberer flacher 2D-Vektor-/Comic-Look
- dicke schwarze Konturen
- niedrige bis mittlere Detaildichte
- flächige oder sehr leicht schattierte Farben
- ruhiger einfarbiger oder sanft texturierter Hintergrund
- normalerweise klare helle grafische Beleuchtung
- ein dominantes Hauptmotiv
- eine sichtbare Handlung oder Ursache-Folge-Beziehung
- 1–3 unterstützende Elemente
- möglichst innerhalb einer Sekunde verständlich

**Erst konkrete Szene, dann zusätzliche Symbole.**

## Bildprompts

Jeder Szenenprompt ist Englisch und beschreibt den konkreten physischen Moment. Sichtbarer Bildtext ist ausschließlich Deutsch.

Jeder Prompt enthält:
1. 9:16
2. Kernaussage
3. Hauptmotiv
4. Ort/Umgebung
5. sichtbare Handlung
6. passenden Bildausschnitt: einzelne Kugel, Kugelgruppe, Kugel plus Objekt, Kartenansicht, Close-up, Objekt oder Umgebung
7. wenige Requisiten
8. exakt erlaubten deutschen Text, falls vorhanden
9. kein zusätzlicher lesbarer Text, keine Logos/Wasserzeichen

## Narrative Szenen ≠ Bildanzahl

**Jede Standardszene bekommt zwei Bildmomente, die Hook einen.**

8–10 narrative Szenen, Standard 9. Hook 4,5–6 Sekunden mit einem Bild, Standardszene 6–7,5 Sekunden mit zwei Bildern. Ein Bild steht 3 bis 4 Sekunden, im Schnitt 3,25 — bei rund 58 Sekunden ergibt das ungefähr 17 bis 19 Bilder.

Harte Untergrenze: **3 Sekunden** pro Bild. Kürzere Phasen blockiert der Timeline-Check. Drei Bilder in einer 6,5-Sekunden-Szene fallen darunter; eine Szene, die drei Bildmomente braucht, gehört aufgeteilt.

`startPercent` setzt den Schnitt auf den nächsten Satzanfang, nicht auf ein gleichmäßiges Raster.

## Google Flow — nur eine Masterdatei

Verbindliche Nutzerdatei:

```text
00-bildprompts/99-alle-bildprompts.txt
```

Es gibt keine zweite Kopie unter `all-image-prompts/`. Der alte Doppelordner ist Legacy und wird entfernt.

Der separate `google-flow-controller.txt` ist deaktiviert. Alle Steuerregeln stehen in der einen Masterdatei.

### Hard Serial Lock

```text
nur aktuellen Bildabschnitt ausführen
→ genau 1 Bildgenerator-Aufruf
→ vollständig warten
→ gegen Prompt UND Modern Countryball Explainer prüfen
→ exakt als Bild NN.png umbenennen
→ in den gemeinsamen Reel-Ausgabeordner legen
→ Ablage prüfen
→ erst dann nächstes Bild
```

Keine Queue, kein Batch, keine Parallelgenerierung, keine Mehrfachvarianten.

## Workflow-Metadaten nie im Bild

Verboten als sichtbarer Bildtext:
- Bildnummern
- TITELBILD / SZENE / BILDPHASE
- DATEINAME und Dateinamen
- GOOGLE FLOW / PROMPT / STYLE-REFERENZ / ZIEL

`imageText` gesetzt → nur exakt dieser deutsche Text. Leer → kein lesbarer Text.

## Quellen-QC

Neue Reels:
- mindestens zwei echte HTTPS-Quellen
- unterschiedliche Hosts
- möglichst mindestens eine Primär-/offizielle oder wissenschaftliche Originalquelle
- mindestens eine unabhängige Sekundär-/Fachquelle
- konkret dokumentieren, welche Reel-Aussage belegt wird

## Soundeffekte

Sounds werden **nur als `type`** aus `config/sound-library.json` geplant, niemals als Dateiname. Verfügbare Typen anzeigen:

```bash
npm run sync:sounds -- --types
```

- null bis zwei pro narrativer Szene, oft null
- nur an einem **sichtbaren** Ereignis, nicht an einer bloßen Aussage
- `visualEvent` und `reason` sind Pflicht
- `file` und `volume` trägt das System ein
- Zuordnungstabelle in `knowledge/effects-rules.md`

## Untertitel und Audio

- keine Untertitel
- kein aktiver Word-Sync
- `sync:words` ist für neue Reels nicht erforderlich und bleibt Legacy (`npm run legacy:sync:words`, siehe `LEGACY_TOOLS.md`)
- keine Subtitle-Safe-Zone
- finales Audio ist einzige Zeitquelle
- Pausen straffen
- 1,10x, Pitch erhalten
- −16 LUFS
- max. −1,5 dBTP
- Szenen über echte Audio-Cues synchronisieren

## Asset-Zuordnung

Dateinummer ist nur Routing-Hilfe. Bilder tatsächlich gegen Narration, Bildtext, Prompt, Modern Countryball Explainer und benachbarte Bildphasen prüfen. Unter 0,90 Konfidenz nicht raten.

## Finaler Reel-Export

```text
03-export/
├── FERTIGES-REEL.mp4
└── UNIVERSELLE-CAPTION.txt
```

Kein separater sichtbarer Caption- oder Video-Ordner.

## Render

Nur nach tatsächlich bestandenen Prüfungen. Nicht ausgeführte Tests, QC-Stufen oder Render niemals als bestanden melden.
