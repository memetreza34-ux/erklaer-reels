# Technische Codex-Übergabe

Das kreative Produktionspaket ist bereits vollständig in der echten Reel-Struktur eingeordnet.

1. Übersichtliche Finder-Ansicht erstellen und technische Einträge auf macOS ausblenden:

```bash
npm run organize:finder -- --dir "content/2026-KW32_03-08_bis_09-08/dienstag/reel-01_sozialismus-einfach-erklaert"
```

2. `npm run validate:reel -- --dir "content/2026-KW32_03-08_bis_09-08/dienstag/reel-01_sozialismus-einfach-erklaert"`
3. `npm run export:prompts -- --dir "content/2026-KW32_03-08_bis_09-08/dienstag/reel-01_sozialismus-einfach-erklaert" --strict`
4. `npm run check:content -- --dir "content/2026-KW32_03-08_bis_09-08/dienstag/reel-01_sozialismus-einfach-erklaert" --strict`
5. Danach Bilder über `03-szenen/BILDER-HIER-EINFUEGEN` und Voice-over über `02-audio/AUDIO-HIER-EINFUEGEN` übernehmen.
6. Anschließend Asset-Zuordnung, Audio-Pacing, Timeline, Wort-Sync, visuelle Prüfung und Remotion-Render ausführen.

Kreative Texte nur ändern, wenn eine Prüfung einen konkreten Fehler zeigt.
