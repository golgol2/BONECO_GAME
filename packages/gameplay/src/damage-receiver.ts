import { Health } from "./health";

export interface KnockbackVector {
  x: number;
  y: number;
}

export interface ReceiveDamageInput {
  amount: number;
  knockback: KnockbackVector;
  invulnerabilitySeconds: number;
}

export interface ReceiveDamageResult {
  accepted: boolean;
  appliedDamage: number;
  killed: boolean;
  knockback: KnockbackVector;
}

export class DamageReceiver {
  private invulnerabilityRemaining = 0;

  constructor(
    readonly health: Health,
  ) {}

  get invulnerable(): boolean {
    return this.invulnerabilityRemaining > 0;
  }

  update(deltaSeconds: number): void {
    if (deltaSeconds <= 0) {
      return;
    }

    this.invulnerabilityRemaining = Math.max(
      0,
      this.invulnerabilityRemaining - deltaSeconds,
    );
  }

  receive(
    input: ReceiveDamageInput,
  ): ReceiveDamageResult {
    if (
      this.invulnerable ||
      this.health.dead ||
      input.amount <= 0
    ) {
      return {
        accepted: false,
        appliedDamage: 0,
        killed: this.health.dead,
        knockback: {
          x: 0,
          y: 0,
        },
      };
    }

    const result =
      this.health.damage(input.amount);

    this.invulnerabilityRemaining =
      Math.max(
        0,
        input.invulnerabilitySeconds,
      );

    return {
      accepted: result.applied > 0,
      appliedDamage: result.applied,
      killed: result.killed,
      knockback: {
        x: input.knockback.x,
        y: input.knockback.y,
      },
    };
  }
}
