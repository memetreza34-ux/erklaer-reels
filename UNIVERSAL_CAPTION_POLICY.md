# Universelle Caption – verbindliche Reel-Regel

Für jedes Erklär-Reel gibt es genau **eine plattformneutrale Caption**, die ohne Umschreiben für alle Social-Media-Accounts des Reels verwendet werden kann, insbesondere Instagram Reels, TikTok, YouTube Shorts und Facebook Reels.

## Sichtbarer finaler Speicherort

Nach erfolgreichem Render liegt alles, was zum Hochladen benötigt wird, gemeinsam unter:

```text
03-export/
├── FERTIGES-REEL.mp4
└── UNIVERSELLE-CAPTION.txt
```

Technische Quelldatei der Caption:

```text
caption/caption.txt
```

Technischer Exportpfad:

```text
export/UNIVERSELLE-CAPTION.txt
```

Es gibt keinen separaten sichtbaren Caption- oder Video-Arbeitsordner mehr.

## Qualitätsziel der Caption

Die Caption muss **individuell zum konkreten Reel passen**. Eine kurze generische Zwei-Satz-Caption reicht nicht.

Verbindliche Regeln:

- Deutsch
- ungefähr **60–130 Wörter** inklusive normalem Fließtext, aber ohne die Hashtags als Ersatz für Inhalt zu verwenden
- erste nichtleere Zeile ist eine **starke, klare Hook** mit direktem Bezug zum Reel-Thema
- die Hook muss sofort verständlich sein und darf nicht vage oder künstlich clickbaitig wirken
- danach 2–4 gut lesbare Sätze mit dem wichtigsten Aha-Punkt bzw. der Erklärung aus dem Video
- die Caption ergänzt das Reel sinnvoll, ohne das komplette Voice-over zu wiederholen
- optional ein kurzer neutraler CTA
- am Ende **3–6 passende Hashtags**

## Universal-Regeln

- dieselbe Caption für alle Social-Media-Accounts und unterstützten Kurzvideo-Plattformen
- keine Plattformnamen als Ansprache
- kein „Link in Bio“
- keine plattformspezifischen Funktionen wie „Duett“, „Remix“ oder „Story teilen“
- keine @Handles als Pflichtbestandteil
- keine Musik-/Trend-Hinweise
- kein langer Quellenblock in der Caption
- kein vollständiges Transkript
- keine leere Standardfloskel wie „Kurz erklärt in unter einer Minute“ als Ersatz für eine echte Caption
- direkt kopierbar

## Export-Verhalten

Der Produktionsworkflow schreibt die individuell erstellte Caption zunächst nach:

```text
caption/caption.txt
```

Der Renderer übernimmt exakt diese geprüfte Caption nach:

```text
export/UNIVERSELLE-CAPTION.txt
```

und schreibt das fertige Video nach:

```text
export/FERTIGES-REEL.mp4
```

Eine fehlende oder deutlich zu kurze Caption soll nicht durch eine schwache automatische Standard-Caption ersetzt werden. Vor dem finalen Export muss eine echte zum Video passende Universal-Caption vorhanden sein.
