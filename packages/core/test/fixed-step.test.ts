import { describe, expect, it } from "vitest";
import { FixedStepAccumulator } from "../src/fixed-step";

describe("FixedStepAccumulator", () => {
  it("executa passos fixos e mantém interpolação", () => {
    const timer = new FixedStepAccumulator(0.01);

    let updates = 0;

    const result = timer.advance(0.035, () => {
      updates += 1;
    });

    expect(updates).toBe(3);
    expect(result.updates).toBe(3);
    expect(result.alpha).toBeCloseTo(0.5);
  });

  it("limita frames excessivamente grandes", () => {
    const timer = new FixedStepAccumulator(0.01, 0.05, 10);

    const result = timer.advance(10, () => undefined);

    expect(result.updates).toBe(5);
  });
});
