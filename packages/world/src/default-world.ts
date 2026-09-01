import type {
  WorldDefinition,
} from "./types";

export const DEFAULT_WORLD:
  WorldDefinition = {
    id: "abismo_ruinas_01",
    version: 2,

    size: {
      width: 3200,
      height: 720,
    },

    spawn: {
      x: 640,
      y: 545,
    },

    playfield: {
      minY: 420,
      maxY: 670,
      groundY: 670,
      farScale: 0.72,
      nearScale: 1.18,
    },

    lighting: {
      ambientDarkness: 0.94,

      playerLight: {
        radius: 320,
        intensity: 1,
        color: 0xff4fa3,
      },

      lights: [
        {
          id: "lamp_post_01",
          x: 1042,
          y: 288,
          radius: 420,
          intensity: 0.98,
          color: 0xffd690,
          flicker: 0.05,
          revealOffsetY: 130,
          revealScaleY: 1.7,
        },
      ],
    },

    materials: {
      floor: "floor.dark_stone_01",
      wall: "wall.dark_plaster_01",
      roof: "roof.dark_shingle_01",
      door: "door.dark_door_01",
    },

    /*
     * As ruínas são referências de composição.
     * Nesta fase são desenhadas em código.
     * collisionDepthRatio = 0 porque ficam
     * atrás da faixa jogável.
     */
    ruins: [
      {
        id: "house_01",
        x: 260,
        y: 205,
        width: 320,
        height: 215,
        baseY: 420,
        collisionDepthRatio: 0,
      },
      {
        id: "house_02",
        x: 1080,
        y: 175,
        width: 390,
        height: 245,
        baseY: 420,
        collisionDepthRatio: 0,
      },
      {
        id: "house_03",
        x: 2130,
        y: 215,
        width: 350,
        height: 205,
        baseY: 420,
        collisionDepthRatio: 0,
      },
    ],

    enemySpawns: [
      {
        id: "dummy_01",
        enemyId: "training_dummy",
        x: 930,
        y: 535,
      },
      {
        id: "dummy_02",
        enemyId: "training_dummy",
        x: 1320,
        y: 475,
      },
      {
        id: "dummy_03",
        enemyId: "training_dummy",
        x: 1770,
        y: 575,
      },
    ],
  };
