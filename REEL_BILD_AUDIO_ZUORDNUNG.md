# Reel Bild↔Audio-Zuordnung — verbindliche Phase-3-Regel

Diese Datei gilt ausschließlich für **Reels**. YouTube hat seine eigene Regel unter `youtube/YOUTUBE_WORKFLOW.md`.

## Ziel

Antigravity darf nicht selbst schätzen, welcher gesprochene Satz zu welchem Bild gehört. Für jedes Reel wird deshalb in Phase 1 eine kanonische Datei erzeugt:

```text
99-technik/BILD_AUDIO_ZUORDNUNG.json
```

Sie ordnet **jeden einzelnen Bildmoment exakt einem gesprochenen Satz oder Satzabschnitt** zu.

Bei einem Standard-Reel mit 9 Szenen sind das 17 Einträge:
- Szene 1 / Hook: 1 Bildmoment
- Szene 2–9: jeweils 2 Bildmomente

## Inhalt pro Bildmoment

Jeder Mapping-Eintrag enthält mindestens:

```text
globalImageNumber
visibleImageFileName
sceneId
phaseId
spokenText
startAnchor
endAnchor
existingAudioCue
timingRole
cutLeadSeconds
actualStartSeconds
actualEndSeconds
alignmentConfidence
```

### `spokenText`

Das ist der **exakte Textbereich**, der zu diesem Bild gehört.

Beispiel:

```text
Bild 05
spokenText:
„Der Körper reagiert zuerst automatisch. Dein Gehirn bewertet die Situation erst danach.“
```

Antigravity darf Bild 05 nicht schon beim vorherigen Satz zeigen und auch nicht bis weit in den nächsten Satz stehen lassen.

### `startAnchor`

Gesprochene Wörter, an denen der Bildbereich im finalen Voice-over eindeutig gefunden wird.

### `endAnchor`

Beginn des nächsten Bildbereichs bzw. der nächsten Szene. Beim letzten Bild gilt `VOICEOVER_END`.

### `actualStartSeconds` / `actualEndSeconds`

Diese Werte bleiben in Phase 1 leer (`null`). Sie dürfen erst in **Phase 3** anhand des tatsächlich optimierten Voice-overs gesetzt werden.

## Phase 1 — ChatGPT

ChatGPT muss vor Übergabe an Phase 2 sicherstellen:

1. Jede Szene hat eine eindeutige Narration.
2. Jede zweite Bildphase einer Standardszene besitzt ein `audioCue`, das tatsächlich in der Narration vorkommt.
3. Die Narration wird anhand dieses Cues in zwei logische Sprachbereiche geteilt.
4. Jeder Bildmoment erhält exakt einen `spokenText`-Bereich.
5. Die Zuordnungen überlappen nicht und lassen keinen gesprochenen Text zwischen zwei Bildmomenten unzugeordnet.
6. `99-technik/BILD_AUDIO_ZUORDNUNG.json` wird erzeugt.

Der normale Paketimport erzeugt diese Datei automatisch.

## Phase 2 — Arman

Die Zuordnung wird nicht verändert. Arman erzeugt:
- echtes Voice-over
- die vorgesehenen Bilder

Die Bildnummern müssen zur globalen Reihenfolge passen (`Bild 01.png`, `Bild 02.png` usw.).

## Phase 3 — Antigravity

Das **final optimierte Voice-over ist die Masterspur**.

Antigravity arbeitet zwingend in dieser Reihenfolge:

1. `99-technik/BILD_AUDIO_ZUORDNUNG.json` lesen.
2. Finales Voice-over laden und erst vollständig optimieren: Pausen, 1,10x, Loudness, Endstille.
3. Für jeden Eintrag `startAnchor` und `endAnchor` im **finalen** Audio auflösen.
4. Tatsächliche Zeiten als `actualStartSeconds` und `actualEndSeconds` bestimmen.
5. Prüfen, dass `spokenText` in genau diesem Audiobereich gesprochen wird.
6. Erst danach die Bildtimeline bauen.
7. Szenenbild minimal vor seinem echten Szenenbeginn sichtbar machen: Ziel ca. **0,10 s vorher**.
8. Interne zweite Bildphase minimal vor ihrem echten Sprachanker sichtbar machen: Ziel ca. **0,08 s vorher**.
9. Mindestdauer von 3,0 s pro Bildphase bleibt ein Hard Gate; bei Konflikt darf nicht blind verschoben werden, sondern die Zuordnung muss geprüft werden.
10. SFX ca. 0,04 s vor dem sichtbaren Cut setzen.

## Nicht erlaubt

Antigravity darf nicht:
- Bilder pauschal alle X Sekunden wechseln
- nur nach Prozentwerten schneiden
- `startPercent` als finale Wahrheit behandeln
- einen Bildwechsel nach Gefühl vorziehen oder verspäten
- einen nicht gefundenen Anchor raten
- einen Satz einem anderen Bild zuordnen, nur damit die Dauer besser aussieht
- alte oder fremde Bilder als Ersatz verwenden

## Unsichere Zuordnung

Wenn ein Anchor im Audio nicht eindeutig gefunden wird oder der erkannte Bereich nicht zum `spokenText` passt:

```text
STOP → Zuordnung prüfen → nicht raten
```

`alignmentConfidence` bleibt solange leer oder wird als unsicher markiert. Erst nach eindeutiger Prüfung darf der Timeline-Schritt fortgesetzt werden.

## Finale QC

Vor Render muss für jeden Bildmoment gelten:
- Bildnummer korrekt
- `spokenText` passt zum sichtbaren Bild
- Start-/Endzeit aus finalem Audio abgeleitet
- kein Bild wechselt erkennbar zu früh oder zu spät
- keine Lücke zwischen zwei Sprachbereichen
- keine ungewollte Überlappung
- interne und Szenen-Cuts folgen ihren realen Audioankern

Die Mapping-Datei ist damit die inhaltliche Brücke zwischen **Script → Bild → echtem Voice-over → Timeline**.
