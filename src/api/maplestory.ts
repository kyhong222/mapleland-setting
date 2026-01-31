/**
 * 메이플스토리 API 호출 유틸
 */

import { getPostItemIcon, getPostItemCategoryKey } from "../utils/postItemLoader";

const API_BASE_URL = "https://maplestory.io/api/gms/62/item";

// 부위별 API 필터 매핑
export const ARMOR_FILTERS = {
  hat: {
    koreanName: "모자",
    subCategory: "Hat",
  },
  cape: {
    koreanName: "망토",
    subCategory: "Cape",
  },
  top: {
    koreanName: "상의",
    subCategory: "Top",
  },
  glove: {
    koreanName: "장갑",
    subCategory: "Glove",
  },
  overall: {
    koreanName: "전신",
    subCategory: "Overall",
  },
  bottom: {
    koreanName: "하의",
    subCategory: "Bottom",
  },
  shield: {
    koreanName: "보조무기",
    subCategory: "Shield",
  },
  shoes: {
    koreanName: "신발",
    subCategory: "Shoes",
  },
  earrings: {
    koreanName: "귀고리",
    subCategory: "Earrings",
  },
  faceAccessory: {
    koreanName: "얼굴장식",
    subCategory: "Face Accessory",
  },
  medal: {
    koreanName: "훈장",
    subCategory: "Medal",
  },
  eyeDecoration: {
    koreanName: "눈장식",
    subCategory: "Eye Decoration",
  },
  pendant: {
    koreanName: "목걸이",
    subCategory: "Pendant",
  },
} as const;

export type ArmorFilterKey = keyof typeof ARMOR_FILTERS;

export interface MapleStoryItem {
  id: number;
  description?: Record<string, string>;
  metaInfo?: {
    reqLevel?: number;
    reqSTR?: number;
    reqDEX?: number;
    reqINT?: number;
    reqLUK?: number;
    reqLevelEquip?: number;
    incPDD?: number; // 물리방어력
    incMDD?: number; // 마법방어력
    incSTR?: number; // 힘
    incDEX?: number; // 민첩
    incINT?: number; // 지력
    incLUK?: number; // 행운
    incACC?: number; // 명중률
    incEVA?: number; // 회피율
    incPAD?: number; // 공격력
    incMAD?: number; // 마력
    attackSpeed?: number; // 공격속도
  };
  typeInfo?: any;
  frameBooks?: any;
  equipGroup?: any;
}

/**
 * 메이플스토리 API에서 직업별 아이템 데이터 조회
 * @param subCategory - 부위 필터 (예: "Hat", "Overall")
 * @param jobId - 직업 ID (1: 전사, 2: 궁수, 3: 마법사, 4: 도적)
 * @param startPosition - 시작 위치 (기본값: 0)
 * @param count - 조회 개수 (기본값: 100)
 * @returns 조회된 아이템 배열
 */
export async function fetchMapleStoryItems(
  subCategory: string,
  jobId: number,
  startPosition: number = 0,
  count: number = 100
): Promise<MapleStoryItem[]> {
  const params = new URLSearchParams({
    startPosition: String(startPosition),
    count: String(count),
    overallCategoryFilter: "Equip",
    categoryFilter: "Armor",
    subCategoryFilter: subCategory,
    jobFilter: String(jobId),
    cashFilter: "false",
    minLevelFilter: "0",
    maxLevelFilter: "110",
  });

  try {
    const response = await fetch(`${API_BASE_URL}?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.statusText}`);
    }
    const data = await response.json();
    return data.items;
  } catch (error) {
    console.error("메이플스토리 API 호출 오류:", error);
    return [];
  }
}

/**
 * 직업별 특정 부위 아이템 조회
 * @param armorFilter - 부위 필터 키
 * @param jobId - 직업 ID
 * @returns 조회된 아이템 배열
 */
