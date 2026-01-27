/**
 * 아이템 변환 헬퍼 함수
 * PreItem -> Item, PostItem -> Item 변환
 */

import type { Item, PreItem, PostItem, ItemStats, ItemType } from "../types/item";
import type { EquipmentSlot } from "../types/equipment";
import { fetchItemById, type MapleStoryItem } from "./maplestotyAPI";

// PostItem 저장소 (id -> PostItem)
const postItemRegistry = new Map<number, PostItem>();

/**
 * PostItem 등록 (패치된 아이템 오버라이드용)
 */
export function registerPostItem(item: PostItem): void {
  if (item.id) {
    postItemRegistry.set(item.id, item);
  }
}

/**
 * 여러 PostItem 일괄 등록
 */
export function registerPostItems(items: PostItem[]): void {
  items.forEach(registerPostItem);
}

/**
 * PostItem 조회
 */
export function getPostItem(id: number): PostItem | undefined {
  return postItemRegistry.get(id);
}

/**
 * MapleStoryItem API 응답을 Item으로 변환
 */
export function mapleStoryItemToItem(
  apiItem: MapleStoryItem,
  slot: EquipmentSlot,
  type: ItemType = "방어구"
): Item {
  const stats: ItemStats = {
    attack: apiItem.incAttack ?? 0,
    str: apiItem.incStr ?? 0,
    dex: apiItem.incDex ?? 0,
    int: apiItem.incInt ?? 0,
    luk: apiItem.incLuk ?? 0,
    mad: apiItem.incMagic ?? 0,
  };

  return {
    id: apiItem.id,
    name: apiItem.name,
    slot,
    type,
    stats,
    requireStats: {
      level: apiItem.reqLevel ?? 0,
      str: apiItem.reqStr ?? 0,
      dex: apiItem.reqDex ?? 0,
      int: apiItem.reqInt ?? 0,
      luk: apiItem.reqLuk ?? 0,
    },
  };
}

/**
 * PreItem을 Item으로 변환
 * 1. PostItem이 등록되어 있으면 PostItem 사용
 * 2. 없으면 API 호출
 */
export async function preItemToItem(
  preItem: PreItem,
  slot: EquipmentSlot,
  type: ItemType = "방어구"
): Promise<Item | null> {
  // PostItem이 등록되어 있으면 우선 사용
  const postItem = getPostItem(preItem.id);
  if (postItem) {
    return postItem;
  }

  // API 호출
  const apiItem = await fetchItemById(preItem.id);
  if (!apiItem) {
    return null;
  }

  return mapleStoryItemToItem(apiItem, slot, type);
}

/**
 * PostItem을 Item으로 변환 (PostItem = Item이므로 그대로 반환)
 */
export function postItemToItem(postItem: PostItem): Item {
  return postItem;
}

/**
 * 기본 스탯을 가진 빈 Item 생성 (fallback용)
 */
export function createEmptyItem(
  id: number,
  name: string,
  slot: EquipmentSlot,
  type: ItemType = "방어구"
): Item {
  return {
    id,
    name,
    slot,
    type,
    stats: {
      attack: 0,
      str: 0,
      dex: 0,
      int: 0,
      luk: 0,
    },
    requireStats: {
      level: 0,
      str: 0,
      dex: 0,
      int: 0,
      luk: 0,
    },
  };
}
