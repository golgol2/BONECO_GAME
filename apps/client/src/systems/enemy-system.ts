import {
  EnemyInstance,
  createMeleeHitbox,
  decideEnemyAi,
  getEnemyDefinition,
} from "@boneco/gameplay";
import {
  aabbIntersectsAabb,
} from "@boneco/physics";
import {
  depthScale,
  ySortValue,
  type DepthProjectionConfig,
} from "@boneco/renderer";
import type {
  FacingDirection,
} from "@boneco/shared";
import type {
  EnemySpawnDefinition,
} from "@boneco/world";
import {
  Container,
  Graphics,
} from "pixi.js";

export interface PlayerCombatView {
  x: number;
  y: number;
  facing: FacingDirection;
  dead: boolean;
  attackActive: boolean;
  attackSequence: number;
}

export interface EnemyAttackEvent {
  enemy: EnemyInstance;
}

export interface EnemyDeathEvent {
  id: string;
  enemy: EnemyInstance;
}

export interface EnemySystemOptions {
  spawns: readonly EnemySpawnDefinition[];
  layer: Container;
  worldWidth: number;
  worldHeight: number;
  depthProjection?: DepthProjectionConfig;
  onEnemyAttack: (
    event: EnemyAttackEvent,
  ) => void;
  onEnemyDeath?: (
    event: EnemyDeathEvent,
  ) => void;
}

interface EnemyView {
  id: string;
  runtime: EnemyInstance;
  container: Container;
  body: Graphics;
  lastHitAttackSequence: number;
  deathReported: boolean;
}

export class EnemySystem {
  private readonly enemies: EnemyView[] = [];

  constructor(
    private readonly options: EnemySystemOptions,
  ) {}

  spawnAll(): void {
    for (const spawn of this.options.spawns) {
      const definition =
        getEnemyDefinition(spawn.enemyId);

      if (!definition) {
        console.warn(
          `[world] enemy desconhecido: ${spawn.enemyId}`,
        );
        continue;
      }

      const runtime =
        new EnemyInstance(
          definition,
          spawn.x,
          spawn.y,
        );

      const container = new Container();
      const body = new Graphics();

      body
        .circle(
          0,
          -definition.bodyHeight / 2,
          definition.bodyWidth / 2,
        )
        .fill("#7d2636")
        .stroke({
          width: 3,
          color: "#ff7788",
        });

      container.addChild(body);

      container.position.set(
        runtime.x,
        runtime.y,
      );

      container.zIndex =
        ySortValue(runtime.y);

      this.applyDepthScale(
        container,
        runtime.y,
      );

      this.options.layer.addChild(container);

      this.enemies.push({
        id: spawn.id,
        runtime,
        container,
        body,
        lastHitAttackSequence: -1,
        deathReported: false,
      });
    }
  }

  update(
    step: number,
    player: PlayerCombatView,
  ): void {
    for (const enemy of this.enemies) {
      const decision = decideEnemyAi({
        enemyX: enemy.runtime.x,
        enemyY: enemy.runtime.y,
        playerX: player.x,
        playerY: player.y,
        hurt: enemy.runtime.hurtTime > 0,
        dead: enemy.runtime.dead,
        definition: enemy.runtime.definition,
      });

      if (decision.state === "chase") {
        enemy.runtime.x +=
          decision.moveX *
          enemy.runtime.definition.moveSpeed *
          step;

        enemy.runtime.y +=
          decision.moveY *
          enemy.runtime.definition.moveSpeed *
          step;
      }

      if (
        !player.dead &&
        !enemy.runtime.dead &&
        enemy.runtime.attackController.tryAttack(
          decision.distance,
          enemy.runtime.definition.attackRange,
        )
      ) {
        this.options.onEnemyAttack({
          enemy: enemy.runtime,
        });
      }

      enemy.runtime.update(step);

      enemy.runtime.x = Math.max(
        40,
        Math.min(
          this.options.worldWidth - 40,
          enemy.runtime.x,
        ),
      );

      enemy.runtime.y = Math.max(
        40,
        Math.min(
          this.options.worldHeight - 40,
          enemy.runtime.y,
        ),
      );

      enemy.container.position.set(
        enemy.runtime.x,
        enemy.runtime.y,
      );

      enemy.container.zIndex =
        ySortValue(enemy.runtime.y);

      this.applyDepthScale(
        enemy.container,
        enemy.runtime.y,
      );

      if (enemy.runtime.dead) {
        enemy.body.alpha = 0.25;

        if (!enemy.deathReported) {
          enemy.deathReported = true;

          this.options.onEnemyDeath?.({
            id: enemy.id,
            enemy: enemy.runtime,
          });
        }

        continue;
      }

      if (enemy.runtime.hurtTime > 0) {
        enemy.body.alpha = 0.55;
        continue;
      }

      enemy.body.alpha =
        enemy.runtime.damageReceiver.invulnerable
          ? 0.7
          : 1;
    }
  }

