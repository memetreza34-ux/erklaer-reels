# Bildprompts

Für Google Flow gibt es genau **eine** verbindliche Masterdatei:

`99-alle-bildprompts.txt`

Es gibt keine zweite Spiegelkopie unter `all-image-prompts/`. Alte technische Kopien werden beim Export automatisch entfernt.

Feste Reel-Bildwelt: **Modern Countryball Explainer**. Wenn Akteure vorkommen, sind es runde Kugelfiguren mit einfachen weißen Augen und ohne separaten Kopf; Flaggen nur bei echter geografischer Relevanz, sonst neutrale Kugeln. Eine Kugelfigur ist nicht in jedem Bild Pflicht, wenn ein Gegenstand, Mechanismus, eine Karte oder eine Umgebung die Aussage klarer erklärt. Menschliche Köpfe auf Kugelkörpern, humanoide Cartoonmenschen und Stick-Figuren sind nicht Teil der aktiven Reel-Bildwelt.

Prompts sind Englisch, sichtbarer Bildtext ist Deutsch. Vor Bild 00 legt Google Flow den gemeinsamen Ordner `00-FERTIGE-REEL-BILDER` an. Danach immer genau ein Bild erzeugen, vollständig warten, prüfen, umbenennen, in diesen Ordner legen und erst dann das nächste starten. Keine Batch- oder Parallelgenerierung.

Aktualisieren:

```bash
npm run export:prompts -- --dir "reels/2026-KW35_24-08_bis_30-08/sonntag/reel-01_warum-hat-sudafrika-drei-hauptstadte" --strict
```
