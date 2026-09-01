import type {
  Inventory,
} from "./inventory";

import type {
  ItemStack,
} from "./item-types";

export interface WorldDrop {
  id: string;
  itemId: string;
  quantity: number;
  x: number;
  y: number;
}

export interface CollectDropsResult {
  collected: ItemStack[];
  remainingDrops: WorldDrop[];
}

export function collectNearbyDrops(
  drops: readonly WorldDrop[],
  playerX: number,
  playerY: number,
  radius: number,
  inventory: Inventory,
): CollectDropsResult {
  const collected: ItemStack[] = [];
  const remainingDrops: WorldDrop[] = [];

  const radiusSquared =
    Math.max(0, radius) ** 2;

  for (const drop of drops) {
    const dx = drop.x - playerX;
    const dy = drop.y - playerY;

    if (
      dx * dx + dy * dy >
      radiusSquared
    ) {
      remainingDrops.push(drop);
      continue;
    }

    const result =
      inventory.add(
        drop.itemId,
        drop.quantity,
      );

    if (result.added > 0) {
      collected.push({
        itemId: drop.itemId,
        quantity: result.added,
      });
    }

    if (result.remaining > 0) {
      remainingDrops.push({
        ...drop,
        quantity: result.remaining,
      });
    }
  }

  return {
    collected,
    remainingDrops,
  };
}
