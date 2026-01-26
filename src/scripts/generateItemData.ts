import fs from "fs";
import path from "path";

const API_BASE_URL = "https://maplestory.io/api/gms/62/item";
const KMS_API_BASE_URL = "https://maplestory.io/api/kms/284/item";

const CATEGORY_LIST: Array<{
  key: string;
  overallCategory: string;
  category: string;
  subCategory: string;
  maxLevel?: number;
  outputDir?: string;
}> = [
  { key: "hat", overallCategory: "Equip", category: "Armor", subCategory: "Hat" },
  { key: "cape", overallCategory: "Equip", category: "Armor", subCategory: "Cape" },
  { key: "top", overallCategory: "Equip", category: "Armor", subCategory: "Top" },
  { key: "glove", overallCategory: "Equip", category: "Armor", subCategory: "Glove" },
  { key: "overall", overallCategory: "Equip", category: "Armor", subCategory: "Overall" },
  { key: "bottom", overallCategory: "Equip", category: "Armor", subCategory: "Bottom" },
  { key: "shield", overallCategory: "Equip", category: "Armor", subCategory: "Shield" },
  { key: "shoes", overallCategory: "Equip", category: "Armor", subCategory: "Shoes" },
  { key: "earrings", overallCategory: "Equip", category: "Accessory", subCategory: "Earrings" },
  { key: "faceAccessory", overallCategory: "Equip", category: "Accessory", subCategory: "Face Accessory" },
  { key: "medal", overallCategory: "Equip", category: "Accessory", subCategory: "Medal" },
  { key: "badge", overallCategory: "Equip", category: "Accessory", subCategory: "Badge" },
  { key: "belt", overallCategory: "Equip", category: "Accessory", subCategory: "Belt" },
  { key: "emblem", overallCategory: "Equip", category: "Accessory", subCategory: "Emblem" },
  { key: "eyeDecoration", overallCategory: "Equip", category: "Accessory", subCategory: "Eye Decoration" },
  { key: "pendant", overallCategory: "Equip", category: "Accessory", subCategory: "Pendant", maxLevel: 120 },

  // 무기 - 한손 무기
  {
    key: "oneHandedSword",
    overallCategory: "Equip",
    category: "One-Handed Weapon",
    subCategory: "One-Handed Sword",
    maxLevel: 120,
    outputDir: "weapons",
  },
  {
    key: "oneHandedAxe",
    overallCategory: "Equip",
    category: "One-Handed Weapon",
    subCategory: "One-Handed Axe",
    maxLevel: 120,
    outputDir: "weapons",
  },
  {
    key: "oneHandedBlunt",
    overallCategory: "Equip",
    category: "One-Handed Weapon",
    subCategory: "One-Handed Blunt Weapon",
    maxLevel: 120,
    outputDir: "weapons",
  },
  {
    key: "dagger",
    overallCategory: "Equip",
    category: "One-Handed Weapon",
    subCategory: "Dagger",
    maxLevel: 120,
    outputDir: "weapons",
  },
  {
    key: "staff",
    overallCategory: "Equip",
    category: "One-Handed Weapon",
    subCategory: "Staff",
    maxLevel: 120,
    outputDir: "weapons",
  },
  {
    key: "wand",
    overallCategory: "Equip",
    category: "One-Handed Weapon",
    subCategory: "Wand",
    maxLevel: 120,
    outputDir: "weapons",
  },

  // 무기 - 양손 무기
  {
    key: "twoHandedSword",
    overallCategory: "Equip",
    category: "Two-Handed Weapon",
    subCategory: "Two-Handed Sword",
    maxLevel: 120,
    outputDir: "weapons",
  },
  {
    key: "twoHandedAxe",
    overallCategory: "Equip",
    category: "Two-Handed Weapon",
    subCategory: "Two-Handed Axe",
    maxLevel: 120,
    outputDir: "weapons",
  },
  {
    key: "twoHandedBlunt",
    overallCategory: "Equip",
    category: "Two-Handed Weapon",
    subCategory: "Two-Handed Blunt",
    maxLevel: 120,
    outputDir: "weapons",
  },
  {
    key: "spear",
    overallCategory: "Equip",
    category: "Two-Handed Weapon",
    subCategory: "Spear",
    maxLevel: 120,
    outputDir: "weapons",
  },
  {
    key: "polearm",
    overallCategory: "Equip",
    category: "Two-Handed Weapon",
    subCategory: "Pole arm",
    maxLevel: 120,
    outputDir: "weapons",
  },
  {
    key: "bow",
    overallCategory: "Equip",
    category: "Two-Handed Weapon",
    subCategory: "Bow",
    maxLevel: 120,
    outputDir: "weapons",
  },
  {
    key: "crossbow",
    overallCategory: "Equip",
    category: "Two-Handed Weapon",
    subCategory: "Crossbow",
    maxLevel: 120,
    outputDir: "weapons",
  },
  {
    key: "claw",
    overallCategory: "Equip",
    category: "Two-Handed Weapon",
    subCategory: "Claw",
    maxLevel: 120,
    outputDir: "weapons",
  },

  // 소비 아이템 - 투사체
  {
    key: "thrownAmmo",
    overallCategory: "Use",
    category: "Projectile",
    subCategory: "Thrown",
    maxLevel: 120,
    outputDir: "projectiles",
  },
  {
    key: "arrowAmmo",
    overallCategory: "Use",
    category: "Projectile",
    subCategory: "Arrow",
    maxLevel: 120,
    outputDir: "projectiles",
  },
  {
    key: "crossbowBoltAmmo",
    overallCategory: "Use",
    category: "Projectile",
    subCategory: "Crossbow bolt",
    maxLevel: 120,
    outputDir: "projectiles",
  },
];

