import { DamageReceiver } from "./damage-receiver";
import { EnemyAttackController } from "./enemy-attack";
import { Health } from "./health";

import type { EnemyDefinition } from "./enemy-types";

export class EnemyInstance {
  readonly health: Health;
  readonly damageReceiver: DamageReceiver;
  readonly attackController: EnemyAttackController;

  x: number;
  y: number;

  velocityX = 0;
  velocityY = 0;

  hurtTime = 0;

  constructor(
    readonly definition: EnemyDefinition,
    x: number,
    y: number,
  ) {
    this.x = x;
    this.y = y;

    this.health = new Health(
      definition.maxHealth,
    );

    this.damageReceiver =
      new DamageReceiver(this.health);

    this.attackController =
      new EnemyAttackController(
        definition.attackCooldownSeconds,
      );
  }

  get dead(): boolean {
    return this.health.dead;
  }

  update(deltaSeconds: number): void {
    if (deltaSeconds <= 0) {
      return;
    }

    this.damageReceiver.update(deltaSeconds);
    this.attackController.update(deltaSeconds);

    if (this.hurtTime > 0) {
      this.hurtTime = Math.max(
        0,
        this.hurtTime - deltaSeconds,
      );
    }

    if (this.dead) {
      this.velocityX = 0;
      this.velocityY = 0;
      return;
    }

    this.x += this.velocityX * deltaSeconds;
    this.y += this.velocityY * deltaSeconds;

    const damping = Math.max(
      0,
      1 - 10 * deltaSeconds,
    );

    this.velocityX *= damping;
    this.velocityY *= damping;
  }

  applyKnockback(
    x: number,
    y: number,
  ): void {
    if (this.dead) {
      return;
    }

    this.velocityX = x;
    this.velocityY = y;
  }

  markHurt(seconds: number): void {
    if (this.dead) {
      return;
    }

    this.hurtTime = Math.max(
      this.hurtTime,
      Math.max(0, seconds),
    );
  }
}
