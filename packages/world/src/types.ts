import type { Aabb } from "@boneco/physics";

export interface WorldLightDefinition {
  id: string;
  x: number;
  y: number;
  radius: number;
  intensity: number;
  color: number;
  flicker?: number;
  revealOffsetY?: number;
  revealScaleY?: number;
}

export interface PlayerLightDefinition {
  radius: number;
  intensity: number;
  color: number;
}

export interface WorldLightingDefinition {
  ambientDarkness: number;
  playerLight: PlayerLightDefinition;
  lights: readonly WorldLightDefinition[];
}

export interface WorldMaterialSet {
  floor: string;
  wall: string;
  roof: string;
  door: string;
  window?: string;
}

export interface WorldSize {
  width: number;
  height: number;
}

export interface PlayfieldDefinition {
  minY: number;
  maxY: number;
  groundY: number;
  farScale: number;
  nearScale: number;
}

export interface RuinDefinition {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;

  /**
   * Linha de contato visual do objeto com o chão.
   * Usada pela composição 2.5D para alinhar
   * construções e entidades na mesma perspectiva.
   */
  baseY?: number;

  collisionDepthRatio: number;
}

export interface EnemySpawnDefinition {
  id: string;
  enemyId: string;
  x: number;
  y: number;
}

export interface WorldDefinition {
  id: string;
  version: number;
  size: WorldSize;
  spawn: {
    x: number;
    y: number;
  };
  playfield: PlayfieldDefinition;
  lighting: WorldLightingDefinition;
  materials: WorldMaterialSet;
  ruins: readonly RuinDefinition[];
  enemySpawns: readonly EnemySpawnDefinition[];
}

export interface WorldCollisionData {
  obstacles: Aabb[];
}
