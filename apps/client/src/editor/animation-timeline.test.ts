import {
  describe,
  expect,
  it,
} from "vitest";

import {
  clampFrame,
  frameProgress,
  frameToTime,
  timeToFrame,
} from "./animation-timeline";

describe(
  "animation timeline",
  () => {
    it(
      "converte frame em tempo",
      () => {
        expect(
          frameToTime(
            24,
            24,
          ),
        ).toBe(1);
      },
    );

    it(
      "converte tempo em frame",
      () => {
        expect(
          timeToFrame(
            1,
            24,
            145,
          ),
        ).toBe(24);
      },
    );

    it(
      "limita frames",
      () => {
        expect(
          clampFrame(
            -5,
            145,
          ),
        ).toBe(0);

        expect(
          clampFrame(
            999,
            145,
          ),
        ).toBe(144);
      },
    );

    it(
      "calcula progresso",
      () => {
        expect(
          frameProgress(
            72,
            145,
          ),
        ).toBeCloseTo(
          0.5,
        );
      },
    );
  },
);
