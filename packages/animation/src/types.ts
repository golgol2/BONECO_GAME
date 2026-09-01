export const SOCKET_NAMES = [
  "ROOT",
  "FOOT_L",
  "FOOT_R",
  "HAND_L",
  "HAND_R",
  "WEAPON_GRIP",
  "WEAPON_CENTER",
  "WEAPON_TIP",
  "CORE",
  "HEAD",
  "VFX_ORIGIN",
] as const;

export type SocketName =
  (typeof SOCKET_NAMES)[number];

export type AnimationState =
  | "idle"
  | "walk"
  | "run"
  | "jump"
  | "attack"
  | "defend"
  | "hurt"
  | "death"
  | "interact"
  | "ability";

export interface SocketTransform {
  x: number;
  y: number;
  rotation: number;
  scaleX: number;
  scaleY: number;
}

export type FrameSockets = Record<
  SocketName,
  SocketTransform
>;

export interface AnimationEvent {
  type: string;
  value?: string;
}

export interface AnimationFrameDefinition {
  id: string;
  durationMs: number;
  sockets: FrameSockets;
  events?: readonly AnimationEvent[];
}

export interface AnimationClipDefinition {
  id: string;
  state: AnimationState;
  loop: boolean;
  frames: readonly AnimationFrameDefinition[];
}
