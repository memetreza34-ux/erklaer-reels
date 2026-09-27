# YouTube-Produktionsstandard nach der Testphase

**Stand: 2026-09-27**  
**Status: Testphase abgeschlossen**  
**Gilt für: neue YouTube-Langvideos ab Schema 13**

Diese Datei hält die fünf wichtigsten Learnings aus der abgeschlossenen YouTube-Testphase fest. Sie ergänzt `YOUTUBE_WORKFLOW.md`, `YOUTUBE_VISUAL_WORLD.md` und `config/youtube-channel-policy.json`.

Die Grundrichtung gilt als **produktionsreif**. Neue Videos werden ab jetzt regulär produziert und nur noch gezielt feinjustiert. Eine neue Grundsatz-Testphase ist nicht nötig, solange der Nutzer keinen Richtungswechsel verlangt.

---

## 1. Inhalt vor Figur — HARD RULE

Vor jedem Bild zuerst fragen:

> Welche Darstellung erklärt diesen Satz und dieses konkrete Thema am besten?

Nicht zuerst fragen:

> Wie bekomme ich hier noch einen Countryball hinein?

Countryballs sind **optional**. Sie werden nur verwendet, wenn Handlung, Perspektive, Konflikt, Vergleich oder ein konkreter Akteur dadurch verständlicher wird.

Wenn eine Karte, ein Objekt, ein Dokument, ein Gebäude, ein Schema oder eine reine Sachillustration klarer ist, wird **kein Countryball erzwungen**.

---

## 2. So einfach wie möglich, so komplex wie nötig — HARD RULE

Ein hochwertiges Bild muss nicht voll sein.

Ausdrücklich erlaubt:
- ein einzelnes Objekt
- ein Dokument
- eine Karte
- ein Gebäude
- ein kurzes Schema
- eine einfache Szene
- ein Countryball
- mehrere Countryballs
- mehrere relevante Elemente
- eine komplexere Umgebung

Die Bildkomplexität richtet sich **nur nach dem Informationsbedarf**.

Nicht künstlich ergänzen:
- Figuren
- Props
- Pfeile
- Labels
- Vordergrund/Mittelgrund/Hintergrund
- Dekoration
- zusätzliche Gebäude

wenn diese Elemente das Verständnis nicht verbessern.

**Leitsatz:**

> **So einfach wie möglich, so komplex wie nötig.**

---

## 3. Anschauliche Illustration vor abstrakter Erklärtafel — HARD RULE

Bevorzugt werden konkrete, anschauliche Darstellungen:
- Straße
- Markt
- Gericht
- Parlament
- Rathaus
- Bahnhof
- Werkstatt
- Bibliothek
- Nachbarschaft
- Grenze
- Karte
- Dokument
- historischer Ort
- konkretes Objekt

Zu vermeiden sind als Standard:
- abstrakte Poster
- Dashboard-/Kachelbilder
- Mehrspalten-Erklärtafeln
- Icon-Raster
- viele kleine Symbole ohne klare Hauptaussage
- Präsentationsfolien-Look

Ein einfaches Schema ist erlaubt, wenn es eine Struktur oder einen Ablauf schneller erklärt als eine inszenierte Szene.

---

## 4. Jedes Bild muss sichtbar zum konkreten Thema gehören — HARD RULE

Ein Bild muss gleichzeitig:
1. zum gesprochenen Satz passen,
2. zum konkreten Videothema passen.

Jeder Bildmoment braucht weiterhin:

```text
Visual Purpose: ...
Topic Anchor: ...
Visual Form: ...
Composition Mode: ...
Prompt: ...
```

Prüffrage:

> Könnte dieses Bild fast unverändert in einem anderen Erklärvideo vorkommen?

Wenn ja, ist es zu generisch.

Deshalb:
- keine zufälligen Länder
- keine zufälligen Flaggen
- keine Countryballs nur als Dekoration
- keine austauschbaren Metaphern, wenn eine konkrete thematische Illustration möglich ist
- Schlussbild fasst den **konkreten Themenkern** zusammen

---

## 5. Dichte Stellen früher auf mehrere Bilder aufteilen — HARD RULE

Wenn die Narration mehrere visuelle Gedanken enthält, wird früher gesplittet.

Zusätzliches Bild besonders bei:
- neuem Kerngedanken
- Ursache → Folge
- Vorher → Nachher
- neuem Akteur
- Ortswechsel
- Epochenwechsel
- Karten-/Grenz-/Routenschritt
- Erklärung → Beispiel
- eigenständigem Objekt/Begriff
- zu langem Hold auf einem einfachen Bild

Zielwerte bleiben:
- durchschnittlich ca. **4,5–7,5 s pro Bild**
- ab **9 s** Split prüfen
- ab **11 s** Split stark bevorzugen
- **16 s Hard-Max**

Mehr Bilder sind ausdrücklich erlaubt, wenn sie den Inhalt klarer und abwechslungsreicher machen. Keine zusätzlichen Bilder nur für mehr Schnitte.

---

# Produktionsentscheidung nach der Testphase

Die Testphase ist **beendet**.

Als bewährt gelten:
- Serious-Minimal-Countryball-Bildwelt in 16:9
- Countryballs optional pro Bild
- Visual Flexibility V1
- Scene Illustration V2
- Topic Visual Relevance V1
- adaptive Bildanzahl
- Bild 01 = Cover + erste Videoszene
- 3 Cover-Kandidaten → 1 Gewinner
- Bild 02–NN jeweils einmal
- keine Bild-zu-Bild-Referenzen
- keine Menschen / Stickfiguren / realistischen Hände
- deutscher sichtbarer Text
- 1,3-s-Schluss-Hold

## Ab jetzt

Neue Videos laufen als **normale Produktion**.

Verbesserungen erfolgen nur noch als gezielte Feinanpassungen, zum Beispiel:
- an einzelnen dichten Stellen 1–3 zusätzliche Bilder
- bessere Visual Form für einen konkreten Satz
- stärkere Themenbindung eines einzelnen Bildes
- bessere Farb-/Kompositionsentscheidung

Nicht mehr bei jedem Video grundsätzlich neu testen:
- komplette Bildwelt
- Countryball-Pflicht
- Grundstruktur der Pipeline
- Coverlogik
- Asset-Ordnung

---

# Schnellprüfung vor Flow

Vor Übergabe eines neuen Videos an Google Flow:

1. Ist jedes Bild wirklich nötig?
2. Ist die gewählte Visual Form die einfachste klare Lösung?
3. Wurde irgendwo ein Countryball auf Zwang eingefügt?
4. Gibt es unnötig komplizierte Szenen?
5. Gibt es zu lange Holds, die besser gesplittet werden sollten?
6. Passt jedes Bild sichtbar zum konkreten Thema?
7. Sind abstrakte Poster-/Dashboard-Bilder vermieden?
8. Sind alle Countryballs/Länder narrativ begründet?
9. Fasst das letzte Bild den konkreten Themenkern zusammen?
10. Bleibt die Serious-Minimal-Countryball-DNA trotz unterschiedlicher Visual Forms konsistent?

Wenn diese Punkte erfüllt sind, ist Phase 1 bereit für die reguläre Produktion.
