// @vitest-environment jsdom

import {
  describe,
  expect,
  it,
} from "vitest";
import {
  Container,
} from "pixi.js";

import {
  DropSystem,
} from "./drop-system";

describe("DropSystem", () => {
  it("ignora inimigo sem loot table", () => {
    const system =
      new DropSystem(
        new Container(),
      );

    system.spawnEnemyLoot({
      enemyId: "enemy",
      x: 100,
      y: 100,
    });

    expect(system.count).toBe(0);

    system.destroy();
  });
});
