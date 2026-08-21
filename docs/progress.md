# Reel-Fortschritt

Der Produktionsstand eines einzelnen Reel-Ordners kann jederzeit berechnet werden:

```bash
npm run status:reel -- \
  --dir "content/2026-KW31_27-07_bis_02-08/donnerstag/reel-01_titel"
```

Maschinenlesbare Ausgabe:

```bash
npm run status:reel -- \
  --dir "content/2026-KW31_27-07_bis_02-08/donnerstag/reel-01_titel" \
  --json
```

## Drei Werte

- **Vorproduktion:** Script, Stilwahl, Szenen, Bildprompts, Cover-Prompt, Caption, Quellen und Inhaltsprüfung.
- **Externe Assets:** Szenenbilder, Cover, Audio und Zuordnungsbericht.
- **Gesamtstand:** 65 % Vorproduktion und 35 % externe Assets.

Ein Reel kann deshalb vor der externen Bilderstellung bei höchstens 65 % Gesamtstand liegen, obwohl Phase 1 bereits 100 % erreicht hat. Das trennt sauber zwischen dem kreativen ChatGPT-Paket, den externen Nutzer-Assets und Antigravity in Phase 3.

Die Ausgabe nennt außerdem den nächsten sinnvollen Schritt, zum Beispiel:

- Phase-1-Auftrag mit normalem ChatGPT fertigstellen
- strenge Inhaltsprüfung bestehen
- Audio und Bilder erzeugen
- unsortierte Assets zuordnen
- Videoschnitt beginnen
