# Änderungs- und Bestandsschutz — repo-weit verbindlich

## Zweck

Das Repository wird kontinuierlich **gezielt** verbessert, damit **zukünftige** Reels und YouTube-Videos besser werden. Bestehende Videoprojekte sind keine Testdateien und werden niemals als Nebenwirkung einer Pipeline-Verbesserung umgeschrieben.

## Vor jeder Änderung entscheiden

1. **Was ist das konkret beobachtete Problem?** Beispiel: Untertitel fehlen im Export oder Szenen werden zu generisch. Eine subjektive Vermutung ohne konkretes Problem reicht nicht.
2. **Welcher wiederverwendbare Ort löst es?** Template, zentraler Validator, Produktionsregel, Schnittfunktion oder Regressionstest. Keine Änderung an einem fertigen oder begonnenen Einzelvideo, nur weil dessen Ergebnis analysiert wurde.
3. **Ist der Nutzen höher als Aufwand und Risiko?** Bevorzugt kleine, stabile Korrekturen. Nicht ohne Grund neue Systeme, zusätzliche Abhängigkeiten oder komplizierte QC-Stufen einführen.
4. **Was darf auf keinen Fall verändert werden?** Bestehende Videoordner, Originalassets, Sprechertexte, Flow-Prompts, exports, andere Pipelines, bewährte Bildwelt und Legacy-Projekte.
5. **Wie wird der Effekt nachgewiesen?** Minimaler Diff, gezielter Test/Regressionstest und vollständiges `npm test`. Keine roten Checks schönreden oder durch das Abschalten von Tests umgehen.

## Bestehende Einzelvideos: nur bei ausdrücklichem Nutzerauftrag

Geschützt sind u. a.:

- `youtube/<KW>/<videoprojekt>/...`
- `reels/<KW>/<wochentag>/<reelprojekt>/...`
- bereits vorhandene Skripte, Szenen, Prompts, Pläne, Metadaten, Bilddateien und Exporte

**Allgemeines Feedback, „verbessere die Pipeline“, „mach es in Zukunft besser“ oder eine Videoanalyse ermächtigen NICHT zur Bearbeitung des gezeigten oder eines anderen bestehenden Videos.**

Ein neues Video darf nur bei entsprechendem Produktionsauftrag angelegt werden. Bereits erzeugte Videos dürfen nur verändert werden, wenn genau dieses Projekt ausdrücklich zur Änderung genannt wurde.

## Technischer Schutz für Pull Requests

Der PR-Check `scripts/guard-existing-video-projects.js` vergleicht einen PR mit dem Base-Commit. Wenn eine Änderung Dateien in einem **bereits vor dem PR vorhandenen** Videoprojekt berührt, schlägt die CI standardmäßig fehl. Neue Projektordner, zentrale Vorlagen, Dokumentation, Tests und Pipeline-Logik bleiben erlaubt.

Nur für eine ausdrücklich beauftragte bestehende Videoänderung im PR-Text dokumentieren:

```text
EXPLICIT_VIDEO_EDIT_APPROVAL: youtube/<woche>/<exakter-videoprojektordner>
USER_REQUEST_QUOTE: <konkrete wörtliche Anweisung des Nutzers>
```

Der technische Check verifiziert Projektpfad und Freigabe-Eintrag, **nicht die Echtheit einer Chat-Nachricht**. Verantwortliche Agenten dürfen diese Freigabe deshalb nicht erfinden. Mehrere Videoordner benötigen je einen passenden Freigabe-Eintrag. Bei unklarem Auftrag keine Änderung.

## Für alle Optimierungen

- Nur **eine klar begründete Verbesserung** je Änderung, soweit sinnvoll; nicht gleichzeitig unabhängige Baustellen anfassen.
- Rückwärtskompatibilität erhalten. Alte Projekte nicht still auf neueste Policy migrieren.
- Geänderte Funktion isoliert testen, danach gesamte Suite. Andere Bildwelten / Exportkonventionen nicht unaufgefordert umstellen.
- Vor Merge Diff und CI prüfen, fehlende Tests oder ungelöste Risiken offen benennen.
- Kein messbarer oder nachvollziehbarer Nutzen? **Dann nichts ändern.**
