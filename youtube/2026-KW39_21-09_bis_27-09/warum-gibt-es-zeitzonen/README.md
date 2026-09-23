# Warum gibt es Zeitzonen?

YouTube-V2-Testprojekt · KW39 2026

- Format: YouTube Longform
- Zieldauer: ca. 2:00 min nach Audio-Optimierung
- Sprache: Deutsch
- Voice-Skript: 338 Wörter
- Bildwelt: `serious-minimal-countryball-explainer-youtube-16x9`
- Quellwelt: `serious-minimal-countryball-explainer`
- Produktionsregeln: V2
- Bilder: 19 Videobilder + Bild 00 als Thumbnail
- Google Flow: maximal 5 aktive Bildgenerierungen gleichzeitig
- Audio Phase 3: lange Pausen kürzen, Endstille entfernen, 1,10x, Pitch erhalten, −16 LUFS, max. −1,5 dBTP

## Bildwelt-Hard-Lock

Dieses Video nutzt dieselbe visuelle DNA wie die aktiven Reels:
- perfekte runde Countryball-artige Akteure
- einfache weiße Augen
- dicke saubere schwarze Konturen
- flache kontrollierte 2D-Farben
- minimale grafische Schattierung
- geringe bis mittlere Detaildichte
- ein dominantes Hauptmotiv
- normalerweise 0–3 sinnvolle Zusatzobjekte
- einfacher grafischer Hintergrund
- seriös und nicht kindisch

Einzige Formatänderung: 16:9 horizontal statt 9:16 vertikal.

Verboten:
- Stickfiguren
- normale Cartoon-Menschen
- realistische Menschen
- 3D/Pixar/Clay/Fotorealismus
- generische vollgestellte KI-Szenen

Bild 01 wird separat als Master-Style-Frame erzeugt. Ab Bild 02 wird Bild 01 bei jeder Generierung als visuelle Referenz angehängt.

## Deutsch-Hard-Lock

Jeder sichtbare lesbare Text muss Deutsch sein. Englischer Text oder Pseudo-Schrift = Hard Fail und Regeneration.

## Sichtbare Struktur

```text
00-bildprompts/
└── google-flow-prompt.txt

01-voice-script/
└── voice-script.txt

02-audio/
└── voiceover-final.*

03-export/
99-technik/
```

Wellenlogik:

`Bild 00 → Bild 01 Master → 02–05 → prüfen → 06–10 → prüfen → 11–15 → prüfen → 16–19`

## Phase 1 abgeschlossen

Vorbereitet sind:
- Duplicate-Check
- Recherche und Quellen
- finaler Titel
- ein Google-Flow-Masterprompt
- vollständiges 338-Wörter-Voice-over-Skript
- 19 individuell geplante Videobilder
- exakte Textanker für jedes Bild
- A–E-Komplexität
- Motion-/SFX-Plan
- Kapitelplan
- Upload-Metadaten im Produktionsplan

## Phase 2

1. `00-bildprompts/google-flow-prompt.txt` in Google Flow nutzen.
2. Bild 00 separat erzeugen.
3. Bild 01 separat erzeugen und als Master-Stil prüfen.
4. Danach die Bilder in maximal 5er-Wellen erzeugen.
5. Alle Bilder flach als `Bild NN.png` unter `00-bildprompts/images/` ablegen.
6. `01-voice-script/voice-script.txt` als eine finale Voice-over-Datei aufnehmen/erzeugen.
7. Voice-over als `02-audio/voiceover-final.wav` oder ein anderes unterstütztes Audioformat ablegen.

## Phase 3

```bash
npm run phase3:youtube -- --dir "youtube/2026-KW39_21-09_bis_27-09/warum-gibt-es-zeitzonen"
```

Phase 3 verändert das Nutzeroriginal nicht. Sie erzeugt intern die 1,10x-/Pausen-bereinigte Produktionsfassung, misst danach Whisper-Wortzeiten, baut die Timeline und rendert das fertige Video.
