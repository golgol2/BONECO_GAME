import {
  clampFrame,
} from "./animation-timeline";

import type {
  AnimationEditorKind,
} from "./animation-editor-model";

export interface AnimationMarkers {
  loopStart: number;
  loopEnd: number;
  holdStart: number;
  holdEnd: number;
}

export function createDefaultMarkers(
  kind: AnimationEditorKind,
  frameCount: number,
): AnimationMarkers {
  const lastFrame =
    Math.max(
      0,
      frameCount - 1,
    );

  if (kind === "segmented") {
    return {
      loopStart: 0,
      loopEnd: lastFrame,
      holdStart:
        clampFrame(
          Math.round(
            lastFrame * 0.34,
          ),
          frameCount,
        ),
      holdEnd:
        clampFrame(
          Math.round(
            lastFrame * 0.82,
          ),
          frameCount,
        ),
    };
  }

  return {
    loopStart: 0,
    loopEnd: lastFrame,
    holdStart: 0,
    holdEnd: lastFrame,
  };
}

export function normalizeLoopRange(
  start: number,
  end: number,
  frameCount: number,
): {
  start: number;
  end: number;
} {
  const safeStart =
    clampFrame(
      start,
      frameCount,
    );

  const safeEnd =
    clampFrame(
      end,
      frameCount,
    );

  if (
    safeStart <=
    safeEnd
  ) {
    return {
      start:
        safeStart,
      end:
        safeEnd,
    };
  }

  return {
    start:
      safeEnd,
    end:
      safeStart,
  };
}

export function getActiveLoopRange(
  kind: AnimationEditorKind,
  markers: AnimationMarkers,
  frameCount: number,
): {
  start: number;
  end: number;
} {
  if (
    kind ===
    "segmented"
  ) {
    return normalizeLoopRange(
      markers.holdStart,
      markers.holdEnd,
      frameCount,
    );
  }

  return normalizeLoopRange(
    markers.loopStart,
    markers.loopEnd,
    frameCount,
  );
}
