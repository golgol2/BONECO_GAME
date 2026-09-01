import type { WorldDefinition } from "./types";

export function validateWorldDefinition(
  world: WorldDefinition,
): string[] {
  const errors: string[] = [];

  if (!world.id.trim()) {
    errors.push("world.id é obrigatório");
  }

  if (world.version < 1) {
    errors.push("world.version deve ser >= 1");
  }

  if (
    world.size.width <= 0 ||
    world.size.height <= 0
  ) {
    errors.push(
      "dimensões do mundo devem ser positivas",
    );
  }

  if (
    world.spawn.x < 0 ||
    world.spawn.y < 0 ||
    world.spawn.x > world.size.width ||
    world.spawn.y > world.size.height
  ) {
    errors.push("spawn deve estar dentro do mundo");
  }

  if (
    world.playfield.minY < 0 ||
    world.playfield.maxY >
      world.size.height ||
    world.playfield.minY >=
      world.playfield.maxY
  ) {
    errors.push(
      "playfield deve estar dentro do mundo e possuir profundidade positiva",
    );
  }

  if (
    world.playfield.farScale <= 0 ||
    world.playfield.nearScale <= 0 ||
    world.playfield.nearScale <
      world.playfield.farScale
  ) {
    errors.push(
      "escalas de perspectiva do playfield são inválidas",
    );
  }

  if (
    world.playfield.groundY <
      world.playfield.minY ||
    world.playfield.groundY >
      world.playfield.maxY
  ) {
    errors.push(
      "playfield.groundY deve estar dentro da faixa jogável",
    );
  }

  if (
    world.spawn.y <
      world.playfield.minY ||
    world.spawn.y >
      world.playfield.maxY
  ) {
    errors.push(
      "spawn deve estar dentro do playfield",
    );
  }

  if (
    world.lighting.ambientDarkness < 0 ||
    world.lighting.ambientDarkness > 1
  ) {
    errors.push(
      "lighting.ambientDarkness deve estar entre 0 e 1",
    );
  }

  if (
    world.lighting.playerLight.radius <= 0 ||
    world.lighting.playerLight.intensity < 0 ||
    world.lighting.playerLight.intensity > 1
  ) {
    errors.push(
      "playerLight possui configuração inválida",
    );
  }

  const lightIds =
    new Set<string>();

  for (
    const light
    of world.lighting.lights
  ) {
    if (!light.id.trim()) {
      errors.push(
        "world light sem id",
      );
    }

    if (lightIds.has(light.id)) {
      errors.push(
        `world light duplicada: ${light.id}`,
      );
    }

    lightIds.add(light.id);

    if (
      light.radius <= 0 ||
      light.intensity < 0 ||
      light.intensity > 1 ||
      (light.flicker ?? 0) < 0 ||
      (light.flicker ?? 0) > 1 ||
      (light.revealScaleY ?? 1) <= 0
    ) {
      errors.push(
        `world light ${light.id} possui configuração inválida`,
      );
    }
  }

  if (
    !world.materials.floor.trim() ||
    !world.materials.wall.trim() ||
    !world.materials.roof.trim() ||
    !world.materials.door.trim()
  ) {
    errors.push(
      "materiais obrigatórios do mundo não podem ser vazios",
    );
  }

  const ids = new Set<string>();

  const spawnIds = new Set<string>();

  for (const spawn of world.enemySpawns) {
    if (!spawn.id.trim()) {
      errors.push("enemy spawn sem id");
    }

    if (!spawn.enemyId.trim()) {
      errors.push(
        `enemy spawn ${spawn.id} sem enemyId`,
      );
    }

    if (spawnIds.has(spawn.id)) {
      errors.push(
        `id de enemy spawn duplicado: ${spawn.id}`,
      );
    }

    spawnIds.add(spawn.id);

    if (
      spawn.x < 0 ||
      spawn.y < 0 ||
      spawn.x > world.size.width ||
      spawn.y > world.size.height
    ) {
      errors.push(
        `enemy spawn ${spawn.id} fora do mundo`,
      );
    }
  }

  for (const ruin of world.ruins) {
    if (!ruin.id.trim()) {
      errors.push("ruína sem id");
    }

    if (ids.has(ruin.id)) {
      errors.push(
        `id de ruína duplicado: ${ruin.id}`,
      );
    }

    ids.add(ruin.id);

    if (
      ruin.width <= 0 ||
      ruin.height <= 0
    ) {
      errors.push(
        `ruína ${ruin.id} possui dimensão inválida`,
      );
    }

    if (
      ruin.collisionDepthRatio < 0 ||
      ruin.collisionDepthRatio > 1
    ) {
      errors.push(
        `ruína ${ruin.id} possui collisionDepthRatio inválido`,
      );
    }
  }

  return errors;
}
