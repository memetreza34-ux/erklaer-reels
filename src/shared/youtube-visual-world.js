/**
 * YouTube-Bildwelt (16:9).
 *
 * Bewusst vollständig getrennt von der Reel-Welt in src/shared/fixed-visual-world.js:
 * anderes Seitenverhältnis, anderes Figurensystem, andere Style-Bibel. Eine Vermischung
 * beider Welten ist ein Hard Blocker, kein Stilfehler.
 */

import { getVisualWorld } from './visual-worlds.js';

const YOUTUBE_WORLD = getVisualWorld('youtube');

export const YOUTUBE_VISUAL_CHANNEL = 'youtube';

export const YOUTUBE_VISUAL_STYLE_ID = YOUTUBE_WORLD.id;

export const YOUTUBE_VISUAL_WORLD_LABEL = YOUTUBE_WORLD.label;

export const YOUTUBE_VISUAL_ASPECT_RATIO = YOUTUBE_WORLD.aspectRatio;

export const YOUTUBE_VISUAL_STYLE_REASON =
  'Feste Bildwelt für alle YouTube-Langvideos: ruhiger 2D-Hand-drawn-Editorial-Explainer mit ' +
  'einfachen Stick-Figure-Menschen, klaren Story-Momenten, warmen gedämpften Farben und ' +
  'reduzierten historischen oder natürlichen Umgebungen. Die Reel-Countryball-Welt gilt hier nicht.';

export const YOUTUBE_VISUAL_WORLD_PROMPT = [
  'Create a horizontal 16:9 educational longform image in exactly ONE fixed YouTube visual world called YouTube Editorial Stick Explainer.',
  'PROJECT WORLD LOCK: lock this exact visual world before the first image and keep it for the complete video. Topic, props and environment may change; the core art direction never changes.',
  'Use a calm narrative 2D hand-drawn editorial explainer style with clean black lines, thin to medium outlines, simple shapes and reduced detail.',
  'Use warm, slightly muted colours and simple historical, natural or reduced environments. Keep compositions quiet and readable with one clear narrative moment per image.',
  'When people are shown, use stick-figure-like bodies with a round or slightly oval head, very simple faces, small black eyes, a minimal mouth and deliberately simplified proportions. Emotion comes from pose, gaze and body language.',
  'Never use the separate Reel visual world: no countryball characters, no perfectly round ball bodies with white eyes, no flag-patterned spheres, no 9:16 vertical composition.',
  'STRICTLY FORBIDDEN: photorealism, realistic skin or hands, cinematic photo lighting, photo backgrounds, anime, manga, clay, glossy 3D, Pixar-like rendering, stock-photo aesthetics, countryball characters and any artificial subtitle safe-zone.',
  'Do not switch visual style between scenes. Every image must read as part of the same calm editorial series.'
].join(' ');
