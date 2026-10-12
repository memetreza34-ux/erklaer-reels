# YouTube-Themenauswahl — Politik, Geografie und aktuelle Geopolitik

**Ab 12.10.2026 verbindlich für NEUE Weltlogik-Langvideos.** Diese Regel ergänzt `YOUTUBE_WORKFLOW.md` und `config/youtube-channel-policy.json`. Die visuellen Standards, technischen Phasen und der Bestandsschutz bleiben unverändert.

## 1. Harte Themenauswahl

**Nur drei autonome Kernbereiche:**
- **Aktuelle Politik und Staatssysteme:** konkrete Entscheidungen, Abstimmungen, internationale Politik, Bündnisse, Sanktionen, Verträge, Institutionen und deren Folgen.
- **Geografie, Länder, Grenzen und Territorien:** strategische Grenzen, Inseln, Regionen, Meerengen, Handelskorridore, Seegebiete und ungewöhnliche geografische Zusammenhänge.
- **Gegenwärtige Geopolitik:** aktuelle internationale Konfliktlinien, Grenzfragen, politische Ressourcenkontrolle, maritime Routen und geografische Machtfragen.

**Nicht eigenständig wählen:** historische Ereignisse, klassische Geschichtsdokumentationen, Biografien historischer Persönlichkeiten, reine historische Chronologien oder generische Ideologie-Lexikonvideos. Ein Rückblick darf vorkommen, wenn er nötig ist, um die **heutige** Politik/Geografie zu erklären; Gegenwart und konkrete politische/geografische Leitfrage bleiben das Videozentrum.

Keine Historien-Einträge, bestehenden Videoordner oder Altprojekte löschen/umschreiben. Ein ausdrücklich vom Nutzer angefordertes abweichendes Thema darf bearbeitet werden.

## 2. Aktualität zuerst — redaktioneller Ablauf vor JEDEM Themenvorschlag

1. **Heute recherchieren statt raten.** Vor autonomer Themenwahl aktuelle verlässliche Nachrichtenlage prüfen: bevorzugt Entwicklungen aus den letzten 7–14 Tagen, bei fortlaufenden wichtigen Themen bis zu etwa 30 Tagen. Eine ältere Entwicklung darf gewählt werden, wenn ein **neuer belegter Anlass** vorliegt. Bei fehlendem aktuellen Signal: keine erfundene Aktualität; lieber eine konkret relevante geografisch-politische Evergreen-Frage wählen.
2. **Mehrere voneinander unabhängige Quellen prüfen.** Relevante Veröffentlichungsdaten/Stand prüfen. Mindestens zwei belastbare Quellen, bei möglichen Änderungen und strittigen Fakten möglichst eine offizielle Primärquelle (Regierung, Behörde, UNO, EU, amtliche Karte) und eine unabhängige fachkundige journalistische Quelle. Ereignisdatum und Berichtsdatum sauber auseinanderhalten.
3. **Konkrete Zuschauerfrage bestimmen.** Nicht einfach Nachrichten nacherzählen. Das Video erklärt in verständlicher Sprache `Was hat sich verändert? → Warum? → Welche geografischen/politischen Ursachen? → Was folgt daraus und für wen?`. Karten, Länder und konkrete Beispiele gehören zu dieser Erklärung.
4. **Reichweitenchance nüchtern einschätzen.** Sind Folgen relevant? Gibt es einen sofort verständlichen Konflikt, überraschende Kartenlage, klare offene Frage oder messbar hohes Interesse? Falls echte Trends/YouTube-Suchdaten fehlen, diese ausdrücklich nur als **Potenzial**, niemals als bestätigte Viralität bezeichnen.
5. **Redaktionelle Vergleichsentscheidung.** Vor Projekterstellung nach **Aktualität**, Zuschauerinteresse, visueller Erklärbarkeit, Faktenlage und Neuheitswert priorisieren; keine austauschbaren reißerischen Titel, kein künstlich skandalisierender Frame, keine parteiische Überzeugungsarbeit.
6. **Doppelte Themen sperren.** `THEMEN_HISTORIE.md`, `config/youtube-topic-registry.json`, vorhandene Videoordner und `npm run topic:youtube` prüfen. Erst nach Themenfreigabe Phase 1 beginnen.

## 3. Pflicht in der neuen Recherche

Die Datei `99-technik/RECHERCHE_QUELLEN.md` eines **neuen** Videos dokumentiert neben Quellen auch **Redaktionsanlass und Aktualitätsdatum**: Welche konkrete Nachricht oder gegenwärtige geografische Frage rechtfertigt das Video? Was ist gesichert und was umstritten? Bei länger haltbaren Fragen ausdrücklich als Evergreen kennzeichnen.

Die Rechercheprüfung soll falsche Sicherheit verhindern: **aktuelle Informationen können sich bis zur Veröffentlichung ändern**. Vor Veröffentlichung wesentliche Zeitangaben, politische Entscheidungen, Amtsinhaber und Status von Verhandlungen nochmals prüfen. Falls keine aktuellen Quellen verfügbar sind, nicht so tun, als seien sie geprüft.

## 4. Bestandsschutz und Produktionsfreigabe

- Existierende Geschichtsvideos bleiben technisch reproduzierbar. Ihr früherer `createdAt`-Stand zählt für die historische Kategorie-Regel; neue Projekte müssen ab Stichtag die drei aktiven Kategorien nutzen.
- Der autonome Themenfokus wird durch `src/core/youtube-topic-focus.js` und `src/cli/validate-youtube-phase1-policy.js` geprüft, zusätzlich zur manuellen inhaltlichen Themenkontrolle.
- Die Policy erlaubt keine Änderung, Neuerstellung oder Löschung eines einzelnen bestehenden Videoprojekts ohne gesonderten ausdrücklichen Auftrag.
- Die zuletzt vorgeschlagene Tambora-Idee wurde **nicht** als Projekt im Repository angelegt und ist kein für Weltlogik freigegebenes Thema.

**Ziel:** informativ, faktenbasiert, spannend und aktuell — ohne Versprechen, dass ein Video viral geht.
