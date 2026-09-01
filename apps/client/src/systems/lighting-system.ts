import {
  Container,
  Sprite,
  Texture,
} from "pixi.js";

import type {
  PlayerLightDefinition,
  WorldLightDefinition,
} from "@boneco/world";

import {
  clamp01,
  flickerIntensity,
  isLightVisibleHorizontally,
} from "./lighting-model";

interface PlayerLightState {
  x: number;
  y: number;
  visualScale: number;
}

export interface LightingSystemOptions {
  layer: Container;
  viewportWidth: number;
  viewportHeight: number;
  ambientDarkness: number;
  playerLight:
    PlayerLightDefinition;
  staticLights:
    readonly WorldLightDefinition[];
}

export class LightingSystem {
  private readonly canvas:
    HTMLCanvasElement;

  private readonly context:
    CanvasRenderingContext2D;

  private readonly texture:
    Texture;

  private readonly overlay:
    Sprite;

  private player:
    PlayerLightState = {
      x: 0,
      y: 0,
      visualScale: 1,
    };

  constructor(
    private readonly options:
      LightingSystemOptions,
  ) {
    this.canvas =
      document.createElement(
        "canvas",
      );

    this.canvas.width =
      options.viewportWidth;

    this.canvas.height =
      options.viewportHeight;

    const context =
      this.canvas.getContext(
        "2d",
      );

    if (!context) {
      throw new Error(
        "Canvas 2D indisponível para LightingSystem",
      );
    }

    this.context =
      context;

    this.texture =
      Texture.from(
        this.canvas,
      );

    this.overlay =
      new Sprite(
        this.texture,
      );

    this.overlay.width =
      options.viewportWidth;

    this.overlay.height =
      options.viewportHeight;

    /*
     * A layer de iluminação é screen-space.
     * Ela fica por cima de todo o mundo,
     * mas abaixo da UI.
     */
    this.options.layer.addChild(
      this.overlay,
    );
  }

  updatePlayer(
    x: number,
    y: number,
    visualScale: number,
  ): void {
    this.player = {
      x,
      y,
      visualScale,
    };
  }

  render(
    timeSeconds: number,
    cameraX: number,
    cameraY: number,
  ): void {
    const {
      viewportWidth,
      viewportHeight,
      ambientDarkness,
    } = this.options;

    const context =
      this.context;

    /*
     * Primeiro cobrimos a tela com uma
     * noite quase preta.
     */
    context.globalCompositeOperation =
      "source-over";

    context.clearRect(
      0,
      0,
      viewportWidth,
      viewportHeight,
    );

    context.fillStyle =
      `rgba(0,0,0,${clamp01(
        ambientDarkness,
      )})`;

    context.fillRect(
      0,
      0,
      viewportWidth,
      viewportHeight,
    );

    /*
     * Em seguida REMOVEMOS alpha da
     * escuridão. Isso revela o cenário
     * original que já foi renderizado
     * embaixo desta camada.
     */
    context.globalCompositeOperation =
      "destination-out";

    this.drawPlayerReveal(
      cameraX,
      cameraY,
    );

    for (
      let index = 0;
      index <
      this.options.staticLights.length;
      index += 1
    ) {
      const light =
        this.options.staticLights[index];

      if (!light) {
        continue;
      }

      if (
        !isLightVisibleHorizontally(
          light.x,
          light.radius,
          cameraX,
          viewportWidth,
        )
      ) {
        continue;
      }

      const intensity =
        flickerIntensity(
          light.intensity,
          light.flicker ?? 0,
          timeSeconds,
          index * 2.173 +
            light.x * 0.013,
        );

      this.drawReveal({
        x:
          light.x -
          cameraX,
        y:
          light.y -
          cameraY +
          (light.revealOffsetY ?? 0),
        radius:
          light.radius,
        scaleY:
          light.revealScaleY ?? 1,
        intensity,
      });
    }

    context.globalCompositeOperation =
      "source-over";

    /*
     * O canvas mudou; informa a textura
     * do Pixi para enviar a nova imagem
     * ao renderer.
     */
    this.texture.source.update();
  }

  destroy(): void {
    this.overlay.destroy();
    this.texture.destroy(true);
  }

  private drawPlayerReveal(
    cameraX: number,
    cameraY: number,
  ): void {
    const definition =
      this.options.playerLight;

    /*
     * A luz não deve encolher tanto quanto
     * o sprite quando o jogador vai para
     * o fundo. Mantém um alcance mínimo
     * visualmente útil.
     */
    const perspectiveFactor =
      Math.max(
        0.9,
        this.player.visualScale,
      );

    this.drawReveal({
      x:
        this.player.x -
        cameraX,
      y:
        this.player.y -
        cameraY,
      radius:
        definition.radius *
        perspectiveFactor,
      scaleY: 1.12,
      intensity:
        definition.intensity,
    });
  }

