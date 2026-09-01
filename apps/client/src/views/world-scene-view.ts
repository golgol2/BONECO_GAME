import {
  Container,
  Graphics,
  Sprite,
  TilingSprite,
} from "pixi.js";

import {
  RendererLayers,
} from "@boneco/renderer";

import {
  GAME_HEIGHT,
  GAME_WIDTH,
} from "@boneco/shared";

import type {
  RuinDefinition,
  WorldDefinition,
} from "@boneco/world";

import type {
  WorldMaterialTextures,
} from "./world-material-catalog";

import {
  getCodeHouseDoorHeight,
} from "./world-visual-metrics";

function lerp(
  from: number,
  to: number,
  amount: number,
): number {
  return Math.round(
    from +
    (to - from) * amount,
  );
}

function rgb(
  r: number,
  g: number,
  b: number,
): number {
  return (
    (r << 16) |
    (g << 8) |
    b
  );
}

function createRandom(
  seed: number,
): () => number {
  let state =
    seed >>> 0;

  return () => {
    state =
      (
        state * 1664525 +
        1013904223
      ) >>> 0;

    return (
      state /
      0xffffffff
    );
  };
}

export class WorldSceneView {
  constructor(
    private readonly layers:
      RendererLayers,
    private readonly world:
      WorldDefinition,
    private readonly materials:
      WorldMaterialTextures,
  ) {}

  build(): void {
    this.buildSky();
    this.buildFarBackground();
    this.buildGround();
    this.buildBackgroundProps();
    this.buildForeground();
  }

  private buildSky(): void {
    const sky =
      new Graphics();

    const bands = 32;

    const bandHeight =
      GAME_HEIGHT / bands;

    const top = [5, 7, 20];
    const bottom = [48, 24, 58];

    for (
      let index = 0;
      index < bands;
      index += 1
    ) {
      const amount =
        index /
        Math.max(
          1,
          bands - 1,
        );

      sky
        .rect(
          0,
          index * bandHeight,
          GAME_WIDTH,
          bandHeight + 1,
        )
        .fill(
          rgb(
            lerp(
              top[0] ?? 0,
              bottom[0] ?? 0,
              amount,
            ),
            lerp(
              top[1] ?? 0,
              bottom[1] ?? 0,
              amount,
            ),
            lerp(
              top[2] ?? 0,
              bottom[2] ?? 0,
              amount,
            ),
          ),
        );
    }

    const random =
      createRandom(2079);

    for (
      let index = 0;
      index < 90;
      index += 1
    ) {
      sky
        .circle(
          random() * GAME_WIDTH,
          random() * 330,
          0.6 + random() * 1.4,
        )
        .fill({
          color: "#d9dcff",
          alpha:
            0.35 +
            random() * 0.55,
        });
    }

    sky
      .circle(
        GAME_WIDTH - 150,
        112,
        48,
      )
      .fill({
        color: "#d9d6e7",
        alpha: 0.86,
      });

    sky
      .circle(
        GAME_WIDTH - 128,
        94,
        48,
      )
      .fill({
        color: "#090b1d",
        alpha: 0.92,
      });

    this.layers.sky.addChild(
      sky,
    );
  }

  private buildFarBackground(): void {
    const silhouette =
      new Graphics();

    silhouette
      .moveTo(0, 380)
      .lineTo(280, 310)
      .lineTo(560, 365)
      .lineTo(850, 280)
      .lineTo(1120, 350)
      .lineTo(1450, 295)
      .lineTo(1800, 360)
      .lineTo(2200, 300)
      .lineTo(2600, 350)
      .lineTo(3200, 300)
      .lineTo(3200, 440)
      .lineTo(0, 440)
      .closePath()
      .fill("#101522");

    this.layers.farBackground.addChild(
      silhouette,
    );
  }

  private buildGround(): void {
    const horizonY =
      this.world.playfield.minY - 35;

    const groundHeight =
      this.world.size.height -
      horizonY;

    const floor =
      new TilingSprite({
        texture:
          this.materials.floor,
        width:
          this.world.size.width,
        height:
          groundHeight,
      });

    floor.position.set(
      0,
      horizonY,
    );

    /*
     * Tile grande para teste.
     * Posteriormente o editor poderá
     * controlar escala e repetição.
     */
    floor.tileScale.set(
      0.34,
      0.34,
    );

    this.layers.floor.addChild(
      floor,
    );

    /*
     * Overlay leve preserva a leitura
     * da perspectiva durante o teste.
     */
    const perspective =
      new Graphics();

    const bottomY =
      this.world.size.height;

    const depthLines = 8;

    for (
      let index = 0;
      index <= depthLines;
      index += 1
    ) {
      const ratio =
        index / depthLines;

      const projected =
        ratio ** 1.65;

      const y =
        horizonY +
        (
          bottomY -
          horizonY
        ) *
          projected;

      perspective
        .moveTo(
          0,
          y,
        )
        .lineTo(
          this.world.size.width,
          y,
        )
        .stroke({
          width: 1,
          color: "#15191f",
          alpha: 0.22,
        });
    }

    this.layers.floor.addChild(
      perspective,
    );
  }

