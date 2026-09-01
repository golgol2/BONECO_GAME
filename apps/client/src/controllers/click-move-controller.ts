import type {
  FacingDirection,
  Vector2,
} from "@boneco/shared";

export interface WorldPoint {
  x: number;
  y: number;
}

export interface ClickMoveEnemyTarget {
  id: string;
  x: number;
  y: number;
  dead: boolean;
}

export interface ClickMoveUpdateInput {
  player: WorldPoint;
  targetEnemy?: ClickMoveEnemyTarget;
}

export interface ClickMoveUpdateResult {
  movement: Vector2;
  attackRequested: boolean;
  facing?: FacingDirection;
  destinationReached: boolean;
}

const ZERO: Vector2 = {
  x: 0,
  y: 0,
};

export class ClickMoveController {
  private destination:
    WorldPoint | undefined;

  private targetEnemyId:
    string | undefined;

  private axis:
    "x" | "y" | undefined;

  constructor(
    private readonly arrivalTolerance = 6,
    private readonly attackRange = 92,
    private readonly attackAlignmentTolerance = 26,
  ) {
    if (
      arrivalTolerance < 0 ||
      attackRange <= 0 ||
      attackAlignmentTolerance < 0
    ) {
      throw new Error(
        "configuração do ClickMoveController inválida",
      );
    }
  }

  get active(): boolean {
    return (
      this.destination !== undefined ||
      this.targetEnemyId !== undefined
    );
  }

  get selectedEnemyId():
    string | undefined {
    return this.targetEnemyId;
  }

  moveTo(
    destination: WorldPoint,
    player?: WorldPoint,
  ): void {
    this.targetEnemyId =
      undefined;

    this.destination = {
      x: destination.x,
      y: destination.y,
    };

    this.axis =
      player
        ? this.chooseFirstAxis(
            player,
            destination,
          )
        : undefined;
  }

  attackEnemy(
    enemyId: string,
  ): void {
    if (!enemyId.trim()) {
      throw new Error(
        "enemyId obrigatório",
      );
    }

    this.destination =
      undefined;

    this.targetEnemyId =
      enemyId;

    this.axis =
      undefined;
  }

  cancel(): void {
    this.destination =
      undefined;

    this.targetEnemyId =
      undefined;

    this.axis =
      undefined;
  }

  update(
    input: ClickMoveUpdateInput,
  ): ClickMoveUpdateResult {
    if (
      this.targetEnemyId
    ) {
      return this.updateEnemyTarget(
        input.player,
        input.targetEnemy,
      );
    }

    if (
      this.destination
    ) {
      return this.updateDestination(
        input.player,
        this.destination,
      );
    }

    return {
      movement: ZERO,
      attackRequested: false,
      destinationReached: true,
    };
  }

  private updateDestination(
    player: WorldPoint,
    destination: WorldPoint,
  ): ClickMoveUpdateResult {
    const dx =
      destination.x -
      player.x;

    const dy =
      destination.y -
      player.y;

    const xReached =
      Math.abs(dx) <=
      this.arrivalTolerance;

    const yReached =
      Math.abs(dy) <=
      this.arrivalTolerance;

    if (
      xReached &&
      yReached
    ) {
      this.destination =
        undefined;

      this.axis =
        undefined;

      return {
        movement: ZERO,
        attackRequested: false,
        destinationReached: true,
      };
    }

    if (!this.axis) {
      this.axis =
        this.chooseFirstAxis(
          player,
          destination,
        );
    }

    if (
      this.axis === "x" &&
      xReached
    ) {
      this.axis =
        "y";
    } else if (
      this.axis === "y" &&
      yReached
    ) {
      this.axis =
        "x";
    }

    const movement =
      this.axis === "x"
        ? {
            x:
              this.signWithTolerance(
                dx,
              ),
            y: 0,
          }
        : {
            x: 0,
            y:
              this.signWithTolerance(
                dy,
              ),
          };

    return {
      movement,
      attackRequested: false,
      destinationReached: false,
    };
  }

  private updateEnemyTarget(
    player: WorldPoint,
    enemy:
      ClickMoveEnemyTarget | undefined,
  ): ClickMoveUpdateResult {
    if (
      !enemy ||
      enemy.dead ||
      enemy.id !==
        this.targetEnemyId
    ) {
      this.cancel();

      return {
        movement: ZERO,
        attackRequested: false,
        destinationReached: true,
      };
    }

    const dx =
      enemy.x -
      player.x;

    const dy =
      enemy.y -
      player.y;

    const absX =
      Math.abs(dx);

    const absY =
      Math.abs(dy);

    /*
     * Escolhe o eixo principal do golpe.
     * Antes de atacar, alinha o outro eixo.
     * Assim nunca precisamos de ataque diagonal.
     */
    const horizontalAttack =
      absX >= absY;

    if (horizontalAttack) {
      if (
        absY >
        this.attackAlignmentTolerance
      ) {
        return {
          movement: {
            x: 0,
            y:
              this.signWithTolerance(
                dy,
              ),
          },
          attackRequested: false,
          destinationReached: false,
        };
      }

      if (
        absX >
        this.attackRange
      ) {
        return {
          movement: {
            x:
              this.signWithTolerance(
                dx,
              ),
            y: 0,
          },
          attackRequested: false,
          destinationReached: false,
        };
      }

      return {
        movement: ZERO,
        attackRequested: true,
        facing:
          dx < 0
            ? "left"
            : "right",
        destinationReached: true,
      };
    }

    if (
      absX >
      this.attackAlignmentTolerance
    ) {
      return {
        movement: {
          x:
            this.signWithTolerance(
              dx,
            ),
          y: 0,
        },
        attackRequested: false,
        destinationReached: false,
      };
    }

    if (
      absY >
      this.attackRange
    ) {
      return {
        movement: {
          x: 0,
          y:
            this.signWithTolerance(
              dy,
            ),
        },
        attackRequested: false,
        destinationReached: false,
      };
    }

    return {
      movement: ZERO,
      attackRequested: true,
      facing:
        dy < 0
          ? "up"
          : "down",
      destinationReached: true,
    };
  }

  private chooseFirstAxis(
    player: WorldPoint,
    destination: WorldPoint,
  ): "x" | "y" {
    const dx =
      Math.abs(
        destination.x -
        player.x,
      );

    const dy =
      Math.abs(
        destination.y -
        player.y,
      );

    /*
     * Faz primeiro o maior deslocamento.
     * Isso reduz curvas pequenas e deixa
     * a movimentação mais intencional.
     */
    return dx >= dy
      ? "x"
      : "y";
  }

  private signWithTolerance(
    value: number,
  ): number {
    if (
      Math.abs(value) <=
      this.arrivalTolerance
    ) {
      return 0;
    }

    return value < 0
      ? -1
      : 1;
  }
}
