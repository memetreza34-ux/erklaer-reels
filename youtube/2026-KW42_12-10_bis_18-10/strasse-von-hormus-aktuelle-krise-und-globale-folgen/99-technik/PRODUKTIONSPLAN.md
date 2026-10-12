# Produktionsplan — Straße von Hormus: Warum die Meerenge die Welt unter Druck setzt

**Weltlogik / KW42, 12.–18.10.2026** · **Faktenstand 12.10.2026**  
**Video:** 976 deutsche Wörter, 64 adaptive Bildmomente, 16:9, ca. 6–7 Minuten Ziel.  
**Format:** Politik, Geografie, internationale Beziehungen, aktueller Nachrichtenanlass. Keine Geschichtsdokumentation.

## Redaktioneller Spannungsbogen

1. Ab Bild 01: Die neuen Angriffe
2. Ab Bild 09: Die Geografie der Engstelle
3. Ab Bild 18: Warum so viel Öl dort entlangfährt
4. Ab Bild 27: Warum die Krise politisch ist
5. Ab Bild 36: Weshalb Tanker nicht einfach ausweichen
6. Ab Bild 46: Wie die Folgen im Alltag ankommen
7. Ab Bild 55: Was jetzt passieren könnte

## Bildwelt und Produktion

Exakt `serious-minimal-countryball-explainer-youtube-16x9`. Countryballs nur bei staatlichem Handeln; sonst konkrete geografische Karte, LNG-/Öltanker, Hafen, Pipeline, Seeweg und Gegenstände. Hauptziel: genau gesprochene Ursache → geografische Mechanik → Folgen. 64 stand-alone englische Google-Flow-Einzelprompts, sichtbare Wörter nur Deutsch. Kein 3D, Fotorealismus, normale Menschen oder unpassende Flaggen.

**Phase 1 Qualitätsprüfung:**
```bash
npm run validate:youtube-phase1 -- --dir "youtube/2026-KW42_12-10_bis_18-10/strasse-von-hormus-aktuelle-krise-und-globale-folgen"
```

## Phase 2 — Nutzer + Google Flow
- Separates Cover **genau drei Varianten**, einen Gewinner unter `03-export/THUMBNAIL.png` ablegen.
- Normale Bilder `Bild 01.png` bis `Bild 64.png` mit maximal fünf laufenden Generierungen, jedes genau einmal erfolgreich, keinerlei Cover in der Timeline.
- Falls Flow Dateien nicht zurückliefert, jede **fehlende** Nummer feststellen und nur fehlende Bilder nachholen, exakt benennen. Danach alle 64 Dateinamen und Anzahl erneut prüfen.
- Genau ein finales Nutzer-Voice-over unter `02-audio/voiceover-final.wav`. Nutzeroriginal unangetastet lassen.
- Test: `npm run validate:youtube-phase2 -- --dir "youtube/2026-KW42_12-10_bis_18-10/strasse-von-hormus-aktuelle-krise-und-globale-folgen"` (nur nach tatsächlich vorhandenem Audio/Assets).

## Phase 3 — erst nach Phase 2

```bash
npm run phase3:youtube -- --dir "youtube/2026-KW42_12-10_bis_18-10/strasse-von-hormus-aktuelle-krise-und-globale-folgen"
```

Audio auf 1,10x, −16 LUFS, max. −1,5 dBTP. Danach Wortzeiten über echtes Whisper, Bild↔Sprache, Motion/SFX, Schlussbild 1,3 Sekunden nach letztem Wort, Video-/Cover-QC, dann Post-Video-Lernschleife. Ohne echte Bilder und Audio **kein behaupteter fertiger Render**.

## 03-export — am Ende exakt vier Dateien

```text
FERTIGES-VIDEO.mp4
THUMBNAIL.png
YOUTUBE-UPLOAD.txt
YOUTUBE-UNTERTITEL-ZEITABSCHNITTE.txt
```

`YOUTUBE-UPLOAD.txt` ist schon als vorbereitete Datei da. MP4, PNG und tatsächliche Whisper-Zeiten werden erst aus den finalen Medien erzeugt.

**Aktualitäts-Gate:** Vor Veröffentlichung Änderungen an Kriegs-/Durchfahrtsstatus gegen datierte Primär- und Reuters/AP-Quellen prüfen; nicht auf historische Stand-12.10.-Daten als Live-News verlassen.
