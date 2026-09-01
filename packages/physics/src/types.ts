export interface Point {
  x: number;
  y: number;
}

export interface Aabb {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CircleCollider {
  radius: number;
}

export interface MoveResult {
  position: Point;
  collidedX: boolean;
  collidedY: boolean;
}
