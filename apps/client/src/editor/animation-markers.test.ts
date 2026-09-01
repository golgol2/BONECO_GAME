import {
  describe,
  expect,
  it,
} from "vitest";

import {
  createDefaultMarkers,
  getActiveLoopRange,
  normalizeLoopRange,
} from "./animation-markers";

describe(
  "animation markers",
  () => {
    it(
      "loop comum usa vídeo inteiro inicialmente",
      () => {
        expect(
          createDefaultMarkers(
            "loop",
            145,
          ),
        ).toMatchObject({
          loopStart: 0,
          loopEnd: 144,
        });
      },
    );

    it(
      "segmentada cria faixa HOLD",
      () => {
        const markers =
          createDefaultMarkers(
            "segmented",
            145,
          );

        expect(
          markers.holdStart,
        ).toBeLessThan(
          markers.holdEnd,
        );
      },
    );

    it(
      "corrige intervalo invertido",
      () => {
        expect(
          normalizeLoopRange(
            100,
            20,
            145,
          ),
        ).toEqual({
          start: 20,
          end: 100,
        });
      },
    );

    it(
      "segmentada usa HOLD como loop ativo",
      () => {
        expect(
          getActiveLoopRange(
            "segmented",
            {
              loopStart: 0,
              loopEnd: 144,
              holdStart: 40,
              holdEnd: 90,
            },
            145,
          ),
        ).toEqual({
          start: 40,
          end: 90,
        });
      },
    );
  },
);
