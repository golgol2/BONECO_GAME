import {
  ANIMATION_VIDEO_SOURCES,
  type AnimationVideoSource,
} from "./animation-editor-model";

import {
  clampFrame,
  frameProgress,
  frameToTime,
  timeToFrame,
} from "./animation-timeline";

import {
  DEFAULT_CHROMA_KEY,
  applyChromaKey,
  type ChromaKeySettings,
} from "./chroma-key";

import {
  createDefaultMarkers,
  getActiveLoopRange,
  type AnimationMarkers,
} from "./animation-markers";

import {
  createAnimationProject,
  parseAnimationProject,
  serializeAnimationProject,
} from "./animation-project";

export class AnimationEditorView {
  private selectedId =
    ANIMATION_VIDEO_SOURCES[0]?.id ??
    "";

  private video:
    HTMLVideoElement | undefined;

  private frameSlider:
    HTMLInputElement | undefined;

  private frameLabel:
    HTMLElement | undefined;

  private cursor:
    HTMLElement | undefined;

  private animationFrameId:
    number | undefined;

  private previewCanvas:
    HTMLCanvasElement | undefined;

  private previewContext:
    CanvasRenderingContext2D | undefined;

  private previewOriginal =
    false;

  private loopEnabled =
    true;

  private chromaSettings:
    ChromaKeySettings = {
      ...DEFAULT_CHROMA_KEY,
    };

  private readonly markersBySource =
    new Map<
      string,
      AnimationMarkers
    >();

  private readonly playbackRateBySource =
    new Map<
      string,
      number
    >();

  private currentFrame =
    0;

  private timelineTrack:
    HTMLElement | undefined;

  private markerElements:
    Partial<
      Record<
        keyof AnimationMarkers,
        HTMLElement
      >
    > = {};

  private timelineRange:
    HTMLElement | undefined;

  private dirty =
    false;

  private dirtyIndicator:
    HTMLElement | undefined;

  constructor(
    private readonly root:
      HTMLElement,
  ) {}

  mount(): void {
    this.render();
  }

  destroy(): void {
    this.stopPreviewLoop();

    if (this.video) {
      this.video.pause();
      this.video.removeAttribute(
        "src",
      );

      this.video.load();
    }

    this.video =
      undefined;

    this.root.replaceChildren();
  }

  private render(): void {
    this.stopPreviewLoop();

    if (this.video) {
      this.video.pause();
    }

    this.video =
      undefined;

    this.frameSlider =
      undefined;

    this.frameLabel =
      undefined;

    this.cursor =
      undefined;

    this.previewCanvas =
      undefined;

    this.previewContext =
      undefined;

    this.timelineTrack =
      undefined;

    this.markerElements =
      {};

    this.timelineRange =
      undefined;

    this.dirtyIndicator =
      undefined;

    this.currentFrame =
      0;

    const selected =
      this.getSelected();

    const layout =
      document.createElement(
        "div",
      );

    layout.className =
      "animation-editor";

    layout.append(
      this.createLibrary(),
      this.createWorkspace(
        selected,
      ),
      this.createInspector(
        selected,
      ),
    );

    this.root.replaceChildren(
      layout,
    );
  }

  private createLibrary():
    HTMLElement {
    const panel =
      document.createElement(
        "aside",
      );

    panel.className =
      "editor-panel animation-library";

    const heading =
      document.createElement(
        "div",
      );

    heading.className =
      "editor-panel-heading";

    heading.innerHTML =
      `<strong>Vídeos</strong><span>${
        ANIMATION_VIDEO_SOURCES.length
      } fontes</span>`;

    const list =
      document.createElement(
        "div",
      );

    list.className =
      "animation-source-list";

    for (
      const source
      of ANIMATION_VIDEO_SOURCES
    ) {
      const button =
        document.createElement(
          "button",
        );

      button.type =
        "button";

      button.className =
        "animation-source";

      if (
        source.id ===
        this.selectedId
      ) {
        button.classList.add(
          "is-selected",
        );
      }

      const title =
        document.createElement(
          "strong",
        );

      title.textContent =
        source.label;

      const detail =
        document.createElement(
          "span",
        );

      detail.textContent =
        this.describeSource(
          source,
        );

      button.append(
        title,
        detail,
      );

      const row =
        document.createElement(
          "div",
        );

      row.className =
        "animation-source-row";

      const manage =
        document.createElement(
          "button",
        );

      manage.type =
        "button";

      manage.className =
        "animation-source-manage";

      manage.textContent =
        "⚙";

      manage.title =
        `Gerenciar ${source.label}`;

      manage.setAttribute(
        "aria-label",
        `Gerenciar ${source.label}`,
      );

      manage.addEventListener(
        "click",
        () => {
          this.openSpriteManager(
            source,
          );
        },
      );

      button.addEventListener(
        "click",
        () => {
          if (
            source.id ===
            this.selectedId
          ) {
            return;
          }

          this.selectedId =
            source.id;

          this.render();
        },
      );

      row.append(
        button,
        manage,
      );

      list.appendChild(
        row,
      );
    }

    panel.append(
      heading,
      list,
    );

    return panel;
  }

