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

export const RemotionRoot = () => (
  <Composition
    id="ErklaerReel"
    component={ReelComposition}
    width={1080}
    height={1920}
    fps={30}
    durationInFrames={1}
    defaultProps={{ plan: fallbackPlan }}
    calculateMetadata={({ props }) => {
      const composition = props?.plan?.composition ?? fallbackPlan.composition;
      return {
        width: Number(composition.width) || 1080,
        height: Number(composition.height) || 1920,
        fps: Number(composition.fps) || 30,
        durationInFrames: Math.max(1, Number(composition.durationFrames) || 1),
        props
      };
    }}
  />
);
