import {
  describe,
  expect,
  it,
} from "vitest";

import {
  PlayerController,
} from "./player-controller";

function createPlayer():
  PlayerController {
  return new PlayerController({
    spawnX: 500,
    spawnY: 500,
    speed: 100,
    jumpVelocity: 100,
    gravity: 200,
    footColliderRadius: 12,
    worldWidth: 1000,
    worldHeight: 1000,
    obstacles: [],
  });
}

describe(
  "PlayerController jump",
  () => {
    it(
      "inicia salto sem alterar Y lógico",
      () => {
        const player =
          createPlayer();

        player.update(
          0.1,
          {
            x: 0,
            y: 0,
          },
          false,
          false,
          true,
        );

        expect(
          player.z,
        ).toBeGreaterThan(0);

        expect(
          player.transform.current.y,
        ).toBe(500);

        expect(
          player.animation.state,
        ).toBe("jump");
      },
    );

    it(
      "retorna ao solo",
      () => {
        const player =
          createPlayer();

        player.update(
          0.01,
          {
            x: 0,
            y: 0,
          },
          false,
          false,
          true,
        );

        for (
          let index = 0;
          index < 150;
          index += 1
        ) {
          player.update(
            0.01,
            {
              x: 0,
              y: 0,
            },
            false,
          );
        }

        expect(
          player.z,
        ).toBe(0);

        expect(
          player.airborne,
        ).toBe(false);

        expect(
          player.animation.state,
        ).toBe("idle");
      },
    );

    it(
      "mantém movimento horizontal no ar",
      () => {
        const player =
          createPlayer();

        player.update(
          0.1,
          {
            x: 1,
            y: 0,
          },
          false,
          false,
          true,
        );

        expect(
          player.transform.current.x,
        ).toBe(510);

        expect(
          player.z,
        ).toBeGreaterThan(0);

        expect(
          player.facing,
        ).toBe("right");
      },
    );
  },
);
