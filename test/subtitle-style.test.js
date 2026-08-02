import test from 'node:test';
import assert from 'node:assert/strict';

import {
  SUBTITLE_STYLE,
  isHexColor,
  normalizeSubtitleColor,
  normalizeSubtitleVerticalPosition
} from '../src/shared/subtitle-style.js';

test('verwendet exakt die Bildmitte als Standardposition', () => {
  assert.equal(SUBTITLE_STYLE.position, 'center');
  assert.equal(SUBTITLE_STYLE.verticalPositionPercent, 50);
  assert.deepEqual(SUBTITLE_STYLE.safeVerticalRangePercent, { min: 50, max: 50 });
});

test('setzt jede abweichende Position exakt auf 50 Prozent zurück', () => {
  assert.equal(normalizeSubtitleVerticalPosition(79.5), 50);
  assert.equal(normalizeSubtitleVerticalPosition(68), 50);
  assert.equal(normalizeSubtitleVerticalPosition(50), 50);
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
