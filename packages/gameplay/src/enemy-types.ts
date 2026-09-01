export interface EnemyDefinition {
  id: string;
  version: number;
  displayName: string;
  maxHealth: number;
  bodyWidth: number;
  bodyHeight: number;
  moveSpeed: number;
  detectionRadius: number;
  stopDistance: number;
  attackRange: number;
  attackDepthRange: number;
  attackDamage: number;
  attackCooldownSeconds: number;
  lootTableId?: string;
}

export interface EnemySpawn {
  id: string;
  enemyId: string;
  x: number;
  y: number;
}
