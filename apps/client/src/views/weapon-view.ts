import {
  Container,
  Graphics,
} from "pixi.js";

import type {
  WeaponDefinition,
  WeaponHitbox,
} from "@boneco/gameplay";

import type {
  SocketTransform,
} from "@boneco/animation";

import {
  resolveWeaponTransformFromSocket,
} from "./weapon-view-model";

export class WeaponView {
  readonly container =
    new Container();

  private readonly visual =
    new Graphics();

  private readonly debugHitboxes =
    new Container();

  constructor(
    readonly definition: WeaponDefinition,
  ) {
    this.buildVisual();
    this.buildDebugHitboxes();

    this.debugHitboxes.visible = false;

    this.container.addChild(
      this.visual,
      this.debugHitboxes,
    );
  }

  setHandSocket(
    handSocket: SocketTransform,
  ): void {
    const transform =
      resolveWeaponTransformFromSocket(
        this.definition,
        handSocket,
      );

    this.container.position.set(
      transform.x,
      transform.y,
    );

    this.container.rotation =
      transform.rotation;

    this.container.scale.set(
      transform.scaleX,
      transform.scaleY,
    );
  }

  setAttackDebugVisible(
    visible: boolean,
  ): void {
    this.debugHitboxes.visible =
      visible;
  }

  private buildVisual(): void {
    const grip =
      this.definition.sockets.grip;

    const tip =
      this.definition.sockets.tip;

    const dx =
      tip.x - grip.x;

    const dy =
      tip.y - grip.y;

    const length =
      Math.max(
        1,
        Math.hypot(dx, dy),
      );

    const angle =
      Math.atan2(dy, dx);

    this.visual
      .roundRect(
        0,
        -5,
        length,
        10,
        3,
      )
      .fill("#aab2bd")
      .stroke({
        width: 2,
        color: "#f2f4f7",
      });

    this.visual.position.set(
      grip.x,
      grip.y,
    );

    this.visual.rotation =
      angle;
  }

  private buildDebugHitboxes(): void {
    for (
      const hitbox
      of this.definition.hitboxes
    ) {
      this.debugHitboxes.addChild(
        this.createHitboxGraphic(
          hitbox,
        ),
      );
    }
  }

  private createHitboxGraphic(
    hitbox: WeaponHitbox,
  ): Graphics {
    const graphic =
      new Graphics();

    if (hitbox.type === "circle") {
      graphic
        .circle(
          0,
          0,
          hitbox.radius,
        )
        .fill({
          color: "#ff3344",
          alpha: 0.2,
        })
        .stroke({
          width: 2,
          color: "#ff3344",
          alpha: 0.9,
        });

      graphic.position.set(
        hitbox.x,
        hitbox.y,
      );

      return graphic;
    }

    graphic
      .rect(
        -hitbox.width / 2,
        -hitbox.height / 2,
        hitbox.width,
        hitbox.height,
      )
      .fill({
        color: "#ff3344",
        alpha: 0.2,
      })
      .stroke({
        width: 2,
        color: "#ff3344",
        alpha: 0.9,
      });

    graphic.position.set(
      hitbox.x,
      hitbox.y,
    );

    graphic.rotation =
      hitbox.rotation;

    return graphic;
  }
}
