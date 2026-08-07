#!/usr/bin/env node

import { findNextFreeProductionSlot } from '../core/next-slot.js';

function argument(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const outputRoot = argument('--output') ?? 'reels';
  const from = argument('--from');
  const asJson = process.argv.includes('--json');
  const slot = await findNextFreeProductionSlot({
    outputRoot,
    now: from ? new Date(`${from}T12:00:00`) : new Date()
  });

  if (asJson) {
    console.log(JSON.stringify({
      date: slot.dateValue,
      weekday: slot.weekday,
      weekDirectory: slot.weekDirectoryName,
      dayDirectory: slot.dayDirectory.split('\\').join('/'),
      reason: slot.reason
    }, null, 2));
    return;
  }

  console.log(`Nächster freier Reel-Tag: ${slot.weekday}, ${slot.dateValue}`);
  console.log(`Wochenordner: ${slot.weekDirectoryName}`);
  console.log(`Zielordner: ${slot.dayDirectory}`);
}

main().catch((error) => {
  console.error(`Fehler: ${error.message}`);
  process.exitCode = 1;
});
