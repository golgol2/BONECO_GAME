import {
  describe,
  expect,
  it,
} from "vitest";

import {
  DEFAULT_CHROMA_KEY,
  applyChromaKey,
  chromaAlpha,
} from "./chroma-key";

describe(
  "chroma key",
  () => {
    it(
      "remove verde puro",
      () => {
        expect(
          chromaAlpha(
            0,
            255,
            0,
            DEFAULT_CHROMA_KEY,
          ),
        ).toBe(0);
      },
    );

    it(
      "preserva pixel distante",
      () => {
        expect(
          chromaAlpha(
            255,
            0,
            0,
            DEFAULT_CHROMA_KEY,
          ),
        ).toBe(255);
      },
    );

    it(
      "gera alpha intermediário no feather",
      () => {
        const alpha =
          chromaAlpha(
            0,
            140,
            0,
            {
              ...DEFAULT_CHROMA_KEY,
              tolerance: 90,
              feather: 60,
            },
          );

        expect(alpha)
          .toBeGreaterThan(0);

        expect(alpha)
          .toBeLessThan(255);
      },
    );

    it(
      "processa buffer RGBA",
      () => {
        const pixels =
          new Uint8ClampedArray([
            0, 255, 0, 255,
            255, 0, 0, 255,
          ]);

        applyChromaKey(
          pixels,
          DEFAULT_CHROMA_KEY,
        );

        expect(
          pixels[3],
        ).toBe(0);

        expect(
          pixels[7],
        ).toBe(255);
      },
    );
  },
);
