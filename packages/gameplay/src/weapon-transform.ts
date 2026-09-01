import type {
  EquippedWeaponTransform,
  WeaponAttachmentInput,
} from "./weapon-types";

export function resolveWeaponAttachment(
  input: WeaponAttachmentInput,
): EquippedWeaponTransform {
  const scale = input.scale;

  const gripOffsetX =
    input.weaponGrip.x *
    scale *
    input.handSocket.scaleX;

  const gripOffsetY =
    input.weaponGrip.y *
    scale *
    input.handSocket.scaleY;

  return {
    x:
      input.handSocket.x -
      gripOffsetX,
    y:
      input.handSocket.y -
      gripOffsetY,
    rotation:
      input.handSocket.rotation,
    scaleX:
      scale *
      input.handSocket.scaleX,
    scaleY:
      scale *
      input.handSocket.scaleY,
  };
}
