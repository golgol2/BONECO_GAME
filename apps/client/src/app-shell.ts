import { BonecoGame } from "./game";
import {
  AnimationEditorView,
} from "./editor/animation-editor-view";

type AppScreen =
  | "home"
  | "game"
  | "animation-editor";

export class AppShell {
  private currentScreen:
    AppScreen = "home";

  private game:
    BonecoGame | undefined;

  private animationEditor:
    AnimationEditorView | undefined;

  constructor(
    private readonly root:
      HTMLElement,
  ) {}

  start(): void {
    this.showHome();
  }

  destroy(): void {
    this.destroyCurrentScreen();
    this.root.replaceChildren();
  }

  private navigate(
    screen: AppScreen,
  ): void {
    if (
      screen ===
      this.currentScreen
    ) {
      return;
    }

    this.destroyCurrentScreen();

    this.currentScreen =
      screen;

    switch (screen) {
      case "home":
        this.showHome();
        break;

      case "game":
        void this.showGame();
        break;

      case "animation-editor":
        this.showAnimationEditor();
        break;
    }
  }

  private showHome(): void {
    this.currentScreen =
      "home";

    const page =
      document.createElement(
        "section",
      );

    page.className =
      "app-page home-page";

    const panel =
      document.createElement(
        "div",
      );

    panel.className =
      "home-panel";

    const eyebrow =
      document.createElement(
        "p",
      );

    eyebrow.className =
      "panel-eyebrow";

    eyebrow.textContent =
      "BONECO_GAME";

    const title =
      document.createElement(
        "h1",
      );

    title.textContent =
      "Boneco do Abismo";

    const description =
      document.createElement(
        "p",
      );

    description.className =
      "home-description";

    description.textContent =
      "Engine, jogo e ferramentas de criação.";

    const actions =
      document.createElement(
        "div",
      );

    actions.className =
      "home-actions";

    actions.append(
      this.createMenuButton(
        "Jogar",
        "Executar a versão atual do jogo",
        () =>
          this.navigate(
            "game",
          ),
      ),

      this.createMenuButton(
        "Editor de Animação",
        "Preparar sprites, loops e sockets",
        () =>
          this.navigate(
            "animation-editor",
          ),
      ),
    );

    const future =
      document.createElement(
        "div",
      );

    future.className =
      "future-tools";

    future.textContent =
      "Editor de mapa e catálogo de assets serão adicionados nas próximas fatias.";

    panel.append(
      eyebrow,
      title,
      description,
      actions,
      future,
    );

    page.appendChild(panel);

    this.root.replaceChildren(
      page,
    );
  }

  private async showGame():
    Promise<void> {
    const page =
      document.createElement(
        "section",
      );

    page.className =
      "app-page game-page";

    const toolbar =
      this.createToolbar(
        "Jogo",
      );

    const gameHost =
      document.createElement(
        "div",
      );

    gameHost.className =
      "game-host";

    page.append(
      toolbar,
      gameHost,
    );

    this.root.replaceChildren(
      page,
    );

    const game =
      new BonecoGame();

    this.game =
      game;

    try {
      await game.init(
        gameHost,
      );
    } catch (error) {
      console.error(
        "[game] falha ao iniciar",
        error,
      );

      if (
        this.game === game
      ) {
        this.game =
          undefined;
      }

      game.destroy();

      const message =
        document.createElement(
          "div",
        );

      message.className =
        "screen-error";

      message.textContent =
        "Falha ao iniciar o jogo. Consulte o console do navegador.";

      gameHost.replaceChildren(
        message,
      );
    }
  }

  private showAnimationEditor():
    void {
    const page =
      document.createElement(
        "section",
      );

    page.className =
      "app-page editor-page";

    const toolbar =
      this.createToolbar(
        "Editor de Animação",
      );

    const host =
      document.createElement(
        "div",
      );

    host.className =
      "editor-host";

    page.append(
      toolbar,
      host,
    );

    this.root.replaceChildren(
      page,
    );

    this.animationEditor =
      new AnimationEditorView(
        host,
      );

    this.animationEditor.mount();
  }

  private destroyCurrentScreen():
    void {
    if (this.game) {
      this.game.destroy();

      this.game =
        undefined;
    }

    if (
      this.animationEditor
    ) {
      this.animationEditor.destroy();

      this.animationEditor =
        undefined;
    }
  }

  private createToolbar(
    titleText: string,
  ): HTMLElement {
    const toolbar =
      document.createElement(
        "header",
      );

    toolbar.className =
      "app-toolbar";

    const back =
      document.createElement(
        "button",
      );

    back.type =
      "button";

    back.className =
      "toolbar-back";

    back.textContent =
      "← Painel";

    back.addEventListener(
      "click",
      () =>
        this.navigate(
          "home",
        ),
    );

    const title =
      document.createElement(
        "strong",
      );

    title.textContent =
      titleText;

    toolbar.append(
      back,
      title,
    );

    return toolbar;
  }

  private createMenuButton(
    titleText: string,
    descriptionText: string,
    onClick: () => void,
  ): HTMLButtonElement {
    const button =
      document.createElement(
        "button",
      );

    button.type =
      "button";

    button.className =
      "home-action";

    const title =
      document.createElement(
        "strong",
      );

    title.textContent =
      titleText;

    const description =
      document.createElement(
        "span",
      );

    description.textContent =
      descriptionText;

    button.append(
      title,
      description,
    );

    button.addEventListener(
      "click",
      onClick,
    );

    return button;
  }
}
