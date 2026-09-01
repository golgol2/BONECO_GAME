import {
  AnimationStateMachine,
  type AnimationState,
} from "@boneco/animation";
import {
  EntityTransform,
} from "@boneco/core";
import {
  AttackController,
  DamageReceiver,
  Health,
} from "@boneco/gameplay";
import {
  moveCircleAgainstAabbs,
  type Aabb,
} from "@boneco/physics";
import type {
  FacingDirection,
  Vector2,
} from "@boneco/shared";

export interface PlayerControllerOptions {
  spawnX: number;
  spawnY: number;
  speed: number;
  runSpeedMultiplier?: number;
  jumpVelocity?: number;
  gravity?: number;
  footColliderRadius: number;
  worldWidth: number;
  worldHeight: number;
  playfieldMinY?: number;
  playfieldMaxY?: number;
  obstacles: readonly Aabb[];
  maxHealth?: number;
}

export interface PlayerDamageInput {
  amount: number;
  sourceX: number;
  sourceY: number;
  knockbackStrength: number;
  invulnerabilitySeconds: number;
}

export class PlayerController {
  readonly transform: EntityTransform;
  readonly health: Health;
  readonly damageReceiver: DamageReceiver;
  readonly attack: AttackController;
  readonly animation: AnimationStateMachine;

  facing: FacingDirection = "down";
  hurtTime = 0;

  z = 0;
  previousZ = 0;

  private zVelocity = 0;
  private jumpElapsed = 0;
  private jumpDuration = 1;

  private readonly speed: number;
  private readonly runSpeedMultiplier: number;
  private readonly jumpVelocity: number;
  private readonly gravity: number;
  private readonly footColliderRadius: number;
  private readonly worldWidth: number;
  private readonly minY: number;
  private readonly maxY: number;
  private readonly obstacles: readonly Aabb[];

  constructor(
    options: PlayerControllerOptions,
  ) {
    this.speed = options.speed;

    this.runSpeedMultiplier =
      options.runSpeedMultiplier ??
      1.55;

    if (
      this.runSpeedMultiplier < 1
    ) {
      throw new Error(
        "runSpeedMultiplier deve ser >= 1",
      );
    }

    this.jumpVelocity =
      options.jumpVelocity ??
      520;

    this.gravity =
      options.gravity ??
      1400;

    if (
      this.jumpVelocity <= 0 ||
      this.gravity <= 0
    ) {
      throw new Error(
        "parâmetros de salto devem ser positivos",
      );
    }

    this.jumpDuration =
      (
        2 *
        this.jumpVelocity
      ) /
      this.gravity;

    this.footColliderRadius =
      options.footColliderRadius;
    this.worldWidth = options.worldWidth;

    this.minY =
      options.playfieldMinY ?? 80;

    this.maxY =
      options.playfieldMaxY ??
      options.worldHeight - 40;

    if (this.maxY <= this.minY) {
      throw new Error(
        "PlayerController playfield inválido",
      );
    }

    this.obstacles = options.obstacles;

    this.transform = new EntityTransform(
      options.spawnX,
      options.spawnY,
    );

    this.health = new Health(
      options.maxHealth ?? 100,
    );

    this.damageReceiver =
      new DamageReceiver(this.health);

    this.attack =
      new AttackController({
        windupSeconds: 0.08,
        activeSeconds: 0.14,
        recoverySeconds: 0.22,
      });

    this.animation =
      new AnimationStateMachine("idle");
  }

  get dead(): boolean {
    return this.health.dead;
  }

  get airborne(): boolean {
    return (
      this.z > 0 ||
      this.zVelocity > 0
    );
  }

  get jumpProgress(): number {
    if (!this.airborne) {
      return 0;
    }

    return Math.max(
      0,
      Math.min(
        1,
        this.jumpElapsed /
          this.jumpDuration,
      ),
    );
  }

  interpolatedZ(
    alpha: number,
  ): number {
    const safeAlpha =
      Math.max(
        0,
        Math.min(
          1,
          alpha,
        ),
      );

    return (
      this.previousZ +
      (
        this.z -
        this.previousZ
      ) *
      safeAlpha
    );
  }

