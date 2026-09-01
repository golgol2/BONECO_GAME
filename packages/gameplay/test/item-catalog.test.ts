import {
  describe,
  expect,
  it,
} from "vitest";

import {
  ABYSS_SHARD,
  ItemCatalog,
  createDefaultItemCatalog,
  validateItemDefinition,
} from "../src";

describe("ItemCatalog", () => {
  it("catálogo padrão possui itens", () => {
    const catalog =
      createDefaultItemCatalog();

    expect(catalog.size).toBe(3);

    expect(
      catalog.require(
        "abyss_shard",
      ).displayName,
    ).toBe(
      "Fragmento do Abismo",
    );

    expect(
      catalog.require(
        "abyss_blade",
      ).category,
    ).toBe("weapon");
  });

  it("impede ID duplicado", () => {
    const catalog =
      new ItemCatalog();

    catalog.register(
      ABYSS_SHARD,
    );

    expect(
      () =>
        catalog.register(
          ABYSS_SHARD,
        ),
    ).toThrow(
      "Item duplicado: abyss_shard",
    );
  });

  it("item padrão é válido", () => {
    expect(
      validateItemDefinition(
        ABYSS_SHARD,
      ),
    ).toEqual([]);
  });
});
