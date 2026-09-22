#!/usr/bin/env node

/**
 * Prüft ein geplantes Thema gegen die Registry, bevor ein Reel oder Video angelegt wird.
 *
 *   npm run check:topic -- "Warum ist der Himmel blau?"
 *   npm run check:topic -- --audit
 */

import { loadTopicRegistry, findTopicConflicts, auditTopicRegistry, toTopicSlug, toTopicSignature } from '../core/topic-registry.js';

function usage() {
  console.log(`
Themen-Eindeutigkeit prüfen

Verwendung:
  npm run check:topic -- "<Thementitel>"    ein geplantes Thema prüfen
  npm run check:topic -- --audit            die gesamte Registry auf Duplikate prüfen

Ein identischer Slug oder eine identische Kernaussage ist ein Hard Blocker.
Hohe Ähnlichkeit wird als Verdachtsfall gemeldet und von dir entschieden.
`);
}

async function audit() {
  const registry = await loadTopicRegistry();
  const { blocking, warnings } = auditTopicRegistry(registry.topics);

  console.log(`Registry: ${registry.topics.length} Themen geprüft.\n`);

  for (const entry of blocking) {
    console.error(`DUPLIKAT: "${entry.topic.title}" kollidiert mit "${entry.conflictsWith.title}" (${entry.reason})`);
  }
  for (const entry of warnings) {
    console.warn(`Verdacht (${entry.similarity}): "${entry.topic.title}" ähnelt "${entry.conflictsWith.title}"`);
  }

  if (blocking.length === 0 && warnings.length === 0) {
    console.log('Keine Duplikate und keine Verdachtsfälle.');
  }

  process.exitCode = blocking.length > 0 ? 1 : 0;
}

async function checkTitle(title) {
  const registry = await loadTopicRegistry();
  const { blocking, warnings } = findTopicConflicts(title, registry.topics);

  console.log(`Thema:     ${title}`);
  console.log(`Slug:      ${toTopicSlug(title)}`);
  console.log(`Signatur:  ${toTopicSignature(title).join(' ')}\n`);

  if (blocking.length > 0) {
    console.error('BLOCKIERT — das Thema ist bereits belegt:');
    for (const { topic, reason } of blocking) {
      console.error(`  - "${topic.title}" (${topic.channel}, ${topic.status}) — ${reason}`);
    }
    process.exitCode = 1;
    return;
  }

  if (warnings.length > 0) {
    console.warn('Verdachtsfälle — bitte selbst entscheiden:');
    for (const { topic, similarity } of warnings) {
      console.warn(`  - ${similarity} Ähnlichkeit zu "${topic.title}" (${topic.channel}, ${topic.status})`);
    }
    console.warn('');
  }

  console.log('Frei. Nach der Entscheidung in config/topics.json eintragen.');
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.length === 0) return usage();
  if (args.includes('--audit')) return audit();

  const title = args.find((argument) => !argument.startsWith('--'));
  if (!title) return usage();
  return checkTitle(title);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
