import test from 'node:test';
import assert from 'node:assert/strict';

import {
  SUBTITLE_STYLE,
  isHexColor,
  normalizeSubtitleColor,
  normalizeSubtitleVerticalPosition
} from '../src/shared/subtitle-style.js';

test('verwendet eine leicht unterhalb der Mitte liegende Standardposition', () => {
  assert.equal(SUBTITLE_STYLE.position, 'safe-middle');
  assert.equal(SUBTITLE_STYLE.verticalPositionPercent, 68);
  assert.deepEqual(SUBTITLE_STYLE.safeVerticalRangePercent, { min: 64, max: 72 });
});

test('setzt alte oder unsichere Positionen auf den neuen Standard zurück', () => {
  assert.equal(normalizeSubtitleVerticalPosition(79.5), 68);
  assert.equal(normalizeSubtitleVerticalPosition(50), 68);
  assert.equal(normalizeSubtitleVerticalPosition(70), 70);
});

test('verwendet weiches Weiß und Warmgelb als feste Palette', () => {
  assert.equal(SUBTITLE_STYLE.textColor, '#F5F7FA');
  assert.equal(SUBTITLE_STYLE.highlightColor, '#FFD84D');
  assert.equal(isHexColor(SUBTITLE_STYLE.textColor), true);
  assert.equal(isHexColor(SUBTITLE_STYLE.highlightColor), true);
  assert.notEqual(SUBTITLE_STYLE.textColor, SUBTITLE_STYLE.highlightColor);
});

test('fällt bei ungültigen Farben auf die sichere Palette zurück', () => {
  assert.equal(normalizeSubtitleColor('#ffffff', SUBTITLE_STYLE.textColor), '#FFFFFF');
  assert.equal(normalizeSubtitleColor('gelb', SUBTITLE_STYLE.highlightColor), '#FFD84D');
});
