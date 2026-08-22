import { mkdir, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { SUBTITLE_STYLE } from '../shared/subtitle-style.js';

const WEEKDAYS_DE = [
  'sonntag',
  'montag',
  'dienstag',
  'mittwoch',
  'donnerstag',
  'freitag',
  'samstag'
];

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

export async function createReelWorkspace({
  title,
  script,
  date = new Date(),
  sceneCount = 13,
  outputRoot = 'reels'
}) {
  if (!title?.trim()) throw new Error('Ein Titel ist erforderlich.');
  if (!script?.trim()) throw new Error('Ein Script ist erforderlich.');
  if (!Number.isInteger(sceneCount) || sceneCount < 12 || sceneCount > 14) {
    throw new Error('sceneCount muss zwischen 12 und 14 liegen.');
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
    'cover',
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
      leadInSeconds: 0.2,
      subtitleCues: [],
      subtitlePosition: SUBTITLE_STYLE.position,
      durationSeconds: 0,
      expectedImageFileName: `${sceneId}.png`,
      promptStatus: 'missing',
      imageStatus: 'missing',
      assetVerification: null,
      status: 'planned'
    };

    sceneIndex.push(scene);
    await writeJson(path.join(sceneDirectory, 'scene.json'), scene);
    await writeText(path.join(sceneDirectory, 'image-prompt.txt'), '');
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
    endingHoldSeconds: 0.7,
    sceneCount,
    visualStyleId: '',
    visualStyleReason: '',
    subtitlesEnabled: false,
    motionEffectsEnabled: true,
    soundEffectsEnabled: true,
    backgroundMusicEnabled: false,
    status: 'workspace-created'
  };

  await writeJson(path.join(reelDirectory, 'reel.json'), reel);
  await writeJson(path.join(reelDirectory, 'status.json'), {
    workspace: 'ready',
    content: 'draft',
    script: 'provided',
    scenes: 'planned',
    subtitles: 'disabled',
    wordSync: 'not-required',
    effects: 'planned',
    audio: 'missing',
    imagePrompts: 'missing',
    images: 'missing',
    cover: 'missing',
    assetMatching: 'waiting-for-files',
    endingHold: 'planned',
    qualityControl: 'pending'
  });
  await writeJson(path.join(reelDirectory, 'assets-manifest.json'), {
    audio: { expectedFile: 'audio/voiceover.mp3', status: 'missing' },
    scenes: sceneIndex.map((scene) => ({
      sceneId: scene.sceneId,
      expectedFile: `scenes/${scene.sceneId}/${scene.expectedImageFileName}`,
      verification: null,
      status: 'missing'
    })),
    cover: { expectedFile: 'cover/cover.png', verification: null, status: 'missing' }
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
    version: 1,
    enabled: true,
    timingStatus: 'estimated-until-audio-arrives',
    voiceoverPriority: true,
    backgroundMusic: {
      enabled: false,
      reason: 'Voice-over-first Erklärformat; Musik nur nach ausdrücklicher Entscheidung.'
    },
    defaults: {
      transition: 'cut',
      cameraMotion: 'none',
      soundEffectVolume: 0.2,
      maximumSoundEffectsPerScene: 2
    },
    scenes: sceneIndex.map((scene, index) => ({
      sceneId: scene.sceneId,
      transitionIn: {
        type: index === 0 ? 'none' : 'cut',
        durationSeconds: 0,
        reason: index === 0 ? 'Hook beginnt ab Sekunde 0.' : ''
      },
      cameraMotion: {
        type: index === 0 ? 'subtle-push-in' : 'none',
        startScale: 1,
        endScale: index === 0 ? 1.04 : 1,
        panXPercent: 0,
        panYPercent: 0,
        easing: 'ease-in-out',
        reason: index === 0 ? 'Dezenter Fokus auf die Hook; nach Bildprüfung anpassen.' : ''
      },
      soundEffects: [],
      timingStatus: 'estimated-until-audio-arrives'
    }))
  });
  await writeText(path.join(reelDirectory, 'effects', 'README.md'), `# Bewegungen und Soundeffekte\n\nPlane Zooms, Schwenks, Übergänge und Soundeffekte getrennt von den Bildprompts in \`effects-plan.json\`.\nNicht jedes Bild braucht Bewegung. Ein Zoom verändert die Größe normalerweise nur um 2–6 Prozent und höchstens um 8 Prozent.\nDie Hook startet ohne Übergang; danach sind ausschließlich direkte harte Schnitte mit Dauer 0 erlaubt. Soundeffekte werden sparsam eingesetzt, normalerweise null bis zwei pro Szene.\nDas Voice-over hat Vorrang; Hintergrundmusik ist standardmäßig ausgeschaltet.\nNach Einfügen des echten Voice-overs werden alle Zeitpunkte erneut geprüft.\n`);
  await writeText(path.join(reelDirectory, 'cover', 'cover-prompt.txt'));
  await writeJson(path.join(reelDirectory, 'cover', 'cover.json'), {
    headline: '',
    visualIdea: '',
    expectedImageFileName: 'cover.png',
    promptStatus: 'missing',
    imageStatus: 'missing',
    assetVerification: null,
    status: 'planned'
  });
  await writeText(path.join(reelDirectory, 'caption', 'caption.txt'));
  await writeText(path.join(reelDirectory, 'sources', 'sources.md'), '# Quellen\n\n');
  await writeText(path.join(reelDirectory, 'review', 'notes.md'), '# Review-Notizen\n\n');
  await writeJson(path.join(reelDirectory, 'review', 'quality-report.json'), {
    passed: false,
    checks: [],
    notes: []
  });
  await writeJson(path.join(reelDirectory, 'review', 'scene-asset-verification.json'), {
    version: 1,
    passed: false,
    scenes: sceneIndex.map((scene) => ({
      sceneId: scene.sceneId,
      order: scene.order,
      title: scene.title,
      expectedFile: null,
      verification: null,
      passed: false
    }))
  });
  await writeText(path.join(reelDirectory, 'inbox', 'images', '.gitkeep'));
  await writeText(path.join(reelDirectory, 'inbox', 'audio', '.gitkeep'));
  await writeText(path.join(reelDirectory, 'inbox', 'processed', '.gitkeep'));
  await writeText(path.join(reelDirectory, 'inbox', 'README.md'), `# Externe Dateien und sichere Zuordnung\n\nLege Bilder bevorzugt direkt in den passenden Ordner \`scenes/scene-XX/\` und benenne sie \`scene-XX.png\`. Auch dann muss Codex jedes Bild tatsächlich öffnen und gegen Sprechertext, Audio-Cue, visuelle Idee, Bildtext und Prompt prüfen.\n\nBei unsortierten Bildern in \`inbox/images/\` gilt zwingend:\n\n1. Sichtbaren Inhalt ohne Dateinamen beschreiben.\n2. Mit allen Szenenfeldern vergleichen.\n3. Gewählte Szene gegen vorherige und nächste Szene prüfen.\n4. Niemals nach Upload-Reihenfolge oder Dateinummer zuordnen.\n5. Unter 0,90 Konfidenz nicht raten.\n6. \`visualReviewed\`, \`secondPassConfirmed\`, \`sceneOrderConfirmed\`, \`visibleSummary\`, \`reason\`, \`comparedFields\`, \`confirmedTarget\` und \`confirmedSceneOrder\` eintragen.\n\nNach der Zuordnung müssen \`review/scene-asset-verification.json\` und die strenge visuelle Prüfung vollständig bestanden sein.\n\nLege das Cover nach \`cover/cover.png\` und das ursprüngliche Voice-over nach \`audio/\`.\n`);
  await writeJson(path.join(reelDirectory, 'inbox', 'asset-map.json'), {
    version: 2,
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
        reason: 'Konkrete sichtbare Objekte und Handlung entsprechen Narration, visueller Idee und Prompt dieser Szene.',
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
