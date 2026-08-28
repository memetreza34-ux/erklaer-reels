import { access, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

import { buildMasterTimeline } from './timeline.js';
import { analyzeWordTimingPlausibility } from './word-timing-plausibility.js';
import { validateExactWordTimings } from '../renderer/subtitle-timing.js';
import { SUBTITLE_STYLE } from '../shared/subtitle-style.js';

const AUDIO_EXTENSIONS = new Set(['.mp3', '.wav', '.m4a', '.aac', '.flac', '.ogg', '.webm', '.mp4']);

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(filePath, fallback = null) {
  if (!(await exists(filePath))) return fallback;
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function writeJson(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

async function writeText(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, value, 'utf8');
}

function round(value, digits = 3) {
  const factor = 10 ** digits;
  return Math.round((Number(value) + Number.EPSILON) * factor) / factor;
}

function normalizeToken(value) {
  return String(value ?? '')
    .toLocaleLowerCase('de-DE')
    .replace(/[„“”"'’`´.,!?;:()[\]{}…—–-]/g, '')
    .replace(/\s+/g, '')
    .trim();
}

function hash(value) {
  return createHash('sha256').update(value).digest('hex');
}

export function tokenizeScript(script) {
  return String(script ?? '')
    .trim()
    .split(/\s+/)
    .map((text) => text.trim())
    .filter(Boolean)
    .map((text, index) => ({
      index: index + 1,
      text,
      startSeconds: null,
      endSeconds: null,
      confidence: null,
      reviewed: false,
      note: ''
    }));
}

function smartJoin(words) {
  return words
    .map((word) => String(word.text ?? '').trim())
    .filter(Boolean)
    .join(' ')
    .replace(/\s+([,.;:!?…\])}“"'])/g, '$1')
    .replace(/([([{„"'])\s+/g, '$1')
    .trim();
}

function shouldBreakAfter(current, next, {
  minWords,
  maxWords,
  pauseBreakSeconds,
  maxCueSeconds
}) {
  if (!next) return true;
  if (current.length >= maxWords) return true;
  if (current.length < minWords) return false;

  const last = current.at(-1);
  const pause = Math.max(0, Number(next.startSeconds) - Number(last.endSeconds));
  const duration = Number(last.endSeconds) - Number(current[0].startSeconds);
  const sentenceEnd = /[.!?…]$/.test(String(last.text ?? ''));

  return sentenceEnd || pause >= pauseBreakSeconds || duration >= maxCueSeconds;
}

export function chunkTimedWords(words, options = {}) {
  const settings = {
    minWords: Number(options.minWords ?? 3),
    maxWords: Number(options.maxWords ?? 6),
    pauseBreakSeconds: Number(options.pauseBreakSeconds ?? 0.24),
    maxCueSeconds: Number(options.maxCueSeconds ?? 2.6)
  };

  const chunks = [];
  let current = [];

  for (let index = 0; index < words.length; index += 1) {
    current.push(words[index]);
    const next = words[index + 1];
    if (shouldBreakAfter(current, next, settings)) {
      chunks.push(current);
      current = [];
    }
  }
  if (current.length) chunks.push(current);

  if (chunks.length > 1 && chunks.at(-1).length < settings.minWords) {
    const tail = chunks.pop();
    const previous = chunks.at(-1);
    if (previous.length + tail.length <= settings.maxWords) previous.push(...tail);
    else chunks.push(tail);
  }

  return chunks;
}

function assignWordsToScenes(words, inputScenes) {
  const scenes = [...inputScenes].sort((a, b) => Number(a.startSeconds) - Number(b.startSeconds));
  const assigned = new Map(scenes.map((scene) => [scene.sceneId, []]));
  const unassigned = [];
  let sceneIndex = 0;

  for (const word of words) {
    const midpoint = (Number(word.startSeconds) + Number(word.endSeconds)) / 2;
    while (sceneIndex < scenes.length - 1 && midpoint >= Number(scenes[sceneIndex].endSeconds)) {
      sceneIndex += 1;
    }
    const scene = scenes[sceneIndex];
    const within = midpoint >= Number(scene.startSeconds) - 0.08 && midpoint <= Number(scene.endSeconds) + 0.08;
    if (within) assigned.get(scene.sceneId).push(word);
    else unassigned.push(word);
  }

  return { assigned, unassigned };
}

// Ein Untertitel gehört zu der Szene, in der die meisten seiner Wörter gesprochen
// werden. Läuft ein Satz über einen Bildschnitt, bleibt er dadurch ein Untertitel
// und wird nur einer Szene zugeordnet.
function sceneForChunk(chunk, scenes, sceneByWord) {
  const counts = new Map();
  for (const word of chunk) {
    const sceneId = sceneByWord.get(word);
    if (sceneId) counts.set(sceneId, (counts.get(sceneId) ?? 0) + 1);
  }

  let bestSceneId = null;
  let bestCount = 0;
  for (const [sceneId, count] of counts) {
    if (count > bestCount) { bestSceneId = sceneId; bestCount = count; }
  }
  if (bestSceneId) return bestSceneId;

  const start = Number(chunk[0].startSeconds);
  const containing = scenes.find((scene) => start >= Number(scene.startSeconds) && start < Number(scene.endSeconds));
  return (containing ?? scenes.at(-1))?.sceneId ?? null;
}

export function buildSubtitleCuesFromCodexWords(words, scenes, options = {}) {
  const position = options.position ?? SUBTITLE_STYLE.position;
  const verticalPositionPercent = Number(options.verticalPositionPercent ?? SUBTITLE_STYLE.verticalPositionPercent);
  const textColor = options.textColor ?? SUBTITLE_STYLE.textColor;
  const highlightColor = options.highlightColor ?? SUBTITLE_STYLE.highlightColor;
  const backgroundColor = options.backgroundColor ?? SUBTITLE_STYLE.backgroundColor;
  const preRoll = Number(options.preRollSeconds ?? 0.035);
  const postRoll = Number(options.postRollSeconds ?? 0.1);
  const maximumEndSeconds = Number.isFinite(Number(options.maximumEndSeconds))
    ? Number(options.maximumEndSeconds)
    : Infinity;
  const { assigned, unassigned } = assignWordsToScenes(words, scenes);

  const sceneByWord = new Map();
  for (const [sceneId, sceneWords] of assigned) {
    for (const word of sceneWords) sceneByWord.set(word, sceneId);
  }

  // Der Umbruch folgt Satzenden und Sprechpausen über den gesamten Text hinweg.
  // Würde je Szene umgebrochen, zerschnitte jeder Bildwechsel den laufenden Satz.
  const chunks = chunkTimedWords(words, options);
  const cues = [];
  const cueCountByScene = new Map();
  let previousCueEnd = -Infinity;

  chunks.forEach((chunk, index) => {
    const nextChunk = chunks[index + 1];
    const first = chunk[0];
    const last = chunk.at(-1);
    const sceneId = sceneForChunk(chunk, scenes, sceneByWord);
    const sequence = (cueCountByScene.get(sceneId) ?? 0) + 1;
    cueCountByScene.set(sceneId, sequence);

    const gapBefore = Math.max(0, Number(first.startSeconds) - previousCueEnd);
    const allowedPreRoll = gapBefore >= preRoll + 0.01 ? preRoll : Math.max(0, gapBefore - 0.01);
    // Die Untertitelzeiten folgen ausschließlich den gemessenen Wortzeiten. Ein
    // Beschnitt auf Szenengrenzen würde das erste oder letzte Wort abschneiden.
    // Der Einblendzeitpunkt hängt am ersten Wort; ausweichen muss das Cue-Ende.
    const startSeconds = Math.max(0, Number(first.startSeconds) - allowedPreRoll);
    const nextWordStart = nextChunk?.[0]?.startSeconds ?? null;
    const latestEnd = nextWordStart === null
      ? maximumEndSeconds
      : Math.min(maximumEndSeconds, Number(nextWordStart) - 0.005);
    const endSeconds = Math.max(
      startSeconds + 0.05,
      Math.min(Number(last.endSeconds) + postRoll, latestEnd)
    );

    cues.push({
      id: `${sceneId}-subtitle-${String(sequence).padStart(2, '0')}`,
      sceneId,
      text: smartJoin(chunk),
      startSeconds: round(startSeconds),
      endSeconds: round(endSeconds),
      position,
      verticalPositionPercent,
      textColor,
      backgroundColor,
      highlightCurrentWord: true,
      highlightColor,
      speakerSyncedWordHighlight: true,
      timingStatus: 'codex-word-synced',
      timingSource: 'codex-local-audio-review',
      wordTimings: chunk.map((word) => ({
        text: word.text,
        startSeconds: round(word.startSeconds),
        endSeconds: round(word.endSeconds),
        confidence: Number.isFinite(Number(word.confidence)) ? Number(word.confidence) : null
      }))
    });
    previousCueEnd = cues.at(-1).endSeconds;
  });

  const sceneSummary = scenes.map((scene) => ({
    sceneId: scene.sceneId,
    startSeconds: scene.startSeconds,
    endSeconds: scene.endSeconds,
    wordCount: (assigned.get(scene.sceneId) ?? []).length,
    cueCount: cueCountByScene.get(scene.sceneId) ?? 0
  }));

  return { cues, sceneSummary, unassigned };
}

async function findAudioPath(reelDirectory, manifest) {
  const listed = manifest?.audio?.expectedFile;
  if (listed && await exists(path.join(reelDirectory, listed))) return path.join(reelDirectory, listed);

  const audioDirectory = path.join(reelDirectory, 'audio');
  if (!(await exists(audioDirectory))) return null;
  const entries = await readdir(audioDirectory, { withFileTypes: true });
  const candidate = entries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .find((name) => AUDIO_EXTENSIONS.has(path.extname(name).toLowerCase()));
  return candidate ? path.join(audioDirectory, candidate) : null;
}

function mergeExistingWords(freshWords, existingWords) {
  if (!Array.isArray(existingWords) || existingWords.length !== freshWords.length) return freshWords;
  const sameText = freshWords.every((word, index) => normalizeToken(word.text) === normalizeToken(existingWords[index]?.text));
  if (!sameText) return freshWords;
  return freshWords.map((word, index) => ({ ...word, ...existingWords[index], index: index + 1, text: word.text }));
}

function taskMarkdown(reelDirectory, workbench) {
  const normalized = reelDirectory.split(path.sep).join('/');
  return `# Codex-Auftrag: exakte Wortzeiten\n\n## Ziel\n\nHöre das lokale Voice-over vollständig ab und fülle in \`subtitles/codex-word-sync.json\` für jedes Wort die echten absoluten Start- und Endzeiten aus. Es wird kein externer Transkriptionsanbieter verwendet. Kein gesprochenes Wort darf fehlen.\n\n## Dateien\n\n- Voice-over: \`${workbench.audioFile}\`\n- Sprechertext: \`${workbench.scriptFile}\`\n- Master-Timeline: \`${workbench.timelineFile}\`\n- Arbeitsdatei: \`subtitles/codex-word-sync.json\`\n\n## Verbindliche Regeln\n\n1. Audio tatsächlich anhören; Wörter nicht gleichmäßig über die Dauer verteilen.\n2. Für jedes Wort \`startSeconds\` und \`endSeconds\` als absolute Sekunden eintragen.\n3. Auf ungefähr 0,01–0,03 Sekunden genau arbeiten.\n4. \`reviewed\` erst nach akustischer Kontrolle auf \`true\` setzen.\n5. \`confidence\` realistisch zwischen 0 und 1 eintragen; im strengen Lauf mindestens 0,85.\n6. Reihenfolge und sichtbaren Wortlaut nicht verändern. Weicht das Audio vom Script ab, zuerst Script und Audio klären und den Unterschied in \`notes\` dokumentieren.\n7. In Sprechpausen kein Folgewort vorzeitig markieren; keine künstlich verlängerten Wortzeiten.\n8. Das letzte Wort darf nicht nach der Audiodauer enden.\n9. Der Lauf ist nur vollständig bei \`coverage = 1\`, \`timedWords = totalWords\` und \`unassignedWords = 0\`.\n10. Keine Audiodatei zu einem externen Dienst hochladen und keinen API-Schlüssel verwenden.\n\n## Abschluss\n\nNach dem Ausfüllen ausführen:\n\n\`\`\`bash\nnpm run sync:words -- --dir "${normalized}" --apply --strict\n\`\`\`\n\nDanach \`review/word-sync-report.json\` prüfen. Der Lauf muss vollständig bestehen, bevor gerendert wird.\n`;
}

export function validateCodexWorkbench(workbench, { strict = false } = {}) {
  const words = Array.isArray(workbench?.words) ? workbench.words : [];
  const checks = [];
  const timed = words.filter((word) => Number.isFinite(Number(word.startSeconds)) && Number.isFinite(Number(word.endSeconds)) && Number(word.endSeconds) > Number(word.startSeconds));
  const coverage = words.length ? timed.length / words.length : 0;

  checks.push({ id: 'words-present', passed: words.length > 0, level: 'error', message: 'Die Codex-Arbeitsdatei enthält keine Wörter.' });
  checks.push({ id: 'timing-coverage', passed: coverage === 1, level: strict ? 'error' : 'warning', message: '100 % der Wörter benötigen gültige Start- und Endzeiten.' });

  let previousEnd = -Infinity;
  for (const word of words) {
    const start = Number(word.startSeconds);
    const end = Number(word.endSeconds);
    const timedWord = Number.isFinite(start) && Number.isFinite(end) && end > start;
    checks.push({ id: `word-${word.index}-timing`, passed: timedWord, level: strict ? 'error' : 'warning', message: `Wort ${word.index} (${word.text}) besitzt keine gültige Zeit.` });
    if (timedWord) {
      checks.push({ id: `word-${word.index}-order`, passed: start >= previousEnd - 0.03, level: strict ? 'error' : 'warning', message: `Wort ${word.index} (${word.text}) überlappt zu stark oder ist falsch sortiert.` });
      previousEnd = end;
    }
    checks.push({ id: `word-${word.index}-reviewed`, passed: word.reviewed === true, level: strict ? 'error' : 'warning', message: `Wort ${word.index} (${word.text}) wurde noch nicht akustisch bestätigt.` });
    const confidence = Number(word.confidence);
    checks.push({ id: `word-${word.index}-confidence`, passed: Number.isFinite(confidence) && confidence >= 0.85 && confidence <= 1, level: strict ? 'error' : 'warning', message: `Wort ${word.index} (${word.text}) benötigt eine realistische Konfidenz von mindestens 0,85.` });
  }

  const duration = Number(workbench?.audioDurationSeconds);
  if (Number.isFinite(duration) && timed.length) {
    checks.push({ id: 'within-audio-duration', passed: Number(timed.at(-1).endSeconds) <= duration + 0.08, level: 'error', message: 'Das letzte Wort endet nach der Audiodauer.' });
  }

  const expectedHash = workbench?.scriptTextHash;
  const actualHash = hash(words.map((word) => word.text).join(' '));
  checks.push({ id: 'script-text-unchanged', passed: !expectedHash || expectedHash === actualHash, level: 'error', message: 'Der Wortlaut der Codex-Arbeitsdatei wurde verändert.' });

  // Gleichmäßig über die Szenendauer verteilte Wortzeiten tragen dieselben Felder wie
  // echte, sind aber nie synchron. Sie werden anhand messbarer Eigenschaften erkannt,
  // nicht anhand der selbst gesetzten Angaben reviewed und confidence.
  const plausibility = analyzeWordTimingPlausibility(timed);
  checks.push({
    id: 'word-timings-not-evenly-distributed',
    passed: !plausibility.suspicious,
    level: 'error',
    message: plausibility.suspicious
      ? `Die Wortzeiten wirken gleichmäßig verteilt statt am Audio gemessen: ${plausibility.triggered.join(' ')}`
      : 'Die Wortzeiten wirken am Audio gemessen.'
  });

  const errors = checks.filter((check) => !check.passed && check.level === 'error');
  const warnings = checks.filter((check) => !check.passed && check.level === 'warning');
  return {
    passed: errors.length === 0 && coverage === 1,
    coverage: round(coverage, 4),
    totalWords: words.length,
    timedWords: timed.length,
    plausibility,
    checks,
    summary: {
      passedChecks: checks.filter((check) => check.passed).length,
      failedChecks: errors.length,
      warnings: warnings.length,
      totalChecks: checks.length
    }
  };
}

export async function prepareCodexWordSync(reelDirectory) {
  const manifest = await readJson(path.join(reelDirectory, 'assets-manifest.json'), {});
  const audioPath = await findAudioPath(reelDirectory, manifest);
  if (!audioPath) throw new Error('Keine Voice-over-Datei im Reel-Ordner gefunden.');

  let timeline = await readJson(path.join(reelDirectory, 'timeline', 'timeline-plan.json'), null);
  if (!timeline) {
    const built = await buildMasterTimeline(reelDirectory, { strict: false });
    timeline = built.timeline;
  }
  const scenes = Array.isArray(timeline?.scenes) ? timeline.scenes : [];
  if (!scenes.length) throw new Error('Die Master-Timeline enthält keine Szenen.');

  const scriptPath = path.join(reelDirectory, 'script', 'voice-script.txt');
  if (!(await exists(scriptPath))) throw new Error('script/voice-script.txt fehlt.');
  const script = (await readFile(scriptPath, 'utf8')).trim();
  const freshWords = tokenizeScript(script);
  const workbenchPath = path.join(reelDirectory, 'subtitles', 'codex-word-sync.json');
  const previous = await readJson(workbenchPath, null);
  const words = mergeExistingWords(freshWords, previous?.words);
  const relativeAudio = path.relative(reelDirectory, audioPath).split(path.sep).join('/');
  const workbench = {
    version: 2,
    generatedBy: 'codex-workflow',
    status: words.every((word) => word.reviewed === true) ? 'reviewed' : 'pending-codex-audio-review',
    createdAt: previous?.createdAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    audioFile: relativeAudio,
    audioDurationSeconds: Number(timeline.audio?.durationSeconds ?? 0) || null,
    scriptFile: 'script/voice-script.txt',
    scriptTextHash: hash(freshWords.map((word) => word.text).join(' ')),
    timelineFile: 'timeline/timeline-plan.json',
    provider: 'codex-local-audio-review',
    externalUpload: false,
    apiKeyRequired: false,
    instructions: {
      timingUnit: 'absolute-seconds',
      preferredPrecisionSeconds: 0.02,
      minimumConfidenceStrict: 0.85,
      requiredCoverage: 1,
      requireZeroUnassignedWords: true,
      estimatedDistributionForbidden: true
    },
    scenes: scenes.map((scene) => ({
      sceneId: scene.sceneId,
      startSeconds: scene.startSeconds,
      endSeconds: scene.endSeconds,
      audioCue: scene.audioCue ?? ''
    })),
    words,
    notes: Array.isArray(previous?.notes) ? previous.notes : []
  };

  await writeJson(workbenchPath, workbench);
  await writeText(path.join(reelDirectory, 'production', 'codex-word-sync-task.md'), taskMarkdown(reelDirectory, workbench));
  await writeJson(path.join(reelDirectory, 'review', 'word-sync-report.json'), {
    version: 3,
    createdAt: new Date().toISOString(),
    passed: false,
    provider: 'codex-local-audio-review',
    stage: 'prepared-for-codex',
    audioUploaded: false,
    apiKeyRequired: false,
    workbenchFile: 'subtitles/codex-word-sync.json',
    taskFile: 'production/codex-word-sync-task.md',
    checks: [{ id: 'codex-audio-review', passed: false, level: 'warning', message: 'Codex muss das Voice-over vollständig anhören und jedes Wort zeitlich bestätigen.' }]
  });

  const statusPath = path.join(reelDirectory, 'status.json');
  const status = await readJson(statusPath, {});
  status.wordSync = 'pending-codex-audio-review';
  await writeJson(statusPath, status);

  return { workbench, workbenchFile: workbenchPath, taskFile: path.join(reelDirectory, 'production', 'codex-word-sync-task.md') };
}

export async function applyCodexWordSync(reelDirectory, { strict = false, validateOnly = false } = {}) {
  const workbenchPath = path.join(reelDirectory, 'subtitles', 'codex-word-sync.json');
  const workbench = await readJson(workbenchPath, null);
  if (!workbench) throw new Error('subtitles/codex-word-sync.json fehlt. Führe sync:words zuerst ohne --apply aus.');

  const validation = validateCodexWorkbench(workbench, { strict });
  if (strict && !validation.passed) {
    const messages = validation.checks.filter((check) => !check.passed).map((check) => check.message).join(' ');
    throw new Error(`Codex-Wort-Synchronisierung nicht bestanden: ${messages}`);
  }

  const timeline = await readJson(path.join(reelDirectory, 'timeline', 'timeline-plan.json'), null);
  const scenes = Array.isArray(timeline?.scenes) ? timeline.scenes : [];
  if (!scenes.length) throw new Error('Die Master-Timeline enthält keine Szenen.');

  const timedWords = workbench.words.filter((word) => Number.isFinite(Number(word.startSeconds)) && Number.isFinite(Number(word.endSeconds)) && Number(word.endSeconds) > Number(word.startSeconds));
  // Der Nachlauf des Schlussbildes bleibt frei von Untertiteln.
  const built = buildSubtitleCuesFromCodexWords(timedWords, scenes, {
    maximumEndSeconds: Number(timeline.audio?.durationSeconds) || undefined
  });
  const emptyScenes = built.sceneSummary.filter((scene) => scene.wordCount === 0);
  const invalidCues = built.cues
    .map((cue) => ({ cue, result: validateExactWordTimings(cue) }))
    .filter(({ result }) => !result.valid);
  const allWordsAssigned = built.unassigned.length === 0;
  const passed = validation.passed
    && validation.coverage === 1
    && validation.timedWords === validation.totalWords
    && built.cues.length > 0
    && invalidCues.length === 0
    && allWordsAssigned
    && (!strict || emptyScenes.length === 0);

  const report = {
    version: 4,
    createdAt: new Date().toISOString(),
    passed,
    strict,
    provider: 'codex-local-audio-review',
    audioUploaded: false,
    apiKeyRequired: false,
    workbenchFile: 'subtitles/codex-word-sync.json',
    audioFile: workbench.audioFile,
    totalWords: validation.totalWords,
    timedWords: validation.timedWords,
    coverage: validation.coverage,
    cueCount: built.cues.length,
    subtitleStyle: {
      position: SUBTITLE_STYLE.position,
      verticalPositionPercent: SUBTITLE_STYLE.verticalPositionPercent,
      textColor: SUBTITLE_STYLE.textColor,
      highlightCurrentWord: true,
      highlightColor: SUBTITLE_STYLE.highlightColor,
      speakerSyncedWordHighlight: true
    },
    unassignedWords: built.unassigned,
    invalidCues: invalidCues.map(({ cue, result }) => ({ id: cue.id, issues: result.issues })),
    sceneSummary: built.sceneSummary,
    checks: [
      ...validation.checks,
      { id: 'subtitle-cues-created', passed: built.cues.length > 0, level: 'error', message: 'Es wurden keine Untertitel-Cues erzeugt.' },
      { id: 'all-spoken-words-assigned', passed: allWordsAssigned, level: 'error', message: `Nicht zugeordnete gesprochene Wörter: ${built.unassigned.map((word) => word.text).join(' ') || 'keine'}.` },
      { id: 'all-scenes-covered', passed: emptyScenes.length === 0, level: strict ? 'error' : 'warning', message: `Szenen ohne bestätigte Wörter: ${emptyScenes.map((scene) => scene.sceneId).join(', ') || 'keine'}.` },
      { id: 'exact-cue-timings', passed: invalidCues.length === 0, level: strict ? 'error' : 'warning', message: `Ungültige Untertitel-Cues: ${invalidCues.map(({ cue }) => cue.id).join(', ') || 'keine'}.` }
    ]
  };

  if (!validateOnly) {
    const subtitlePlanPath = path.join(reelDirectory, 'subtitles', 'subtitle-plan.json');
    const previousPlan = await readJson(subtitlePlanPath, {});
    const backupPath = path.join(reelDirectory, 'review', 'subtitle-plan-before-word-sync.json');
    if (!(await exists(backupPath))) await writeJson(backupPath, previousPlan);

    const nextPlan = {
      ...previousPlan,
      version: Math.max(7, Number(previousPlan.version ?? 1)),
      enabled: true,
      language: 'de',
      position: SUBTITLE_STYLE.position,
      verticalPositionPercent: SUBTITLE_STYLE.verticalPositionPercent,
      safeVerticalRangePercent: SUBTITLE_STYLE.safeVerticalRangePercent,
      textColor: SUBTITLE_STYLE.textColor,
      highlightCurrentWord: true,
      highlightColor: SUBTITLE_STYLE.highlightColor,
      speakerSyncedWordHighlight: true,
      highlightAnimation: 'color-only',
      backgroundColor: SUBTITLE_STYLE.backgroundColor,
      wordByWordKaraoke: true,
      exactWordTimingsRequired: true,
      completeSpokenTextCoverageRequired: true,
      minimumWordCoverage: 1,
      requireZeroUnassignedWords: true,
      requireExactVoiceScriptWordSequence: true,
      timingStatus: passed ? 'codex-word-synced' : 'needs-review',
      timingProvider: 'codex-local-audio-review',
      generatedBy: 'codex',
      generatedAt: new Date().toISOString(),
      cues: built.cues
    };

    await writeJson(subtitlePlanPath, nextPlan);
    await writeJson(path.join(reelDirectory, 'review', 'word-sync-report.json'), report);
    await writeJson(path.join(reelDirectory, 'review', 'codex-word-sync-report.json'), report);
    await buildMasterTimeline(reelDirectory, { strict: false });

    const statusPath = path.join(reelDirectory, 'status.json');
    const status = await readJson(statusPath, {});
    status.wordSync = passed ? 'complete' : 'needs-review';
    if (!passed) status.render = 'blocked-subtitle-sync';
    await writeJson(statusPath, status);
  }

  if (strict && !passed) {
    const failed = report.checks.filter((check) => !check.passed).map((check) => check.message).join(' ');
    throw new Error(`Codex-Wort-Synchronisierung nicht bestanden: ${failed}`);
  }

  return { report };
}
