# Produktionsplan — Liberalismus

## Ziel

Deutsches YouTube-Erklärvideo von ungefähr 2,5 Minuten im Kanalgenre Ideologien / Gesellschaftssysteme / politische Begriffe.

## Thema

**Liberalismus: Freiheit, Rechte und Staat einfach erklärt**

Cover-Text: **WAS IST LIBERALISMUS?**

Themen-Editor: `APPROVED_NEW`.

## Upload-Metadaten

**YouTube-Titel:**
Liberalismus einfach erklärt: Freiheit, Rechte und Staat

**Beschreibung:**
Was bedeutet Liberalismus? Dieses Video erklärt in rund zweieinhalb Minuten, warum individuelle Freiheit und Grundrechte im Zentrum liberaler Ideen stehen, wie die Aufklärung die Entwicklung prägte, worin sich klassische und sozialliberale Positionen unterscheiden und warum die Frage nach der richtigen Rolle des Staates bis heute umstritten ist.

**Tags:**
Liberalismus, Freiheit, Grundrechte, Rechtsstaat, Demokratie, Ideologie, Politik, Aufklärung, John Locke, Marktwirtschaft, Sozialliberalismus, politische Bildung, einfach erklärt

## Phase 1

- Schema 11
- Script Opening Policy V1
- Sprechertext: 427 Wörter
- Adaptive Image Density V3: 32 Bildmomente
- 32 monotone Audioanker
- Bild 01 = Cover + erste Videoszene
- kein Bild 00
- Visual Policy V5
- Design Quality V1
- Adaptive Pacing V3
- aktive Bildwelt: `serious-minimal-countryball-explainer-youtube-16x9`
- nur Countryball-Akteure; keine Menschen/Silhouetten/Hände
- jedes Bild eigener vollständiger Textprompt
- keine Bild-zu-Bild-Referenzen
- SFX selektiv geplant
- Kapitel an Bildnummern gebunden

## Warum 32 Bilder?

Die Bildzahl folgt dem Inhalt. Zusätzliche Splits liegen vor allem bei:
- Frage → Kurzdefinition → Leitfrage im Einstieg
- Selbstbestimmung → Begrenzung staatlicher Macht
- Aufklärung → natürliche Rechte → Zustimmung/Legitimität
- Grundrechte → Verfassung/Gewaltenteilung
- klassischer Liberalismus → Rechtsordnung → Wirtschaft
- negative Freiheit → reale Chancen → soziale Voraussetzungen
- gleiche Rechte → Rechtsstaat
- heutige liberale Institutionen → unterschiedliche Denkschulen
- Schlussdefinition → finale Abwägungsfrage

## Phase 2

Frische Google-Flow-Sitzung verwenden.

```text
Bild 01 exakt 3×
→ 1 Cover auswählen
→ Gewinner zu Bild 01.png
→ andere 2 verwerfen

Bild 02–32
→ jedes Bild genau 1×
→ keine manuelle Wellenprüfung
→ maximal 5 aktive Generierungen gleichzeitig
→ jedes Bild einmal final als Bild NN.png benennen
```

Am Ende exakt `Bild 01.png` bis `Bild 32.png` flach unter `00-bildprompts/images/`.

Danach:

```bash
npm run validate:youtube-phase2 -- --dir "youtube/2026-KW39_21-09_bis_27-09/liberalismus-freiheit-rechte-und-staat"
```

## Audio

1. Nutzeroriginal unverändert lassen.
2. lange Pausen und unnötige Anfangs-/Endstille bereinigen.
3. Produktionsaudio 1,10× bei erhaltener Tonhöhe.
4. −16 LUFS / max. −1,5 dBTP / 48 kHz.
5. erst danach Whisper-Wortzeiten.
6. Timeline anhand echter Wortzeiten.

## Abnahme

Fertig erst wenn:
- Themen-Editor `APPROVED_NEW`
- Script Opening V1 bestanden
- V5 / Design Quality V1 / Adaptive Pacing V3 bestanden
- ausschließlich Countryball-Akteure
- Bild 01 Cover + Timeline-Start + Thumbnail-Quelle
- Cover 3× → 1 Gewinner
- Bild 02–32 je 1×
- finaler Bilderordner exakt sauber
- Audio-Hard-Gate bestanden
- Timeline auf echten Wortzeiten basiert
- Pre-/Post-Render-Gates Exit 0
