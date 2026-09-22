import React from 'react';
import { AbsoluteFill, Audio, Img, Sequence, interpolate, staticFile, useCurrentFrame } from 'remotion';

const FPS = 30;

function Shot({ image, index, durationInFrames }) {
  const frame = useCurrentFrame();
  const progress = durationInFrames <= 1 ? 0 : frame / (durationInFrames - 1);
  const mode = index % 4;
  const scale = mode === 1
    ? interpolate(progress, [0, 1], [1.055, 1.015], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })
    : interpolate(progress, [0, 1], [1.015, 1.055], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const x = mode === 2 ? interpolate(progress, [0, 1], [-14, 14]) : mode === 3 ? interpolate(progress, [0, 1], [14, -14]) : 0;
  const y = mode === 0 ? interpolate(progress, [0, 1], [7, -7]) : 0;

  return (
    <AbsoluteFill style={{ backgroundColor: '#111', overflow: 'hidden' }}>
      <Img
        src={staticFile(image.file)}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          transform: `translate3d(${x}px, ${y}px, 0) scale(${scale})`,
          transformOrigin: 'center center'
        }}
      />
    </AbsoluteFill>
  );
}

export function YouTubeComposition({ plan }) {
  return (
    <AbsoluteFill style={{ backgroundColor: '#111' }}>
      <Audio src={staticFile(plan.audioFile)} />
      {plan.images.map((image, index) => {
        const from = Math.max(0, Math.round(image.startSeconds * FPS));
        const end = Math.max(from + 1, Math.round(image.endSeconds * FPS));
        const durationInFrames = end - from;
        return (
          <Sequence key={image.imageNumber} from={from} durationInFrames={durationInFrames} premountFor={FPS}>
            <Shot image={image} index={index} durationInFrames={durationInFrames} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
}
