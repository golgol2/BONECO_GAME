import {
  Camera2D,
  GameLoop,
} from "@boneco/core";
import {
  ABYSS_BLADE,
  ABYSS_SHARD,
  OLD_IRON,
  EnemyInstance,
  Equipment,
} from "@boneco/gameplay";
import {
  RendererLayers,
  depthScale,
  ySortValue,
} from "@boneco/renderer";
import {
  GAME_HEIGHT,
  GAME_WIDTH,
} from "@boneco/shared";
import {
  DEFAULT_WORLD,
  buildWorldCollisionData,
} from "@boneco/world";
import {
  Application,
  Assets,
  Container,
  Graphics,
  Sprite,
  Texture,
} from "pixi.js";

import { getPlayerFallbackFrame } from "./animation/player-animation-fallback";
import {
  PlayerRuntimeAnimator,
  loadRuntimeAnimationCatalog,
} from "./animation/player-runtime-animation";
import {
  ClickMoveController,
} from "./controllers/click-move-controller";
import { PlayerController } from "./controllers/player-controller";
import { KeyboardInput } from "./input";
import { DropSystem } from "./systems/drop-system";
import { EnemySystem } from "./systems/enemy-system";
import { HudSystem } from "./ui/hud-system";
import { LightingSystem } from "./systems/lighting-system";
import { WeaponView } from "./views/weapon-view";
import { WorldSceneView } from "./views/world-scene-view";
import {
  loadWorldMaterialTextures,
  type WorldMaterialTextures,
} from "./views/world-material-catalog";
import {
  getPlayerBaseScaleFromDoor,
} from "./views/world-visual-metrics";

const WORLD_WIDTH = DEFAULT_WORLD.size.width;
const WORLD_HEIGHT = DEFAULT_WORLD.size.height;
const SPEED = 280;
const FOOT_COLLIDER_RADIUS = 12;

const REFERENCE_HOUSE =
  DEFAULT_WORLD.ruins[0];

if (!REFERENCE_HOUSE) {
  throw new Error(
    "DEFAULT_WORLD precisa possuir uma casa de referência",
  );
}

const PLAYER_BASE_VISUAL_SCALE =
  getPlayerBaseScaleFromDoor(
    REFERENCE_HOUSE,
    DEFAULT_WORLD.playfield.farScale,
  );

export class BonecoGame {
  private readonly app = new Application();
  private readonly input = new KeyboardInput();

  private readonly clickMove =
    new ClickMoveController(
      7,
      92,
      26,
    );

  private readonly layers = new RendererLayers();
  private readonly player = new Container();
  private readonly playerVisual =
    new Container();

  private readonly weaponView =
    new WeaponView(
      ABYSS_BLADE,
    );

  private worldMaterials!:
    WorldMaterialTextures;

  private worldScene!:
    WorldSceneView;

  private readonly obstacles =
    buildWorldCollisionData(DEFAULT_WORLD).obstacles;

  private front!: Texture;
  private back!: Texture;
  private profile!: Texture;
  private sprite!: Sprite;

  private readonly playerAnimator =
    new PlayerRuntimeAnimator();

  private runtimeVisualActive =
    false;

  private readonly playerController =
    new PlayerController({
      spawnX: DEFAULT_WORLD.spawn.x,
      spawnY: DEFAULT_WORLD.spawn.y,
      speed: SPEED,
      runSpeedMultiplier: 1.55,
      footColliderRadius: FOOT_COLLIDER_RADIUS,
      worldWidth: WORLD_WIDTH,
      worldHeight: WORLD_HEIGHT,
      playfieldMinY:
        DEFAULT_WORLD.playfield.minY,
      playfieldMaxY:
        DEFAULT_WORLD.playfield.maxY,
      obstacles: this.obstacles,
      maxHealth: 100,
    });

  private readonly dropSystem =
    new DropSystem(
      this.layers.entities,
    );

  private readonly equipment =
    new Equipment(
      this.dropSystem.inventory,
    );

  private readonly enemySystem =
    new EnemySystem({
      spawns: DEFAULT_WORLD.enemySpawns,
      layer: this.layers.entities,
      worldWidth: WORLD_WIDTH,
      worldHeight: WORLD_HEIGHT,
      depthProjection:
        DEFAULT_WORLD.playfield,
      onEnemyAttack: ({ enemy }) => {
        this.receiveEnemyAttack(enemy);
      },
      onEnemyDeath: ({ id, enemy }) => {
        this.dropSystem.spawnEnemyLoot({
          enemyId: id,
          lootTableId:
            enemy.definition.lootTableId,
          x: enemy.x,
          y: enemy.y,
        });
      },
    });

