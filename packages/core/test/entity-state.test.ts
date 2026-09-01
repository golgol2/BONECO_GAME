import { describe, expect, it } from "vitest";

import { EntityTransform } from "../src/entity-state";

describe("EntityTransform", () => {
  it("guarda estado anterior e atual", () => {
    const transform = new EntityTransform(10, 20);

    transform.beginStep();
    transform.setPosition(30, 40);

    expect(transform.previous).toEqual({
      x: 10,
      y: 20,
    });

    expect(transform.current).toEqual({
      x: 30,
      y: 40,
    });
  });

  it("interpola entre os estados", () => {
    const transform = new EntityTransform(0, 0);

    transform.beginStep();
    transform.setPosition(100, 50);

    expect(transform.interpolated(0.5)).toEqual({
      x: 50,
      y: 25,
    });
  });

  it("limita alpha entre zero e um", () => {
    const transform = new EntityTransform(0, 0);

    transform.beginStep();
    transform.setPosition(100, 100);

    expect(transform.interpolated(2)).toEqual({
      x: 100,
      y: 100,
    });
  });
});
