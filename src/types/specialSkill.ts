import powerGuardData from "../data/buff/warrior/powerGuard.json";
import achillesData from "../data/buff/warrior/achilles.json";
import warriorElementResistanceData from "../data/buff/warrior/elementResistance.json";
import invincibleData from "../data/buff/magician/invincible.json";
import partialResistanceFPData from "../data/buff/magician/partialResistanceFP.json";
import partialResistanceILData from "../data/buff/magician/partialResistanceIL.json";
import mesoGuardData from "../data/buff/thief/mesoGuard.json";
import fakeData from "../data/buff/thief/fake.json";
import fakeClawData from "../data/buff/thief/fakeClaw.json";

export interface SpecialSkillData {
  koreanName: string;
  englishName: string;
  description: string;
  maxLevel: number;
  icon: string;
  requireWeaponTypes?: string[];
  excludeWeaponTypes?: string[];
  properties: Record<string, number>[];
}

export const specialSkillsByJob: Record<string, SpecialSkillData[]> = {
  warrior: [
    powerGuardData as unknown as SpecialSkillData,
    achillesData as unknown as SpecialSkillData,
    warriorElementResistanceData as unknown as SpecialSkillData,
  ],
  archer: [],
  magician: [
    invincibleData as unknown as SpecialSkillData,
    partialResistanceFPData as unknown as SpecialSkillData,
    partialResistanceILData as unknown as SpecialSkillData,
  ],
  thief: [
    mesoGuardData as unknown as SpecialSkillData,
    fakeData as unknown as SpecialSkillData,
    fakeClawData as unknown as SpecialSkillData,
  ],
};

export const specialPropLabels: Record<string, string> = {
  damR: "데미지 감소%",
  mesoR: "메소 소모%",
  evaP: "추가 회피확률",
};
