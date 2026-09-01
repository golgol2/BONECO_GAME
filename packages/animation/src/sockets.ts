import {
  SOCKET_NAMES,
  type FrameSockets,
  type SocketTransform,
} from "./types";

export function createSocketTransform(
  x = 0,
  y = 0,
): SocketTransform {
  return {
    x,
    y,
    rotation: 0,
    scaleX: 1,
    scaleY: 1,
  };
}

export function createDefaultSockets(): FrameSockets {
  return Object.fromEntries(
    SOCKET_NAMES.map((name) => [
      name,
      createSocketTransform(),
    ]),
  ) as FrameSockets;
}
