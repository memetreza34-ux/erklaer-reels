# Produktionsstatus

**Status: PRODUKTIONSBEREIT**

Die kreative und funktionale Testphase ist abgeschlossen. Ab jetzt werden neue Reels mit dem bestehenden Standard produziert. Normale Reel-Erstellung darf die globalen Produktionsregeln nicht nebenbei verändern. Globale Änderungen an Stil, Timing, Untertiteln, Audio, Ordnerstruktur oder Qualitätsgrenzen erfolgen nur nach einer ausdrücklichen neuen Entscheidung.

## Eingefrorener Reel-Standard

- 55–60 Sekunden Voice-over, Ziel 58 Sekunden
- 155–175 deutsche Wörter, Ziel ungefähr 165
- 12–14 Szenen, Standard 13
- sichtbarer Bildwechsel ungefähr alle 3,5–5 Sekunden
- Hook ab Sekunde 0
- Bildwelt erst nach dem fertigen Script auswählen und innerhalb des Reels konsistent halten
- kurzer deutscher Bildtext bevorzugt, wenn er die Szene verbessert
- Bildzuordnung ausschließlich nach tatsächlichem sichtbaren Inhalt mit zweiter Nachbarszenenprüfung
- mindestens 0,90 Konfidenz für automatische Bildzuordnung
- Voice-over exakt 1,10x, Tonhöhe erhalten
- −16 LUFS, höchstens −1,5 dBTP
- Untertitel horizontal zentriert und vertikal bei exakt 58 % Bildhöhe
- Untertitel in weichem Weiß `#F5F7FA`
- keine Wortmarkierung, keine Karaoke-Animation und keine schwarze Box
- exakte lokale Wort-Synchronisierung mit dem echten Voice-over vor jedem finalen Render
- ausschließlich direkte harte Schnitte
- starkes Ende über zwei Szenen
- Schlussbild bleibt nach dem letzten gesprochenen Wort 0,7 Sekunden sichtbar
- neue Reel-Projekte liegen unter `reels/`
- YouTube-Langvideos liegen getrennt unter `youtube/`

## Qualitätsprinzip

Ein Reel ist erst fertig, wenn Inhalt, Audio, Untertitel-Synchronisierung, Bildzuordnung, visuelle Prüfung, Timeline und Renderer-Freigabe tatsächlich bestanden sind. Geplante oder geschätzte Produktionsstufen dürfen nicht als abgeschlossen markiert werden.

## Änderungen nach der Testphase

Bei einem normalen Auftrag wie `Mach ein neues Reel` bleibt dieser Produktionsstandard unverändert. Neue Themen, Skripte, Bildwelten und Szenen sind ausdrücklich erwünscht; Änderungen am globalen Standard dagegen nur auf ausdrückliche Anweisung.

## Bekannter Infrastrukturpunkt

Issue #19 (`package-lock.json` und Umstellung von CI auf `npm ci`) bleibt als nicht blockierende Wartungsaufgabe offen. Mehrere GitHub-Actions-Läufe sind vor dem ersten sichtbaren Schritt fehlgeschlagen. Eine separate npm-Umgebung konnte `@remotion/bundler@4.0.500` wegen der dort erzwungenen Paket-Registry ebenfalls nicht auflösen. Deshalb wird keine manuell konstruierte oder fremde Lockdatei eingecheckt.

Dieser Infrastrukturpunkt verändert den eingefrorenen Reel-Produktionsstandard nicht und blockiert die normale Reel-Produktion nicht.
