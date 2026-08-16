# Alle Bildprompts

`all-image-prompts.txt` ist als **ein einziger Google-Flow-Gesamtauftrag mit harter serieller Sperre und autonomem Durchlauf** aufgebaut. Der Nutzer kopiert die komplette Datei genau einmal in Google Flow und sendet sie genau einmal ab. **Dieses einmalige Absenden ist bereits die Freigabe für den kompletten Durchlauf bis zum letzten Bild.** Google Flow darf danach kein weiteres `Go`, `Weiter`, keine Bestätigung und keine weitere Nutzerantwort verlangen.

Verbindlich: Bild 00 vollständig erzeugen → auf vollständigen Abschluss warten → sofort korrekt umbenennen → prüfen, dass die Umbenennung abgeschlossen ist → **danach automatisch ohne Nutzerinteraktion Bild 01 starten**. Danach identisch Bild für Bild bis zum letzten Bild. Kein Parallelisieren, keine Warteschlange, kein Vorladen, aber ebenso **keine Pause zum Warten auf den Nutzer** zwischen zwei Bildern.

**Bild 00 ist zusätzlich die verbindliche visuelle Stilvorlage für das gesamte Reel.** Das Cover enthält den sichtbaren Hook zum Reel-Thema. Alle folgenden Szenen müssen sich direkt an Bild 00 orientieren: gleicher Zeichen-/Renderstil, gleiche Farbwelt, gleiche Figurenmerkmale, gleiche Proportionen, gleiche Licht- und Detailqualität. Der Cover-Hook wird aber nur dann in einer Szene wiederholt, wenn der jeweilige Szenenprompt ausdrücklich sichtbaren Text verlangt.

Direkt bei JEDEM Bildblock stehen feste Bildnummer, Ziel, Dateiname und die Freigabebedingung für diesen Schritt: Bild 00 = Cover, Bild 01 = Szene 1, Bild 02 = Szene 2 usw. Die Freigabe des nächsten Blocks erfolgt **automatisch durch die erfolgreich abgeschlossene Umbenennung des vorherigen Bildes**, niemals durch eine neue Nachricht des Nutzers.

Erzeugen oder aktualisieren:

```bash
npm run export:prompts -- --dir "reels/2026-KW33_10-08_bis_16-08/dienstag/reel-01_wie-baue-ich-einen-ki-app-prototyp" --strict
```

Die Datei wird automatisch aus `cover/cover-prompt.txt` und `scenes/scene-XX/image-prompt.txt` aufgebaut und sollte nicht manuell gepflegt werden.
