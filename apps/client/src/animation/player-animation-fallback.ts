import {
  createDefaultSockets,
  type AnimationFrameDefinition,
  type AnimationState,
  type FrameSockets,
} from "@boneco/animation";

import type {
  FacingDirection,
} from "@boneco/shared";

function createDirectionalSockets(
  facing: FacingDirection,
): FrameSockets {
  const sockets =
    createDefaultSockets();

  switch (facing) {
    case "right":
      sockets.HAND_R = {
        x: 18,
        y: -85,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
      };
      break;

    case "left":
      sockets.HAND_R = {
        x: -18,
        y: -85,
        rotation: 0,
        scaleX: -1,
        scaleY: 1,
      };
      break;

    case "up":
      sockets.HAND_R = {
        x: 5,
        y: -115,
        rotation: -Math.PI / 2,
        scaleX: 1,
        scaleY: 1,
      };
      break;

    case "down":
      sockets.HAND_R = {
        x: 5,
        y: -55,
        rotation: Math.PI / 2,
        scaleX: 1,
        scaleY: 1,
      };
      break;
  }

  sockets.WEAPON_GRIP = {
    ...sockets.HAND_R,
  };

  /*
   * Núcleo rosa do peito.
   * Será substituído pelo CORE real
   * de cada frame no editor.
   */
  sockets.CORE = {
    x: 0,
    y: -118,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
  };

  sockets.VFX_ORIGIN = {
    ...sockets.CORE,
  };

  return sockets;
}

export function createPlayerFallbackFrame(
  state: AnimationState,
  facing: FacingDirection,
): AnimationFrameDefinition {
  return {
    id:
      `player_${state}_${facing}_frame_0`,
    durationMs: 1000,
    sockets:
      createDirectionalSockets(facing),
  };
}

export function getPlayerFallbackFrame(
  state: AnimationState,
  facing: FacingDirection,
): AnimationFrameDefinition {
  return createPlayerFallbackFrame(
    state,
    facing,
  );
}
