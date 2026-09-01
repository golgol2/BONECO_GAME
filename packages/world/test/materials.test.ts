import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DEFAULT_WORLD,
  validateWorldDefinition,
} from "../src";

describe(
  "world materials",
  () => {
    it("possui IDs de material", () => {
      expect(
        DEFAULT_WORLD.materials,
      ).toEqual({
        floor:
          "floor.dark_stone_01",
        wall:
          "wall.dark_plaster_01",
        roof:
          "roof.dark_shingle_01",
        door:
          "door.dark_door_01",
      });
    });

    it("continua válido", () => {
      expect(
        validateWorldDefinition(
          DEFAULT_WORLD,
        ),
      ).toEqual([]);
    });
  },
);