  private readonly hud =
    new HudSystem();

  private lighting!:
    LightingSystem;

  private readonly camera = new Camera2D({
    worldWidth: WORLD_WIDTH,
    worldHeight: WORLD_HEIGHT,
    viewportWidth: GAME_WIDTH,
    viewportHeight: GAME_HEIGHT,
  });

  private readonly loop = new GameLoop({
    update: (step) => this.update(step),
    render: (alpha) => this.render(alpha),
  });

  async init(root: HTMLElement): Promise<void> {
    await this.app.init({
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      background: "#080a0e",
      antialias: true,
      resolution: Math.min(window.devicePixelRatio, 2),
      autoDensity: true,
    });

    root.appendChild(this.app.canvas);
    this.app.canvas.className = "game-canvas";

    this.app.canvas.addEventListener(
      "pointerup",
      this.handleWorldPointer,
    );

    [
      this.front,
      this.back,
      this.profile,
      this.worldMaterials,
    ] = await Promise.all([
      Assets.load(
        "/assets/personagem/runtime/FRONT.png",
      ),
      Assets.load(
        "/assets/personagem/runtime/BACK.png",
      ),
      Assets.load(
        "/assets/personagem/runtime/PROFILE.png",
      ),
      loadWorldMaterialTextures(
        DEFAULT_WORLD.materials,
      ),
    ]);

    try {
      const clips =
        await loadRuntimeAnimationCatalog(
          "/assets/animations/catalog.json",
        );

      for (
        const clip
        of clips
      ) {
        this.playerAnimator.register(
          clip,
        );

        console.info(
          `[animation] runtime carregado: ${
            clip.manifest.id
          } (${clip.textures.length} frames)`,
        );
      }
    } catch (error) {
      console.warn(
        "[animation] catálogo runtime indisponível; usando fallbacks",
        error,
      );
    }

    this.worldScene =
      new WorldSceneView(
        this.layers,
        DEFAULT_WORLD,
        this.worldMaterials,
      );

    this.buildWorld();
    this.loop.start();
  }

  destroy(): void {
    this.loop.stop();

    this.app.canvas.removeEventListener(
      "pointerup",
      this.handleWorldPointer,
    );

    this.input.destroy();
    this.enemySystem.destroy();
    this.dropSystem.destroy();
    this.lighting?.destroy();
    this.hud.destroy();
    this.app.destroy(true);
  }

  private buildWorld(): void {
    this.app.stage.sortableChildren = true;

    this.app.stage.addChild(
      this.layers.sky,
      this.layers.worldRoot,
      this.layers.lighting,
      this.layers.ui,
    );

    this.worldScene.build();

    this.lighting =
      new LightingSystem({
        layer:
          this.layers.lighting,
        viewportWidth:
          GAME_WIDTH,
        viewportHeight:
          GAME_HEIGHT,
        ambientDarkness:
          DEFAULT_WORLD.lighting.ambientDarkness,
        playerLight:
          DEFAULT_WORLD.lighting.playerLight,
        staticLights:
          DEFAULT_WORLD.lighting.lights,
      });

    const shadow = new Graphics()
      .ellipse(0, 0, 50, 16)
      .fill({ color: "#000000", alpha: 0.55 });

    shadow.position.y = 2;

    this.sprite = new Sprite(this.front);
    this.sprite.anchor.set(0.5, 1);

    const targetHeight = 230;
    const scale = targetHeight / this.sprite.texture.height;
    this.sprite.scale.set(scale);

    const footCollider = new Graphics()
      .circle(0, 0, FOOT_COLLIDER_RADIUS)
      .stroke({ width: 2, color: "#56d8ff", alpha: 0.8 });

    this.playerVisual.addChild(
      this.sprite,
      this.weaponView.container,
    );

    this.player.addChild(
      shadow,
      this.playerVisual,
      footCollider,
    );

    this.syncPlayerFacing();

    this.player.position.set(
      this.playerController.transform.current.x,
      this.playerController.transform.current.y,
    );

    this.player.zIndex = ySortValue(
      this.playerController.transform.current.y,
    );

    this.layers.entities.addChild(this.player);

    this.equipment.equip(
      "weapon",
      "abyss_blade",
    );

    this.enemySystem.spawnAll();

    this.layers.ui.addChild(
      this.hud.container,
    );

    this.updateHud();
  }

