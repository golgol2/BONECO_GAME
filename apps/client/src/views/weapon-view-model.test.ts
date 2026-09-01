import {
  describe,
  expect,
  it,
} from "vitest";

import {
  ABYSS_BLADE,
} from "@boneco/gameplay";

import {
  resolveWeaponTransformFromSocket,
} from "./weapon-view-model";

describe(
  "resolveWeaponTransformFromSocket",
  () => {
    it("alinha grip ao socket da mão", () => {
      const handSocket = {
        x: 200,
        y: 300,
        rotation: 0.5,
        scaleX: 1,
        scaleY: 1,
      };

      const transform =
        resolveWeaponTransformFromSocket(
          ABYSS_BLADE,
          handSocket,
        );

      const gripX =
        transform.x +
        ABYSS_BLADE.sockets.grip.x *
        transform.scaleX;

      const gripY =
        transform.y +
        ABYSS_BLADE.sockets.grip.y *
        transform.scaleY;

      expect(gripX).toBe(
        handSocket.x,
      );

      expect(gripY).toBe(
        handSocket.y,
      );

      expect(
        transform.rotation,
      ).toBe(0.5);
    });

    it("preserva espelhamento do socket", () => {
      const transform =
        resolveWeaponTransformFromSocket(
          ABYSS_BLADE,
          {
            x: 100,
            y: 100,
            rotation: 0,
            scaleX: -1,
            scaleY: 1,
          },
        );

      expect(
        transform.scaleX,
      ).toBe(-1);
    });
  },
);
