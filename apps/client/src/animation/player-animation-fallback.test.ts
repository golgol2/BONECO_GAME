import {
  describe,
  expect,
  it,
} from "vitest";

import {
  getPlayerFallbackFrame,
} from "./player-animation-fallback";

describe(
  "player animation fallback sockets",
  () => {
    it("fornece HAND_R por direção", () => {
      expect(
        getPlayerFallbackFrame(
          "idle",
          "right",
        ).sockets.HAND_R,
      ).toEqual({
        x: 18,
        y: -85,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
      });

      expect(
        getPlayerFallbackFrame(
          "idle",
          "left",
        ).sockets.HAND_R.scaleX,
      ).toBe(-1);
    });

    it("rotaciona HAND_R em up/down", () => {
      expect(
        getPlayerFallbackFrame(
          "idle",
          "up",
        ).sockets.HAND_R.rotation,
      ).toBe(
        -Math.PI / 2,
      );

      expect(
        getPlayerFallbackFrame(
          "idle",
          "down",
        ).sockets.HAND_R.rotation,
      ).toBe(
        Math.PI / 2,
      );
    });

    it("mantém WEAPON_GRIP alinhado ao HAND_R", () => {
      const frame =
        getPlayerFallbackFrame(
          "attack",
          "right",
        );

      expect(
        frame.sockets.WEAPON_GRIP,
      ).toEqual(
        frame.sockets.HAND_R,
      );
    });

    it("preserva estado no id do frame", () => {
      expect(
        getPlayerFallbackFrame(
          "hurt",
          "down",
        ).id,
      ).toBe(
        "player_hurt_down_frame_0",
      );
    });
  },
);


it("fornece CORE para iluminação", () => {
  const frame =
    getPlayerFallbackFrame(
      "idle",
      "down",
    );

  expect(
    frame.sockets.CORE,
  ).toEqual({
    x: 0,
    y: -118,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
  });

  expect(
    frame.sockets.VFX_ORIGIN,
  ).toEqual(
    frame.sockets.CORE,
  );
});
