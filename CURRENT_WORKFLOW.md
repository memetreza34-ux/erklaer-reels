# CURRENT WORKFLOW — VERBINDLICHE SINGLE SOURCE OF TRUTH

**Stand: 2026-08-10**

Diese Datei ist die verbindliche Repo-weite Produktionsregel für neue Chats, Codex, Antigravity und andere Repo-Agenten.

## Priorität bei Widersprüchen

Wenn sich Dokumente, alte Reel-Dateien, Beispieltexte oder frühere Produktionsaufträge widersprechen, gilt diese Reihenfolge:

1. **Explizite aktuelle Nutzeranweisung im laufenden Chat**
2. **`CURRENT_WORKFLOW.md`**
3. `AGENTS.md`
4. `CODEX_TASK.md`
5. `PRODUCTION_STATUS.md`
6. `docs/` und `knowledge/`
7. einzelne ältere Reel-Dateien, Beispiele oder historische Produktionsaufträge

Ein normaler Auftrag wie „Mach ein neues Reel“ darf diese globalen Regeln **nicht** verändern. Globale Regeln werden nur geändert, wenn der Nutzer ausdrücklich eine neue Regel festlegt.

---

## 1. Was bei „Mach ein neues Reel“ automatisch passiert

Nicht nach Datum, Thema, Szenenzahl oder Bildwelt fragen, solange kein echter Konflikt vorliegt.

1. Nächsten freien Slot bestimmen.
2. Thema selbstständig aus den erlaubten Säulen wählen.
3. Vollständiges deutsches Script schreiben.
4. Reel-Workspace vollständig erstellen.
5. Cover, 12–14 Szenen, Bildprompts, Prompt-Sammeldatei, Caption, Quellen, Untertitel-/Effektplanung und Statusdateien fertigstellen.
6. Die sichtbare Reel-Ansicht mit `00-bildprompts`, `01-voice-script`, `02-audio`, `03-caption`, `04-video` und `99-technik` sicherstellen.
7. Inhaltsprüfungen ausführen, soweit die Umgebung dies tatsächlich erlaubt.
8. Wenn externe Bilder oder Audio scheinbar fehlen, zuerst die verbindliche Asset-Discovery durchführen; **nicht sofort anhalten oder den Nutzer fragen**.
9. Gefundene Assets sicher übernehmen, visuell bzw. akustisch prüfen und mit den bestehenden QC-Gates weiterverarbeiten.
10. Erst wenn die Suche tatsächlich nichts Passendes findet oder eine sichere Auswahl nicht möglich ist, den Nutzer informieren.
11. Sobald alle nötigen Assets vorhanden und geprüft sind, ohne unnötige Pause bis zur tatsächlich geprüften MP4 weiterarbeiten.

Erlaubte Säulen:
- Politik und Gesellschaft
- Länder, Geografie und Geschichte
- Psychologie und menschliches Verhalten

Nicht autonom verwenden:
- Körper/Biologie
- Finanzen
- Elektrotechnik
- KI-News
- tägliche politische Nachrichten
- Parteienwerbung

---

## 2. Eingefrorener Reel-Standard

- 55–60 Sekunden Voice-over, Ziel ungefähr 58 Sekunden
- 155–175 deutsche Wörter, Ziel ungefähr 165
- 12–14 Szenen, Standard 13
- genau ein deutscher Erzähler
- Hook ab Sekunde 0
- Bildwelt erst nach dem fertigen Script wählen
- innerhalb eines Reels eine konsistente Hauptbildwelt
- letzte zwei Szenen: persönliche Prüf-/Erkenntnisfrage → konkrete Lösung/Abschlusssatz
- Schlussbild nach dem letzten gesprochenen Wort 0,7 Sekunden halten
- Voice-over exakt 1,10x bei erhaltener Tonhöhe
- −16 LUFS, höchstens −1,5 dBTP
- Untertitel horizontal zentriert, vertikal exakt bei 58 % Bildhöhe
- Untertitel-Grundfarbe `#F5F7FA`
- **das aktuell gesprochene Wort wird exakt nach den akustischen Wortzeiten in Braun `#B7794A` markiert**
- **100 % des gesprochenen Voice-Scripts müssen als Untertitel vorhanden sein; kein Wort, Satzteil oder Satz darf fehlen**
- keine schwarze Box und keine zusätzliche Karaoke-Animation wie Springen, Zoomen oder Größenwechsel; nur die Farbe des aktiven Wortes wechselt
- ausschließlich harte Schnitte
- keine Hintergrundmusik
- 0–2 dezente SFX pro Szene

