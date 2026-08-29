from pathlib import Path
import json
import re

REEL = Path('reels/2026-KW35_24-08_bis_30-08/sonntag/reel-01_warum-hat-sudafrika-drei-hauptstadte')


def replace_required(path, old, new, count=1):
    path = Path(path)
    text = path.read_text(encoding='utf-8')
    if text.count(old) < count:
        raise RuntimeError(f'{path}: Text nicht gefunden: {old[:100]!r}')
    path.write_text(text.replace(old, new, count), encoding='utf-8')


def replace_optional(path, old, new, count=1):
    path = Path(path)
    text = path.read_text(encoding='utf-8')
    if old in text:
        text = text.replace(old, new, count)
    path.write_text(text, encoding='utf-8')


# reel-package: Hook hart prüfen und zweite Bildphase an gesprochenen Cue binden.
replace_required(
    'src/core/reel-package.js',
    "import { createReelWorkspace } from './workspace.js';",
    "import { createReelWorkspace } from './workspace.js';\nimport { inspectReelHook } from '../shared/reel-hook-quality.js';\nimport { findNarrationCueStartPercent } from '../shared/image-phase-cue.js';"
)
replace_required(
    'src/core/reel-package.js',
    '  // Die Caption-Regeln des Renderers, nur früher geprüft. Sonst fällt eine zu kurze\n',
    "  if (Array.isArray(szenen) && szenen[0]) {\n    const hook = inspectReelHook({ narration: szenen[0].narration, imageText: szenen[0].imageText });\n    if (!hook.passed) probleme.push(`Szene 1: Hook-Gate nicht bestanden: ${hook.issues.join(' ')}`);\n  }\n\n  // Die Caption-Regeln des Renderers, nur früher geprüft. Sonst fällt eine zu kurze\n"
)
replace_required(
    'src/core/reel-package.js',
    '      bilder.forEach((bild, bildIndex) => {\n',
    "      bilder.forEach((bild, bildIndex) => {\n        if (bildIndex > 0) {\n          const phaseCue = text(bild.audioCue);\n          const cueStart = findNarrationCueStartPercent(szene.narration, phaseCue);\n          if (!phaseCue) {\n            probleme.push(`Szene ${nr}, Bild ${bildIndex + 1}: audioCue fehlt. Der Bildwechsel muss an gesprochenen Wörtern hängen.`);\n          } else if (cueStart === null) {\n            probleme.push(`Szene ${nr}, Bild ${bildIndex + 1}: audioCue \\\"${phaseCue}\\\" kommt in der Narration nicht vor.`);\n          }\n        }\n"
)

path = Path('src/core/reel-package.js')
text = path.read_text(encoding='utf-8')
pattern = re.compile(r"    szene\.imagePhases = bilder\.map\(\(bild, j\) => \(\{.*?\n    \}\)\);\n    szene\.imageCount = szene\.imagePhases\.length;", re.S)
replacement = """    szene.imagePhases = bilder.map((bild, j) => {
      const phaseCue = j === 0 ? szene.audioCue : text(bild.audioCue);
      const cueStart = j === 0 ? 0 : findNarrationCueStartPercent(quelle.narration, phaseCue);
      return {
        ...szene.imagePhases[j],
        phaseId: `${szene.sceneId}-image-${String(j + 1).padStart(2, '0')}`,
        order: j + 1,
        startPercent: j === 0 ? 0 : cueStart,
        audioCue: phaseCue,
        timingBasis: j === 0 ? 'scene-start' : 'narration-audio-cue',
        promptFileName: j === 0 ? 'image-prompt.txt' : `image-prompt-${String(j + 1).padStart(2, '0')}.txt`,
        expectedImageFileName: j === 0 ? `${szene.sceneId}.png` : `${szene.sceneId}-${j + 1}.png`,
        visualIdea: text(bild.visualIdea) || szene.visualIdea,
        imageText: text(bild.imageText),
        rationale: text(bild.rationale) || 'Eigener Bildmoment für diesen gesprochenen Satzteil.',
        imageStatus: 'missing',
        assetVerification: null
      };
    });
    szene.imageCount = szene.imagePhases.length;"""
text, n = pattern.subn(replacement, text, count=1)
if n != 1:
    raise RuntimeError(f'src/core/reel-package.js: imagePhases-Block {n}x ersetzt')
