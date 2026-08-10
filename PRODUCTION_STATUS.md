# Produktionsstatus

**Status: PRODUKTIONSBEREIT**

## Verbindliche aktuelle Quelle

Die vollständige aktuelle Produktionsregel steht in **`CURRENT_WORKFLOW.md`**. Diese Datei ist bei Widersprüchen maßgeblich.

Die kreative und funktionale Testphase ist abgeschlossen. Normale Reel-Erstellung darf globale Produktionsregeln nicht nebenbei verändern. Globale Änderungen erfolgen nur nach einer ausdrücklichen neuen Nutzerentscheidung.

## Eingefrorener Reel-Standard

- 55–60 Sekunden Voice-over, Ziel 58 Sekunden
- 155–175 deutsche Wörter, Ziel ungefähr 165
- 12–14 Szenen, Standard 13
- sichtbarer Bildwechsel ungefähr alle 3,5–5 Sekunden
- Hook ab Sekunde 0
- Bildwelt erst nach dem fertigen Script auswählen und innerhalb des Reels konsistent halten
- kurzer deutscher Bildtext, wenn er die Szene verbessert
- Bildzuordnung final ausschließlich nach tatsächlichem sichtbarem Inhalt plus Nachbarszenenprüfung
- mindestens 0,90 Konfidenz für finale automatische Bildzuordnung
- Voice-over exakt 1,10x, Tonhöhe erhalten
- −16 LUFS, höchstens −1,5 dBTP
- Untertitel horizontal zentriert und vertikal bei exakt 58 % Bildhöhe
- Untertitel `#F5F7FA`, keine Wortmarkierung/Karaoke-Animation und keine schwarze Box
- exakte lokale Wort-Synchronisierung mit dem echten Voice-over vor dem finalen Render
- ausschließlich direkte harte Schnitte
- starkes Ende über zwei Szenen
- Schlussbild 0,7 Sekunden nach dem letzten gesprochenen Wort

## Eingefrorener Google-Flow-Bildworkflow

Diese Regeln gehören ab jetzt ausdrücklich zum Produktionsstandard:

- Antigravity/Codex/Repo-Agenten erzeugen keine Cover- oder Szenenbilder.
- Der Nutzer startet Google Flow einmal mit der kompletten `all-image-prompts/all-image-prompts.txt`.
- Google Flow arbeitet danach autonom bis zum letzten Bild und verlangt kein weiteres `Go`, `Weiter`, `OK` oder eine andere Nutzerfreigabe.
- Trotzdem immer streng seriell: genau ein Bild aktiv, vollständig warten, sofort umbenennen, prüfen, erst dann automatisch das nächste Bild starten.
- Keine parallelen Generierungen, keine Batches und keine Queue.
- `Bild 00.png` ist Cover, sichtbare Hook und verbindlicher Style-Master für alle Szenen.
- Bevorzugte Benennung: `Bild 00.png`, `Bild 01.png`, `Bild 02.png` usw.
- Erst nach Abschluss aller Bilder werden alle fertig benannten Dateien gemeinsam in `00-bildprompts/00-ALLE-BILDER-HIER-REIN/` bzw. technisch `inbox/numbered-images/` gelegt.
- Die Dateinummer ist nur Routing-Hilfe; finale Bildzuordnung erfordert weiterhin echte visuelle QC.

## Qualitätsprinzip

Ein Reel ist erst fertig, wenn Inhalt, Audio, Untertitel-Synchronisierung, Bildzuordnung, visuelle Prüfung, Timeline und Renderer-Freigabe tatsächlich bestanden sind. Geplante oder geschätzte Produktionsstufen dürfen nicht als abgeschlossen markiert werden.

## Schutz vor Regressionen

Bei einem normalen Auftrag wie `Mach ein neues Reel` bleibt dieser Produktionsstandard unverändert. Alte Reel-Dateien, historische Agent-Aufträge oder Beispieltexte dürfen nicht genutzt werden, um neuere globale Regeln zurückzudrehen.

## Bekannter Infrastrukturpunkt

Issue #19 (`package-lock.json` und Umstellung von CI auf `npm ci`) bleibt als nicht blockierende Wartungsaufgabe offen. Für den aktuellen `main`-Stand liegt kein verifizierter erfolgreicher CI-Lauf vor. Deshalb keine Lockdatei erfinden und keine nicht tatsächlich ausgeführten Tests als bestanden melden.
