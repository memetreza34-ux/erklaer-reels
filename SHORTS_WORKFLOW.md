# SHORTS WORKFLOW — VERBINDLICHE REGEL FÜR SHORTS & REELS

**Stand: 2026-11-07**  
**Format:** Vertikal 9:16 (1080 × 1920 Pixel) für YouTube Shorts, Instagram Reels und TikTok  
**Bildwelt:** `serious-minimal-countryball-explainer` (9:16 vertical)  
**Strukturstandard:** 1:1 identisch zur YouTube-Langvideo-Architektur  

---

## 1. Einheitliche Ordnerstruktur

Ab sofort folgen alle neuen Shorts und Reels exakt derselben 2-stufigen Hierarchie wie die YouTube-Langvideos:

```text
shorts/YYYY-KWNN_DD-MM_bis_DD-MM/<themen-slug>/
├── 00-bildprompts/
│   ├── google-flow-prompt.txt      (Google-Flow-Masterprompt für Cover & Szenen)
│   └── images/                     (Exakt Bild 01.png bis Bild NN.png)
├── 01-voice-script/
│   └── voice-script.txt            (Sprechfertiger Text: 55–60 s, ~155–175 Wörter)
├── 02-audio/
│   └── voiceover-final.wav         (Studio-gemastertes Audio, -16 LUFS, 48 kHz Mono)
├── 03-export/
│   ├── THUMBNAIL.png               (Separates vertikales Cover, 3 Kandidaten → 1 Gewinner)
│   ├── SHORTS-UPLOAD.txt           (Titel mit Hook, Beschreibung, Hashtags, Pin-Kommentar)
│   └── <themen-slug>.mp4           (Final gerendertes 9:16 MP4-Video)
└── 99-technik/
    ├── status.json                 (Phasen- und Asset-Status)
    ├── video.json                  (Format- und Render-Konfiguration)
    ├── EDITORIAL_BRIEF.json        (Fakten, Kausalitätsketten und Quellen)
    ├── BILD_AUDIO_ZUORDNUNG.json   (Satz- und Bildanker-Mapping)
    ├── FINAL_TIMELINE.json         (Berechnete Schnitt- und Motion-Timeline)
    └── voiceover-raw.wav           (Roh-Audio vor Studio-Mastering)
```

---

## 2. Die 3 Produktionsphasen

### Phase 1 — Antigravity (vollautomatisch)
1. **Themenfreigabe & Recherche:** Belastbare Fakten, Kausalitätsketten (Ursache → Mechanismus → Folge) in `99-technik/EDITORIAL_BRIEF.json`.
2. **Skript:** Schreiben des prägnanten Sprechtexts in `01-voice-script/voice-script.txt` (sofortiger inhaltlicher Hook, 55–60 s).
3. **NEU — Vollautomatische Sprachgenerierung:** Lokale Synthese der Meisterstimme `stickman-user-clone` via MLX Qwen3-TTS:
   ```bash
   npm run voice:short -- --dir "shorts/<woche>/<thema>"
   ```
   Erzeugt `99-technik/voiceover-raw.wav` und `02-audio/voiceover-final.wav`.
4. **Google-Flow-Prompts:** Erstellen des Masterprompts in `00-bildprompts/google-flow-prompt.txt` mit 9:16 Bildkompositionen und 5er-Batch-Vorgabe.
5. **Mapping:** Vorab-Verknüpfung der Sätze mit Bildmomenten in `99-technik/BILD_AUDIO_ZUORDNUNG.json`.

---

### Phase 2 — Arman (NUR NOCH BILDER & COVER)
* **Kein Audioaufwand:** Du musst nichts mehr aufnehmen, schneiden oder hochladen.
* **Cover zuerst:** 3 Kandidaten in Google Flow erzeugen → stärkstes Cover wählen → als `03-export/THUMBNAIL.png` speichern (gehört nicht in die Timeline).
* **Szenenbilder in 5er-Batches:**
  1. `00-bildprompts/google-flow-prompt.txt` öffnen.
  2. Immer genau 5 Bilder erzeugen (01–05, dann 06–10 etc.).
  3. Bilder kontrollieren und als `Bild 01.png` ... `Bild NN.png` in `00-bildprompts/images/` ablegen.

---

### Phase 3 — Antigravity (vollautomatisch)
Ein einziger Befehl startet die Endproduktion:
```bash
npm run phase3:short -- --dir "shorts/<woche>/<thema>"
```
* **Asset-Prüfung:** Verifiziert Vollständigkeit von `Bild 01.png` bis `Bild NN.png` und `THUMBNAIL.png`.
* **Whisper-Alignment:** Exakte Synchronisation der Schnittpunkte auf das bereits fertige Audio.
* **Sound Design & Motion:** Automatische Bindung von Whooshes/Pops und subtilen Kamerabewegungen (subtle push-in, subtle pull-out, pan).
* **Render:** 1080 × 1920 MP4-Rendering direkt nach `03-export/<themen-slug>.mp4`.
* **Upload-Paket:** Fertige Metadaten in `03-export/SHORTS-UPLOAD.txt`.