path.write_text(text, encoding='utf-8')
replace_required(
    'src/core/reel-package.js',
    '  reel.plannedImageCount = index.reduce((summe, szene) => summe + szene.imagePhases.length, 0);\n',
    "  reel.plannedImageCount = index.reduce((summe, szene) => summe + szene.imagePhases.length, 0);\n  reel.imagePhaseTimingMode = 'narration-audio-cue';\n"
)

# Phasen-Metadaten durch Normalisierung erhalten.
replace_required(
    'src/shared/visual-moments.js',
    "      imageText: String(rawPhase?.imageText ?? (primary ? scene.imageText ?? '' : '')).trim(),\n",
    "      imageText: String(rawPhase?.imageText ?? (primary ? scene.imageText ?? '' : '')).trim(),\n      audioCue: String(rawPhase?.audioCue ?? (primary ? scene.audioCue ?? '' : '')).trim(),\n      timingBasis: String(rawPhase?.timingBasis ?? (primary ? 'scene-start' : 'narration-audio-cue')).trim(),\n"
)
replace_required(
    'src/shared/visual-moments.js',
    "    imageText: phase.imageText ?? (index === 0 ? scene.imageText ?? '' : ''),\n",
    "    imageText: phase.imageText ?? (index === 0 ? scene.imageText ?? '' : ''),\n    audioCue: phase.audioCue ?? (index === 0 ? scene.audioCue ?? '' : ''),\n    timingBasis: phase.timingBasis ?? (index === 0 ? 'scene-start' : 'narration-audio-cue'),\n"
)

# Content-Validator: Hook und Cue-Abhängigkeit als harte Gates.
replace_required(
    'src/core/content-validator.js',
    "import { FIXED_VISUAL_STYLE_ID } from '../shared/fixed-visual-world.js';",
    "import { FIXED_VISUAL_STYLE_ID } from '../shared/fixed-visual-world.js';\nimport { inspectReelHook } from '../shared/reel-hook-quality.js';\nimport { findNarrationCueStartPercent } from '../shared/image-phase-cue.js';"
)
replace_required(
    'src/core/content-validator.js',
    '  const fixedVisualWorldRequired = usesFixedVisualWorld(reel);\n',
    "  const fixedVisualWorldRequired = usesFixedVisualWorld(reel);\n  const cueTimedPhasesRequired = reel.imagePhaseTimingMode === 'narration-audio-cue' || String(reel.date ?? '') >= '2026-08-30';\n"
)
replace_required(
    'src/core/content-validator.js',
    "  addCheck(checks, 'topic-area', String(reel.topicArea ?? '').trim().length >= 5,\n    'reel.json.topicArea fehlt.');\n",
    "  addCheck(checks, 'topic-area', String(reel.topicArea ?? '').trim().length >= 5,\n    'reel.json.topicArea fehlt.');\n\n  if (cueTimedPhasesRequired && sceneIndex[0]) {\n    const hook = inspectReelHook({ narration: sceneIndex[0].narration, imageText: sceneIndex[0].imageText });\n    addCheck(checks, 'hook-quality', hook.passed, `Hook-Gate nicht bestanden: ${hook.issues.join(' ')}`);\n  }\n"
)
replace_required(
    'src/core/content-validator.js',
    '      const previousStart = phaseIndex === 0 ? -1 : phases[phaseIndex - 1].startPercent;\n',
    "      const previousStart = phaseIndex === 0 ? -1 : phases[phaseIndex - 1].startPercent;\n\n      if (cueTimedPhasesRequired && phaseIndex > 0) {\n        const phaseCue = String(phase.audioCue ?? '').trim();\n        const cueStart = findNarrationCueStartPercent(scene.narration, phaseCue);\n        addCheck(checks, `${phaseLabel}-audio-cue`, phaseCue.length >= 2,\n          `${phaseLabel}: audioCue fehlt. Der Bildwechsel muss an konkret gesprochenen Wörtern hängen.`);\n        addCheck(checks, `${phaseLabel}-audio-cue-in-narration`, cueStart !== null,\n          `${phaseLabel}: audioCue \\\"${phaseCue}\\\" kommt nicht in der Narration vor.`);\n        addCheck(checks, `${phaseLabel}-cue-derived-start`, cueStart === null || Math.abs(Number(phase.startPercent) - cueStart) <= 0.01,\n          `${phaseLabel}: startPercent muss aus der Position des audioCue in der Narration abgeleitet sein; kein pauschales 0,5-Raster.`);\n      }\n"
)

