import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from "react";
import { Character } from "../domain/Character";
import type { Item } from "../types/item";
import type { Job } from "../types/job";
import type { EquipmentSlot } from "../types/equipment";

interface CharacterContextValue {
  character: Character;
  
  // Stats
  setLevel: (level: number) => void;
  setJob: (job: Job | null) => void;
  setPureStat: (stat: "str" | "dex" | "int" | "luk", value: number) => void;
  
  // Equipments
  equipItem: (item: Item) => boolean;
  unequipItem: (slot: EquipmentSlot) => void;
  
  // Buffs
  setBuffEnabled: (id: string, enabled: boolean) => void;
  setBuffLevel: (id: string, level: number) => void;
  
  // Inventory
  addToInventory: (item: Item) => void;
  removeFromInventory: (index: number) => void;
  saveItem: (item: Item) => void;
  
  // Force re-render
  refresh: () => void;
}

const CharacterContext = createContext<CharacterContextValue | null>(null);

export function CharacterProvider({ children }: { children: ReactNode }) {
  const [character] = useState(() => new Character());
  const [, setVersion] = useState(0);

  // 강제 리렌더링 트리거
  const refresh = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  // Stats 관련
  const setLevel = useCallback(
    (level: number) => {
      character.setLevel(level);
      refresh();
    },
    [character, refresh]
  );

  const setJob = useCallback(
    (job: Job | null) => {
      character.setJob(job);
      refresh();
    },
    [character, refresh]
  );

  const setPureStat = useCallback(
    (stat: "str" | "dex" | "int" | "luk", value: number) => {
      character.setPureStat(stat, value);
      refresh();
    },
    [character, refresh]
  );

  // Equipments 관련
  const equipItem = useCallback(
    (item: Item) => {
      const result = character.equip(item);
      refresh();
      return result;
    },
    [character, refresh]
  );

  const unequipItem = useCallback(
    (slot: EquipmentSlot) => {
      character.unequip(slot);
      refresh();
    },
    [character, refresh]
  );

  // Buffs 관련
  const setBuffEnabled = useCallback(
    (id: string, enabled: boolean) => {
      character.setBuffEnabled(id, enabled);
      refresh();
    },
    [character, refresh]
  );

  const setBuffLevel = useCallback(
    (id: string, level: number) => {
      character.setBuffLevel(id, level);
      refresh();
    },
    [character, refresh]
  );

  // Inventory 관련
  const addToInventory = useCallback(
    (item: Item) => {
      character.addToInventory(item);
      refresh();
    },
    [character, refresh]
  );

  const removeFromInventory = useCallback(
    (index: number) => {
      character.removeFromInventory(index);
      refresh();
    },
    [character, refresh]
  );

  const saveItem = useCallback(
    (item: Item) => {
      character.saveItem(item);
      refresh();
    },
    [character, refresh]
  );

  const value = useMemo(
    () => ({
      character,
      setLevel,
      setJob,
      setPureStat,
      equipItem,
      unequipItem,
      setBuffEnabled,
      setBuffLevel,
      addToInventory,
      removeFromInventory,
      saveItem,
      refresh,
    }),
    [
      character,
      setLevel,
      setJob,
      setPureStat,
      equipItem,
      unequipItem,
      setBuffEnabled,
      setBuffLevel,
      addToInventory,
      removeFromInventory,
      saveItem,
      refresh,
    ]
  );

  return <CharacterContext.Provider value={value}>{children}</CharacterContext.Provider>;
}

export function useCharacter() {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error("useCharacter must be used within CharacterProvider");
  }
  return context;
}
