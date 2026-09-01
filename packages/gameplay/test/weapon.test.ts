import { describe, expect, it } from "vitest";

import {
  WeaponInstance,
  resolveWeaponAttachment,
  validateWeaponDefinition,
  type WeaponDefinition,
} from "../src";

const TEST_WEAPON: WeaponDefinition = {
  id: "test_weapon",
  version: 1,
  displayName: "Test Weapon",
  assetId: "weapon.test",
  pivot: {
    x: 0,
    y: 0,
  },
  sockets: {
    grip: {
      x: 10,
      y: 5,
    },
    center: {
      x: 50,
      y: 5,
    },
    tip: {
      x: 100,
      y: 5,
    },
    vfxOrigin: {
      x: 100,
      y: 5,
    },
  },
  scale: {
    min: 0.5,
    max: 2,
    default: 1,
  },
  hitboxes: [
    {
      type: "box",
      x: 55,
      y: 5,
      width: 90,
      height: 12,
      rotation: 0,
    },
  ],
};

describe("WeaponDefinition", () => {
  it("aceita uma arma válida", () => {
    expect(
      validateWeaponDefinition(TEST_WEAPON),
    ).toEqual([]);
  });

  it("detecta escala padrão inválida", () => {
    const invalid: WeaponDefinition = {
      ...TEST_WEAPON,
      scale: {
        min: 0.5,
        max: 1,
        default: 2,
      },
    };

    expect(
      validateWeaponDefinition(invalid),
    ).toContain(
      "weapon.scale.default deve estar entre min e max",
    );
  });
});

describe("WeaponInstance", () => {
  it("limita escala ao intervalo permitido", () => {
    const weapon =
      new WeaponInstance(TEST_WEAPON);

    weapon.setScale(10);
    expect(weapon.scale).toBe(2);

    weapon.setScale(0.1);
    expect(weapon.scale).toBe(0.5);
  });
});

describe("resolveWeaponAttachment", () => {
  it("alinha grip da arma ao socket da mão", () => {
    const transform = resolveWeaponAttachment({
      handSocket: {
        x: 200,
        y: 300,
        rotation: 0.5,
        scaleX: 1,
        scaleY: 1,
      },
      weaponGrip: {
        x: 10,
        y: 5,
      },
      scale: 2,
    });

    expect(transform).toEqual({
      x: 180,
      y: 290,
      rotation: 0.5,
      scaleX: 2,
      scaleY: 2,
    });
  });

  it("preserva espelhamento do socket", () => {
    const transform = resolveWeaponAttachment({
      handSocket: {
        x: 100,
        y: 100,
        rotation: 0,
        scaleX: -1,
        scaleY: 1,
      },
      weaponGrip: {
        x: 10,
        y: 0,
      },
      scale: 1,
    });

    expect(transform.x).toBe(110);
    expect(transform.scaleX).toBe(-1);
  });
});
