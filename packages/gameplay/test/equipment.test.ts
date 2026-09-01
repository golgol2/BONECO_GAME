import {
  describe,
  expect,
  it,
} from "vitest";

import {
  ABYSS_BLADE,
  Equipment,
  Inventory,
  createDefaultItemCatalog,
  getWeaponDefinition,
  validateWeaponDefinition,
} from "../src";

describe("Equipment", () => {
  it("não equipa item ausente", () => {
    const inventory =
      new Inventory(
        createDefaultItemCatalog(),
        10,
      );

    const equipment =
      new Equipment(inventory);

    expect(
      equipment.equip(
        "weapon",
        "abyss_blade",
      ),
    ).toBe(false);
  });

  it("equipa item existente", () => {
    const inventory =
      new Inventory(
        createDefaultItemCatalog(),
        10,
      );

    inventory.add(
      "abyss_blade",
      1,
    );

    const equipment =
      new Equipment(inventory);

    expect(
      equipment.equip(
        "weapon",
        "abyss_blade",
      ),
    ).toBe(true);

    expect(
      equipment.get("weapon"),
    ).toBe("abyss_blade");
  });

  it("desequipa item", () => {
    const inventory =
      new Inventory(
        createDefaultItemCatalog(),
        10,
      );

    inventory.add(
      "abyss_blade",
      1,
    );

    const equipment =
      new Equipment(inventory);

    equipment.equip(
      "weapon",
      "abyss_blade",
    );

    expect(
      equipment.unequip("weapon"),
    ).toBe("abyss_blade");

    expect(
      equipment.get("weapon"),
    ).toBeUndefined();
  });

  it("expõe snapshot dos slots", () => {
    const inventory =
      new Inventory(
        createDefaultItemCatalog(),
        10,
      );

    inventory.add(
      "abyss_blade",
      1,
    );

    const equipment =
      new Equipment(inventory);

    equipment.equip(
      "weapon",
      "abyss_blade",
    );

    expect(
      equipment.snapshot,
    ).toEqual([
      {
        slot: "weapon",
        itemId: "abyss_blade",
      },
    ]);
  });
});

describe("ABYSS_BLADE", () => {
  it("resolve arma por ID", () => {
    expect(
      getWeaponDefinition(
        "abyss_blade",
      ),
    ).toBe(ABYSS_BLADE);
  });

  it("possui definição válida", () => {
    expect(
      validateWeaponDefinition(
        ABYSS_BLADE,
      ),
    ).toEqual([]);
  });
});
