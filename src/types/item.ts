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
  | "화살"
  | "석궁화살"
  | "방패"
  | "너클"
  | "건";

// 아이템 스탯 정의
export interface ItemStats {
  attack: number;
  str: number;
  dex: number;
  int: number;
  luk: number;
  mad?: number; // 마력 (Magic Attack Damage)
  pdef?: number; // 물리방어력 (Physical Defense)
  mdef?: number; // 마법방어력 (Magical Defense)
  acc?: number; // 명중률 (Accuracy)
  eva?: number; // 회피율 (Evasion)
  macc?: number; // 마법명중률 (Magic Accuracy)
  speed?: number; // 이동속도 (Speed)
  jump?: number; // 점프력 (Jump)
  hp?: number; // 추가 HP
  mp?: number; // 추가 MP
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

// PreItem: API 호출 전 사전 정의된 아이템 (data/items/*.json)
export interface PreItem {
  id: number;
  name: string;
  koreanName: string;
  reqJob: number;
  reqLevel: number;
}

// PostItem: 패치된/API 미지원 아이템 (Item과 동일한 구조)
export type PostItem = Item;
