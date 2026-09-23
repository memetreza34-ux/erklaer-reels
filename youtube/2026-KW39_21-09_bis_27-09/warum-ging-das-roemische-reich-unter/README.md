# Warum ging das Römische Reich wirklich unter?

YouTube Golden-V2-Testprojekt · KW39 2026

- Format: YouTube Longform
- Zieldauer: ca. 5:20 min
- Sprache: Deutsch
- Bildwelt: `serious-minimal-countryball-explainer-youtube-16x9`
- Quellwelt: `serious-minimal-countryball-explainer` aus den Reels
- Produktionsregeln: V2
- Bilder: 38 Videobilder + Bild 00 als Thumbnail
- Google Flow: maximal 5 aktive Bildgenerierungen gleichzeitig

## Bildwelt-Hard-Lock

Dieses Video nutzt **dieselbe visuelle Welt wie die Reels**:
- perfekte runde Countryball-artige Akteure
- einfache weiße Augen
- dicke saubere schwarze Konturen
- flache kontrollierte 2D-Farben
- minimale grafische Schattierung
- geringe bis mittlere Detaildichte
- ein dominantes Hauptmotiv
- normalerweise 0–3 sinnvolle Zusatzobjekte
- einfacher grafischer Hintergrund
- seriös, clean, nicht kindisch

**Einzige Formatänderung:** 16:9 horizontal statt 9:16 vertikal.

Verboten:
- Stickfiguren
- normale Cartoon-Menschen
- realistische Menschen
- 3D/Pixar/Clay/Fotorealismus
- realistische Vollszenen

Bild 01 wird separat als Master-Style-Frame erzeugt. Ab Bild 02 wird Bild 01 bei jeder Generierung als visuelle Referenz angehängt.

## Deutsch-Hard-Lock

Bei diesem deutschen Video muss jeder sichtbare lesbare Text Deutsch sein. Englischer sichtbarer Text oder Pseudo-Schrift = Hard Fail → Bild regenerieren.

## Einfache sichtbare Struktur

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

`Bild 00 → Bild 01 Master → 02–05 → prüfen → 06–10 → prüfen → 11–15 → ... → 36–38`

## Status

Phase 1 ist vorbereitet:
- Recherche und Quellen
- Titel
- ein Masterprompt
- ein vollständiges Voice-over-Skript
- 38 individuell geplante Videobilder
- A–E-Komplexität
- internes Bild↔Audio-Mapping
- Edit-/Motion-/SFX-Plan
- Upload-Metadaten
- Reel-Countryball-Welt für YouTube 16:9 verankert
- Deutsch-Hard-Lock verankert

Phase 2:
1. bisherigen falschen Stickman-Versuch verwerfen
2. `google-flow-prompt.txt` neu an Google Flow geben
3. Bild 00 separat erzeugen
4. Bild 01 separat erzeugen und auf die Reel-Countryball-Welt prüfen
5. Bild 02–05 mit Bild 01 als Referenz erzeugen
6. danach in maximal fünf aktiven Generierungen pro Welle fortfahren
7. vollständiges `voice-script.txt` einmal als finales Voice-over erzeugen
8. finale Audiodatei in `02-audio/` ablegen

Phase 3 übernimmt Synchronisation, Timeline und Render automatisch.
