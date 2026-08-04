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
  SUBTITLE_STYLE,
  normalizeSubtitleColor,
  normalizeSubtitleVerticalPosition
} from '../shared/subtitle-style.js';
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
  const vertical = normalizeSubtitleVerticalPosition(cue.verticalPositionPercent);
  const textColor = normalizeSubtitleColor(cue.textColor, SUBTITLE_STYLE.textColor);
  const words = buildWordTimings(cue);
  const active = SUBTITLE_STYLE.highlightCurrentWord && cue.highlightCurrentWord !== false
    ? activeWordIndex(words, frame / fps)
    : -1;

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
          maxWidth: `${SUBTITLE_STYLE.maxWidthPercent}%`,
          padding: 0,
          borderRadius: 0,
          border: 'none',
          backgroundColor: SUBTITLE_STYLE.backgroundColor,
          color: textColor,
          fontFamily: 'Arial, Helvetica, sans-serif',
          fontSize: SUBTITLE_STYLE.fontSize,
          fontWeight: SUBTITLE_STYLE.fontWeight,
          lineHeight: 1.08,
          letterSpacing: -0.9,
          textAlign: 'center',
          WebkitTextStroke: `${SUBTITLE_STYLE.textStrokeWidth}px ${SUBTITLE_STYLE.textStrokeColor}`,
          paintOrder: 'stroke fill',
          textShadow: SUBTITLE_STYLE.textShadow,
          whiteSpace: 'normal'
        }}
      >
        {words.length > 0 ? words.map((word, index) => {
          const isActive = index === active;
          return (
            <React.Fragment key={`${word.text}-${index}`}>
              {index > 0 ? ' ' : ''}
              <span style={{ color: isActive ? SUBTITLE_STYLE.highlightColor : textColor }}>
                {word.text}
              </span>
            </React.Fragment>
          );
        }) : (
          <span style={{ color: textColor }}>{cue.text}</span>
        )}
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
