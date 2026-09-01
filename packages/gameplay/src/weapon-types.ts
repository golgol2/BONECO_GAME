import type {
  SocketTransform,
} from "@boneco/animation";

export type WeaponId = string;

export interface WeaponPivot {
  x: number;
  y: number;
}

export interface WeaponScaleRange {
  min: number;
  max: number;
  default: number;
}

export interface WeaponSocketLayout {
  grip: WeaponPivot;
  center: WeaponPivot;
  tip: WeaponPivot;
  vfxOrigin: WeaponPivot;
}

export interface CircleWeaponHitbox {
  type: "circle";
  x: number;
  y: number;
  radius: number;
}

export interface BoxWeaponHitbox {
  type: "box";
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

export type WeaponHitbox =
  | CircleWeaponHitbox
  | BoxWeaponHitbox;

export interface WeaponDefinition {
  id: WeaponId;
  version: number;
  displayName: string;
  assetId: string;
  pivot: WeaponPivot;
  sockets: WeaponSocketLayout;
  scale: WeaponScaleRange;
  hitboxes: readonly WeaponHitbox[];
}

export interface EquippedWeaponTransform {
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

export interface WeaponAttachmentInput {
  handSocket: SocketTransform;
  weaponGrip: WeaponPivot;
  scale: number;
}
