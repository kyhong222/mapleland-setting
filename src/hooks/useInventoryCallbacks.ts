import { useCallback, useMemo, useState } from "react";
import type { Character } from "../domain/Character";
import type { SavedEquipment } from "../types/equipment";
import { saveInventory, INVENTORY_SIZE, type InventoryData } from "../utils/inventoryStorage";

export function useInventoryCallbacks(character: Character, refresh: () => void) {
  const [inventory, setInventoryState] = useState<InventoryData>([]);

  const addToInventory = useCallback(
    (item: SavedEquipment) => {
      if (inventory.length >= INVENTORY_SIZE) return false;
      const next = [...inventory, item];
      setInventoryState(next);
      const jobName = character.getJob()?.engName;
      if (jobName) saveInventory(jobName, next);
      refresh();
      return true;
    },
    [inventory, character, refresh],
  );

  const removeFromInventory = useCallback(
    (idx: number) => {
      const next = [...inventory];
      next.splice(idx, 1);
      setInventoryState(next);
      const jobName = character.getJob()?.engName;
      if (jobName) saveInventory(jobName, next);
      refresh();
    },
    [inventory, character, refresh],
  );

  const setInventory = useCallback(
    (data: InventoryData) => {
      setInventoryState(data);
      const jobName = character.getJob()?.engName;
      if (jobName) saveInventory(jobName, data);
      refresh();
    },
    [character, refresh],
  );

  return useMemo(
    () => ({
      inventory,
      addToInventory,
      removeFromInventory,
      setInventory,
    }),
    [inventory, addToInventory, removeFromInventory, setInventory],
  );
}
