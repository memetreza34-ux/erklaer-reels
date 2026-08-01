import React from 'react';
import {
  AbsoluteFill,
  Audio,
  Img,
  Sequence,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig
} from 'remotion';

import { activeWordIndex, buildWordTimings } from './subtitle-timing.js';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const assetUrl = (file) => staticFile(String(file).replaceAll('\\', '/').replace(/^\/+/, ''));

const motionDefaults = (motion = {}) => {
  const type = motion.type ?? 'none';
  const defaults = {
    none: [1, 1],
    'subtle-push-in': [1, 1.04],
    'slow-zoom-in': [1, 1.05],
    'slow-zoom-out': [1.05, 1],
    'pan-left': [1.04, 1.04],
    'pan-right': [1.04, 1.04],
    'pan-up': [1.04, 1.04],
    'pan-down': [1.04, 1.04]
  };
  const [defaultStart, defaultEnd] = defaults[type] ?? defaults.none;
  return {
    type,
    startScale: Number(motion.startScale) || defaultStart,
    endScale: Number(motion.endScale) || defaultEnd,
    startPanXPercent: Number(motion.startPanXPercent) || 0,
    startPanYPercent: Number(motion.startPanYPercent) || 0,
    endPanXPercent: Number(motion.panXPercent) || 0,
    endPanYPercent: Number(motion.panYPercent) || 0
  };
};

const SceneLayer = ({ scene }) => {
  const frame = useCurrentFrame();
  const duration = Math.max(1, Number(scene.endFrame) - Number(scene.startFrame));
  const motion = motionDefaults(scene.cameraMotion);

  const scale = interpolate(
    frame,
    [0, Math.max(1, duration - 1)],
    [motion.startScale, motion.endScale],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const panX = interpolate(
    frame,
    [0, Math.max(1, duration - 1)],
    [motion.startPanXPercent, motion.endPanXPercent],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const panY = interpolate(
    frame,
    [0, Math.max(1, duration - 1)],
    [motion.startPanYPercent, motion.endPanYPercent],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

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

const Subtitle = ({ cue }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const position = cue.position ?? 'safe-lower-middle';
  const defaultVertical = position === 'safe-lower-middle' ? 79.5 : 79;
  const vertical = clamp(Number(cue.verticalPositionPercent) || defaultVertical, 76.5, 80.5);
  const words = buildWordTimings(cue);
  const active = cue.highlightCurrentWord === false
    ? -1
    : activeWordIndex(words, frame / fps);
  const highlightColor = cue.highlightColor ?? '#FFD84D';

  return (
    <AbsoluteFill
      style={{
        justifyContent: 'flex-start',
        alignItems: 'center',
        pointerEvents: 'none'
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: `${vertical}%`,
          transform: 'translateY(-50%)',
          maxWidth: '90%',
          padding: '9px 18px 11px',
          borderRadius: 14,
          backgroundColor: 'rgba(0, 0, 0, 0.64)',
          color: '#fff',
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: 52,
          fontWeight: 800,
          lineHeight: 1.08,
          letterSpacing: -0.9,
          textAlign: 'center',
          textShadow: '0 3px 10px rgba(0, 0, 0, 0.92)',
          whiteSpace: 'normal'
        }}
      >
        {words.length > 0 ? words.map((word, index) => (
          <React.Fragment key={`${word.text}-${index}`}>
            {index > 0 ? ' ' : ''}
            <span
              style={{
                color: index === active ? highlightColor : '#fff',
                transition: 'color 45ms linear'
              }}
            >
              {word.text}
            </span>
          </React.Fragment>
        )) : cue.text}
      </div>
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
  const subtitles = scenes.flatMap((scene) => scene.subtitles ?? []);

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

      {subtitles.map((cue, index) => {
        const from = clamp(Math.round(Number(cue.startSeconds) * fps), 0, durationInFrames - 1);
        const end = clamp(Math.round(Number(cue.endSeconds) * fps), from + 1, durationInFrames);
        return (
          <Sequence
            key={cue.id ?? `subtitle-${index + 1}`}
            from={from}
            durationInFrames={Math.max(1, end - from)}
            style={{ zIndex: scenes.length + 10 }}
          >
            <Subtitle cue={cue} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
