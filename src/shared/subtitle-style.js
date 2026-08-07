export const SUBTITLE_STYLE = Object.freeze({
  position: 'center',
  verticalPositionPercent: 58,
  safeVerticalRangePercent: Object.freeze({ min: 58, max: 58 }),
  textColor: '#F5F7FA',
  highlightCurrentWord: false,
  highlightColor: '#F5F7FA',
  backgroundColor: 'transparent',
  borderColor: 'transparent',
  textStrokeColor: 'rgba(0, 0, 0, 0.92)',
  textStrokeWidth: 2.4,
  textShadow: '0 3px 8px rgba(0, 0, 0, 0.88)',
  maxWidthPercent: 88,
  fontSize: 54,
  fontWeight: 800,
  maxLines: 2
});

export function normalizeSubtitleVerticalPosition(value) {
  const number = Number(value);
  const { min, max } = SUBTITLE_STYLE.safeVerticalRangePercent;
  if (!Number.isFinite(number) || number < min || number > max) {
    return SUBTITLE_STYLE.verticalPositionPercent;
  }
  return number;
}

export function isHexColor(value) {
  return /^#[0-9A-F]{6}$/i.test(String(value ?? '').trim());
}

export function normalizeSubtitleColor(value, fallback) {
  return isHexColor(value) ? String(value).toUpperCase() : fallback;
}
