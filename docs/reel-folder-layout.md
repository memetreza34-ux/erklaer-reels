# Übersichtliche Reel-Ordnerstruktur

Die sichtbare Struktur orientiert sich am klaren, nummerierten Aufbau der Geldwelt-Produktionen. Nutzer sehen im macOS Finder nur die Ordner, die sie tatsächlich benötigen:

```text
reel-01_thema/
├── 00-cover/
├── 01-voice-script/
├── 02-audio/
├── 03-szenen/
├── 04-caption/
├── 05-review/
└── 06-video/
```

## Inhalt

- `00-cover`: Cover-Prompt und Ablageort für das Cover-Bild
- `01-voice-script`: endgültiger Voice-over-Text
- `02-audio`: Audioeingang und optimiertes Audio
- `03-szenen`: Prompt-Sammeldatei, einzelne Szenen und Bilder-Eingang
- `04-caption`: fertige Social-Media-Caption
- `05-review`: Quellen und technische Prüfberichte
- `06-video`: finale Render-Ausgabe

Die bestehende technische Pipeline bleibt unverändert. Die nummerierten Ordner enthalten symbolische Verknüpfungen zu den echten Dateien. Dadurch gibt es keine doppelten Inhalte und keine Synchronisationsfehler.

## Bestehendes Reel aufräumen

```bash
npm run organize:finder -- --dir "content/.../reel-01_thema"
```

Auf macOS werden die technischen Einträge anschließend mit dem Finder-Attribut `hidden` ausgeblendet. Sie bleiben vollständig erhalten und sind für Codex, Node und Remotion weiterhin erreichbar.

Neue Reels erhalten die nummerierte Ansicht automatisch über `npm run create:reel`.
