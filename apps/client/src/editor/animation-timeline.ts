export function clampFrame(
  frame: number,
  frameCount: number,
): number {
  const lastFrame =
    Math.max(
      0,
      frameCount - 1,
    );

  return Math.max(
    0,
    Math.min(
      lastFrame,
      Math.round(frame),
    ),
  );
}

export function frameToTime(
  frame: number,
  fps: number,
): number {
  if (fps <= 0) {
    return 0;
  }

  return (
    Math.max(
      0,
      frame,
    ) / fps
  );
}

export function timeToFrame(
  timeSeconds: number,
  fps: number,
  frameCount: number,
): number {
  if (fps <= 0) {
    return 0;
  }

  return clampFrame(
    Math.floor(
      Math.max(
        0,
        timeSeconds,
      ) * fps,
    ),
    frameCount,
  );
}

export function frameProgress(
  frame: number,
  frameCount: number,
): number {
  if (frameCount <= 1) {
    return 0;
  }

  return (
    clampFrame(
      frame,
      frameCount,
    ) /
    (frameCount - 1)
  );
}
