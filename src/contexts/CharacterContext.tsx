/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { Character } from "../domain/Character";
import type { Item } from "../types/item";
import type { Job } from "../types/job";
import type { EquipmentSlot } from "../types/equipment";

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

  // Buff selection (직접 입력 vs 드롭다운)
  buff1Type: "custom" | "preset";
  buff2Type: "custom" | "preset";
  setBuff1Type: (type: "custom" | "preset") => void;
  setBuff2Type: (type: "custom" | "preset") => void;
  buff1Name: string;
  buff2Name: string;
  setBuff1Name: (name: string) => void;
  setBuff2Name: (name: string) => void;

  // Buff attack values (외부 상태)
  buff1Attack: number;
  buff2Attack: number;
}

const CharacterContext = createContext<CharacterContextValue | null>(null);

export function CharacterProvider({ children }: { children: ReactNode }) {
  const [character] = useState(() => new Character());
  const [version, setVersion] = useState(0);
  const [buff1Attack, setBuff1AttackState] = useState(0);
  const [buff2Attack, setBuff2AttackState] = useState(0);
  const [buff1Type, setBuff1TypeState] = useState<"custom" | "preset">("custom");
  const [buff2Type, setBuff2TypeState] = useState<"custom" | "preset">("custom");
  const [buff1Name, setBuff1NameState] = useState("직접 입력");
  const [buff2Name, setBuff2NameState] = useState("직접 입력");

  const refresh = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  // Stats
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

  // Equipments
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

  // Buffs
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

  // Buff helpers
  const setMapleWarriorLevel = useCallback(
    (level: number) => {
      character.setBuffLevel("mapleWarrior", level);
      character.setBuffEnabled("mapleWarrior", level > 0);
      refresh();
    },
    [character, refresh]
  );

  const setBuff1Attack = useCallback((attack: number) => {
    setBuff1AttackState(attack);
  }, []);

  const setBuff2Attack = useCallback((attack: number) => {
    setBuff2AttackState(attack);
  }, []);

  const setBuff1Type = useCallback((type: "custom" | "preset") => {
    setBuff1TypeState(type);
  }, []);

  const setBuff2Type = useCallback((type: "custom" | "preset") => {
    setBuff2TypeState(type);
  }, []);

  const setBuff1Name = useCallback((name: string) => {
    setBuff1NameState(name);
  }, []);

  const setBuff2Name = useCallback((name: string) => {
    setBuff2NameState(name);
  }, []);

  const setHeroEchoEnabled = useCallback(
    (enabled: boolean) => {
      character.setBuffEnabled("heroEcho", enabled);
      refresh();
    },
    [character, refresh]
  );

  return (
    <CharacterContext.Provider
      value={{
        character,
        version,
        setLevel,
        setJob,
        setPureStat,
        equipItem,
        unequipItem,
        setBuffEnabled,
        setBuffLevel,
        setMapleWarriorLevel,
        setBuff1Attack,
        setBuff2Attack,
        setHeroEchoEnabled,
        buff1Attack,
        buff2Attack,
        buff1Type,
        buff2Type,
        setBuff1Type,
        setBuff2Type,
        buff1Name,
        buff2Name,
        setBuff1Name,
        setBuff2Name,
      }}
    >
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
