# Sound-Bibliothek

Hier liegen die Soundeffekte **einmal zentral** für alle Reels. Ein Reel bekommt beim
Timeline-Bau nur die Dateien kopiert, die es tatsächlich benutzt.

Der Produktions-Agent wählt niemals einen Dateinamen, sondern ausschließlich einen
`type` aus `config/sound-library.json`. Die Zuordnung Typ → Datei passiert hier.

## Benötigte Dateien

| Datei | Typ | wofür | Suchbegriff |
|---|---|---|---|
| `soft-whoosh.mp3` | soft-whoosh | Bildwechsel mit Themensprung | `soft whoosh`, `subtle transition` |
| `pop.mp3` | pop | Objekt erscheint | `pop`, `bubble pop` |
| `click.mp3` | click | Zahl oder Begriff betonen | `ui click`, `soft click` |
| `tick.mp3` | tick | Zeit, Zählen, Abfolge | `clock tick`, `tick` |
| `soft-impact.mp3` | soft-impact | etwas trifft auf | `soft impact`, `thud` |
| `paper.mp3` | paper | Dokument, Karte, Blättern | `paper`, `page turn` |
| `swoosh-reveal.mp3` | swoosh-reveal | Auflösung, Aha-Moment | `reveal`, `swoosh reveal` |
| `door.mp3` | door | Öffnen, Schließen, Grenze | `door open`, `door close` |
| `coin.mp3` | coin | Geld, Kosten, Handel | `coin`, `coins` |
| `water-drop.mp3` | water-drop | Tropfen, Regen, Wasser | `water drop`, `droplet` |

## Wo herunterladen

Alle drei Quellen erlauben kommerzielle Nutzung **ohne Namensnennung**:

- **[Pixabay](https://pixabay.com/sound-effects/)** — größte Auswahl, kein Login
- **[Mixkit](https://mixkit.co/free-sound-effects/)** — kuratiert, kein Login
- **[Freesound](https://freesound.org/)** — nur mit Lizenzfilter **CC0**; dort liegen auch
  CC-BY-Sounds, die Namensnennung verlangen

Nicht verwenden: YouTube Audio Library. Die Lizenz variiert pro Datei, viele Sounds
verlangen Namensnennung, und außerhalb von YouTube ist die Nutzung nicht pauschal
gedeckt.

## Worauf beim Auswählen achten

- kurz: möglichst unter einer Sekunde, sonst überdeckt der Effekt das Voice-over
- dezent: keine Meme-Sounds, keine Jumpscares, keine langen Halleffekte
- sauber: kein Hintergrundrauschen, kein Musikbett, kein Sprachanteil
- Format: MP3 oder WAV; der Dateiname muss exakt der Tabelle oben entsprechen

## Prüfen

```bash
npm run sync:sounds -- --dir "<reel-ordner>"
```

Meldet, welche Dateien noch fehlen. Ohne `--strict` blockiert nichts — geplante Sounds
ohne vorhandene Datei bleiben einfach stumm.
