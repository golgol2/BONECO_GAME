import {
  Assets,
  Texture,
} from "pixi.js";

import type {
  WorldMaterialSet,
} from "@boneco/world";

export interface WorldMaterialTextures {
  floor: Texture;
  wall: Texture;
  roof: Texture;
  door: Texture;
  window?: Texture;
}

const MATERIAL_ASSETS:
  Readonly<Record<string, string>> = {
    "floor.dark_stone_01":
      "/assets/materials/floor/dark_stone_01.png",

    "wall.dark_plaster_01":
      "/assets/materials/wall/dark_plaster_01.png",

    "roof.dark_shingle_01":
      "/assets/materials/roof/dark_shingle_01.png",

    "door.dark_door_01":
      "/assets/materials/door/dark_door_01.png",
  };

export function getMaterialAssetUrl(
  materialId: string,
): string {
  const url =
    MATERIAL_ASSETS[materialId];

  if (!url) {
    throw new Error(
      `Material desconhecido: ${materialId}`,
    );
  }

  return url;
}

export async function loadWorldMaterialTextures(
  materials: WorldMaterialSet,
): Promise<WorldMaterialTextures> {
  const [
    floor,
    wall,
    roof,
    door,
  ] = await Promise.all([
    Assets.load<Texture>(
      getMaterialAssetUrl(
        materials.floor,
      ),
    ),

    Assets.load<Texture>(
      getMaterialAssetUrl(
        materials.wall,
      ),
    ),

    Assets.load<Texture>(
      getMaterialAssetUrl(
        materials.roof,
      ),
    ),

    Assets.load<Texture>(
      getMaterialAssetUrl(
        materials.door,
      ),
    ),
  ]);

  let windowTexture:
    Texture | undefined;

  if (materials.window) {
    windowTexture =
      await Assets.load<Texture>(
        getMaterialAssetUrl(
          materials.window,
        ),
      );
  }

  return {
    floor,
    wall,
    roof,
    door,
    window: windowTexture,
  };
}
