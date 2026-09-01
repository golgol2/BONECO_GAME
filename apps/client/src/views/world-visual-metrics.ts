import type {
  RuinDefinition,
} from "@boneco/world";

export const PLAYER_REFERENCE_HEIGHT = 230;

/*
 * O personagem, quando estiver no mesmo
 * plano de profundidade da casa, deve ser
 * menor que a porta.
 */
export const PLAYER_TO_DOOR_RATIO = 0.82;

export function getCodeHouseDoorHeight(
  house: RuinDefinition,
): number {
  return Math.min(
    175,
    house.height * 0.63,
  );
}

export function getPlayerBaseScaleFromDoor(
  house: RuinDefinition,
  farScale: number,
): number {
  if (farScale <= 0) {
    throw new Error(
      "farScale deve ser maior que zero",
    );
  }

  const doorHeight =
    getCodeHouseDoorHeight(house);

  const desiredHeightAtHouse =
    doorHeight *
    PLAYER_TO_DOOR_RATIO;

  return (
    desiredHeightAtHouse /
    (
      PLAYER_REFERENCE_HEIGHT *
      farScale
    )
  );
}
