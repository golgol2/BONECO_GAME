export class EnemyAttackController {
  private cooldownRemaining = 0;

  constructor(
    readonly cooldownSeconds: number,
  ) {
    if (cooldownSeconds < 0) {
      throw new Error(
        "cooldownSeconds deve ser >= 0",
      );
    }
  }

  get ready(): boolean {
    return this.cooldownRemaining <= 0;
  }

  update(deltaSeconds: number): void {
    if (deltaSeconds <= 0) {
      return;
    }

    this.cooldownRemaining = Math.max(
      0,
      this.cooldownRemaining - deltaSeconds,
    );
  }

  tryAttack(
    distance: number,
    attackRange: number,
  ): boolean {
    if (
      !this.ready ||
      distance < 0 ||
      distance > attackRange
    ) {
      return false;
    }

    this.cooldownRemaining =
      this.cooldownSeconds;

    return true;
  }
}
