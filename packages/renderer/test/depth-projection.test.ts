import {
  describe,
  expect,
  it,
} from "vitest";

import {
  depthRatio,
  depthScale,
} from "../src/depth-projection";

const CONFIG = {
  minY: 420,
  maxY: 610,
  farScale: 0.72,
  nearScale: 1.08,
};

describe("depth projection", () => {
  it("usa escala mínima no fundo", () => {
    expect(
      depthScale(
        420,
        CONFIG,
      ),
    ).toBeCloseTo(0.72);
  });

  it("usa escala máxima na frente", () => {
    expect(
      depthScale(
        610,
        CONFIG,
      ),
    ).toBeCloseTo(1.08);
  });

  it("interpola no meio da profundidade", () => {
    expect(
      depthScale(
        515,
        CONFIG,
      ),
    ).toBeCloseTo(0.90);
  });

  it("limita valores fora da faixa", () => {
    expect(
      depthRatio(
        0,
        CONFIG,
      ),
    ).toBe(0);

    expect(
      depthRatio(
        999,
        CONFIG,
      ),
    ).toBe(1);
  });
});
