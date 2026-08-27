# Universelle Caption – verbindliche Reel-Regel

Für jedes Erklär-Reel gibt es genau **eine plattformneutrale Caption**, die ohne Umschreiben für **Instagram Reels, TikTok und YouTube Shorts** verwendet werden kann.

## Speicherorte

Arbeitsdatei:

```text
caption/caption.txt
```

Sichtbare Arbeitsansicht:

```text
03-caption/caption.txt
```

Finaler Export nach erfolgreichem Render:

```text
05-export/UNIVERSELLE-CAPTION.txt
```

Technischer Exportpfad:

```text
export/UNIVERSELLE-CAPTION.txt
```

## Inhalt

Die Caption ist auf Deutsch und besteht normalerweise aus:

1. einer kurzen Hook oder Frage zum Reel-Thema,
2. ein bis zwei knappen Sätzen mit dem wichtigsten Aha-Punkt,
3. optional einem kurzen neutralen CTA wie „Speichern, wenn du dir das merken willst.“,
4. drei bis fünf passenden Hashtags.

## Universal-Regeln

- keine Plattformnamen in der Caption
- kein „Link in Bio“
- keine plattformspezifischen Funktionen wie „Duett“, „Remix“ oder „Story teilen“
- keine @Handles als Pflichtbestandteil
- keine Musik-/Trend-Hinweise
- kein langer Quellenblock in der Caption
- keine Wiederholung des kompletten Voice-overs
- kompakt und direkt kopierbar
- dieselbe Datei wird für Instagram Reels, TikTok und YouTube Shorts benutzt

## Export-Verhalten

Der Renderer schreibt das fertige Video standardmäßig direkt nach:

```text
export/FERTIGES-REEL.mp4
```

und übernimmt `caption/caption.txt` automatisch nach:

```text
export/UNIVERSELLE-CAPTION.txt
```

Falls `caption/caption.txt` beim Rendern leer ist, wird als Sicherheits-Fallback eine kurze plattformneutrale Caption aus dem Reel-Titel erzeugt. Der normale Produktionsworkflow soll die Caption jedoch vorher individuell ausfüllen.

Der sichtbare Ordner `05-export` enthält damit alles, was für den Upload benötigt wird:

```text
05-export/
├── FERTIGES-REEL.mp4
└── UNIVERSELLE-CAPTION.txt
```
