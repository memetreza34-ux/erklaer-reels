# Weltlogik — Themenauswahl: Politik an erster Stelle

**Gültig für alle NEUEN Weltlogik-Langvideos ab 13. Oktober 2026.** Ergänzt `YOUTUBE_WORKFLOW.md` und `config/youtube-channel-policy.json`. Ändert weder die Bildwelt noch bestehende Projekte.

## 1. Identität des Kanals

**Weltlogik vermittelt vor allem Politik und politische Bildung.** Ein Video soll zeigen, **was ein politischer Begriff, ein Mechanismus oder ein aktueller Konflikt bedeutet, warum er entstanden ist und welche Auswirkungen er hat**. Es muss nicht immer die neueste Nachricht sein.

**Die thematische Hierarchie lautet:**

1. **Politik (Hauptfokus)** — politische Entscheidungen, Macht, Demokratie, Regierungen, Staaten, Gesetze, Wahlen, Parlamente, Institutionen, internationale Beziehungen und Konflikte.
2. **Politische Bildung und Begriffe (gleichwertig zum aktuellen Politikthema)** — Föderalismus, Souveränität, Gewaltenteilung, Vetorecht, Sanktionen, Populismus, Rechtsstaat, politische Systeme, Begriffsherkunft.
3. **Ideologien und Gesellschaftssysteme** — z. B. Liberalismus, Konservatismus, Sozialismus, Kommunismus, Nationalismus. Bedeutung, Entstehung, Unterschiede, Beispiele und politische Folgen **sachlich und fair** darstellen. Keine Ideologie bewerben.
4. **Geografie und Geopolitik** — Länder, Grenzen, Territorien, Meerengen, Handelswege, Ressourcen und Karten als eigenständige Bildungsfragen oder im politischen Zusammenhang.
5. **Historische Ursprünge** — frühere politische Entscheidungen, Revolutionen, Begriffsursprünge und die Entwicklung von Staaten/Ideologien/Grenzen dürfen das Video wesentlich prägen, **wenn die Leitfrage politisch oder geografisch ist**.

**Nicht autonom produzieren:** reine militärische Schlachtchronologien, historische Lebensläufe oder klassische Geschichtsdokumentationen **ohne** erkennbare politische, staatliche oder geografische Erkenntnisfrage. Es gibt kein generelles Geschichtsverbot: die **politisch relevante Vergangenheit** ist ausdrücklich erwünscht.

## 2. Erlaubte Beispiele für unterschiedliche Videoarten

- **Aktuell:** „Warum streiten zwei Länder über diese Grenze?“ / „Wie wirken die neuen Sanktionen?“
- **Grundwissen:** „Was ist ein Rechtsstaat – und was macht ihn aus?“ / „Was bedeutet Souveränität?“
- **Begriffsursprung:** „Warum spricht man in der Politik von links und rechts?“ (mit historischer Entstehung).
- **Ideologien:** „Was unterscheidet Sozialismus und Kommunismus?“ (mit Ursprung und praktischen Beispielen).
- **Systeme:** „Warum gibt es Gewaltenteilung?“ / „Wie funktioniert ein parlamentarisches System?“
- **Geografie:** „Warum sind Exklaven politisch kompliziert?“
- **Geopolitik:** „Warum ist die Straße von Hormus wichtig?“

Diese Beispiele **sind keine automatische Produktionsfreigabe**. Immer zuerst `THEMEN_HISTORIE.md`, die Registry und den Themen-Editor prüfen. Manche Ideen wurden schon behandelt und dürfen nicht einfach doppelt produziert werden.

## 3. Redaktioneller Entscheidungsprozess

1. **Politische Leitfrage feststellen:** Welches Wissen über Politik, Staat, Gesellschaftssystem, Grenze oder internationale Beziehungen erhält der Zuschauer? Kein erzwungenes politisches Stichwort bei einem fachfremden Thema.
2. **Aktuellen Anlass oder dauerhaftes Lerninteresse wählen:** Aktuelle Entwicklungen sind wichtige Kandidaten, doch **Evergreen-Bildungsvideos brauchen keine News**. Nicht einen künstlichen Tagesbezug erfinden, um eine Definition zu rechtfertigen.
3. **Quellen recherchieren und abgleichen:** Mindestens zwei geeignete unabhängige nachvollziehbare Quellen, nach Möglichkeit eine Primär-/Fachquelle. Bei aktuellen Themen aktuelle Veröffentlichungs-/Ereignisdaten prüfen. Bei Begriffen/Ideologien etablierte politikwissenschaftliche, institutionelle und historische Fachquellen nutzen; verschiedene Definitionen und Kontroversen kenntlich machen.
4. **Erklärwert und Zuschauerinteresse vergleichen:** konkrete verständliche Frage, interessante Entstehung oder überraschende Konsequenz, gute Kartenszenen/Illustrationen, klare Dramaturgie. Potenzielles Interesse nicht als garantierte Viralität ausgeben.
5. **Sachlich bleiben:** Keine Partei-, Wahl- oder Ideologiepropaganda. Bei politisch umstrittenen Fragen relevante Sichtweisen nachvollziehbar darstellen, klar zwischen Fakt, Interpretation und Prognose unterscheiden.
6. **Themen-Editor vor Projektanlage:** `npm run topic:youtube -- --topic "NEUES THEMA"`. Nur `APPROVED_NEW` freigeben; gleiche Kernfrage in neuem Titel ist nicht neu.

## 4. Anforderungen an die Video-Erklärung

Bei einem **aktuellen** Thema: *Was ist passiert? → Warum? → Wer verfolgt welche Interessen? → Was bedeutet das?* Die zeitkritischen Aussagen vor Veröffentlichung erneut verifizieren.

Bei einem **Begriff/System/einer Ideologie**: *Was heißt es verständlich? → Woher kommt es? → Wie funktioniert es? → Worin unterscheidet es sich von verwandten Begriffen? → Ein konkretes Beispiel → Warum ist es relevant?* Nicht zwanghaft jeden Punkt abarbeiten; jeweils nur die hilfreichen Schritte auswählen.

Bei **politisch relevanter Geschichte**: *Welche frühere Entscheidung oder Entwicklung erklärt den heutigen Begriff, Staat, Grenzverlauf oder die politische Ordnung?* Historische Passagen dürfen länger sein, sofern sie zur Leitfrage gehören.

Im neuen Projekt `99-technik/RECHERCHE_QUELLEN.md` die **Themenart** (aktuell / politische Bildung / Ideologie / politisch-geografisch / historischer Ursprung), Quellen und gegebenenfalls den Nachrichtenstichtag dokumentieren. Evergreen-Fragen benötigen **kein** künstliches Aktualitätsdatum, wohl aber sorgfältige Quellen.

## 5. Bildwelt, Qualität und Schutz

Serious Minimal Countryball Explainer als konstante hochwertige flache 2D-Visualisierung; Countryballs nur, wo sie politische Akteure sinnvoll erklären, sonst Karten, Texte, Dokumente, Symbole oder gegenständliche Szenen. Kein neues starres Bildkontingent und keine Änderung des technischen Render-Workflows.

Die Regeln zu `docs/POST_VIDEO_IMPROVEMENT.md` (nach jedem fertigen Video lernen) und `docs/CHANGE_SAFETY_POLICY.md` (vorhandene Videos schützen) bleiben verbindlich. **Bestehende Projekte werden weder migriert noch verändert.**
