# Themen-Historie

Diese Datei ist die verbindliche Themenliste für **alle Erklärformate in diesem Repository** — Reels und YouTube-Langvideos.

**Regel:** Vor jeder neuen Themenwahl diese Liste prüfen. Ein bereits verwendetes oder inhaltlich nahezu identisches Thema darf nicht erneut geplant werden. Geplante Themen sind ebenfalls reserviert, bis sie verworfen oder veröffentlicht werden.

Für YouTube ist diese Markdown-Datei **nicht mehr der einzige Schutz**. Vor dem Anlegen eines neuen Projekts muss zusätzlich der technische Themen-Editor laufen:

```bash
npm run topic:youtube -- --topic "NEUES THEMA"
```

Nur `THEMEN-EDITOR: FREI` / `APPROVED_NEW` erlaubt die Projekterstellung. `ÄHNLICH` und `DOPPELT` blockieren die automatische Erstellung. Der Editor prüft zusätzlich `config/youtube-topic-registry.json` und alle vorhandenen `youtube/**/99-technik/video.json`-Dateien. Dadurch bleibt ein vorhandenes Thema gesperrt, selbst wenn diese Historie versehentlich nicht aktualisiert wurde.

Für **neue Reels** gilt zusätzlich `REEL_THEMENFOKUS.md`: autonom ausgewählt werden vor allem Politik, Geschichte, Geografie, Ideologien/Systeme und passende internationale bzw. staatliche Mechanismen. Ältere Off-Focus-Reels bleiben nur als Historie bestehen.

## Bereits verwendet

### Reels

- Warum haben Länder Grenzen?
- Sozialismus einfach erklärt
- Gruppendruck einfach erklärt
- Warum schließen Länder Bündnisse?
- Warum verfolgen dich peinliche Erinnerungen?
- Warum kann keine Weltkarte die Erde richtig zeigen?
- Warum folgen Menschen der Gruppe, obwohl sie falsch liegt?
- Warum bleibt negative Kritik länger hängen?
- USA-China-Taiwan-Konflikt einfach erklärt
- Hitzewellen in Europa: Warum werden sie immer schlimmer?
- Warum riecht Regen so besonders?
- Warum sehen wir den Mond am Tag?

## Geplant / reserviert

### Reels

- Donnerstag: Warum schieben wir Aufgaben auf?
- Freitag: Warum bekommen wir Gänsehaut?
- Montag, 07.09.2026: Warum werden Finger im Wasser runzlig?
- Dienstag, 08.09.2026: Warum ist Gähnen ansteckend?
- Mittwoch, 09.09.2026: Was ist Föderalismus?

### YouTube

- KW36 (31.08.–06.09.2026): Warum hat ein Tag 24 Stunden – und nicht 10?
- KW39 (21.09.–27.09.2026): Warum ging das Römische Reich wirklich unter? — Golden-V2-Test, Phase 1 komplett
- KW39 (21.09.–27.09.2026): Warum gibt es Zeitzonen? — bestehendes 2-Minuten-V2-Projekt; bleibt für Duplicate-Schutz reserviert
- KW39 (21.09.–27.09.2026): Warum gibt es zwei Koreas? — Phase 1 komplett; bleibt für Duplicate-Schutz reserviert
- KW39 (21.09.–27.09.2026): Warum ist Kaliningrad von Russland getrennt? — Themen-Editor FREI, neues 2,5-Minuten-Projekt reserviert
- KW39 (21.09.–27.09.2026): Nationalismus: Wie funktioniert diese Ideologie? — Themen-Editor FREI, V5-Premium-Countryball-Projekt reserviert

## Duplicate-Regel

Nicht nur exakte Titel zählen als doppelt. Auch dieselbe Kernfrage mit anderer Formulierung ist gesperrt.

Beispiele:
- `Warum riecht Regen gut?` ist ein Duplikat von `Warum riecht Regen so besonders?`.
- `Wieso sieht man den Mond tagsüber?` ist ein Duplikat von `Warum sehen wir den Mond am Tag?`.
- `Wie wurde Korea geteilt?` ist ein Duplikat von `Warum gibt es zwei Koreas?`.

Die Sperre gilt formatübergreifend: Ein bereits verwendetes Reel-Thema wird nicht einfach als YouTube-Langvideo wiederholt und umgekehrt, außer der Nutzer hebt diese Regel ausdrücklich für ein konkretes Thema auf.

Für YouTube wird zusätzlich die Wochenzuordnung dokumentiert; die Produktionsordner liegen nach `youtube/<Woche>/<Thema>/`.
