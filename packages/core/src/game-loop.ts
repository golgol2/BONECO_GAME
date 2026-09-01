import { FixedStepAccumulator } from "./fixed-step";

export interface GameLoopCallbacks {
  update(step: number): void;
  render(alpha: number): void;
}

export class GameLoop {
  private readonly timer = new FixedStepAccumulator();
  private running = false;
  private frameId: number | null = null;
  private previousTime: number | null = null;

  constructor(private readonly callbacks: GameLoopCallbacks) {}

  start(): void {
    if (this.running) return;

    this.running = true;
    this.previousTime = null;
    this.frameId = requestAnimationFrame(this.frame);
  }

  stop(): void {
    this.running = false;

    if (this.frameId !== null) {
      cancelAnimationFrame(this.frameId);
    }

    this.frameId = null;
    this.previousTime = null;
    this.timer.reset();
  }

  private readonly frame = (time: number): void => {
    if (!this.running) return;

    if (this.previousTime === null) {
      this.previousTime = time;
    }

    const elapsed = (time - this.previousTime) / 1000;
    this.previousTime = time;

    const { alpha } = this.timer.advance(
      elapsed,
      this.callbacks.update,
    );

    this.callbacks.render(alpha);
    this.frameId = requestAnimationFrame(this.frame);
  };
}
