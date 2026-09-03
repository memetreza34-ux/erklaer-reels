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

// Render-Fallback für bestehende Pläne: Die zentrale Library bleibt unter
// config/sound-library.json maßgeblich; diese Dateizuordnung muss per Test synchron
// gehalten werden. Neu gebaute Timelines tragen weiterhin den aufgelösten `file`-Pfad.
const SOUND_FILES_BY_TYPE = Object.freeze({
  'soft-whoosh': 'soft-whoosh.mp3',
  pop: 'pop.mp3',
  click: 'click.mp3',
  tick: 'tick.mp3',
  'soft-impact': 'soft-impact.mp3',
  paper: 'paper.mp3',
  'swoosh-reveal': 'swoosh-reveal.mp3',
  door: 'door.mp3',
  coin: 'coin.mp3',
  'water-drop': 'water-drop.mp3',
  'whoosh-up': 'whoosh-up.mp3',
  'whoosh-down': 'whoosh-down.mp3',
  'soft-swipe': 'soft-swipe.mp3'
});

const MOTION_ALIASES = Object.freeze({
  'gentle-pan': 'ken-burns',
  'gentle-push-in': 'subtle-push-in',
  'medium-push-in': 'slow-zoom-in',
  'close-up-push-in': 'subtle-push-in',
  'slow-push-in': 'slow-zoom-in',
  'push-in': 'subtle-push-in',
  'pull-out': 'subtle-pull-out'
});

const resolveSoundFile = (sound = {}) => {
  if (sound.file) return sound.file;
  const fileName = SOUND_FILES_BY_TYPE[String(sound.type ?? '').trim()];
  return fileName ? `sfx/${fileName}` : null;
};

const canonicalMotionType = (type) => {
  const raw = String(type ?? '').trim();
  return MOTION_ALIASES[raw] ?? raw;
};

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

// Bewegung ist für neue Reels kein optionaler Schmuck mehr. Selbst wenn ein alter
// oder unvollständiger Render-Plan `none` liefert, bekommt jeder Bildmoment einen
// sichtbaren, aber dezenten Fallback. Die Hard-Gates blockieren solche Pläne vorher;
// dieser Runtime-Fallback verhindert zusätzlich statische Ausreißer im Render.
const automaticMotion = (scene = {}) => {
  const incoming = scene.cameraMotion ?? {};
  const type = canonicalMotionType(incoming.type);
  if (type && type !== 'none') return { ...incoming, type };

  const phaseOrder = Number(scene.phaseOrder ?? 1);
  const sceneOrder = Number(scene.parentSceneOrder ?? 1);
  const pullOut = (sceneOrder + phaseOrder) % 2 === 0;
  return pullOut
    ? { type: 'subtle-pull-out', startScale: 1.04, endScale: 1, easing: 'ease-in-out' }
    : { type: 'subtle-push-in', startScale: 1, endScale: 1.04, easing: 'ease-in-out' };
};

const motionDefaults = (motion = {}) => {
  const type = canonicalMotionType(motion.type) || 'subtle-push-in';
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
    'ken-burns': [1.02, 1.06]
  };
  const [defaultStart, defaultEnd] = defaults[type] ?? defaults['subtle-push-in'];
  const kenBurnsPan = type === 'ken-burns' ? 1.5 : 0;
  const defaultPanX = type === 'pan-left' ? -2 : type === 'pan-right' ? 2 : kenBurnsPan;
  const defaultPanY = type === 'pan-up' ? -2 : type === 'pan-down' ? 2 : 0;
  return {
    type,
    easing: easingFor(motion.easing),
    startScale: Number.isFinite(Number(motion.startScale)) ? Number(motion.startScale) : defaultStart,
    endScale: Number.isFinite(Number(motion.endScale)) ? Number(motion.endScale) : defaultEnd,
    startPanXPercent: Number.isFinite(Number(motion.startPanXPercent)) ? Number(motion.startPanXPercent) : (type === 'ken-burns' ? -kenBurnsPan : 0),
    startPanYPercent: Number.isFinite(Number(motion.startPanYPercent)) ? Number(motion.startPanYPercent) : 0,
    endPanXPercent: Number.isFinite(Number(motion.panXPercent)) ? Number(motion.panXPercent) : defaultPanX,
    endPanYPercent: Number.isFinite(Number(motion.panYPercent)) ? Number(motion.panYPercent) : defaultPanY
  };
};

const SceneLayer = ({ scene }) => {
  const frame = useCurrentFrame();
  const duration = Math.max(1, Number(scene.renderEndFrame ?? scene.endFrame) - Number(scene.renderStartFrame ?? scene.startFrame));
  const motion = motionDefaults(automaticMotion(scene));

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
      .map((sound) => ({ ...sound, file: resolveSoundFile(sound), sceneId: scene.sceneId }))
      .filter((sound) => sound.file)
  );

  const soundStartFrame = (sound) => {
    const preRollFrames = secondsToFrames(EDIT_TIMING_STYLE.sfxPreRollSeconds, fps);
    const targetId = String(sound.targetId ?? '').trim();

    if (targetId) {
      const target = shotByTargetId.get(targetId);
      if (target) return clamp(target.renderStartFrame - preRollFrames, 0, durationInFrames - 1);
    }

    const plannedFrame = clamp(Math.round(Number(sound.timeSeconds) * fps), 0, durationInFrames - 1);
    const owner = sceneById.get(String(sound.sceneId));
    if (!owner) return plannedFrame;

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
