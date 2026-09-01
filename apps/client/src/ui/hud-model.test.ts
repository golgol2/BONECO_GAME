import {
  describe,
  expect,
  it,
} from "vitest";

import {
  buildHudViewModel,
} from "./hud-model";

describe("buildHudViewModel", () => {
  it("calcula proporção de vida", () => {
    const view =
      buildHudViewModel({
        healthCurrent: 75,
        healthMax: 100,
        animationState: "idle",
        inventory: [],
      });

    expect(
      view.healthRatio,
    ).toBe(0.75);

    expect(
      view.healthText,
    ).toBe("Vida 75/100");
  });

  it("limita proporção entre zero e um", () => {
    expect(
      buildHudViewModel({
        healthCurrent: 200,
        healthMax: 100,
        animationState: "idle",
        inventory: [],
      }).healthRatio,
    ).toBe(1);

    expect(
      buildHudViewModel({
        healthCurrent: -10,
        healthMax: 100,
        animationState: "idle",
        inventory: [],
      }).healthRatio,
    ).toBe(0);
  });

  it("formata inventário", () => {
    const view =
      buildHudViewModel({
        healthCurrent: 100,
        healthMax: 100,
        animationState: "walk",
        inventory: [
          {
            label:
              "Fragmento do Abismo",
            quantity: 3,
          },
          {
            label:
              "Ferro Antigo",
            quantity: 1,
          },
        ],
      });

    expect(
      view.inventoryText,
    ).toContain(
      "Fragmento do Abismo: 3",
    );

    expect(
      view.inventoryText,
    ).toContain(
      "Ferro Antigo: 1",
    );

    expect(
      view.stateText,
    ).toBe("Estado: walk");
  });
});


it("formata arma equipada", () => {
  const view =
    buildHudViewModel({
      healthCurrent: 100,
      healthMax: 100,
      animationState: "idle",
      equippedWeapon: "abyss_blade",
      inventory: [],
    });

  expect(
    view.equipmentText,
  ).toBe(
    "Arma: abyss_blade",
  );
});
