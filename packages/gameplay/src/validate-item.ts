import type {
  ItemDefinition,
} from "./item-types";
import type {
  LootTable,
} from "./loot";

export function validateItemDefinition(
  item: ItemDefinition,
): string[] {
  const errors: string[] = [];

  if (!item.id.trim()) {
    errors.push(
      "item.id é obrigatório",
    );
  }

  if (item.version < 1) {
    errors.push(
      "item.version deve ser >= 1",
    );
  }

  if (!item.displayName.trim()) {
    errors.push(
      "item.displayName é obrigatório",
    );
  }

  if (item.maxStack < 1) {
    errors.push(
      "item.maxStack deve ser >= 1",
    );
  }

  if (!item.assetId.trim()) {
    errors.push(
      "item.assetId é obrigatório",
    );
  }

  return errors;
}

export function validateLootTable(
  table: LootTable,
): string[] {
  const errors: string[] = [];

  if (!table.id.trim()) {
    errors.push(
      "loot.id é obrigatório",
    );
  }

  for (const entry of table.entries) {
    if (!entry.itemId.trim()) {
      errors.push(
        "loot entry sem itemId",
      );
    }

    if (
      entry.chance < 0 ||
      entry.chance > 1
    ) {
      errors.push(
        `loot ${entry.itemId} possui chance inválida`,
      );
    }

    if (
      entry.minQuantity < 0 ||
      entry.maxQuantity <
        entry.minQuantity
    ) {
      errors.push(
        `loot ${entry.itemId} possui quantidade inválida`,
      );
    }
  }

  return errors;
}
