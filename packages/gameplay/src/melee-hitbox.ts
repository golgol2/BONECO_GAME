export type CardinalDirection =
  | "up"
  | "down"
  | "left"
  | "right";

export interface WorldAabb {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface MeleeHitboxConfig {
  reach: number;
  thickness: number;
  offset: number;
}

export function createMeleeHitbox(
  originX: number,
  originY: number,
  direction: CardinalDirection,
  config: MeleeHitboxConfig,
): WorldAabb {
  const {
    reach,
    thickness,
    offset,
  } = config;

  if (
    reach <= 0 ||
    thickness <= 0 ||
    offset < 0
  ) {
    throw new Error(
      "Configuração de hitbox inválida",
    );
  }

  const halfThickness = thickness / 2;

  switch (direction) {
    case "right":
      return {
        x: originX + offset,
        y: originY - halfThickness,
        width: reach,
        height: thickness,
      };

    case "left":
      return {
        x: originX - offset - reach,
        y: originY - halfThickness,
        width: reach,
        height: thickness,
      };

    case "down":
      return {
        x: originX - halfThickness,
        y: originY + offset,
        width: thickness,
        height: reach,
      };

    case "up":
      return {
        x: originX - halfThickness,
        y: originY - offset - reach,
        width: thickness,
        height: reach,
      };
  }
}
