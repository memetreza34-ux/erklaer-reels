export const EDIT_TIMING_STYLE = Object.freeze({
  sceneCueLeadSeconds: 0.1,
  imageCueLeadSeconds: 0.08,
  sfxPreRollSeconds: 0.04,
  transitionSoundWindowSeconds: 0.75
});

export function secondsToFrames(seconds, fps) {
  return Math.max(0, Math.round(Number(seconds) * Number(fps)));
}
