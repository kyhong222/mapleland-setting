import type { PostItemData } from "../types/item";

// import.meta.glob으로 빌드 시 JSON 파일을 모두 포함
const postItemModules = import.meta.glob("../data/postItems/**/*.json");

// PostItem 데이터 캐시 (모듈 레벨 - 앱 전체 공유)
const postItemCache = new Map<string, Record<string, PostItemData>>();

export async function loadPostItemData(categoryKey: string): Promise<Record<string, PostItemData>> {
  if (postItemCache.has(categoryKey)) {
    return postItemCache.get(categoryKey)!;
  }
  try {
    const path = `../data/postItems/${categoryKey}.json`;
    const loader = postItemModules[path];
    if (!loader) {
      postItemCache.set(categoryKey, {});
      return {};
    }
    const module = await loader();
    const data = (module as { default: Record<string, PostItemData> }).default;
    postItemCache.set(categoryKey, data);
    return data;
  } catch {
    postItemCache.set(categoryKey, {});
    return {};
  }
}

/**
 * 아이템 ID로 postItem 아이콘 URL 조회
 */
export async function getPostItemIcon(categoryKey: string, itemId: number): Promise<string | null> {
  const postItems = await loadPostItemData(categoryKey);
  const postItem = postItems[String(itemId)];
  return postItem?.icon || null;
}

/**
 * Equipment의 slot/type으로 postItem 카테고리 키 결정
 */
export function getPostItemCategoryKey(slot: string, type?: string): string | null {
  // 무기 타입별 매핑
  const weaponTypeMap: Record<string, string> = {
    한손검: "weapons/oneHandedSword",
    두손검: "weapons/twoHandedSword",
    한손도끼: "weapons/oneHandedAxe",
    두손도끼: "weapons/twoHandedAxe",
    한손둔기: "weapons/oneHandedBlunt",
    두손둔기: "weapons/twoHandedBlunt",
    창: "weapons/spear",
    폴암: "weapons/polearm",
    활: "weapons/bow",
    석궁: "weapons/crossbow",
    스태프: "weapons/staff",
    완드: "weapons/wand",
    단검: "weapons/dagger",
    아대: "weapons/claw",
  };

  // 보조무기 타입별 매핑
  const secondaryTypeMap: Record<string, string> = {
    방패: "shield",
    화살: "projectiles/arrowAmmo",
    석궁화살: "projectiles/crossbowBoltAmmo",
    표창: "projectiles/thrownAmmo",
  };

  // 방어구/악세사리 슬롯별 매핑
  const slotMap: Record<string, string> = {
    투구: "hat",
    상의: "top",
    하의: "bottom",
    장갑: "glove",
    신발: "shoes",
    망토: "cape",
    귀고리: "earrings",
    목걸이: "pendant",
    얼굴장식: "faceAccessory",
    눈장식: "eyeDecoration",
    훈장: "medal",
    벨트: "belt",
  };

  if (type && weaponTypeMap[type]) return weaponTypeMap[type];
  if (type && secondaryTypeMap[type]) return secondaryTypeMap[type];
  if (type === "전신") return "overall";
  if (slotMap[slot]) return slotMap[slot];
  return null;
}
