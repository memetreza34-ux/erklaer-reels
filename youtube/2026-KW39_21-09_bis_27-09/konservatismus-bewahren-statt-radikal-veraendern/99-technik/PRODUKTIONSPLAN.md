# Produktionsplan — Konservatismus

## Ziel

Deutsches YouTube-Erklärvideo von ungefähr 2 Minuten im Kanalgenre Ideologien / Gesellschaftssysteme / politische Begriffe.

## Thema

**Konservatismus: Bewahren statt radikal verändern?**

Cover-Text: **WAS IST KONSERVATISMUS?**

Themen-Editor: `APPROVED_NEW`.

## Upload-Metadaten

**YouTube-Titel:**
Konservatismus einfach erklärt: Was will er eigentlich bewahren?

**Beschreibung:**
Was ist Konservatismus? Dieses Video erklärt in rund zwei Minuten, warum konservatives Denken Bewährtes schützen und Veränderungen eher schrittweise gestalten will, welche Rolle die Französische Revolution und Edmund Burke spielen, warum Konservatismus nicht automatisch gegen jede Reform ist und weshalb konservative Positionen je nach Land und Zeit unterschiedlich aussehen.

**Tags:**
Konservatismus, konservativ, politische Ideologien, Edmund Burke, Französische Revolution, Tradition, Reform, Rechtsstaat, Politik, Demokratie, politische Bildung, einfach erklärt

## Phase 1

- Schema 12
- Script Opening Policy V1
- Scene Illustration Policy V2
- Topic Visual Relevance Policy V1
- End Hold Policy V1
- Sprechertext: 365 Wörter
- Adaptive Image Density V3: 26 Bildmomente
- 26 monotone Audioanker
- Bild 01 = Cover + erste Videoszene
- kein Bild 00
- Visual Policy V5
- Design Quality V1
- Adaptive Pacing V3
- aktive Bildwelt: `serious-minimal-countryball-explainer-youtube-16x9`
- keine Menschen/Silhouetten/realistischen Hände/humanoiden Figuren
- jeder Bildmoment besitzt einen konkreten Topic Anchor
- jedes Bild eigener vollständiger Textprompt
- keine Bild-zu-Bild-Referenzen
- SFX selektiv geplant
- Kapitel an Bildnummern gebunden
- Schluss-Hold: 1,3 s

## Warum 26 Bilder?

Die Bildzahl folgt dem Inhalt. Zusätzliche Splits liegen vor allem bei:
- Frage → Kurzdefinition → Leitfrage im Einstieg
- Begriff `conservare` → Französische Revolution → konservative Kernfrage
- Edmund Burke → Reform ist möglich → komplexe Institutionen
- gewachsene Erfahrung → radikaler Komplettaustausch → schrittweise Reform
- reparieren → funktionierende Strukturen bewahren → Stabilität
- unterschiedliche Bewahrungsziele → Rechtsstaat → Wandel je nach Epoche
- Wirtschaft: Vielfalt → Markt/Eigentum → größerer Staat
- konservativ vs. reaktionär → demokratische Gegenwart → Schlusskern

## Phase 2

Frische Google-Flow-Sitzung verwenden.

```text
Bild 01 exakt 3×
→ 1 Cover auswählen
→ Gewinner zu Bild 01.png
→ andere 2 verwerfen

Bild 02–26
→ jedes Bild genau 1×
→ keine manuelle Wellenprüfung
→ maximal 5 aktive Generierungen gleichzeitig
→ jedes Bild einmal final als Bild NN.png benennen
```

Am Ende exakt `Bild 01.png` bis `Bild 26.png` flach unter `00-bildprompts/images/`.

Danach:

```bash
npm run validate:youtube-phase2 -- --dir "youtube/2026-KW39_21-09_bis_27-09/konservatismus-bewahren-statt-radikal-veraendern"
```

## Audio

1. Nutzeroriginal unverändert lassen.
2. lange Pausen und unnötige Anfangs-/Endstille bereinigen.
3. Produktionsaudio 1,10× bei erhaltener Tonhöhe.
4. −16 LUFS / max. −1,5 dBTP / 48 kHz.
5. erst danach Whisper-Wortzeiten.
6. Timeline anhand echter Wortzeiten.
7. finales Bild nach dem letzten Wort 1,3 s halten.

## Abnahme

Fertig erst wenn:
- Themen-Editor `APPROVED_NEW`
- Script Opening V1 bestanden
- V5 / Design Quality V1 / Adaptive Pacing V3 bestanden
- Scene Illustration V2 und Topic Visual Relevance V1 bestanden
- jeder Bildmoment einen konkreten Topic Anchor besitzt
- keine zufälligen Nationen/Flaggen
- Bild 01 Cover + Timeline-Start + Thumbnail-Quelle
- Cover 3× → 1 Gewinner
- Bild 02–26 je 1×
- finaler Bilderordner exakt sauber
- Audio-Hard-Gate bestanden
- Timeline auf echten Wortzeiten basiert
- Schluss-Hold 1,2–1,5 s, Ziel 1,3 s
- Pre-/Post-Render-Gates Exit 0
