import {
  describe,
  expect,
  it,
} from "vitest";

import {
  shouldMirrorRuntimeAnimation,
} from "./player-runtime-mirror-model";

describe(
  "runtime animation mirror",
  () => {
    it(
      "espelha jump quando player olha para esquerda",
      () => {
        expect(
          shouldMirrorRuntimeAnimation(
            "left",
            true,
          ),
        ).toBe(true);
      },
    );

    it(
      "mantém original olhando para direita",
      () => {
        expect(
          shouldMirrorRuntimeAnimation(
            "right",
            true,
          ),
        ).toBe(false);
      },
    );

    it(
      "não espelha assets sem mirrorX",
      () => {
        expect(
          shouldMirrorRuntimeAnimation(
            "left",
            false,
          ),
        ).toBe(false);
      },
    );
  },
);
