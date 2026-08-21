import React from 'react';
import { Composition } from 'remotion';
import { ReelComposition } from './ReelComposition.jsx';

const fallbackPlan = {
  composition: {
    width: 1080,
    height: 1920,
    fps: 30,
    durationFrames: 1,
    durationSeconds: 1 / 30
  },
  voiceover: { file: null, volume: 1 },
  scenes: []
};

const youtubeFallbackPlan = {
  composition: {
    width: 1920,
    height: 1080,
    fps: 30,
    durationFrames: 1,
    durationSeconds: 1 / 30
  },
  voiceover: { file: null, volume: 1 },
  subtitles: [],
  scenes: []
};

const metadata = (fallback) => ({ props }) => {
  const composition = props?.plan?.composition ?? fallback.composition;
  return {
    width: Number(composition.width) || fallback.composition.width,
    height: Number(composition.height) || fallback.composition.height,
    fps: Number(composition.fps) || fallback.composition.fps,
    durationInFrames: Math.max(1, Number(composition.durationFrames) || 1),
    props
  };
};

export const RemotionRoot = () => (
  <>
    <Composition
      id="ErklaerReel"
      component={ReelComposition}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={1}
      defaultProps={{ plan: fallbackPlan }}
      calculateMetadata={metadata(fallbackPlan)}
    />
    <Composition
      id="YoutubeExplainer"
      component={ReelComposition}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={1}
      defaultProps={{ plan: youtubeFallbackPlan }}
      calculateMetadata={metadata(youtubeFallbackPlan)}
    />
  </>
);