  private openSpriteManager(
    source:
      AnimationVideoSource,
  ): void {
    const dialog =
      document.createElement(
        "dialog",
      );

    dialog.className =
      "sprite-manager-dialog";

    const content =
      document.createElement(
        "div",
      );

    content.className =
      "sprite-manager-content";

    const heading =
      document.createElement(
        "div",
      );

    heading.className =
      "sprite-manager-heading";

    const headingText =
      document.createElement(
        "div",
      );

    const title =
      document.createElement(
        "strong",
      );

    title.textContent =
      "Gerenciar sprite";

    const subtitle =
      document.createElement(
        "span",
      );

    subtitle.textContent =
      `${source.label} · ${source.id}`;

    headingText.append(
      title,
      subtitle,
    );

    const close =
      document.createElement(
        "button",
      );

    close.type =
      "button";

    close.textContent =
      "×";

    close.setAttribute(
      "aria-label",
      "Fechar",
    );

    close.addEventListener(
      "click",
      () => {
        dialog.close();
      },
    );

    heading.append(
      headingText,
      close,
    );

    const description =
      document.createElement(
        "p",
      );

    description.textContent =
      "Reprocesse somente esta sprite ou substitua o vídeo-base mantendo o mesmo sourceId e a configuração existente.";

    const status =
      document.createElement(
        "div",
      );

    status.className =
      "sprite-manager-status";

    const process =
      document.createElement(
        "button",
      );

    process.type =
      "button";

    process.className =
      "sprite-manager-primary";

    process.textContent =
      "Processar / Reprocessar sprite";

    process.addEventListener(
      "click",
      () => {
        void this.processSprite(
          source,
          process,
          status,
        );
      },
    );

    const replace =
      document.createElement(
        "button",
      );

    replace.type =
      "button";

    replace.textContent =
      "Substituir vídeo-base";

    const input =
      document.createElement(
        "input",
      );

    input.type =
      "file";

    input.accept =
      "video/mp4,.mp4";

    input.hidden =
      true;

    replace.addEventListener(
      "click",
      () => {
        input.click();
      },
    );

    input.addEventListener(
      "change",
      () => {
        const file =
          input.files?.[0];

        if (!file) {
          return;
        }

        void this.replaceSourceVideo(
          source,
          file,
          replace,
          status,
        );
      },
    );

    const info =
      document.createElement(
        "div",
      );

    info.className =
      "sprite-manager-info";

    info.innerHTML =
      [
        `<span><b>Vídeo:</b> ${source.fileName}</span>`,
        `<span><b>Esperado:</b> ${source.width}×${source.height} · ${source.fps} FPS · ${source.frameCount} frames</span>`,
        "<span>A substituição incompatível é recusada para proteger os marcadores atuais.</span>",
      ].join("");

    const actions =
      document.createElement(
        "div",
      );

    actions.className =
      "sprite-manager-actions";

    actions.append(
      process,
      replace,
      input,
    );

    content.append(
      heading,
      description,
      info,
      actions,
      status,
    );

    dialog.appendChild(
      content,
    );

    dialog.addEventListener(
      "close",
      () => {
        dialog.remove();
      },
    );

    dialog.addEventListener(
      "click",
      (event) => {
        if (
          event.target ===
          dialog
        ) {
          dialog.close();
        }
      },
    );

    document.body.appendChild(
      dialog,
    );

    dialog.showModal();
  }

  private async processSprite(
    source:
      AnimationVideoSource,
    button:
      HTMLButtonElement,
    status:
      HTMLElement,
  ): Promise<void> {
    button.disabled =
      true;

    status.className =
      "sprite-manager-status";

    status.textContent =
      "Processando sprite...";

    try {
      const response =
        await fetch(
          `/__editor/process/${encodeURIComponent(
            source.id,
          )}`,
          {
            method:
              "POST",
          },
        );

      const result =
        await response.json() as {
          error?: string;
          stdout?: string;
        };

      if (!response.ok) {
        throw new Error(
          result.error ??
          `HTTP ${response.status}`,
        );
      }

      status.textContent =
        "Sprite processada. O manifest e o catálogo foram atualizados.";

      if (result.stdout) {
        console.info(
          "[animation-editor] process",
          result.stdout,
        );
      }
    } catch (error) {
      status.classList.add(
        "is-error",
      );

      status.textContent =
        error instanceof Error
          ? `Falha: ${error.message}`
          : "Falha ao processar sprite";
    } finally {
      button.disabled =
        false;
    }
  }

  private async replaceSourceVideo(
    source:
      AnimationVideoSource,
    file:
      File,
    button:
      HTMLButtonElement,
    status:
      HTMLElement,
  ): Promise<void> {
    button.disabled =
      true;

    status.className =
      "sprite-manager-status";

    status.textContent =
      "Validando e substituindo vídeo...";

    try {
      const response =
        await fetch(
          `/__editor/videos/${encodeURIComponent(
            source.id,
          )}`,
          {
            method:
              "PUT",

            headers: {
              "Content-Type":
                "video/mp4",
            },

            body:
              file,
          },
        );

      const result =
        await response.json() as {
          error?: string;
          expected?: unknown;
          received?: unknown;
        };

      if (!response.ok) {
        if (
          response.status ===
          409 &&
          result.expected &&
          result.received
        ) {
          throw new Error(
            (
              `${result.error}. ` +
              `Esperado ${JSON.stringify(
                result.expected,
              )}; recebido ${JSON.stringify(
                result.received,
              )}`
            ),
          );
        }

        throw new Error(
          result.error ??
          `HTTP ${response.status}`,
        );
      }

      status.textContent =
        "Vídeo-base substituído. O anterior foi preservado no histórico. Reprocesse a sprite para gerar os novos frames.";

      /*
       * Força o browser a abandonar o vídeo
       * anterior em cache na próxima renderização.
       */
      if (
        source.id ===
        this.selectedId
      ) {
        this.render();
      }
    } catch (error) {
      status.classList.add(
        "is-error",
      );

      status.textContent =
        error instanceof Error
          ? `Falha: ${error.message}`
          : "Falha ao substituir vídeo";
    } finally {
      button.disabled =
        false;
    }
  }

