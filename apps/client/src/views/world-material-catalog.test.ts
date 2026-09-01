// @vitest-environment jsdom

import {
  describe,
  expect,
  it,
} from "vitest";

import {
  getMaterialAssetUrl,
} from "./world-material-catalog";

describe(
  "world material catalog",
  () => {
    it("resolve piso", () => {
      expect(
        getMaterialAssetUrl(
          "floor.dark_stone_01",
        ),
      ).toBe(
        "/assets/materials/floor/dark_stone_01.png",
      );
    });

    it("resolve parede", () => {
      expect(
        getMaterialAssetUrl(
          "wall.dark_plaster_01",
        ),
      ).toBe(
        "/assets/materials/wall/dark_plaster_01.png",
      );
    });

    it("rejeita material desconhecido", () => {
      expect(
        () =>
          getMaterialAssetUrl(
            "wall.invalid",
          ),
      ).toThrow(
        "Material desconhecido",
      );
    });
  },
);
