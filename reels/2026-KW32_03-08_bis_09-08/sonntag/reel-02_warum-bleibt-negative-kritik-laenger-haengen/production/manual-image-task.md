# Bildworkflow – Nutzer startet Google Flow, Antigravity erzeugt keine Bilder

## Reel
**Warum bleibt ein negativer Kommentar länger hängen als viele positive?**

## Klare Rollenverteilung

**Antigravity, Codex und andere Repo-Agenten erzeugen keine Cover- oder Szenenbilder.** Sie bereiten nur Reel, Bildprompts, Nummerierung und spätere Pipeline-Schritte vor.

**Der Nutzer startet die Bildgenerierung selbst in Google Flow.** Dafür kopiert er die komplette Datei

`all-image-prompts/all-image-prompts.txt`

auf einmal in Google Flow und sendet sie ab.

Ab diesem Moment ist **Google Flow der Bildgenerator** und soll den kompletten eingefügten Auftrag ohne Bestätigungstext ausführen.

## Ablauf in Google Flow

1. Nutzer kopiert die komplette `all-image-prompts.txt` in Google Flow und sendet sie einmal ab.
2. Google Flow startet sofort mit **Bild 00 = Cover**.
3. Google Flow erzeugt immer genau ein Bild gleichzeitig.
4. Nach Bild 00 folgt automatisch Bild 01, danach Bild 02 usw.
5. Keine Bestätigung, keine Zusammenfassung und keine Rückfrage zwischen den Bildern.
6. Reihenfolge strikt bis **Bild 13 = Szene 13**.
7. Dateinamen: `Bild 00.png`, `Bild 01.png`, ... `Bild 13.png`.
8. Erst wenn alle 14 Bilder fertig sind, vollständige Nummerierung prüfen.
9. Danach alle Bilder gemeinsam in `00-bildprompts/00-ALLE-BILDER-HIER-REIN/` bzw. technisch `inbox/numbered-images/` legen.
10. Nicht manuell auf einzelne Cover-/Szenenordner verteilen.

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
