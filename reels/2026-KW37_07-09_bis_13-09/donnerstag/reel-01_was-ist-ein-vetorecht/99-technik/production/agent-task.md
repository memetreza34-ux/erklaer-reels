# Codex-Produktionsauftrag: Was ist ein Vetorecht?

## Ziel

Erstelle ein vollständiges Erklär-Reel mit ungefähr einer Minute Voice-over-Laufzeit. Bilder und Audio werden extern erzeugt. **Narrative Szenen und Bildanzahl sind getrennt:** Die Hook besitzt exakt einen Bildmoment; jede weitere narrative Szene besitzt exakt zwei aufeinanderfolgende Bildmomente. Das Reel wird vollständig ohne Untertitel produziert und gerendert.

**Verbindliche Reel-Bildwelt: Serious Minimal Countryball Explainer (`serious-minimal-countryball-explainer`).** Die Welt bleibt fest, aber die Bilder müssen deutlich lebendiger als statische Lernposter wirken.

## Ausgangsdaten

- Reel-ID: `reel-01_was-ist-ein-vetorecht`
- Titel: **Was ist ein Vetorecht?**
- narrative Szenen: **9**
- geplante Bilder: **17**
- Bildanzahl-Modus: **one-hook-two-standard**
- feste Reel-Bildwelt: **Serious Minimal Countryball Explainer / serious-minimal-countryball-explainer**
- Voice-over-Zieldauer: **55–60 Sekunden**
- Zieltext: **155–175 Wörter**
- Format: **9:16**
- Voice-over: **Deutsch**
- Bildprompts: **Englisch**
- sichtbarer Bildtext: **Deutsch, Cover Pflicht; danach optional**
- Hook-Dauer: **4.5–6 Sekunden**
- normale narrative Szenen: **6–7.5 Sekunden**
- Schlussszene inklusive Nachlauf: **5.8–8.2 Sekunden**
- ruhiger Nachlauf nach Sprecherende: **0.6 Sekunden**
- Szenen-Cut: **ca. 0.10 s vor dem Szenen-Cue**
- interner Bild-Cut: **ca. 0.08 s vor dem Bild-Cue**
- SFX-Start: **ca. 0.04 s vor dem Bild-Cut**
- Bildzuordnung: **mindestens 0.75 Konfidenz, zwei visuelle Durchgänge pro Bildphase**
- Untertitel: **deaktiviert**
- Quellen-QC: **Schema 3 für neu erstellte Reels**
- Audio-Pacing: **exakt 1.10x**
- Lautheit: **-16 LUFS, höchstens -1.5 dBTP**
- Hintergrundmusik: **aus**

## Rohscript

> Ein einziges Land sagt Nein. Und der mächtigste Raum der Welt steht still.
> 
> Das passiert im Sicherheitsrat der Vereinten Nationen. Er darf Sanktionen verhängen und sogar Militäreinsätze beschließen.
> 
> Fünfzehn Länder sitzen an diesem Tisch. Zehn davon wechseln alle zwei Jahre.
> 
> Fünf bleiben dauerhaft: die USA, Russland, China, Frankreich und Großbritannien. Die Siegermächte des Zweiten Weltkriegs.
> 
> Diese fünf haben etwas, das sonst niemand hat. Das Vetorecht. Für einen Beschluss braucht der Rat neun Ja-Stimmen von fünfzehn.
> 
> Doch bei echten Sachfragen gilt zusätzlich: Sagt auch nur eines der fünf ständigen Länder Nein, ist der Beschluss tot. Egal wie viele dafür sind.
> 
> Entscheidend ist der Unterschied zur Enthaltung. Wer sich enthält, blockiert nicht. Nur ein ausdrückliches Nein stoppt alles.
> 
> Warum gibt es diese Sonderregel? Sie war 1945 der Preis für die Gründung. Ohne Vetorecht hätten die Großmächte nicht mitgemacht.
> 
> Und genau deshalb ändert sich daran fast nichts. Denn jede Änderung der Charta müssen alle fünf mittragen. Wer das Vetorecht abschaffen will, braucht die Zustimmung derer, die es besitzen.

## Verbindlicher Ablauf