  resolvePlayerAttack(
    player: PlayerCombatView,
    damage: number,
    knockbackStrength: number,
  ): void {
    if (!player.attackActive) {
      return;
    }

    const hitbox = createMeleeHitbox(
      player.x,
      player.y - 70,
      player.facing,
      {
        reach: 115,
        thickness: 60,
        offset: 20,
      },
    );

    const knockback =
      this.knockbackForFacing(
        player.facing,
        knockbackStrength,
      );

    for (const enemy of this.enemies) {
      if (
        enemy.runtime.dead ||
        enemy.lastHitAttackSequence ===
          player.attackSequence
      ) {
        continue;
      }

      const bounds = {
        x:
          enemy.runtime.x -
          enemy.runtime.definition.bodyWidth / 2,
        y:
          enemy.runtime.y -
          enemy.runtime.definition.bodyHeight,
        width:
          enemy.runtime.definition.bodyWidth,
        height:
          enemy.runtime.definition.bodyHeight,
      };

      if (
        !aabbIntersectsAabb(
          hitbox,
          bounds,
        )
      ) {
        continue;
      }

      const result =
        enemy.runtime.damageReceiver.receive({
          amount: damage,
          knockback,
          invulnerabilitySeconds: 0.18,
        });

      if (!result.accepted) {
        continue;
      }

      enemy.lastHitAttackSequence =
        player.attackSequence;

      enemy.runtime.applyKnockback(
        result.knockback.x,
        result.knockback.y,
      );

      enemy.runtime.markHurt(0.12);

      console.info(
        `[combat] ${enemy.id} recebeu ` +
        `${result.appliedDamage} de dano; ` +
        `vida=${enemy.runtime.health.current}`,
      );
    }
  }

  getEnemyTarget(
    id: string,
  ): {
    id: string;
    x: number;
    y: number;
    dead: boolean;
  } | undefined {
    const enemy =
      this.enemies.find(
        (entry) =>
          entry.id === id,
      );

    if (!enemy) {
      return undefined;
    }

    return {
      id:
        enemy.id,
      x:
        enemy.runtime.x,
      y:
        enemy.runtime.y,
      dead:
        enemy.runtime.dead,
    };
  }

  hitTestWorld(
    x: number,
    y: number,
  ): string | undefined {
    let best:
      EnemyView | undefined;

    let bestDistance =
      Number.POSITIVE_INFINITY;

    for (
      const enemy
      of this.enemies
    ) {
      if (
        enemy.runtime.dead
      ) {
        continue;
      }

      /*
       * Seleção considera o corpo visual,
       * mas com margem confortável para
       * toque em tela mobile.
       */
      const halfWidth =
        Math.max(
          36,
          enemy.runtime.definition.bodyWidth /
            2,
        );

      const top =
        enemy.runtime.y -
        enemy.runtime.definition.bodyHeight -
        24;

      const bottom =
        enemy.runtime.y +
        24;

      if (
        x <
          enemy.runtime.x -
            halfWidth ||
        x >
          enemy.runtime.x +
            halfWidth ||
        y < top ||
        y > bottom
      ) {
        continue;
      }

      const distance =
        Math.hypot(
          x -
            enemy.runtime.x,
          y -
            enemy.runtime.y,
        );

      if (
        distance <
        bestDistance
      ) {
        best =
          enemy;

        bestDistance =
          distance;
      }
    }

    return best?.id;
  }

  destroy(): void {
    for (const enemy of this.enemies) {
      enemy.container.destroy({
        children: true,
      });
    }

    this.enemies.length = 0;
  }

  get count(): number {
    return this.enemies.length;
  }

  private applyDepthScale(
    container: Container,
    y: number,
  ): void {
    const projection =
      this.options.depthProjection;

    if (!projection) {
      container.scale.set(1);
      return;
    }

    const scale =
      depthScale(
        y,
        projection,
      );

    container.scale.set(scale);
  }

  private knockbackForFacing(
    facing: FacingDirection,
    strength: number,
  ): { x: number; y: number } {
    switch (facing) {
      case "right":
        return {
          x: strength,
          y: 0,
        };

      case "left":
        return {
          x: -strength,
          y: 0,
        };

      case "down":
        return {
          x: 0,
          y: strength,
        };

      case "up":
        return {
          x: 0,
          y: -strength,
        };
    }
  }
}
