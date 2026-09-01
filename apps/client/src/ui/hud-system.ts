import {
  Container,
  Graphics,
  Text,
} from "pixi.js";

import {
  buildHudViewModel,
  type HudSnapshot,
} from "./hud-model";

const HEALTH_WIDTH = 260;
const HEALTH_HEIGHT = 22;

export class HudSystem {
  readonly container =
    new Container();

  private readonly background =
    new Graphics();

  private readonly healthBackground =
    new Graphics();

  private readonly healthFill =
    new Graphics();

  private readonly healthText =
    new Text({
      text: "",
      style: {
        fill: "#ffffff",
        fontFamily: "monospace",
        fontSize: 15,
        fontWeight: "bold",
      },
    });

  private readonly stateText =
    new Text({
      text: "",
      style: {
        fill: "#c7ccd5",
        fontFamily: "monospace",
        fontSize: 14,
      },
    });

  private readonly equipmentText =
    new Text({
      text: "",
      style: {
        fill: "#ffd4e7",
        fontFamily: "monospace",
        fontSize: 14,
      },
    });

  private readonly inventoryText =
    new Text({
      text: "",
      style: {
        fill: "#f0e8ff",
        fontFamily: "monospace",
        fontSize: 15,
        lineHeight: 21,
      },
    });

  private readonly controlsText =
    new Text({
      text:
        "WASD / SETAS: mover  •  ESPAÇO: atacar",
      style: {
        fill: "#9da6b4",
        fontFamily: "monospace",
        fontSize: 13,
      },
    });

  constructor() {
    this.background
      .roundRect(
        16,
        16,
        330,
        160,
        12,
      )
      .fill({
        color: "#080b10",
        alpha: 0.82,
      })
      .stroke({
        width: 2,
        color: "#303846",
        alpha: 0.9,
      });

    this.healthBackground
      .roundRect(
        32,
        54,
        HEALTH_WIDTH,
        HEALTH_HEIGHT,
        6,
      )
      .fill("#242a34");

    this.healthFill.position.set(
      32,
      54,
    );

    this.healthText.position.set(
      36,
      84,
    );

    this.stateText.position.set(
      36,
      108,
    );

    this.equipmentText.position.set(
      36,
      132,
    );

    this.inventoryText.position.set(
      930,
      24,
    );

    this.controlsText.position.set(
      24,
      684,
    );

    const title = new Text({
      text: "BONECO DO ABISMO RPG",
      style: {
        fill: "#ffffff",
        fontFamily: "monospace",
        fontSize: 20,
        fontWeight: "bold",
      },
    });

    title.position.set(
      32,
      25,
    );

    this.container.addChild(
      this.background,
      this.healthBackground,
      this.healthFill,
      title,
      this.healthText,
      this.stateText,
      this.equipmentText,
      this.inventoryText,
      this.controlsText,
    );
  }

  update(
    snapshot: HudSnapshot,
  ): void {
    const view =
      buildHudViewModel(snapshot);

    this.healthFill
      .clear()
      .roundRect(
        0,
        0,
        HEALTH_WIDTH *
          view.healthRatio,
        HEALTH_HEIGHT,
        6,
      )
      .fill("#c83365");

    this.healthText.text =
      view.healthText;

    this.stateText.text =
      view.stateText;

    this.equipmentText.text =
      view.equipmentText;

    this.inventoryText.text =
      view.inventoryText;
  }

  destroy(): void {
    this.container.destroy({
      children: true,
    });
  }
}
