import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('YouTube-Testphase ist sauber als Produktionsstandard dokumentiert', async () => {
  const [workflow, standard, visualWorld] = await Promise.all([
    readFile('youtube/YOUTUBE_WORKFLOW.md', 'utf8'),
    readFile('youtube/PRODUKTIONSSTANDARD_NACH_TESTPHASE.md', 'utf8'),
    readFile('youtube/YOUTUBE_VISUAL_WORLD.md', 'utf8')
  ]);

  assert.match(workflow, /Testphase.*abgeschlossen/is);
  assert.match(workflow, /PRODUKTIONSSTANDARD_NACH_TESTPHASE\.md/);
  assert.match(workflow, /Inhalt vor Figur/i);
  assert.match(workflow, /So einfach wie möglich, so komplex wie nötig/i);
  assert.match(workflow, /Visual Flexibility Policy V1/i);
  assert.match(workflow, /Definition of Done für neue Schema-13\+-Projekte/i);

  assert.match(standard, /Status: Testphase abgeschlossen/i);
  assert.match(standard, /Inhalt vor Figur/i);
  assert.match(standard, /So einfach wie möglich, so komplex wie nötig/i);
  assert.match(standard, /Anschauliche Illustration vor abstrakter Erklärtafel/i);
  assert.match(standard, /Jedes Bild muss sichtbar zum konkreten Thema gehören/i);
  assert.match(standard, /Dichte Stellen früher auf mehrere Bilder aufteilen/i);
  assert.match(standard, /Neue Videos laufen als \*\*normale Produktion\*\*/i);

  assert.match(visualWorld, /Countryballs sind optional/i);
  assert.match(visualWorld, /So einfach wie möglich, so komplex wie nötig/i);
});
