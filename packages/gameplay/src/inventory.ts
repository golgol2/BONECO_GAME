import type {
  ItemCatalog,
} from "./item-catalog";
import type {
  ItemStack,
} from "./item-types";

export interface InventoryAddResult {
  added: number;
  remaining: number;
}

export class Inventory {
  private readonly stacks: ItemStack[] = [];

  constructor(
    private readonly catalog: ItemCatalog,
    readonly capacity: number,
  ) {
    if (capacity < 1) {
      throw new Error(
        "Inventory.capacity deve ser >= 1",
      );
    }
  }

  get slotsUsed(): number {
    return this.stacks.length;
  }

  get snapshot(): readonly ItemStack[] {
    return this.stacks.map(
      (stack) => ({ ...stack }),
    );
  }

  count(itemId: string): number {
    return this.stacks
      .filter(
        (stack) =>
          stack.itemId === itemId,
      )
      .reduce(
        (total, stack) =>
          total + stack.quantity,
        0,
      );
  }

  add(
    itemId: string,
    quantity: number,
  ): InventoryAddResult {
    if (quantity <= 0) {
      return {
        added: 0,
        remaining: Math.max(
          0,
          quantity,
        ),
      };
    }

    const item =
      this.catalog.require(itemId);

    let remaining = quantity;

    for (const stack of this.stacks) {
      if (
        stack.itemId !== itemId ||
        stack.quantity >= item.maxStack
      ) {
        continue;
      }

      const available =
        item.maxStack - stack.quantity;

      const amount =
        Math.min(
          available,
          remaining,
        );

      stack.quantity += amount;
      remaining -= amount;

      if (remaining === 0) {
        break;
      }
    }

    while (
      remaining > 0 &&
      this.stacks.length < this.capacity
    ) {
      const amount =
        Math.min(
          item.maxStack,
          remaining,
        );

      this.stacks.push({
        itemId,
        quantity: amount,
      });

      remaining -= amount;
    }

    return {
      added: quantity - remaining,
      remaining,
    };
  }

  remove(
    itemId: string,
    quantity: number,
  ): number {
    if (quantity <= 0) {
      return 0;
    }

    let remaining = quantity;

    for (
      let index = this.stacks.length - 1;
      index >= 0 && remaining > 0;
      index -= 1
    ) {
      const stack =
        this.stacks[index];

      if (
        !stack ||
        stack.itemId !== itemId
      ) {
        continue;
      }

      const amount =
        Math.min(
          stack.quantity,
          remaining,
        );

      stack.quantity -= amount;
      remaining -= amount;

      if (stack.quantity === 0) {
        this.stacks.splice(
          index,
          1,
        );
      }
    }

    return quantity - remaining;
  }
}
