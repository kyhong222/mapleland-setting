/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { Character } from "../domain/Character";
import type { Item } from "../types/item";
import type { Job } from "../types/job";
import type { EquipmentSlot } from "../types/equipment";
import mastery1Data from "../data/buff/mastery/mastery1.json";
import mastery2Data from "../data/buff/mastery/mastery2.json";
import type { MasterySkill } from "../types/mastery";
import shieldMasteryData from "../data/passive/warrior/shieldMastery.json";
import thrustData from "../data/passive/archer/thrust.json";
import amazonBlessingData from "../data/passive/archer/amazonBlessing.json";
import nimbleBodyData from "../data/passive/thief/nimbleBody.json";
import {
  saveSlotData,
  getSlotData,
  deleteSlotData,
  getSlotSummaries as getSlotSummariesFromStorage,
  setLastActive,
  type SavedCharacterData,
} from "../utils/characterStorage";
import { equipmentToSaved, savedToEquipment } from "../utils/equipmentConverter";
import { getInventory, saveInventory, INVENTORY_SIZE, type InventoryData } from "../utils/inventoryStorage";
import type { SavedEquipment } from "../types/equipment";

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

  // Buff attack values (외부 상태)
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

interface PassiveSkillData {
  koreanName: string;
  englishName: string;
  description: string;
  maxLevel: number;
  icon: string;
  requireSecondaryType?: string;
  properties: Record<string, number>[];
}

const passivesByJob: Record<string, PassiveSkillData[]> = {
  warrior: [shieldMasteryData as unknown as PassiveSkillData],
  archer: [thrustData as unknown as PassiveSkillData, amazonBlessingData as unknown as PassiveSkillData],
  thief: [nimbleBodyData as unknown as PassiveSkillData],
  magician: [],
};

function getDefaultPassiveLevels(jobEngName: string): Record<string, number> {
  const passives = passivesByJob[jobEngName] || [];
  const levels: Record<string, number> = {};
  for (const p of passives) {
    levels[p.englishName] = p.maxLevel;
  }
  return levels;
}

const mastery2Skills = mastery2Data as MasterySkill[];

const getMastery2SkillByWeaponType = (weaponType: string | null): MasterySkill | null => {
  if (weaponType === "활") {
    return mastery2Skills.find((m) => m.koreanName === "보우 엑스퍼트") || null;
  }
  if (weaponType === "석궁") {
    return mastery2Skills.find((m) => m.koreanName === "크로스보우 엑스퍼트") || null;
  }
  if (weaponType === "창" || weaponType === "폴암") {
    return mastery2Skills.find((m) => m.koreanName === "비홀더") || null;
  }
  return null;
};

const getMastery2AttackByLevel = (weaponType: string | null, level: number): number => {
  const skill = getMastery2SkillByWeaponType(weaponType);
  const prop = skill?.properties[level];
  return prop?.att ?? 0;
};

