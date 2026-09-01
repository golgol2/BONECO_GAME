import {
  describe,
  expect,
  it,
} from "vitest";

import {
  PlayerController,
} from "./player-controller";

describe(
  "PlayerController depth band",
  () => {
    it("limita movimento à profundidade do playfield", () => {
      const player =
        new PlayerController({
          spawnX: 300,
          spawnY: 500,
          speed: 300,
          footColliderRadius: 12,
          worldWidth: 2000,
          worldHeight: 720,
          playfieldMinY: 420,
          playfieldMaxY: 610,
          obstacles: [],
        });

      player.update(
        1,
        {
          x: 0,
          y: -1,
        },
        false,
      );

      expect(
        player.transform.current.y,
      ).toBe(420);

      player.update(
        1,
        {
          x: 0,
          y: 1,
        },
        false,
      );

      expect(
        player.transform.current.y,
      ).toBe(610);
    });
  },
);
