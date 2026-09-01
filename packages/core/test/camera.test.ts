import { describe, expect, it } from "vitest";

import { Camera2D } from "../src/camera";

describe("Camera2D", () => {
  const createCamera = () =>
    new Camera2D({
      worldWidth: 2400,
      worldHeight: 1600,
      viewportWidth: 1280,
      viewportHeight: 720,
    });

  it("centraliza no alvo quando há espaço", () => {
    const camera = createCamera();

    expect(camera.follow(1200, 800)).toEqual({
      x: 560,
      y: 440,
    });
  });

  it("não ultrapassa o limite superior esquerdo", () => {
    const camera = createCamera();

    expect(camera.follow(100, 100)).toEqual({
      x: 0,
      y: 0,
    });
  });

  it("não ultrapassa o limite inferior direito", () => {
    const camera = createCamera();

    expect(camera.follow(2300, 1500)).toEqual({
      x: 1120,
      y: 880,
    });
  });
});
