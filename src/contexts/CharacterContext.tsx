/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from "react";
import { Character } from "../domain/Character";
import type { Item } from "../types/item";
import type { Job } from "../types/job";
import type { EquipmentSlot } from "../types/equipment";
import type { SavedEquipment } from "../types/equipment";
import type { SavedCharacterData } from "../utils/characterStorage";
import { getInventory, type InventoryData } from "../utils/inventoryStorage";
import { useBuffCallbacks, getMastery2SkillByWeaponType, getMastery2AttackByLevel, getDefaultPassiveLevels } from "../hooks/useBuffCallbacks";
import { useStorageCallbacks } from "../hooks/useStorageCallbacks";
import { useInventoryCallbacks } from "../hooks/useInventoryCallbacks";

interface CharacterContextValue {
  character: Character;
  version: number;

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

  // Buff specific helpers
  setMapleWarriorLevel: (level: number) => void;
  setBuff1Attack: (attack: number) => void;
  setBuff2Attack: (attack: number) => void;
  setHeroEchoEnabled: (enabled: boolean) => void;
  heroEchoEnabled: boolean;

  // Buff attack values
  buff1Attack: number;
  buff2Attack: number;
  masteryAttack: number;

  // Buff selection info
  buff1Label: string;
  setBuff1Label: (label: string) => void;
  buff1Icon: string | null;
  setBuff1Icon: (icon: string | null) => void;
  buff1IsManual: boolean;
  setBuff1IsManual: (isManual: boolean) => void;

  buff2Label: string;
  setBuff2Label: (label: string) => void;
  buff2Icon: string | null;
  setBuff2Icon: (icon: string | null) => void;
  buff2IsManual: boolean;
  setBuff2IsManual: (isManual: boolean) => void;

  // Mastery
  setMastery1: (value: number) => void;
  setMastery2: (value: number) => void;
  setMasteryAttack: (value: number) => void;
  mastery1: number;
  mastery2: number;

  // Passive Skills
  passiveLevels: Record<string, number>;
  setPassiveLevel: (key: string, level: number) => void;

  // Magic Attack (마력)
  setBuffMAD: (mad: number) => void;
  buffMAD: number;

  // Inventory
  inventory: InventoryData;
  addToInventory: (item: SavedEquipment) => boolean;
  removeFromInventory: (idx: number) => void;
  setInventory: (data: InventoryData) => void;

  // Slot system
  currentSlotIdx: number;
  setCurrentSlotIdx: (idx: number) => void;
  saveCurrentCharacter: () => SavedCharacterData | null;
  loadCharacter: (data: SavedCharacterData) => Promise<void>;
  loadSlot: (slotIdx: number) => Promise<void>;
  deleteSlot: (slotIdx: number) => void;
  getSlotSummaries: () => (SavedCharacterData | null)[];
}

const CharacterContext = createContext<CharacterContextValue | null>(null);

export function CharacterProvider({ children }: { children: ReactNode }) {
  const [character] = useState(() => new Character());
  const [version, setVersion] = useState(0);
  const [currentSlotIdx, setCurrentSlotIdxState] = useState(0);

  const refresh = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  // ============================================================
  // Custom Hooks
  // ============================================================

  const buffCallbacks = useBuffCallbacks(character, refresh, version);
  const inventoryCallbacks = useInventoryCallbacks(character, refresh);
  const storageCallbacks = useStorageCallbacks(character, refresh, currentSlotIdx, setCurrentSlotIdxState);

  // Stable references for use in local callbacks
  const inventorySetInventory = inventoryCallbacks.setInventory;
  const hookSaveCurrentCharacter = storageCallbacks.saveCurrentCharacter;

  // ============================================================
  // Stats
  // ============================================================

  const setLevel = useCallback(
    (level: number) => {
      character.setLevel(level);
      refresh();
    },
    [character, refresh],
  );

  const setJob = useCallback(
    (job: Job | null) => {
      // 장비 전체 해제
      const currentEquipments = character.getEquipments();
      currentEquipments.forEach((eq) => {
        character.unequip(eq.slot as EquipmentSlot);
      });

      // 버프 초기화
      character.resetBuffState();
      character.setPassiveLevels(job ? getDefaultPassiveLevels(job.engName) : {});

      // 슬롯 초기화
      setCurrentSlotIdxState(0);

      character.setJob(job);
      inventorySetInventory(job ? getInventory(job.engName) : []);
      refresh();
    },
    [character, refresh, inventorySetInventory],
  );

  const setPureStat = useCallback(
    (stat: "str" | "dex" | "int" | "luk", value: number) => {
      character.setPureStat(stat, value);
      refresh();
    },
    [character, refresh],
  );

  // ============================================================
  // Equipments
  // ============================================================

  const equipItem = useCallback(
    (item: Item) => {
      const result = character.equip(item);

      // 무기 장착 시 mastery2를 해당 무기의 maxLevel로 설정
      if (item.slot === "무기") {
        const weaponType = item.type;
        const skill = getMastery2SkillByWeaponType(weaponType);
        if (skill) {
          const maxLevel = skill.maxLevel;
          character.setMastery2(maxLevel);
          character.setMasteryAttack(getMastery2AttackByLevel(weaponType, maxLevel));
        } else {
          character.setMastery2(0);
          character.setMasteryAttack(0);
        }
      }

      refresh();
      return result;
    },
    [character, refresh],
  );

  const unequipItem = useCallback(
    (slot: EquipmentSlot) => {
      character.unequip(slot);
      if (slot === "무기") {
        character.setMastery2(0);
        character.setMasteryAttack(0);
      }
      refresh();
    },
    [character, refresh],
  );

  // ============================================================
  // Auto-save
  // ============================================================

  useEffect(() => {
    if (version === 0) return;
    if (!character.getJob()) return;
    hookSaveCurrentCharacter();
  }, [version, hookSaveCurrentCharacter, character]);

  // ============================================================
  // Context Value
  // ============================================================

  const value = useMemo<CharacterContextValue>(
    () => ({
      character,
      version,
      setLevel,
      setJob,
      setPureStat,
      equipItem,
      unequipItem,
      ...buffCallbacks,
      ...storageCallbacks,
      ...inventoryCallbacks,
    }),
    [
      character,
      version,
      setLevel,
      setJob,
      setPureStat,
      equipItem,
      unequipItem,
      buffCallbacks,
      storageCallbacks,
      inventoryCallbacks,
    ],
  );

  return (
    <CharacterContext.Provider value={value}>
      {children}
    </CharacterContext.Provider>
  );
}

export function useCharacter() {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error("useCharacter must be used within CharacterProvider");
  }
  return context;
}
