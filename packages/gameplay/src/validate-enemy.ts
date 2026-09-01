import type { EnemyDefinition } from "./enemy-types";

export function validateEnemyDefinition(
  enemy: EnemyDefinition,
): string[] {
  const errors: string[] = [];

  if (!enemy.id.trim()) {
    errors.push("enemy.id é obrigatório");
  }

  if (enemy.version < 1) {
    errors.push("enemy.version deve ser >= 1");
  }

  if (!enemy.displayName.trim()) {
    errors.push(
      "enemy.displayName é obrigatório",
    );
  }

  if (enemy.maxHealth <= 0) {
    errors.push(
      "enemy.maxHealth deve ser > 0",
    );
  }

  if (
    enemy.bodyWidth <= 0 ||
    enemy.bodyHeight <= 0
  ) {
    errors.push(
      "enemy body deve possuir dimensões positivas",
    );
  }

  if (enemy.moveSpeed < 0) {
    errors.push(
      "enemy.moveSpeed deve ser >= 0",
    );
  }

  if (enemy.detectionRadius < 0) {
    errors.push(
      "enemy.detectionRadius deve ser >= 0",
    );
  }

  if (enemy.stopDistance < 0) {
    errors.push(
      "enemy.stopDistance deve ser >= 0",
    );
  }

  if (
    enemy.stopDistance >
    enemy.detectionRadius
  ) {
    errors.push(
      "enemy.stopDistance não pode exceder detectionRadius",
    );
  }

  if (enemy.attackRange < 0) {
    errors.push(
      "enemy.attackRange deve ser >= 0",
    );
  }

  if (enemy.attackDamage < 0) {
    errors.push(
      "enemy.attackDamage deve ser >= 0",
    );
  }

  if (enemy.attackCooldownSeconds < 0) {
    errors.push(
      "enemy.attackCooldownSeconds deve ser >= 0",
    );
  }

  return errors;
}