export function CharacterProvider({ children }: { children: ReactNode }) {
  const [character] = useState(() => new Character());
  const [version, setVersion] = useState(0);
  const [buff1Attack, setBuff1AttackState] = useState(0);
  const [buff2Attack, setBuff2AttackState] = useState(0);
  const [masteryAttack, setMasteryAttack] = useState(0);
  const [mastery1, setMastery1State] = useState(mastery1Data.maxLevel);
  const [mastery2, setMastery2State] = useState(0); // 무기 미장착 시 0
  const [buffMAD, setBuffMADState] = useState(0);
  const [heroEchoEnabled, setHeroEchoEnabledState] = useState(false);
  const [passiveLevels, setPassiveLevelsState] = useState<Record<string, number>>({});
  const [currentSlotIdx, setCurrentSlotIdxState] = useState(0);
  const [inventory, setInventoryState] = useState<InventoryData>([]);

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
      // 장비 전체 해제
      const currentEquipments = character.getEquipments();
      currentEquipments.forEach((eq) => {
        character.unequip(eq.slot as EquipmentSlot);
      });

      // 버프 초기화
      character.setBuffLevel("mapleWarrior", 0);
      character.setBuffEnabled("mapleWarrior", false);
      character.setBuffEnabled("heroEcho", false);
      setBuff1AttackState(0);
      setBuff2AttackState(0);
      setMastery1State(mastery1Data.maxLevel);
      setMastery2State(0); // 무기 미장착 시 0
      setMasteryAttack(0);
      setBuffMADState(0);
      setHeroEchoEnabledState(false);
      setBuff1LabelState("버프 선택");
      setBuff1IconState(null);
      setBuff1IsManualState(false);
      setBuff2LabelState("버프 선택");
      setBuff2IconState(null);
      setBuff2IsManualState(false);

      // 패시브 초기화
      setPassiveLevelsState(job ? getDefaultPassiveLevels(job.engName) : {});

      // 슬롯 초기화
      setCurrentSlotIdxState(0);

      character.setJob(job);
      setInventoryState(job ? getInventory(job.engName) : []);
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
      
      // 무기 장착 시 mastery2를 해당 무기의 maxLevel로 설정
      if (item.slot === "무기") {
        const weaponType = item.type;
        const skill = getMastery2SkillByWeaponType(weaponType);
        if (skill) {
          const maxLevel = skill.maxLevel;
          setMastery2State(maxLevel);
          setMasteryAttack(getMastery2AttackByLevel(weaponType, maxLevel));
        } else {
          setMastery2State(0);
          setMasteryAttack(0);
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
        setMastery2State(0);
        setMasteryAttack(0);
      }
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

  const setHeroEchoEnabledCallback = useCallback(
    (enabled: boolean) => {
      setHeroEchoEnabledState(enabled);
      character.setBuffEnabled("heroEcho", enabled);
      refresh();
    },
    [character, refresh],
  );

  const setMastery1 = useCallback(
    (value: number) => {
      setMastery1State(value);
      // mastery1은 att 필드가 없으므로 공격력 추가 없음
      refresh();
    },
    [refresh],
  );

  const setMastery2 = useCallback(
    (value: number) => {
      setMastery2State(value);
      
      // mastery2 attack 계산
      const weaponType = character.getWeaponType();
      setMasteryAttack(getMastery2AttackByLevel(weaponType, value));
      
      refresh();
    },
    [character, refresh],
  );

  const setPassiveLevel = useCallback(
    (key: string, level: number) => {
      setPassiveLevelsState((prev) => ({ ...prev, [key]: level }));
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

  // Inventory
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

  const setCurrentSlotIdx = useCallback(
    (idx: number) => {
      setCurrentSlotIdxState(idx);
    },
    [],
  );

  // Save/Load
  const loadCharacter = useCallback(
    async (data: SavedCharacterData) => {
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

      // 저장된 장비 복원 (postItem에서 uneditable 값 조회)
      const equipments = await Promise.all(data.equipments.map(savedToEquipment));
      equipments.forEach((eq) => {
        const item: Item = {
          id: eq.id,
          name: eq.name || "",
          icon: eq.icon,
          slot: eq.slot as EquipmentSlot,
          type: (eq.type || "방어구") as Item["type"],
          stats: {
            attack: eq.attack || 0,
            str: eq.str || 0,
            dex: eq.dex || 0,
            int: eq.int || 0,
            luk: eq.luk || 0,
            mad: eq.mad || 0,
            pdef: eq.pdef || 0,
            mdef: eq.mdef || 0,
            acc: eq.acc || 0,
            eva: eq.eva || 0,
            speed: eq.speed || 0,
            jump: eq.jump || 0,
            hp: eq.hp || 0,
            mp: eq.mp || 0,
            ...(eq.attackSpeed != null ? { attackSpeed: eq.attackSpeed } : {}),
          },
          requireStats: {
            level: eq.reqLevel || 0,
            str: eq.reqStr || 0,
            dex: eq.reqDex || 0,
            int: eq.reqInt || 0,
            luk: eq.reqLuk || 0,
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
        setHeroEchoEnabledState(data.buffs.heroEchoEnabled);
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
        if (data.buffs.passiveLevels) setPassiveLevelsState(data.buffs.passiveLevels);
      }

      const weaponType = character.getWeaponType();
      const mastery2Level = data.buffs?.mastery2 ?? 0;
      setMasteryAttack(getMastery2AttackByLevel(weaponType, mastery2Level));

      refresh();
    },
    [character, refresh],
  );

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

    const saved = saveSlotData(job.engName, currentSlotIdx, {
      level: stats.level,
      pureStr: stats.pureStr,
      pureDex: stats.pureDex,
      pureInt: stats.pureInt,
      pureLuk: stats.pureLuk,
      equipments: equipments.filter((eq) => eq.id != null).map(equipmentToSaved),
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
        passiveLevels,
      },
    });

    return saved;
  }, [
    character,
    currentSlotIdx,
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
    passiveLevels,
  ]);

  const loadSlot = useCallback(
    async (slotIdx: number) => {
      setCurrentSlotIdxState(slotIdx);
      const job = character.getJob();
      if (!job) return;

      setLastActive(job.engName, slotIdx);

      const data = getSlotData(job.engName, slotIdx);
      if (data) {
        await loadCharacter(data);
      } else {
        // 빈 슬롯: 스탯 + 장비 + 버프 전체 초기화
        character.setLevel(10);
        character.setPureStat("str", 4);
        character.setPureStat("dex", 4);
        character.setPureStat("int", 4);
        character.setPureStat("luk", 4);
        const currentEquipments = character.getEquipments();
        currentEquipments.forEach((eq) => {
          character.unequip(eq.slot as EquipmentSlot);
        });
        character.setBuffLevel("mapleWarrior", 0);
        character.setBuffEnabled("mapleWarrior", false);
        character.setBuffEnabled("heroEcho", false);
        setBuff1AttackState(0);
        setBuff2AttackState(0);
        setMasteryAttack(0);
        setMastery1State(mastery1Data.maxLevel);
        setMastery2State(0);
        setBuffMADState(0);
        setHeroEchoEnabledState(false);
        setBuff1LabelState("버프 선택");
        setBuff1IconState(null);
        setBuff1IsManualState(false);
        setBuff2LabelState("버프 선택");
        setBuff2IconState(null);
        setBuff2IsManualState(false);
        const jobName = character.getJob()?.engName;
        setPassiveLevelsState(jobName ? getDefaultPassiveLevels(jobName) : {});
        refresh();
      }
    },
    [character, loadCharacter, refresh],
  );

  const deleteSlot = useCallback(
    (slotIdx: number) => {
      const job = character.getJob();
      if (!job) return;
      deleteSlotData(job.engName, slotIdx);
      refresh();
    },
    [character, refresh],
  );

  // Auto-save: version이 바뀔 때마다 현재 슬롯에 자동 저장
  useEffect(() => {
    if (version === 0) return;
    if (!character.getJob()) return;
    saveCurrentCharacter();
  }, [version, saveCurrentCharacter, character]);

  const getSlotSummaries = useCallback(() => {
    const job = character.getJob();
    if (!job) return [null, null, null, null, null] as (SavedCharacterData | null)[];
    return getSlotSummariesFromStorage(job.engName);
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
        setHeroEchoEnabled: setHeroEchoEnabledCallback,
        heroEchoEnabled,
        buff1Attack,
        buff2Attack,
        masteryAttack,
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
        setMasteryAttack,
        mastery1,
        mastery2,
        passiveLevels,
        setPassiveLevel,
        setBuffMAD,
        buffMAD,
        inventory,
        addToInventory,
        removeFromInventory,
        setInventory,
        currentSlotIdx,
        setCurrentSlotIdx,
        saveCurrentCharacter,
        loadCharacter,
        loadSlot,
        deleteSlot,
        getSlotSummaries,
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
