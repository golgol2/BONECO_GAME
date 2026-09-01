import { describe, expect, it } from "vitest";

import {
  AnimationStateMachine,
  SOCKET_NAMES,
  createDefaultSockets,
  createStaticFallbackClip,
  validateAnimationClip,
} from "../src";

describe("animation sockets", () => {
  it("cria todos os sockets mínimos", () => {
    const sockets = createDefaultSockets();

    expect(Object.keys(sockets)).toHaveLength(
      SOCKET_NAMES.length,
    );

    for (const name of SOCKET_NAMES) {
      expect(sockets[name]).toBeDefined();
    }
  });
});

describe("AnimationStateMachine", () => {
  it("inicia em idle", () => {
    const machine = new AnimationStateMachine();

    expect(machine.state).toBe("idle");
  });

  it("altera estado apenas quando necessário", () => {
    const machine = new AnimationStateMachine();

    expect(machine.setState("walk")).toBe(true);
    expect(machine.state).toBe("walk");
    expect(machine.setState("walk")).toBe(false);
  });
});

describe("animation validation", () => {
  it("fallback estático é válido", () => {
    const clip = createStaticFallbackClip(
      "player_idle",
      "idle",
    );

    expect(validateAnimationClip(clip)).toEqual([]);
  });

  it("detecta duração inválida", () => {
    const clip = createStaticFallbackClip(
      "player_idle",
      "idle",
    );

    const firstFrame = clip.frames[0];

    if (!firstFrame) {
      throw new Error(
        "fallback deveria possuir um frame",
      );
    }

    const invalid = {
      ...clip,
      frames: [
        {
          ...firstFrame,
          durationMs: 0,
        },
      ],
    };

    expect(validateAnimationClip(invalid)).toContain(
      "frame player_idle_frame_0 possui duração inválida",
    );
  });
});