  private drawReveal({
    x,
    y,
    radius,
    scaleY,
    intensity,
  }: {
    x: number;
    y: number;
    radius: number;
    scaleY: number;
    intensity: number;
  }): void {
    const safeRadius =
      Math.max(
        1,
        radius,
      );

    const safeIntensity =
      clamp01(
        intensity,
      );

    /*
     * Não usamos mais uma única elipse.
     *
     * A luz é formada por várias áreas
     * sobrepostas, com tamanhos, posições
     * e proporções ligeiramente diferentes.
     *
     * Isso quebra o contorno circular perfeito
     * e produz uma penumbra mais ambiental.
     */

    /*
     * Penumbra externa:
     * muito ampla e pouco intensa.
     */
    this.drawRevealLobe({
      x:
        x -
        safeRadius * 0.07,
      y:
        y +
        safeRadius * 0.035,
      radius:
        safeRadius * 1.28,
      scaleX: 1.08,
      scaleY:
        scaleY * 1.08,
      intensity:
        safeIntensity * 0.23,
    });

    /*
     * Espalhamento para o lado oposto.
     * Evita simetria perfeita.
     */
    this.drawRevealLobe({
      x:
        x +
        safeRadius * 0.085,
      y:
        y -
        safeRadius * 0.025,
      radius:
        safeRadius * 1.08,
      scaleX: 1.14,
      scaleY:
        scaleY * 0.94,
      intensity:
        safeIntensity * 0.31,
    });

    /*
     * Corpo principal da iluminação.
     */
    this.drawRevealLobe({
      x:
        x -
        safeRadius * 0.018,
      y:
        y +
        safeRadius * 0.015,
      radius:
        safeRadius * 0.88,
      scaleX: 0.96,
      scaleY,
      intensity:
        safeIntensity * 0.52,
    });

    /*
     * Região mais clara.
     * Menor e também levemente deslocada.
     */
    this.drawRevealLobe({
      x:
        x +
        safeRadius * 0.018,
      y:
        y -
        safeRadius * 0.012,
      radius:
        safeRadius * 0.56,
      scaleX: 1.02,
      scaleY:
        scaleY * 0.88,
      intensity:
        safeIntensity * 0.72,
    });
  }

  private drawRevealLobe({
    x,
    y,
    radius,
    scaleX,
    scaleY,
    intensity,
  }: {
    x: number;
    y: number;
    radius: number;
    scaleX: number;
    scaleY: number;
    intensity: number;
  }): void {
    const context =
      this.context;

    const safeRadius =
      Math.max(
        1,
        radius,
      );

    const safeScaleX =
      Math.max(
        0.1,
        scaleX,
      );

    const safeScaleY =
      Math.max(
        0.1,
        scaleY,
      );

    const safeIntensity =
      clamp01(
        intensity,
      );

    context.save();

    context.translate(
      x,
      y,
    );

    context.scale(
      safeScaleX,
      safeScaleY,
    );

    const gradient =
      context.createRadialGradient(
        0,
        0,
        0,
        0,
        0,
        safeRadius,
      );

    /*
     * Não existe mais uma área grande
     * de intensidade constante.
     *
     * A iluminação já começa a cair
     * progressivamente desde o centro.
     */
    gradient.addColorStop(
      0,
      `rgba(0,0,0,${safeIntensity})`,
    );

    gradient.addColorStop(
      0.12,
      `rgba(0,0,0,${
        safeIntensity * 0.91
      })`,
    );

    gradient.addColorStop(
      0.28,
      `rgba(0,0,0,${
        safeIntensity * 0.72
      })`,
    );

    gradient.addColorStop(
      0.47,
      `rgba(0,0,0,${
        safeIntensity * 0.48
      })`,
    );

    gradient.addColorStop(
      0.66,
      `rgba(0,0,0,${
        safeIntensity * 0.27
      })`,
    );

    gradient.addColorStop(
      0.82,
      `rgba(0,0,0,${
        safeIntensity * 0.105
      })`,
    );

    gradient.addColorStop(
      0.93,
      `rgba(0,0,0,${
        safeIntensity * 0.025
      })`,
    );

    gradient.addColorStop(
      1,
      "rgba(0,0,0,0)",
    );

    context.fillStyle =
      gradient;

    context.beginPath();

    context.arc(
      0,
      0,
      safeRadius,
      0,
      Math.PI * 2,
    );

    context.fill();

    context.restore();
  }

}