# Produktionsauftrag auf feste Bilddichte + Phase-Cues + Hook-Gate vereinheitlichen.
pairs = [
    ("{ id: 'image-density-plan', label: 'Für jede Szene individuell 1, 2 oder selten 3 Bildphasen festlegen; keine starre Gleichsetzung Szenenanzahl = Bildanzahl', status: 'pending' }", "{ id: 'image-density-plan', label: 'Hook exakt 1 Bildphase, jede weitere Szene exakt 2 Bildphasen; keine dritte Phase', status: 'pending' }"),
    ("{ id: 'image-text-plan', label: `In ungefähr ${preferredImageTextMinimum}–${preferredImageTextMaximum} passenden narrativen Szenen kurzen deutschen Bildtext planen; keine doppelte Headline oben und unten`, status: 'pending' }", "{ id: 'image-text-plan', label: 'Jede einzelne Bildphase bekommt 1–5 deutsche Wörter imageText; kein Bild ohne Text', status: 'pending' }"),
    ('Eine Szene kann ein, zwei oder selten drei aufeinanderfolgende Bilder besitzen. Die Bilddichte wird für jedes Reel individuell entschieden.', 'Die Hook besitzt exakt einen Bildmoment; jede weitere narrative Szene besitzt exakt zwei aufeinanderfolgende Bildmomente.'),
    ('- aktuell initialisierte Bilder: **${currentPlannedImages}**; diese Zahl ist ausdrücklich noch nicht automatisch final', '- geplante Bilder nach fester Regel: **${currentPlannedImages}**'),
    ('- Bildanzahl-Modus: **individuell pro Reel**', '- Bildanzahl-Modus: **one-hook-two-standard**'),
    ('2. Überarbeite das Script auf 155–175 Wörter und ungefähr 55–60 Sekunden bei 1,10x.', '2. Überarbeite das Script auf 155–175 Wörter und ungefähr 55–60 Sekunden bei 1,10x. Szene 1 startet sofort mit Frage, Überraschung oder klarem Kontrast; generische Einleitungen wie „In diesem Video …“ sind verboten.'),
    ('5. Plane ${scenes.length} **narrative Szenen**. Diese Zahl bestimmt nicht automatisch die Bildanzahl.', '5. Plane ${scenes.length} **narrative Szenen**. Daraus folgt die Bildanzahl zwingend: 1 + (Szenen − 1) × 2.'),
    ('7. Plane danach die Bilddichte **für jede Szene einzeln**. Jede Szene bekommt normalerweise 1 Bild, 2 Bilder bei echtem visuellem Fortschritt und 3 nur selten.\n8. Wenn ein einziges Still-Bild ungefähr 3,5–4 Sekunden oder länger stehen würde, prüfe aktiv eine zweite Bildphase. Das ist ein Prüftrigger, keine starre Pflicht.\n9. Wähle Bildphasen nach Inhalt, nicht nach Quote. Sinnvolle Wechsel sind Überblick → Detail, Ursache → Folge, Ausgangslage → Konsequenz oder äußere Handlung → Mechanismus-Detail.', '7. Die Hook bekommt exakt 1 Bild; jede weitere Szene exakt 2. Eine dritte Bildphase ist im aktiven Standard verboten.\n8. Das zweite Bild wird nicht pauschal bei 50 % gesetzt. Gib ihm ein eigenes `audioCue`: 2–5 exakt gesprochene Wörter aus der Narration, bei denen der neue Bildmoment beginnen soll.\n9. Leite `startPercent` aus der Position dieses `audioCue` in der Narration ab. Wähle den Cue so, dass beide Bildphasen mindestens 3 Sekunden stehen und der sichtbare Informationsschritt zum gesprochenen Inhalt passt.'),
    ('11. Hinterlege pro Szene `imageCount` und `imagePhases`. Die erste Phase beginnt mit `startPercent: 0`; weitere Phasen liegen streng aufsteigend innerhalb 0–1.', '11. Hinterlege pro Szene `imageCount` und `imagePhases`. Die erste Phase beginnt bei `startPercent: 0`; die zweite trägt `audioCue`, `timingBasis: "narration-audio-cue"` und einen daraus berechneten `startPercent`.'),
    ('12. Die erste Bildphase nutzt `image-prompt.txt`, die zweite `image-prompt-02.txt`. Jede Phase bekommt eigene `visualIdea`, eine eigene `rationale` und **zwingend einen eigenen `imageText`** mit 1–5 deutschen Wörtern. Kein Bild bleibt ohne Text, sonst wirkt es im Feed leer.', '12. Die erste Bildphase nutzt `image-prompt.txt`, die zweite `image-prompt-02.txt`. Jede Phase bekommt eigene `visualIdea`, `rationale` und **zwingend eigenen `imageText`** mit 1–5 deutschen Wörtern. Die zweite Phase braucht zusätzlich ihr eigenes `audioCue`. Kein Bild bleibt ohne Text.')
]
for old, new in pairs:
    replace_optional('src/core/production-brief.js', old, new)

