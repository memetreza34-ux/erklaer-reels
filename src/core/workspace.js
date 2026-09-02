import { mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { EDIT_TIMING_STYLE } from '../shared/edit-timing-style.js';
import { FIXED_VISUAL_STYLE_ID, FIXED_VISUAL_STYLE_REASON } from '../shared/fixed-visual-world.js';
import { SUBTITLE_STYLE } from '../shared/subtitle-style.js';
import { normalizeSceneImagePhases } from '../shared/visual-moments.js';
import { buildSourcesTemplate } from './source-quality.js';

const WEEKDAYS_DE = [
  'sonntag',
  'montag',
  'dienstag',
  'mittwoch',
  'donnerstag',
  'freitag',
  'samstag'
];

const TRANSITION_SOUNDS = ['soft-whoosh', 'soft-swipe', 'whoosh-up', 'whoosh-down'];
const INTERNAL_SOUNDS = ['click', 'pop', 'tick'];
const SCENE_MOTIONS = ['ken-burns', 'subtle-push-in', 'subtle-pull-out', 'pan-right', 'slow-zoom-in', 'pan-left'];

export function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ß/g, 'ss')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function pad(value) {
  return String(value).padStart(2, '0');
}

function formatDate(date) {
  return `${pad(date.getDate())}-${pad(date.getMonth() + 1)}`;
}

export function getIsoWeek(date) {
  const utc = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utc.getUTCDay() || 7;
  utc.setUTCDate(utc.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((utc - yearStart) / 86400000) + 1) / 7);
  return { year: utc.getUTCFullYear(), week };
}

export function getWeekRange(date) {
  const current = new Date(date);
  const day = current.getDay() || 7;
  const monday = new Date(current);
  monday.setDate(current.getDate() - day + 1);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  return { monday, sunday };
}

async function writeText(filePath, content = '') {
  await writeFile(filePath, content, 'utf8');
}

async function writeJson(filePath, value) {
  await writeText(filePath, `${JSON.stringify(value, null, 2)}\n`);
}

async function nextReelNumber(dayDirectory) {
  try {
    const entries = await readdir(dayDirectory, { withFileTypes: true });
    const numbers = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name.match(/^reel-(\d+)_/))
      .filter(Boolean)
      .map((match) => Number(match[1]));
    return Math.max(0, ...numbers) + 1;
  } catch {
    return 1;
  }
}

function defaultSceneMotion(index) {
  if (index === 0) {
    return {
      type: 'subtle-push-in',
      startScale: 1,
      endScale: 1.03,
      panXPercent: 0,
      panYPercent: 0,
      easing: 'ease-in-out',
      reason: 'Sehr dezenter Fokus auf die Hook; nach Bildprüfung anpassen.'
    };
  }

  const type = SCENE_MOTIONS[(index - 1) % SCENE_MOTIONS.length];
  return {
    type,
    startScale: type === 'subtle-pull-out' ? 1.03 : 1,
    endScale: type === 'subtle-pull-out' ? 1 : type.includes('zoom') || type === 'subtle-push-in' || type === 'ken-burns' ? 1.03 : 1.02,
    panXPercent: type === 'pan-right' ? 2 : type === 'pan-left' ? -2 : 0,
    panYPercent: 0,
    easing: 'ease-in-out',
    reason: 'Lebendige, aber dezente Standardbewegung; nach finalem Bildinhalt feinjustieren.'
  };
}

function defaultSoundEffects(scene, index) {
  if (index === 0) return [];

  return [
    {
      type: TRANSITION_SOUNDS[(index - 1) % TRANSITION_SOUNDS.length],
      atPercent: 0,
      visualEvent: 'Harter Wechsel in die neue narrative Szene',
      reason: 'Kurzer sauberer Übergangsakzent; im finalen Render leicht vor den Cut gelegt.',
      volume: 0.22
    },
    {
      type: INTERNAL_SOUNDS[(index - 1) % INTERNAL_SOUNDS.length],
      targetId: `${scene.sceneId}-image-02`,
      audioCue: '',
      atPercent: 0.5,
      visualEvent: 'Interner Wechsel zur zweiten Bildphase',
      reason: 'Kurzer Informationsakzent; wird nach dem echten Voice-over am Bild-Cue synchronisiert.',
      volume: 0.2
    }
  ];
}

