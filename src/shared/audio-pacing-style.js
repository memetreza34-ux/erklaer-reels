export const AUDIO_PACING_STYLE = Object.freeze({
  playbackRate: 1.1,
  playbackRateTolerance: 0.001,
  thresholdDb: -35,
  minimumLongPauseSeconds: 0.24,
  retainedPauseSeconds: 0.05,
  loudnessTargetLufs: -16,
  truePeakDbtp: -1.5,
  loudnessRangeLra: 11,
  loudnessMeasurementToleranceLu: 1,
  truePeakMeasurementToleranceDb: 0.2,
  outputSampleRateHz: 48000,
  preservePitch: true
});

export function toFiniteNumberOrNull(value) {
  if (value === null || value === undefined || value === '') return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

export function isTargetPlaybackRate(value) {
  const rate = toFiniteNumberOrNull(value);
  return rate !== null &&
    Math.abs(rate - AUDIO_PACING_STYLE.playbackRate) <= AUDIO_PACING_STYLE.playbackRateTolerance;
}

export function isMeasuredLoudnessWithinTolerance({
  integratedLufs,
  truePeakDbtp
} = {}, {
  loudnessTargetLufs = AUDIO_PACING_STYLE.loudnessTargetLufs,
  truePeakTargetDbtp = AUDIO_PACING_STYLE.truePeakDbtp
} = {}) {
  const measuredLufs = toFiniteNumberOrNull(integratedLufs);
  const measuredTruePeak = toFiniteNumberOrNull(truePeakDbtp);
  const targetLufs = toFiniteNumberOrNull(loudnessTargetLufs);
  const targetTruePeak = toFiniteNumberOrNull(truePeakTargetDbtp);

  return measuredLufs !== null &&
    measuredTruePeak !== null &&
    targetLufs !== null &&
    targetTruePeak !== null &&
    Math.abs(measuredLufs - targetLufs) <= AUDIO_PACING_STYLE.loudnessMeasurementToleranceLu &&
    measuredTruePeak <= targetTruePeak + AUDIO_PACING_STYLE.truePeakMeasurementToleranceDb;
}

export function buildLoudnessFilter({
  loudnessTargetLufs = AUDIO_PACING_STYLE.loudnessTargetLufs,
  truePeakDbtp = AUDIO_PACING_STYLE.truePeakDbtp,
  loudnessRangeLra = AUDIO_PACING_STYLE.loudnessRangeLra
} = {}) {
  return `loudnorm=I=${Number(loudnessTargetLufs)}:TP=${Number(truePeakDbtp)}:LRA=${Number(loudnessRangeLra)}`;
}
