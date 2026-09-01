import type {
  WeaponDefinition,
} from "./weapon-types";

export const ABYSS_BLADE:
  WeaponDefinition = {
    id: "abyss_blade",
    version: 1,
    displayName: "Lâmina do Abismo",
    assetId: "weapon.abyss_blade",

    pivot: {
      x: 0,
      y: 0,
    },

    sockets: {
      grip: {
        x: 10,
        y: 5,
      },
      center: {
        x: 55,
        y: 5,
      },
      tip: {
        x: 100,
        y: 5,
      },
      vfxOrigin: {
        x: 100,
        y: 5,
      },
    },

    scale: {
      min: 0.75,
      max: 1.25,
      default: 1,
    },

    hitboxes: [
      {
        type: "box",
        x: 55,
        y: 5,
        width: 90,
        height: 14,
        rotation: 0,
      },
    ],
  };

export const WEAPON_DEFINITIONS:
  Readonly<Record<string, WeaponDefinition>> = {
    [ABYSS_BLADE.id]:
      ABYSS_BLADE,
  };

export function getWeaponDefinition(
  id: string,
): WeaponDefinition | undefined {
  return WEAPON_DEFINITIONS[id];
}
