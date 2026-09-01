export interface FixedStepResult {
  updates: number;
  alpha: number;
}

export class FixedStepAccumulator {
  private accumulator = 0;

  constructor(
    readonly step = 1 / 60,
    readonly maxFrame = 0.25,
    readonly maxUpdates = 8,
  ) {
    if (step <= 0) throw new Error("step deve ser maior que zero");
    if (maxFrame <= 0) throw new Error("maxFrame deve ser maior que zero");
    if (maxUpdates < 1) throw new Error("maxUpdates deve ser pelo menos 1");
  }

  advance(
    frameSeconds: number,
    update: (step: number) => void,
  ): FixedStepResult {
    this.accumulator += Math.min(
      Math.max(frameSeconds, 0),
      this.maxFrame,
    );

    let updates = 0;

    const epsilon = this.step * 1e-9;

    while (
      this.accumulator + epsilon >= this.step &&
      updates < this.maxUpdates
    ) {
      update(this.step);
      this.accumulator -= this.step;

      if (Math.abs(this.accumulator) <= epsilon) {
        this.accumulator = 0;
      }

      updates += 1;
    }

    if (
      updates === this.maxUpdates &&
      this.accumulator + epsilon >= this.step
    ) {
      this.accumulator %= this.step;
    }

    return {
      updates,
      alpha: this.accumulator / this.step,
    };
  }

  reset(): void {
    this.accumulator = 0;
  }
}