  private update(step: number): void {
    const previousFacing =
      this.playerController.facing;

    const keyboardMovement =
      this.input.movement();

    const keyboardActive =
      keyboardMovement.x !== 0 ||
      keyboardMovement.y !== 0;

    if (keyboardActive) {
      /*
       * Teclado fica apenas como fallback
       * de desenvolvimento. Ao usá-lo,
       * cancela qualquer destino automático.
       */
      this.clickMove.cancel();
    }

    const selectedEnemyId =
      this.clickMove.selectedEnemyId;

    const targetEnemy =
      selectedEnemyId
        ? this.enemySystem.getEnemyTarget(
            selectedEnemyId,
          )
        : undefined;

    const automatic =
      keyboardActive
        ? {
            movement:
              keyboardMovement,
            attackRequested:
              false,
            facing:
              undefined,
          }
        : this.clickMove.update({
            player: {
              x:
                this.playerController.transform.current.x,
              y:
                this.playerController.transform.current.y,
            },
            targetEnemy,
          });

    if (
      automatic.facing
    ) {
      this.playerController.face(
        automatic.facing,
      );
    }

    const manualAttack =
      this.input.consumeAttack();

    this.playerController.update(
      step,
      automatic.movement,
      manualAttack ||
        automatic.attackRequested,
      keyboardActive &&
        this.input.running(),
      this.input.consumeJump(),
    );

    if (
      previousFacing !==
      this.playerController.facing
    ) {
      this.syncPlayerFacing();
    }

    this.updateRuntimePlayerAnimation(
      step,
    );

    this.syncWeaponSocket();

    this.weaponView.setAttackDebugVisible(
      this.playerController.attack.hitboxActive,
    );

    const playerState = {
      x:
        this.playerController.transform.current.x,
      y:
        this.playerController.transform.current.y,
      facing:
        this.playerController.facing,
      dead:
        this.playerController.dead,
      attackActive:
        this.playerController.attack.hitboxActive,
      attackSequence:
        this.playerController.attack.sequence,
    };

    this.enemySystem.resolvePlayerAttack(
      playerState,
      25,
      180,
    );

    this.enemySystem.update(
      step,
      playerState,
    );

    this.dropSystem.collectNear(
      this.playerController.transform.current.x,
      this.playerController.transform.current.y,
    );

    this.updateHud();
  }

  private readonly handleWorldPointer = (
    event:
      PointerEvent,
  ): void => {
    if (
      event.button !== 0 &&
      event.pointerType ===
        "mouse"
    ) {
      return;
    }

    const rect =
      this.app.canvas.getBoundingClientRect();

    if (
      rect.width <= 0 ||
      rect.height <= 0
    ) {
      return;
    }

    const screenX =
      (
        event.clientX -
        rect.left
      ) *
      (
        GAME_WIDTH /
        rect.width
      );

    const screenY =
      (
        event.clientY -
        rect.top
      ) *
      (
        GAME_HEIGHT /
        rect.height
      );

    const cameraPosition =
      this.camera.position;

    const worldX =
      screenX +
      cameraPosition.x;

    const worldY =
      screenY +
      cameraPosition.y;

    const enemyId =
      this.enemySystem.hitTestWorld(
        worldX,
        worldY,
      );

    if (enemyId) {
      this.clickMove.attackEnemy(
        enemyId,
      );

      return;
    }

    const targetX =
      Math.max(
        60,
        Math.min(
          WORLD_WIDTH - 60,
          worldX,
        ),
      );

    const targetY =
      Math.max(
        DEFAULT_WORLD.playfield.minY,
        Math.min(
          DEFAULT_WORLD.playfield.maxY,
          worldY,
        ),
      );

    this.clickMove.moveTo(
      {
        x:
          targetX,
        y:
          targetY,
      },
      {
        x:
          this.playerController.transform.current.x,
        y:
          this.playerController.transform.current.y,
      },
    );
  };

