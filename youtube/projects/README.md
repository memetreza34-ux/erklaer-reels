# YouTube-Projekte

Hier liegt **jedes YouTube-Langvideo in einem eigenen Projektordner**.

Bevorzugte Benennung:

```text
video-01_kurzer-themen-slug
video-02_kurzer-themen-slug
video-03_kurzer-themen-slug
```

Neue Projekte werden mit `npm run create:youtube -- --title "TITEL"` aus `youtube/templates/video-template/` angelegt. Ein Projekt darf erst als fertig gelten, wenn sein `status.json` die tatsächlich erledigten Produktionsphasen widerspiegelt und die geprüfte MP4 unter `10-output/` liegt.
