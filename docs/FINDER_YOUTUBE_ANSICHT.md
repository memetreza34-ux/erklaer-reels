# Finder-Ordnung: nur youtube und Wochen anzeigen

Der Nutzer soll **im Hauptordner nur `youtube/`** und **darin nur die Kalenderwochenordner `YYYY-KWNN_...`** sehen. Alle technischen Ordner, Regeln und Templates müssen für Codex, Google Flow, Antigravity und GitHub weiterhin erreichbar bleiben.

## Auf dem Mac einrichten

1. GitHub-Projekt lokal aktualisieren, z. B. über GitHub Desktop → **Fetch/Pull origin** oder `git pull`.
2. Im Projekt-Hauptordner **`YOUTUBE-ANSICHT.command` doppelklicken**. Falls macOS eine Sicherheitsrückfrage zeigt, über Rechtsklick → **Öffnen**.
3. Die Finder-Fenster kurz schließen und wieder öffnen. Wenn weiterhin versteckte Dateien sichtbar sind, **Cmd + Shift + Punkt** drücken.

**Ergebnis:**
- Im Repository-Stamm ist `youtube/` die einzige sichtbare Datei bzw. der einzige sichtbare Ordner.
- In `youtube/` sind nur Wochenordner (`2026-KW42_...`, weitere Wochen) zu sehen.
- In den Wochenordnern bleiben alle Videos, Skripte, Bilder und Exporte wie bisher erreichbar.

**Es wird NICHTS verschoben, umbenannt oder gelöscht.** Das Skript setzt ausschließlich die macOS-Dateisystem-Markierung `hidden` für direkte nicht benötigte Finder-Einträge. GitHub-Dateipfade und Tests bleiben unverändert.

## Befehle im Terminal (im Projekt-Hauptordner)

```bash
bash ./YOUTUBE-ANSICHT.command --dry-run
bash ./YOUTUBE-ANSICHT.command --hide
bash ./YOUTUBE-ANSICHT.command --show
```

`--dry-run`: Vorschau, welche Namen aus dem Finder verschwinden würden.  
`--hide`: Gewünschte reduzierte Finder-Ansicht aktivieren oder nach neuen Dateien erneut anwenden.  
`--show`: Nur die vom Skript selbst verborgenen Einträge wiederherstellen.

Die Zustandsliste liegt ausschließlich lokal **innerhalb des Git-Metadatenverzeichnisses**. Schon vor dem Ausführen unsichtbare Dateien werden durch `--show` nicht unnötig sichtbar gemacht. Die Dateien funktionieren trotz Unsichtbarkeit in Terminal, GitHub Desktop, Codex, Claude, Antigravity und Rendering-Tools.

**Wichtig:** Die Finder-Markierung wird nicht über GitHub übertragen. Nach einem neuen Clone oder auf einem anderen Mac muss das Skript erneut ausgeführt werden. Der GitHub-Webbrowser selbst bleibt unverändert. Neue Wochenordner sind nach erneutem Ausführen automatisch sichtbar; neu hinzugefügte Technik wird durch erneutes `--hide` ausgeblendet.

**Bestandsschutz:** Kein existierender YouTube-/Reel-Projektordner, kein Skriptpfad und kein Produktionsinhalt wird geändert. Diese Lösung ersetzt ausdrücklich eine riskante physische Verschiebung aller technischen Dateien in einen Sammelordner.