# Aktive Doku bereinigen.
replace_optional('CURRENT_WORKFLOW.md', '**Stand: 2026-08-28**', '**Stand: 2026-08-29**')
replace_optional('CURRENT_WORKFLOW.md', 'Die Themenwahl ist offen. Hook, Aha-Moment, Faktentreue, visuelle Klarheit, Abwechslung und Teilbarkeit entscheiden.', 'Die Themenwahl ist offen. Hook, Aha-Moment, Faktentreue, visuelle Klarheit, Abwechslung und Teilbarkeit entscheiden. **Hook-Gate:** Szene 1 startet ohne Einleitung direkt mit Frage, Überraschung oder klarem Kontrast; generische Einstiege wie „In diesem Video …“ sind nicht zulässig.')
replace_optional('CURRENT_WORKFLOW.md', 'Wenn kein Text geplant ist, darf keinerlei lesbarer Text erscheinen. Keine Logos, Wasserzeichen, Workflow-Labels oder Dateinamen im Bild.', 'Jede Bildphase trägt genau einen geplanten deutschen `imageText` mit 1–5 Wörtern. Außer diesem Text darf keinerlei lesbarer Text erscheinen: keine zusätzlichen Ortslabels, Logos, Wasserzeichen, Workflow-Labels oder Dateinamen.')
replace_optional('CURRENT_WORKFLOW.md', '- bei rund 58 Sekunden ergibt das ungefähr **17 bis 19 Bilder**\n- keine feste Gesamtbildzahl erzwingen', '- feste Formel: `1 + (Szenen − 1) × 2` → 8 Szenen = 15 Bilder, 9 = 17, 10 = 19\n- eine dritte Bildphase ist im aktiven Standard nicht vorgesehen')
replace_optional('CURRENT_WORKFLOW.md', 'Die Phasen einer Szene werden über `startPercent` gesetzt — als Anteil der\nSzenendauer. Zwei gleichmäßige Phasen liegen bei `0` und `0.5`. Der Schnitt sollte auf\nden Satzanfang fallen, nicht auf ein gleichmäßiges Raster.', 'Die zweite Phase besitzt ein eigenes `audioCue`: 2–5 tatsächlich gesprochene Wörter aus der Narration. `startPercent` wird aus der Position dieses Cues im Sprechertext abgeleitet — **kein pauschales `0.5`-Raster**. Der Cue wird so gewählt, dass beide Bilder mindestens 3 Sekunden sichtbar bleiben. Szene 1 beginnt weiterhin bei `startPercent: 0`.')
replace_optional('WORKFLOW_PHASEN.md', '- pro Bildphase ein kurzer deutscher `imageText` mit 1–5 Wörtern — **kein Bild bleibt\n  ohne Text**, sonst wirkt es im Feed leer', '- pro Bildphase ein kurzer deutscher `imageText` mit 1–5 Wörtern — **kein Bild bleibt\n  ohne Text**, sonst wirkt es im Feed leer\n- jede zweite Bildphase einer Standardszene bekommt zusätzlich ein eigenes `audioCue`\n  aus 2–5 gesprochenen Wörtern; daraus wird ihr `startPercent` berechnet, nicht pauschal 0,5')
replace_optional('WORKFLOW_PHASEN.md', '- `build:timeline` synchronisiert Szenen an echten Audio-Cues und löst dabei die\n  geplanten Sound-Typen gegen `assets/sfx/` auf', '- `build:timeline` synchronisiert Szenen an echten Audio-Cues; interne Bildwechsel folgen den\n  in Phase 1 geplanten Narrations-Cues statt einem starren Mittelpunkt und lösen dabei die geplanten Sound-Typen gegen `assets/sfx/` auf')
replace_optional('PRODUCTION_STATUS.md', '- zusätzliche Prompts als `image-prompt-02.txt`, `image-prompt-03.txt`', '- zweiter Prompt als `image-prompt-02.txt`; eine dritte Bildphase ist im aktiven Standard nicht vorgesehen')
replace_optional('PRODUCTION_STATUS.md', 'Der zweite Bildmoment einer Szene setzt beim nächsten Hauptsatz oder Nebensatz an\nund steht mindestens 3 Sekunden.', 'Der zweite Bildmoment einer Szene setzt an einem eigenen `audioCue` aus tatsächlich gesprochenen Wörtern an; `startPercent` wird aus dessen Position in der Narration abgeleitet und steht mindestens 3 Sekunden.')

