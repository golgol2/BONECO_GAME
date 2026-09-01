import type {
  Aabb,
} from "@boneco/physics";

import type {
  RuinDefinition,
  WorldCollisionData,
  WorldDefinition,
} from "./types";

export function ruinToObstacle(
  ruin: RuinDefinition,
): Aabb {
  const ratio = Math.max(
    0,
    Math.min(
      1,
      ruin.collisionDepthRatio,
    ),
  );

  const collisionHeight =
    ruin.height * ratio;

  return {
    x: ruin.x,
    y:
      ruin.y +
      ruin.height -
      collisionHeight,
    width: ruin.width,
    height: collisionHeight,
  };
}

export function buildWorldCollisionData(
  world: WorldDefinition,
): WorldCollisionData {
  return {
    obstacles:
      world.ruins
        .map(ruinToObstacle)
        .filter(
          (obstacle) =>
            obstacle.width > 0 &&
            obstacle.height > 0,
        ),
  };
}
