import test from 'node:test';
import assert from 'node:assert/strict';

import {
  SUBTITLE_STYLE,
  isHexColor,
  normalizeSubtitleColor,
  normalizeSubtitleVerticalPosition
} from '../src/shared/subtitle-style.js';

test('verwendet die feste tiefe Untertitelposition', () => {
  assert.equal(SUBTITLE_STYLE.position, 'center');
  assert.equal(SUBTITLE_STYLE.verticalPositionPercent, 58);
  assert.deepEqual(SUBTITLE_STYLE.safeVerticalRangePercent, { min: 58, max: 58 });
});

test('setzt jede abweichende Position exakt auf 58 Prozent zurück', () => {
  assert.equal(normalizeSubtitleVerticalPosition(76), 58);
  assert.equal(normalizeSubtitleVerticalPosition(68), 58);
  assert.equal(normalizeSubtitleVerticalPosition(58), 58);
});

test('verwendet weißen Grundtext mit braunem Aktivwort ohne Box', () => {
  assert.equal(SUBTITLE_STYLE.textColor, '#F5F7FA');
  assert.equal(SUBTITLE_STYLE.highlightColor, '#B7794A');
  assert.equal(SUBTITLE_STYLE.highlightCurrentWord, true);
  assert.equal(SUBTITLE_STYLE.backgroundColor, 'transparent');
  assert.equal(isHexColor(SUBTITLE_STYLE.textColor), true);
  assert.equal(isHexColor(SUBTITLE_STYLE.highlightColor), true);
  assert.notEqual(SUBTITLE_STYLE.textColor, SUBTITLE_STYLE.highlightColor);
});

test('fällt bei ungültigen Farben auf die jeweilige Standardfarbe zurück', () => {
  assert.equal(normalizeSubtitleColor('#ffffff', SUBTITLE_STYLE.textColor), '#FFFFFF');
  assert.equal(normalizeSubtitleColor('gelb', SUBTITLE_STYLE.highlightColor), '#B7794A');
});
