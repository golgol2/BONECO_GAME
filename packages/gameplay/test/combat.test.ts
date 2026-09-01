import { describe, expect, it } from "vitest";

import {
  AttackController,
  Health,
  createMeleeHitbox,
} from "../src";

describe("Health", () => {
  it("aplica dano e impede vida negativa", () => {
    const health = new Health(100);

    expect(health.damage(30)).toEqual({
      applied: 30,
      remaining: 70,
      killed: false,
    });

    expect(health.damage(100)).toEqual({
      applied: 70,
      remaining: 0,
      killed: true,
    });

    expect(health.current).toBe(0);
  });
});

describe("createMeleeHitbox", () => {
  it("cria golpe para direita", () => {
    expect(
      createMeleeHitbox(
        100,
        200,
        "right",
        {
          reach: 100,
          thickness: 40,
          offset: 20,
        },
      ),
    ).toEqual({
      x: 120,
      y: 180,
      width: 100,
      height: 40,
    });
  });

  it("cria golpe para esquerda", () => {
    expect(
      createMeleeHitbox(
        100,
        200,
        "left",
        {
          reach: 100,
          thickness: 40,
          offset: 20,
        },
      ),
    ).toEqual({
      x: -20,
      y: 180,
      width: 100,
      height: 40,
    });
  });
});

describe("AttackController sequence", () => {
  it("incrementa somente em novo ataque", () => {
    const attack = new AttackController({
      windupSeconds: 0.1,
      activeSeconds: 0.1,
      recoverySeconds: 0.1,
    });

    expect(attack.sequence).toBe(0);

    expect(attack.tryStart()).toBe(true);
    expect(attack.sequence).toBe(1);

    expect(attack.tryStart()).toBe(false);
    expect(attack.sequence).toBe(1);

    attack.update(0.3);

    expect(attack.tryStart()).toBe(true);
    expect(attack.sequence).toBe(2);
  });
});
