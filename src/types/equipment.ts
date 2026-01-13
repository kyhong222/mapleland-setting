export interface Equipment {
  slot: string;
  name: string | null;
  icon?: string;
}

// 5*3 그리드 레이아웃 (null은 빈칸)
export const EQUIPMENT_LAYOUT = [
  ["투구", "상의", "망토", "귀고리", "무기"],
  ["목걸이", "하의", "신발", "장갑", "보조무기"],
  [null, "훈장", "얼굴장식", "눈장식", null],
] as const;

export const EQUIPMENT_SLOTS = [
  "투구",
  "상의",
  "망토",
  "귀고리",
  "무기",
  "목걸이",
  "하의",
  "신발",
  "장갑",
  "보조무기",
  "훈장",
  "얼굴장식",
  "눈장식",
] as const;

export type EquipmentSlot = (typeof EQUIPMENT_SLOTS)[number];
