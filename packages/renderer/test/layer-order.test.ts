import { describe, expect, it } from "vitest";

import {
  UI_LAYER_ORDER,
  WORLD_LAYER_ORDER,
  ySortValue,
} from "../src/layer-order";

describe("renderer layer order", () => {
  it("mantém layers em ordem crescente", () => {
    expect(
      WORLD_LAYER_ORDER.farBackground,
    ).toBeLessThan(WORLD_LAYER_ORDER.floor);

    expect(
      WORLD_LAYER_ORDER.floor,
    ).toBeLessThan(WORLD_LAYER_ORDER.backProps);

    expect(
      WORLD_LAYER_ORDER.backProps,
    ).toBeLessThan(WORLD_LAYER_ORDER.entities);

    expect(
      WORLD_LAYER_ORDER.entities,
    ).toBeLessThan(WORLD_LAYER_ORDER.frontProps);

    expect(
      WORLD_LAYER_ORDER.frontProps,
    ).toBeLessThan(WORLD_LAYER_ORDER.vfx);

    expect(
      WORLD_LAYER_ORDER.vfx,
    ).toBeLessThan(UI_LAYER_ORDER);
  });

  it("ordena entidades pela posição dos pés", () => {
    expect(ySortValue(300)).toBeLessThan(
      ySortValue(500),
    );
  });

  it("aceita offset de ordenação", () => {
    expect(ySortValue(100, 20)).toBe(
      WORLD_LAYER_ORDER.entities + 120,
    );
  });
});
