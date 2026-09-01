import {
  describe,
  expect,
  it,
} from "vitest";

import {
  ANIMATION_VIDEO_SOURCES,
} from "./animation-editor-model";

import {
  createDefaultMarkers,
} from "./animation-markers";

import {
  DEFAULT_CHROMA_KEY,
} from "./chroma-key";

import {
  createAnimationProject,
  parseAnimationProject,
  serializeAnimationProject,
  validateAnimationProject,
} from "./animation-project";

describe(
  "animation project",
  () => {
    const source =
      ANIMATION_VIDEO_SOURCES[2]!;

    it(
      "cria projeto versionado",
      () => {
        const project =
          createAnimationProject(
            source,
            DEFAULT_CHROMA_KEY,
            createDefaultMarkers(
              source.kind,
              source.frameCount,
            ),
          );

        expect(
          project.schemaVersion,
        ).toBe(1);

        expect(
          project.sourceId,
        ).toBe(
          source.id,
        );
      },
    );

    it(
      "serializa e carrega",
      () => {
        const original =
          createAnimationProject(
            source,
            DEFAULT_CHROMA_KEY,
            createDefaultMarkers(
              source.kind,
              source.frameCount,
            ),
          );

        const restored =
          parseAnimationProject(
            serializeAnimationProject(
              original,
            ),
          );

        expect(
          restored,
        ).toEqual(
          original,
        );
      },
    );

    it(
      "rejeita schema incompatível",
      () => {
        expect(
          validateAnimationProject({
            schemaVersion: 999,
          }),
        ).toContain(
          "schemaVersion incompatível",
        );
      },
    );
  it(
    "salva playbackRate individual",
    () => {
      const project =
        createAnimationProject(
          source,
          DEFAULT_CHROMA_KEY,
          createDefaultMarkers(
            source.kind,
            source.frameCount,
          ),
          1.75,
        );

      expect(
        project.playbackRate,
      ).toBe(1.75);
    },
  );

  it(
    "usa 1.00x por padrão",
    () => {
      const project =
        createAnimationProject(
          source,
          DEFAULT_CHROMA_KEY,
          createDefaultMarkers(
            source.kind,
            source.frameCount,
          ),
        );

      expect(
        project.playbackRate,
      ).toBe(1);
    },
  );

  it(
    "aceita projeto antigo sem playbackRate",
    () => {
      const project =
        createAnimationProject(
          source,
          DEFAULT_CHROMA_KEY,
          createDefaultMarkers(
            source.kind,
            source.frameCount,
          ),
        );

      const legacy:
        Record<string, unknown> = {
          ...project,
        };

      delete legacy.playbackRate;

      expect(
        validateAnimationProject(
          legacy,
        ),
      ).toEqual([]);
    },
  );

  it(
    "rejeita playbackRate inválido",
    () => {
      const project =
        createAnimationProject(
          source,
          DEFAULT_CHROMA_KEY,
          createDefaultMarkers(
            source.kind,
            source.frameCount,
          ),
        );

      expect(
        validateAnimationProject({
          ...project,
          playbackRate: 4,
        }),
      ).toContain(
        "playbackRate inválido",
      );
    },
  );

  },
);
