# Codex-Produktionsauftrag: Wie baue ich einen KI App Prototyp

## Ziel

Erstelle ein vollständiges Erklär-Reel mit ungefähr einer Minute Voice-over-Laufzeit. Bilder und Audio werden extern erzeugt. Vor dem Render muss jedes Bild zweifach visuell gegen seine konkrete Szene geprüft werden. Die Untertitel müssen jedes gesprochene Wort vollständig enthalten und exakt dem echten Voice-over folgen.

## Ausgangsdaten

- Reel-ID: `reel-01_wie-baue-ich-einen-ki-app-prototyp`
- Titel: **Wie baue ich einen KI App Prototyp**
- Bildmomente: **13**
- Voice-over-Zieldauer: **55–60 Sekunden**
- Zieltext: **155–175 Wörter**
- Format: **9:16**
- Voice-over: **Deutsch**
- Bildprompts: **Englisch**
- geplanter Bildtext: **Deutsch, meistens 1–5 Wörter in ungefähr 8–11 passenden Szenen**
- Hook-Dauer: **4.2–5.5 Sekunden**
- normale Szenen: **3.2–5.5 Sekunden**
- Schlussszene inklusive Nachlauf: **4–6.5 Sekunden**
- ruhiger Nachlauf nach Sprecherende: **0.7 Sekunden**
- Bildzuordnung: **mindestens 0.9 Konfidenz, zwei visuelle Durchgänge**
- Untertitel: **horizontal zentriert, exakt 58 % Bildhöhe, Grundtext #F5F7FA, aktuell gesprochenes Wort #B7794A, transparent**
- Untertitel-Sync: **100-%-Abdeckung und exakte Wortzeiten aus lokaler Codex-Audioprüfung verpflichtend**
- Audio-Pacing: **exakt 1.10x**
- Lautheit: **-16 LUFS, höchstens -1.5 dBTP**
- Hintergrundmusik: **aus**

## Rohscript

> Aus einer einfachen Idee kannst du mit KI heute erstaunlich schnell einen ersten App Prototyp bauen. Aber "schreib mir eine App" ist dafür meistens noch viel zu ungenau. Zuerst braucht die KI ein klares Ziel, die wichtigsten Funktionen und den gewünschten Ablauf. Daraus entsteht ein Plan für Oberfläche, Eingaben, Logik und Ergebnis. Danach wird der Code nicht als ein riesiger Block gebaut. Einzelne Bausteine für Oberfläche, Daten und Funktionen entstehen nacheinander und werden zu einem ersten Prototyp verbunden. Jetzt kommt der Teil, den viele überspringen: Testen. Ein Button kann falsch reagieren, Daten können fehlen oder die Ansicht kann auf dem Handy brechen. Genau hier beginnt die eigentliche Verbesserung. Die KI kann Fehler finden und Änderungen vorschlagen, aber du entscheidest, was wirklich richtig ist. Der beste Workflow lautet deshalb: Idee präzisieren, Struktur bauen, Code erzeugen, testen und korrigieren. So wird aus KI-Code Schritt für Schritt ein brauchbarer Prototyp.

## Verbindlicher Ablauf

1. Lies `CURRENT_WORKFLOW.md`, `AGENTS.md`, `CODEX_TASK.md`, `knowledge/production-rules.md` und `config/production-quality-gates.json`.
2. Überarbeite das Script auf 155–175 Wörter und ungefähr 55–60 Sekunden bei 1,10x. Bevorzugter Einstieg: `THEMA einfach erklärt:`.
3. Das Ende benötigt zwei getrennte Stufen: eine persönliche Prüf- oder Erkenntnisfrage und danach eine konkrete Lösung mit kurzem einprägsamem Abschlusssatz.
4. Schreibe denselben finalen Text nach `script/final-script.txt` und `script/voice-script.txt`.
5. Plane genau 13 Bildmomente. Hook 4.2–5.5s, normale Szenen 3.2–5.5s, letzte Szene inklusive Nachlauf 4–6.5s. Kein Erklärmoment unter 3.2s.
6. Der Dauersprung zwischen benachbarten Szenen darf höchstens 2.5s betragen.
7. Jede Szene zeigt genau einen klaren Moment. Keine mehrfach kopierte Hauptperson und kein überladenes Anleitungspanorama.
8. Wähle erst nach dem fertigen Script die Hauptbildwelt und halte sie konsequent ein.
9. Aktualisiere `scenes/scene-index.json` und jede `scene.json` synchron.
10. Plane in ungefähr 8–11 passenden Szenen kurzen deutschen Bildtext. Trage den exakten Wortlaut in `scene.imageText` ein.
11. Schreibe für jede Szene einen vollständigen englischen 9:16-Bildprompt. Wenn `imageText` gesetzt ist, fordere den exakten deutschen Text in Anführungszeichen an.

### Pflichtregeln für Bilder

