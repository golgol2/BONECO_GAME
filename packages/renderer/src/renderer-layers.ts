import {
  Container,
} from "pixi.js";

import {
  UI_LAYER_ORDER,
  WORLD_LAYER_ORDER,
} from "./layer-order";

export class RendererLayers {
  readonly sky = new Container();

  readonly worldRoot =
    new Container();

  readonly farBackground =
    new Container();

  readonly backgroundProps =
    new Container();

  readonly floor =
    new Container();

  readonly backProps =
    new Container();

  readonly entities =
    new Container();

  readonly frontProps =
    new Container();

  readonly foreground =
    new Container();

  /*
   * Lighting fica fora de worldRoot para
   * não receber o tint ambiente aplicado
   * ao mundo. A câmera move ambos.
   */
  readonly lighting =
    new Container();

  readonly vfx =
    new Container();

  readonly foregroundVfx =
    new Container();

  readonly ui =
    new Container();

  constructor() {
    this.worldRoot.sortableChildren = true;
    this.entities.sortableChildren = true;

    this.sky.zIndex =
      WORLD_LAYER_ORDER.sky;

    this.farBackground.zIndex =
      WORLD_LAYER_ORDER.farBackground;

    this.backgroundProps.zIndex =
      WORLD_LAYER_ORDER.backgroundProps;

    this.floor.zIndex =
      WORLD_LAYER_ORDER.floor;

    this.backProps.zIndex =
      WORLD_LAYER_ORDER.backProps;

    this.entities.zIndex =
      WORLD_LAYER_ORDER.entities;

    this.frontProps.zIndex =
      WORLD_LAYER_ORDER.frontProps;

    this.foreground.zIndex =
      WORLD_LAYER_ORDER.foreground;

    this.lighting.zIndex =
      WORLD_LAYER_ORDER.lighting;

    this.vfx.zIndex =
      WORLD_LAYER_ORDER.vfx;

    this.foregroundVfx.zIndex =
      WORLD_LAYER_ORDER.foregroundVfx;

    this.ui.zIndex =
      UI_LAYER_ORDER;

    this.worldRoot.addChild(
      this.farBackground,
      this.backgroundProps,
      this.floor,
      this.backProps,
      this.entities,
      this.frontProps,
      this.foreground,
      this.vfx,
      this.foregroundVfx,
    );
  }

  setCameraPosition(
    x: number,
    y: number,
  ): void {
    this.worldRoot.position.set(
      -x,
      -y,
    );
  }

  destroy(): void {
    this.sky.destroy({
      children: true,
    });

    this.worldRoot.destroy({
      children: true,
    });

    this.lighting.destroy({
      children: true,
    });

    this.ui.destroy({
      children: true,
    });
  }
}
