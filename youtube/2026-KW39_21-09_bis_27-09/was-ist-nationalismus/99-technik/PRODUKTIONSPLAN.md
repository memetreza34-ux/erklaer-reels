# Produktionsplan — Nationalismus: Wie funktioniert diese Ideologie?

## Ziel

Deutsches YouTube-Erklärvideo von ungefähr 2,5 Minuten im Kanalgenre Ideologien / Gesellschaftssysteme / politische Begriffe.

## Themen-Editor

**Ergebnis vor Projekterstellung:** `APPROVED_NEW`

Geprüft gegen:
- `THEMEN_HISTORIE.md`
- `config/youtube-topic-registry.json`
- vorhandene `youtube/**/99-technik/video.json`

Das bereits vorhandene Reel `Sozialismus einfach erklärt` ist kein Duplicate: Es behandelt eine andere Ideologie mit anderer Kernfrage.

## Titel

**Nationalismus: Wie funktioniert diese Ideologie?**

Cover-Text: **WAS IST NATIONALISMUS?**

## Upload-Metadaten

**YouTube-Titel:**
Nationalismus: Wie funktioniert diese Ideologie?

**Beschreibung:**
Was bedeutet Nationalismus eigentlich – und worin unterscheidet er sich von Patriotismus? Dieses Video erklärt Nation und Staat, die historische Entwicklung des Nationalismus seit dem späten 18. Jahrhundert, unterschiedliche Formen, Selbstbestimmung sowie die Risiken von Ausgrenzung und Überlegenheitsdenken.

**Tags:**
Nationalismus, Nation, Patriotismus, Ideologie, Politik, Geschichte, Volkssouveränität, Selbstbestimmung, Nationalstaat, Staatsbürgerschaft, politische Bildung, einfach erklärt

## Phase 1

- Themen-Editor: `APPROVED_NEW`
- Recherche: vollständig
- Sprechertext: 438 Wörter
- Ziel nach Audiooptimierung: ca. 150 Sekunden
- Adaptive Image Density V3: 28 Bildmomente
- durchschnittliche geplante Bilddauer: ca. 5,5 s
- Bild 01 = Cover + erste Videoszene
- kein Bild 00
- 28 monotone Audioanker
- Visual Policy V5
- Design Quality V1
- Adaptive Pacing V3
- Cover Policy V1
- Asset Generation Policy V1
- aktive Bildwelt: `serious-minimal-countryball-explainer-youtube-16x9`
- dieselbe Countryball-DNA wie die Reels, nur 16:9
- Premium Design Layer verbessert nur Komposition und Art Direction, nicht die Bildwelt
- jedes Bild eigener vollständiger Textprompt
- keine Bild-zu-Bild-Referenzen
- SFX selektiv geplant
- Kapitel an Bildnummern gebunden

## Warum 28 Bilder?

Die Bildzahl ist nicht aus einer festen Quote entstanden. Mehrere dichte Abschnitte wurden bewusst geteilt:
- Nation vs. Staat
- Volkssouveränität als historische Ursache
- Einigung vs. Unabhängigkeit vs. Antikolonialismus
- staatsbürgerliche vs. kulturelle Nationsvorstellungen
- Patriotismus vs. Nationalismus
- Zusammenhalt vs. Ausgrenzung
- heutige Anwendungsfelder vs. unterschiedliche politische Akteure

Damit muss kein einzelnes Bild gleichzeitig zu viele Aussagen tragen.

## Phase 2

Frische Google-Flow-Sitzung verwenden.

```text
Bild 01 exakt 3× erzeugen
→ genau 1 Cover auswählen
→ Gewinner zu Bild 01.png umbenennen
→ andere 2 verwerfen

Bild 02–28
→ jedes Bild genau 1×
→ keine manuelle Wellenprüfung
→ maximal 5 aktive Generierungen gleichzeitig
→ jedes Bild einmal final als Bild NN.png benennen
```

Am Ende müssen exakt `Bild 01.png` bis `Bild 28.png` flach unter `00-bildprompts/images/` liegen.

Danach:

```bash
npm run validate:youtube-phase2 -- --dir "youtube/2026-KW39_21-09_bis_27-09/was-ist-nationalismus"
```

## Audio

1. Nutzeroriginal unverändert lassen.
2. lange Pausen und unnötige Anfangs-/Endstille bereinigen.
3. internes Produktionsaudio exakt 1,10× bei erhaltener Tonhöhe.
4. −16 LUFS / max. −1,5 dBTP / 48 kHz.
5. erst danach Whisper-Wortzeiten messen.
6. Timeline anhand der echten Wortzeiten bauen.

## Abnahme

Fertig erst wenn:
- Themen-Editor weiterhin `APPROVED_NEW` liefert
- V5 / Design Quality V1 / Adaptive Pacing V3 bestehen
- Bildwelt Countryball bleibt
- Bild 01 Cover + Timeline-Start + Thumbnail-Quelle ist
- Cover 3× → 1 Gewinner
- Bild 02–28 jeweils 1×
- keine Referenzbilder
- finaler Bilderordner exakt sauber ist
- Audio-Hard-Gate bestanden ist
- Timeline auf echten Wortzeiten basiert
- Pre-/Post-Render-Gates Exit 0 liefern
