# AGENTS.md

`CURRENT_WORKFLOW.md` ist die verbindliche Single Source of Truth. Bei Widersprüchen gilt immer die dort definierte Priorität.

## Neues Reel

Bei „Mach ein neues Reel“ autonom:

1. nächsten freien Slot bestimmen
2. starkes Thema aus dem offenen Themenuniversum wählen
3. deutsches Voice-over mit 155–175 Wörtern schreiben
4. 12–14 narrative Szenen planen, Standard 13
5. für Cover und jede Bildphase ausschließlich **Modern Countryball Explainer** verwenden
6. Bildanzahl pro Reel und Szene individuell planen
7. Cover + Bildphasen-Prompts + einen seriellen Google-Flow-Gesamtprompt + Universal-Caption + Quellen fertigstellen
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

Jeder Cover-/Szenenprompt ist Englisch und beschreibt den konkreten physischen Moment. Sichtbarer Bildtext ist ausschließlich Deutsch.

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

Pro narrativer Szene normalerweise 1 Bildphase, 2 bei echtem visuellen Fortschritt, 3 nur selten. Wenn ein Still ca. 3,5–4 Sekunden oder länger stehen würde, zusätzliche Phase aktiv prüfen. Keine feste Gesamtbildzahl erzwingen.

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
- COVER / SZENE / BILDPHASE
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

## Untertitel und Audio

- keine Untertitel
- kein aktiver Word-Sync
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
