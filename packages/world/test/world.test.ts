import { describe, expect, it } from "vitest";

import {
  DEFAULT_WORLD,
  buildWorldCollisionData,
  ruinToObstacle,
  validateWorldDefinition,
} from "../src";

describe("world", () => {
  it("mapa padrão é válido", () => {
    expect(
      validateWorldDefinition(DEFAULT_WORLD),
    ).toEqual([]);
  });

  it("gera collider na base da ruína", () => {
    const obstacle = ruinToObstacle({
      id: "test",
      x: 100,
      y: 200,
      width: 300,
      height: 200,
      collisionDepthRatio: 0.25,
    });

    expect(obstacle).toEqual({
      x: 100,
      y: 350,
      width: 300,
      height: 50,
    });
  });

  it("não cria colisão para casas de background", () => {
    const collision =
      buildWorldCollisionData(DEFAULT_WORLD);

    expect(
      DEFAULT_WORLD.ruins.every(
        (ruin) =>
          ruin.collisionDepthRatio === 0,
      ),
    ).toBe(true);

    expect(
      collision.obstacles,
    ).toEqual([]);
  });

  it("detecta spawn inválido", () => {
    const invalid = {
      ...DEFAULT_WORLD,
      spawn: {
        x: -1,
        y: 100,
      },
    };

    expect(
      validateWorldDefinition(invalid),
    ).toContain(
      "spawn deve estar dentro do mundo",
    );
  });
});

describe("enemy spawns", () => {
  it("mapa padrão possui múltiplos inimigos", () => {
    expect(
      DEFAULT_WORLD.enemySpawns.length,
    ).toBeGreaterThan(1);
  });

  it("detecta enemy spawn fora do mundo", () => {
    const invalid = {
      ...DEFAULT_WORLD,
      enemySpawns: [
        {
          id: "invalid",
          enemyId: "training_dummy",
          x: -10,
          y: 50,
        },
      ],
    };

    expect(
      validateWorldDefinition(invalid),
    ).toContain(
      "enemy spawn invalid fora do mundo",
    );
  });
});
