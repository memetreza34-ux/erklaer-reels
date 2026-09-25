#!/usr/bin/env node

import path from 'node:path';
import { checkYoutubeTopic } from '../core/youtube-topic-editor.js';

function arg(name) {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function main() {
  const topic = arg('--topic');
  if (!topic) throw new Error('Nutzung: npm run topic:youtube -- --topic "Thema" [--self-video-id ID] [--exclude-dir PFAD] [--json]');

  const excludeDirArg = arg('--exclude-dir');
  const result = await checkYoutubeTopic({
    candidateTitle: topic,
    repoRoot: process.cwd(),
    selfVideoId: arg('--self-video-id') || null,
    excludeProjectDir: excludeDirArg ? path.resolve(excludeDirArg) : null
  });

  if (process.argv.includes('--json')) console.log(JSON.stringify(result, null, 2));
  else {
    if (result.decision === 'APPROVED_NEW') {
      console.log(`THEMEN-EDITOR: FREI — "${topic}" ist kein erkanntes Duplikat.`);
    } else if (result.decision === 'REVIEW_SIMILAR') {
      console.error(`THEMEN-EDITOR: ÄHNLICH — "${topic}" ähnelt "${result.closestMatch.title}". Erst manuell entscheiden, noch kein Video anlegen.`);
    } else {
      console.error(`THEMEN-EDITOR: DOPPELT — "${topic}" kollidiert mit "${result.closestMatch.title}". Kein Video anlegen.`);
    }
    if (result.closestMatch.title) {
      console.log(`Nächster Treffer: ${result.closestMatch.title} (${result.closestMatch.source}, Score ${result.closestMatch.score})`);
    }
  }

  if (result.decision === 'BLOCKED_DUPLICATE') process.exitCode = 2;
  if (result.decision === 'REVIEW_SIMILAR') process.exitCode = 3;
}

main().catch((error) => {
  console.error(`THEMEN-EDITOR: FEHLER — ${error.message}`);
  process.exitCode = 1;
});