  private createWorkspace(
    source:
      AnimationVideoSource,
  ): HTMLElement {
    const workspace =
      document.createElement(
        "main",
      );

    workspace.className =
      "editor-panel animation-workspace";

    const header =
      document.createElement(
        "div",
      );

    header.className =
      "workspace-heading";

    const title =
      document.createElement(
        "div",
      );

    const label =
      document.createElement(
        "strong",
      );

    label.textContent =
      source.label;

    const file =
      document.createElement(
        "span",
      );

    file.textContent =
      source.fileName;

    title.append(
      label,
      file,
    );

    const badge =
      document.createElement(
        "span",
      );

    badge.className =
      "animation-kind-badge";

    badge.textContent =
      source.kind === "loop"
        ? "Loop"
        : "Segmentada";

    header.append(
      title,
      badge,
    );

    const projectTools =
      this.createProjectTools(
        source,
      );

    const preview =
      this.createPreview(
        source,
      );

    const transport =
      this.createTransport(
        source,
      );

    const timeline =
      this.createTimeline(
        source,
      );

    workspace.append(
      header,
      projectTools,
      preview,
      transport,
      timeline,
    );

    return workspace;
  }

  private createProjectTools(
    source:
      AnimationVideoSource,
  ): HTMLElement {
    const toolbar =
      document.createElement(
        "div",
      );

    toolbar.className =
      "animation-project-tools";

    const save =
      document.createElement(
        "button",
      );

    save.type =
      "button";

    save.textContent =
      "Salvar no projeto";

    save.addEventListener(
      "click",
      () => {
        void this.saveProjectToWorkspace(
          source,
        );
      },
    );

    const load =
      document.createElement(
        "button",
      );

    load.type =
      "button";

    load.textContent =
      "Carregar salvo";

    load.addEventListener(
      "click",
      () => {
        void this.loadProjectFromWorkspace(
          source,
        );
      },
    );

    const pathLabel =
      document.createElement(
        "span",
      );

    pathLabel.className =
      "animation-project-path";

    pathLabel.textContent =
      `content/animations/${source.id}.animation.json`;

    const dirty =
      document.createElement(
        "span",
      );

    dirty.className =
      "animation-project-status";

    this.dirtyIndicator =
      dirty;

    toolbar.append(
      save,
      load,
      pathLabel,
      dirty,
    );

    this.updateDirtyIndicator();

    return toolbar;
  }

