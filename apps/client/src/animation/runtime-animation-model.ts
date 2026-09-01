import type {
  FacingDirection,
} from "@boneco/shared";

export interface RuntimeAnimationFrame {
  file: string;
  sourceFrame: number;
  durationMs: number;
}

export interface RuntimeAnimationSegment {
  start: number;
  end: number;
}

export interface RuntimeAnimationSegments {
  intro: RuntimeAnimationSegment;
  hold: RuntimeAnimationSegment;
  outro: RuntimeAnimationSegment;
}

export interface RuntimeAnimationManifest {
  schemaVersion: number;
  id: string;
  state: string;
  direction: string;
  mirrorX: boolean;
  loop: boolean;
  fps: number;

  playbackRate?: number;

  firstFrameHoldMs?: number;

  segments?: RuntimeAnimationSegments;

  frameSize: {
    width: number;
    height: number;
  };

  anchor: {
    x: number;
    y: number;
  };

  frames:
    readonly RuntimeAnimationFrame[];
}

export function validateRuntimeAnimationManifest(
  value:
    RuntimeAnimationManifest,
): string[] {
  const errors:
    string[] = [];

  if (
    value.schemaVersion !== 1
  ) {
    errors.push(
      "schemaVersion inválido",
    );
  }

  if (!value.id.trim()) {
    errors.push(
      "id obrigatório",
    );
  }

  if (
    value.playbackRate !==
      undefined &&
    (
      !Number.isFinite(
        value.playbackRate,
      ) ||
      value.playbackRate < 0.25 ||
      value.playbackRate > 3
    )
  ) {
    errors.push(
      "playbackRate inválido",
    );
  }

  if (
    value.firstFrameHoldMs !==
      undefined &&
    (
      !Number.isFinite(
        value.firstFrameHoldMs,
      ) ||
      value.firstFrameHoldMs < 0 ||
      value.firstFrameHoldMs > 60000
    )
  ) {
    errors.push(
      "firstFrameHoldMs inválido",
    );
  }

  if (
    value.frames.length === 0
  ) {
    errors.push(
      "frames vazio",
    );
  }

  for (
    const frame
    of value.frames
  ) {
    if (
      !frame.file.trim()
    ) {
      errors.push(
        "frame.file obrigatório",
      );
    }

    if (
      frame.durationMs <= 0
    ) {
      errors.push(
        "frame.durationMs inválido",
      );
    }
  }

  return errors;
}

export function runtimeAnimationFrameIndex(
  elapsedMs: number,
  manifest:
    RuntimeAnimationManifest,
): number {
  if (
    manifest.frames.length <= 1
  ) {
    return 0;
  }

  const frameDuration =
    manifest.frames.reduce(
      (
        total,
        frame,
      ) =>
        total +
        frame.durationMs,
      0,
    );

  if (
    frameDuration <= 0
  ) {
    return 0;
  }

  const holdMs =
    Math.max(
      0,
      manifest.firstFrameHoldMs ??
      0,
    );

  /*
   * Um ciclo completo é:
   *
   * primeiro frame parado
   * -> animação inteira
   * -> primeiro frame parado
   * -> animação inteira...
   */
  const cycleDuration =
    frameDuration +
    (
      manifest.loop
        ? holdMs
        : 0
    );

  let time =
    manifest.loop
      ? (
          (
            elapsedMs %
            cycleDuration
          ) +
          cycleDuration
        ) %
        cycleDuration
      : Math.max(
          0,
          Math.min(
            frameDuration,
            elapsedMs,
          ),
        );

  if (
    manifest.loop &&
    holdMs > 0
  ) {
    if (
      time < holdMs
    ) {
      return 0;
    }

    time -=
      holdMs;
  }

  let cursor =
    0;

  for (
    let index = 0;
    index <
    manifest.frames.length;
    index += 1
  ) {
    cursor +=
      manifest.frames[
        index
      ]!.durationMs;

    if (
      time < cursor
    ) {
      return index;
    }
  }

  return (
    manifest.frames.length -
    1
  );
}

function clamp01(
  value: number,
): number {
  return Math.max(
    0,
    Math.min(
      1,
      value,
    ),
  );
}

function frameInSegment(
  progress: number,
  segment:
    RuntimeAnimationSegment,
): number {
  const start =
    Math.max(
      0,
      Math.round(
        segment.start,
      ),
    );

  const end =
    Math.max(
      start,
      Math.round(
        segment.end,
      ),
    );

  const count =
    end - start + 1;

  if (count <= 1) {
    return start;
  }

  return Math.min(
    end,
    start +
      Math.floor(
        clamp01(progress) *
        count,
      ),
  );
}

export function runtimeSegmentedFrameIndex(
  progress: number,
  manifest:
    RuntimeAnimationManifest,
): number {
  const lastFrame =
    Math.max(
      0,
      manifest.frames.length - 1,
    );

  if (!manifest.segments) {
    return Math.min(
      lastFrame,
      Math.floor(
        clamp01(progress) *
        (lastFrame + 1),
      ),
    );
  }

  const rate =
    manifest.playbackRate ??
    1;

  const adjusted =
    clamp01(
      progress * rate,
    );

  /*
   * Intro: subida inicial.
   * Hold: região central / topo.
   * Outro: descida e aterrissagem.
   */
  if (adjusted < 0.3) {
    return Math.min(
      lastFrame,
      frameInSegment(
        adjusted / 0.3,
        manifest.segments.intro,
      ),
    );
  }

  if (adjusted < 0.7) {
    return Math.min(
      lastFrame,
      frameInSegment(
        (adjusted - 0.3) /
          0.4,
        manifest.segments.hold,
      ),
    );
  }

  return Math.min(
    lastFrame,
    frameInSegment(
      (adjusted - 0.7) /
        0.3,
      manifest.segments.outro,
    ),
  );
}

export function runtimeAnimationLookupDirection(
  facing:
    FacingDirection,
): FacingDirection {
  if (
    facing === "left"
  ) {
    return "right";
  }

  return facing;
}
