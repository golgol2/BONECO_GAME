import {
  describe,
  expect,
  it,
} from "vitest";

import {
  TRAINING_DUMMY_LOOT,
  rollLoot,
  validateLootTable,
} from "../src";

describe("Loot", () => {
  it("tabela padrão é válida", () => {
    expect(
      validateLootTable(
        TRAINING_DUMMY_LOOT,
      ),
    ).toEqual([]);
  });

  it("gera drop determinístico", () => {
    const values = [
      0,
      0.49,
      0.9,
    ];

    let index = 0;

    const drops = rollLoot(
      TRAINING_DUMMY_LOOT,
      () => {
        const value =
          values[index] ?? 0.99;

        index += 1;
        return value;
      },
    );

    expect(drops).toEqual([
      {
        itemId: "abyss_shard",
        quantity: 2,
      },
    ]);
  });
});
