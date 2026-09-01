import type {
  Inventory,
} from "./inventory";

export type EquipmentSlot =
  | "weapon"
  | "head"
  | "body";

export interface EquipmentEntry {
  slot: EquipmentSlot;
  itemId: string;
}

export class Equipment {
  private readonly slots =
    new Map<EquipmentSlot, string>();

  constructor(
    private readonly inventory: Inventory,
  ) {}

  get(
    slot: EquipmentSlot,
  ): string | undefined {
    return this.slots.get(slot);
  }

  equip(
    slot: EquipmentSlot,
    itemId: string,
  ): boolean {
    if (
      this.inventory.count(itemId) <= 0
    ) {
      return false;
    }

    this.slots.set(
      slot,
      itemId,
    );

    return true;
  }

  unequip(
    slot: EquipmentSlot,
  ): string | undefined {
    const itemId =
      this.slots.get(slot);

    this.slots.delete(slot);

    return itemId;
  }

  get snapshot():
    readonly EquipmentEntry[] {
    return Array.from(
      this.slots.entries(),
      ([slot, itemId]) => ({
        slot,
        itemId,
      }),
    );
  }
}
