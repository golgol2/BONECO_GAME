import type {
  WeaponDefinition,
  WeaponId,
} from "./weapon-types";

export class WeaponInstance {
  readonly definition: WeaponDefinition;

  private currentScale: number;

  constructor(definition: WeaponDefinition) {
    this.definition = definition;
    this.currentScale = definition.scale.default;
  }

  get id(): WeaponId {
    return this.definition.id;
  }

  get scale(): number {
    return this.currentScale;
  }

  setScale(scale: number): void {
    this.currentScale = Math.max(
      this.definition.scale.min,
      Math.min(
        this.definition.scale.max,
        scale,
      ),
    );
  }
}
