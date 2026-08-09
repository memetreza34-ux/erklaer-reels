# Bildworkflow – Nutzer startet Google Flow, Antigravity erzeugt keine Bilder

## Reel
**Warum bleibt ein negativer Kommentar länger hängen als viele positive?**

## Klare Rollenverteilung

**Antigravity, Codex und andere Repo-Agenten erzeugen keine Cover- oder Szenenbilder.** Sie bereiten nur Reel, Bildprompts, Nummerierung und spätere Pipeline-Schritte vor.

**Der Nutzer startet die Bildgenerierung selbst in Google Flow**, indem er die komplette Datei

`all-image-prompts/all-image-prompts.txt`

auf einmal einfügt und einmal absendet.

Danach ist **Google Flow der Bildgenerator**, aber mit einer harten seriellen Sperre.

## Unverhandelbare serielle Regel

Google Flow darf **niemals mehrere Bilder gleichzeitig erzeugen** und auch keine späteren Bilder vorab in eine Queue legen.

Für jedes Bild gilt exakt:

**Bild erzeugen → vollständig warten → sofort umbenennen → Umbenennung prüfen → ERST DANN nächstes Bild starten.**

Beispiel:

1. Nur Bild 00 erzeugen.
2. Warten, bis Bild 00 vollständig fertig ist.
3. Sofort in `Bild 00.png` umbenennen.
4. Prüfen, dass `Bild 00.png` wirklich gesetzt ist.
5. Erst danach Bild 01 starten.
6. Bild 01 vollständig fertigstellen.
7. Sofort in `Bild 01.png` umbenennen.
8. Erst danach Bild 02 starten.
9. Genau so streng einzeln bis `Bild 13.png`.

Verboten:
- parallele Bildgenerierung
- mehrere Prompts gleichzeitig starten
- Warteschlange/Queue für spätere Bilder
- nächsten Prompt starten, solange aktuelles Bild noch läuft
- mehrere fertige, noch unbenannte Bilder sammeln

## Ordner erst ganz am Ende

Während Bild 00 bis Bild 13 erzeugt werden, wird **noch kein Bild** in den gemeinsamen Sammelordner verschoben.

Erst wenn:
- alle 14 Bilder vollständig erzeugt sind,
- jedes Bild direkt nach seiner Erzeugung korrekt benannt wurde,
- die Reihe `Bild 00.png` bis `Bild 13.png` vollständig geprüft wurde,

werden **alle 14 Bilder gemeinsam auf einmal** in

`00-bildprompts/00-ALLE-BILDER-HIER-REIN/`

bzw. technisch `inbox/numbered-images/` gelegt.

Nicht vorher. Nicht einzeln während der Generierung. Nicht auf einzelne Cover-/Szenenordner verteilen.

## Danach

Erst wenn die Google-Flow-Bilder vorhanden sind, dürfen Antigravity/Codex bzw. die Repo-Pipeline wieder übernehmen:

```bash
npm run organize:assets -- --dir "reels/2026-KW32_03-08_bis_09-08/sonntag/reel-02_warum-bleibt-negative-kritik-laenger-haengen"
```

Danach jedes vorgeschlagene Ziel wirklich visuell gegen Narration, `visualIdea`, `imageText` und `imagePrompt` prüfen, Zwei-Pass-QC dokumentieren und erst danach:

```bash
npm run organize:assets -- --dir "reels/2026-KW32_03-08_bis_09-08/sonntag/reel-02_warum-bleibt-negative-kritik-laenger-haengen" --apply
```

Unter 0,90 visueller Konfidenz wird nicht geraten. Keine Bilder gelten als geprüft, solange die echte visuelle Kontrolle nicht erfolgt ist.