  private updateHud(): void {
    this.hud.update({
      healthCurrent:
        this.playerController.health.current,
      healthMax:
        this.playerController.health.max,
      animationState:
        this.playerController.animation.state,
      equippedWeapon:
        this.equipment.get("weapon"),
      inventory: [
        {
          label:
            ABYSS_SHARD.displayName,
          quantity:
            this.dropSystem.inventory.count(
              ABYSS_SHARD.id,
            ),
        },
        {
          label:
            OLD_IRON.displayName,
          quantity:
            this.dropSystem.inventory.count(
              OLD_IRON.id,
            ),
        },
      ].filter(
        (entry) =>
          entry.quantity > 0,
      ),
    });
  }

  private updateRuntimePlayerAnimation(
    step: number,
  ): void {
    const visual =
      this.playerAnimator.update(
        this.playerController.animation.state,
        this.playerController.facing,
        step,
        this.playerController.animation.state ===
          "jump"
          ? this.playerController.jumpProgress
          : undefined,
      );

    if (visual) {
      this.sprite.texture =
        visual.texture;

      this.fitSprite(
        visual.flipX,
      );

      this.runtimeVisualActive =
        true;

      return;
    }

    if (
      this.runtimeVisualActive
    ) {
      this.runtimeVisualActive =
        false;

      this.syncPlayerFacing();
    }
  }

  private syncPlayerFacing(): void {
    const direction =
      this.playerController.facing;

    if (direction === "down") {
      this.sprite.texture = this.front;
      this.fitSprite(false);
    } else if (direction === "up") {
      this.sprite.texture = this.back;
      this.fitSprite(false);
    } else {
      this.sprite.texture = this.profile;
      this.fitSprite(direction === "left");
    }

    this.syncWeaponSocket();
  }

  private syncWeaponSocket(): void {
    const frame =
      getPlayerFallbackFrame(
        this.playerController.animation.state,
        this.playerController.facing,
      );

    this.weaponView.setHandSocket(
      frame.sockets.HAND_R,
    );
  }

  private receiveEnemyAttack(
    enemy: EnemyInstance,
  ): void {
    const accepted =
      this.playerController.receiveDamage({
        amount:
          enemy.definition.attackDamage,
        sourceX: enemy.x,
        sourceY: enemy.y,
        knockbackStrength: 140,
        invulnerabilitySeconds: 0.45,
      });

    if (!accepted) {
      return;
    }

    console.info(
      `[combat] player recebeu ` +
      `${enemy.definition.attackDamage}; ` +
      `vida=${this.playerController.health.current}`,
    );
  }

  private fitSprite(flipped: boolean): void {
    const targetHeight = 230;
    const scale = targetHeight / this.sprite.texture.height;

    this.sprite.scale.set(
      flipped ? -scale : scale,
      scale,
    );
  }

  private render(alpha: number): void {
    const interpolated =
      this.playerController.transform.interpolated(
        alpha,
      );

    const x = interpolated.x;
    const y = interpolated.y;

    const z =
      this.playerController.interpolatedZ(
        alpha,
      );

    this.player.position.set(x, y);

    this.playerVisual.position.y =
      -z;

    const perspectiveScale =
      depthScale(
        y,
        DEFAULT_WORLD.playfield,
      );

    const playerVisualScale =
      perspectiveScale *
      PLAYER_BASE_VISUAL_SCALE;

    this.player.scale.set(
      playerVisualScale,
    );

    const lightFrame =
      getPlayerFallbackFrame(
        this.playerController.animation.state,
        this.playerController.facing,
      );

    const core =
      lightFrame.sockets.CORE;

    this.lighting.updatePlayer(
      x +
        core.x *
        playerVisualScale,
      y -
        z *
        playerVisualScale +
        core.y *
        playerVisualScale,
      perspectiveScale,
    );

    this.player.zIndex =
      ySortValue(y);

    if (this.playerController.dead) {
      this.player.alpha = 0.3;
    } else if (
      this.playerController.hurtTime > 0
    ) {
      this.player.alpha = 0.55;
    } else if (
      this.playerController.damageReceiver.invulnerable
    ) {
      this.player.alpha = 0.75;
    } else {
      this.player.alpha = 1;
    }

    /*
     * Mundo e viewport possuem a mesma
     * altura nesta fase. A câmera acompanha
     * essencialmente o eixo horizontal.
     */
    const cameraPosition =
      this.camera.follow(
        x,
        GAME_HEIGHT / 2,
      );

    this.layers.setCameraPosition(
      cameraPosition.x,
      cameraPosition.y,
    );

    this.lighting.render(
      performance.now() / 1000,
      cameraPosition.x,
      cameraPosition.y,
    );
  }
}
