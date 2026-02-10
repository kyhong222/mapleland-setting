import type { ItemType } from "./item";

/**
 * 마스터리 레벨별 속성
 */
export interface MasteryProperty {
  level: number | null;
  mastery: number | null; // 숙련도 %
  att?: number | null; // 추가 공격력 (null이면 0으로 처리)
  acc?: number | null; // 명중 (null이면 0으로 처리)
}

/**
 * 마스터리 스킬 정의 (mastery2.json 구조)
 */
export interface MasterySkill {
  icon: string;
  koreanName: string;
  englishName: string;
  description: string;
  weaponType: ItemType | ItemType[]; // 단일 또는 배열
  maxLevel: number; // 최대 레벨
  properties: MasteryProperty[];
}

/**
 * 마스터리 상태
 */
export interface MasteryState {
  // 기본 마스터리 (60% 고정)
  baseMastery: number;
  // 추가 마스터리 레벨 (0~30)
  additionalMasteryLevel: number;
  // 추가 마스터리에서 오는 숙련도 (레벨에 따라 0~30%)
  additionalMastery: number;
  // 추가 마스터리에서 오는 공격력 보너스
  masteryAttackBonus: number;
}

/**
 * 기본 마스터리 값
 */
export const BASE_MASTERY = 60;

/**
 * 총 숙련도 계산
 * @param baseMastery 기본 마스터리 (60%)
 * @param additionalMastery 추가 마스터리 (0~30%)
 * @returns 총 숙련도 (60~90%)
 */
export function calculateTotalMastery(baseMastery: number, additionalMastery: number): number {
  return baseMastery + additionalMastery;
}