Technische Grenzwerte bleiben in `config/production-quality-gates.json` und den zentralen Shared-Dateien maßgeblich.

---

## 3. Rollenverteilung bei Bildern

### Antigravity / Codex / Repo-Agenten

Sie **erzeugen keine Cover- oder Szenenbilder selbst** und starten nicht stellvertretend einen Bildgenerator.

Sie erstellen:
- Script
- Szenen
- Cover-Prompt
- einzelne Szenenprompts
- `all-image-prompts/all-image-prompts.txt`
- Nummerierung
- spätere Suche, Entpackung, QC-, Zuordnungs-, Timeline- und Render-Schritte

### Nutzer

Der Nutzer startet Google Flow selbst, indem er die **komplette** `all-image-prompts/all-image-prompts.txt` einmal in Google Flow einfügt und absendet.

### Google Flow

Nach diesem einmaligen Start ist Google Flow der Bildgenerator und arbeitet **autonom bis zum letzten Bild**, ohne ein weiteres `Go`, `Weiter`, `OK`, eine Bestätigung oder irgendeine weitere Nutzerantwort zu verlangen.

---

## 4. Google Flow — streng serieller Bildablauf

**Niemals parallel. Niemals Batch. Niemals Queue.**

Zu jedem Zeitpunkt darf genau **eine einzige Bildgenerierung aktiv** sein.

Für jedes Bild gilt zwingend:

**aktuellen Prompt lesen → genau ein Bild erzeugen → vollständig warten → sofort korrekt umbenennen → Umbenennung prüfen → automatisch nächstes Bild starten**

Beispiel:

`Bild 00 erzeugen → vollständig warten → Bild 00.png nennen → prüfen → sofort Bild 01 starten → vollständig warten → Bild 01.png nennen → prüfen → sofort Bild 02 starten → ...`

Google Flow darf zwischen zwei Bildern:
- nicht auf den Nutzer warten
- nicht nach Freigabe fragen
- kein späteres Bild vorladen
- nichts in eine Warteschlange legen
- kein zweites Bild gleichzeitig starten
- keine mehreren noch unbenannten Bilder ansammeln

Das einmalige Absenden des Gesamtprompts ist bereits die vollständige Freigabe für den kompletten Durchlauf.

---

## 5. Cover = Bild 00 + Hook + Master-Style

`Bild 00` ist immer das Cover.

Das Cover:
- enthält einen klaren sichtbaren deutschen Hook zum konkreten Reel-Thema
- muss auf einen Blick zeigen, worum es im Reel geht
- wird zuerst vollständig erzeugt und sofort `Bild 00.png` genannt
- dient danach als verbindliche visuelle Style-Referenz für alle Szenen

Alle folgenden Szenen übernehmen von `Bild 00.png`:
- Zeichen-/Renderstil
- Farbwelt
- Figurenmerkmale
- Proportionen
- Lichtstimmung
- Detailqualität

Der Cover-Hook-Text wird **nicht automatisch** auf Szenen kopiert. Szenentext erscheint nur, wenn der jeweilige Szenenprompt ihn ausdrücklich verlangt.

---

## 6. Feste Bildnummerierung

Bevorzugter Standard:

```text
Bild 00.png = Cover
Bild 01.png = Szene 1
Bild 02.png = Szene 2
...
Bild 13.png = Szene 13
```

Bei anderer Szenenzahl läuft die Nummerierung dynamisch bis zur letzten Szene.

PNG, JPG, JPEG und WEBP werden technisch unterstützt. Kompatibilitätsnamen wie `00.png`, `bild-00.png` oder `bild_01.png` können erkannt werden, aber **der bevorzugte Nutzerstandard bleibt `Bild 00.png`, `Bild 01.png`, ...**

---

## 7. Gemeinsamer Bildordner erst ganz am Ende

Während Google Flow noch Bilder erzeugt, wird **kein einzelnes Bild** in den gemeinsamen Sammelordner verschoben.

Erst wenn:
- alle Bilder vollständig erzeugt sind,
- jedes Bild direkt nach seiner Erzeugung korrekt benannt wurde,
- keine Nummer fehlt, doppelt ist oder vertauscht wurde,

werden **alle fertigen Bilder gemeinsam** abgelegt in:

```text
00-bildprompts/00-ALLE-BILDER-HIER-REIN/
```

Technisches Ziel:

```text
inbox/numbered-images/
```

Nicht vorher und nicht einzeln auf Cover-/Szenenordner verteilen.

---

## 8. Nummerierung ist nur Routing-Hilfe — visuelle QC bleibt Pflicht

Die Nummer darf beim Import das **vorgeschlagene Ziel** bestimmen. Sie ist aber niemals allein der Beweis, dass ein Bild inhaltlich zur Szene passt.

Vor finalem `--apply` muss jedes Bild tatsächlich geöffnet und gegen folgende Felder geprüft werden:
- `narration`
- `audioCue`
- `visualIdea`
- `imageText`
- `imagePrompt`

Danach zweite Prüfung gegen vorherige und nächste Szene.

Unter 0,90 Konfidenz nicht raten.

Erlaubte finale Match-Methoden:
- `visual-content-review`
- `visual-text-and-content-review`

`filename-only` ist verboten.

---

## 9. Fehlende Assets müssen zuerst gesucht werden

Ein fehlendes Bild oder Audio im Reel-Ordner bedeutet **nicht**, dass der Nutzer es noch nicht erstellt oder heruntergeladen hat.

Vor jeder Meldung „Bilder fehlen“, „Audio fehlt“ oder „ich kann nicht weitermachen“ muss zuerst ausgeführt werden:

```bash
npm run discover:assets -- --dir "<reel-ordner>"
```

Auch der normale Befehl

```bash
npm run organize:assets -- --dir "<reel-ordner>"
```

führt diese Suche automatisch vor der Zuordnung aus.

Standardmäßig werden geprüft:
- der aktuelle Reel-Ordner
- `~/Downloads`
- `~/Desktop`

### Wenn die Google-Flow-Bilder als ZIP heruntergeladen wurden

Der Agent muss nach ZIP-Dateien suchen und darf nicht erwarten, dass der Nutzer sie vorher manuell entpackt oder einsortiert.

Eine ZIP darf automatisch verwendet werden, wenn sie für dieses Reel eine vollständige und eindeutige nummerierte Serie enthält: `Bild 00` bis zur letzten Szene.

Dann gilt automatisch:

1. ZIP-Inhalt auf unsichere absolute Pfade oder `..`-Pfade prüfen.
2. ZIP in einen temporären Ordner entpacken.
3. `Bild 00`, `Bild 01`, `Bild 02` usw. erkennen.
4. Bereits vorhandene Bildnummern nicht überschreiben.
5. Gefundene Bilder standardisiert nach `inbox/numbered-images/Bild XX.<ext>` übernehmen.
6. Danach `prepareNumberedImageAssignments` bzw. `organize:assets` verwenden.
7. **Trotz korrekter Nummerierung jedes Bild wirklich öffnen und die visuelle Zwei-Pass-QC durchführen.**
8. Erst nach bestandener QC `--apply` ausführen.

Eine ZIP-Nummer ist also nur Routing-Hilfe und niemals Ersatz für die Bildprüfung.

### Lose Bilder und Audio

- Eine vollständige lose `Bild 00 ... Bild XX`-Serie in einem gefundenen Ordner darf ebenfalls automatisch in den nummerierten Import übernommen werden.
- Bei Audio wird nach aktuellen unterstützten Dateien gesucht.
- Genau ein eindeutig als Voice-over/Speech erkennbarer aktueller Kandidat darf automatisch in `inbox/audio/` bereitgestellt werden.
- Bei mehreren oder unklaren Audio-Kandidaten muss der Agent die Kandidaten prüfen und darf nicht raten.

Die Suchdiagnose wird unter

```text
inbox/asset-discovery.json
```

gespeichert.

**Erst wenn diese Suche tatsächlich nichts Passendes findet oder mehrere Kandidaten nicht sicher unterschieden werden können, darf der Agent den Nutzer um Hilfe bitten.**

Wenn Bilder und Audio gefunden und geprüft sind, soll der Agent selbstständig mit Asset-Anwendung, Audio-Pacing, Wort-Sync, Finalisierung und Render fortfahren, bis ein wirklich noch fehlender externer Schritt erreicht ist.

---

## 10. Voice-over, vollständige Untertitel und Finalisierung

Das Voice-over ist ein externes Asset. Sobald es vorhanden ist oder durch die Asset-Suche gefunden wurde:

1. von der Originaldatei starten
2. Pausen straffen
3. exakt 1,10x, Tonhöhe erhalten
4. −16 LUFS / max. −1,5 dBTP messen und bestätigen
5. Timeline synchronisieren
6. **jedes einzelne gesprochene Wort akustisch abhören und echte Start-/Endzeiten erstellen**
7. prüfen, dass `timedWords === totalWords`, `coverage === 1` und `unassignedWords === 0`
8. prüfen, dass die komplette Untertitel-Wortfolge exakt `script/voice-script.txt` entspricht
9. das aktuell gesprochene Wort mit `#B7794A` hervorheben; übrige Wörter bleiben `#F5F7FA`
10. visuelle QC vollständig durchführen
11. Finalizer und Render-Validator bestehen
12. erst dann MP4 rendern
13. die finale MP4 muss in der sichtbaren Reel-Ansicht unter `04-video/FERTIGES-VIDEO/` erreichbar sein

Keine geschätzten Wortzeiten oder geplanten QC-Stufen als bestanden ausgeben. **Ein Render mit fehlendem gesprochenem Wort ist verboten.**

---

## 11. Sichtbare Reel-Ansicht und wichtige Pfade

Jedes Reel muss für den Nutzer diese übersichtliche Top-Level-Struktur besitzen:

```text
00-bildprompts/
01-voice-script/
02-audio/
03-caption/
04-video/
99-technik/
```

Das fertige Ergebnis gehört **nicht nur** in einen technischen Renderordner. Nach einem erfolgreichen Render muss die MP4 direkt über diesen sichtbaren Pfad erreichbar sein:

```text
04-video/FERTIGES-VIDEO/
```

Technisch kann dieselbe Datei weiterhin unter `output/` liegen; `04-video/FERTIGES-VIDEO` verweist auf diese Render-Ausgabe. Der Renderer stellt die sichtbare Human-Ansicht vor dem Render automatisch sicher.

Verbindliche technische Prompt-Sammeldatei:

```text
all-image-prompts/all-image-prompts.txt
```

Sichtbare Finder-Verknüpfung:

```text
00-bildprompts/99-alle-bildprompts.txt
```

Gemeinsamer Bildimport:

```text
00-bildprompts/00-ALLE-BILDER-HIER-REIN/
```

Technisch:

```text
inbox/numbered-images/
```

---

## 12. Schutz vor neuen Chats und versehentlichen Regressionen

Ein neuer Chat oder Agent muss vor Änderungen zuerst diese Datei und danach `AGENTS.md` lesen.

Verboten ohne ausdrückliche Nutzeranweisung:
- alte 3er-Batch-Regeln wieder einführen
- Bilder parallel erzeugen lassen
- nach jedem Bild ein neues `Go` verlangen
- Antigravity/Codex selbst Bilder erzeugen lassen
- den gemeinsamen Bildordner bereits während der Generierung befüllen
- `Bild 00` als Cover/Style-Master entfernen
- bevorzugte Benennung `Bild XX` stillschweigend auf einen anderen Standard umstellen
- sichtbare Reel-Ordner wie `04-video` bei einem neuen Reel weglassen
- das finale Video nur in einem versteckten/technischen Ordner ablegen
- bei einem fehlenden Asset sofort aufgeben, ohne vorher `discover:assets` bzw. die definierte Asset-Suche auszuführen
- eine ZIP mit vollständigen nummerierten Bildern ignorieren oder den Nutzer unnötig zum manuellen Entpacken auffordern
- entpackte Bilder nur nach Dateinummer final bestätigen, ohne visuelle QC
- Untertitel mit weniger als 100 % des gesprochenen Voice-Scripts rendern
- `unassignedWords` ignorieren oder fehlende Wörter/Sätze trotz striktem Lauf zulassen
- die braune Sprecher-Markierung `#B7794A` wieder durch eine statische einfarbige Untertitelspur ersetzen
- globale Produktionswerte bei einem normalen neuen Reel verändern

Historische Reel-Dateien dürfen nie benutzt werden, um neuere globale Regeln zurückzudrehen.

---

## 13. Tests und bekannte Infrastrukturgrenze

`npm test` ist die lokale Testsuite. Ein Test oder CI-Lauf gilt nur als bestanden, wenn er tatsächlich ausgeführt und erfolgreich beendet wurde.

Bekannter offener Infrastrukturpunkt: Issue #19 (`package-lock.json` erzeugen und CI auf `npm ci` umstellen`). Solange dafür keine echte npm-Umgebung verfügbar ist, keine Lockdatei erfinden und keine nicht ausgeführten Tests als bestanden melden.
