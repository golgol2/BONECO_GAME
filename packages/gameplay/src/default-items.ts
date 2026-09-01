import {
  ItemCatalog,
} from "./item-catalog";
import type {
  ItemDefinition,
} from "./item-types";
import type {
  LootTable,
} from "./loot";

export const ABYSS_SHARD:
  ItemDefinition = {
    id: "abyss_shard",
    version: 1,
    displayName: "Fragmento do Abismo",
    category: "material",
    maxStack: 99,
    assetId: "item.abyss_shard",
  };

export const OLD_IRON:
  ItemDefinition = {
    id: "old_iron",
    version: 1,
    displayName: "Ferro Antigo",
    category: "material",
    maxStack: 99,
    assetId: "item.old_iron",
  };

export const ABYSS_BLADE_ITEM:
  ItemDefinition = {
    id: "abyss_blade",
    version: 1,
    displayName: "Lâmina do Abismo",
    category: "weapon",
    maxStack: 1,
    assetId: "weapon.abyss_blade",
  };

export const TRAINING_DUMMY_LOOT:
  LootTable = {
    id: "training_dummy_loot",
    entries: [
      {
        itemId: ABYSS_SHARD.id,
        chance: 1,
        minQuantity: 1,
        maxQuantity: 3,
      },
      {
        itemId: OLD_IRON.id,
        chance: 0.35,
        minQuantity: 1,
        maxQuantity: 1,
      },
    ],
  };

export function createDefaultItemCatalog():
  ItemCatalog {
  const catalog =
    new ItemCatalog();

  catalog.register(ABYSS_SHARD);
  catalog.register(OLD_IRON);
  catalog.register(ABYSS_BLADE_ITEM);

  return catalog;
}

export const LOOT_TABLES:
  Readonly<Record<string, LootTable>> = {
    [TRAINING_DUMMY_LOOT.id]:
      TRAINING_DUMMY_LOOT,
  };

export function getLootTable(
  id: string,
): LootTable | undefined {
  return LOOT_TABLES[id];
}
