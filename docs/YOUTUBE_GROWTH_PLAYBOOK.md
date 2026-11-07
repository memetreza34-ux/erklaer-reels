# YouTube-Wachstums- & Qualitäts-Playbook (Views-First)

**Gilt ab sofort für alle zukünftigen YouTube-Produktionen in diesem Repository.**

Dieses Playbook fasst die Learnings aus den bisherigen Videos zusammen und definiert den verbindlichen Standard, damit Videos auf YouTube nicht bei 0–50 Aufrufen hängenbleiben, sondern vom Algorithmus aktiv empfohlen und geklickt werden.

---

## 1. Die Klickrate (CTR): Wie Zuschauer überhaupt auf das Video kommen

Der beste Inhalt bringt null Views, wenn niemand klickt. Bei YouTube entscheiden Titel und Thumbnail zu 80 % über den Erfolg.

### A. Die Titel-Formel (Verbot von Referats-Titeln)
* ❌ **Verboten (Todesurteil für Klicks):** Rein deskriptive Lexikon-Überschriften  
  *Beispiele:* „Straße von Hormus: Warum diese Meerenge wichtig ist“, „Das UN-Veto einfach erklärt“, „Was ist Föderalismus?“
* ✅ **Pflicht (In jedem neuen Video müssen 3 Varianten in `YOUTUBE-UPLOAD.txt` stehen):**
  1. **Variante 1 (Persönliche Relevanz & Dringlichkeit):**  
     *Muster:* [Konkrete Zahl / Bedrohung] + [Direkte Auswirkung auf den Alltag]  
     *Beispiel:* „39 Kilometer, die unseren Benzinpreis explodieren lassen können“
  2. **Variante 2 (Machtkampf & Paradoxon):**  
     *Muster:* [Überraschender Widerspruch / Wer erpresst wen?]  
     *Beispiel:* „14 Länder sagen JA, 1 sagt NEIN: Warum das UN-Veto die Welt blockiert“
  3. **Variante 3 (Suchbegriff + starker Twist):**  
     *Muster:* [Kern-Thema] + [Die gefährliche / überraschende Wahrheit]  
     *Beispiel:* „Straße von Hormus: Warum 39 km gefährlicher sind als der Suezkanal“

### B. Das Thumbnail (Handy-Display-Regel)
* Über 65 % der Zuschauer sehen das Thumbnail auf dem Smartphone (Briefmarkengröße).
* **Die 3 Gesetze für das Cover (`THUMBNAIL.png`):**
  1. **Maximal 2 bis 3 Worte Text:** Keine ganzen Sätze! Nur Signalwörter in fetter, serifenloser Schrift.  
     *Gut:* `ÖL-STOPP?`, `14 GEGEN 1!`, `39 KM ENGPASS!`, `BLOCKIERT!`  
     *Schlecht:* „39 km. Globale Folgen für alle.“
  2. **Ein dominanter Blickfang:** Ein klar erkennbares Zentrum (z. B. eingekeilter Tanker, erhobene Veto-Hand, glühende Ampel).
  3. **Hoher Farbkontrast:** Hintergrund dunkel/kühl (Navy, Anthrazit), Blickfang und Text leuchtend/warm (Gelb, Weiß, Signalleuchten).

---

## 2. Die Zuschauerbindung (Retention / AVD): Die ersten 30 Sekunden

YouTube misst nach dem Klick sofort: **Wie viele Zuschauer sind nach 30 Sekunden noch da?**  
Fällt die Quote unter 50 %, stoppt der Algorithmus die Impressionen.

### A. Die 15-Sekunden-Regel (Hook vor Definition)
* ❌ **Verboten am Anfang:**
  * Keine Nachrichten-Meldungen („Am 5. Oktober meldeten Sicherheitsstellen...“)
  * Keine Lexikon-Definitionen („Das UN-Veto bezeichnet laut Völkerrecht...“)
  * Keine Begrüßungsfloskeln („Willkommen zu einem neuen Video...“)
* ✅ **Erlaubt & Pflicht:**
  * **Sofort die Auswirkung für den Zuschauer spürbar machen:**  
    *„Stell dir vor, du stehst an der Tankstelle und Benzin kostet plötzlich 4 Euro. Der Grund dafür liegt 5.000 Kilometer entfernt...“*
  * **Oder ein unlösbares Rätsel aufwerfen:**  
    *„Vierzehn Länder stimmen für Frieden. Ein einziges sagt Nein. Und der gesamte Beschluss ist sofort tot...“*

### B. Die 3-Welten-Regel gegen visuelle Monotonie
Niemals mehr als 2 identische Kartenausschnitte hintereinander! Jedes Video muss mindestens 3 unterschiedliche visuelle Sphären bedienen:
1. **Die Sach-Ebene:** Der reale Ort / die Institution (z. B. Karte der Meerenge, Sicherheitsrat).
2. **Die Alltags-Ebene:** Konkrete Folgen für Menschen (z. B. Zapfsäule, Supermarktregal, Fabrikband, Stromrechnung).
3. **Die Analogie-Ebene:** Bildliche Metaphern zur Veranschaulichung (z. B. verstopftes Rohr, Waage mit 3 Gewichten, Dominosteine, Hebel).

### C. Sound-Design & Hintergrundmusik
* Ein 6-Minuten-Video ohne Musikbett wirkt wie eine Vorlesung.
* In zukünftigen Renderplänen (`YOUTUBE_RENDER_PLAN.json`) ist `backgroundMusic: true` vorgesehen (leise, pulsierende Ambient-/Spannungs-Musik, gepegelt auf ca. -24 dBFS unter dem Sprecher).

---

## 3. Der Kaltstart-Funnel: Wie ein neuer Kanal Views aufbaut

Ein neuer Kanal hat 0 Abonnenten. Der Algorithmus zeigt das Langvideo anfangs nur wenigen Leuten.

### Das Shorts-Schwungrad (Short-to-Long Funnel)
1. **Aus jedem neuen Video wird ein 45–60 Sekunden Short geschnitten.**
2. **Inhalt des Shorts:**
   - Sekunde 0–5: Der stärkste Hook / Schockmoment.
   - Sekunde 6–35: Der Kernkonflikt in einfachen Worten.
   - Sekunde 36–50: Die Auflösung anteasern + Call to Action: *„Das ganze Video jetzt auf unserem Kanal!“*
3. **Verknüpfung:** In YouTube Studio beim Short auf „Verwandtes Video“ klicken und das Langvideo verlinken.
4. **Ergebnis:** Shorts werden vom Algorithmus sofort tausendfach ausgespielt, bringen neue Abonnenten und schaufeln gezielt Klicks auf das Langvideo.

---

## 4. Checkliste vor Phase-2-Freigabe (Phase 1 Gate)

Bevor Bilder generiert oder Audios eingesprochen werden, MUSS das Video diese 5 Fragen mit JA beantworten:
1. [ ] **Titel-Check:** Gibt es mindestens 3 A/B-Titel mit Neugierde-Faktor statt reiner Inhaltsangabe?
2. [ ] **Thumbnail-Check:** Enthält der Cover-Text maximal 3 prägnante Signalworte?
3. [ ] **Hook-Check:** Machen die ersten 2 Sätze das Problem für den Zuschauer persönlich oder spannend greifbar?
4. [ ] **Visual-Check:** Sind Alltagsfolgen und Analogien im Storyboard eingeplant (mindestens 3 Bildwelten)?
5. [ ] **Short-Check:** Ist der Hook so formuliert, dass er direkt als 45-Sekunden-Short funktioniert?
