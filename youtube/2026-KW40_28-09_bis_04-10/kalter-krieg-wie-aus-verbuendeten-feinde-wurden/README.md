# Kalter Krieg: Wie aus Verbündeten Feinde wurden

YouTube-Langvideo · Ziel **6–7 Minuten** · Deutsch · Schema 13 · Visual Policy V5 · Visual Flexibility V1.

## Ziel

Ein fließendes historisches Erklärvideo mit klarer Einleitung, durchgehendem Hauptteil und echtem Schluss. Die rund sieben Minuten werden nicht mit Füllstoff gestreckt, sondern für einen vollständigen roten Faden genutzt: 1945 → frühe Blockbildung → Berlin → NATO/Warschauer Pakt → Wettrüsten → Weltraum → Stellvertreterkriege → Berliner Mauer → Kubakrise → Détente → Afghanistan → Gorbatschow → 1989/91 → Schlussanalyse.

## Sprechertext

- 1011 Wörter
- Zielzeit nach Audiooptimierung: ca. 6:20–7:00
- direkte Zuschauerfrage nach Script Opening V1
- kein Listen-/Schulbuchstil; Übergänge sind im Text ausformuliert
- Schluss beantwortet nicht nur „was geschah?“, sondern **warum der Konflikt so lange dauerte**

## Bildplanung

- **74 inhaltsgetriebene Bildmomente**
- geplante Bildzeit insgesamt: ca. 415 s vor echtem Audio-Alignment
- Bilddichte bewusst höher als bei den 2-Minuten-Testvideos
- Karten bei räumlicher Geschichte
- Einzelobjekte bei Sputnik, Verträgen, Hotline usw.
- kurze Schemata bei Containment, Abschreckung und Kubakrisen-Lösung
- volle Szenen nur dort, wo sie wirklich tragen
- Countryballs nur, wenn staatliche Akteure oder Interaktion dadurch klarer werden
- keine normalen Menschen, Silhouetten oder realistischen Hände

## Cover / Flow

- Bild 01 = Cover + erste Videoszene
- Bild 01 exakt **3×** erzeugen, besten Kandidaten auswählen
- Gewinner exakt `Bild 01.png`
- Bild 02–74 jeweils **1×**
- maximal fünf aktive Generationen gleichzeitig
- keine Zwischen-Wellenabnahme
- jedes fertige Bild genau einmal korrekt benennen
- am Ende ausschließlich `Bild 01.png` bis `Bild 74.png` unter `00-bildprompts/images/`
- keine Referenzbilder zwischen Generationen

## Audio

Genau ein finales Voice-over unter `02-audio/voiceover-final.*`.

Phase 3:
- Nutzeroriginal bleibt unverändert
- lange Pausen werden intern gekürzt
- 1,10× mit erhaltener Tonhöhe
- −16 LUFS
- max. −1,5 dBTP
- 48 kHz
- Whisper erst **nach** dieser Audiooptimierung
- echte Wortanker bestimmen die finale Bildtimeline
- Schlussbild hält nach dem letzten Wort 1,3 s

## Phase 3

```bash
npm run phase3:youtube -- --dir "youtube/2026-KW40_28-09_bis_04-10/kalter-krieg-wie-aus-verbuendeten-feinde-wurden"
```

Phase 1 ist vollständig. Phase 2 wartet auf die 74 finalen Bilder und das finale Voice-over.