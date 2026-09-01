import {
  SOCKET_NAMES,
  type AnimationClipDefinition,
} from "./types";

export function validateAnimationClip(
  clip: AnimationClipDefinition,
): string[] {
  const errors: string[] = [];

  if (!clip.id.trim()) {
    errors.push("clip.id é obrigatório");
  }

  if (clip.frames.length === 0) {
    errors.push("clip deve possuir pelo menos um frame");
  }

  const frameIds = new Set<string>();

  for (const frame of clip.frames) {
    if (!frame.id.trim()) {
      errors.push("frame.id é obrigatório");
    }

    if (frameIds.has(frame.id)) {
      errors.push(
        `frame.id duplicado: ${frame.id}`,
      );
    }

    frameIds.add(frame.id);

    if (frame.durationMs <= 0) {
      errors.push(
        `frame ${frame.id} possui duração inválida`,
      );
    }

    for (const socketName of SOCKET_NAMES) {
      if (!frame.sockets[socketName]) {
        errors.push(
          `frame ${frame.id} sem socket ${socketName}`,
        );
      }
    }
  }

  return errors;
}
