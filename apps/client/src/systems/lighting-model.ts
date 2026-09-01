export function clamp01(
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

export function ambientTintFromDarkness(
  darkness: number,
): number {
  const brightness =
    1 - clamp01(darkness);

  const channel =
    Math.round(
      255 * brightness,
    );

  return (
    (channel << 16) |
    (channel << 8) |
    channel
  );
}

export function flickerIntensity(
  baseIntensity: number,
  flicker: number,
  timeSeconds: number,
  phase: number,
): number {
  const amount =
    clamp01(flicker);

  if (amount === 0) {
    return clamp01(
      baseIntensity,
    );
  }

  const waveA =
    Math.sin(
      timeSeconds * 17 +
      phase,
    );

  const waveB =
    Math.sin(
      timeSeconds * 31.7 +
      phase * 1.7,
    );

  const noise =
    (
      waveA * 0.65 +
      waveB * 0.35
    ) * 0.5;

  return clamp01(
    baseIntensity *
    (
      1 +
      noise * amount
    ),
  );
}

export function isLightVisibleHorizontally(
  lightX: number,
  radius: number,
  cameraX: number,
  viewportWidth: number,
): boolean {
  return (
    lightX + radius >= cameraX &&
    lightX - radius <=
      cameraX + viewportWidth
  );
}
