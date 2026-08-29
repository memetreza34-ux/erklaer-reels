import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = fileURLToPath(new URL('..', import.meta.url));

async function read(relativePath) {
  return readFile(path.join(REPO_ROOT, relativePath), 'utf8');
}

test('die Phasenbeschreibung nennt jede Rolle mit ihrem Ergebnis', async () => {
  const doc = await read('WORKFLOW_PHASEN.md');

  assert.match(doc, /Phase 1 — ChatGPT/);
  assert.match(doc, /Phase 2 — Arman/);
  assert.match(doc, /Phase 3 — Antigravity/);
  // Ohne klare Übergabe weiß niemand, wann eine Phase fertig ist.
  assert.equal((doc.match(/\*\*Übergabe an Phase/g) ?? []).length, 2);
  assert.match(doc, /Antigravity erzeugt \*\*keine\*\* Inhalte/);
});

test('jeder in der Phasenbeschreibung genannte npm-Befehl existiert wirklich', async () => {
  const doc = await read('WORKFLOW_PHASEN.md');
  const pkg = JSON.parse(await read('package.json'));

  const genannt = [...doc.matchAll(/npm run ([a-z:]+)/g)].map((match) => match[1]);
  assert.ok(genannt.length >= 8, 'Die Beschreibung muss die Befehlskette enthalten');

  for (const skript of new Set(genannt)) {
    assert.ok(pkg.scripts[skript], `npm run ${skript} steht in der Doku, fehlt aber in package.json`);
  }
});

test('die Phasen sind aus den zentralen Regeldateien heraus auffindbar', async () => {
  for (const datei of ['CURRENT_WORKFLOW.md', 'AGENTS.md']) {
    const inhalt = await read(datei);
    assert.match(inhalt, /WORKFLOW_PHASEN\.md/, `${datei} muss auf die Phasenbeschreibung verweisen`);
  }
});

test('die genannten Kennzahlen stimmen mit der Konfiguration überein', async () => {
  const doc = await read('WORKFLOW_PHASEN.md');
  const rules = JSON.parse(await read('config/content-rules.json'));
  const gates = JSON.parse(await read('config/production-quality-gates.json'));

  // 9 Szenen mit je zwei Bildphasen, Hook eine: 17 Bilder.
  const szenen = rules.visualRules.defaultSceneCount;
  const bilder = 1 + (szenen - 1) * 2;
  assert.ok(doc.includes(`${szenen} Szenen`), `Die Doku muss ${szenen} Szenen nennen`);
  assert.ok(doc.includes(`${bilder} Bilder`), `Die Doku muss ${bilder} Bilder nennen`);
  assert.ok(
    doc.includes(`Bild ${String(bilder).padStart(2, '0')}.png`),
    `Die Doku muss die letzte Bildnummer ${bilder} nennen`
  );

  const minimum = gates.sceneTiming.minimumImagePhaseSeconds;
  assert.ok(doc.includes(`unter ${minimum} Sekunden`), `Die Doku muss die Untergrenze ${minimum} s nennen`);
});

test('der erzeugte Produktionsauftrag macht Bildtext verbindlich', async () => {
  const { buildProductionBrief } = await import('../src/core/production-brief.js').catch(() => ({}));
  const quelle = await read('src/core/production-brief.js');

  // Der Auftrag landet in jedem neuen Reel unter production/agent-task.md.
  assert.match(quelle, /zwingend einen eigenen/, 'Bildtext muss als Pflicht formuliert sein');
  assert.match(quelle, /Überschrift des ganzen Reels/, 'Das Titelbild muss als Überschrift beschrieben sein');
  assert.ok(!/optional eigenen `imageText`/.test(quelle), 'Bildtext darf nicht mehr als optional gelten');
});
