import type {
  SocketTransform,
} from "@boneco/animation";

import {
  resolveWeaponAttachment,
  type EquippedWeaponTransform,
  type WeaponDefinition,
} from "@boneco/gameplay";

export function resolveWeaponTransformFromSocket(
  definition: WeaponDefinition,
  handSocket: SocketTransform,
): EquippedWeaponTransform {
  return resolveWeaponAttachment({
    handSocket,
    weaponGrip:
      definition.sockets.grip,
    scale:
      definition.scale.default,
  });
}
