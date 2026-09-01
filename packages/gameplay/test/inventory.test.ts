import {
  describe,
  expect,
  it,
} from "vitest";

import {
  Inventory,
  createDefaultItemCatalog,
} from "../src";

describe("Inventory", () => {
  it("empilha itens até maxStack", () => {
    const inventory =
      new Inventory(
        createDefaultItemCatalog(),
        10,
      );

    expect(
      inventory.add(
        "abyss_shard",
        120,
      ),
    ).toEqual({
      added: 120,
      remaining: 0,
    });

    expect(
      inventory.snapshot,
    ).toEqual([
      {
        itemId: "abyss_shard",
        quantity: 99,
      },
      {
        itemId: "abyss_shard",
        quantity: 21,
      },
    ]);
  });

  it("respeita capacidade", () => {
    const inventory =
      new Inventory(
        createDefaultItemCatalog(),
        1,
      );

    const result =
      inventory.add(
        "abyss_shard",
        150,
      );

    expect(result.added).toBe(99);
    expect(result.remaining).toBe(51);
  });

  it("remove itens", () => {
    const inventory =
      new Inventory(
        createDefaultItemCatalog(),
        5,
      );

    inventory.add(
      "abyss_shard",
      10,
    );

    expect(
      inventory.remove(
        "abyss_shard",
        4,
      ),
    ).toBe(4);

    expect(
      inventory.count(
        "abyss_shard",
      ),
    ).toBe(6);
  });
});
