import { describe, expect, it } from "vitest";

import {
  DamageReceiver,
  Health,
} from "../src";

describe("DamageReceiver", () => {
  it("aplica dano e ativa invulnerabilidade", () => {
    const receiver =
      new DamageReceiver(new Health(100));

    const result = receiver.receive({
      amount: 25,
      knockback: {
        x: 40,
        y: 0,
      },
      invulnerabilitySeconds: 0.3,
    });

    expect(result).toEqual({
      accepted: true,
      appliedDamage: 25,
      killed: false,
      knockback: {
        x: 40,
        y: 0,
      },
    });

    expect(receiver.health.current).toBe(75);
    expect(receiver.invulnerable).toBe(true);
  });

  it("ignora dano durante invulnerabilidade", () => {
    const receiver =
      new DamageReceiver(new Health(100));

    receiver.receive({
      amount: 20,
      knockback: {
        x: 10,
        y: 0,
      },
      invulnerabilitySeconds: 0.2,
    });

    const blocked = receiver.receive({
      amount: 20,
      knockback: {
        x: 10,
        y: 0,
      },
      invulnerabilitySeconds: 0.2,
    });

    expect(blocked.accepted).toBe(false);
    expect(receiver.health.current).toBe(80);

    receiver.update(0.2);

    const accepted = receiver.receive({
      amount: 20,
      knockback: {
        x: 10,
        y: 0,
      },
      invulnerabilitySeconds: 0.2,
    });

    expect(accepted.accepted).toBe(true);
    expect(receiver.health.current).toBe(60);
  });

  it("marca morte ao zerar vida", () => {
    const receiver =
      new DamageReceiver(new Health(20));

    const result = receiver.receive({
      amount: 50,
      knockback: {
        x: 0,
        y: 0,
      },
      invulnerabilitySeconds: 0,
    });

    expect(result.killed).toBe(true);
    expect(receiver.health.dead).toBe(true);
  });
});