- natürliche zusammenhängende Komposition
- Hauptmotive dürfen die Bildmitte normal nutzen und hinter dem Untertitel liegen
- keine künstlich leere horizontale Untertitelzone
- keine getrennte obere und untere Bildhälfte
- keine gestapelten Panels oder mehrfach dargestellte Hauptperson
- geplanter sichtbarer Text ausschließlich korrekt auf Deutsch
- Untertitel und Bildtext nicht wortgleich wiederholen
- keine zusätzlichen englischen Wörter, Fantasie-Labels, Logos oder Wasserzeichen
- gewählte Hauptbildwelt, Figurenform, Konturen und Farbwelt durchgehend beibehalten

12. Exportiere Cover und alle Szenenprompts:

```bash
npm run export:prompts -- --dir "reels/2026-KW33_10-08_bis_16-08/dienstag/reel-01_wie-baue-ich-einen-ki-app-prototyp" --strict
```

13. Fülle `subtitles/subtitle-plan.json`: exakt 58 %, Grundtext `#F5F7FA`, Aktivwort `#B7794A`, transparent, höchstens zwei Zeilen, normalerweise 3–6 Wörter, `highlightCurrentWord: true`, `speakerSyncedWordHighlight: true`, `exactWordTimingsRequired: true` und `completeSpokenTextCoverageRequired: true`.
14. Fülle `effects/effects-plan.json`: Hook `none`, danach nur `cut` mit Dauer 0; Zoom maximal 8 %, Schwenk maximal 4 %.
15. Fülle Cover, Caption und Quellen aus.
16. Prüfe streng:

```bash
npm run check:content -- --dir "reels/2026-KW33_10-08_bis_16-08/dienstag/reel-01_wie-baue-ich-einen-ki-app-prototyp" --strict
```

## Nach Eintreffen von Bildern und Voice-over

### 1. Audio

```bash
npm run trim:pauses -- --dir "reels/2026-KW33_10-08_bis_16-08/dienstag/reel-01_wie-baue-ich-einen-ki-app-prototyp" --speed 1.10
```

### 2. Bilder zweifach zuordnen

```bash
npm run organize:assets -- --dir "reels/2026-KW33_10-08_bis_16-08/dienstag/reel-01_wie-baue-ich-einen-ki-app-prototyp"
```

Für jedes Bild in `inbox/asset-map.json`: sichtbaren Inhalt beschreiben, mit Szene vergleichen, gegen Nachbarszenen prüfen und erst ab 0.9 Konfidenz final bestätigen. Dateinummern sind nur Routing-Hilfe.

Danach:

```bash
npm run organize:assets -- --dir "reels/2026-KW33_10-08_bis_16-08/dienstag/reel-01_wie-baue-ich-einen-ki-app-prototyp" --apply
```

### 3. Timeline, vollständiger Sprecher-Sync, visuelle Prüfung und Render

```bash
npm run build:timeline -- --dir "reels/2026-KW33_10-08_bis_16-08/dienstag/reel-01_wie-baue-ich-einen-ki-app-prototyp"
npm run sync:audio -- --dir "reels/2026-KW33_10-08_bis_16-08/dienstag/reel-01_wie-baue-ich-einen-ki-app-prototyp" --strict
npm run sync:words -- --dir "reels/2026-KW33_10-08_bis_16-08/dienstag/reel-01_wie-baue-ich-einen-ki-app-prototyp"
# production/codex-word-sync-task.md akustisch vollständig bearbeiten
npm run sync:words -- --dir "reels/2026-KW33_10-08_bis_16-08/dienstag/reel-01_wie-baue-ich-einen-ki-app-prototyp" --apply --strict
npm run check:visuals -- --dir "reels/2026-KW33_10-08_bis_16-08/dienstag/reel-01_wie-baue-ich-einen-ki-app-prototyp" --strict
npm run finalize:reel -- --dir "reels/2026-KW33_10-08_bis_16-08/dienstag/reel-01_wie-baue-ich-einen-ki-app-prototyp" --strict
npm run validate:render -- --dir "reels/2026-KW33_10-08_bis_16-08/dienstag/reel-01_wie-baue-ich-einen-ki-app-prototyp"
npm run render:reel -- --dir "reels/2026-KW33_10-08_bis_16-08/dienstag/reel-01_wie-baue-ich-einen-ki-app-prototyp"
```

Vor dem Render müssen `coverage === 1`, `timedWords === totalWords`, `unassignedWords === 0` gelten. Die komplette gerenderte Untertitel-Wortfolge muss exakt `script/voice-script.txt` entsprechen. Nur das aktuell gesprochene Wort wird synchron `#B7794A` markiert; alle übrigen Wörter bleiben `#F5F7FA`. Fehlt ein Wort, ist der Render blockiert.

Die Timeline hängt nach dem letzten gesprochenen Wort automatisch 0.7 Sekunden Schlussbild ohne neuen Untertitel an. Die MP4 erst als fertig bezeichnen, wenn alle echten QC-Gates tatsächlich bestanden sind.

