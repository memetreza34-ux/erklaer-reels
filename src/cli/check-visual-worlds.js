#!/usr/bin/env node

/**
 * Zeigt die Kanal-Zuordnung der Bildwelten und prüft, dass sie sauber getrennt sind.
 *
 *   npm run check:worlds
 */

import { CHANNELS, getVisualWorld, listVisualWorlds, RETIRED_VISUAL_WORLD_IDS, SEPARATION_RULES } from '../shared/visual-worlds.js';

function main() {
  console.log('Bildwelten pro Kanal\n');

  for (const channel of CHANNELS) {
    const world = getVisualWorld(channel);
    console.log(`${world.channelLabel} (${channel})`);
    console.log(`  Bildwelt      ${world.id}`);
    console.log(`  Format        ${world.aspectRatio} (${world.orientation})`);
    console.log(`  Figuren       ${world.characterSystem}`);
    console.log(`  Style-Bibel   ${world.styleBible}`);
    console.log(`  Ordner        ${world.productionRoot}/`);
    console.log('');
  }

  if (RETIRED_VISUAL_WORLD_IDS.length > 0) {
    console.log(`Stillgelegt: ${RETIRED_VISUAL_WORLD_IDS.join(', ')}`);
    console.log('Diese IDs dürfen in keiner aktiven Regel mehr auftauchen.\n');
  }

  const worlds = listVisualWorlds().filter((world) => world.active);
  const ratios = new Set(worlds.map((world) => world.aspectRatio));
  const systems = new Set(worlds.map((world) => world.characterSystem));

  console.log(`Trennung: ${ratios.size} Seitenverhältnisse, ${systems.size} Figurensysteme bei ${worlds.length} aktiven Welten.`);
  console.log(SEPARATION_RULES.guidance);
}

main();
