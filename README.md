# Erklär-Reels

Produktionspipeline für visuelle Erklär-Reels mit offenem Themenuniversum und **einer einzigen festen Reel-Bildwelt**.

**`CURRENT_WORKFLOW.md` ist die Single Source of Truth.**

## Produktionsstandard

- 55–60 Sekunden Voice-over
- 155–175 deutsche Wörter
- 8–10 narrative Szenen, Standard 9
- Hook mit einem Bildmoment, jede weitere Szene mit zwei
- bei 9 Szenen ergibt das 17 Bilder
- Voice-over 1,10x bei erhaltener Tonhöhe
- −16 LUFS, höchstens −1,5 dBTP
- keine Untertitel
- kein aktiver Word-Sync-Workflow
- harte Schnitte
- keine Hintergrundmusik
- Schlussbild 0,7 Sekunden nach dem letzten gesprochenen Wort halten

## Eine feste Reel-Bildwelt — Modern Countryball Explainer

Für alle neuen Reels gilt **genau eine** Bildwelt: **Modern Countryball Explainer** (`modern-countryball-explainer`).

Wenn ein Akteur vorkommt, ist er eine runde Kugelfigur:
- exakt runder Kreis- bzw. Kugelkörper ohne separaten Kopf
- einfache weiße expressive Augen mit schwarzen Pupillen
- minimale Gesichtselemente
- höchstens kleine einfache Arme, Hände oder Füße für konkrete Handlungen
- Flaggen-/Regionsmuster nur bei echter geografischer Relevanz, sonst neutrale einfarbige Kugeln
- einzelne Kugel, kleine Kugelgruppe, Kugel plus Objekt oder Kartenansicht je nach Szene

Eine Kugelfigur ist **nicht in jedem Bild Pflicht**. Ein Objekt, Mechanismus, Dokument, Gebäude, Karte, Pflanze, Landschaft oder physischer Prozess darf Hauptmotiv sein, wenn die Aussage dadurch klarer wird — in derselben Kontur- und Formsprache. Es wird keine Kugelfigur nur zur Dekoration erzwungen.

Nicht Teil der Reel-Bildwelt:
- menschliche Köpfe auf Kugelfiguren
- humanoide Cartoonmenschen als Akteure
- Stick-Figuren
- ovale, bohnenförmige oder eiförmige Figurenkörper
- Fotorealismus
- Anime/Manga
- Clay/Knetstil
- glänzendes 3D / Pixar-Look
- technische Cutaway-/Blueprint-Welt als Standard
- eigene Unter-Bildwelt für Technik, Flugzeuge, Medizin, Geschichte usw.

Länder, Regierungen und Institutionen werden durch flaggenmarkierte oder neutrale Kugeln mit Karten, Grenzen, Dokumenten oder Gebäuden dargestellt — nicht durch realistische Menschen.

Gestaltung:
- 9:16, Smartphone-first
- sauberer flacher 2D-Vektor-/Comic-Look
- dicke schwarze Konturen
- niedrige bis mittlere Detaildichte
- flächige oder sehr leicht schattierte Farben
- ruhiger einfarbiger oder sanft texturierter Hintergrund
- klare, normalerweise helle grafische Beleuchtung
- eine dominante Kernaussage
- eine sichtbare Handlung oder Ursache-Folge-Beziehung
- 1–3 unterstützende Elemente
- möglichst in etwa einer Sekunde verständlich

Vollständige Style-Bibel:

```text
knowledge/fixed-visual-world.md
```

Maschinenlesbare Konfiguration:

```text
config/image-styles.json
```

Es gibt **keine zweite Reel-Style-ID und keine Legacy-Menschen-/Köpfe-Bildwelt**. Die aktive Reel-ID ist ausschließlich `modern-countryball-explainer`.

## Google Flow — nur eine Datei

Die einzige Masterdatei mit allen Bildprompts ist:

