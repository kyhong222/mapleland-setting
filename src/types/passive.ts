import shieldMasteryData from "../data/passive/warrior/shieldMastery.json";
import thrustData from "../data/passive/archer/thrust.json";
import amazonBlessingData from "../data/passive/archer/amazonBlessing.json";
import nimbleBodyData from "../data/passive/thief/nimbleBody.json";

export interface PassiveSkillData {
  koreanName: string;
  englishName: string;
  description: string;
  maxLevel: number;
  icon: string;
  requireSecondaryType?: string;
  properties: Record<string, number>[];
}

export const passivesByJob: Record<string, PassiveSkillData[]> = {
  warrior: [shieldMasteryData as unknown as PassiveSkillData],
  archer: [
    thrustData as unknown as PassiveSkillData,
    amazonBlessingData as unknown as PassiveSkillData,
  ],
  thief: [nimbleBodyData as unknown as PassiveSkillData],
  magician: [],
};

export const propLabels: Record<string, string> = {
  pdefP: "방패 착용 시 물리방어력%",
  speed: "이속",
  acc: "명중",
  eva: "회피",
};
