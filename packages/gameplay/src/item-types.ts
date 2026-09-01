export type ItemId = string;

export type ItemCategory =
  | "material"
  | "weapon"
  | "armor"
  | "consumable"
  | "quest"
  | "currency";

export interface ItemDefinition {
  id: ItemId;
  version: number;
  displayName: string;
  category: ItemCategory;
  maxStack: number;
  assetId: string;
}

export interface ItemStack {
  itemId: ItemId;
  quantity: number;
}
