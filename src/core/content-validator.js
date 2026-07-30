import { access, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readText(filePath) {
  return (await readFile(filePath, 'utf8')).trim();
}

async function readJson(filePath, fallback = null) {
  if (!(await exists(filePath))) return fallback;
  return JSON.parse(await readFile(filePath, 'utf8'));
}

async function writeJson(filePath, value) {
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function addCheck(checks, id, passed, message, level = 'error') {
  checks.push({ id, passed, level, message });
}

function comparableScene(scene) {
  return {
    sceneId: scene.sceneId,
    order: scene.order,
    title: String(scene.title ?? '').trim(),
    narration: String(scene.narration ?? '').trim(),
    imageText: String(scene.imageText ?? '').trim(),
    visualIdea: String(scene.visualIdea ?? '').trim(),
    continuityNotes: String(scene.continuityNotes ?? '').trim(),
    durationSeconds: Number(scene.durationSeconds ?? 0),
    expectedImageFileName: String(scene.expectedImageFileName ?? '').trim()
  };
}

export async function validateReelContent(reelDirectory, { strict = false } = {}) {
  const checks = [];
  const reelPath = path.join(reelDirectory, 'reel.json');
  const sceneIndexPath = path.join(reelDirectory, 'scenes', 'scene-index.json');
  const stylesPath = path.resolve('config', 'image-styles.json');

  if (!(await exists(reelPath))) {
    addCheck(checks, 'reel-json', false, 'reel.json fehlt.');
    return finalize(reelDirectory, checks);
  }
  if (!(await exists(sceneIndexPath))) {
    addCheck(checks, 'scene-index', false, 'scenes/scene-index.json fehlt.');
    return finalize(reelDirectory, checks);
  }

  const reel = await readJson(reelPath);
  const sceneIndex = await readJson(sceneIndexPath, []);
  const styleConfig = await readJson(stylesPath, { styles: [] });
  const validStyleIds = new Set(styleConfig.styles.map((style) => style.id));

  addCheck(checks, 'scene-count-range', Number.isInteger(reel.sceneCount) && reel.sceneCount >= 8 && reel.sceneCount <= 10,
    'Die Szenenanzahl muss zwischen 8 und 10 liegen.');
  addCheck(checks, 'scene-count-match', sceneIndex.length === reel.sceneCount,
    `scene-index.json enthält ${sceneIndex.length} statt ${reel.sceneCount} Szenen.`);
  addCheck(checks, 'topic-area', String(reel.topicArea ?? '').trim().length >= 5,
    'reel.json.topicArea fehlt.');
  addCheck(checks, 'visual-style', Boolean(reel.visualStyleId) && validStyleIds.has(reel.visualStyleId),
    'reel.json.visualStyleId fehlt oder ist nicht in config/image-styles.json definiert.');
  addCheck(checks, 'visual-style-reason', String(reel.visualStyleReason ?? '').trim().length >= 20,
    'reel.json.visualStyleReason sollte die Stilentscheidung kurz begründen.');

  const scriptContents = {};
  for (const scriptName of ['final-script.txt', 'voice-script.txt']) {
    const scriptPath = path.join(reelDirectory, 'script', scriptName);
    const present = await exists(scriptPath);
    const content = present ? await readText(scriptPath) : '';
    scriptContents[scriptName] = content;
    addCheck(checks, `script-${scriptName}`, present && content.length >= 120,
      `${scriptName} fehlt oder ist zu kurz.`);
  }
  addCheck(checks, 'scripts-identical', scriptContents['final-script.txt'] === scriptContents['voice-script.txt'],
    'final-script.txt und voice-script.txt müssen denselben finalen Sprechertext enthalten.', 'warning');

  let totalDuration = 0;
  const usedImageTexts = new Map();

  for (let index = 0; index < sceneIndex.length; index += 1) {
    const indexedScene = sceneIndex[index];
    const expectedId = `scene-${String(index + 1).padStart(2, '0')}`;
    addCheck(checks, `${expectedId}-stable-id`, indexedScene.sceneId === expectedId,
      `Erwartet wurde ${expectedId}, gefunden wurde ${indexedScene.sceneId ?? 'keine ID'}.`);

    const sceneDirectory = path.join(reelDirectory, 'scenes', expectedId);
    const scenePath = path.join(sceneDirectory, 'scene.json');
    const promptPath = path.join(sceneDirectory, 'image-prompt.txt');

    if (!(await exists(scenePath))) {
      addCheck(checks, `${expectedId}-json`, false, `${expectedId}/scene.json fehlt.`);
      continue;
    }

    const scene = await readJson(scenePath, {});
    const prompt = (await exists(promptPath)) ? await readText(promptPath) : '';
    const duration = Number(scene.durationSeconds ?? 0);
    totalDuration += Number.isFinite(duration) ? duration : 0;

    addCheck(checks, `${expectedId}-index-sync`,
      JSON.stringify(comparableScene(indexedScene)) === JSON.stringify(comparableScene(scene)),
      `${expectedId}: scene-index.json und scene.json enthalten unterschiedliche Szenendaten.`);
    addCheck(checks, `${expectedId}-title`, String(scene.title ?? '').trim().length >= 3,
      `${expectedId}: title fehlt.`);
    addCheck(checks, `${expectedId}-narration`, String(scene.narration ?? '').trim().length >= 10,
      `${expectedId}: narration fehlt oder ist zu kurz.`);
    addCheck(checks, `${expectedId}-visual-idea`, String(scene.visualIdea ?? '').trim().length >= 20,
      `${expectedId}: visualIdea fehlt oder ist zu kurz.`);
    addCheck(checks, `${expectedId}-continuity`, String(scene.continuityNotes ?? '').trim().length >= 10,
      `${expectedId}: continuityNotes fehlen oder sind zu kurz.`);
    addCheck(checks, `${expectedId}-duration`, Number.isFinite(duration) && duration >= 2.5 && duration <= 8,
      `${expectedId}: durationSeconds muss zwischen 2,5 und 8 liegen.`);
    addCheck(checks, `${expectedId}-prompt`, prompt.length >= 180,
      `${expectedId}: image-prompt.txt fehlt oder ist nicht detailliert genug.`);
    addCheck(checks, `${expectedId}-prompt-format`, /vertical\s+9:16|9:16/i.test(prompt),
      `${expectedId}: Der Bildprompt sollte das Format 9:16 ausdrücklich nennen.`, 'warning');
    addCheck(checks, `${expectedId}-expected-file`, String(scene.expectedImageFileName ?? '').startsWith(expectedId),
      `${expectedId}: expectedImageFileName muss mit der Szenen-ID beginnen.`);

    const imageText = String(scene.imageText ?? '').trim().toUpperCase();
    if (imageText) {
      const previousScene = usedImageTexts.get(imageText);
      addCheck(checks, `${expectedId}-image-text-unique`, !previousScene,
        `${expectedId}: Der sichtbare Bildtext wurde bereits in ${previousScene ?? 'keiner Szene'} verwendet.`, 'warning');
      usedImageTexts.set(imageText, expectedId);
      addCheck(checks, `${expectedId}-image-text-prompt`, prompt.toUpperCase().includes(imageText),
        `${expectedId}: imageText steht nicht exakt im Bildprompt.`, 'warning');
    }
  }

  addCheck(checks, 'total-duration', totalDuration >= 35 && totalDuration <= 60,
    `Die geschätzte Gesamtdauer beträgt ${totalDuration.toFixed(1)} Sekunden; Ziel sind 35–60 Sekunden.`);

  const coverPromptPath = path.join(reelDirectory, 'cover', 'cover-prompt.txt');
  const coverJsonPath = path.join(reelDirectory, 'cover', 'cover.json');
  const coverPrompt = (await exists(coverPromptPath)) ? await readText(coverPromptPath) : '';
  const cover = await readJson(coverJsonPath, {});
  const headline = String(cover.headline ?? cover.title ?? '').trim();
  addCheck(checks, 'cover-prompt', coverPrompt.length >= 180, 'cover/cover-prompt.txt fehlt oder ist nicht detailliert genug.');
  addCheck(checks, 'cover-headline', headline.length >= 5,
    'cover/cover.json benötigt eine klare headline.');
  addCheck(checks, 'cover-headline-prompt', !headline || coverPrompt.toUpperCase().includes(headline.toUpperCase()),
    'Die Cover-Headline steht nicht exakt im Cover-Prompt.', 'warning');
  addCheck(checks, 'cover-visual-idea', String(cover.visualIdea ?? '').trim().length >= 20,
    'cover/cover.json benötigt eine visualIdea.');

  if (strict) {
    const captionPath = path.join(reelDirectory, 'caption', 'caption.txt');
    const sourcesPath = path.join(reelDirectory, 'sources', 'sources.md');
    const caption = (await exists(captionPath)) ? await readText(captionPath) : '';
    const sources = (await exists(sourcesPath)) ? await readText(sourcesPath) : '';
    addCheck(checks, 'caption', caption.length >= 80, 'caption/caption.txt fehlt oder ist zu kurz.');
    addCheck(checks, 'sources', sources.length >= 40 && sources !== '# Quellen',
      'sources/sources.md enthält noch keine verwertbaren Quellen oder Hinweise.');
  }

  return finalize(reelDirectory, checks, { totalDuration, strict });
}

async function finalize(reelDirectory, checks, metadata = {}) {
  const errors = checks.filter((check) => !check.passed && check.level === 'error');
  const warnings = checks.filter((check) => !check.passed && check.level === 'warning');
  const passed = errors.length === 0;
  const report = {
    createdAt: new Date().toISOString(),
    passed,
    summary: {
      passedChecks: checks.filter((check) => check.passed).length,
      failedChecks: errors.length,
      warnings: warnings.length,
      totalChecks: checks.length
    },
    metadata,
    checks
  };

  const reportPath = path.join(reelDirectory, 'review', 'content-readiness.json');
  await writeJson(reportPath, report);

  const statusPath = path.join(reelDirectory, 'status.json');
  const status = await readJson(statusPath, {});
  status.content = passed ? 'ready' : 'needs-review';
  status.imagePrompts = passed ? 'ready' : 'needs-review';
  status.cover = passed ? 'prompt-ready' : (status.cover ?? 'missing');
  status.qualityControl = passed ? 'content-passed' : 'content-failed';
  await writeJson(statusPath, status);

  const reelPath = path.join(reelDirectory, 'reel.json');
  const reel = await readJson(reelPath, null);
  if (reel) {
    reel.status = passed ? 'content-ready' : 'content-needs-review';
    await writeJson(reelPath, reel);
  }

  return report;
}
