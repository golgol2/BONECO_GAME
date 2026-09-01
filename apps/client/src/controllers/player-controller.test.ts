import {
  describe,
  expect,
  it,
} from "vitest";

import {
  PlayerController,
} from "./player-controller";

const createPlayer = () =>
  new PlayerController({
    spawnX: 500,
    spawnY: 500,
    speed: 100,
    footColliderRadius: 12,
    worldWidth: 1000,
    worldHeight: 1000,
    obstacles: [],
    maxHealth: 100,
  });

describe("PlayerController", () => {
  it("movimenta jogador", () => {
    const player = createPlayer();

    player.update(
      0.1,
      {
        x: 1,
        y: 0,
      },
      false,
    );

    expect(
      player.transform.current.x,
    ).toBe(510);

    expect(player.facing).toBe("right");
    expect(player.animation.state).toBe("walk");
  });

  it("corre com multiplicador de velocidade", () => {
    const player =
      new PlayerController({
        spawnX: 500,
        spawnY: 500,
        speed: 100,
        runSpeedMultiplier: 1.5,
        footColliderRadius: 12,
        worldWidth: 1000,
        worldHeight: 1000,
        obstacles: [],
        maxHealth: 100,
      });

    player.update(
      0.1,
      {
        x: 0,
        y: 1,
      },
      false,
      true,
    );

    expect(
      player.transform.current.y,
    ).toBe(515);

    expect(
      player.animation.state,
    ).toBe("run");

    expect(
      player.facing,
    ).toBe("down");
  });

  it("não entra em run sem movimento", () => {
    const player =
      createPlayer();

    player.update(
      0.1,
      {
        x: 0,
        y: 0,
      },
      false,
      true,
    );

    expect(
      player.animation.state,
    ).toBe("idle");
  });

  it("inicia ataque", () => {
    const player = createPlayer();

    player.update(
      0.01,
      {
        x: 0,
        y: 0,
      },
      true,
    );

    expect(player.attack.attacking).toBe(true);
    expect(player.animation.state).toBe("attack");
  });

  it("recebe dano e entra em hurt", () => {
    const player = createPlayer();

    expect(
      player.receiveDamage({
        amount: 25,
        sourceX: 400,
        sourceY: 500,
        knockbackStrength: 100,
        invulnerabilitySeconds: 0.5,
      }),
    ).toBe(true);

    expect(player.health.current).toBe(75);
    expect(player.hurtTime).toBeGreaterThan(0);

    player.update(
      0.01,
      {
        x: 0,
        y: 0,
      },
      false,
    );

    expect(player.animation.state).toBe("hurt");
  });

  it("morre e bloqueia movimento", () => {
    const player = createPlayer();

    player.receiveDamage({
      amount: 200,
      sourceX: 500,
      sourceY: 500,
      knockbackStrength: 0,
      invulnerabilitySeconds: 0,
    });

    const x =
      player.transform.current.x;

    player.update(
      0.1,
      {
        x: 1,
        y: 0,
      },
      false,
    );

    expect(player.dead).toBe(true);
    expect(player.transform.current.x).toBe(x);
    expect(player.animation.state).toBe("death");
  });
});