```text
00-bildprompts/99-alle-bildprompts.txt
```

Es gibt keine zweite Spiegeldatei unter `all-image-prompts/`. Der alte Doppelordner ist Legacy und wird entfernt.

Flow arbeitet streng seriell:

```text
Bild erzeugen → vollständig warten → prüfen → umbenennen → in gemeinsamen Ausgabeordner legen → Ablage prüfen → nächstes Bild
```

Keine Queue, kein Batch, keine Parallelgenerierung.

Fertige Bilder werden als `Bild 01.png`, `Bild 02.png` usw. gemeinsam importiert nach:

```text
00-bildprompts/00-ALLE-BILDER-HIER-REIN/
```

## Sichtbare Reel-Struktur

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

Kein separater sichtbarer Caption- oder Video-Ordner.

## Universal-Caption

`03-export/UNIVERSELLE-CAPTION.txt` ist die plattformneutrale Caption für Kurzvideo-Social-Media:
- passend zum konkreten Video
- starker klarer Einstieg
- 60–130 Wörter
- 3–6 passende Hashtags
- keine plattformspezifischen Duett-/Remix-/Link-in-Bio-Hinweise

## Reels und YouTube

Reels und YouTube bleiben vollständig getrennt. Für YouTube gelten ausschließlich:

```text
youtube/YOUTUBE_WORKFLOW.md
youtube/YOUTUBE_VISUAL_WORLD.md
```

Die YouTube-Stick-Figure-/16:9-Welt darf nicht auf Reels übertragen werden und umgekehrt.

## Quellen, Assets und Render

Mindestens zwei nachvollziehbare HTTPS-Quellen mit unterschiedlichen Hosts verwenden; möglichst eine Primär-/offizielle oder wissenschaftliche Quelle plus eine unabhängige Sekundärquelle.

Vor einer Meldung, dass Assets fehlen:

```bash
npm run discover:assets -- --dir "PFAD-ZUM-REEL"
```

Sichere Zuordnung:

```bash
npm run organize:assets -- --dir "PFAD-ZUM-REEL" --apply
```

Audio und Render:

```bash
npm run trim:pauses -- --dir "PFAD-ZUM-REEL" --speed 1.10
npm run build:timeline -- --dir "PFAD-ZUM-REEL"
npm run check:visuals -- --dir "PFAD-ZUM-REEL" --strict
npm run finalize:reel -- --dir "PFAD-ZUM-REEL" --strict
npm run validate:render -- --dir "PFAD-ZUM-REEL"
npm run render:reel -- --dir "PFAD-ZUM-REEL"
```

Keine nicht ausgeführte Stufe als bestanden ausgeben.

## Voraussetzungen

- Node.js 20 oder neuer
- FFmpeg und optional `ffprobe`
- Remotion-Pakete in identischer Version

## Tests und Schutz vor Regressionen

Die vollständige Suite läuft mit:

```bash
npm test
```

**Die Suite muss vor jedem Commit grün sein.** Sie ist kein Beiwerk: mehrere
Tests halten Regeln fest, die sonst still auseinanderlaufen — etwa
`visual-world-single-source`, der prüft, dass Runtime, Configs und alle
Policy-Dateien dieselbe Bildwelt nennen.

### Zwei Netze

**GitHub Actions** ist die serverseitige Pflichtkontrolle: Jeder Push auf `main` und
jeder Pull Request lässt die vollständige Suite laufen.

**Der `pre-push`-Hook** ist die lokale Schutzschicht davor. Er lässt die Suite schon
vor dem Push laufen, damit eine rote Suite gar nicht erst im Remote landet.
`npm install` aktiviert ihn automatisch; von Hand:

```bash
npm run hooks:install
```

Im Notfall umgehbar mit `git push --no-verify`. Das sollte die Ausnahme bleiben:
Ohne diesen Hook fällt eine rote Suite überhaupt nicht auf.
