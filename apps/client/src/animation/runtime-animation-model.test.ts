import {
  describe,
  expect,
  it,
} from "vitest";

import {
  runtimeAnimationFrameIndex,
  runtimeAnimationLookupDirection,
  runtimeSegmentedFrameIndex,
  validateRuntimeAnimationManifest,
  type RuntimeAnimationManifest,
} from "./runtime-animation-model";

const MANIFEST:
  RuntimeAnimationManifest = {
    schemaVersion: 1,
    id: "walk_right",
    state: "walk",
    direction: "right",
    mirrorX: true,
    loop: true,
    fps: 24,
    frameSize: {
      width: 100,
      height: 100,
    },
    anchor: {
      x: 0.5,
      y: 1,
    },
    frames: [
      {
        file:
          "frame_000.png",
        sourceFrame: 72,
        durationMs: 40,
      },
      {
        file:
          "frame_001.png",
        sourceFrame: 73,
        durationMs: 40,
      },
    ],
  };

describe(
  "runtime animation model",
  () => {
    it(
      "valida manifest correto",
      () => {
        expect(
          validateRuntimeAnimationManifest(
            MANIFEST,
          ),
        ).toEqual([]);
      },
    );

    it(
      "avança frames pelo tempo",
      () => {
        expect(
          runtimeAnimationFrameIndex(
            0,
            MANIFEST,
          ),
        ).toBe(0);

        expect(
          runtimeAnimationFrameIndex(
            45,
            MANIFEST,
          ),
        ).toBe(1);
      },
    );

    it(
      "repete o loop",
      () => {
        expect(
          runtimeAnimationFrameIndex(
            85,
            MANIFEST,
          ),
        ).toBe(0);
      },
    );

    it(
      "left procura asset right",
      () => {
        expect(
          runtimeAnimationLookupDirection(
            "left",
          ),
        ).toBe(
          "right",
        );
      },
    );
    it(
      "mantém lookup left para right em run",
      () => {
        expect(
          runtimeAnimationLookupDirection(
            "left",
          ),
        ).toBe(
          "right",
        );
      },
    );

    it(
      "rejeita velocidade runtime inválida",
      () => {
        expect(
          validateRuntimeAnimationManifest({
            ...MANIFEST,
            playbackRate: 5,
          }),
        ).toContain(
          "playbackRate inválido",
        );
      },
    );

    it(
      "mapeia progresso de animação segmentada",
      () => {
        const segmented = {
          ...MANIFEST,
          loop: false,
          playbackRate: 1,
          frames: Array.from(
            {
              length: 9,
            },
            (_, index) => ({
              file:
                `frame_${index}.png`,
              sourceFrame:
                index,
              durationMs:
                40,
            }),
          ),
          segments: {
            intro: {
              start: 0,
              end: 2,
            },
            hold: {
              start: 3,
              end: 5,
            },
            outro: {
              start: 6,
              end: 8,
            },
          },
        };

        expect(
          runtimeSegmentedFrameIndex(
            0,
            segmented,
          ),
        ).toBe(0);

        expect(
          runtimeSegmentedFrameIndex(
            0.5,
            segmented,
          ),
        ).toBeGreaterThanOrEqual(
          3,
        );

        expect(
          runtimeSegmentedFrameIndex(
            0.95,
            segmented,
          ),
        ).toBeGreaterThanOrEqual(
          6,
        );
      },
    );

    it(
      "segura primeiro frame antes de cada idle",
      () => {
        const idle = {
          ...MANIFEST,
          id:
            "idle_down",
          state:
            "idle",
          direction:
            "down",
          firstFrameHoldMs:
            10000,
          frames: [
            {
              file:
                "frame_000.png",
              sourceFrame:
                0,
              durationMs:
                100,
            },
            {
              file:
                "frame_001.png",
              sourceFrame:
                1,
              durationMs:
                100,
            },
          ],
        };

        expect(
          runtimeAnimationFrameIndex(
            0,
            idle,
          ),
        ).toBe(0);

        expect(
          runtimeAnimationFrameIndex(
            9999,
            idle,
          ),
        ).toBe(0);

        expect(
          runtimeAnimationFrameIndex(
            10150,
            idle,
          ),
        ).toBe(1);

        /*
         * 10s hold + 200ms animação.
         * Novo ciclo começa em 10200ms.
         */
        expect(
          runtimeAnimationFrameIndex(
            10201,
            idle,
          ),
        ).toBe(0);

        expect(
          runtimeAnimationFrameIndex(
            15000,
            idle,
          ),
        ).toBe(0);
      },
    );

    it(
      "rejeita pausa negativa",
      () => {
        expect(
          validateRuntimeAnimationManifest({
            ...MANIFEST,
            firstFrameHoldMs:
              -1,
          }),
        ).toContain(
          "firstFrameHoldMs inválido",
        );
      },
    );

  },
);
