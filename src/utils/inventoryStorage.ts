import type { SavedEquipment } from "../types/equipment";

const INVENTORY_KEY_PREFIX = "mapleland_inventory_";
export const INVENTORY_COLS = 4;
export const INVENTORY_ROWS = 6;
export const INVENTORY_SIZE = INVENTORY_COLS * INVENTORY_ROWS;

export type InventoryData = SavedEquipment[];

export function getInventory(jobEngName: string): InventoryData {
  const key = `${INVENTORY_KEY_PREFIX}${jobEngName}`;
  const data = localStorage.getItem(key);
  if (!data) return [];
  try {
    const parsed: (SavedEquipment | null)[] = JSON.parse(data);
    // null 제거 (레거시 호환)
    return parsed.filter((item): item is SavedEquipment => item != null);
  } catch {
    return [];
  }
}

export function saveInventory(jobEngName: string, inventory: InventoryData): void {
  const key = `${INVENTORY_KEY_PREFIX}${jobEngName}`;
  localStorage.setItem(key, JSON.stringify(inventory));
}
