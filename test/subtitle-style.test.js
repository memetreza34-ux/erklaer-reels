import test from 'node:test';
import assert from 'node:assert/strict';

import {
  SUBTITLE_STYLE,
  isHexColor,
  normalizeSubtitleColor,
  normalizeSubtitleVerticalPosition
} from '../src/shared/subtitle-style.js';

test('Untertitel sind global deaktiviert', () => {
  assert.equal(SUBTITLE_STYLE.enabled, false);
});

test('Legacy-Stilwerte bleiben nur für alte Dateien rückwärtskompatibel', () => {
  assert.equal(SUBTITLE_STYLE.position, 'center');
  assert.equal(SUBTITLE_STYLE.verticalPositionPercent, 64);
  assert.deepEqual(SUBTITLE_STYLE.safeVerticalRangePercent, { min: 62, max: 66 });
  assert.equal(SUBTITLE_STYLE.maxWidthPercent, 72);
  assert.equal(SUBTITLE_STYLE.textColor, '#F5F7FA');
  assert.equal(SUBTITLE_STYLE.highlightColor, '#B7794A');
  assert.equal(isHexColor(SUBTITLE_STYLE.textColor), true);
});

test('Legacy-Normalisierer bleiben stabil, obwohl der Renderer sie nicht mehr nutzt', () => {
  assert.equal(normalizeSubtitleVerticalPosition(64), 64);
  assert.equal(normalizeSubtitleVerticalPosition(58), 64);
  assert.equal(normalizeSubtitleColor('#ffffff', SUBTITLE_STYLE.textColor), '#FFFFFF');
  assert.equal(normalizeSubtitleColor('ungültig', SUBTITLE_STYLE.highlightColor), '#B7794A');
});
