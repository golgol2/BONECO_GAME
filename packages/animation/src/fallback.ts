import {
  createDefaultSockets,
} from "./sockets";

import type {
  AnimationClipDefinition,
  AnimationState,
} from "./types";

export function createStaticFallbackClip(
  id: string,
  state: AnimationState,
): AnimationClipDefinition {
  return {
    id,
    state,
    loop: true,
    frames: [
      {
        id: `${id}_frame_0`,
        durationMs: 1000,
        sockets: createDefaultSockets(),
      },
    ],
  };
}
