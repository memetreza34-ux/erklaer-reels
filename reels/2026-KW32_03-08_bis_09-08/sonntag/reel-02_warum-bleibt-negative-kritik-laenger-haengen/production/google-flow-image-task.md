# Google Flow – Bildauftrag

## Reel
**Warum bleibt ein negativer Kommentar länger hängen als viele positive?**

Arbeite ausschließlich mit:
`all-image-prompts/all-image-prompts.txt`

## Unverhandelbarer Ablauf
1. Beginne mit **Bild 00 = Cover**.
2. Lies nur den Prompt für Bild 00.
3. Erzeuge genau **ein** Bild mit Image 3.
4. Sobald es fertig ist, benenne es sofort exakt in `Bild 00.png` um.
5. Erst danach Bild 01 lesen und erzeugen.
6. Bild 01 sofort in `Bild 01.png` umbenennen.
7. So einzeln und streng chronologisch weiter bis `Bild 13.png`.
8. Nie zwei oder mehrere noch unbenannte Bilder gleichzeitig erzeugen.
9. Nach dem letzten Bild prüfen: Bild 00 bis Bild 13 vollständig, keine Lücke, kein Duplikat.
10. **Erst wenn alle 14 Bilder fertig und umbenannt sind**, alle gemeinsam in `inbox/numbered-images/` legen. In der Finder-Ansicht entspricht das `00-bildprompts/00-ALLE-BILDER-HIER-REIN/`.
11. Nicht manuell in einzelne Cover-/Szenenordner verteilen.

## Danach
`npm run organize:assets -- --dir "reels/2026-KW32_03-08_bis_09-08/sonntag/reel-02_warum-bleibt-negative-kritik-laenger-haengen"`
Dann jedes vorgeschlagene Ziel visuell gegen Narration, visualIdea, imageText und imagePrompt prüfen, Zwei-Pass-QC dokumentieren und erst danach:
`npm run organize:assets -- --dir "reels/2026-KW32_03-08_bis_09-08/sonntag/reel-02_warum-bleibt-negative-kritik-laenger-haengen" --apply`

Keine Bilder gelten als fertig geprüft, solange die echte visuelle Kontrolle nicht erfolgt ist.
