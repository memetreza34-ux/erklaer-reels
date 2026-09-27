# Produktionsplan — Anarchismus

## Thema

**Anarchismus: Kann eine Gesellschaft ohne Staat funktionieren?**

Cover-Text: **WAS IST ANARCHISMUS?**

Themen-Editor: `APPROVED_NEW`.

## Upload-Metadaten

**YouTube-Titel:**
Anarchismus einfach erklärt: Kann Gesellschaft ohne Staat funktionieren?

**Beschreibung:**
Was ist Anarchismus? Dieses Video erklärt in rund zwei Minuten, warum anarchistische Ideen zentrale Herrschaft und den Staat kritisch sehen, wie Selbstorganisation, Föderationen und gegenseitige Hilfe funktionieren sollen, welche Rolle Proudhon, Bakunin und Kropotkin spielen und welche offenen Probleme eine staatenlose Ordnung hätte.

**Tags:**
Anarchismus, anarchistisch, politische Ideologien, Proudhon, Bakunin, Kropotkin, Selbstverwaltung, Föderation, Staat, Herrschaft, politische Bildung, einfach erklärt

## Phase 1

- Schema 13
- Visual Flexibility V1
- 362 Wörter
- 25 Bildmomente
- jedes Bild mit Topic Anchor + Visual Form
- Countryballs optional
- Objekt-only, Dokument-only und einfache Schemata ausdrücklich eingeplant
- komplexe Szenen nur bei echtem Mehrwert
- Bild 01 = Cover + erste Szene
- kein Bild 00
- Schluss-Hold 1,3 s

## Phase 2

Frische Google-Flow-Sitzung verwenden.

```text
Bild 01 exakt 3×
→ 1 Gewinner auswählen
→ Gewinner als Bild 01.png
→ andere 2 verwerfen

Bild 02–25
→ jedes genau 1×
→ maximal 5 gleichzeitig
→ keine manuellen Zwischenstopps
→ jedes fertige Bild genau einmal final benennen
```

Am Ende exakt `Bild 01.png` bis `Bild 25.png` flach unter `00-bildprompts/images/`.

Danach ein einziges finales Voice-over nach `02-audio/voiceover-final.*`.

## Phase 3

```bash
npm run phase3:youtube -- --dir "youtube/2026-KW39_21-09_bis_27-09/anarchismus-gesellschaft-ohne-staat"
```

Audio wird zuerst auf 1,10× bei erhaltener Tonhöhe optimiert und auf −16 LUFS / max. −1,5 dBTP / 48 kHz gebracht. Erst danach werden Whisper-Wortzeiten und die finale Timeline erzeugt.
