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

import {
  getActiveSubtitleWordIndex,
  getSubtitleVerticalPositionPercent,
  getSubtitleWordTimings,
  subtitleTimingDefaults,
  validateSubtitleWordTimings
} from '../core/subtitle-timing.js';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const assetUrl = (file) => staticFile(String(file).replaceAll('\\', '/').replace(/^\/+/, ''));

const transitionFrames = (transition, fps) => {
  if (transition?.type !== 'crossfade') return 0;
  return Math.max(1, Math.round((Number(transition.durationSeconds) || 0.15) * fps));
};

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

const SceneLayer = ({ scene, incomingFrames, outgoingFrames }) => {
  const frame = useCurrentFrame();
  const mainDuration = Math.max(1, Number(scene.endFrame) - Number(scene.startFrame));
  const motionFrame = clamp(frame - incomingFrames, 0, mainDuration - 1);
  const motion = motionDefaults(scene.cameraMotion);

  const scale = interpolate(
    motionFrame,
    [0, Math.max(1, mainDuration - 1)],
    [motion.startScale, motion.endScale],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const panX = interpolate(
    motionFrame,
    [0, Math.max(1, mainDuration - 1)],
    [motion.startPanXPercent, motion.endPanXPercent],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const panY = interpolate(
    motionFrame,
    [0, Math.max(1, mainDuration - 1)],
    [motion.startPanYPercent, motion.endPanYPercent],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  let opacity = 1;
  if (incomingFrames > 0) {
    opacity *= interpolate(frame, [0, incomingFrames], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    });
  }
  if (outgoingFrames > 0) {
    const fadeStart = incomingFrames + mainDuration;
    opacity *= interpolate(frame, [fadeStart, fadeStart + outgoingFrames], [1, 0], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp'
    });
  }

  return (
    <AbsoluteFill style={{ backgroundColor: '#000', overflow: 'hidden', opacity }}>
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

const SubtitleText = ({ cue, currentSeconds }) => {
  const wordTiming = validateSubtitleWordTimings(cue);
  const highlightEnabled = cue.highlightEnabled !== false && cue.highlightMode !== 'none';

  if (!highlightEnabled || !wordTiming.valid) {
    return <>{cue.text}</>;
  }

  const words = getSubtitleWordTimings(cue);
  const activeIndex = getActiveSubtitleWordIndex(cue, currentSeconds);
  const highlightColor = cue.highlightColor ?? subtitleTimingDefaults.highlightColor;

  return (
    <>
      {words.map((word, index) => (
        <React.Fragment key={`${cue.id ?? 'subtitle'}-word-${index}`}>
          {index > 0 ? ' ' : ''}
          <span
            style={{
              color: index === activeIndex ? highlightColor : '#fff',
              transition: 'color 45ms linear'
            }}
          >
            {word.text}
          </span>
        </React.Fragment>
      ))}
    </>
  );
};

const Subtitle = ({ cue }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const cueStartSeconds = Number(cue.startSeconds) || 0;
  const currentSeconds = cueStartSeconds + frame / fps;
  const vertical = getSubtitleVerticalPositionPercent(cue);

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
          maxWidth: '88%',
          padding: '10px 20px 12px',
          borderRadius: 15,
          backgroundColor: 'rgba(0, 0, 0, 0.58)',
          color: '#fff',
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: 56,
          fontWeight: 800,
          lineHeight: 1.08,
          letterSpacing: -1.1,
          textAlign: 'center',
          textShadow: '0 3px 10px rgba(0, 0, 0, 0.92)',
          WebkitTextStroke: '1.2px rgba(0, 0, 0, 0.82)',
          whiteSpace: 'pre-wrap'
        }}
      >
        <SubtitleText cue={cue} currentSeconds={currentSeconds} />
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
        const incoming = transitionFrames(scene.transitionIn, fps);
        const nextIncoming = transitionFrames(scenes[index + 1]?.transitionIn, fps);
        const from = Math.max(0, Number(scene.startFrame) - incoming);
        const until = Math.min(durationInFrames, Number(scene.endFrame) + nextIncoming);
        return (
          <Sequence
            key={scene.sceneId}
            from={from}
            durationInFrames={Math.max(1, until - from)}
            style={{ zIndex: index }}
            premountFor={Math.min(fps, Math.max(0, from))}
          >
            <SceneLayer
              scene={scene}
              incomingFrames={incoming}
              outgoingFrames={nextIncoming}
            />
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