  private async saveProjectToWorkspace(
    source:
      AnimationVideoSource,
  ): Promise<void> {
    const project =
      createAnimationProject(
        source,
        this.chromaSettings,
        this.getMarkers(
          source,
        ),
        this.getPlaybackRate(
          source,
        ),
      );

    try {
      const response =
        await fetch(
          `/__editor/animations/${encodeURIComponent(
            source.id,
          )}`,
          {
            method:
              "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              serializeAnimationProject(
                project,
              ),
          },
        );

      if (!response.ok) {
        const message =
          await response.text();

        throw new Error(
          `HTTP ${response.status}: ${message}`,
        );
      }

      this.setDirty(
        false,
      );

      this.setProjectStatus(
        `Salvo: content/animations/${source.id}.animation.json`,
        false,
      );
    } catch (error) {
      console.error(
        "[animation-editor] falha ao salvar",
        error,
      );

      this.setProjectStatus(
        error instanceof Error
          ? `Falha ao salvar: ${error.message}`
          : "Falha ao salvar configuração",
        true,
      );
    }
  }

  private async loadProjectFromWorkspace(
    source:
      AnimationVideoSource,
  ): Promise<void> {
    try {
      const response =
        await fetch(
          `/__editor/animations/${encodeURIComponent(
            source.id,
          )}`,
          {
            method:
              "GET",
          },
        );

      if (
        response.status ===
        404
      ) {
        this.setProjectStatus(
          "Ainda não existe configuração salva para esta animação.",
          true,
        );

        return;
      }

      if (!response.ok) {
        throw new Error(
          `HTTP ${response.status}`,
        );
      }

      const project =
        parseAnimationProject(
          await response.text(),
        );

      if (
        project.sourceId !==
        source.id
      ) {
        throw new Error(
          "sourceId do arquivo não corresponde à animação selecionada",
        );
      }

      this.chromaSettings = {
        ...project.chroma,
      };

      this.markersBySource.set(
        source.id,
        {
          ...project.markers,
        },
      );

      this.playbackRateBySource.set(
        source.id,
        project.playbackRate ??
          1,
      );

      this.setDirty(
        false,
      );

      this.render();
    } catch (error) {
      console.error(
        "[animation-editor] falha ao carregar",
        error,
      );

      this.setProjectStatus(
        error instanceof Error
          ? `Falha ao carregar: ${error.message}`
          : "Falha ao carregar configuração",
        true,
      );
    }
  }

  private setProjectStatus(
    message: string,
    error: boolean,
  ): void {
    if (
      !this.dirtyIndicator
    ) {
      return;
    }

    this.dirtyIndicator.textContent =
      message;

    this.dirtyIndicator.classList.toggle(
      "is-error",
      error,
    );

    this.dirtyIndicator.classList.remove(
      "is-dirty",
    );
  }

  private setDirty(
    dirty: boolean,
  ): void {
    this.dirty =
      dirty;

    this.updateDirtyIndicator();
  }

  private updateDirtyIndicator():
    void {
    if (
      !this.dirtyIndicator
    ) {
      return;
    }

    this.dirtyIndicator.textContent =
      this.dirty
        ? "● Alterações não salvas"
        : "Configuração salva";

    this.dirtyIndicator.classList.toggle(
      "is-dirty",
      this.dirty,
    );
  }

  private createPreview(
    source:
      AnimationVideoSource,
  ): HTMLElement {
    const preview =
      document.createElement(
        "section",
      );

    preview.className =
      "animation-preview";

    const video =
      document.createElement(
        "video",
      );

    video.className =
      "animation-video-source";

    video.src =
      source.assetUrl;

    video.preload =
      "auto";

    video.muted =
      true;

    video.playsInline =
      true;

    video.disablePictureInPicture =
      true;

    /*
     * Loop nativo permanece desligado.
     * O editor controla o intervalo exato
     * LOOP_START/LOOP_END ou HOLD.
     */
    video.loop =
      false;

    video.playbackRate =
      this.getPlaybackRate(
        source,
      );

    const canvas =
      document.createElement(
        "canvas",
      );

    canvas.className =
      "animation-preview-canvas";

    const context =
      canvas.getContext(
        "2d",
        {
          willReadFrequently:
            true,
        },
      );

    if (!context) {
      throw new Error(
        "Canvas 2D indisponível no editor",
      );
    }

    this.video =
      video;

    this.previewCanvas =
      canvas;

    this.previewContext =
      context;

    video.addEventListener(
      "loadedmetadata",
      () => {
        canvas.width =
          video.videoWidth ||
          source.width;

        canvas.height =
          video.videoHeight ||
          source.height;

        this.syncPreviewState(
          source,
        );

        this.renderProcessedFrame();
      },
    );

    video.addEventListener(
      "loadeddata",
      () => {
        this.renderProcessedFrame();
      },
    );

    video.addEventListener(
      "seeked",
      () => {
        this.syncPreviewState(
          source,
        );

        this.renderProcessedFrame();
      },
    );

    video.addEventListener(
      "play",
      () => {
        this.startPreviewLoop(
          source,
        );
      },
    );

    video.addEventListener(
      "pause",
      () => {
        this.stopPreviewLoop();

        this.syncPreviewState(
          source,
        );

        this.renderProcessedFrame();
      },
    );

    video.addEventListener(
      "ended",
      () => {
        this.stopPreviewLoop();

        this.syncPreviewState(
          source,
        );

        this.renderProcessedFrame();
      },
    );

    video.addEventListener(
      "error",
      () => {
        const error =
          document.createElement(
            "div",
          );

        error.className =
          "preview-error";

        error.textContent =
          `Falha ao carregar ${source.fileName}`;

        preview.appendChild(
          error,
        );
      },
    );

    preview.append(
      video,
      canvas,
    );

    return preview;
  }

  private createTransport(
    source:
      AnimationVideoSource,
  ): HTMLElement {
    const transport =
      document.createElement(
        "div",
      );

    transport.className =
      "animation-transport";

    const previous =
      this.createTransportButton(
        "◀ Frame",
        () =>
          this.stepFrame(
            source,
            -1,
          ),
      );

    const play =
      this.createTransportButton(
        "▶ Play / Pause",
        () =>
          this.togglePlayback(),
      );

    const next =
      this.createTransportButton(
        "Frame ▶",
        () =>
          this.stepFrame(
            source,
            1,
          ),
      );

    const loop =
      this.createTransportButton(
        this.loopEnabled
          ? "⟳ Loop: ON"
          : "⟳ Loop: OFF",
        () => {
          this.loopEnabled =
            !this.loopEnabled;

          loop.textContent =
            this.loopEnabled
              ? "⟳ Loop: ON"
              : "⟳ Loop: OFF";

          loop.classList.toggle(
            "is-active",
            this.loopEnabled,
          );
        },
      );

    loop.classList.toggle(
      "is-active",
      this.loopEnabled,
    );

    const original =
      this.createTransportButton(
        "Original / Recortado",
        () => {
          this.previewOriginal =
            !this.previewOriginal;

          original.classList.toggle(
            "is-active",
            this.previewOriginal,
          );

          this.renderProcessedFrame();
        },
      );

    const frameLabel =
      document.createElement(
        "span",
      );

    frameLabel.className =
      "transport-frame-label";

    frameLabel.textContent =
      `Frame 0 / ${
        source.frameCount - 1
      }`;

    this.frameLabel =
      frameLabel;

    transport.append(
      previous,
      play,
      next,
      loop,
      original,
      frameLabel,
    );

    return transport;
  }

  private createTransportButton(
    label: string,
    onClick: () => void,
  ): HTMLButtonElement {
    const button =
      document.createElement(
        "button",
      );

    button.type =
      "button";

    button.textContent =
      label;

    button.addEventListener(
      "click",
      onClick,
    );

    return button;
  }

  private createTimeline(
    source:
      AnimationVideoSource,
  ): HTMLElement {
    const section =
      document.createElement(
        "section",
      );

    section.className =
      "timeline-section";

    const heading =
      document.createElement(
        "div",
      );

    heading.className =
      "timeline-heading";

    const title =
      document.createElement(
        "strong",
      );

    title.textContent =
      "Timeline";

    const summary =
      document.createElement(
        "span",
      );

    summary.textContent =
      `${source.frameCount} frames · ${source.fps} FPS`;

    heading.append(
      title,
      summary,
    );

    const ruler =
      document.createElement(
        "div",
      );

    ruler.className =
      "timeline-ruler";

    const track =
      document.createElement(
        "div",
      );

    track.className =
      "timeline-track";

    this.timelineTrack =
      track;

    const range =
      document.createElement(
        "span",
      );

    range.className =
      "timeline-range";

    this.timelineRange =
      range;

    track.appendChild(
      range,
    );

    const markers =
      this.getMarkers(
        source,
      );

    if (
      source.kind ===
      "loop"
    ) {
      track.append(
        this.createMarkerElement(
          source,
          "loopStart",
          "LOOP START",
        ),
        this.createMarkerElement(
          source,
          "loopEnd",
          "LOOP END",
        ),
      );
    } else {
      const intro =
        document.createElement(
          "span",
        );

      intro.className =
        "timeline-marker timeline-marker-static";

      intro.textContent =
        "INTRO";

      intro.style.left =
        "0%";

      track.append(
        intro,
        this.createMarkerElement(
          source,
          "holdStart",
          "HOLD START",
        ),
        this.createMarkerElement(
          source,
          "holdEnd",
          "HOLD END",
        ),
      );
    }

    const cursor =
      document.createElement(
        "span",
      );

    cursor.className =
      "timeline-cursor";

    cursor.style.left =
      "0%";

    track.appendChild(
      cursor,
    );

    this.cursor =
      cursor;

    const slider =
      document.createElement(
        "input",
      );

    slider.type =
      "range";

    slider.className =
      "timeline-slider";

    slider.min =
      "0";

    slider.max =
      String(
        source.frameCount - 1,
      );

    slider.step =
      "1";

    slider.value =
      "0";

    slider.setAttribute(
      "aria-label",
      "Frame atual",
    );

    slider.addEventListener(
      "input",
      () => {
        const frame =
          clampFrame(
            Number(
              slider.value,
            ),
            source.frameCount,
          );

        this.seekFrame(
          source,
          frame,
        );
      },
    );

    this.frameSlider =
      slider;

    const controls =
      document.createElement(
        "div",
      );

    controls.className =
      "timeline-marker-controls";

    if (
      source.kind ===
      "loop"
    ) {
      controls.append(
        this.createMarkerSetButton(
          source,
          "loopStart",
          "Marcar início",
        ),
        this.createMarkerSetButton(
          source,
          "loopEnd",
          "Marcar fim",
        ),
      );
    } else {
      controls.append(
        this.createMarkerSetButton(
          source,
          "holdStart",
          "Marcar abaixado",
        ),
        this.createMarkerSetButton(
          source,
          "holdEnd",
          "Marcar fim do hold",
        ),
      );
    }

    const values =
      document.createElement(
        "span",
      );

    values.className =
      "timeline-marker-values";

    values.dataset.role =
      "marker-values";

    controls.appendChild(
      values,
    );

    const hint =
      document.createElement(
        "p",
      );

    hint.className =
      "timeline-hint";

    hint.textContent =
      source.kind === "loop"
        ? "Arraste LOOP START/END ou posicione o cursor e use os botões. Loop ON repete somente essa faixa."
        : "INTRO vai do frame 0 até HOLD START. Loop ON repete HOLD START → HOLD END. A saída poderá reutilizar a entrada ao contrário.";

    section.append(
      heading,
      ruler,
      track,
      slider,
      controls,
      hint,
    );

    this.updateMarkerUi(
      source,
      markers,
    );

    return section;
  }

  private getMarkers(
    source:
      AnimationVideoSource,
  ): AnimationMarkers {
    const existing =
      this.markersBySource.get(
        source.id,
      );

    if (existing) {
      return existing;
    }

    const created =
      createDefaultMarkers(
        source.kind,
        source.frameCount,
      );

    this.markersBySource.set(
      source.id,
      created,
    );

    return created;
  }

  private createMarkerElement(
    source:
      AnimationVideoSource,
    key:
      keyof AnimationMarkers,
    label: string,
  ): HTMLElement {
    const marker =
      document.createElement(
        "button",
      );

    marker.type =
      "button";

    marker.className =
      "timeline-marker timeline-marker-draggable";

    marker.textContent =
      label;

    marker.dataset.marker =
      key;

    marker.title =
      `${label}: arraste para ajustar`;

    marker.addEventListener(
      "pointerdown",
      (event) => {
        event.preventDefault();

        marker.setPointerCapture(
          event.pointerId,
        );

        const move =
          (
            moveEvent:
              PointerEvent,
          ): void => {
            this.setMarkerFromPointer(
              source,
              key,
              moveEvent.clientX,
            );
          };

        const finish =
          (
            finishEvent:
              PointerEvent,
          ): void => {
            marker.removeEventListener(
              "pointermove",
              move,
            );

            marker.removeEventListener(
              "pointerup",
              finish,
            );

            marker.removeEventListener(
              "pointercancel",
              finish,
            );

            if (
              marker.hasPointerCapture(
                finishEvent.pointerId,
              )
            ) {
              marker.releasePointerCapture(
                finishEvent.pointerId,
              );
            }
          };

        marker.addEventListener(
          "pointermove",
          move,
        );

        marker.addEventListener(
          "pointerup",
          finish,
        );

        marker.addEventListener(
          "pointercancel",
          finish,
        );

        this.setMarkerFromPointer(
          source,
          key,
          event.clientX,
        );
      },
    );

    this.markerElements[key] =
      marker;

    return marker;
  }

  private createMarkerSetButton(
    source:
      AnimationVideoSource,
    key:
      keyof AnimationMarkers,
    label: string,
  ): HTMLButtonElement {
    const button =
      document.createElement(
        "button",
      );

    button.type =
      "button";

    button.textContent =
      label;

    button.addEventListener(
      "click",
      () => {
        this.setMarkerFrame(
          source,
          key,
          this.currentFrame,
        );
      },
    );

    return button;
  }

  private setMarkerFromPointer(
    source:
      AnimationVideoSource,
    key:
      keyof AnimationMarkers,
    clientX: number,
  ): void {
    const track =
      this.timelineTrack;

    if (!track) {
      return;
    }

    const rect =
      track.getBoundingClientRect();

    if (rect.width <= 0) {
      return;
    }

    const ratio =
      Math.max(
        0,
        Math.min(
          1,
          (
            clientX -
            rect.left
          ) /
          rect.width,
        ),
      );

    const frame =
      Math.round(
        ratio *
        (
          source.frameCount -
          1
        ),
      );

    this.setMarkerFrame(
      source,
      key,
      frame,
    );
  }

  private setMarkerFrame(
    source:
      AnimationVideoSource,
    key:
      keyof AnimationMarkers,
    frame: number,
  ): void {
    const markers = {
      ...this.getMarkers(
        source,
      ),
      [key]:
        clampFrame(
          frame,
          source.frameCount,
        ),
    };

    if (
      key === "loopStart" &&
      markers.loopStart >
        markers.loopEnd
    ) {
      markers.loopEnd =
        markers.loopStart;
    }

    if (
      key === "loopEnd" &&
      markers.loopEnd <
        markers.loopStart
    ) {
      markers.loopStart =
        markers.loopEnd;
    }

    if (
      key === "holdStart" &&
      markers.holdStart >
        markers.holdEnd
    ) {
      markers.holdEnd =
        markers.holdStart;
    }

    if (
      key === "holdEnd" &&
      markers.holdEnd <
        markers.holdStart
    ) {
      markers.holdStart =
        markers.holdEnd;
    }

    this.markersBySource.set(
      source.id,
      markers,
    );

    this.setDirty(
      true,
    );

    this.updateMarkerUi(
      source,
      markers,
    );
  }

  private updateMarkerUi(
    source:
      AnimationVideoSource,
    markers:
      AnimationMarkers,
  ): void {
    const lastFrame =
      Math.max(
        1,
        source.frameCount - 1,
      );

    const position =
      (
        frame: number,
      ): number =>
        (
          clampFrame(
            frame,
            source.frameCount,
          ) /
          lastFrame
        ) *
        100;

    if (
      source.kind ===
      "loop"
    ) {
      const start =
        position(
          markers.loopStart,
        );

      const end =
        position(
          markers.loopEnd,
        );

      const startElement =
        this.markerElements.loopStart;

      const endElement =
        this.markerElements.loopEnd;

      if (startElement) {
        startElement.style.left =
          `${start}%`;

        startElement.textContent =
          `LOOP START · ${markers.loopStart}`;
      }

      if (endElement) {
        endElement.style.left =
          `${end}%`;

        endElement.textContent =
          `LOOP END · ${markers.loopEnd}`;
      }

      if (
        this.timelineRange
      ) {
        this.timelineRange.style.left =
          `${start}%`;

        this.timelineRange.style.right =
          `${100 - end}%`;
      }
    } else {
      const start =
        position(
          markers.holdStart,
        );

      const end =
        position(
          markers.holdEnd,
        );

      const startElement =
        this.markerElements.holdStart;

      const endElement =
        this.markerElements.holdEnd;

      if (startElement) {
        startElement.style.left =
          `${start}%`;

        startElement.textContent =
          `HOLD START · ${markers.holdStart}`;
      }

      if (endElement) {
        endElement.style.left =
          `${end}%`;

        endElement.textContent =
          `HOLD END · ${markers.holdEnd}`;
      }

      if (
        this.timelineRange
      ) {
        this.timelineRange.style.left =
          `${start}%`;

        this.timelineRange.style.right =
          `${100 - end}%`;
      }
    }

    const values =
      this.root.querySelector<HTMLElement>(
        '[data-role="marker-values"]',
      );

    if (values) {
      const active =
        getActiveLoopRange(
          source.kind,
          markers,
          source.frameCount,
        );

      values.textContent =
        `Loop: ${active.start} → ${active.end}`;
    }
  }

  private createInspector(
    source:
      AnimationVideoSource,
  ): HTMLElement {
    const panel =
      document.createElement(
        "aside",
      );

    panel.className =
      "editor-panel animation-inspector";

    const heading =
      document.createElement(
        "div",
      );

    heading.className =
      "editor-panel-heading";

    heading.innerHTML =
      "<strong>Configuração</strong>";

    const properties =
      document.createElement(
        "dl",
      );

    properties.className =
      "animation-properties";

    this.appendProperty(
      properties,
      "Estado",
      source.state,
    );

    this.appendProperty(
      properties,
      "Direção",
      source.direction,
    );

    this.appendProperty(
      properties,
      "Resolução",
      `${source.width} × ${source.height}`,
    );

    this.appendProperty(
      properties,
      "FPS",
      String(source.fps),
    );

    this.appendProperty(
      properties,
      "Frames",
      String(
        source.frameCount,
      ),
    );

    if (
      source.mirroredDirection
    ) {
      this.appendProperty(
        properties,
        "Espelho",
        `gera ${source.mirroredDirection}`,
      );
    }

    const playback =
      this.createPlaybackInspector(
        source,
      );

    const chroma =
      this.createChromaInspector();

    const sockets =
      document.createElement(
        "section",
      );

    sockets.className =
      "inspector-section";

    sockets.innerHTML =
      [
        "<strong>Sockets por frame</strong>",
        "<p>Entrará depois da timeline e do recorte do personagem.</p>",
      ].join("");

    panel.append(
      heading,
      properties,
      playback,
      chroma,
      sockets,
    );

    return panel;
  }

  private createPlaybackInspector(
    source:
      AnimationVideoSource,
  ): HTMLElement {
    const section =
      document.createElement(
        "section",
      );

    section.className =
      "inspector-section";

    const title =
      document.createElement(
        "strong",
      );

    title.textContent =
      "Velocidade da animação";

    const rate =
      this.getPlaybackRate(
        source,
      );

    const control =
      document.createElement(
        "label",
      );

    control.className =
      "editor-range-control";

    const header =
      document.createElement(
        "span",
      );

    const label =
      document.createElement(
        "span",
      );

    label.textContent =
      "Velocidade";

    const output =
      document.createElement(
        "strong",
      );

    output.textContent =
      `${rate.toFixed(2)}x`;

    header.append(
      label,
      output,
    );

    const input =
      document.createElement(
        "input",
      );

    input.type =
      "range";

    input.min =
      "0.25";

    input.max =
      "3";

    input.step =
      "0.05";

    input.value =
      String(rate);

    const applyRate = (
      next: number,
    ): void => {
      const safe =
        Math.max(
          0.25,
          Math.min(
            3,
            Number.isFinite(next)
              ? next
              : 1,
          ),
        );

      this.playbackRateBySource.set(
        source.id,
        safe,
      );

      input.value =
        String(safe);

      output.textContent =
        `${safe.toFixed(2)}x`;

      if (this.video) {
        this.video.playbackRate =
          safe;
      }

      this.setDirty(
        true,
      );
    };

    input.addEventListener(
      "input",
      () => {
        applyRate(
          Number(
            input.value,
          ),
        );
      },
    );

    control.append(
      header,
      input,
    );

    const presets =
      document.createElement(
        "div",
      );

    presets.className =
      "animation-speed-presets";

    const presetValues = [
      0.5,
      0.75,
      1,
      1.25,
      1.5,
      2,
    ];

    for (
      const preset
      of presetValues
    ) {
      const button =
        document.createElement(
          "button",
        );

      button.type =
        "button";

      button.textContent =
        `${preset.toFixed(2)}x`;

      button.addEventListener(
        "click",
        () => {
          applyRate(
            preset,
          );
        },
      );

      presets.appendChild(
        button,
      );
    }

    const hint =
      document.createElement(
        "p",
      );

    hint.textContent =
      "O preview muda imediatamente. 1.00x mantém a velocidade original. O valor salvo será usado no jogo.";

    section.append(
      title,
      control,
      presets,
      hint,
    );

    return section;
  }

  private createChromaInspector():
    HTMLElement {
    const section =
      document.createElement(
        "section",
      );

    section.className =
      "inspector-section";

    const title =
      document.createElement(
        "strong",
      );

    title.textContent =
      "Remoção de fundo";

    const enabledLabel =
      document.createElement(
        "label",
      );

    enabledLabel.className =
      "editor-control-row";

    const enabled =
      document.createElement(
        "input",
      );

    enabled.type =
      "checkbox";

    enabled.checked =
      this.chromaSettings.enabled;

    const enabledText =
      document.createElement(
        "span",
      );

    enabledText.textContent =
      "Ativar chroma key";

    enabled.addEventListener(
      "change",
      () => {
        this.chromaSettings = {
          ...this.chromaSettings,
          enabled:
            enabled.checked,
        };

        this.setDirty(
          true,
        );

        this.renderProcessedFrame();
      },
    );

    enabledLabel.append(
      enabled,
      enabledText,
    );

    const tolerance =
      this.createRangeControl(
        "Tolerância",
        0,
        220,
        this.chromaSettings.tolerance,
        (value) => {
          this.chromaSettings = {
            ...this.chromaSettings,
            tolerance: value,
          };

          this.setDirty(
            true,
          );

          this.renderProcessedFrame();
        },
      );

    const feather =
      this.createRangeControl(
        "Suavização",
        0,
        160,
        this.chromaSettings.feather,
        (value) => {
          this.chromaSettings = {
            ...this.chromaSettings,
            feather: value,
          };

          this.setDirty(
            true,
          );

          this.renderProcessedFrame();
        },
      );

    const hint =
      document.createElement(
        "p",
      );

    hint.textContent =
      "Tolerância remove tons próximos ao verde. Suavização cria alpha gradual nas bordas.";

    section.append(
      title,
      enabledLabel,
      tolerance,
      feather,
      hint,
    );

    return section;
  }

  private createRangeControl(
    labelText: string,
    min: number,
    max: number,
    value: number,
    onChange:
      (value: number) => void,
  ): HTMLElement {
    const wrapper =
      document.createElement(
        "label",
      );

    wrapper.className =
      "editor-range-control";

    const header =
      document.createElement(
        "span",
      );

    const label =
      document.createElement(
        "span",
      );

    label.textContent =
      labelText;

    const output =
      document.createElement(
        "strong",
      );

    output.textContent =
      String(value);

    header.append(
      label,
      output,
    );

    const input =
      document.createElement(
        "input",
      );

    input.type =
      "range";

    input.min =
      String(min);

    input.max =
      String(max);

    input.step =
      "1";

    input.value =
      String(value);

    input.addEventListener(
      "input",
      () => {
        const next =
          Number(
            input.value,
          );

        output.textContent =
          String(next);

        onChange(next);
      },
    );

    wrapper.append(
      header,
      input,
    );

    return wrapper;
  }

  private renderProcessedFrame():
    void {
    const video =
      this.video;

    const canvas =
      this.previewCanvas;

    const context =
      this.previewContext;

    if (
      !video ||
      !canvas ||
      !context ||
      video.readyState < 2 ||
      canvas.width <= 0 ||
      canvas.height <= 0
    ) {
      return;
    }

    context.clearRect(
      0,
      0,
      canvas.width,
      canvas.height,
    );

    context.drawImage(
      video,
      0,
      0,
      canvas.width,
      canvas.height,
    );

    if (
      this.previewOriginal ||
      !this.chromaSettings.enabled
    ) {
      return;
    }

    const image =
      context.getImageData(
        0,
        0,
        canvas.width,
        canvas.height,
      );

    applyChromaKey(
      image.data,
      this.chromaSettings,
    );

    context.putImageData(
      image,
      0,
      0,
    );
  }

  private togglePlayback():
    void {
    const video =
      this.video;

    if (!video) {
      return;
    }

    if (video.paused) {
      if (
        this.loopEnabled
      ) {
        const source =
          this.getSelected();

        const range =
          getActiveLoopRange(
            source.kind,
            this.getMarkers(
              source,
            ),
            source.frameCount,
          );

        const frame =
          timeToFrame(
            video.currentTime,
            source.fps,
            source.frameCount,
          );

        if (
          frame < range.start ||
          frame > range.end
        ) {
          video.currentTime =
            frameToTime(
              range.start,
              source.fps,
            ) +
            0.0001;
        }
      }

      void video.play();
    } else {
      video.pause();
    }
  }

  private stepFrame(
    source:
      AnimationVideoSource,
    delta: number,
  ): void {
    const video =
      this.video;

    if (!video) {
      return;
    }

    video.pause();

    const currentFrame =
      timeToFrame(
        video.currentTime,
        source.fps,
        source.frameCount,
      );

    const targetFrame =
      clampFrame(
        currentFrame + delta,
        source.frameCount,
      );

    this.seekFrame(
      source,
      targetFrame,
    );
  }

  private seekFrame(
    source:
      AnimationVideoSource,
    frame: number,
  ): void {
    const video =
      this.video;

    if (!video) {
      return;
    }

    const safeFrame =
      clampFrame(
        frame,
        source.frameCount,
      );

    /*
     * Pequeno offset evita cair exatamente
     * na fronteira temporal entre frames.
     */
    video.currentTime =
      frameToTime(
        safeFrame,
        source.fps,
      ) +
      0.0001;

    this.updateTimelineUi(
      source,
      safeFrame,
    );
  }

  private syncPreviewState(
    source:
      AnimationVideoSource,
  ): void {
    const video =
      this.video;

    if (!video) {
      return;
    }

    const frame =
      timeToFrame(
        video.currentTime,
        source.fps,
        source.frameCount,
      );

    this.updateTimelineUi(
      source,
      frame,
    );
  }

  private updateTimelineUi(
    source:
      AnimationVideoSource,
    frame: number,
  ): void {
    const safeFrame =
      clampFrame(
        frame,
        source.frameCount,
      );

    this.currentFrame =
      safeFrame;

    if (
      this.frameSlider
    ) {
      this.frameSlider.value =
        String(
          safeFrame,
        );
    }

    if (
      this.frameLabel
    ) {
      const time =
        frameToTime(
          safeFrame,
          source.fps,
        );

      this.frameLabel.textContent =
        `Frame ${safeFrame} / ${
          source.frameCount - 1
        } · ${time.toFixed(3)}s`;
    }

    if (this.cursor) {
      this.cursor.style.left =
        `${
          frameProgress(
            safeFrame,
            source.frameCount,
          ) * 100
        }%`;
    }
  }

  private startPreviewLoop(
    source:
      AnimationVideoSource,
  ): void {
    this.stopPreviewLoop();

    const update =
      (): void => {
        const video =
          this.video;

        if (!video) {
          return;
        }

        if (
          this.loopEnabled
        ) {
          const markers =
            this.getMarkers(
              source,
            );

          const range =
            getActiveLoopRange(
              source.kind,
              markers,
              source.frameCount,
            );

          const startTime =
            frameToTime(
              range.start,
              source.fps,
            );

          /*
           * Somamos um frame para permitir
           * que LOOP_END/HOLD_END apareça
           * antes de voltar ao início.
           */
          const endTime =
            frameToTime(
              Math.min(
                source.frameCount,
                range.end + 1,
              ),
              source.fps,
            );

          if (
            video.currentTime >=
              endTime
          ) {
            video.currentTime =
              startTime +
              0.0001;
          }
        }

        this.syncPreviewState(
          source,
        );

        this.renderProcessedFrame();

        if (
          !video.paused &&
          !video.ended
        ) {
          this.animationFrameId =
            requestAnimationFrame(
              update,
            );
        }
      };

    this.animationFrameId =
      requestAnimationFrame(
        update,
      );
  }

  private stopPreviewLoop():
    void {
    if (
      this.animationFrameId ===
      undefined
    ) {
      return;
    }

    cancelAnimationFrame(
      this.animationFrameId,
    );

    this.animationFrameId =
      undefined;
  }

  private appendProperty(
    list: HTMLDListElement,
    name: string,
    value: string,
  ): void {
    const term =
      document.createElement(
        "dt",
      );

    term.textContent =
      name;

    const description =
      document.createElement(
        "dd",
      );

    description.textContent =
      value;

    list.append(
      term,
      description,
    );
  }

  private getPlaybackRate(
    source:
      AnimationVideoSource,
  ): number {
    const value =
      this.playbackRateBySource.get(
        source.id,
      ) ??
      1;

    if (
      !Number.isFinite(value)
    ) {
      return 1;
    }

    return Math.max(
      0.25,
      Math.min(
        3,
        value,
      ),
    );
  }

  private getSelected():
    AnimationVideoSource {
    return (
      ANIMATION_VIDEO_SOURCES.find(
        (source) =>
          source.id ===
          this.selectedId,
      ) ??
      ANIMATION_VIDEO_SOURCES[0]!
    );
  }

  private describeSource(
    source:
      AnimationVideoSource,
  ): string {
    const direction =
      source.direction ===
      "none"
        ? "geral"
        : source.direction;

    return (
      `${source.state} · ` +
      `${direction} · ` +
      `${source.kind}`
    );
  }
}
