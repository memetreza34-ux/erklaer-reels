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

import { EDIT_TIMING_STYLE, secondsToFrames } from '../shared/edit-timing-style.js';

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

const automaticSecondaryMotion = (scene = {}) => {
  if (Number(scene.phaseOrder ?? 1) <= 1) return scene.cameraMotion ?? { type: 'none' };
  if (scene.cameraMotion?.type && scene.cameraMotion.type !== 'none') return scene.cameraMotion;

  const pullOut = Number(scene.parentSceneOrder ?? 0) % 2 === 0;
  return pullOut
    ? { type: 'subtle-pull-out', startScale: 1.03, endScale: 1, easing: 'ease-in-out' }
    : { type: 'subtle-push-in', startScale: 1, endScale: 1.03, easing: 'ease-in-out' };
};

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
  const duration = Math.max(1, Number(scene.renderEndFrame ?? scene.endFrame) - Number(scene.renderStartFrame ?? scene.startFrame));
  const motion = motionDefaults(automaticSecondaryMotion(scene));

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

const cutLeadFramesFor = (scene, previousScene, fps) => {
  if (!previousScene) return 0;
  const newNarrativeScene = String(scene.parentSceneId ?? '') !== String(previousScene.parentSceneId ?? '');
  const seconds = newNarrativeScene
    ? EDIT_TIMING_STYLE.sceneCueLeadSeconds
    : EDIT_TIMING_STYLE.imageCueLeadSeconds;
  return secondsToFrames(seconds, fps);
};

export const ReelComposition = ({ plan }) => {
  const { fps, durationInFrames } = useVideoConfig();
  const scenes = Array.isArray(plan?.scenes) ? plan.scenes : [];
  const voiceover = plan?.voiceover;

  // Ein neuer Bildmoment erscheint minimal VOR dem gesprochenen Cue. Da die späteren
  // Shots einen höheren zIndex haben, erzeugt die kurze Überlappung weiterhin einen
  // sauberen harten Cut statt eines Crossfades.
  const renderedScenes = scenes.map((scene, index) => {
    const originalStart = Math.max(0, Number(scene.startFrame));
    const originalEnd = Math.min(durationInFrames, Number(scene.endFrame));
    const leadFrames = cutLeadFramesFor(scene, scenes[index - 1], fps);
    const renderStartFrame = Math.max(0, originalStart - leadFrames);
    return {
      ...scene,
      originalStartFrame: originalStart,
      renderStartFrame,
      renderEndFrame: originalEnd,
      cutLeadFrames: originalStart - renderStartFrame
    };
  });

  const sceneById = new Map(renderedScenes.map((scene) => [String(scene.sceneId), scene]));
  const shotByTargetId = new Map(renderedScenes.map((scene) => [String(scene.shotId ?? scene.sceneId), scene]));

  const soundEffects = renderedScenes.flatMap((scene) =>
    (scene.soundEffects ?? [])
      .filter((sound) => sound.file)
      .map((sound) => ({ ...sound, sceneId: scene.sceneId }))
  );

  const soundStartFrame = (sound) => {
    const preRollFrames = secondsToFrames(EDIT_TIMING_STYLE.sfxPreRollSeconds, fps);
    const targetId = String(sound.targetId ?? '').trim();

    // Interne Bildwechsel: der Sound startet kurz vor dem bereits vorgezogenen Cut.
    if (targetId) {
      const target = shotByTargetId.get(targetId);
      if (target) return clamp(target.renderStartFrame - preRollFrames, 0, durationInFrames - 1);
    }

    const plannedFrame = clamp(Math.round(Number(sound.timeSeconds) * fps), 0, durationInFrames - 1);
    const owner = sceneById.get(String(sound.sceneId));
    if (!owner) return plannedFrame;

    // Ein SFX, der laut Plan direkt am Szenenanfang liegt, ist der Wechsel-SFX. Er
    // wird ebenfalls leicht vor den sichtbaren Cut gelegt. Spätere Objekt-Sounds
    // behalten dagegen ihren individuell geplanten Zeitpunkt.
    const transitionWindowFrames = secondsToFrames(EDIT_TIMING_STYLE.transitionSoundWindowSeconds, fps);
    if (plannedFrame - owner.originalStartFrame <= transitionWindowFrames) {
      return clamp(owner.renderStartFrame - preRollFrames, 0, durationInFrames - 1);
    }

    return plannedFrame;
  };

  return (
    <AbsoluteFill style={{ backgroundColor: '#000' }}>
      {renderedScenes.map((scene, index) => {
        const from = scene.renderStartFrame;
        const end = scene.renderEndFrame;
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
        const from = soundStartFrame(sound);
        return (
          <Sequence key={sound.id ?? `${sound.sceneId}-${from}`} from={from}>
            <Audio src={assetUrl(sound.file)} volume={Number(sound.volume) || 0.22} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