export async function fetchArmorByPiece(armorFilter: ArmorFilterKey, jobId: number): Promise<MapleStoryItem[]> {
  const filter = ARMOR_FILTERS[armorFilter];
  return fetchMapleStoryItems(filter.subCategory, jobId);
}

/**
 * 직업별 모든 부위 아이템 조회
 * @param jobId - 직업 ID
 * @returns 부위별 아이템 맵
 */
export async function fetchAllArmorByJob(jobId: number): Promise<Record<ArmorFilterKey, MapleStoryItem[]>> {
  const results: Record<string, MapleStoryItem[]> = {};

  for (const [key, filter] of Object.entries(ARMOR_FILTERS)) {
    results[key] = await fetchMapleStoryItems(filter.subCategory, jobId);
  }

  return results as Record<ArmorFilterKey, MapleStoryItem[]>;
}

/**
 * 아이템 ID로 아이콘 이미지 URL 조회
 * slot/type이 주어지면 postItem 아이콘을 우선 확인
 * @param itemId - 아이템 ID
 * @param slot - 장비 슬롯 (예: "무기", "투구")
 * @param type - 장비 타입 (예: "한손검", "방패")
 * @returns 아이콘 이미지 URL
 */
export async function fetchItemIcon(itemId: number, slot?: string, type?: string): Promise<string | null> {
  try {
    // 1순위: postItem 아이콘
    if (slot) {
      const catKey = getPostItemCategoryKey(slot, type);
      if (catKey) {
        const postIcon = await getPostItemIcon(catKey, itemId);
        if (postIcon) return postIcon;
      }
    }
    // 2순위: API 아이콘
    const response = await fetch(`${API_BASE_URL}/${itemId}/icon?resize=5`);
    if (!response.ok) {
      throw new Error(`아이콘 조회 실패: ${response.statusText}`);
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("아이템 아이콘 조회 오류:", error);
    return null;
  }
}

/**
 * 아이템 ID로 상세 정보 조회
 * @param itemId - 아이템 ID
 * @returns 아이템 상세 정보
 */
export async function fetchItemDetails(itemId: number): Promise<MapleStoryItem | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/${itemId}`);
    if (!response.ok) {
      throw new Error(`아이템 상세 정보 조회 실패: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("아이템 상세 정보 조회 오류:", error);
    return null;
  }
}

/**
 * 여러 아이템의 아이콘을 한번에 조회
 * @param itemIds - 아이템 ID 배열
 * @returns 아이템 ID별 아이콘 URL 맵
 */
export async function fetchItemIcons(itemIds: number[]): Promise<Record<number, string | null>> {
  const results: Record<number, string | null> = {};

  for (const itemId of itemIds) {
    results[itemId] = await fetchItemIcon(itemId);
  }

  return results;
}

/**
 * KMS(한국 메이플스토리)에서 아이템의 한글 이름 조회
 * @param itemId - 아이템 ID
 * @returns 한글 아이템 이름
 */
export async function fetchItemNameKMS(itemId: number): Promise<string | null> {
  const KMS_API_BASE_URL = "https://maplestory.io/api/kms/284/item";

  try {
    const response = await fetch(`${KMS_API_BASE_URL}/${itemId}/name`);
    if (!response.ok) {
      throw new Error(`아이템 이름 조회 실패: ${response.statusText}`);
    }
    const data = await response.json();
    return data.name || null;
  } catch (error) {
    console.error("아이템 이름 조회 오류:", error);
    return null;
  }
}

/**
 * 여러 아이템의 한글 이름을 한번에 조회
 * @param itemIds - 아이템 ID 배열
 * @returns 아이템 ID별 한글 이름 맵
 */
export async function fetchItemNamesKMS(itemIds: number[]): Promise<Record<number, string | null>> {
  const results: Record<number, string | null> = {};

  for (const itemId of itemIds) {
    results[itemId] = await fetchItemNameKMS(itemId);
  }

  return results;
}