export async function createReelWorkspace({
  title,
  script,
  date = new Date(),
  sceneCount = 9,
  outputRoot = 'reels'
}) {
  if (!title?.trim()) throw new Error('Ein Titel ist erforderlich.');
  if (!script?.trim()) throw new Error('Ein Script ist erforderlich.');
  if (!Number.isInteger(sceneCount) || sceneCount < 8 || sceneCount > 10) {
    throw new Error('sceneCount muss zwischen 8 und 10 liegen.');
  }

  const parsedDate = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(parsedDate.getTime())) throw new Error('Ungültiges Datum.');

  const { year, week } = getIsoWeek(parsedDate);
  const { monday, sunday } = getWeekRange(parsedDate);
  const weekDirectoryName = `${year}-KW${pad(week)}_${formatDate(monday)}_bis_${formatDate(sunday)}`;
  const weekday = WEEKDAYS_DE[parsedDate.getDay()];
  const dayDirectory = path.join(outputRoot, weekDirectoryName, weekday);

  await mkdir(dayDirectory, { recursive: true });
  const reelNumber = await nextReelNumber(dayDirectory);
  const reelId = `reel-${pad(reelNumber)}_${slugify(title)}`;
  const reelDirectory = path.join(dayDirectory, reelId);

  const directories = [
    'script',
    'audio',
    'scenes',
    'subtitles',
    'effects',
    'caption',
    'sources',
    'review',
    'production',
    'timeline',
    'render',
    'inbox/images',
    'inbox/audio',
    'inbox/processed'
  ];

  await Promise.all(directories.map((directory) => mkdir(path.join(reelDirectory, directory), { recursive: true })));

  const sceneIndex = [];
  for (let index = 1; index <= sceneCount; index += 1) {
    const sceneId = `scene-${pad(index)}`;
    const sceneDirectory = path.join(reelDirectory, 'scenes', sceneId);
    await mkdir(sceneDirectory, { recursive: true });

    const scene = {
      sceneId,
      order: index,
      title: index === 1 ? 'Hook' : index === sceneCount ? 'Starker Abschluss' : `Bildmoment ${index}`,
      narration: '',
      imageText: '',
      visualIdea: '',
      continuityNotes: '',
      audioCue: '',
      leadInSeconds: EDIT_TIMING_STYLE.sceneCueLeadSeconds,
      subtitleCues: [],
      subtitlePosition: SUBTITLE_STYLE.position,
      durationSeconds: 0,
      // Hook: ein sofort lesbares Bild. Jede weitere Szene: zwei Bildmomente mit
      // eigenem Sprach-Cue für den zweiten Informationsschritt.
      imageCount: index === 1 ? 1 : 2,
      imagePhases: (index === 1 ? [0] : [0, 0.5]).map((startPercent, phaseIndex) => ({
        phaseId: `${sceneId}-image-${String(phaseIndex + 1).padStart(2, '0')}`,
        order: phaseIndex + 1,
        startPercent,
        promptFileName: phaseIndex === 0 ? 'image-prompt.txt' : `image-prompt-${String(phaseIndex + 1).padStart(2, '0')}.txt`,
        expectedImageFileName: phaseIndex === 0 ? `${sceneId}.png` : `${sceneId}-${phaseIndex + 1}.png`,
        visualIdea: '',
        imageText: '',
        audioCue: '',
        rationale: '',
        imageStatus: 'missing',
        assetVerification: null
      })),
      expectedImageFileName: `${sceneId}.png`,
      promptStatus: 'missing',
      imageStatus: 'missing',
      assetVerification: null,
      status: 'planned'
    };

    sceneIndex.push(scene);
    await writeJson(path.join(sceneDirectory, 'scene.json'), scene);
    for (const phase of scene.imagePhases) {
      await writeText(path.join(sceneDirectory, phase.promptFileName), '');
    }
  }

  const reel = {
    reelId,
    title: title.trim(),
    topicArea: '',
    date: parsedDate.toISOString().slice(0, 10),
    language: 'de',
    promptLanguage: 'en',
    aspectRatio: '9:16',
    targetDurationSeconds: 58,
    endingHoldSeconds: 0.6,
    sceneCount,
    imageCountMode: 'one-hook-two-standard',
    imagePhaseTimingMode: 'narration-audio-cue',
    plannedImageCount: sceneIndex.reduce((summe, szene) => summe + szene.imagePhases.length, 0),
    imageDensityReason: 'Hook mit einem Bildmoment, jede weitere Szene mit zwei; der zweite setzt an einem echten Sprach-Cue ein und erscheint im Render minimal davor.',
    visualStyleId: FIXED_VISUAL_STYLE_ID,
    visualStyleReason: FIXED_VISUAL_STYLE_REASON,
    sourceQualitySchemaVersion: 3,
    subtitlesEnabled: false,
    motionEffectsEnabled: true,
    soundEffectsEnabled: true,
    backgroundMusicEnabled: false,
    status: 'workspace-created'
  };

  const visuals = sceneIndex.flatMap((scene) => normalizeSceneImagePhases(scene).map((phase) => ({
    targetId: phase.targetId,
    sceneId: scene.sceneId,
    sceneOrder: scene.order,
    phaseId: phase.phaseId,
    phaseOrder: phase.phaseOrder,
    expectedFile: `scenes/${scene.sceneId}/${phase.expectedImageFileName}`,
    verification: null,
    status: 'missing'
  })));

  await writeJson(path.join(reelDirectory, 'reel.json'), reel);
  await writeJson(path.join(reelDirectory, 'status.json'), {
    workspace: 'ready',
    content: 'draft',
    script: 'provided',
    scenes: 'planned',
    imageDensity: 'one-hook-two-standard',
    plannedImageCount: sceneIndex.reduce((summe, szene) => summe + szene.imagePhases.length, 0),
    visualWorld: `fixed-${FIXED_VISUAL_STYLE_ID}`,
    subtitles: 'disabled',
    wordSync: 'not-required',
    effects: 'planned-with-cut-sfx-defaults',
    audio: 'missing',
    imagePrompts: 'missing',
    images: 'missing',
    assetMatching: 'waiting-for-files',
    endingHold: 'planned-0.6s',
    qualityControl: 'pending'
  });
  await writeJson(path.join(reelDirectory, 'assets-manifest.json'), {
    audio: { expectedFile: 'audio/voiceover.mp3', status: 'missing' },
    visuals,
    scenes: sceneIndex.map((scene) => ({
      sceneId: scene.sceneId,
      expectedFile: `scenes/${scene.sceneId}/${scene.expectedImageFileName}`,
      verification: null,
      status: 'missing'
    }))
  });

  await writeText(path.join(reelDirectory, 'script', 'raw-script.txt'), `${script.trim()}\n`);
  await writeText(path.join(reelDirectory, 'script', 'final-script.txt'), `${script.trim()}\n`);
  await writeText(path.join(reelDirectory, 'script', 'voice-script.txt'), `${script.trim()}\n`);
  await writeText(path.join(reelDirectory, 'audio', '.gitkeep'));
  await writeJson(path.join(reelDirectory, 'scenes', 'scene-index.json'), sceneIndex);
  await writeJson(path.join(reelDirectory, 'subtitles', 'subtitle-plan.json'), {
    version: 8,
    enabled: false,
    reason: 'Globale Nutzerregel: Erklär-Reels werden ohne Untertitel gerendert.',
    language: 'de',
    position: SUBTITLE_STYLE.position,
    verticalPositionPercent: SUBTITLE_STYLE.verticalPositionPercent,
    safeVerticalRangePercent: SUBTITLE_STYLE.safeVerticalRangePercent,
    textColor: SUBTITLE_STYLE.textColor,
    highlightCurrentWord: SUBTITLE_STYLE.highlightCurrentWord,
    highlightColor: SUBTITLE_STYLE.highlightColor,
    backgroundColor: SUBTITLE_STYLE.backgroundColor,
    maxLines: SUBTITLE_STYLE.maxLines,
    cues: []
  });
  await writeText(path.join(reelDirectory, 'subtitles', 'README.md'), '# Untertitel\n\nUntertitel sind für dieses Format global deaktiviert. Die verbleibende Plan-Datei dient nur der Abwärtskompatibilität; der Renderer darf keine Untertitel einblenden.\n');
  await writeJson(path.join(reelDirectory, 'effects', 'effects-plan.json'), {
    version: 2,
    enabled: true,
    timingStatus: 'estimated-until-audio-arrives',
    voiceoverPriority: true,
    backgroundMusic: {
      enabled: false,
      reason: 'Voice-over-first Erklärformat; Musik nur nach ausdrücklicher Entscheidung.'
    },
    defaults: {
      transition: 'cut',
      cameraMotion: 'subtle-push-in',
      soundEffectVolume: 0.22,
      maximumSoundEffectsPerScene: 3,
      sceneCueLeadSeconds: EDIT_TIMING_STYLE.sceneCueLeadSeconds,
      imageCueLeadSeconds: EDIT_TIMING_STYLE.imageCueLeadSeconds,
      sfxPreRollSeconds: EDIT_TIMING_STYLE.sfxPreRollSeconds
    },
    scenes: sceneIndex.map((scene, index) => ({
      sceneId: scene.sceneId,
      transitionIn: {
        type: index === 0 ? 'none' : 'cut',
        durationSeconds: 0,
        reason: index === 0 ? 'Hook beginnt ab Sekunde 0.' : 'Harter Cut; im finalen Render leicht vor dem Sprach-Cue.'
      },
      cameraMotion: defaultSceneMotion(index),
      soundEffects: defaultSoundEffects(scene, index),
      timingStatus: 'estimated-until-audio-arrives'
    }))
  });
  await writeText(path.join(reelDirectory, 'effects', 'README.md'), `# Bewegungen und Soundeffekte\n\nDas Voice-over bleibt dominant; Hintergrundmusik ist standardmäßig aus.\n\nFür neue Reels gilt:\n- Hook startet ohne Übergang; danach nur harte Cuts.\n- Szenen-Cut ungefähr ${EDIT_TIMING_STYLE.sceneCueLeadSeconds.toFixed(2)} s vor dem Szenen-Cue.\n- Interner Bild-Cut ungefähr ${EDIT_TIMING_STYLE.imageCueLeadSeconds.toFixed(2)} s vor dem echten Bild-Cue.\n- SFX startet ungefähr ${EDIT_TIMING_STYLE.sfxPreRollSeconds.toFixed(2)} s vor dem sichtbaren Cut.\n- Jeder Szenenwechsel und jeder interne Bildwechsel braucht einen kurzen SFX oder passenden Objekt-Sound.\n- Standardlautstärke ungefähr 0,22; Stimme bleibt klar im Vordergrund.\n- Bewegung ist auf fast jedem Bildmoment dezent aktiv; Zoom meist nur 2–4 Prozent, Pan ungefähr maximal 3 Prozent.\n- Auch zweite Bildphasen erhalten im Renderer automatisch eine subtile Bewegung, falls nichts Spezifisches geplant wurde.\n\nDie vorgefüllten SFX/Motions sind sichere Startwerte und sollen nach Script, Bildinhalt und finalem Voice-over inhaltlich angepasst werden.\n`);
  await writeText(path.join(reelDirectory, 'caption', 'caption.txt'));
  await writeText(path.join(reelDirectory, 'sources', 'sources.md'), buildSourcesTemplate());
  await writeText(path.join(reelDirectory, 'review', 'notes.md'), '# Review-Notizen\n\n');
  await writeJson(path.join(reelDirectory, 'review', 'quality-report.json'), {
    passed: false,
    checks: [],
    notes: []
  });
  await writeJson(path.join(reelDirectory, 'review', 'scene-asset-verification.json'), {
    version: 2,
    passed: false,
    visuals: visuals.map((visual) => ({
      targetId: visual.targetId,
      sceneId: visual.sceneId,
      sceneOrder: visual.sceneOrder,
      phaseId: visual.phaseId,
      phaseOrder: visual.phaseOrder,
      expectedFile: null,
      verification: null,
      passed: false
    }))
  });
  await writeText(path.join(reelDirectory, 'inbox', 'images', '.gitkeep'));
  await writeText(path.join(reelDirectory, 'inbox', 'audio', '.gitkeep'));
  await writeText(path.join(reelDirectory, 'inbox', 'processed', '.gitkeep'));
  await writeText(path.join(reelDirectory, 'inbox', 'README.md'), `# Externe Dateien und sichere Zuordnung\n\nDie Hook besitzt genau **eine** Bildphase, jede weitere Szene genau **zwei**. Eine dritte Bildphase ist im aktuellen Workflow nicht vorgesehen. Die erste Bildphase einer Szene nutzt \`image-prompt.txt\`, die zweite \`image-prompt-02.txt\`.\n\nBei unsortierten Bildern gilt zwingend:\n\n1. Sichtbaren Inhalt ohne Dateinamen beschreiben.\n2. Mit der konkreten Bildphase und ihren Szenenfeldern vergleichen.\n3. Gewählte Bildphase gegen vorherige und nächste Bildphase prüfen.\n4. Niemals allein nach Upload-Reihenfolge oder Dateinummer zuordnen.\n5. Unter 0,90 Konfidenz nicht raten.\n6. \`visualReviewed\`, \`secondPassConfirmed\`, \`sceneOrderConfirmed\`, \`visibleSummary\`, \`reason\`, \`comparedFields\`, \`confirmedTarget\` und \`confirmedSceneOrder\` eintragen.\n\nDie fortlaufende Google-Flow-Nummer beschreibt die **Bildreihenfolge**, nicht mehr automatisch die Szenennummer. Beispiel: Wenn Szene 2 zwei Bilder hat, kann Bild 02 die erste Phase von Szene 2 und Bild 03 die zweite Phase von Szene 2 sein.\n\nNach der Zuordnung müssen \`review/scene-asset-verification.json\` und die strenge visuelle Prüfung vollständig bestanden sein.\n\nEs gibt kein separates Cover mehr: Die erste Szene ist zugleich das Titelbild. Lege das ursprüngliche Voice-over nach \`audio/\`.\n`);
  await writeJson(path.join(reelDirectory, 'inbox', 'asset-map.json'), {
    version: 4,
    generatedBy: '',
    assignmentSchema: {
      imageSceneExample: {
        source: 'images/datei.png',
        target: 'scene-01',
        confidence: 0.95,
        visualReviewed: true,
        secondPassConfirmed: true,
        sceneOrderConfirmed: true,
        confirmedTarget: 'scene-01',
        confirmedSceneOrder: 1,
        visibleSummary: 'Kurze neutrale Beschreibung des tatsächlich sichtbaren Bildinhalts.',
        reason: 'Konkrete sichtbare Objekte und Handlung entsprechen Narration, visueller Idee und Prompt dieser Bildphase.',
        comparedFields: ['narration', 'visualIdea', 'imageText', 'imagePrompt'],
        matchMethod: 'visual-content-review',
        reviewedAt: null
      }
    },
    assignments: [],
    unmatched: []
  });

  return { reelDirectory, reel };
}
