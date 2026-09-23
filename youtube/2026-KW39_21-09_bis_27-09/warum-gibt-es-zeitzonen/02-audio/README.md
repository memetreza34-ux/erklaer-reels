# Audio

Hier wird genau **eine** finale Nutzer-Voice-over-Datei abgelegt.

Empfohlener Name:

```text
voiceover-final.wav
```

Andere unterstützte Audioformate sind möglich.

Wichtig:
- vollständiges `01-voice-script/voice-script.txt` einmal sprechen/erzeugen
- keine sichtbaren Audio-Parts
- Nutzeroriginal nicht selbst auf 1,10x beschleunigen
- Nutzeroriginal nicht wegen langer Pausen destruktiv überschreiben

Phase 3 übernimmt automatisch:
- lange Pausen kürzen
- Anfangsstille straffen
- Endstille entfernen
- exakt 1,10x Geschwindigkeit
- Tonhöhe erhalten
- −16 LUFS
- True Peak max. −1,5 dBTP
- 48 kHz internes Produktionsaudio

Whisper misst die Wortzeiten **erst nach** dieser Optimierung.
