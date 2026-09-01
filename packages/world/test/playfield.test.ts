import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DEFAULT_WORLD,
  buildWorldCollisionData,
  validateWorldDefinition,
} from "../src";

describe("2.5D playfield", () => {
  it("mundo padrão possui faixa de profundidade válida", () => {
    expect(
      DEFAULT_WORLD.playfield.minY,
    ).toBeLessThan(
      DEFAULT_WORLD.playfield.maxY,
    );

    expect(
      DEFAULT_WORLD.spawn.y,
    ).toBeGreaterThanOrEqual(
      DEFAULT_WORLD.playfield.minY,
    );

    expect(
      DEFAULT_WORLD.spawn.y,
    ).toBeLessThanOrEqual(
      DEFAULT_WORLD.playfield.maxY,
    );

    expect(
      validateWorldDefinition(
        DEFAULT_WORLD,
      ),
    ).toEqual([]);
  });

  it("casas de background não criam colisão", () => {
    expect(
      buildWorldCollisionData(
        DEFAULT_WORLD,
      ).obstacles,
    ).toEqual([]);
  });
});
