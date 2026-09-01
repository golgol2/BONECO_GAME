import {
  describe,
  expect,
  it,
} from "vitest";

import {
  ambientTintFromDarkness,
  flickerIntensity,
  isLightVisibleHorizontally,
} from "./lighting-model";

describe("lighting model", () => {
  it("converte escuridão em tint", () => {
    expect(
      ambientTintFromDarkness(0),
    ).toBe(0xffffff);

    expect(
      ambientTintFromDarkness(1),
    ).toBe(0x000000);
  });

  it("mantém flicker dentro de 0..1", () => {
    for (
      let index = 0;
      index < 20;
      index += 1
    ) {
      const value =
        flickerIntensity(
          0.9,
          0.2,
          index * 0.1,
          7,
        );

      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThanOrEqual(1);
    }
  });

  it("faz culling horizontal", () => {
    expect(
      isLightVisibleHorizontally(
        500,
        100,
        0,
        1280,
      ),
    ).toBe(true);

    expect(
      isLightVisibleHorizontally(
        2000,
        100,
        0,
        1280,
      ),
    ).toBe(false);
  });
});
