export type AnimationDirection =
  | "down"
  | "up"
  | "right"
  | "none";

export type AnimationEditorKind =
  | "loop"
  | "segmented";

export interface AnimationVideoSource {
  id: string;
  fileName: string;
  assetUrl: string;
  label: string;
  state: string;
  direction:
    AnimationDirection;
  kind:
    AnimationEditorKind;
  mirroredDirection?: "left";
  width: number;
  height: number;
  fps: number;
  frameCount: number;

  /**
   * Tempo extra parado no primeiro frame
   * antes de executar cada ciclo.
   */
  firstFrameHoldMs?: number;
}

export const ANIMATION_VIDEO_SOURCES:
  readonly AnimationVideoSource[] = [
    {
      id: "crouch",
      fileName:
        "ABAIXANDO_EFICANDOABAIXADO_.mp4",
      assetUrl:
        "/assets/editor/videos/ABAIXANDO_EFICANDOABAIXADO_.mp4",
      label:
        "Abaixando / Abaixado",
      state:
        "crouch",
      direction:
        "none",
      kind:
        "segmented",
      width: 1088,
      height: 1088,
      fps: 24,
      frameCount: 145,
    },
    {
      id: "idle_down",
      fileName:
        "PARADO_DE_FRENTE.mp4",
      assetUrl:
        "/assets/editor/videos/PARADO_DE_FRENTE.mp4",
      label:
        "Parado de frente",
      state:
        "idle",
      direction:
        "down",
      kind:
        "loop",
      width: 944,
      height: 944,
      fps: 24,
      frameCount: 145,
      firstFrameHoldMs:
        10000,
    },
    {
      id: "walk_up",
      fileName:
        "ANDADO_DECOSTA.mp4",
      assetUrl:
        "/assets/editor/videos/ANDADO_DECOSTA.mp4",
      label:
        "Andando de costas",
      state:
        "walk",
      direction:
        "up",
      kind:
        "loop",
      width: 1088,
      height: 1088,
      fps: 24,
      frameCount: 145,
    },
    {
      id: "walk_down",
      fileName:
        "ANDADO_DE_FRENTE.mp4",
      assetUrl:
        "/assets/editor/videos/ANDADO_DE_FRENTE.mp4",
      label:
        "Andando de frente",
      state:
        "walk",
      direction:
        "down",
      kind:
        "loop",
      width: 1088,
      height: 1088,
      fps: 24,
      frameCount: 145,
    },
    {
      id: "walk_right",
      fileName:
        "ANDANDO_PARA_DIREITA.mp4",
      assetUrl:
        "/assets/editor/videos/ANDANDO_PARA_DIREITA.mp4",
      label:
        "Andando para direita",
      state:
        "walk",
      direction:
        "right",
      kind:
        "loop",
      mirroredDirection:
        "left",
      width: 1088,
      height: 1088,
      fps: 24,
      frameCount: 145,
    },
    {
      id: "run_up",
      fileName:
        "CORRENDO_DE_COSTA.mp4",
      assetUrl:
        "/assets/editor/videos/CORRENDO_DE_COSTA.mp4",
      label:
        "Correndo de costas",
      state:
        "run",
      direction:
        "up",
      kind:
        "loop",
      width: 1088,
      height: 1088,
      fps: 24,
      frameCount: 145,
    },
    {
      id: "run_down",
      fileName:
        "CORRENDO_DE_FRENTE.mp4",
      assetUrl:
        "/assets/editor/videos/CORRENDO_DE_FRENTE.mp4",
      label:
        "Correndo de frente",
      state:
        "run",
      direction:
        "down",
      kind:
        "loop",
      width: 944,
      height: 944,
      fps: 24,
      frameCount: 145,
    },
    {
      id: "run_right",
      fileName:
        "CORRENDO_PARA_DIREITA.mp4",
      assetUrl:
        "/assets/editor/videos/CORRENDO_PARA_DIREITA.mp4",
      label:
        "Correndo para direita",
      state:
        "run",
      direction:
        "right",
      kind:
        "loop",
      mirroredDirection:
        "left",
      width: 944,
      height: 944,
      fps: 24,
      frameCount: 145,
    },
    {
      id: "jump",
      fileName:
        "PULANDO.mp4",
      assetUrl:
        "/assets/editor/videos/PULANDO.mp4",
      label:
        "Pulando",
      state:
        "jump",
      direction:
        "none",
      kind:
        "segmented",
      mirroredDirection:
        "left",
      width: 1088,
      height: 1088,
      fps: 24,
      frameCount: 145,
    },
  ];
