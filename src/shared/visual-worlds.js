/**
 * Einziger Zugang zur Bildwelt-Registry.
 *
 * Vorher stand die aktive Reel-Style-ID in sieben Markdown-Dateien, zwei Configs
 * und einem Runtime-Modul. Ein Wechsel der Bildwelt kostete deshalb ein Dutzend
 * Commits und hat die YouTube-Doku nachweislich auf einer toten ID stehen lassen.
 * Ab hier gilt: config/visual-worlds.json ist die Wahrheit, alles andere liest.
 */

import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

/** @type {import('../../config/visual-worlds.json')} */
const registry = require('../../config/visual-worlds.json');

export const CHANNELS = Object.freeze(Object.keys(registry.channels));

export const RETIRED_VISUAL_WORLD_IDS = Object.freeze(registry.retired.map((entry) => entry.id));

function validateRegistry() {
  const ids = registry.worlds.map((world) => world.id);
  if (new Set(ids).size !== ids.length) {
    throw new Error(`Bildwelt-Registry enthält doppelte IDs: ${ids.join(', ')}`);
  }

  for (const [channel, config] of Object.entries(registry.channels)) {
    const world = registry.worlds.find((entry) => entry.id === config.visualWorldId);
    if (!world) {
      throw new Error(`Kanal "${channel}" verweist auf unbekannte Bildwelt "${config.visualWorldId}".`);
    }
    if (world.channel !== channel) {
      throw new Error(`Bildwelt "${world.id}" gehört zu Kanal "${world.channel}", wird aber von "${channel}" beansprucht.`);
    }
    if (world.aspectRatio !== config.aspectRatio) {
      throw new Error(`Seitenverhältnis von "${world.id}" (${world.aspectRatio}) passt nicht zu Kanal "${channel}" (${config.aspectRatio}).`);
    }
    if (RETIRED_VISUAL_WORLD_IDS.includes(config.visualWorldId)) {
      throw new Error(`Kanal "${channel}" nutzt die stillgelegte Bildwelt "${config.visualWorldId}".`);
    }
  }

  if (registry.separationRules.aspectRatiosMustDiffer) {
    const ratios = registry.worlds.filter((world) => world.active).map((world) => world.aspectRatio);
    if (new Set(ratios).size !== ratios.length) {
      throw new Error(`Aktive Bildwelten müssen unterschiedliche Seitenverhältnisse haben: ${ratios.join(', ')}`);
    }
  }

  if (registry.separationRules.characterSystemsMustDiffer) {
    const systems = registry.worlds.filter((world) => world.active).map((world) => world.characterSystem);
    if (new Set(systems).size !== systems.length) {
      throw new Error(`Aktive Bildwelten müssen unterschiedliche Figurensysteme haben: ${systems.join(', ')}`);
    }
  }
}

validateRegistry();

/**
 * Liefert die vollständige Bildwelt eines Kanals.
 *
 * @param {'reel'|'youtube'} channel
 * @returns {{id: string, label: string, channel: string, aspectRatio: string, active: boolean, characterSystem: string, summary: string, styleBible: string, productionRoot: string, format: string}}
 */
export function getVisualWorld(channel) {
  const config = registry.channels[channel];
  if (!config) {
    throw new Error(`Unbekannter Kanal "${channel}". Erlaubt: ${CHANNELS.join(', ')}.`);
  }
  const world = registry.worlds.find((entry) => entry.id === config.visualWorldId);
  return Object.freeze({
    ...world,
    label: world.label,
    styleBible: config.styleBible,
    productionRoot: config.productionRoot,
    format: config.format,
    orientation: config.orientation,
    promptModule: config.promptModule,
    channelLabel: config.label
  });
}

/**
 * Stellt sicher, dass eine Style-ID für genau diesen Kanal zulässig ist.
 * Wirft, wenn die Welt des anderen Kanals oder eine stillgelegte Welt verwendet wird.
 *
 * @param {'reel'|'youtube'} channel
 * @param {string} visualWorldId
 */
export function assertVisualWorldForChannel(channel, visualWorldId) {
  const expected = getVisualWorld(channel);
  if (visualWorldId === expected.id) return;

  const retired = registry.retired.find((entry) => entry.id === visualWorldId);
  if (retired) {
    throw new Error(
      `Bildwelt "${visualWorldId}" ist seit ${retired.retiredOn} stillgelegt und wurde durch "${retired.replacedBy}" ersetzt.`
    );
  }

  const foreign = registry.worlds.find((entry) => entry.id === visualWorldId);
  if (foreign) {
    throw new Error(
      `Bildwelt "${visualWorldId}" gehört zum Kanal "${foreign.channel}" (${foreign.aspectRatio}) und darf nicht für ` +
      `"${channel}" (${expected.aspectRatio}) verwendet werden. Für ${channel} gilt ausschließlich "${expected.id}".`
    );
  }

  throw new Error(`Unbekannte Bildwelt "${visualWorldId}". Für Kanal "${channel}" gilt "${expected.id}".`);
}

/**
 * Leitet den Kanal aus einem Produktionspfad ab (reels/... oder youtube/...).
 *
 * @param {string} productionPath
 * @returns {'reel'|'youtube'|null}
 */
export function detectChannelFromPath(productionPath) {
  const normalized = String(productionPath).replace(/\\/g, '/');
  for (const [channel, config] of Object.entries(registry.channels)) {
    if (normalized === config.productionRoot || normalized.includes(`${config.productionRoot}/`)) {
      return channel;
    }
  }
  return null;
}

export function listVisualWorlds() {
  return registry.worlds.map((world) => Object.freeze({ ...world }));
}

export const SEPARATION_RULES = Object.freeze({ ...registry.separationRules });
