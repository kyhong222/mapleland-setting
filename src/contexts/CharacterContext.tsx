/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { Character } from "../domain/Character";
import type { Item } from "../types/item";
import type { Job } from "../types/job";
import type { EquipmentSlot } from "../types/equipment";
import { saveCharacter, getSavedCharacters, type SavedCharacterData } from "../utils/characterStorage";

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

  // Buff attack values (외부 상태)
  buff1Attack: number;
  buff2Attack: number;

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
  mastery1: number;
  mastery2: number;

  // Magic Attack (마력)
  setBuffMAD: (mad: number) => void;
  buffMAD: number;

  // Save/Load
  saveCurrentCharacter: () => SavedCharacterData | null;
  loadCharacter: (data: SavedCharacterData) => void;
  getSavedList: () => SavedCharacterData[];
}

const CharacterContext = createContext<CharacterContextValue | null>(null);

export function CharacterProvider({ children }: { children: ReactNode }) {
  const [character] = useState(() => new Character());
  const [version, setVersion] = useState(0);
  const [buff1Attack, setBuff1AttackState] = useState(0);
  const [buff2Attack, setBuff2AttackState] = useState(0);
  const [mastery1, setMastery1State] = useState(0);
  const [mastery2, setMastery2State] = useState(0);
  const [buffMAD, setBuffMADState] = useState(0);

  // Buff selection states
  const [buff1Label, setBuff1LabelState] = useState("버프 선택");
  const [buff1Icon, setBuff1IconState] = useState<string | null>(null);
  const [buff1IsManual, setBuff1IsManualState] = useState(false);
  const [buff2Label, setBuff2LabelState] = useState("버프 선택");
  const [buff2Icon, setBuff2IconState] = useState<string | null>(null);
  const [buff2IsManual, setBuff2IsManualState] = useState(false);

  const refresh = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  // Stats
  const setLevel = useCallback(
    (level: number) => {
      character.setLevel(level);
      refresh();
    },
    [character, refresh],
  );

  const setJob = useCallback(
    (job: Job | null) => {
      character.setJob(job);
      refresh();
    },
    [character, refresh],
  );

  const setPureStat = useCallback(
    (stat: "str" | "dex" | "int" | "luk", value: number) => {
      character.setPureStat(stat, value);
      refresh();
    },
    [character, refresh],
  );

  // Equipments
  const equipItem = useCallback(
    (item: Item) => {
      const result = character.equip(item);
      refresh();
      return result;
    },
    [character, refresh],
  );

  const unequipItem = useCallback(
    (slot: EquipmentSlot) => {
      character.unequip(slot);
      refresh();
    },
    [character, refresh],
  );

  // Buffs
  const setBuffEnabled = useCallback(
    (id: string, enabled: boolean) => {
      character.setBuffEnabled(id, enabled);
      refresh();
    },
    [character, refresh],
  );

  const setBuffLevel = useCallback(
    (id: string, level: number) => {
      character.setBuffLevel(id, level);
      refresh();
    },
    [character, refresh],
  );

  // Buff helpers
  const setMapleWarriorLevel = useCallback(
    (level: number) => {
      character.setBuffLevel("mapleWarrior", level);
      character.setBuffEnabled("mapleWarrior", level > 0);
      refresh();
    },
    [character, refresh],
  );

  const setBuff1Attack = useCallback(
    (attack: number) => {
      setBuff1AttackState(attack);
      refresh();
    },
    [refresh],
  );

  const setBuff2Attack = useCallback(
    (attack: number) => {
      setBuff2AttackState(attack);
      refresh();
    },
    [refresh],
  );

  const setHeroEchoEnabled = useCallback(
    (enabled: boolean) => {
      character.setBuffEnabled("heroEcho", enabled);
      refresh();
    },
    [character, refresh],
  );

  const setMastery1 = useCallback(
    (value: number) => {
      setMastery1State(value);
      refresh();
    },
    [refresh],
  );

  const setMastery2 = useCallback(
    (value: number) => {
      setMastery2State(value);
      refresh();
    },
    [refresh],
  );

  const setBuffMAD = useCallback(
    (mad: number) => {
      setBuffMADState(mad);
      const stats = character.getStats();
      stats.buffMAD = mad;
      refresh();
    },
    [character, refresh],
  );

  // Save/Load
  const saveCurrentCharacter = useCallback(() => {
    const job = character.getJob();
    if (!job) {
      console.warn("직업이 선택되지 않았습니다.");
      return null;
    }

    const stats = character.getStats();
    const equipments = character.getEquipments();
    const weaponEquip = equipments.find((eq) => eq.slot === "무기");

    // 버프 정보 가져오기
    const mapleWarrior = character.getBuff("mapleWarrior");
    const heroEcho = character.getBuff("heroEcho");

    const saved = saveCharacter({
      jobEngName: job.engName,
      level: stats.level,
      pureStr: stats.pureStr,
      pureDex: stats.pureDex,
      pureInt: stats.pureInt,
      pureLuk: stats.pureLuk,
      equipments,
      weaponId: weaponEquip?.id,
      buffs: {
        mapleWarriorLevel: mapleWarrior?.level || 0,
        buff1Attack,
        buff2Attack,
        heroEchoEnabled: heroEcho?.enabled || false,
        mastery1,
        mastery2,
        buffMAD,
        // buff1/buff2 선택 정보
        buff1Label,
        buff1Icon,
        buff1IsManual,
        buff2Label,
        buff2Icon,
        buff2IsManual,
      },
    });

    return saved;
  }, [
    character,
    buff1Attack,
    buff2Attack,
    mastery1,
    mastery2,
    buffMAD,
    buff1Label,
    buff1Icon,
    buff1IsManual,
    buff2Label,
    buff2Icon,
    buff2IsManual,
  ]);

  const loadCharacter = useCallback(
    (data: SavedCharacterData) => {
      // 레벨과 순스텟 복원
      character.setLevel(data.level);
      character.setPureStat("str", data.pureStr);
      character.setPureStat("dex", data.pureDex);
      character.setPureStat("int", data.pureInt);
      character.setPureStat("luk", data.pureLuk);

      // 모든 장비 해제 후 재장착
      const currentEquipments = character.getEquipments();
      currentEquipments.forEach((eq) => {
        character.unequip(eq.slot as EquipmentSlot);
      });

      // 저장된 장비 장착
      data.equipments.forEach((eq) => {
        const item: Item = {
          id: eq.id,
          name: eq.name || "",
          slot: eq.slot as EquipmentSlot,
          type: (eq.type || "방어구") as Item["type"],
          stats: {
            attack: eq.attack || 0,
            str: eq.str || 0,
            dex: eq.dex || 0,
            int: eq.int || 0,
            luk: eq.luk || 0,
          },
          requireStats: {
            level: 0,
            str: 0,
            dex: 0,
            int: 0,
            luk: 0,
          },
        };
        character.equip(item);
      });

      // 버프 정보 복원
      if (data.buffs) {
        character.setBuffLevel("mapleWarrior", data.buffs.mapleWarriorLevel);
        character.setBuffEnabled("mapleWarrior", data.buffs.mapleWarriorLevel > 0);
        setBuff1AttackState(data.buffs.buff1Attack);
        setBuff2AttackState(data.buffs.buff2Attack);
        character.setBuffEnabled("heroEcho", data.buffs.heroEchoEnabled);
        setMastery1State(data.buffs.mastery1);
        setMastery2State(data.buffs.mastery2);
        if (data.buffs.buffMAD !== undefined) setBuffMADState(data.buffs.buffMAD);
        // buff 선택 정보 복원
        if (data.buffs.buff1Label) setBuff1LabelState(data.buffs.buff1Label);
        if (data.buffs.buff1Icon !== undefined) setBuff1IconState(data.buffs.buff1Icon);
        if (data.buffs.buff1IsManual !== undefined) setBuff1IsManualState(data.buffs.buff1IsManual);
        if (data.buffs.buff2Label) setBuff2LabelState(data.buffs.buff2Label);
        if (data.buffs.buff2Icon !== undefined) setBuff2IconState(data.buffs.buff2Icon);
        if (data.buffs.buff2IsManual !== undefined) setBuff2IsManualState(data.buffs.buff2IsManual);
      }

      refresh();
    },
    [character, refresh],
  );

  const getSavedList = useCallback(() => {
    const job = character.getJob();
    if (!job) return [];
    return getSavedCharacters(job.engName);
  }, [character]);

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
        buff1Label,
        setBuff1Label: setBuff1LabelState,
        buff1Icon,
        setBuff1Icon: setBuff1IconState,
        buff1IsManual,
        setBuff1IsManual: setBuff1IsManualState,
        buff2Label,
        setBuff2Label: setBuff2LabelState,
        buff2Icon,
        setBuff2Icon: setBuff2IconState,
        buff2IsManual,
        setBuff2IsManual: setBuff2IsManualState,
        setMastery1,
        setMastery2,
        mastery1,
        mastery2,
        setBuffMAD,
        buffMAD,
        saveCurrentCharacter,
        loadCharacter,
        getSavedList,
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