  update(
    step: number,
    movement: Vector2,
    attackRequested: boolean,
    runRequested = false,
    jumpRequested = false,
  ): void {
    if (
      attackRequested &&
      !this.dead &&
      this.attack.tryStart()
    ) {
      this.animation.setState("attack");
    }

    this.attack.update(step);
    this.damageReceiver.update(step);

    if (this.hurtTime > 0) {
      this.hurtTime = Math.max(
        0,
        this.hurtTime - step,
      );
    }

    this.transform.beginStep();

    this.previousZ =
      this.z;

    const canJump =
      jumpRequested &&
      !this.dead &&
      !this.airborne &&
      !this.attack.attacking &&
      this.hurtTime <= 0;

    if (canJump) {
      this.zVelocity =
        this.jumpVelocity;

      this.jumpElapsed =
        0;
    }

    if (this.airborne) {
      this.jumpElapsed +=
        step;

      this.z +=
        this.zVelocity *
        step;

      this.zVelocity -=
        this.gravity *
        step;

      if (this.z <= 0) {
        this.z =
          0;

        this.zVelocity =
          0;

        this.jumpElapsed =
          0;
      }
    }

    const canMove = !this.dead;

    const moving =
      movement.x !== 0 ||
      movement.y !== 0;

    const running =
      canMove &&
      moving &&
      runRequested &&
      !this.attack.attacking &&
      this.hurtTime <= 0;

    const movementSpeed =
      this.speed *
      (
        running
          ? this.runSpeedMultiplier
          : 1
      );

    const result = moveCircleAgainstAabbs(
      this.transform.current,
      {
        x:
          (canMove ? movement.x : 0) *
          movementSpeed *
          step,
        y:
          (canMove ? movement.y : 0) *
          movementSpeed *
          step,
      },
      {
        radius: this.footColliderRadius,
      },
      this.obstacles,
    );

    const nextX = Math.max(
      60,
      Math.min(
        this.worldWidth - 60,
        result.position.x,
      ),
    );

    const nextY = Math.max(
      this.minY,
      Math.min(
        this.maxY,
        result.position.y,
      ),
    );

    this.transform.setPosition(
      nextX,
      nextY,
    );

    this.updateFacing(movement);

    this.updateAnimationState(
      movement,
      running,
    );
  }

  face(
    direction:
      FacingDirection,
  ): void {
    this.facing =
      direction;
  }

  receiveDamage(
    input: PlayerDamageInput,
  ): boolean {
    if (this.dead) {
      return false;
    }

    const dx =
      this.transform.current.x -
      input.sourceX;

    const dy =
      this.transform.current.y -
      input.sourceY;

    const length =
      Math.hypot(dx, dy);

    const normalX =
      length > 0 ? dx / length : 0;

    const normalY =
      length > 0 ? dy / length : 0;

    const result =
      this.damageReceiver.receive({
        amount: input.amount,
        knockback: {
          x:
            normalX *
            input.knockbackStrength,
          y:
            normalY *
            input.knockbackStrength,
        },
        invulnerabilitySeconds:
          input.invulnerabilitySeconds,
      });

    if (!result.accepted) {
      return false;
    }

    this.hurtTime = 0.18;

    const nextX =
      this.transform.current.x +
      result.knockback.x * 0.08;

    const nextY =
      this.transform.current.y +
      result.knockback.y * 0.08;

    this.transform.setPosition(
      Math.max(
        60,
        Math.min(
          this.worldWidth - 60,
          nextX,
        ),
      ),
      Math.max(
        this.minY,
        Math.min(
          this.maxY,
          nextY,
        ),
      ),
    );

    return true;
  }

  private updateFacing(
    movement: Vector2,
  ): void {
    if (movement.x < 0) {
      this.facing = "left";
    } else if (movement.x > 0) {
      this.facing = "right";
    } else if (movement.y < 0) {
      this.facing = "up";
    } else if (movement.y > 0) {
      this.facing = "down";
    }
  }

  private updateAnimationState(
    movement: Vector2,
    running: boolean,
  ): void {
    let nextState: AnimationState;

    if (this.dead) {
      nextState = "death";
    } else if (this.hurtTime > 0) {
      nextState = "hurt";
    } else if (this.attack.attacking) {
      nextState = "attack";
    } else if (this.airborne) {
      nextState = "jump";
    } else if (
      movement.x !== 0 ||
      movement.y !== 0
    ) {
      nextState =
        running
          ? "run"
          : "walk";
    } else {
      nextState = "idle";
    }

    this.animation.setState(nextState);
  }
}
