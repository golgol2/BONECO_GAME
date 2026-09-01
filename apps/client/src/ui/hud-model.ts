import type {
  AnimationState,
} from "@boneco/animation";

export interface HudInventoryEntry {
  label: string;
  quantity: number;
}

export interface HudSnapshot {
  healthCurrent: number;
  healthMax: number;
  animationState: AnimationState;
  equippedWeapon?: string;
  inventory: readonly HudInventoryEntry[];
}

export interface HudViewModel {
  healthRatio: number;
  healthText: string;
  stateText: string;
  equipmentText: string;
  inventoryText: string;
}

export function buildHudViewModel(
  snapshot: HudSnapshot,
): HudViewModel {
  const safeMax = Math.max(
    1,
    snapshot.healthMax,
  );

  const healthRatio = Math.max(
    0,
    Math.min(
      1,
      snapshot.healthCurrent / safeMax,
    ),
  );

  const inventoryText =
    snapshot.inventory.length === 0
      ? "Inventário: vazio"
      : [
          "Inventário",
          ...snapshot.inventory.map(
            (entry) =>
              `${entry.label}: ${entry.quantity}`,
          ),
        ].join("\n");

  return {
    healthRatio,
    healthText:
      `Vida ${snapshot.healthCurrent}/${snapshot.healthMax}`,
    stateText:
      `Estado: ${snapshot.animationState}`,
    equipmentText:
      snapshot.equippedWeapon
        ? `Arma: ${snapshot.equippedWeapon}`
        : "Arma: nenhuma",
    inventoryText,
  };
}
