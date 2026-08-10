# Produktionsregeln

> Bei Widersprüchen gilt `CURRENT_WORKFLOW.md`.

## Ziel

Jedes Reel erklärt einen Begriff, ein System oder einen Zusammenhang so einfach, dass Zuschauer ihn ohne Vorwissen verstehen.

## Script

- ein durchgehender deutscher Erzähler
- direkte Hook ohne lange Einleitung
- 155–175 Wörter
- 55–60 Sekunden Voice-over nach Optimierung auf exakt 1,10x
- einfache, erwachsene und neutrale Sprache
- keine Dialogrollen
- politische Inhalte neutral und ohne Parteienwerbung
- Unsicherheit klar kennzeichnen

## Bildwelt erst nach dem Script wählen

Zuerst das vollständige Voice-over schreiben. Danach die Welt auswählen, die den Inhalt am schnellsten erklärt. Ein Reel bleibt anschließend konsequent in einer Hauptwelt.

## Starkes Ende

Die letzten zwei Szenen müssen eine echte Auflösung bilden:

1. persönliche Prüf-, Erkenntnis- oder Entscheidungsfrage
2. konkrete Lösung und kurzer einprägsamer Abschlusssatz

Nach dem letzten gesprochenen Wort bleibt das Schlussbild 0,7 Sekunden ohne neuen Untertitel stehen.

## Szenenrhythmus

Zentrale Quelle: `config/production-quality-gates.json`.

- Hook-Bild ab Sekunde 0
- 12–14 visuelle Momente, Standard 13
- Hook 4,2–5,5 Sekunden
- normale Szenen 3,2–5,5 Sekunden
- letzte Szene inklusive Schlussbild-Nachlauf 4,0–6,5 Sekunden
- kein Erklärmoment unter 3,2 Sekunden
- Dauersprung zwischen Nachbarszenen höchstens 2,5 Sekunden
- Bildwechsel 0,1–0,3 Sekunden vor dem zugehörigen Audio-Cue
- Untertitel enden mit dem Voice-over und nicht erst nach dem Nachlauf
- jede Szene zeigt genau einen klaren Moment

## Deutscher Text im Bild

Wo es zur Szene passt, wird kurzer deutscher Text direkt in das Bild integriert. Normalerweise 1–5 Wörter, exakter Wortlaut in `imageText` und im englischen Prompt. Kein englischer sichtbarer Text, keine erfundene Schrift, keine unnötigen Textblöcke.

## Natürliche Komposition

- Hauptmotive dürfen die Bildmitte normal nutzen und hinter Untertiteln liegen.
- Untertitel sind ein Overlay; das Bild wird dafür nicht künstlich freigeräumt.
- Keine leere horizontale Untertitelzone, kein Mittelstreifen und keine getrennten Bildhälften.
- Die Illustration muss auch ohne Untertitel vollständig und natürlich wirken.

## Sichere Bildzuordnung

Die Nummerierung `Bild 00`, `Bild 01` usw. darf nur das vorgeschlagene Ziel liefern. Die finale Zuordnung erfordert immer echte Sichtprüfung.

### Erster Durchgang
- Bild tatsächlich öffnen
- sichtbaren Inhalt neutral in `visibleSummary` beschreiben
- mit `narration`, `audioCue`, `visualIdea`, `imageText` und `imagePrompt` vergleichen
- konkrete `reason` schreiben

### Zweiter Durchgang
- gegen vorherige und nächste Szene prüfen
- `confirmedTarget` und `confirmedSceneOrder` eintragen
- erst danach `sceneOrderConfirmed` und `secondPassConfirmed` bestätigen
- unter 0,90 Konfidenz unmatched lassen

Erlaubte Methoden sind `visual-content-review` und `visual-text-and-content-review`. `filename-only` ist verboten.

## Untertitel

Zentrale Quelle: `src/shared/subtitle-style.js`.

- horizontal zentriert
- vertikal exakt 58 % Bildhöhe
- Grundtext `#F5F7FA`
- das aktuell gesprochene Wort wird anhand echter akustischer Wortzeiten in Braun `#B7794A` markiert
- keine schwarze Hintergrundbox oder Balken
- dunkle Kontur und dezenter Schatten
- normalerweise 3–6 Wörter, höchstens zwei Zeilen
- keine zusätzliche Bounce-/Zoom-/Größenanimation; nur Farbwechsel des aktiven Wortes
- **100 % des gesprochenen Voice-Scripts müssen enthalten sein**
- `coverage === 1`, `timedWords === totalWords`, `unassignedWords === 0`
- die komplette gerenderte Untertitel-Wortfolge muss exakt `script/voice-script.txt` entsprechen
- `timingStatus` muss `codex-word-synced` sein
- `timingSource` muss `codex-local-audio-review` sein
- geschätzte Untertitelzeiten dürfen nicht final gerendert werden

## Audio

Zentrale Quelle: `src/shared/audio-pacing-style.js`.

- immer die ursprüngliche Datei verarbeiten
- Pausen ab ungefähr 0,24 Sekunden kürzen
- exakt 1,10x, Tonhöhe erhalten
- −16 LUFS integrierte Lautheit
- höchstens −1,5 dBTP True Peak
- optimiertes Audio niemals erneut beschleunigen
- danach Timeline, Szenen-Cues und Untertitel neu synchronisieren
- jedes Wort im lokalen Voice-over tatsächlich abhören und akustisch bestätigen
- gleichmäßig verteilte oder erfundene Wortzeiten sind verboten

## Bewegung, Übergänge und Sound

- nicht jede Szene bewegen
- Zoom normalerweise 2–6 %, maximal 8 %
- Schwenk maximal 4 %
- Hook `none`, danach nur `cut`, Dauer 0
- keine Crossfades oder schwarzen Zwischenbilder
- Hintergrundmusik aus
- null bis zwei dezente Soundeffekte pro Szene
- Voice-over hat Vorrang

## Qualitätskontrolle

Vor Freigabe prüfen:
- 155–175 Wörter und 55–60 Sekunden Voice-over
- 12–14 Szenen mit ausgeglichenen Dauern
- Hook sofort sichtbar
- Bildwelt konsequent
- starkes Ende plus 0,7 Sekunden Schlussbild
- jedes Bild erklärt exakt seine Szene
- sichtbare Bildbeschreibung, Zuordnungsgrund und zweite Prüfung vorhanden
- Untertitel exakt bei 58 %, weißer Grundtext, braunes synchrones Aktivwort, ohne Box
- **kein gesprochenes Wort fehlt**
- alle Untertitel-Wörter besitzen akustisch bestätigte Zeiten
- Voice-over exakt 1,10x, −16 LUFS und höchstens −1,5 dBTP
- ausschließlich direkte harte Schnitte
