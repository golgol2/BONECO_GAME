import type {
  AnimationMarkers,
} from "./animation-markers";

import type {
  AnimationVideoSource,
} from "./animation-editor-model";

import type {
  ChromaKeySettings,
} from "./chroma-key";

export const ANIMATION_PROJECT_SCHEMA_VERSION =
  1 as const;

export interface AnimationProjectFile {
  schemaVersion:
    typeof ANIMATION_PROJECT_SCHEMA_VERSION;

  sourceId: string;
  sourceFile: string;
  state: string;
  direction: string;

  mirrorX: boolean;

  /**
   * Velocidade individual da animação.
   * Ausente em projetos antigos = 1.00x.
   */
  playbackRate?: number;

  /**
   * Pausa adicional no primeiro frame
   * antes de cada execução do loop.
   */
  firstFrameHoldMs?: number;

  chroma:
    ChromaKeySettings;

  markers:
    AnimationMarkers;
}

export function createAnimationProject(
  source:
    AnimationVideoSource,
  chroma:
    ChromaKeySettings,
  markers:
    AnimationMarkers,
  playbackRate = 1,
): AnimationProjectFile {
  if (
    !Number.isFinite(playbackRate) ||
    playbackRate < 0.25 ||
    playbackRate > 3
  ) {
    throw new Error(
      "playbackRate deve estar entre 0.25 e 3",
    );
  }

  return {
    schemaVersion:
      ANIMATION_PROJECT_SCHEMA_VERSION,

    sourceId:
      source.id,

    sourceFile:
      source.fileName,

    state:
      source.state,

    direction:
      source.direction,

    mirrorX:
      source.mirroredDirection ===
      "left",

    playbackRate,

    firstFrameHoldMs:
      source.firstFrameHoldMs ??
      0,

    chroma: {
      ...chroma,
    },

    markers: {
      ...markers,
    },
  };
}

export function validateAnimationProject(
  value:
    unknown,
): string[] {
  const errors:
    string[] = [];

  if (
    typeof value !==
      "object" ||
    value === null
  ) {
    return [
      "projeto deve ser um objeto",
    ];
  }

  const project =
    value as
      Partial<AnimationProjectFile>;

  if (
    project.schemaVersion !==
    ANIMATION_PROJECT_SCHEMA_VERSION
  ) {
    errors.push(
      "schemaVersion incompatível",
    );
  }

  if (
    typeof project.sourceId !==
      "string" ||
    !project.sourceId.trim()
  ) {
    errors.push(
      "sourceId inválido",
    );
  }

  if (
    typeof project.sourceFile !==
      "string" ||
    !project.sourceFile.trim()
  ) {
    errors.push(
      "sourceFile inválido",
    );
  }

  if (
    typeof project.state !==
    "string"
  ) {
    errors.push(
      "state inválido",
    );
  }

  if (
    typeof project.direction !==
    "string"
  ) {
    errors.push(
      "direction inválida",
    );
  }

  if (
    typeof project.mirrorX !==
    "boolean"
  ) {
    errors.push(
      "mirrorX inválido",
    );
  }

  if (
    project.playbackRate !==
      undefined &&
    (
      typeof project.playbackRate !==
        "number" ||
      !Number.isFinite(
        project.playbackRate,
      ) ||
      project.playbackRate < 0.25 ||
      project.playbackRate > 3
    )
  ) {
    errors.push(
      "playbackRate inválido",
    );
  }

  if (
    project.firstFrameHoldMs !==
      undefined &&
    (
      typeof project.firstFrameHoldMs !==
        "number" ||
      !Number.isFinite(
        project.firstFrameHoldMs,
      ) ||
      project.firstFrameHoldMs < 0 ||
      project.firstFrameHoldMs > 60000
    )
  ) {
    errors.push(
      "firstFrameHoldMs inválido",
    );
  }

  if (
    !project.chroma ||
    typeof project.chroma !==
      "object"
  ) {
    errors.push(
      "chroma ausente",
    );
  }

  if (
    !project.markers ||
    typeof project.markers !==
      "object"
  ) {
    errors.push(
      "markers ausente",
    );
  }

  return errors;
}

export function serializeAnimationProject(
  project:
    AnimationProjectFile,
): string {
  return (
    JSON.stringify(
      project,
      null,
      2,
    ) + "\n"
  );
}

export function parseAnimationProject(
  text: string,
): AnimationProjectFile {
  const value:
    unknown =
      JSON.parse(text);

  const errors =
    validateAnimationProject(
      value,
    );

  if (
    errors.length > 0
  ) {
    throw new Error(
      errors.join("; "),
    );
  }

  return value as
    AnimationProjectFile;
}
