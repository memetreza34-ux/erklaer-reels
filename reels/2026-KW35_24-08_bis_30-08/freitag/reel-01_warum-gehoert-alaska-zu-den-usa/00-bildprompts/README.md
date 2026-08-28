# Bildprompts

Dieses Reel hat **13 narrative Szenen und 17 individuell geplante Szenenbilder** plus Cover `Bild 00`.

Für Google Flow wieder **nur diese eine Datei verwenden**:

`99-alle-bildprompts.txt`

Sie enthält den kompletten bewährten Aufbau in einer Nachricht: Auftrag → strenge Serienregel → Dateinamen → Style-Master → Textregel → alle vollständigen Bildprompts.

Google Flow erzeugt `Bild 00.png` bis `Bild 17.png` **streng nacheinander**. Nie zwei Bildgenerator-Aufrufe im selben Agent-Schritt oder Tool-Batch. Erst aktuelles Bild vollständig fertigstellen, umbenennen und prüfen, dann das nächste starten.

Die Bildnummer ist die globale Bildreihenfolge und nicht automatisch die Szenennummer. Untertitel sind deaktiviert.
