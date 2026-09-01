export interface ChromaKeySettings {
  enabled: boolean;
  keyR: number;
  keyG: number;
  keyB: number;
  tolerance: number;
  feather: number;
}

export const DEFAULT_CHROMA_KEY:
  ChromaKeySettings = {
    enabled: true,
    keyR: 0,
    keyG: 255,
    keyB: 0,
    tolerance: 92,
    feather: 48,
  };

export function clampByte(
  value: number,
): number {
  return Math.max(
    0,
    Math.min(
      255,
      Math.round(value),
    ),
  );
}

export function chromaAlpha(
  r: number,
  g: number,
  b: number,
  settings:
    ChromaKeySettings,
): number {
  if (!settings.enabled) {
    return 255;
  }

  const dr =
    r - settings.keyR;

  const dg =
    g - settings.keyG;

  const db =
    b - settings.keyB;

  const distance =
    Math.sqrt(
      dr * dr +
      dg * dg +
      db * db,
    );

  const tolerance =
    Math.max(
      0,
      settings.tolerance,
    );

  const feather =
    Math.max(
      0,
      settings.feather,
    );

  if (
    distance <=
    tolerance
  ) {
    return 0;
  }

  if (
    feather <= 0 ||
    distance >=
      tolerance +
      feather
  ) {
    return 255;
  }

  const ratio =
    (
      distance -
      tolerance
    ) /
    feather;

  return clampByte(
    ratio * 255,
  );
}

export function applyChromaKey(
  data:
    Uint8ClampedArray,
  settings:
    ChromaKeySettings,
): void {
  for (
    let index = 0;
    index < data.length;
    index += 4
  ) {
    data[index + 3] =
      chromaAlpha(
        data[index] ?? 0,
        data[index + 1] ?? 0,
        data[index + 2] ?? 0,
        settings,
      );
  }
}
