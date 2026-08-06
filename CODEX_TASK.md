# Codex-Hauptauftrag

Dieses Repository produziert vollständige visuelle Erklär-Reels. Der Nutzer erzeugt Voice-over und Bilder extern. Codex übernimmt Planung, Prompt-Sammlung, Prüfung, Audio-Pacing, sichere Bildzuordnung, Synchronisierung und Remotion-Render.

## Neues Reel

- genau ein deutscher Erzähler
- 155–175 Wörter
- 55–60 Sekunden Voice-over nach Audiooptimierung
- 12–14 Bildmomente, Standard 13
- Geschwindigkeit exakt 1,10x

```bash
npm run create:reel -- \
  --title "TITEL" \
  --script-file input/script.txt \
  --next-free \
  --scenes 13
```

Danach `production/agent-task.md` vollständig bearbeiten. Pflichtdateien sind Script, `reel.json`, Szenendaten, alle Bildprompts, Cover, Prompt-Sammeldatei, Untertitel, Effekte, Caption und Quellen.

```bash
npm run export:prompts -- --dir "PFAD-ZUM-REEL" --strict
npm run validate:reel -- --dir "PFAD-ZUM-REEL"
npm run check:content -- --dir "PFAD-ZUM-REEL" --strict
```

## Aufbau und Bildwelt

- bevorzugter Einstieg: `THEMA einfach erklärt:`
- Thema sofort nennen und direkt erklären
- Hook-Bild ab Sekunde 0
- jede Szene zeigt genau einen klaren Moment
- keine mehrfach kopierte Hauptperson oder überladene Mehrschritt-Grafik
- politische Inhalte neutral; Quellen und Unsicherheiten dokumentieren

**Reihenfolge:** Erst Script fertigstellen, danach die passendste Hauptbildwelt auswählen. Die Welt muss zum Inhalt passen und bleibt innerhalb des Reels konsistent.

Bei `round-country-characters` bestehen Figuren vollständig aus Kugelkörpern mit einfachen weißen Augen und höchstens kleinen Armen und Beinen. Reine Karten, Landschaften oder Gegenstände sind erlaubt, müssen aber dieselben Konturen, Farben und dieselbe Bildsprache behalten.

Das Ende besteht aus mindestens zwei getrennten Szenen:

1. persönliche Prüf-, Erkenntnis- oder Entscheidungsfrage
2. konkrete Lösung und kurzer einprägsamer Abschlusssatz

Nach dem letzten gesprochenen Wort bleibt das Schlussbild 0,7 Sekunden ohne neuen Untertitel stehen.

## Szenenrhythmus

Zentrale Quelle: `config/production-quality-gates.json`.

- Hook: 4,2–5,5 Sekunden
- normale Szenen: 3,2–5,5 Sekunden
- letzte Szene inklusive Nachlauf: 4,0–6,5 Sekunden
- kein Erklärmoment unter 3,2 Sekunden
- Dauersprung zwischen benachbarten Szenen höchstens 2,5 Sekunden
- Bildwechsel 0,1–0,3 Sekunden vor dem gesprochenen `audioCue`
- Untertitel enden mit dem Voice-over und nicht erst nach dem Schlussbild-Nachlauf

## Bildprompts und deutscher Bildtext

Bildprompts sind Englisch. Wo es die Szene verbessert, wird kurzer deutscher Bildtext integriert.

- bevorzugt in ungefähr 55–85 % der Szenen
- meistens 1–5 Wörter; ein einzelnes Wort reicht
- Textgröße darf klein, mittel oder groß sein
- geeignete Formen: Überschrift, Schild, Etikett, Karte, Dokument, Display, Gegenstand oder Schlussaussage
- exakten Wortlaut in `scene.imageText` eintragen
- denselben Wortlaut im englischen Prompt exakt in Anführungszeichen nennen
- Untertitel nicht wortgleich wiederholen
- Text weglassen, wenn er die Szene überlädt oder die Bildgenerierung verschlechtert

Verboten:

- englischer sichtbarer Text
- zufällige oder erfundene Wörter
- lange Absätze oder unnötig viel Text
- Logos oder Wasserzeichen
- künstlich leere horizontale Untertitelzone
- getrennte obere und untere Bildhälfte
- gestapelte Panels oder mehrfach dargestellte Hauptperson
- große leere Bäume, Pfeile oder Flächen als Textplatzhalter

Pflicht:

- natürliche zusammenhängende Komposition
- Hauptmotiv darf die exakte Bildmitte nutzen und hinter dem Untertitel liegen
- Prompt-Sammeldatei enthält zuerst das Cover und danach alle Szenen

## Sichere Bildzuordnung

### Niemals nach Reihenfolge raten

Verboten sind Zuordnungen nach:

- Upload-Reihenfolge
- Dateiname oder laufender Nummer
- Erstellungszeit
- Position in Finder oder Download-Ordner

### Durchgang 1: sichtbaren Inhalt prüfen

Für jedes Bild:

