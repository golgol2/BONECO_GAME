import {
  describe,
  expect,
  it,
} from "vitest";

import {
  decideEnemyAi,
  type EnemyDefinition,
} from "../src";

const ENEMY: EnemyDefinition = {
  id: "enemy",
  version: 1,
  displayName: "Enemy",
  maxHealth: 100,
  bodyWidth: 64,
  bodyHeight: 70,
  moveSpeed: 100,
  detectionRadius: 300,
  stopDistance: 50,
  attackRange: 60,
  attackDepthRange: 40,
  attackDamage: 10,
  attackCooldownSeconds: 1,
};

describe("decideEnemyAi", () => {
  it("fica idle fora do raio", () => {
    const result = decideEnemyAi({
      enemyX: 0,
      enemyY: 0,
      playerX: 500,
      playerY: 0,
      hurt: false,
      dead: false,
      definition: ENEMY,
    });

    expect(result.state).toBe("idle");
    expect(result.moveX).toBe(0);
  });

  it("persegue dentro do raio", () => {
    const result = decideEnemyAi({
      enemyX: 0,
      enemyY: 0,
      playerX: 100,
      playerY: 0,
      hurt: false,
      dead: false,
      definition: ENEMY,
    });

    expect(result.state).toBe("chase");
    expect(result.moveX).toBeCloseTo(1);
    expect(result.moveY).toBeCloseTo(0);
  });

  it("para próximo do jogador", () => {
    const result = decideEnemyAi({
      enemyX: 0,
      enemyY: 0,
      playerX: 30,
      playerY: 0,
      hurt: false,
      dead: false,
      definition: ENEMY,
    });

    expect(result.state).toBe("idle");
  });

  it("hurt tem prioridade", () => {
    const result = decideEnemyAi({
      enemyX: 0,
      enemyY: 0,
      playerX: 100,
      playerY: 0,
      hurt: true,
      dead: false,
      definition: ENEMY,
    });

    expect(result.state).toBe("hurt");
  });

  it("dead tem prioridade máxima", () => {
    const result = decideEnemyAi({
      enemyX: 0,
      enemyY: 0,
      playerX: 100,
      playerY: 0,
      hurt: true,
      dead: true,
      definition: ENEMY,
    });

    expect(result.state).toBe("dead");
  });
});
