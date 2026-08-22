export const SUBTITLE_STYLE = Object.freeze({
  position: 'center',
  // Social-safe baseline for 9:16 TikTok / Reels / Shorts.
  // Low enough to stay below the main face area, but high enough to avoid bottom UI/caption overlays.
  verticalPositionPercent: 64,
  safeVerticalRangePercent: Object.freeze({ min: 62, max: 66 }),
  textColor: '#F5F7FA',
  highlightCurrentWord: true,
  highlightColor: '#B7794A',
  backgroundColor: 'transparent',
  borderColor: 'transparent',
  textStrokeColor: 'rgba(0, 0, 0, 0.92)',
  textStrokeWidth: 2.4,
  textShadow: '0 3px 8px rgba(0, 0, 0, 0.88)',
  // Keep centered captions away from the right-side platform action column.
  maxWidthPercent: 72,
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
