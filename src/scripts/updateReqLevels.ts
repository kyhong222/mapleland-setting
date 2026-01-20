import fs from "fs";
import path from "path";

const API_BASE_URL = "https://maplestory.io/api/gms/62/item";

const CATEGORY_LIST = [
  "hat",
  "cape",
  "top",
  "glove",
  "overall",
  "bottom",
  "shield",
  "shoes",
  "earrings",
  "faceAccessory",
  "medal",
  "eyeDecoration",
  "pendant",
];

interface ItemData {
  id: number;
  name: string;
  koreanName: string;
  reqJob: number;
  reqLevel: number;
}

interface ApiResponse {
  metaInfo?: {
    reqLevel?: number;
  };
}

// 딜레이 함수 (API 호출 제한 방지)
function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchReqLevel(itemId: number): Promise<number> {
  try {
    const response = await fetch(`${API_BASE_URL}/${itemId}`);
    if (!response.ok) {
      console.error(`  ✗ Failed to fetch item ${itemId}`);
      return 0;
    }
    const data = (await response.json()) as ApiResponse;
    return data.metaInfo?.reqLevel || 0;
  } catch (error) {
    console.error(`  ✗ Error fetching item ${itemId}:`, error);
    return 0;
  }
}

async function updateCategoryReqLevels(categoryKey: string) {
  const dataDir = path.join(process.cwd(), "src", "data", "items");
  const filePath = path.join(dataDir, `${categoryKey}.json`);

  // JSON 파일 읽기
  if (!fs.existsSync(filePath)) {
    console.log(`  ✗ File not found: ${categoryKey}.json`);
    return;
  }

  const items: ItemData[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  console.log(`  Found ${items.length} items`);

  // 각 아이템에 대해 reqLevel 업데이트
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const reqLevel = await fetchReqLevel(item.id);
    item.reqLevel = reqLevel;

    if ((i + 1) % 10 === 0) {
      console.log(`  Progress: ${i + 1}/${items.length}`);
    }

    // API 호출 제한을 피하기 위해 짧은 딜레이
    await delay(100);
  }

  // 업데이트된 데이터 저장
  fs.writeFileSync(filePath, JSON.stringify(items, null, 2));
  console.log(`  ✓ Updated ${categoryKey}.json (${items.length} items)\n`);
}

async function updateAllReqLevels() {
  console.log("Updating reqLevel for all items...\n");

  for (const category of CATEGORY_LIST) {
    console.log(`Processing ${category}...`);
    await updateCategoryReqLevels(category);
  }

  console.log("✓ All reqLevel updates complete!");
}

updateAllReqLevels().catch(console.error);
