import {
  describe,
  expect,
  it,
} from "vitest";

import {
  Inventory,
  collectNearbyDrops,
  createDefaultItemCatalog,
  type WorldDrop,
} from "../src";

describe("collectNearbyDrops", () => {
  it("coleta drop próximo", () => {
    const inventory =
      new Inventory(
        createDefaultItemCatalog(),
        10,
      );

    const drops: WorldDrop[] = [
      {
        id: "drop_1",
        itemId: "abyss_shard",
        quantity: 3,
        x: 100,
        y: 100,
      },
    ];

    const result =
      collectNearbyDrops(
        drops,
        110,
        100,
        30,
        inventory,
      );

    expect(result.remainingDrops).toEqual([]);

    expect(
      inventory.count("abyss_shard"),
    ).toBe(3);
  });

  it("mantém drop distante", () => {
    const inventory =
      new Inventory(
        createDefaultItemCatalog(),
        10,
      );

    const drops: WorldDrop[] = [
      {
        id: "drop_1",
        itemId: "abyss_shard",
        quantity: 3,
        x: 500,
        y: 500,
      },
    ];

    const result =
      collectNearbyDrops(
        drops,
        0,
        0,
        30,
        inventory,
      );

    expect(result.remainingDrops).toHaveLength(1);

    expect(
      inventory.count("abyss_shard"),
    ).toBe(0);
  });

  it("mantém quantidade que não cabe", () => {
    const inventory =
      new Inventory(
        createDefaultItemCatalog(),
        1,
      );

    inventory.add(
      "abyss_shard",
      98,
    );

    const drops: WorldDrop[] = [
      {
        id: "drop_1",
        itemId: "abyss_shard",
        quantity: 5,
        x: 0,
        y: 0,
      },
    ];

    const result =
      collectNearbyDrops(
        drops,
        0,
        0,
        30,
        inventory,
      );

    expect(
      inventory.count("abyss_shard"),
    ).toBe(99);

    expect(
      result.remainingDrops[0]?.quantity,
    ).toBe(4);
  });
});
