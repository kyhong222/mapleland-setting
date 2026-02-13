import { useCallback, useMemo } from "react";
import type { Character } from "../domain/Character";
import type { EquipmentSlot } from "../types/equipment";
import type { Item } from "../types/item";
import {
  saveSlotData,
  getSlotData,
  deleteSlotData,
  getSlotSummaries as getSlotSummariesFromStorage,
  setLastActive,
  type SavedCharacterData,
} from "../utils/characterStorage";
import { equipmentToSaved, savedToEquipment } from "../utils/equipmentConverter";
import { getMastery2AttackByLevel, getDefaultPassiveLevels } from "./useBuffCallbacks";

export function useStorageCallbacks(
  character: Character,
  refresh: () => void,
  currentSlotIdx: number,
  setCurrentSlotIdx: (idx: number) => void,
) {
  const loadCharacter = useCallback(
    async (data: SavedCharacterData) => {
      character.setLevel(data.level);
      character.setPureStat("str", data.pureStr);
      character.setPureStat("dex", data.pureDex);
      character.setPureStat("int", data.pureInt);
      character.setPureStat("luk", data.pureLuk);

      const currentEquipments = character.getEquipments();
      currentEquipments.forEach((eq) => {
        character.unequip(eq.slot as EquipmentSlot);
      });

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

      if (data.buffs) {
        character.setBuffLevel("mapleWarrior", data.buffs.mapleWarriorLevel);
        character.setBuffEnabled("mapleWarrior", data.buffs.mapleWarriorLevel > 0);
        character.setBuff1Attack(data.buffs.buff1Attack);
        character.setBuff2Attack(data.buffs.buff2Attack);
        character.setHeroEchoEnabled(data.buffs.heroEchoEnabled);
        character.setMastery1(data.buffs.mastery1);
        character.setMastery2(data.buffs.mastery2);
        if (data.buffs.buffMAD !== undefined) character.setBuffMAD(data.buffs.buffMAD);
        character.updateBuffUI({
          ...(data.buffs.buff1Label ? { buff1Label: data.buffs.buff1Label } : {}),
          ...(data.buffs.buff1Icon !== undefined ? { buff1Icon: data.buffs.buff1Icon } : {}),
          ...(data.buffs.buff1IsManual !== undefined ? { buff1IsManual: data.buffs.buff1IsManual } : {}),
          ...(data.buffs.buff2Label ? { buff2Label: data.buffs.buff2Label } : {}),
          ...(data.buffs.buff2Icon !== undefined ? { buff2Icon: data.buffs.buff2Icon } : {}),
          ...(data.buffs.buff2IsManual !== undefined ? { buff2IsManual: data.buffs.buff2IsManual } : {}),
        });
        if (data.buffs.passiveLevels) character.setPassiveLevels(data.buffs.passiveLevels);
      }

      const weaponType = character.getWeaponType();
      const mastery2Level = data.buffs?.mastery2 ?? 0;
      character.setMasteryAttack(getMastery2AttackByLevel(weaponType, mastery2Level));

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
        buff1Attack: character.getBuff1Attack(),
        buff2Attack: character.getBuff2Attack(),
        heroEchoEnabled: heroEcho?.enabled || false,
        mastery1: character.getMastery1(),
        mastery2: character.getMastery2(),
        buffMAD: character.getBuffMAD(),
        ...character.getBuffUIState(),
        passiveLevels: character.getPassiveLevels(),
      },
    });

    return saved;
  }, [character, currentSlotIdx]);

  const loadSlot = useCallback(
    async (slotIdx: number) => {
      setCurrentSlotIdx(slotIdx);
      const job = character.getJob();
      if (!job) return;

      setLastActive(job.engName, slotIdx);

      const data = getSlotData(job.engName, slotIdx);
      if (data) {
        await loadCharacter(data);
      } else {
        character.setLevel(10);
        character.setPureStat("str", 4);
        character.setPureStat("dex", 4);
        character.setPureStat("int", 4);
        character.setPureStat("luk", 4);
        const currentEquipments = character.getEquipments();
        currentEquipments.forEach((eq) => {
          character.unequip(eq.slot as EquipmentSlot);
        });
        character.resetBuffState();
        const jobName = character.getJob()?.engName;
        character.setPassiveLevels(jobName ? getDefaultPassiveLevels(jobName) : {});
        refresh();
      }
    },
    [character, loadCharacter, refresh, setCurrentSlotIdx],
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

  const getSlotSummaries = useCallback(() => {
    const job = character.getJob();
    if (!job) return [null, null, null, null, null] as (SavedCharacterData | null)[];
    return getSlotSummariesFromStorage(job.engName);
  }, [character]);

  return useMemo(
    () => ({
      currentSlotIdx,
      setCurrentSlotIdx,
      saveCurrentCharacter,
      loadCharacter,
      loadSlot,
      deleteSlot,
      getSlotSummaries,
    }),
    [
      currentSlotIdx,
      setCurrentSlotIdx,
      saveCurrentCharacter,
      loadCharacter,
      loadSlot,
      deleteSlot,
      getSlotSummaries,
    ],
  );
}
