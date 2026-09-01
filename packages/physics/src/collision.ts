import type {
  Aabb,
  CircleCollider,
  MoveResult,
  Point,
} from "./types";

export function circleIntersectsAabb(
  center: Point,
  radius: number,
  box: Aabb,
): boolean {
  const nearestX = Math.max(
    box.x,
    Math.min(center.x, box.x + box.width),
  );

  const nearestY = Math.max(
    box.y,
    Math.min(center.y, box.y + box.height),
  );

  const dx = center.x - nearestX;
  const dy = center.y - nearestY;

  return dx * dx + dy * dy < radius * radius;
}

function collides(
  position: Point,
  collider: CircleCollider,
  obstacles: readonly Aabb[],
): boolean {
  return obstacles.some((obstacle) =>
    circleIntersectsAabb(
      position,
      collider.radius,
      obstacle,
    ),
  );
}

export function moveCircleAgainstAabbs(
  start: Point,
  delta: Point,
  collider: CircleCollider,
  obstacles: readonly Aabb[],
): MoveResult {
  const position = {
    x: start.x,
    y: start.y,
  };

  let collidedX = false;
  let collidedY = false;

  const candidateX = {
    x: position.x + delta.x,
    y: position.y,
  };

  if (collides(candidateX, collider, obstacles)) {
    collidedX = delta.x !== 0;
  } else {
    position.x = candidateX.x;
  }

  const candidateY = {
    x: position.x,
    y: position.y + delta.y,
  };

  if (collides(candidateY, collider, obstacles)) {
    collidedY = delta.y !== 0;
  } else {
    position.y = candidateY.y;
  }

  return {
    position,
    collidedX,
    collidedY,
  };
}

export function aabbIntersectsAabb(
  a: Aabb,
  b: Aabb,
): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}