1. Bild öffnen und Dateinamen zunächst ignorieren.
2. `visibleSummary` als neutrale Beschreibung des sichtbaren Inhalts schreiben.
3. Mit `narration`, `audioCue`, `visualIdea`, `imageText` und `imagePrompt` vergleichen.
4. In `reason` konkret nennen, welche sichtbaren Objekte und Handlungen die Szene bestätigen.
5. `comparedFields` vollständig eintragen.

### Durchgang 2: Nachbarszenen ausschließen

1. Gewählte Szene gegen vorherige und nächste Szene prüfen.
2. Sicherstellen, dass das Bild nicht besser zur Nachbarszene passt.
3. `confirmedTarget` und `confirmedSceneOrder` exakt eintragen.
4. `sceneOrderConfirmed: true` und `secondPassConfirmed: true` erst danach setzen.
5. Unter 0,90 Konfidenz bleibt das Bild `unmatched`.

Erlaubte Methoden:

```text
visual-content-review
visual-text-and-content-review
```

`filename-only` ist verboten.

Pflichtfelder pro Szenenbild:

```json
{
  "visualReviewed": true,
  "secondPassConfirmed": true,
  "sceneOrderConfirmed": true,
  "confirmedTarget": "scene-01",
  "confirmedSceneOrder": 1,
  "visibleSummary": "...",
  "reason": "...",
  "comparedFields": ["narration", "visualIdea", "imageText", "imagePrompt"],
  "matchMethod": "visual-content-review",
  "confidence": 0.95
}
```

Danach:

```bash
npm run organize:assets -- --dir "PFAD-ZUM-REEL"
# asset-map.json visuell und vollständig ausfüllen
npm run organize:assets -- --dir "PFAD-ZUM-REEL" --apply
```

`review/scene-asset-verification.json` muss für jede Szene `passed: true` zeigen. Auch direkt abgelegte Bilder müssen in `review/visual-inspection.json` mit sichtbarer Beschreibung, Zuordnungsgrund und zweiter Prüfung bestätigt werden.

## Untertitel

Zentrale Quelle: `src/shared/subtitle-style.js`.

- horizontal zentriert
- vertikal exakt 58 % Bildhöhe, leicht unterhalb der Mitte
- warmer heller Sandton `#E7C39A`
- keine andersfarbige Wortmarkierung
- keine schwarze Box oder Balken
- dunkle Kontur und Schatten
- normalerweise 3–6 Wörter, höchstens zwei Zeilen
- keine Karaoke-Animation
- exakte Wortzeiten sind auch ohne sichtbares Wort-Highlight verpflichtend
- geschätzte Cue-Zeiten dürfen nicht final gerendert werden

## Schnitt, Bewegung und Audio

- Hook: `none`, Dauer 0
- danach nur `cut`, Dauer 0
- keine Fades oder schwarzen Zwischenbilder
- Zoom normalerweise 2–6 %, maximal 8 %
- Schwenk maximal 4 %
- nicht jedes Bild bewegen
- Hintergrundmusik aus; Voice-over hat Vorrang

```bash
npm run trim:pauses -- --dir "PFAD-ZUM-REEL" --speed 1.10
npm run build:timeline -- --dir "PFAD-ZUM-REEL"
npm run sync:audio -- --dir "PFAD-ZUM-REEL" --strict
npm run sync:words -- --dir "PFAD-ZUM-REEL"
# production/codex-word-sync-task.md vollständig akustisch bearbeiten
npm run sync:words -- --dir "PFAD-ZUM-REEL" --apply --strict
```

Audio-Standard:

- ursprüngliche Voice-over-Datei verwenden
- Pausen ab ungefähr 0,24 Sekunden kürzen
- exakt 1,10x bei erhaltener Tonhöhe
- −16 LUFS und höchstens −1,5 dBTP
- optimierte Datei nicht erneut beschleunigen
- Codex hört das lokale Audio vollständig ab und bestätigt echte Wortzeiten
- keine gleichmäßige oder erfundene Zeitverteilung

## Visuelle Prüfung und Render

`review/visual-inspection.json` muss pro Szene enthalten:

- sichtbare Bildbeschreibung
- konkrete Zuordnungsbegründung
- exakt passende `comparedAssetId`
- zweite Szenenprüfung bestätigt
- Sprechertext und visuelle Idee passen
- Szenenreihenfolge bestätigt
- gewählte Hauptbildwelt und Figurenmodell eingehalten
- deutscher Bildtext exakt
- keine zusätzlichen erfundenen oder englischen Wörter

```bash
npm run check:visuals -- --dir "PFAD-ZUM-REEL" --strict
npm run finalize:reel -- --dir "PFAD-ZUM-REEL" --strict
npm run validate:render -- --dir "PFAD-ZUM-REEL"
npm run render:reel -- --dir "PFAD-ZUM-REEL"
```

Nur rendern, wenn Inhalt, 1,10x-Audio, Lautheit, Audio-Sync, exakte akustisch bestätigte Untertitelsynchronisierung, sichere Bildzuordnung, ausgeglichene Szenendauern, 0,7-Sekunden-Schlussbild, alle Bilder, deutscher Bildtext, Untertitel bei 58 %, visuelle Prüfung, direkte Schnitte und `readyForRenderer: true` tatsächlich vorliegen. Keine geplante Stufe als abgeschlossen bezeichnen.
