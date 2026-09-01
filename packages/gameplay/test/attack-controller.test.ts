import { describe, expect, it } from "vitest";

import { AttackController } from "../src";

const createAttack = () =>
  new AttackController({
    windupSeconds: 0.1,
    activeSeconds: 0.2,
    recoverySeconds: 0.3,
  });

describe("AttackController", () => {
  it("inicia no estado idle", () => {
    const attack = createAttack();

    expect(attack.phase).toBe("idle");
    expect(attack.attacking).toBe(false);
    expect(attack.hitboxActive).toBe(false);
  });

  it("percorre windup active recovery idle", () => {
    const attack = createAttack();

    expect(attack.tryStart()).toBe(true);
    expect(attack.phase).toBe("windup");

    attack.update(0.1);
    expect(attack.phase).toBe("active");
    expect(attack.hitboxActive).toBe(true);

    attack.update(0.2);
    expect(attack.phase).toBe("recovery");
    expect(attack.hitboxActive).toBe(false);

    attack.update(0.3);
    expect(attack.phase).toBe("idle");
    expect(attack.attacking).toBe(false);
  });

  it("não reinicia durante um ataque ativo", () => {
    const attack = createAttack();

    expect(attack.tryStart()).toBe(true);
    expect(attack.tryStart()).toBe(false);
  });

  it("consome delta maior atravessando fases", () => {
    const attack = createAttack();

    attack.tryStart();
    attack.update(0.6);

    expect(attack.phase).toBe("idle");
  });

  it("ativa hitbox somente na janela active", () => {
    const attack = createAttack();

    attack.tryStart();

    expect(attack.hitboxActive).toBe(false);

    attack.update(0.1);
    expect(attack.hitboxActive).toBe(true);

    attack.update(0.2);
    expect(attack.hitboxActive).toBe(false);
  });
});
