import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DEFAULT_WORLD,
  validateWorldDefinition,
} from "../src";

describe("world lighting", () => {
  it("possui luz do jogador", () => {
    expect(
      DEFAULT_WORLD.lighting
        .playerLight.radius,
    ).toBeGreaterThan(0);
  });

  it("possui poste iluminado", () => {
    const lamp =
      DEFAULT_WORLD.lighting
        .lights[0];

    expect(
      lamp?.id,
    ).toBe("lamp_post_01");

    expect(
      lamp?.revealOffsetY,
    ).toBe(130);

    expect(
      lamp?.revealScaleY,
    ).toBe(1.7);
  });

  it("mundo continua válido", () => {
    expect(
      validateWorldDefinition(
        DEFAULT_WORLD,
      ),
    ).toEqual([]);
  });
});
