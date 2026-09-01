// @vitest-environment jsdom

import {
  describe,
  expect,
  it,
} from "vitest";
import {
  Container,
} from "pixi.js";

import {
  EnemySystem,
} from "./enemy-system";

describe("EnemySystem", () => {
  it("cria inimigos a partir de spawns", () => {
    const layer = new Container();

    const system = new EnemySystem({
      spawns: [
        {
          id: "enemy_01",
          enemyId: "training_dummy",
          x: 100,
          y: 100,
        },
        {
          id: "enemy_02",
          enemyId: "training_dummy",
          x: 200,
          y: 100,
        },
      ],
      layer,
      worldWidth: 1000,
      worldHeight: 1000,
      onEnemyAttack: () => undefined,
    });

    system.spawnAll();

    expect(system.count).toBe(2);
    expect(layer.children).toHaveLength(2);

    system.destroy();
  });

  it("ignora definição desconhecida", () => {
    const layer = new Container();

    const system = new EnemySystem({
      spawns: [
        {
          id: "unknown",
          enemyId: "does_not_exist",
          x: 0,
          y: 0,
        },
      ],
      layer,
      worldWidth: 1000,
      worldHeight: 1000,
      onEnemyAttack: () => undefined,
    });

    system.spawnAll();

    expect(system.count).toBe(0);
  });
});


it(
  "seleciona inimigo por ponto do mundo",
  () => {
    const layer =
      new Container();

    const system =
      new EnemySystem({
        spawns: [
          {
            id:
              "enemy_01",
            enemyId:
              "training_dummy",
            x: 200,
            y: 300,
          },
        ],
        layer,
        worldWidth:
          1000,
        worldHeight:
          1000,
        onEnemyAttack:
          () => undefined,
      });

    system.spawnAll();

    expect(
      system.hitTestWorld(
        200,
        270,
      ),
    ).toBe(
      "enemy_01",
    );

    expect(
      system.getEnemyTarget(
        "enemy_01",
      ),
    ).toMatchObject({
      id:
        "enemy_01",
      x: 200,
      y: 300,
      dead: false,
    });

    system.destroy();
  },
);

it("emite morte apenas uma vez", () => {
  const layer = new Container();

  let deaths = 0;

  const system = new EnemySystem({
    spawns: [
      {
        id: "enemy_01",
        enemyId: "training_dummy",
        x: 100,
        y: 100,
      },
    ],
    layer,
    worldWidth: 1000,
    worldHeight: 1000,
    onEnemyAttack: () => undefined,
    onEnemyDeath: () => {
      deaths += 1;
    },
  });

  system.spawnAll();

  system.resolvePlayerAttack(
    {
      x: 0,
      y: 170,
      facing: "right",
      dead: false,
      attackActive: true,
      attackSequence: 1,
    },
    200,
    0,
  );

  system.update(
    0.016,
    {
      x: 0,
      y: 170,
      facing: "right",
      dead: false,
      attackActive: false,
      attackSequence: 1,
    },
  );

  system.update(
    0.016,
    {
      x: 0,
      y: 170,
      facing: "right",
      dead: false,
      attackActive: false,
      attackSequence: 1,
    },
  );

  expect(deaths).toBe(1);

  system.destroy();
});
