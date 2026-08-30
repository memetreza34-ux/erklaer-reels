# Sound-Bibliothek

Hier liegt das feste Sound-Pack **einmal zentral für alle Reels**. Beim Timeline-Bau werden nur die Effekte in das konkrete Reel kopiert, die dort tatsächlich benutzt werden.

Der Produktions-Agent wählt niemals Dateinamen, sondern ausschließlich einen `type` aus `config/sound-library.json`. Die Zuordnung Typ → Datei übernimmt `src/core/sound-library.js`.

## Herkunft und Nutzung

Die Effekte dieser Bibliothek sind **projektintern synthetisch erzeugte Eigenproduktion**. Sie stammen nicht von Stockportalen und benötigen keine externe Namensnennung oder Drittanbieter-Lizenz. Die reproduzierbaren Rezepte liegen unter `scripts/generate-sfx.js`.

Damit gilt für neue Reels: **keine Sounds aus dem Internet suchen oder herunterladen**, solange die Bibliothek den benötigten Effekt abdeckt.

## Festes Core-Pack

Diese Sounds decken fast alle Reels ab und sollen bevorzugt wiederverwendet werden:

| Datei | Typ | Standard-Einsatz |
|---|---|---|
| `soft-whoosh.mp3` | `soft-whoosh` | normaler weicher Szenenwechsel |
| `whoosh-up.mp3` | `whoosh-up` | Wechsel mit Steigerung/Zuspitzung |
| `whoosh-down.mp3` | `whoosh-down` | Wechsel mit Einordnung/Auflösung |
| `soft-swipe.mp3` | `soft-swipe` | sehr neutraler kurzer Cut |
| `reverse-whoosh.mp3` | `reverse-whoosh` | direkt vor Reveal/Aha-Moment |
| `pop.mp3` | `pop` | neues Element erscheint sichtbar |
| `click.mp3` | `click` | Zahl oder Schlüsselbegriff wird gesetzt |
| `soft-impact.mp3` | `soft-impact` | sichtbarer Aufprall/starker Faktenmoment |
| `swoosh-reveal.mp3` | `swoosh-reveal` | eigentliche Auflösung wird sichtbar |
| `clean-chime.mp3` | `clean-chime` | Lösung/Erkenntnis, höchstens einmal pro Reel |

## Situative Zusatzsounds

Nur verwenden, wenn das entsprechende Ereignis wirklich sichtbar ist:

| Datei | Typ | Einsatz |
|---|---|---|
| `tick.mp3` | `tick` | Zeit, Zählen, Abfolge |
| `paper.mp3` | `paper` | Dokument/Karte/Blättern |
| `door.mp3` | `door` | Tür/Tor/Grenze öffnet oder schließt |
| `coin.mp3` | `coin` | sichtbares Geld/Kosten/Bezahlung |
| `water-drop.mp3` | `water-drop` | Tropfen/Regen/Wasser trifft sichtbar auf |

## Dramaturgie-Regel

- Die erste Szene braucht keinen Übergangssound davor.
- **Jeder folgende narrative Szenenwechsel bekommt einen dezenten Sound.**
- Bevorzugt wird ein sichtbarer inhaltlicher Effekt (`pop`, `coin`, `water-drop` usw.).
- Wenn nichts Inhaltliches passt, rotiert die Pipeline zwischen `soft-whoosh`, `whoosh-up`, `whoosh-down` und `soft-swipe`.
- Dieselbe Transition-Variante nicht direkt zweimal hintereinander.
- `reverse-whoosh`, `swoosh-reveal` und `clean-chime` sind Akzent-Sounds und keine Dauer-Transitions.
- Voice-over hat immer Priorität; Sounds bleiben kurz und leise.
- Keine Meme-Sounds, keine Musikbetten, keine Jumpscares.

## Regenerieren

Alle synthetischen Dateien können reproduzierbar neu erzeugt werden:

```bash
node scripts/generate-sfx.js --force
```

## Prüfen

```bash
npm run sync:sounds -- --types
npm run sync:sounds -- --dir "<reel-ordner>" --strict
```

Der strenge Lauf blockiert, wenn ein geplanter Typ unbekannt ist oder die zugehörige zentrale Sounddatei fehlt.
