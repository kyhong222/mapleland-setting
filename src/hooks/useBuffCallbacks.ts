import { useCallback, useMemo } from "react";
import type { Character } from "../domain/Character";
import type { DefenseBuffStat, DefenseBuffEntry } from "../domain/Character";
import mastery2Data from "../data/buff/mastery/mastery2.json";
import type { MasterySkill } from "../types/mastery";
import { passivesByJob } from "../types/passive";

const mastery2Skills = mastery2Data as MasterySkill[];

export function getMastery2SkillByWeaponType(weaponType: string | null): MasterySkill | null {
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
}

export function getMastery2AttackByLevel(weaponType: string | null, level: number): number {
  const skill = getMastery2SkillByWeaponType(weaponType);
  const prop = skill?.properties[level];
  return prop?.att ?? 0;
}

export function getDefaultPassiveLevels(jobEngName: string): Record<string, number> {
  const passives = passivesByJob[jobEngName] || [];
  const levels: Record<string, number> = {};
  for (const p of passives) {
    levels[p.englishName] = p.maxLevel;
  }
  return levels;
}

export function useBuffCallbacks(character: Character, refresh: () => void, version: number) {
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
      character.setBuff1Attack(attack);
      refresh();
    },
    [character, refresh],
  );

  const setBuff2Attack = useCallback(
    (attack: number) => {
      character.setBuff2Attack(attack);
      refresh();
    },
    [character, refresh],
  );

  const setHeroEchoEnabled = useCallback(
    (enabled: boolean) => {
      character.setHeroEchoEnabled(enabled);
      refresh();
    },
    [character, refresh],
  );

  const setMastery1 = useCallback(
    (value: number) => {
      character.setMastery1(value);
      refresh();
    },
    [character, refresh],
  );

  const setMastery2 = useCallback(
    (value: number) => {
      character.setMastery2(value);
      const weaponType = character.getWeaponType();
      character.setMasteryAttack(getMastery2AttackByLevel(weaponType, value));
      refresh();
    },
    [character, refresh],
  );

  const setMasteryAttack = useCallback(
    (value: number) => {
      character.setMasteryAttack(value);
      refresh();
    },
    [character, refresh],
  );

  const setPassiveLevel = useCallback(
    (key: string, level: number) => {
      character.setPassiveLevel(key, level);
      refresh();
    },
    [character, refresh],
  );

  const setSpecialSkillLevel = useCallback(
    (key: string, level: number) => {
      character.setSpecialSkillLevel(key, level);
      refresh();
    },
    [character, refresh],
  );

  const setBuffMAD = useCallback(
    (mad: number) => {
      character.setBuffMAD(mad);
      refresh();
    },
    [character, refresh],
  );

  const setBuff1Label = useCallback(
    (label: string) => {
      character.updateBuffUI({ buff1Label: label });
      refresh();
    },
    [character, refresh],
  );

  const setBuff1Icon = useCallback(
    (icon: string | null) => {
      character.updateBuffUI({ buff1Icon: icon });
      refresh();
    },
    [character, refresh],
  );

  const setBuff1IsManual = useCallback(
    (isManual: boolean) => {
      character.updateBuffUI({ buff1IsManual: isManual });
      refresh();
    },
    [character, refresh],
  );

  const setBuff2Label = useCallback(
    (label: string) => {
      character.updateBuffUI({ buff2Label: label });
      refresh();
    },
    [character, refresh],
  );

  const setBuff2Icon = useCallback(
    (icon: string | null) => {
      character.updateBuffUI({ buff2Icon: icon });
      refresh();
    },
    [character, refresh],
  );

  const setBuff2IsManual = useCallback(
    (isManual: boolean) => {
      character.updateBuffUI({ buff2IsManual: isManual });
      refresh();
    },
    [character, refresh],
  );

  const setDefenseBuff = useCallback(
    (stat: DefenseBuffStat, entry: Partial<DefenseBuffEntry>) => {
      character.setDefenseBuff(stat, entry);
      refresh();
    },
    [character, refresh],
  );

  return useMemo(
    () => ({
      setBuffEnabled,
      setBuffLevel,
      setMapleWarriorLevel,
      setBuff1Attack,
      setBuff2Attack,
      setHeroEchoEnabled,
      setMastery1,
      setMastery2,
      setMasteryAttack,
      setPassiveLevel,
      setBuffMAD,
      setBuff1Label,
      setBuff1Icon,
      setBuff1IsManual,
      setBuff2Label,
      setBuff2Icon,
      setBuff2IsManual,
      setDefenseBuff,
      setSpecialSkillLevel,
      defenseBuffs: character.getDefenseBuffs(),
      specialSkillLevels: character.getSpecialSkillLevels(),
      heroEchoEnabled: character.getHeroEchoEnabled(),
      buff1Attack: character.getBuff1Attack(),
      buff2Attack: character.getBuff2Attack(),
      masteryAttack: character.getMasteryAttack(),
      mastery1: character.getMastery1(),
      mastery2: character.getMastery2(),
      passiveLevels: character.getPassiveLevels(),
      buffMAD: character.getBuffMAD(),
      ...character.getBuffUIState(),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      version, // cache-busting: character is mutable, version triggers getter re-evaluation
      character,
      setBuffEnabled,
      setBuffLevel,
      setMapleWarriorLevel,
      setBuff1Attack,
      setBuff2Attack,
      setHeroEchoEnabled,
      setMastery1,
      setMastery2,
      setMasteryAttack,
      setPassiveLevel,
      setBuffMAD,
      setBuff1Label,
      setBuff1Icon,
      setBuff1IsManual,
      setBuff2Label,
      setBuff2Icon,
      setBuff2IsManual,
      setDefenseBuff,
      setSpecialSkillLevel,
    ],
  );
}
