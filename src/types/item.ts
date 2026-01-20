import type { EquipmentSlot } from "./equipment";

// 아이템 타입 정의
export type ItemType =
  | "방어구"
  | "전신"
  | "한손검"
  | "한손도끼"
  | "한손둔기"
  | "두손검"
  | "두손도끼"
  | "두손둔기"
  | "창"
  | "폴암"
  | "활"
  | "석궁"
  | "완드"
  | "스태프"
  | "단검"
  | "아대"
  | "표창"
  | "방패";

// 아이템 스탯 정의
export interface ItemStats {
  attack: number;
  str: number;
  dex: number;
  int: number;
  luk: number;
}

// 아이템 필요 스탯 정의
export interface RequireStats {
  level: number;
  str: number;
  dex: number;
  int: number;
  luk: number;
}

// 아이템 정의 (아이템이름, 착용부위, 스탯)
export interface Item {
  id?: number;
  name: string;
  slot: EquipmentSlot;
  type: ItemType;
  stats: ItemStats;
  requireStats: RequireStats;
}
