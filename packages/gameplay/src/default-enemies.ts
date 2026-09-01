import type {
  EnemyDefinition,
} from "./enemy-types";

export const TRAINING_DUMMY: EnemyDefinition = {
  id: "training_dummy",
  version: 1,
  displayName: "Training Dummy",
  maxHealth: 100,
  bodyWidth: 64,
  bodyHeight: 70,
  moveSpeed: 90,
  detectionRadius: 420,
  stopDistance: 85,
  attackRange: 95,
  attackDepthRange: 42,
  attackDamage: 12,
  attackCooldownSeconds: 0.8,
  lootTableId: "training_dummy_loot",
};

export const ENEMY_DEFINITIONS:
  Readonly<Record<string, EnemyDefinition>> = {
    [TRAINING_DUMMY.id]: TRAINING_DUMMY,
  };

export function getEnemyDefinition(
  id: string,
): EnemyDefinition | undefined {
  return ENEMY_DEFINITIONS[id];
}
