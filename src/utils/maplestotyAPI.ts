/**
 * 메이플스토리 API 호출 유틸
 */

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
  name: string;
  description?: string;
  icon?: string;
  iconRaw?: string;
  reqLevel?: number;
  reqStr?: number;
  reqDex?: number;
  reqInt?: number;
  reqLuk?: number;
  incStr?: number;
  incDex?: number;
  incInt?: number;
  incLuk?: number;
  incAttack?: number;
  incMagic?: number;
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
    maxLevelFilter: "999",
  });

  try {
    const response = await fetch(`${API_BASE_URL}?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`API 호출 실패: ${response.statusText}`);
    }
    const data = await response.json();
    return data;
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
 * 아이템 ID로 단일 아이템 조회
 * @param itemId - 아이템 ID
 * @returns MapleStoryItem 또는 null
 */
export async function fetchItemById(itemId: number): Promise<MapleStoryItem | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/${itemId}`);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("아이템 조회 오류:", error);
    return null;
  }
}
