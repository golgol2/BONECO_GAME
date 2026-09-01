export const WORLD_LAYER_ORDER = {
  sky: -1000,
  farBackground: 0,
  backgroundProps: 100,
  floor: 200,
  backProps: 300,
  entities: 1000,
  frontProps: 2000,
  foreground: 4000,
  lighting: 4500,
  vfx: 5000,
  foregroundVfx: 6000,
} as const;

export const UI_LAYER_ORDER = 10000;

export function ySortValue(
  footY: number,
  offset = 0,
): number {
  return (
    WORLD_LAYER_ORDER.entities +
    footY +
    offset
  );
}
