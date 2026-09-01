export type AttackPhase =
  | "idle"
  | "windup"
  | "active"
  | "recovery";

export interface AttackTiming {
  windupSeconds: number;
  activeSeconds: number;
  recoverySeconds: number;
}

export class AttackController {
  private currentPhase: AttackPhase = "idle";
  private phaseTime = 0;
  private attackSequence = 0;

  constructor(
    readonly timing: AttackTiming,
  ) {
    if (
      timing.windupSeconds < 0 ||
      timing.activeSeconds <= 0 ||
      timing.recoverySeconds < 0
    ) {
      throw new Error(
        "AttackTiming possui duração inválida",
      );
    }
  }

  get phase(): AttackPhase {
    return this.currentPhase;
  }

  get attacking(): boolean {
    return this.currentPhase !== "idle";
  }

  get hitboxActive(): boolean {
    return this.currentPhase === "active";
  }

  get sequence(): number {
    return this.attackSequence;
  }

  tryStart(): boolean {
    if (this.attacking) {
      return false;
    }

    this.currentPhase = "windup";
    this.phaseTime = 0;
    this.attackSequence += 1;

    if (this.timing.windupSeconds === 0) {
      this.currentPhase = "active";
    }

    return true;
  }

  update(deltaSeconds: number): void {
    if (deltaSeconds <= 0) {
      return;
    }

    this.phaseTime += deltaSeconds;

    let guard = 0;

    while (guard < 4) {
      const phase = this.currentPhase;

      if (phase === "idle") {
        break;
      }

      guard += 1;

      const duration =
        this.durationFor(phase);

      const epsilon =
        Math.max(duration, 1) * 1e-9;

      if (
        this.phaseTime + epsilon <
        duration
      ) {
        break;
      }

      this.phaseTime -= duration;

      if (
        Math.abs(this.phaseTime) <=
        epsilon
      ) {
        this.phaseTime = 0;
      }

      this.advancePhase();
    }
  }

  progress(): number {
    if (this.currentPhase === "idle") {
      return 0;
    }

    const duration =
      this.durationFor(this.currentPhase);

    if (duration <= 0) {
      return 1;
    }

    return Math.max(
      0,
      Math.min(1, this.phaseTime / duration),
    );
  }

  reset(): void {
    this.currentPhase = "idle";
    this.phaseTime = 0;
  }

  private durationFor(
    phase: Exclude<AttackPhase, "idle">,
  ): number {
    switch (phase) {
      case "windup":
        return this.timing.windupSeconds;
      case "active":
        return this.timing.activeSeconds;
      case "recovery":
        return this.timing.recoverySeconds;
    }
  }

  private advancePhase(): void {
    switch (this.currentPhase) {
      case "windup":
        this.currentPhase = "active";
        break;

      case "active":
        this.currentPhase = "recovery";
        break;

      case "recovery":
        this.currentPhase = "idle";
        this.phaseTime = 0;
        break;

      case "idle":
        break;
    }
  }
}
