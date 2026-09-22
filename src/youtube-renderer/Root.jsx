import React from 'react';
import { Composition } from 'remotion';
import { YouTubeComposition } from './YouTubeComposition.jsx';

export function RemotionRoot() {
  return (
    <Composition
      id="ErklaerYouTube"
      component={YouTubeComposition}
      width={1920}
      height={1080}
      fps={30}
      durationInFrames={300}
      defaultProps={{ plan: { durationSeconds: 10, audioFile: '', images: [] } }}
      calculateMetadata={({ props }) => ({
        durationInFrames: Math.max(1, Math.ceil(Number(props.plan?.durationSeconds ?? 10) * 30)),
        width: 1920,
        height: 1080,
        fps: 30
      })}
    />
  );
}
