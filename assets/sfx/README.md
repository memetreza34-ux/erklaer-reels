# Sound-Bibliothek

Hier liegt das feste Sound-Pack **einmal zentral für alle Reels**. Die Dateien sind bereits im Repo vorhanden. Ein Reel bekommt beim Timeline-Bau nur die Effekte kopiert, die es tatsächlich benutzt.

Der Produktions-Agent wählt niemals Dateinamen, sondern ausschließlich einen `type` aus `config/sound-library.json`. Die Zuordnung Typ → Datei übernimmt `src/core/sound-library.js`.

## Herkunft

Die vorhandenen Effekte sind **projektintern synthetisch erzeugte Eigenproduktion**. Sie stammen nicht von Stockportalen. Dadurch gibt es für die normale Reel-Produktion keine externe Lizenz- oder Attributionsabhängigkeit.

Die reproduzierbare Erzeugung liegt unter:

```text
scripts/generate-sfx.js
```

Für neue Reels gilt deshalb: **keine zusätzlichen Sounds aus dem Internet suchen**, solange einer der vorhandenen Typen passt.

## Kern-Sounds – fast jedes Reel

| Datei | Typ | Einsatz |
|---|---|---|
| `soft-whoosh.mp3` | `soft-whoosh` | normaler weicher Szenenwechsel |
| `whoosh-up.mp3` | `whoosh-up` | Szenenwechsel mit Steigerung/Zuspitzung |
| `whoosh-down.mp3` | `whoosh-down` | Szenenwechsel mit Einordnung/Auflösung |
| `soft-swipe.mp3` | `soft-swipe` | neutraler kurzer Szenenwechsel |
| `pop.mp3` | `pop` | sichtbares neues Element erscheint |
| `click.mp3` | `click` | Zahl/Schlüsselbegriff wird betont |
| `soft-impact.mp3` | `soft-impact` | sichtbarer Aufprall oder starker Faktenmoment |
| `swoosh-reveal.mp3` | `swoosh-reveal` | Aha-Moment/Auflösung wird sichtbar |

## Situative Zusatzsounds

| Datei | Typ | Einsatz |
|---|---|---|
| `tick.mp3` | `tick` | Zeit, Zählen, Abfolge |
| `paper.mp3` | `paper` | Dokument, Karte, Vertrag, Blättern |
| `door.mp3` | `door` | Tür/Tor/Grenze öffnet oder schließt |
| `coin.mp3` | `coin` | sichtbares Geld, Kosten, Bezahlung |
| `water-drop.mp3` | `water-drop` | Tropfen, Regen, Wasser |

## Feste Dramaturgie

- Szene 1 braucht keinen Übergangssound davor.
- **Jeder folgende narrative Szenenwechsel bekommt einen dezenten Sound.**
- Wenn im neuen Bild ein konkretes Ereignis sichtbar ist, kann ein passender Inhalts-SFX genutzt werden.
- Sonst rotiert die Pipeline zwischen `soft-whoosh`, `whoosh-up`, `whoosh-down` und `soft-swipe`.
- Dieselbe Transition-Variante nie direkt zweimal hintereinander.
- `swoosh-reveal` höchstens einmal pro Reel für den eigentlichen Aha-Moment.
- Voice-over hat immer Priorität; Sounds bleiben kurz und leise.
- Keine Meme-Sounds, keine Jumpscares und keine Hintergrundmusik.

## Regenerieren

```bash
node scripts/generate-sfx.js --force
```

## Prüfen

```bash
npm run sync:sounds -- --types
npm run sync:sounds -- --dir "<reel-ordner>" --strict
```

Zusätzlich prüft die Testsuite, dass **jede in `config/sound-library.json` konfigurierte MP3 tatsächlich unter `assets/sfx/` vorhanden ist**. Damit kann künftig kein Reel auf einen Sound-Typ zeigen, dessen Datei im Repo fehlt.