1. Lies `CURRENT_WORKFLOW.md`, `AGENTS.md`, `CODEX_TASK.md`, `knowledge/fixed-visual-world.md`, `knowledge/production-rules.md`, `config/image-styles.json`, `config/effects-rules.json` und `config/production-quality-gates.json`.
2. Überarbeite das Script auf 155–175 Wörter und ungefähr 55–60 Sekunden bei 1,10x. Szene 1 startet sofort mit Frage, Überraschung oder Kontrast. Schreibe so, dass der Sprecher natürlich betonen kann: kurze klare Sätze, Schlüsselwörter, keine monotone Vorlesekadenz.
3. Das Ende benötigt zwei getrennte Stufen: persönliche Prüf-/Erkenntnisfrage und danach konkrete Lösung mit kurzem einprägsamem Abschlusssatz.
4. Schreibe denselben finalen Text nach `script/final-script.txt` und `script/voice-script.txt`.
5. Plane 9 narrative Szenen. Bildanzahl: 1 + (Szenen − 1) × 2.
6. Setze und behalte `visualStyleId: "serious-minimal-countryball-explainer"`. Keine Stilrotation und keine YouTube-Stick-Figure-/16:9-Welt.
7. Hook exakt 1 Bild; jede weitere Szene exakt 2. Eine dritte Bildphase ist verboten.
8. Das zweite Bild bekommt ein eigenes `audioCue` aus 2–5 exakt gesprochenen Wörtern. Der Cue wird so gewählt, dass der neue visuelle Gedanke genau zu diesem Sprachmoment passt.
9. `startPercent` wird aus der Cue-Position im Text abgeleitet. Im finalen Schnitt wird der Bildwechsel automatisch ca. 0.08 s vor dem echten Cue platziert. Beide Bildphasen müssen mindestens 3 Sekunden sichtbar bleiben.
10. Schreibe `reel.json.plannedImageCount` und `imageCountMode: "one-hook-two-standard"` korrekt.
11. Hinterlege pro Szene `imageCount` und `imagePhases`. Erste Phase `startPercent: 0`, zweite streng danach.
12. Jede Phase bekommt eigene `visualIdea` und `rationale`. **Nur Bild 01 braucht zwingend imageText.** Für spätere Bildphasen ist `imageText` optional; falls verwendet 1–4 deutsche Wörter. Ziel: nur etwa 35–60 % der Nicht-Cover-Bilder mit Text. Ein starkes Bild ohne Text ist erwünscht.
13. Aktualisiere `scenes/scene-index.json` und jede `scene.json` synchron.
14. Hook 4.5–6s, Standardszenen 6–7.5s, letzte Szene inklusive Nachlauf 5.8–8.2s.
15. Schreibe für jede Bildphase einen vollständigen englischen 9:16-Prompt.

### Pflichtregeln für die neue lebendige Bildwirkung

- konkrete visuelle Mini-Szene statt Lernposter
- sichtbare Handlung, Reaktion, Veränderung, Ursache-Folge oder räumliche Beziehung
- ein dominantes Hauptmotiv und 1–3 unterstützende Elemente
- einfache kontextuelle Umgebung statt leerer Fläche, wenn sie die Erklärung verbessert
- einfache Tiefe über Vordergrund/Mittelgrund/Hintergrund, Überlagerung, Größenunterschied oder gerichtetes Licht, wenn sinnvoll
- kräftige, kontrollierte Farbkontraste
- Perspektive zwischen benachbarten Bildern wechseln: Close-up, Medium, einfache Weite, Objekt-Detail, Karte, leichte Draufsicht oder Off-Center
- keine zwei direkt aufeinanderfolgenden Bilder mit nahezu derselben Center-Komposition
- keine große Headline plus ein isoliertes Symbol auf leerem Hintergrund als Standard
- Text darf nie das Hauptmotiv ersetzen; das Bild muss auch ohne Text verständlich sein
- Countryball-Figuren nur wenn Akteure sinnvoll personifiziert werden
- Länder-/Regionsflaggen nur bei echter geografischer Relevanz
- keine generischen schwebenden Karten, Icon-Gitter, UI-Boxen oder Figur-mittig-plus-Icons-Komposition
- keine realistischen Menschen, kein Fotorealismus, kein Anime, kein Clay, kein glänzendes 3D
- sichtbarer Text ausschließlich Deutsch; Prompts Englisch
- keine technische Workflow-Beschriftung im Bild
- Bild 01 ist Cover und braucht eine starke deutsche Überschrift im oberen Bereich, aber zusätzlich eine starke Illustration

