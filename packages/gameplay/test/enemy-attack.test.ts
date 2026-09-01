import {
  describe,
  expect,
  it,
} from "vitest";

import {
  EnemyAttackController,
} from "../src";

describe("EnemyAttackController", () => {
  it("ataca quando pronto e dentro do alcance", () => {
    const attack =
      new EnemyAttackController(1);

    expect(
      attack.tryAttack(50, 60),
    ).toBe(true);

    expect(attack.ready).toBe(false);
  });

  it("não ataca fora do alcance", () => {
    const attack =
      new EnemyAttackController(1);

    expect(
      attack.tryAttack(100, 60),
    ).toBe(false);

    expect(attack.ready).toBe(true);
  });

  it("respeita cooldown", () => {
    const attack =
      new EnemyAttackController(1);

    expect(
      attack.tryAttack(50, 60),
    ).toBe(true);

    expect(
      attack.tryAttack(50, 60),
    ).toBe(false);

    attack.update(1);

    expect(
      attack.tryAttack(50, 60),
    ).toBe(true);
  });
});
