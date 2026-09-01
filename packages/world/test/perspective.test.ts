import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DEFAULT_WORLD,
  validateWorldDefinition,
} from "../src";

describe("world perspective", () => {
  it("possui escala menor no fundo", () => {
    expect(
      DEFAULT_WORLD.playfield.farScale,
    ).toBeLessThan(
      DEFAULT_WORLD.playfield.nearScale,
    );
  });

  it("casas possuem base no horizonte jogável", () => {
    expect(
      DEFAULT_WORLD.ruins.every(
        (ruin) =>
          ruin.baseY ===
          DEFAULT_WORLD.playfield.minY,
      ),
    ).toBe(true);
  });

  it("mundo continua válido", () => {
    expect(
      validateWorldDefinition(
        DEFAULT_WORLD,
      ),
    ).toEqual([]);
  });
});
