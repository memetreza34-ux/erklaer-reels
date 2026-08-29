import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises';
import { access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = fileURLToPath(new URL('../..', import.meta.url));
const LIBRARY_CONFIG = path.join(REPO_ROOT, 'config', 'sound-library.json');

async function exists(filePath) {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
}

export async function loadSoundLibrary() {
  const raw = await readFile(LIBRARY_CONFIG, 'utf8');
  const library = JSON.parse(raw);
  const byType = new Map((library.types ?? []).map((entry) => [entry.type, entry]));
  return { ...library, byType };
}

/**
 * Prüft die Sound-Dramaturgie über das ganze Reel:
 *  - bekommt jeder Szenenwechsel einen Sound?
 *  - steht dieselbe Transition-Variante zweimal hintereinander?
 *
 * Beides ist keine harte Regelverletzung, sondern hörbare Monotonie — deshalb
 * Warnungen, keine Fehler.
 */
export function reviewSoundDramaturgy(plan, effectsRules = {}) {
  const rules = effectsRules.soundEffects ?? {};
  const transitionTypes = new Set(rules.transitionSoundTypes ?? []);
  const scenes = plan.scenes ?? [];
  const findings = [];

  let previousTransition = null;
  for (const [index, scene] of scenes.entries()) {
    const sounds = scene.soundEffects ?? [];
    // Die erste Szene ist kein Wechsel: davor kommt nichts.
    if (index > 0 && sounds.length === 0 && rules.soundOnEverySceneChange) {
      findings.push({ sceneId: scene.sceneId, issue: 'no-sound-on-scene-change' });
    }

    const transition = sounds.map((sound) => String(sound.type ?? '')).find((type) => transitionTypes.has(type));
    if (transition && transition === previousTransition && rules.neverRepeatTransitionSoundBackToBack) {
      findings.push({ sceneId: scene.sceneId, issue: 'repeated-transition-sound', type: transition });
    }
    if (transition) previousTransition = transition;
  }

  return { passed: findings.length === 0, findings };
}

export function knownSoundTypes(library) {
  return (library.types ?? []).map((entry) => entry.type);
}

/**
 * Löst die im Effekt-Plan geplanten Sound-Typen gegen die zentrale Bibliothek auf,
 * kopiert die benötigten Dateien in das Reel und trägt den relativen Pfad als `file` ein.
 *
 * Der Renderer bündelt mit publicDir = Reel-Verzeichnis, deshalb muss jede Datei
 * innerhalb des Reels liegen. Die Bibliothek bleibt die einzige Quelle.
 */
export async function syncReelSounds(reelDirectory, { strict = false } = {}) {
  const library = await loadSoundLibrary();
  const planPath = path.join(reelDirectory, 'effects', 'effects-plan.json');
  if (!(await exists(planPath))) {
    return { changed: false, copied: [], missingFiles: [], unknownTypes: [], planPath: null };
  }

  const plan = JSON.parse(await readFile(planPath, 'utf8'));
  const targetDirectory = path.join(reelDirectory, library.reelSoundDirectory);
  const copied = [];
  const missingFiles = [];
  const unknownTypes = [];
  let changed = false;

  for (const scene of plan.scenes ?? []) {
    for (const sound of scene.soundEffects ?? []) {
      const type = String(sound.type ?? '').trim();
      if (!type || type === 'unspecified') continue;

      const entry = library.byType.get(type);
      if (!entry) {
        unknownTypes.push({ sceneId: scene.sceneId, type });
        continue;
      }

      const sourcePath = path.join(REPO_ROOT, library.libraryDirectory, entry.file);
      const relativeTarget = `${library.reelSoundDirectory}/${entry.file}`;
      const targetPath = path.join(reelDirectory, relativeTarget);

      if (!(await exists(sourcePath))) {
        missingFiles.push({ sceneId: scene.sceneId, type, expected: path.join(library.libraryDirectory, entry.file) });
        continue;
      }

      if (!(await exists(targetPath))) {
        await mkdir(targetDirectory, { recursive: true });
        await copyFile(sourcePath, targetPath);
        copied.push(relativeTarget);
      }

      if (sound.file !== relativeTarget) {
        sound.file = relativeTarget;
        changed = true;
      }
      if (sound.volume == null) {
        sound.volume = entry.volume ?? library.defaultVolume ?? 0.2;
        changed = true;
      }
    }
  }

  if (changed) await writeFile(planPath, `${JSON.stringify(plan, null, 2)}\n`, 'utf8');

  if (strict && (missingFiles.length > 0 || unknownTypes.length > 0)) {
    const parts = [];
    if (unknownTypes.length > 0) {
      parts.push(`unbekannte Sound-Typen: ${unknownTypes.map((item) => `${item.sceneId}/${item.type}`).join(', ')}`);
    }
    if (missingFiles.length > 0) {
      parts.push(`fehlende Dateien: ${missingFiles.map((item) => item.expected).join(', ')}`);
    }
    throw new Error(`Soundbibliothek unvollständig — ${parts.join('; ')}`);
  }

  return { changed, copied, missingFiles, unknownTypes, planPath };
}
