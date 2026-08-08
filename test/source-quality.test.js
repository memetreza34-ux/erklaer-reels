import test from 'node:test';
import assert from 'node:assert/strict';

import {
  SOURCE_SCHEMA_MARKER,
  buildSourcesTemplate,
  inspectSourcesMarkdown
} from '../src/core/source-quality.js';

test('neues Quellen-Template ist versioniert und zunächst absichtlich unvollständig', () => {
  const template = buildSourcesTemplate();
  const result = inspectSourcesMarkdown(template);

  assert.match(template, new RegExp(SOURCE_SCHEMA_MARKER.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.equal(result.schemaVersion, 2);
  assert.equal(result.passed, false);
  assert.equal(result.httpsUrlCount, 0);
  assert.equal(result.hasPlaceholder, false);
});

test('vollständig ausgefülltes echtes Template besteht die Quellen-QC', () => {
  const text = `${buildSourcesTemplate()}\n## Verwendete Quellen\n- Titel/Institution: Deutscher Bundestag\n- URL: https://www.bundestag.de/parlament/aufgaben\n- Datum/Zugriff: 2026-08-08\n- Belegt: Erklärt die Aufgaben des Parlaments.\n\n- Titel/Institution: Bundeszentrale für politische Bildung\n- URL: https://www.bpb.de/themen/politisches-system/\n- Datum/Zugriff: 2026-08-08\n- Belegt: Liefert unabhängigen Hintergrund zum politischen System.\n`;
  const result = inspectSourcesMarkdown(text);

  assert.equal(result.passed, true);
  assert.equal(result.httpsUrlCount, 2);
  assert.equal(result.distinctHostCount, 2);
  assert.equal(result.hasPlaceholder, false);
});

test('akzeptiert zwei vollständige unabhängige HTTPS-Quellen', () => {
  const text = `# Quellen\n${SOURCE_SCHEMA_MARKER}\n\n## Quelle 1\n- Titel/Institution: Deutscher Bundestag\n- URL: https://www.bundestag.de/parlament/aufgaben\n- Datum/Zugriff: 2026-08-08\n- Belegt: Erklärt die Aufgaben des Parlaments.\n\n## Quelle 2\n- Titel/Institution: Bundeszentrale für politische Bildung\n- URL: https://www.bpb.de/themen/politisches-system/\n- Datum/Zugriff: 2026-08-08\n- Belegt: Liefert unabhängigen Hintergrund zum politischen System.\n`;
  const result = inspectSourcesMarkdown(text);

  assert.equal(result.passed, true);
  assert.equal(result.httpsUrlCount, 2);
  assert.equal(result.distinctHostCount, 2);
  assert.equal(result.evidenceCount, 2);
});

test('blockiert doppelte Domains, Platzhalter und unsicheres HTTP', () => {
  const text = `# Quellen\n${SOURCE_SCHEMA_MARKER}\n\n## Quelle 1\n- Titel/Institution: TODO\n- URL: http://example.com/a\n- Datum/Zugriff: 2026-08-08\n- Belegt: Platzhalter.\n\n## Quelle 2\n- Titel/Institution: Zweite Seite\n- URL: https://example.com/b\n- Datum/Zugriff: 2026-08-08\n- Belegt: Zweiter Platzhalter.\n`;
  const result = inspectSourcesMarkdown(text);

  assert.equal(result.passed, false);
  assert.equal(result.hasPlaceholder, true);
  assert.equal(result.hasInsecureHttp, true);
  assert.equal(result.distinctHostCount, 1);
});

test('blockiert ungültige URL-Felder', () => {
  const text = `# Quellen\n${SOURCE_SCHEMA_MARKER}\n\n## Quelle 1\n- Titel/Institution: Quelle A\n- URL: keine-gueltige-url\n- Datum/Zugriff: 2026-08-08\n- Belegt: Aussage A.\n\n## Quelle 2\n- Titel/Institution: Quelle B\n- URL: https://example.net/b\n- Datum/Zugriff: 2026-08-08\n- Belegt: Aussage B.\n`;
  const result = inspectSourcesMarkdown(text);

  assert.equal(result.passed, false);
  assert.equal(result.hasMalformedUrlField, true);
  assert.equal(result.httpsUrlCount, 1);
});

test('alte Quellen-Dateien bleiben rückwärtskompatibel', () => {
  const result = inspectSourcesMarkdown('# Quellen\n\nHistorische Notiz ohne Schema-Marker.');

  assert.equal(result.schemaVersion, 1);
  assert.equal(result.passed, true);
});