  private buildBackgroundProps(): void {
    for (
      const ruin
      of this.world.ruins
    ) {
      this.layers.backgroundProps.addChild(
        this.createCodeHouse(
          ruin,
        ),
      );
    }
  }

  private createCodeHouse(
    definition: RuinDefinition,
  ): Container {
    const house =
      new Container();

    const {
      x,
      width,
      height,
    } = definition;

    const baseY =
      definition.baseY ??
      definition.y +
        definition.height;

    const y =
      baseY - height;

    const roofHeight = 54;

    const wall =
      new TilingSprite({
        texture:
          this.materials.wall,
        width,
        height:
          height - roofHeight,
      });

    wall.position.set(
      x,
      y + roofHeight,
    );

    wall.tileScale.set(
      0.20,
      0.20,
    );

    house.addChild(
      wall,
    );

    /*
     * O telhado usa a textura dentro de
     * uma máscara triangular.
     */
    const roof =
      new TilingSprite({
        texture:
          this.materials.roof,
        width:
          width + 32,
        height:
          roofHeight + 8,
      });

    roof.position.set(
      x - 16,
      y,
    );

    roof.tileScale.set(
      0.16,
      0.16,
    );

    const roofMask =
      new Graphics()
        .moveTo(
          x - 16,
          y + roofHeight,
        )
        .lineTo(
          x + width * 0.5,
          y,
        )
        .lineTo(
          x + width + 16,
          y + roofHeight,
        )
        .closePath()
        .fill("#ffffff");

    roof.mask =
      roofMask;

    house.addChild(
      roof,
      roofMask,
    );

    const doorWidth =
      Math.max(
        54,
        width * 0.18,
      );

    const doorHeight =
      getCodeHouseDoorHeight(
        definition,
      );

    const door =
      new Sprite(
        this.materials.door,
      );

    door.width =
      doorWidth;

    door.height =
      doorHeight;

    door.position.set(
      x +
        width * 0.5 -
        doorWidth / 2,
      baseY -
        doorHeight,
    );

    house.addChild(
      door,
    );

    const windowY =
      baseY -
      doorHeight +
      22;

    if (
      this.materials.window
    ) {
      const leftWindow =
        new Sprite(
          this.materials.window,
        );

      const rightWindow =
        new Sprite(
          this.materials.window,
        );

      const windowWidth =
        width * 0.18;

      const windowHeight = 54;

      leftWindow.width =
        windowWidth;

      leftWindow.height =
        windowHeight;

      rightWindow.width =
        windowWidth;

      rightWindow.height =
        windowHeight;

      leftWindow.position.set(
        x +
          width * 0.12,
        windowY,
      );

      rightWindow.position.set(
        x +
          width * 0.70,
        windowY,
      );

      house.addChild(
        leftWindow,
        rightWindow,
      );
    } else {
      /*
       * Fallback enquanto não existe
       * Window Texture no catálogo.
       */
      const windows =
        new Graphics();

      windows
        .rect(
          x +
            width * 0.12,
          windowY,
          width * 0.18,
          54,
        )
        .fill("#121621")
        .stroke({
          width: 3,
          color: "#505867",
        });

      windows
        .rect(
          x +
            width * 0.70,
          windowY,
          width * 0.18,
          54,
        )
        .fill("#121621")
        .stroke({
          width: 3,
          color: "#505867",
        });

      house.addChild(
        windows,
      );
    }

    return house;
  }

  private buildForeground(): void {
    const lamp =
      this.world.lighting.lights[0];

    const bulbX =
      lamp?.x ??
      this.world.spawn.x + 402;

    const bulbY =
      lamp?.y ??
      288;

    const postX =
      bulbX - 12;

    const post =
      new Graphics();

    post
      .rect(
        postX,
        bulbY - 13,
        24,
        this.world.size.height -
          (bulbY - 13),
      )
      .fill("#11151b")
      .stroke({
        width: 3,
        color: "#3b424d",
      });

    post
      .roundRect(
        postX - 25,
        bulbY - 20,
        74,
        38,
        8,
      )
      .fill("#171c24")
      .stroke({
        width: 3,
        color: "#454d5a",
      });

    post
      .circle(
        bulbX,
        bulbY,
        11,
      )
      .fill({
        color: "#d5c58e",
        alpha: 0.75,
      });

    this.layers.foreground.addChild(
      post,
    );
  }
}
