import type {
  ItemDefinition,
} from "./item-types";

export class ItemCatalog {
  private readonly items =
    new Map<string, ItemDefinition>();

  register(
    definition: ItemDefinition,
  ): void {
    if (this.items.has(definition.id)) {
      throw new Error(
        `Item duplicado: ${definition.id}`,
      );
    }

    this.items.set(
      definition.id,
      definition,
    );
  }

  get(
    id: string,
  ): ItemDefinition | undefined {
    return this.items.get(id);
  }

  require(
    id: string,
  ): ItemDefinition {
    const item = this.items.get(id);

    if (!item) {
      throw new Error(
        `Item desconhecido: ${id}`,
      );
    }

    return item;
  }

  get size(): number {
    return this.items.size;
  }
}
