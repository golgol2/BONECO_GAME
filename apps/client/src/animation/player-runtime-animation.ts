import {
  Assets,
  Texture,
} from "pixi.js";

import type {
  FacingDirection,
} from "@boneco/shared";

import {
  shouldMirrorRuntimeAnimation,
} from "./player-runtime-mirror-model";

import {
  runtimeAnimationFrameIndex,
  runtimeAnimationLookupDirection,
  runtimeSegmentedFrameIndex,
  validateRuntimeAnimationManifest,
  type RuntimeAnimationManifest,
} from "./runtime-animation-model";

interface RuntimeAnimationClip {
  manifest:
    RuntimeAnimationManifest;

  textures:
    readonly Texture[];
}

interface RuntimeAnimationCatalogEntry {
  id: string;
  state: string;
  direction: string;
  mirrorX: boolean;
  manifest: string;
}

interface RuntimeAnimationCatalog {
  schemaVersion: number;
  clips:
    readonly RuntimeAnimationCatalogEntry[];
}

export interface RuntimeAnimationVisual {
  texture: Texture;
  flipX: boolean;
}

function clipKey(
  state: string,
  direction: string,
): string {
  return (
    `${state}:${direction}`
  );
}

export async function loadRuntimeAnimationClip(
  manifestUrl: string,
): Promise<{
  manifest:
    RuntimeAnimationManifest;
  textures:
    readonly Texture[];
}> {
  const response =
    await fetch(
      manifestUrl,
    );

  if (!response.ok) {
    throw new Error(
      (
        `Falha ao carregar ${manifestUrl}: ` +
        `HTTP ${response.status}`
      ),
    );
  }

  const manifest =
    await response.json() as
      RuntimeAnimationManifest;

  const errors =
    validateRuntimeAnimationManifest(
      manifest,
    );

  if (
    errors.length > 0
  ) {
    throw new Error(
      (
        `${manifestUrl}: ` +
        errors.join("; ")
      ),
    );
  }

  const slash =
    manifestUrl.lastIndexOf(
      "/",
    );

  const baseUrl =
    manifestUrl.slice(
      0,
      slash + 1,
    );

  const textures =
    await Promise.all(
      manifest.frames.map(
        (frame) =>
          Assets.load<Texture>(
            baseUrl +
            frame.file,
          ),
      ),
    );

  return {
    manifest,
    textures,
  };
}

export async function loadRuntimeAnimationCatalog(
  catalogUrl:
    string,
): Promise<
  readonly RuntimeAnimationClip[]
> {
  const response =
    await fetch(
      catalogUrl,
    );

  if (!response.ok) {
    throw new Error(
      `Falha ao carregar catálogo: HTTP ${response.status}`,
    );
  }

  const catalog =
    await response.json() as
      RuntimeAnimationCatalog;

  if (
    catalog.schemaVersion !== 1 ||
    !Array.isArray(
      catalog.clips,
    )
  ) {
    throw new Error(
      "Catálogo de animação inválido",
    );
  }

  return Promise.all(
    catalog.clips.map(
      (entry) =>
        loadRuntimeAnimationClip(
          entry.manifest,
        ),
    ),
  );
}

export class PlayerRuntimeAnimator {
  private readonly clips =
    new Map<
      string,
      RuntimeAnimationClip
    >();

  private activeKey:
    string | undefined;

  private elapsedMs =
    0;

  register(
    clip:
      RuntimeAnimationClip,
  ): void {
    this.clips.set(
      clipKey(
        clip.manifest.state,
        clip.manifest.direction,
      ),
      clip,
    );
  }

  update(
    state: string,
    facing:
      FacingDirection,
    stepSeconds: number,
    normalizedProgress?: number,
  ): RuntimeAnimationVisual | undefined {
    const lookupDirection =
      runtimeAnimationLookupDirection(
        facing,
      );

    const key =
      clipKey(
        state,
        lookupDirection,
      );

    let clip =
      this.clips.get(
        key,
      );

    let resolvedKey =
      key;

    if (!clip) {
      const neutralKey =
        clipKey(
          state,
          "none",
        );

      const neutralClip =
        this.clips.get(
          neutralKey,
        );

      if (neutralClip) {
        clip =
          neutralClip;

        resolvedKey =
          neutralKey;
      }
    }

    /*
     * Enquanto um run direcional ainda não
     * existir, podemos usar o walk da mesma
     * direção como fallback visual.
     *
     * O estado lógico continua sendo "run".
     */
    if (
      !clip &&
      state === "run"
    ) {
      resolvedKey =
        clipKey(
          "walk",
          lookupDirection,
        );

      clip =
        this.clips.get(
          resolvedKey,
        );
    }

    if (!clip) {
      this.activeKey =
        undefined;

      this.elapsedMs =
        0;

      return undefined;
    }

    if (
      this.activeKey !==
      resolvedKey
    ) {
      this.activeKey =
        resolvedKey;

      this.elapsedMs =
        0;
    } else {
      this.elapsedMs +=
        Math.max(
          0,
          stepSeconds,
        ) *
        1000;
    }

    const frameIndex =
      (
        normalizedProgress !==
          undefined &&
        clip.manifest.segments
      )
        ? runtimeSegmentedFrameIndex(
            normalizedProgress,
            clip.manifest,
          )
        : runtimeAnimationFrameIndex(
            this.elapsedMs,
            clip.manifest,
          );

    const texture =
      clip.textures[
        frameIndex
      ];

    if (!texture) {
      return undefined;
    }

    return {
      texture,
      /*
       * mirrorX significa que o mesmo asset
       * pode representar a direção esquerda.
       *
       * Funciona tanto para clips right
       * quanto para clips neutros (none),
       * como o jump atual.
       */
      flipX:
        shouldMirrorRuntimeAnimation(
          facing,
          clip.manifest.mirrorX,
        ),
    };
  }

  reset(): void {
    this.activeKey =
      undefined;

    this.elapsedMs =
      0;
  }
}
