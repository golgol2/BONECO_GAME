import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DEFAULT_WORLD,
} from "@boneco/world";

import {
  PLAYER_REFERENCE_HEIGHT,
  PLAYER_TO_DOOR_RATIO,
  getCodeHouseDoorHeight,
  getPlayerBaseScaleFromDoor,
} from "./world-visual-metrics";

describe(
  "world visual proportions",
  () => {
    it("personagem fica menor que a porta no plano da casa", () => {
      const house =
        DEFAULT_WORLD.ruins[0];

      if (!house) {
        throw new Error(
          "Casa de referência ausente",
        );
      }

      const doorHeight =
        getCodeHouseDoorHeight(
          house,
        );

      const baseScale =
        getPlayerBaseScaleFromDoor(
          house,
          DEFAULT_WORLD.playfield.farScale,
        );

      const renderedPlayerHeight =
        PLAYER_REFERENCE_HEIGHT *
        DEFAULT_WORLD.playfield.farScale *
        baseScale;

      expect(
        renderedPlayerHeight,
      ).toBeCloseTo(
        doorHeight *
          PLAYER_TO_DOOR_RATIO,
      );

      expect(
        renderedPlayerHeight,
      ).toBeLessThan(
        doorHeight,
      );
    });

    it("porta da primeira casa possui altura esperada", () => {
      const house =
        DEFAULT_WORLD.ruins[0];

      if (!house) {
        throw new Error(
          "Casa de referência ausente",
        );
      }

      expect(
        getCodeHouseDoorHeight(
          house,
        ),
      ).toBeCloseTo(
        135.45,
      );
    });
  },
);
