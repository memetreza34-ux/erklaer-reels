# 02 – Audio — V2

Für neue YouTube-Projekte wird **eine einzige finale Voice-over-Datei** verwendet:

```text
voiceover-final.wav
```

Andere gängige Audioformate sind technisch ebenfalls möglich, aber pro neuem V2-Projekt soll unter `02-audio/` nur **eine** finale Produktionsdatei liegen.

Regeln:
- vollständiges `01-voice-script/voice-script.txt` in einer zusammenhängenden Stimme einsprechen/erzeugen
- keine sichtbaren Audio-Parts
- keine unnötig lange führende oder abschließende Stille
- Phase 3 misst echte Whisper-Wortzeitstempel
- überlange Endstille wird erkannt und für das interne Master-Audio automatisch gekürzt
- die Originaldatei unter `02-audio/` bleibt unverändert
- das gekürzte Produktionsmaster liegt technisch unter `99-technik/YOUTUBE_AUDIO_MASTER.wav`

Legacy-Projekte mit mehreren Audio-Parts bleiben lesbar, definieren aber nicht mehr den Standard für neue Videos.
