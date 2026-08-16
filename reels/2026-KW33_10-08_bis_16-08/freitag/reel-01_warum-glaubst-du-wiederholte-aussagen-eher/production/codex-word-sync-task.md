# Codex-Auftrag: exakte Wortzeiten

## Ziel

Höre das lokale Voice-over vollständig ab und fülle in `subtitles/codex-word-sync.json` für jedes Wort die echten absoluten Start- und Endzeiten aus. Es wird kein externer Transkriptionsanbieter verwendet. Kein gesprochenes Wort darf fehlen.

## Dateien

- Voice-over: `audio/voiceover-tight.m4a`
- Sprechertext: `script/voice-script.txt`
- Master-Timeline: `timeline/timeline-plan.json`
- Arbeitsdatei: `subtitles/codex-word-sync.json`

## Verbindliche Regeln

1. Audio tatsächlich anhören; Wörter nicht gleichmäßig über die Dauer verteilen.
2. Für jedes Wort `startSeconds` und `endSeconds` als absolute Sekunden eintragen.
3. Auf ungefähr 0,01–0,03 Sekunden genau arbeiten.
4. `reviewed` erst nach akustischer Kontrolle auf `true` setzen.
5. `confidence` realistisch zwischen 0 und 1 eintragen; im strengen Lauf mindestens 0,85.
6. Reihenfolge und sichtbaren Wortlaut nicht verändern. Weicht das Audio vom Script ab, zuerst Script und Audio klären und den Unterschied in `notes` dokumentieren.
7. In Sprechpausen kein Folgewort vorzeitig markieren; keine künstlich verlängerten Wortzeiten.
8. Das letzte Wort darf nicht nach der Audiodauer enden.
9. Der Lauf ist nur vollständig bei `coverage = 1`, `timedWords = totalWords` und `unassignedWords = 0`.
10. Keine Audiodatei zu einem externen Dienst hochladen und keinen API-Schlüssel verwenden.

## Abschluss

Nach dem Ausfüllen ausführen:

```bash
npm run sync:words -- --dir "reels/2026-KW33_10-08_bis_16-08/freitag/reel-01_warum-glaubst-du-wiederholte-aussagen-eher" --apply --strict
```

Danach `review/word-sync-report.json` prüfen. Der Lauf muss vollständig bestehen, bevor gerendert wird.
