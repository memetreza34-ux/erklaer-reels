# YouTube-Projekte

Hier liegt **jedes YouTube-Langvideo in einem eigenen Projektordner**.

Bevorzugte Benennung:

```text
video-01_kurzer-themen-slug
video-02_kurzer-themen-slug
video-03_kurzer-themen-slug
```

Für neue Projekte dient `youtube/templates/video-template/` als Strukturvorlage.

Die sichtbare Standardstruktur eines Projekts ist:

```text
00-bildprompts/
01-voice-script/
02-audio/
03-export/
99-technik/
```

Der kanonische Projektstatus liegt unter `99-technik/status.json`. Ein Projekt darf erst als fertig gelten, wenn dieser Status die tatsächlich erledigten Produktionsphasen widerspiegelt und die finalen Upload-Dateien tatsächlich unter `03-export/` vorhanden sind.
