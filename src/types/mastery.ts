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

