# Manueller Bildauftrag – nur der Nutzer erstellt Bilder

## Reel
**Warum folgen Menschen der Gruppe, obwohl die Gruppe falsch liegt?**

## Rollenregel

**Kein Agent erzeugt Bilder.** Antigravity, Codex und andere automatisierte Agenten dürfen weder Cover noch Szenenbilder generieren oder regenerieren.

Der Nutzer erstellt alle Bilder selbst anhand von:

`all-image-prompts/all-image-prompts.txt`

## Manueller Ablauf

1. Nutzer liest nur den Prompt für **Bild 00 = Cover**.
2. Nutzer erstellt genau ein Bild.
3. Nutzer benennt es sofort `Bild 00.png`.
4. Erst danach Prompt für **Bild 01 = Szene 1** verwenden.
5. Bild 01 selbst erstellen und sofort `Bild 01.png` nennen.
6. So streng einzeln bis **Bild 13 = Szene 13** fortfahren.
7. Nach Bild 13 prüfen: keine Nummer fehlt, keine Nummer doppelt, nichts vertauscht.
8. Erst dann alle 14 fertigen Bilder gemeinsam in `00-bildprompts/00-ALLE-BILDER-HIER-REIN/` bzw. technisch `inbox/numbered-images/` legen.
9. Nicht manuell auf einzelne Cover-/Szenenordner verteilen.

## Danach

Erst wenn die Nutzerbilder vorhanden sind, darf ein Agent mit Asset-Ingest, echter visueller Zwei-Pass-Prüfung, QC, Audio-Sync und Render fortfahren. Die Nummer ist nur ein Zielvorschlag; unter 0,90 visueller Konfidenz wird nicht geraten.
