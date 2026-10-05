# SCRIPT QUALITY V1 — YouTube-Langvideos

**Gilt verbindlich für neue Schema-14+-Projekte.**

Ziel: Skripte sollen nicht nur korrekt sein, sondern als gesprochenes YouTube-Langvideo funktionieren: verständlich, unterhaltsam, konkret und mit echtem Erklärwert.

## 1. Einstieg

Es gibt **kein festes Kanal-Satzmuster**.

Geeignete Formen sind je nach Thema:
- konkrete Szene / Mini-Geschichte
- historischer Moment mit Ort oder Zeit
- überraschender Fakt
- Konflikt oder Dilemma
- Paradox / Widerspruch
- starke direkte Frage

Der konkrete Videogegenstand muss früh erkennbar werden.

### Verboten

- `Denkst du dir gerade vielleicht.` als Standardfloskel
- `Du fragst dich jetzt vielleicht.` als Standardfloskel
- altes Muster `Frage → Denkst du dir gerade vielleicht → Kurz gesagt`
- generisches `In diesem Video erklären wir ...`
- generisches `Heute geht es um ...`
- abstrakte Lexikon-/Schulbuchdefinition als Einstieg
- nicht ausgefüllte Hook-/Template-Platzhalter

## 2. Mehrwert statt Ereignisliste

Ein gutes Langvideo beantwortet nicht nur **was** passiert ist, sondern immer wieder auch:
- warum geschah es?
- warum reagierte die andere Seite so?
- was änderte sich dadurch?
- welche Folge hatte das?
- warum ist dieser Punkt für das Gesamtthema wichtig?

Deshalb prüft der Hard-Gate eine Mindestdichte an Ursache-/Folge-Signalen. Die Prüfung ist absichtlich konservativ; sie ersetzt kein redaktionelles Urteil, verhindert aber reine Faktenlisten.

## 3. Konkretheit

Langvideos brauchen konkrete Anker. Je nach Thema können das sein:
- Jahre und Zeitpunkte
- Zahlen oder Größenordnungen
- konkrete Beispiele
- Orte
- Institutionen
- Personen/Akteure
- Verträge, Krisen, Ereignisse oder nachvollziehbare Einzelfälle

Der technische Gate zählt bewusst nur objektiv erkennbare Signale wie Daten, Mengen und explizite Beispiele. Die eigentliche redaktionelle Planung soll darüber hinaus konkrete Orte, Akteure und Situationen verwenden.

## 4. Gesprochene Sprache

Das Skript ist **Voice-over**, kein Aufsatz.

Regeln:
- Sätze möglichst klar und direkt
- wenige unnötige Nebensatzketten
- lange Gedankengänge in mehrere Sätze teilen
- Absätze nicht zu langen Textblöcken anwachsen lassen
- Übergänge variieren
- rhetorische Fragen gezielt, nicht ständig

Der Gate prüft deshalb durchschnittliche Satzlänge, Anteil sehr langer Sätze und übergroße Absätze.

## 5. Unterhaltung + Information

Unterhaltung bedeutet hier nicht Witze oder künstliches Clickbait.

Gemeint ist:
- neugierig machende konkrete Situationen
- Konflikte und Entscheidungen sichtbar machen
- überraschende Zusammenhänge zeigen
- Ursache und Wirkung verständlich erzählen
- Fakten in einen roten Faden einordnen

**Klarheit vor Cleverness. Inhalt vor Floskel. Mehrwert vor Fülltext.**

## 6. Technischer Hard-Gate

Einzelprüfung:

```bash
npm run validate:youtube-script -- --dir "youtube/<woche>/<thema>"
```

Phase 1:

```bash
npm run validate:youtube-phase1 -- --dir "youtube/<woche>/<thema>"
```

`validate:youtube-phase1` führt zuerst Script Quality V1 und danach die übrigen Phase-1-Policies aus.

Phase 3 ruft wiederum den vollständigen Phase-1-Gate auf. Ein neues Schema-14+-Projekt kann daher mit nicht freigegebenem Skript nicht in den Render durchrutschen.

## 7. Rückwärtskompatibilität

Schema 13 und älter werden nicht rückwirkend durch Script Quality V1 blockiert. Bereits produzierte Projekte bleiben reproduzierbar.

Neue Projekte aus dem aktuellen Template verwenden Schema 14 und müssen Script Quality V1 bestehen.
