import {
  describe,
  expect,
  it,
} from "vitest";

import {
  ClickMoveController,
} from "./click-move-controller";

describe(
  "ClickMoveController",
  () => {
    it(
      "move em apenas um eixo por vez",
      () => {
        const controller =
          new ClickMoveController();

        controller.moveTo(
          {
            x: 300,
            y: 200,
          },
          {
            x: 100,
            y: 100,
          },
        );

        const result =
          controller.update({
            player: {
              x: 100,
              y: 100,
            },
          });

        expect(
          Math.abs(
            result.movement.x,
          ) +
          Math.abs(
            result.movement.y,
          ),
        ).toBe(1);

        expect(
          result.movement,
        ).toEqual({
          x: 1,
          y: 0,
        });
      },
    );

    it(
      "vira para segundo eixo ao chegar no primeiro",
      () => {
        const controller =
          new ClickMoveController();

        controller.moveTo(
          {
            x: 300,
            y: 200,
          },
          {
            x: 100,
            y: 100,
          },
        );

        const result =
          controller.update({
            player: {
              x: 300,
              y: 100,
            },
          });

        expect(
          result.movement,
        ).toEqual({
          x: 0,
          y: 1,
        });
      },
    );

    it(
      "alinha inimigo antes de atacar",
      () => {
        const controller =
          new ClickMoveController(
            6,
            92,
            26,
          );

        controller.attackEnemy(
          "enemy_01",
        );

        const result =
          controller.update({
            player: {
              x: 100,
              y: 100,
            },
            targetEnemy: {
              id:
                "enemy_01",
              x: 180,
              y: 160,
              dead: false,
            },
          });

        expect(
          result.attackRequested,
        ).toBe(false);

        expect(
          result.movement,
        ).toEqual({
          x: 0,
          y: 1,
        });
      },
    );

    it(
      "ataca quando alinhado e no alcance",
      () => {
        const controller =
          new ClickMoveController(
            6,
            92,
            26,
          );

        controller.attackEnemy(
          "enemy_01",
        );

        const result =
          controller.update({
            player: {
              x: 100,
              y: 100,
            },
            targetEnemy: {
              id:
                "enemy_01",
              x: 180,
              y: 110,
              dead: false,
            },
          });

        expect(
          result.movement,
        ).toEqual({
          x: 0,
          y: 0,
        });

        expect(
          result.attackRequested,
        ).toBe(true);

        expect(
          result.facing,
        ).toBe(
          "right",
        );
      },
    );

    it(
      "cancela alvo morto",
      () => {
        const controller =
          new ClickMoveController();

        controller.attackEnemy(
          "enemy_01",
        );

        const result =
          controller.update({
            player: {
              x: 100,
              y: 100,
            },
            targetEnemy: {
              id:
                "enemy_01",
              x: 150,
              y: 100,
              dead: true,
            },
          });

        expect(
          result.attackRequested,
        ).toBe(false);

        expect(
          controller.active,
        ).toBe(false);
      },
    );
  },
);