# JSON-/Prompt-Helfer.
TOKEN_RE = re.compile(r"[\wÄÖÜäöüß]+(?:[’'-][\wÄÖÜäöüß]+)*", re.UNICODE)


def tokens(value):
    return TOKEN_RE.findall(str(value or ''))


def cue_percent(narration, cue):
    narration_tokens = [x.casefold() for x in tokens(narration)]
    cue_tokens = [x.casefold() for x in tokens(cue)]
    for index in range(len(narration_tokens) - len(cue_tokens) + 1):
        if narration_tokens[index:index + len(cue_tokens)] == cue_tokens:
            return round(index / len(narration_tokens), 6)
    raise ValueError(f'Cue nicht gefunden: {cue!r}')


def clean_prompt(prompt, image_text):
    prompt = str(prompt or '')
    prompt = re.sub(r'\s*No readable text(?: anywhere)? in this image\.?', '', prompt, flags=re.I)
    prompt = re.sub(r'\s*No readable text anywhere in the image\.?', '', prompt, flags=re.I)
    prompt = re.sub(r'\bwith no labels or readable text\b', 'with no extra written labels', prompt, flags=re.I)
    prompt = re.sub(r'\bwithout labels\b', 'without extra written labels', prompt, flags=re.I)
    prompt = re.sub(r'\blabeled Pretoria, Kapstadt and Bloemfontein\b', 'representing Pretoria, Kapstadt and Bloemfontein without written city labels', prompt, flags=re.I)
    if image_text and image_text.casefold() not in prompt.casefold():
        prompt = prompt.rstrip() + f' Integrate exactly the German text "{image_text}" once, large and bold.'
    if 'Render no other readable words' not in prompt:
        prompt = prompt.rstrip() + ' Render no other readable words, labels or numbers.'
    return re.sub(r'\s{2,}', ' ', prompt).strip()


SECOND_TEXT = {2: 'EIN LAND', 3: 'DREI ROLLEN', 4: 'VERWALTUNG', 5: 'PARLAMENT', 6: 'JUSTIZ', 7: 'DREI ROLLEN', 8: 'VERFASSUNG', 9: 'DREI STÄDTE, DREI ROLLEN'}
SECOND_CUE = {2: '1910 wurden', 3: 'Deshalb wurde', 4: 'Regierung, viele', 5: 'südafrikanische Parlament', 6: 'of Appeal', 7: 'Jede Stadt', 8: 'Johannesburg. Würdest', 9: 'Bloemfontein steht'}

# Aktives Phase-1-Paket korrigieren.
package_path = Path('input/reel-paket.json')
package = json.loads(package_path.read_text(encoding='utf-8'))
package['scenes'][0]['imageText'] = 'WARUM DREI HAUPTSTÄDTE?'
package['scenes'][0]['images'][0]['imageText'] = 'WARUM DREI HAUPTSTÄDTE?'
package['scenes'][0]['images'][0]['prompt'] = package['scenes'][0]['images'][0]['prompt'].replace('DREI HAUPTSTÄDTE?', 'WARUM DREI HAUPTSTÄDTE?')
for nr, scene in enumerate(package['scenes'], 1):
    first = scene['images'][0]
    first['audioCue'] = scene.get('audioCue') or ' '.join(tokens(scene['narration'])[:3])
    first['startPercent'] = 0
    first['prompt'] = clean_prompt(first['prompt'], first['imageText'])
    if nr > 1:
        image = scene['images'][1]
        image['imageText'] = SECOND_TEXT[nr]
        image['audioCue'] = SECOND_CUE[nr]
        image['startPercent'] = cue_percent(scene['narration'], image['audioCue'])
        image['prompt'] = clean_prompt(image['prompt'], image['imageText'])
