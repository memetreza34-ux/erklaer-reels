# Alle Bildprompts

In `all-image-prompts.txt` steht zuerst der Cover-Prompt und danach folgen alle Szenenprompts chronologisch.

Die Datei wird aus `cover/cover-prompt.txt` und `scenes/scene-XX/image-prompt.txt` erzeugt.

```bash
npm run export:prompts -- --dir "content/2026-KW32_03-08_bis_09-08/dienstag/reel-01_sozialismus-einfach-erklaert" --strict
```
