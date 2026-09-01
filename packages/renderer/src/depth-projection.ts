export interface DepthProjectionConfig {
  minY: number;
  maxY: number;
  farScale: number;
  nearScale: number;
}

export function depthRatio(
  y: number,
  config: DepthProjectionConfig,
): number {
  const range =
    config.maxY - config.minY;

  if (range <= 0) {
    return 0;
  }

  return Math.max(
    0,
    Math.min(
      1,
      (y - config.minY) / range,
    ),
  );
}

export function depthScale(
  y: number,
  config: DepthProjectionConfig,
): number {
  const ratio =
    depthRatio(y, config);

  return (
    config.farScale +
    (
      config.nearScale -
      config.farScale
    ) *
      ratio
  );
}
