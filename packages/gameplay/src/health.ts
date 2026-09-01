export interface DamageResult {
  applied: number;
  remaining: number;
  killed: boolean;
}

export class Health {
  readonly max: number;
  private currentValue: number;

  constructor(max: number) {
    if (max <= 0) {
      throw new Error("Health.max deve ser > 0");
    }

    this.max = max;
    this.currentValue = max;
  }

  get current(): number {
    return this.currentValue;
  }

  get dead(): boolean {
    return this.currentValue <= 0;
  }

  damage(amount: number): DamageResult {
    if (amount <= 0 || this.dead) {
      return {
        applied: 0,
        remaining: this.currentValue,
        killed: this.dead,
      };
    }

    const before = this.currentValue;

    this.currentValue = Math.max(
      0,
      this.currentValue - amount,
    );

    return {
      applied: before - this.currentValue,
      remaining: this.currentValue,
      killed: this.dead,
    };
  }
}
