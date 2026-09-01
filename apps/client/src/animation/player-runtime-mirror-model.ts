import type {
  FacingDirection,
} from "@boneco/shared";

export function shouldMirrorRuntimeAnimation(
  facing:
    FacingDirection,
  mirrorX: boolean,
): boolean {
  return (
    facing === "left" &&
    mirrorX
  );
}
