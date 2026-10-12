# Post-Video-Lernschleife — höchste proaktive Qualitätspriorität

**Gilt für:** neue YouTube-Langvideos und Reels sowie vom Nutzer zur Analyse bereitgestellte fertige Videos. **Verbindlich für:** ChatGPT, Codex, Claude, Antigravity und alle weiteren Produktionsagenten.

## Oberste Regel

**Nach JEDEM fertiggestellten Video ist die wichtigste proaktive Folgeaufgabe: aus dem konkreten Ergebnis lernen und die wiederverwendbare Produktionspipeline für das NÄCHSTE Video gezielt verbessern.** Das bedeutet nicht, das gerade fertige Video oder ältere Videoprojekte stillschweigend zu verändern.

Dieser Verbesserungsauftrag hat in der laufenden Qualitätsarbeit Vorrang vor kosmetischen Features, zusätzlichen Templates, neuen Kanalfunktionen und bloßer Produktionsgeschwindigkeit. **Ausdrückliche aktuelle Nutzeranweisungen, Sicherheitsregeln, der Bestandsschutz in `docs/CHANGE_SAFETY_POLICY.md` und bestandene Hard-Gates bleiben vorrangig.**

## Pflichtablauf nach jedem Video (auch ohne ausdrückliche Aufforderung zur Analyse)

1. **Fertiges Ergebnis tatsächlich ansehen oder prüfen.** Nach einem erfolgreichen Export das finale Video und, soweit vorhanden, den separat erzeugten Thumbnail, Upload-Text und die technischen Prüfergebnisse bewerten. Mindestens Anfang/Hook, einen Mittelteil, das Ende und problemverdächtige Übergänge stichprobenartig visuell und akustisch prüfen. Keine Sichtprüfung behaupten, wenn nur Skript/Metadaten verfügbar sind.
2. **Auf acht Qualitätsachsen prüfen:** (a) Hook und sofortige Themenklarheit, (b) erzählerischer Spannungsbogen und konkreter Erkenntnisgewinn, (c) Fakten und Quellen, (d) themenspezifische Bilder und konsistente Bildwelt, (e) Bildwechsel, Lesbarkeit und Audio-Bild-Synchronität, (f) Stimme, Pausen, Lautheit, Bewegung und SFX, (g) Cover, Titel, Beschreibung und Exportdateien, (h) technische Zuverlässigkeit und unnötige manuelle Schritte. Nur Bereiche beurteilen, für die Belege vorliegen.
3. **Ein konkretes Learning benennen.** Beobachtung mit Beleg (Zeitstempel, Beispielszene, QA-Metrik, Dateifehler oder ausdrückliches Nutzerfeedback) von Vermutung unterscheiden. Die Ursache nach Möglichkeit einer wiederverwendbaren Regel, einem Prompt, einem Tool oder einem Validator zuordnen. Keine pauschalen „mehr Dynamik“-Forderungen ohne konkrete Beispiele.
4. **Nach Nutzen priorisieren.** Vorrang für wiederholbare Probleme, die Zuschauerverständnis, Zuschauerbindung, Qualität, Stiltreue oder Exportzuverlässigkeit merklich beeinträchtigen. Den **größten sinnvoll behebbaren Engpass** wählen; keine lange Liste kosmetischer Mini-Aufgaben oder riskante Komplettumbauten.
5. **Gezielt in die Zukunft übertragen.** Wenn Mehrwert klar ist, kleinste passende Änderung an zentraler Vorlage, Prompt-Regel, Validator, Workflow oder Test vornehmen; passende Regression absichern und die vorhandene CI/Tests prüfen. Reel- und YouTube-Pipelines strikt getrennt lassen. Bestehende Einzelprojekte bleiben unverändert.
6. **Wirkung bei nächsten Produktionen gegenprüfen.** Bei einem späteren Video prüfen, ob der frühere Fehler seltener auftritt oder behoben ist. Bei fehlender Wirkung die Regel hinterfragen, statt immer neue starre Vorgaben anzuhäufen.
7. **Kurz und nachvollziehbar berichten.** Pro Video eine kompakte Zusammenfassung im Arbeitsbericht/Chat: *beobachtete Stärke*, *wichtigster Schwachpunkt mit Beleg*, *Entscheidung*, *gegebenenfalls zentrale Repo-Änderung und Teststatus*, *Wirkung beim nächsten Video beobachten*. Der Abschlussbericht ist keine zusätzliche Video-Exportdatei.

## Entscheidungsregel

- **Belegtes, wiederholbares Problem + klarer Nutzen + vertretbares Risiko:** Wiederverwendbare Pipeline nach `docs/CHANGE_SAFETY_POLICY.md` verbessern und testen.
- **Mögliche Verbesserung, aber zu wenig Belege:** Als Hypothese melden und beim nächsten Video gezielt beobachten; **keine** neue starre Pflicht oder riskante Codeänderung einführen.
- **Kein relevanter Mangel:** Analyse abschließen, **keinen** künstlichen Commit und keine Änderung nur um „optimiert“ zu haben.
- **Echtes Ergebnis nicht verfügbar:** Keine erfundene Videoanalyse; offen sagen, welche Prüfung fehlt. Den bereits verfügbaren Code-/Export-QC trotzdem nutzen.

## Harte Grenzen

- **Niemals** ein bereits bestehendes oder gerade fertiggestelltes einzelnes Video, seine Skripte, Bildprompts, Bilder, Timeline, Metadaten oder Exporte nachträglich verändern, nur weil die Lernschleife einen Fehler gefunden hat. Eine Änderung daran braucht einen **ausdrücklichen Auftrag für genau dieses Video**.
- Keine unbegründeten Änderungen an bestehender Bildwelt, Kanalstrategie, Videolänge, Sprache oder Workflow-Rollen.
- Nicht die Reel-Standards auf YouTube übertragen oder umgekehrt.
- Keine vorhandenen Qualitätstests oder Hard-Gates abschalten, um schnell grün zu werden.
- Kein fingiertes Feedback zu Aufrufen, CTR, Zuschauerbindung oder Monetarisierung: YouTube-Analytics nur berücksichtigen, wenn der Nutzer echte Daten bereitstellt bzw. sie tatsächlich abrufbar sind.
- „Nach jedem Video“ bedeutet **im Rahmen des aktiven Produktions-/Review-Auftrags**, nicht heimliche Hintergrundaktivität. Ohne laufenden Agentenprozess oder verfügbare Ergebnisse findet keine selbstständige externe Nachbearbeitung statt.
- Die Lernschleife ist eine **Pflicht zum Prüfen und Lernen**, keine Pflicht, bei jedem Video Code zu ändern.

## Beispiel

Beobachtung: Im fertigen YouTube-Video bleibt eine schwer lesbare Karte von 03:10 bis 03:22 stehen, obwohl der Sprecher in diesem Abschnitt drei Ortswechsel erklärt.

**Gute Folgeänderung:** Die wiederverwendbare Bildplanung prüft künftig Ortswechsel und Kartenlesbarkeit; ein Regressionstest schützt die neue Regel. **Nicht erlaubt ohne Auftrag:** das fertige Video nachträglich neu schneiden oder dessen Bilder austauschen.

**Leitsatz:** Jedes Video liefert Feedback für bessere nächste Videos – mit Belegen, minimalem Risiko und ohne Rückwirkung auf bestehende Produktionen.