package_path.write_text(json.dumps(package, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

# Beispielpaket widerspruchsfrei machen.
example_path = Path('input/reel-paket.beispiel.json')
example = json.loads(example_path.read_text(encoding='utf-8'))
for scene in example['scenes']:
    for index, image in enumerate(scene['images']):
        image['prompt'] = clean_prompt(image['prompt'], image['imageText'])
        if index == 0:
            image['audioCue'] = scene.get('audioCue') or ' '.join(tokens(scene['narration'])[:3])
            image['startPercent'] = 0
        else:
            narration_tokens = tokens(scene['narration'])
            midpoint = max(1, min(len(narration_tokens) - 2, len(narration_tokens) // 2))
            image['audioCue'] = ' '.join(narration_tokens[midpoint:midpoint + 2])
            image['startPercent'] = cue_percent(scene['narration'], image['audioCue'])
example['_hinweis'] = 'Jede Bildphase braucht 1–5 deutsche Wörter imageText. Die zweite Bildphase einer Standardszene braucht zusätzlich ein audioCue aus gesprochenen Wörtern; startPercent wird daraus abgeleitet, nicht pauschal auf 0,5 gesetzt.'
example_path.write_text(json.dumps(example, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

# Südafrika-Reel selbst migrieren und alle echten Promptdateien reparieren.
scene_index_path = REEL / 'scenes/scene-index.json'
scenes = json.loads(scene_index_path.read_text(encoding='utf-8'))
for scene in scenes:
    nr = int(scene['sceneId'].split('-')[1])
    phase1 = scene['imagePhases'][0]
    phase1['audioCue'] = scene.get('audioCue', '')
    phase1['timingBasis'] = 'scene-start'
    phase1['startPercent'] = 0
    if nr == 1:
        scene['imageText'] = 'WARUM DREI HAUPTSTÄDTE?'
        phase1['imageText'] = 'WARUM DREI HAUPTSTÄDTE?'
    if nr > 1:
        phase2 = scene['imagePhases'][1]
        phase2['audioCue'] = SECOND_CUE[nr]
        phase2['timingBasis'] = 'narration-audio-cue'
        phase2['startPercent'] = cue_percent(scene['narration'], phase2['audioCue'])
        phase2['imageText'] = SECOND_TEXT[nr]
    for phase in scene['imagePhases']:
        prompt_path = REEL / 'scenes' / scene['sceneId'] / phase['promptFileName']
        prompt = prompt_path.read_text(encoding='utf-8')
        if nr == 1:
            prompt = prompt.replace('DREI HAUPTSTÄDTE?', 'WARUM DREI HAUPTSTÄDTE?')
        prompt_path.write_text(clean_prompt(prompt, phase['imageText']) + '\n', encoding='utf-8')
    (REEL / 'scenes' / scene['sceneId'] / 'scene.json').write_text(json.dumps(scene, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
scene_index_path.write_text(json.dumps(scenes, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

reel_path = REEL / 'reel.json'
reel = json.loads(reel_path.read_text(encoding='utf-8'))
reel['imagePhaseTimingMode'] = 'narration-audio-cue'
reel['imageDensityReason'] = 'Hook mit einem Bildmoment, jede weitere Szene mit zwei; der zweite beginnt an einem eigenen gesprochenen audioCue.'
reel_path.write_text(json.dumps(reel, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

# Bestehende Testfixture an den neuen Vertrag anpassen.
test_path = Path('test/reel-package.test.js')
test_text = test_path.read_text(encoding='utf-8')
test_text = test_text.replace("    narration: Array.from({ length: woerter }, (_, i) => `Wort${i + 1}`).join(' '),", "    narration: index === 0\n      ? `Warum ${Array.from({ length: woerter - 1 }, (_, i) => `Wort${i + 2}`).join(' ')}?`\n      : Array.from({ length: woerter }, (_, i) => `Wort${i + 1}`).join(' '),", 1)
test_text = test_text.replace("      imageText: j === 0 ? `TEXT ${index + 1}` : `DETAIL ${index + 1}`,\n      startPercent: j === 0 ? 0 : 0.5", "      imageText: j === 0 ? `TEXT ${index + 1}` : `DETAIL ${index + 1}`,\n      audioCue: j === 0 ? '' : `Wort10 Wort11`,\n      startPercent: j === 0 ? 0 : 0.5", 1)
test_path.write_text(test_text, encoding='utf-8')

print('Vier Produktionspunkte wurden im Working Tree angewendet.')
