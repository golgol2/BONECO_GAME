import type { Vector2 } from "@boneco/shared";

export class KeyboardInput {
  private readonly keys = new Set<string>();
  private attackQueued = false;
  private jumpQueued = false;

  constructor() {
    window.addEventListener("keydown", this.keyDown);
    window.addEventListener("keyup", this.keyUp);
    window.addEventListener("blur", this.clear);
  }

  movement(): Vector2 {
    let x = 0;
    let y = 0;

    if (this.keys.has("KeyA") || this.keys.has("ArrowLeft")) x -= 1;
    if (this.keys.has("KeyD") || this.keys.has("ArrowRight")) x += 1;
    if (this.keys.has("KeyW") || this.keys.has("ArrowUp")) y -= 1;
    if (this.keys.has("KeyS") || this.keys.has("ArrowDown")) y += 1;

    if (x !== 0 && y !== 0) {
      x *= Math.SQRT1_2;
      y *= Math.SQRT1_2;
    }

    return { x, y };
  }

  running(): boolean {
    return (
      this.keys.has(
        "ShiftLeft",
      ) ||
      this.keys.has(
        "ShiftRight",
      )
    );
  }

  consumeJump(): boolean {
    const queued =
      this.jumpQueued;

    this.jumpQueued =
      false;

    return queued;
  }

  consumeAttack(): boolean {
    const queued = this.attackQueued;
    this.attackQueued = false;
    return queued;
  }

  destroy(): void {
    window.removeEventListener("keydown", this.keyDown);
    window.removeEventListener("keyup", this.keyUp);
    window.removeEventListener("blur", this.clear);
    this.keys.clear();
    this.attackQueued = false;
    this.jumpQueued = false;
  }

  private readonly keyDown = (event: KeyboardEvent): void => {
    this.keys.add(event.code);

    if (
      event.code === "Space" &&
      !event.repeat
    ) {
      event.preventDefault();
      this.attackQueued = true;
    }

    if (
      event.code === "KeyJ" &&
      !event.repeat
    ) {
      event.preventDefault();
      this.jumpQueued = true;
    }
  };

  private readonly keyUp = (event: KeyboardEvent): void => {
    this.keys.delete(event.code);
  };

  private readonly clear = (): void => {
    this.keys.clear();
    this.attackQueued = false;
    this.jumpQueued = false;
  };
}
