export interface Equipment {
  id?: number;
  slot: string;
  name: string | null;
  type?: string;
  icon?: string;
  attack?: number;
  str?: number;
  dex?: number;
  int?: number;
  luk?: number;
  mad?: number; // 마력 (Magic Attack Damage)
  pdef?: number; // 물리 방어력
  mdef?: number; // 마법 방어력
  acc?: number; // 명중률
  eva?: number; // 회피율
  macc?: number; // 마법명중률
  speed?: number; // 이동속도
  jump?: number; // 점프력
  hp?: number; // 추가 HP
  mp?: number; // 추가 MP
  attackSpeed?: number; // 공격속도
  reqLevel?: number; // 착용 필요 레벨
  reqStr?: number; // 착용 필요 STR
  reqDex?: number; // 착용 필요 DEX
  reqInt?: number; // 착용 필요 INT
  reqLuk?: number; // 착용 필요 LUK
}

// 5*3 그리드 레이아웃 (null은 빈칸)
export const EQUIPMENT_LAYOUT = [
  ["투구", "상의", "망토", "귀고리", "무기"],
  ["목걸이", "하의", "신발", "장갑", "보조무기"],
  ["벨트", "얼굴장식", "눈장식", "훈장", null],
] as const;

export const EQUIPMENT_SLOTS = [
  "투구",
  "목걸이",
  "전신",
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
  "벨트",
] as const;

export type EquipmentSlot = (typeof EQUIPMENT_SLOTS)[number];

export interface SavedEquipment {
  id: number;
  slot: string;
  type?: string;
  attack?: number;
  str?: number;
  dex?: number;
  int?: number;
  luk?: number;
  mad?: number;
  pdef?: number;
  mdef?: number;
  acc?: number;
  eva?: number;
}
