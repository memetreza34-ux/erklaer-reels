# Alle Bildprompts

`all-image-prompts.txt` ist die verbindliche Sammeldatei für die externe Bilderstellung durch den Nutzer in Google Flow.

Direkt bei **jedem** Prompt stehen:
- Bildnummer
- Ziel (Cover/Szene)
- gewünschter Dateiname nach dem Download
- ein direkter Google-Flow-Bildgenerierungsbefehl

Der Nutzer kopiert jeweils **genau einen vollständigen Bildblock** in Google Flow. Der Block fordert Flow ausdrücklich auf, sofort das Bild zu erzeugen und nicht nur mit einer Erklärung, Bestätigung oder Zusammenfassung zu antworten.

Antigravity, Codex und andere Repo-Agenten starten den Bildgenerator nicht selbst. Diese Rollenregel steht bewusst **nicht** in den kopierbaren Bildblöcken, damit Google Flow sie nicht fälschlich als Verbot der Bildgenerierung interpretiert.

Nach dem Download benennt der Nutzer das Bild nach der angegebenen Nummer (`Bild 00.png`, `Bild 01.png` usw.). Erst wenn alle Bilder fertig sind, werden sie gemeinsam in den nummerierten Sammelordner gelegt.
