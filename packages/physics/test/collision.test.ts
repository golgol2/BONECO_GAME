import { describe, expect, it } from "vitest";

import {
  circleIntersectsAabb,
  moveCircleAgainstAabbs,
} from "../src";

describe("circleIntersectsAabb", () => {
  const box = {
    x: 100,
    y: 100,
    width: 100,
    height: 100,
  };

  it("detecta círculo dentro do obstáculo", () => {
    expect(
      circleIntersectsAabb(
        { x: 150, y: 150 },
        10,
        box,
      ),
    ).toBe(true);
  });

  it("não detecta círculo distante", () => {
    expect(
      circleIntersectsAabb(
        { x: 50, y: 50 },
        10,
        box,
      ),
    ).toBe(false);
  });
});

describe("moveCircleAgainstAabbs", () => {
  const obstacles = [
    {
      x: 100,
      y: 100,
      width: 100,
      height: 100,
    },
  ];

  const collider = {
    radius: 10,
  };

  it("bloqueia movimento horizontal contra parede", () => {
    const result = moveCircleAgainstAabbs(
      { x: 80, y: 150 },
      { x: 15, y: 0 },
      collider,
      obstacles,
    );

    expect(result.position.x).toBe(80);
    expect(result.collidedX).toBe(true);
  });

  it("permite deslizar pelo eixo livre", () => {
    const result = moveCircleAgainstAabbs(
      { x: 85, y: 95 },
      { x: 15, y: 15 },
      collider,
      obstacles,
    );

    expect(result.position.x).toBe(85);
    expect(result.position.y).toBe(110);
    expect(result.collidedX).toBe(true);
    expect(result.collidedY).toBe(false);
  });
});

describe("aabbIntersectsAabb", () => {
  it("detecta sobreposição", async () => {
    const { aabbIntersectsAabb } =
      await import("../src");

    expect(
      aabbIntersectsAabb(
        {
          x: 0,
          y: 0,
          width: 20,
          height: 20,
        },
        {
          x: 10,
          y: 10,
          width: 20,
          height: 20,
        },
      ),
    ).toBe(true);
  });

  it("não detecta caixas separadas", async () => {
    const { aabbIntersectsAabb } =
      await import("../src");

    expect(
      aabbIntersectsAabb(
        {
          x: 0,
          y: 0,
          width: 10,
          height: 10,
        },
        {
          x: 20,
          y: 20,
          width: 10,
          height: 10,
        },
      ),
    ).toBe(false);
  });
});
