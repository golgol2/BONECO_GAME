import {
  describe,
  expect,
  it,
} from "vitest";

import {
  EnemyInstance,
  validateEnemyDefinition,
  type EnemyDefinition,
} from "../src";

const ENEMY: EnemyDefinition = {
  id: "dummy",
  version: 1,
  displayName: "Dummy",
  maxHealth: 100,
  bodyWidth: 64,
  bodyHeight: 70,
  moveSpeed: 90,
  detectionRadius: 420,
  stopDistance: 85,
  attackRange: 95,
  attackDepthRange: 42,
  attackDamage: 12,
  attackCooldownSeconds: 0.8,
};

describe("EnemyDefinition", () => {
  it("valida definição correta", () => {
    expect(
      validateEnemyDefinition(ENEMY),
    ).toEqual([]);
  });

  it("detecta vida inválida", () => {
    expect(
      validateEnemyDefinition({
        ...ENEMY,
        maxHealth: 0,
      }),
    ).toContain(
      "enemy.maxHealth deve ser > 0",
    );
  });
});

describe("EnemyInstance", () => {
  it("cria runtime com vida cheia", () => {
    const enemy =
      new EnemyInstance(
        ENEMY,
        100,
        200,
      );

    expect(enemy.x).toBe(100);
    expect(enemy.y).toBe(200);
    expect(enemy.health.current).toBe(100);
    expect(enemy.dead).toBe(false);
  });

  it("aplica knockback e amortecimento", () => {
    const enemy =
      new EnemyInstance(
        ENEMY,
        100,
        200,
      );

    enemy.applyKnockback(100, 0);
    enemy.update(0.1);

    expect(enemy.x).toBe(110);
    expect(enemy.velocityX).toBe(0);
  });

  it("morre ao zerar vida", () => {
    const enemy =
      new EnemyInstance(
        ENEMY,
        0,
        0,
      );

    enemy.damageReceiver.receive({
      amount: 100,
      knockback: {
        x: 0,
        y: 0,
      },
      invulnerabilitySeconds: 0,
    });

    expect(enemy.dead).toBe(true);
  });
});

describe("enemy registry", () => {
  it("resolve training_dummy por ID", async () => {
    const {
      getEnemyDefinition,
    } = await import("../src");

    expect(
      getEnemyDefinition("training_dummy")?.id,
    ).toBe("training_dummy");
  });

  it("retorna undefined para ID desconhecido", async () => {
    const {
      getEnemyDefinition,
    } = await import("../src");

    expect(
      getEnemyDefinition("unknown_enemy"),
    ).toBeUndefined();
  });
});
