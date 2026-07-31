import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

import { bundle } from '@remotion/bundler';

test('bündelt die Remotion-Komposition ohne Syntaxfehler', { timeout: 120000 }, async () => {
  const publicDirectory = await mkdtemp(path.join(os.tmpdir(), 'erklaer-remotion-public-'));
  const serveUrl = await bundle({
    entryPoint: path.resolve('src', 'renderer', 'index.jsx'),
    publicDir: publicDirectory
  });

  assert.equal(typeof serveUrl, 'string');
  assert.ok(serveUrl.length > 0);
});
