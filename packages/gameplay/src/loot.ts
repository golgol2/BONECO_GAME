import type {
  ItemStack,
} from "./item-types";

export interface LootEntry {
  itemId: string;
  chance: number;
  minQuantity: number;
  maxQuantity: number;
}

export interface LootTable {
  id: string;
  entries: readonly LootEntry[];
}

export type RandomSource =
  () => number;

export function rollLoot(
  table: LootTable,
  random: RandomSource = Math.random,
): ItemStack[] {
  const result: ItemStack[] = [];

  for (const entry of table.entries) {
    if (
      entry.chance <= 0 ||
      random() >= entry.chance
    ) {
      continue;
    }

    const min = Math.max(
      0,
      Math.floor(entry.minQuantity),
    );

    const max = Math.max(
      min,
      Math.floor(entry.maxQuantity),
    );

    if (max <= 0) {
      continue;
    }

    const quantity =
      min +
      Math.floor(
        random() *
        (max - min + 1),
      );

    if (quantity <= 0) {
      continue;
    }

    result.push({
      itemId: entry.itemId,
      quantity,
    });
  }

  return result;
}
