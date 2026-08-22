import test from 'node:test';
import assert from 'node:assert/strict';

import {
  SUBTITLE_STYLE,
  isHexColor,
  normalizeSubtitleColor,
  normalizeSubtitleVerticalPosition
} from '../src/shared/subtitle-style.js';

test('verwendet die social-safe Untertitelposition für 9:16', () => {
  assert.equal(SUBTITLE_STYLE.position, 'center');
  assert.equal(SUBTITLE_STYLE.verticalPositionPercent, 64);
  assert.deepEqual(SUBTITLE_STYLE.safeVerticalRangePercent, { min: 62, max: 66 });
  assert.equal(SUBTITLE_STYLE.maxWidthPercent, 72);
});

test('erlaubt nur die definierte vertikale Safe-Zone', () => {
  assert.equal(normalizeSubtitleVerticalPosition(62), 62);
  assert.equal(normalizeSubtitleVerticalPosition(64), 64);
  assert.equal(normalizeSubtitleVerticalPosition(66), 66);
  assert.equal(normalizeSubtitleVerticalPosition(58), 64);
  assert.equal(normalizeSubtitleVerticalPosition(72), 64);
});

test('verwendet Weiß mit brauner aktiver Wortmarkierung und ohne Box', () => {
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
