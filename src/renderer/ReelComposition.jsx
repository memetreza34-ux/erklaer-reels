import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Easing,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig
} from 'remotion';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const assetUrl = (file) => staticFile(String(file).replaceAll('\\', '/').replace(/^\/+/, ''));

// Eine lineare Kamerafahrt startet und stoppt hart und wirkt dadurch mechanisch.
// Die Kurven beschleunigen sanft an und laufen weich aus.
const EASING_CURVES = {
  linear: Easing.linear,
  ease: Easing.bezier(0.25, 0.1, 0.25, 1),
  'ease-in': Easing.bezier(0.42, 0, 1, 1),
  'ease-out': Easing.bezier(0, 0, 0.58, 1),
  'ease-in-out': Easing.bezier(0.42, 0, 0.58, 1)
};

const easingFor = (name) => EASING_CURVES[name] ?? EASING_CURVES['ease-in-out'];

const motionDefaults = (motion = {}) => {
  const type = motion.type ?? 'none';
  const defaults = {
    none: [1, 1],
    'subtle-push-in': [1, 1.04],
    'subtle-pull-out': [1.04, 1],
    'slow-zoom-in': [1, 1.05],
    'slow-zoom-out': [1.05, 1],
    'pan-left': [1.04, 1.04],
    'pan-right': [1.04, 1.04],
    'pan-up': [1.04, 1.04],
    'pan-down': [1.04, 1.04],
    // Ken Burns kombiniert Zoom und Schwenk und wirkt dadurch deutlich lebendiger
    // als ein reiner Zoom, ohne mehr Bewegung im Bild zu erzeugen.
    'ken-burns': [1.02, 1.06]
  };
  const [defaultStart, defaultEnd] = defaults[type] ?? defaults.none;
  // Ken Burns bekommt einen leichten Standardschwenk, wenn keiner geplant ist.
  const kenBurnsPan = type === 'ken-burns' ? 1.5 : 0;
  return {
    type,
    easing: easingFor(motion.easing),
    startScale: Number(motion.startScale) || defaultStart,
    endScale: Number(motion.endScale) || defaultEnd,
    startPanXPercent: Number(motion.startPanXPercent) || (type === 'ken-burns' ? -kenBurnsPan : 0),
    startPanYPercent: Number(motion.startPanYPercent) || 0,
    endPanXPercent: Number(motion.panXPercent) || (type === 'ken-burns' ? kenBurnsPan : 0),
    endPanYPercent: Number(motion.panYPercent) || 0
  };
};

const SceneLayer = ({ scene }) => {
  const frame = useCurrentFrame();
  const duration = Math.max(1, Number(scene.endFrame) - Number(scene.startFrame));
  const motion = motionDefaults(scene.cameraMotion);

  const range = [0, Math.max(1, duration - 1)];
  const options = { easing: motion.easing, extrapolateLeft: 'clamp', extrapolateRight: 'clamp' };

  const scale = interpolate(frame, range, [motion.startScale, motion.endScale], options);
  const panX = interpolate(frame, range, [motion.startPanXPercent, motion.endPanXPercent], options);
  const panY = interpolate(frame, range, [motion.startPanYPercent, motion.endPanYPercent], options);

  return (
    <AbsoluteFill style={{ backgroundColor: '#000', overflow: 'hidden' }}>
      <Img
        src={assetUrl(scene.imageFile)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `translate(${panX}%, ${panY}%) scale(${scale})`,
          transformOrigin: '50% 50%'
        }}
      />
    </AbsoluteFill>
  );
};

export const ReelComposition = ({ plan }) => {
  const { fps, durationInFrames } = useVideoConfig();
  const scenes = Array.isArray(plan?.scenes) ? plan.scenes : [];
  const voiceover = plan?.voiceover;

  const soundEffects = scenes.flatMap((scene) =>
    (scene.soundEffects ?? [])
      .filter((sound) => sound.file)
      .map((sound) => ({ ...sound, sceneId: scene.sceneId }))
  );

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {scenes.map((scene, index) => {
        const from = Math.max(0, Number(scene.startFrame));
        const end = Math.min(durationInFrames, Number(scene.endFrame));
        return (
          <Sequence
            key={scene.sceneId}
            from={from}
            durationInFrames={Math.max(1, end - from)}
            style={{ zIndex: index }}
            premountFor={Math.min(fps, Math.max(0, from))}
          >
            <SceneLayer scene={scene} />
          </Sequence>
        );
      })}

      {voiceover?.file ? (
        <Audio src={assetUrl(voiceover.file)} volume={Number(voiceover.volume) || 1} />
      ) : null}

      {soundEffects.map((sound) => {
        const from = clamp(Math.round(Number(sound.timeSeconds) * fps), 0, durationInFrames - 1);
        return (
          <Sequence key={sound.id ?? `${sound.sceneId}-${from}`} from={from}>
            <Audio src={assetUrl(sound.file)} volume={Number(sound.volume) || 0.2} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
