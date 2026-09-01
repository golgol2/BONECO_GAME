import {
  Container,
  Graphics,
} from "pixi.js";

import {
  Inventory,
  collectNearbyDrops,
  createDefaultItemCatalog,
  getLootTable,
  rollLoot,
  type WorldDrop,
} from "@boneco/gameplay";

import {
  ySortValue,
} from "@boneco/renderer";

export interface SpawnEnemyLootInput {
  enemyId: string;
  lootTableId?: string;
  x: number;
  y: number;
}

interface DropView {
  runtime: WorldDrop;
  container: Container;
}

export class DropSystem {
  readonly inventory =
    new Inventory(
      createDefaultItemCatalog(),
      24,
    );

  private readonly drops: DropView[] = [];
  private sequence = 0;

  constructor(
    private readonly layer: Container,
  ) {
    this.inventory.add(
      "abyss_blade",
      1,
    );
  }

  spawnEnemyLoot(
    input: SpawnEnemyLootInput,
  ): void {
    if (!input.lootTableId) {
      return;
    }

    const table =
      getLootTable(
        input.lootTableId,
      );

    if (!table) {
      console.warn(
        `[loot] tabela desconhecida: ${input.lootTableId}`,
      );
      return;
    }

    const rolled =
      rollLoot(table);

    rolled.forEach(
      (stack, index) => {
        this.sequence += 1;

        const runtime: WorldDrop = {
          id:
            `${input.enemyId}_drop_${this.sequence}`,
          itemId: stack.itemId,
          quantity: stack.quantity,
          x:
            input.x +
            (index - rolled.length / 2) * 18,
          y: input.y,
        };

        const container =
          new Container();

        const visual =
          new Graphics()
            .circle(0, -8, 8)
            .fill("#df6cff")
            .stroke({
              width: 2,
              color: "#ffffff",
            });

        container.addChild(visual);

        container.position.set(
          runtime.x,
          runtime.y,
        );

        container.zIndex =
          ySortValue(runtime.y, 5);

        this.layer.addChild(container);

        this.drops.push({
          runtime,
          container,
        });
      },
    );
  }

  collectNear(
    x: number,
    y: number,
    radius = 55,
  ): void {
    const result =
      collectNearbyDrops(
        this.drops.map(
          (drop) => drop.runtime,
        ),
        x,
        y,
        radius,
        this.inventory,
      );

    const remainingIds =
      new Set(
        result.remainingDrops.map(
          (drop) => drop.id,
        ),
      );

    for (
      let index = this.drops.length - 1;
      index >= 0;
      index -= 1
    ) {
      const drop =
        this.drops[index];

      if (!drop) {
        continue;
      }

      if (
        !remainingIds.has(
          drop.runtime.id,
        )
      ) {
        drop.container.destroy({
          children: true,
        });

        this.drops.splice(
          index,
          1,
        );
      }
    }

    for (const remaining of result.remainingDrops) {
      const view =
        this.drops.find(
          (drop) =>
            drop.runtime.id ===
            remaining.id,
        );

      if (view) {
        view.runtime.quantity =
          remaining.quantity;
      }
    }
  }

  get count(): number {
    return this.drops.length;
  }

  destroy(): void {
    for (const drop of this.drops) {
      drop.container.destroy({
        children: true,
      });
    }

    this.drops.length = 0;
  }
}
