import type {
  EnemyDefinition,
} from "./enemy-types";

export type EnemyAiState =
  | "idle"
  | "chase"
  | "hurt"
  | "dead";

export interface EnemyAiInput {
  enemyX: number;
  enemyY: number;
  playerX: number;
  playerY: number;
  hurt: boolean;
  dead: boolean;
  definition: EnemyDefinition;
}

export interface EnemyAiDecision {
  state: EnemyAiState;
  moveX: number;
  moveY: number;
  distance: number;
}

export function decideEnemyAi(
  input: EnemyAiInput,
): EnemyAiDecision {
  const dx =
    input.playerX - input.enemyX;

  const dy =
    input.playerY - input.enemyY;

  const distance =
    Math.hypot(dx, dy);

  if (input.dead) {
    return {
      state: "dead",
      moveX: 0,
      moveY: 0,
      distance,
    };
  }

  if (input.hurt) {
    return {
      state: "hurt",
      moveX: 0,
      moveY: 0,
      distance,
    };
  }

  if (
    distance >
      input.definition.detectionRadius ||
    distance <=
      input.definition.stopDistance
  ) {
    return {
      state: "idle",
      moveX: 0,
      moveY: 0,
      distance,
    };
  }

  if (distance <= 0) {
    return {
      state: "idle",
      moveX: 0,
      moveY: 0,
      distance,
    };
  }

  return {
    state: "chase",
    moveX: dx / distance,
    moveY: dy / distance,
    distance,
  };
}
