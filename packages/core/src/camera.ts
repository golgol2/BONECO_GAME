export interface CameraBounds {
  worldWidth: number;
  worldHeight: number;
  viewportWidth: number;
  viewportHeight: number;
}

export interface CameraPosition {
  x: number;
  y: number;
}

export class Camera2D {
  private x = 0;
  private y = 0;

  constructor(private readonly bounds: CameraBounds) {
    this.validateBounds();
  }

  follow(targetX: number, targetY: number): CameraPosition {
    const maxX = Math.max(
      0,
      this.bounds.worldWidth - this.bounds.viewportWidth,
    );

    const maxY = Math.max(
      0,
      this.bounds.worldHeight - this.bounds.viewportHeight,
    );

    this.x = Math.max(
      0,
      Math.min(
        maxX,
        targetX - this.bounds.viewportWidth / 2,
      ),
    );

    this.y = Math.max(
      0,
      Math.min(
        maxY,
        targetY - this.bounds.viewportHeight / 2,
      ),
    );

    return this.position;
  }

  get position(): CameraPosition {
    return {
      x: this.x,
      y: this.y,
    };
  }

  private validateBounds(): void {
    const values = Object.values(this.bounds);

    if (values.some((value) => value <= 0)) {
      throw new Error(
        "Dimensões da câmera e do mundo devem ser maiores que zero.",
      );
    }
  }
}
