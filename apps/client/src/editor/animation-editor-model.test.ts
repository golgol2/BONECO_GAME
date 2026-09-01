import {
  describe,
  expect,
  it,
} from "vitest";

import {
  ANIMATION_VIDEO_SOURCES,
} from "./animation-editor-model";

describe(
  "animation editor sources",
  () => {
    it(
      "registra os nove vídeos",
      () => {
        expect(
          ANIMATION_VIDEO_SOURCES,
        ).toHaveLength(9);
      },
    );

    it(
      "espelha caminhada direita para esquerda",
      () => {
        const walk =
          ANIMATION_VIDEO_SOURCES.find(
            (source) =>
              source.id ===
              "walk_right",
          );

        expect(
          walk?.mirroredDirection,
        ).toBe("left");
      },
    );

    it(
      "registra corrida lateral real",
      () => {
        const run =
          ANIMATION_VIDEO_SOURCES.find(
            (source) =>
              source.id ===
              "run_right",
          );

        expect(run).toBeDefined();

        expect(
          run?.fileName,
        ).toBe(
          "CORRENDO_PARA_DIREITA.mp4",
        );

        expect(
          run?.state,
        ).toBe("run");

        expect(
          run?.direction,
        ).toBe("right");

        expect(
          run?.kind,
        ).toBe("loop");

        expect(
          run?.mirroredDirection,
        ).toBe("left");
      },
    );

    it(
      "mantém resolução real da corrida lateral",
      () => {
        const run =
          ANIMATION_VIDEO_SOURCES.find(
            (source) =>
              source.id ===
              "run_right",
          );

        expect(
          run?.width,
        ).toBe(944);

        expect(
          run?.height,
        ).toBe(944);

        expect(
          run?.fps,
        ).toBe(24);

        expect(
          run?.frameCount,
        ).toBe(145);
      },
    );

    it(
      "mantém resolução real da corrida frontal",
      () => {
        const run =
          ANIMATION_VIDEO_SOURCES.find(
            (source) =>
              source.id ===
              "run_down",
          );

        expect(
          run?.width,
        ).toBe(944);

        expect(
          run?.height,
        ).toBe(944);
      },
    );
    it(
      "registra idle frontal real",
      () => {
        const idle =
          ANIMATION_VIDEO_SOURCES.find(
            (source) =>
              source.id ===
              "idle_down",
          );

        expect(
          idle,
        ).toBeDefined();

        expect(
          idle?.fileName,
        ).toBe(
          "PARADO_DE_FRENTE.mp4",
        );

        expect(
          idle?.state,
        ).toBe(
          "idle",
        );

        expect(
          idle?.direction,
        ).toBe(
          "down",
        );

        expect(
          idle?.kind,
        ).toBe(
          "loop",
        );

        expect(
          idle?.width,
        ).toBe(944);

        expect(
          idle?.height,
        ).toBe(944);

        expect(
          idle?.fps,
        ).toBe(24);

        expect(
          idle?.frameCount,
        ).toBe(145);
      },
    );

  },
);