const JOB_IDS = [0, 1, 2, 4, 8]; // 0: 공용, 1: 전사, 2: 마법사, 4: 궁수, 8: 도적

interface ItemData {
  id: number;
  name: string;
  koreanName: string;
  reqJob: number;
  reqLevel: number;
}
async function fetchItemNameKMS(itemId: number): Promise<string | null> {
  try {
    const response = await fetch(`${KMS_API_BASE_URL}/${itemId}/name`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data.name || null;
  } catch (error) {
    console.error(`Error fetching KMS name for ${itemId}:`, error);
    return null;
  }
}

async function fetchProjectilesFromAPI(
  overallCategory: string,
  category: string,
  subCategory: string,
): Promise<ItemData[]> {
  try {
    const params = new URLSearchParams({
      startPosition: "0",
      count: "10000",
      overallCategoryFilter: overallCategory,
      categoryFilter: category,
      subCategoryFilter: subCategory,
    });
    const url = `${API_BASE_URL}?${params.toString()}`;
    console.log(`Fetching: ${url}`); // 디버깅용
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Failed to fetch ${subCategory}`);
      return [];
    }

    const data = (await response.json()) as Array<{
      id: number;
      name: string;
      requiredLevel?: number;
      metaInfo?: {
        reqJob?: number;
      };
    }>;

    // KMS에서 한글 이름 조회
    const itemsWithKoreanNames = await Promise.all(
      data.map(async (item) => {
        const koreanName = await fetchItemNameKMS(item.id);
        return {
          id: item.id,
          name: item.name,
          koreanName: koreanName || "",
          reqJob: 0, // 투사체는 공용
          reqLevel: item.requiredLevel || 0,
        };
      }),
    );

    return itemsWithKoreanNames;
  } catch (error) {
    console.error(`Error fetching ${subCategory}:`, error);
    return [];
  }
}

async function fetchItemsFromAPI(
  overallCategory: string,
  category: string,
  subCategory: string,
  jobId: number,
  maxLevel: number = 100,
): Promise<ItemData[]> {
  try {
    const params = new URLSearchParams({
      startPosition: "0",
      count: "10000",
      overallCategoryFilter: overallCategory,
      categoryFilter: category,
      subCategoryFilter: subCategory,
      jobFilter: String(jobId),
      cashFilter: "false",
      minLevelFilter: "0",
      maxLevelFilter: String(maxLevel),
    });
    const url = `${API_BASE_URL}?${params.toString()}`;
    console.log(`Fetching: ${url}`); // 디버깅용
    const response = await fetch(url);

    if (!response.ok) {
      console.error(`Failed to fetch ${subCategory} with jobId ${jobId}`);
      return [];
    }

    const data = (await response.json()) as Array<{
      id: number;
      name: string;
      requiredLevel?: number;
      metaInfo?: {
        reqJob?: number;
        reqSTR?: number;
        reqDEX?: number;
        reqINT?: number;
        reqLUK?: number;
      };
    }>;

    // KMS에서 한글 이름 조회
    const itemsWithKoreanNames = await Promise.all(
      data.map(async (item) => {
        const koreanName = await fetchItemNameKMS(item.id);
        return {
          id: item.id,
          name: item.name, // GMS 영문 이름
          koreanName: koreanName || "", // KMS 한글 이름 (없으면 빈 문자열)
          reqJob: item.metaInfo?.reqJob || jobId, // 0 = 공용, 1 = 전사, 2 = 마법사, 4 = 궁수, 8 = 도적
          reqLevel: item.requiredLevel || 0,
        };
      }),
    );

    return itemsWithKoreanNames;
  } catch (error) {
    console.error(`Error fetching ${subCategory} with jobId ${jobId}:`, error);
    return [];
  }
}

async function generateItemData() {
  const dataDir = path.join(process.cwd(), "src", "data", "items");
  const weaponsDir = path.join(dataDir, "weapons");

  // 디렉토리 생성
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(weaponsDir)) {
    fs.mkdirSync(weaponsDir, { recursive: true });
  }

  console.log("Generating item data from MapleStory API...\n");

  for (const category of CATEGORY_LIST) {
    console.log(`Processing ${category.key}...`);
    const allItems: ItemData[] = [];
    const itemMap = new Map<number, ItemData>();
    const maxLevel = category.maxLevel ?? 100;

    // 투사체(Projectile) 카테고리인 경우 별도 처리
    if (category.category === "Projectile") {
      const items = await fetchProjectilesFromAPI(category.overallCategory, category.category, category.subCategory);
      allItems.push(...items);
    } else {
      // 공용과 직업별 데이터 모두 조회
      for (const jobId of JOB_IDS) {
        const items = await fetchItemsFromAPI(
          category.overallCategory,
          category.category,
          category.subCategory,
          jobId,
          maxLevel,
        );
        items.forEach((item) => {
          const existing = itemMap.get(item.id);
          // 기존 아이템이 없거나, 기존이 reqJob=0인데 새로운 것이 reqJob!=0이면 덮어쓰기
          if (!existing || (existing.reqJob === 0 && item.reqJob !== 0)) {
            itemMap.set(item.id, item);
          }
        });
      }

      allItems.push(...itemMap.values());
    }
    allItems.sort((a, b) => a.id - b.id);

    // JSON 파일로 저장
    const fileName = `${category.key}.json`;
    const targetDir = category.outputDir ? path.join(dataDir, category.outputDir) : dataDir;
    const filePath = path.join(targetDir, fileName);
    fs.writeFileSync(filePath, JSON.stringify(allItems, null, 2));

    console.log(`  ✓ Saved ${fileName} (${allItems.length} items)\n`);
  }

  console.log("✓ Item data generation complete!");
}

generateItemData().catch(console.error);