16. Exportiere die Prompts:

```bash
npm run export:prompts -- --dir "reels/2026-KW37_07-09_bis_13-09/donnerstag/reel-01_was-ist-ein-vetorecht" --strict
```

Die verbindliche Nutzerdatei ist `00-bildprompts/99-alle-bildprompts.txt`.

17. Untertitel deaktiviert lassen. Kein `sync:words`.
18. Fülle `effects/effects-plan.json` verbindlich:
   - Hook `none`, danach harte `cut`-Transitions
   - dezente Kamerabewegung auf fast jedem Bildmoment, auch auf zweiten Bildphasen; Zoom meist 2–4 %, Pan maximal ca. 3 %
   - jeder Szenenwechsel bekommt einen kurzen SFX
   - jeder interne Bildwechsel bekommt einen kurzen SFX oder einen passenden Objekt-Sound
   - interner SFX mit `targetId` auf die zweite Bildphase legen
   - Standardlautstärke ca. 0,22, meist 0,18–0,28
   - bei reinen Übergängen SFX ca. 0.04 s vor dem Cut starten; akustischer Akzent liegt am Schnitt
   - dieselbe Transition-SFX-Variante nie zweimal hintereinander
19. Fülle die Caption aus.
20. Fülle `sources/sources.md` nach Schema 3 aus: mindestens zwei HTTPS-Quellen auf unterschiedlichen Hosts, davon mindestens eine Primär-/offizielle oder wissenschaftliche Quelle und eine unabhängige Sekundär-/Fachquelle.
21. Prüfe streng:

```bash
npm run check:content -- --dir "reels/2026-KW37_07-09_bis_13-09/donnerstag/reel-01_was-ist-ein-vetorecht" --strict
```

## Nach Eintreffen von Bildern und Voice-over

### 1. Audio

```bash
npm run trim:pauses -- --dir "reels/2026-KW37_07-09_bis_13-09/donnerstag/reel-01_was-ist-ein-vetorecht" --speed 1.10
```

Der Audio-Schritt muss Anfangs-/Endstille entfernen, Pausen straffen und Lautheit messen. Das finale Video darf nach dem letzten Wort nicht mehrere Sekunden stumm weiterlaufen.

### 2. Alle Bildphasen zweifach zuordnen

```bash
npm run organize:assets -- --dir "reels/2026-KW37_07-09_bis_13-09/donnerstag/reel-01_was-ist-ein-vetorecht"
```

Für jedes Bild: sichtbaren Inhalt beschreiben, konkrete Bildphase prüfen, gegen vorheriges/nächstes Bild vergleichen und erst ab 0.75 Konfidenz bestätigen. Zusätzlich prüfen: keine Posterkarte, Text nicht dominant, Perspektive ausreichend abwechslungsreich und Serious Minimal Countryball Explainer eingehalten.

Danach:

```bash
npm run organize:assets -- --dir "reels/2026-KW37_07-09_bis_13-09/donnerstag/reel-01_was-ist-ein-vetorecht" --apply
```

### 3. Timeline, visuelle Prüfung und Render

```bash
npm run build:timeline -- --dir "reels/2026-KW37_07-09_bis_13-09/donnerstag/reel-01_was-ist-ein-vetorecht"
npm run sync:audio -- --dir "reels/2026-KW37_07-09_bis_13-09/donnerstag/reel-01_was-ist-ein-vetorecht" --strict
npm run check:visuals -- --dir "reels/2026-KW37_07-09_bis_13-09/donnerstag/reel-01_was-ist-ein-vetorecht" --strict
npm run finalize:reel -- --dir "reels/2026-KW37_07-09_bis_13-09/donnerstag/reel-01_was-ist-ein-vetorecht" --strict
npm run validate:render -- --dir "reels/2026-KW37_07-09_bis_13-09/donnerstag/reel-01_was-ist-ein-vetorecht"
npm run render:reel -- --dir "reels/2026-KW37_07-09_bis_13-09/donnerstag/reel-01_was-ist-ein-vetorecht"
```

Die Master-Timeline synchronisiert narrative Szenen und interne Bildphasen mit dem finalen Voice-over. Interne Bilder schneiden standardmäßig ca. 0.08 s vor dem tatsächlich gesprochenen Cue, SFX beginnen kurz davor und die letzte Bildphase bleibt nach dem letzten Wort nur 0.6 Sekunden stehen.

