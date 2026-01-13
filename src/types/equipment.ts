export interface Equipment {
  slot: string;
  name: string | null;
  icon?: string;
  attack?: number;
  str?: number;
  dex?: number;
  int?: number;
  luk?: number;
}

// 5*3 그리드 레이아웃 (null은 빈칸)
export const EQUIPMENT_LAYOUT = [
  ["투구", "상의", "망토", "귀고리", "무기"],
  ["목걸이", "하의", "신발", "장갑", "보조무기"],
  [null, "얼굴장식", "눈장식", "훈장", null],
] as const;

export const EQUIPMENT_SLOTS = [
  "투구",
  "목걸이",
  "상의",
  "하의",
  "망토",
  "신발",
  "귀고리",
  "장갑",
  "무기",
  "보조무기",
  "얼굴장식",
  "눈장식",
  "훈장",
] as const;

export type EquipmentSlot = (typeof EQUIPMENT_SLOTS)[number];
