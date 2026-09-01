import type {
  WeaponDefinition,
} from "./weapon-types";

export function validateWeaponDefinition(
  weapon: WeaponDefinition,
): string[] {
  const errors: string[] = [];

  if (!weapon.id.trim()) {
    errors.push("weapon.id é obrigatório");
  }

  if (weapon.version < 1) {
    errors.push("weapon.version deve ser >= 1");
  }

  if (!weapon.displayName.trim()) {
    errors.push("weapon.displayName é obrigatório");
  }

  if (!weapon.assetId.trim()) {
    errors.push("weapon.assetId é obrigatório");
  }

  if (weapon.scale.min <= 0) {
    errors.push("weapon.scale.min deve ser > 0");
  }

  if (weapon.scale.max < weapon.scale.min) {
    errors.push(
      "weapon.scale.max deve ser >= min",
    );
  }

  if (
    weapon.scale.default < weapon.scale.min ||
    weapon.scale.default > weapon.scale.max
  ) {
    errors.push(
      "weapon.scale.default deve estar entre min e max",
    );
  }

  for (const hitbox of weapon.hitboxes) {
    if (
      hitbox.type === "circle" &&
      hitbox.radius <= 0
    ) {
      errors.push(
        "hitbox circular deve possuir raio > 0",
      );
    }

    if (
      hitbox.type === "box" &&
      (
        hitbox.width <= 0 ||
        hitbox.height <= 0
      )
    ) {
      errors.push(
        "hitbox retangular deve possuir dimensões > 0",
      );
    }
  }

  return errors;
}
