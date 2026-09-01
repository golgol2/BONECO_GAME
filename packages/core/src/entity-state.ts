export interface Position2D {
  x: number;
  y: number;
}

export class EntityTransform {
  readonly previous: Position2D;
  readonly current: Position2D;

  constructor(x: number, y: number) {
    this.previous = { x, y };
    this.current = { x, y };
  }

  beginStep(): void {
    this.previous.x = this.current.x;
    this.previous.y = this.current.y;
  }

  setPosition(x: number, y: number): void {
    this.current.x = x;
    this.current.y = y;
  }

  interpolated(alpha: number): Position2D {
    const safeAlpha = Math.max(0, Math.min(1, alpha));

    return {
      x:
        this.previous.x +
        (this.current.x - this.previous.x) * safeAlpha,
      y:
        this.previous.y +
        (this.current.y - this.previous.y) * safeAlpha,
    };
  }
}
