import fs from "fs";
import path from "path";

const MOB_API_BASE_URL = "https://maplestory.io/api/gms/62/mob";
const MOB_KMS_API_BASE_URL = "https://maplestory.io/api/kms/284/mob";
const MAP_KMS_API_BASE_URL = "https://maplestory.io/api/kms/284/map";

interface MobListItem {
  id: number;
  name: string;
  level: number;
  isBoss: boolean;
}

interface MobEntry {
  id: number;
  name: string;
  koreanName: string;
  level: number;
  isBoss: boolean;
  foundAt: string[];
}

interface MobDetailResponse {
  id: number;
  name: string;
  foundAt?: number[];
}

async function fetchMobDetail(mobId: number): Promise<MobDetailResponse | null> {
  try {
    const response = await fetch(`${MOB_API_BASE_URL}/${mobId}`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

// 맵 streetName 캐시 (같은 맵을 여러 몹이 공유하므로)
const mapNameCache = new Map<number, string | null>();

async function fetchMapStreetName(mapId: number): Promise<string | null> {
  if (mapNameCache.has(mapId)) return mapNameCache.get(mapId)!;
  try {
    const response = await fetch(`${MAP_KMS_API_BASE_URL}/${mapId}/name`);
    if (!response.ok) {
      mapNameCache.set(mapId, null);
      return null;
    }
    const data = await response.json();
    const streetName = data.streetName || null;
    mapNameCache.set(mapId, streetName);
    return streetName;
  } catch {
    mapNameCache.set(mapId, null);
    return null;
  }
}

async function resolveFoundAtStreetNames(mapIds: number[]): Promise<string[]> {
  const names = await Promise.all(mapIds.map(id => fetchMapStreetName(id)));
  const unique = [...new Set(names.filter((n): n is string => n !== null))];
  return unique;
}

async function fetchMobNameKMS(mobId: number): Promise<string | null> {
  try {
    const response = await fetch(`${MOB_KMS_API_BASE_URL}/${mobId}/name`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.name || null;
  } catch {
    return null;
  }
}

async function fetchMobList(startPosition: number, count: number): Promise<MobListItem[]> {
  try {
    const params = new URLSearchParams({
      startPosition: String(startPosition),
      count: String(count),
    });
    const response = await fetch(`${MOB_API_BASE_URL}?${params.toString()}`);
    if (!response.ok) {
      console.error(`Failed to fetch mob list at position ${startPosition}`);
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error(`Error fetching mob list:`, error);
    return [];
  }
}

async function generateMobData() {
  const dataDir = path.join(process.cwd(), "src", "data", "mobs");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  console.log("Fetching all mobs from GMS/62 API...\n");

  // 전체 몹 목록 수집 (페이징)
  const allMobs: MobListItem[] = [];
  const PAGE_SIZE = 500;
  let position = 0;

  while (true) {
    const batch = await fetchMobList(position, PAGE_SIZE);
    if (batch.length === 0) break;
    allMobs.push(...batch);
    console.log(`  Fetched ${allMobs.length} mobs so far...`);
    position += PAGE_SIZE;

    // API rate limit 방지
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\nTotal mobs from API: ${allMobs.length}`);

  // 레벨 0 이하 제외 (비정상 몹)
  const validMobs = allMobs.filter(m => m.level > 0);
  console.log(`Valid mobs (level > 0): ${validMobs.length}`);

  // 레벨순 정렬
  validMobs.sort((a, b) => a.level - b.level || a.id - b.id);

  // KMS에서 한글 이름 + GMS에서 foundAt 수집
  console.log("\nFetching Korean names & foundAt...\n");
  const results: MobEntry[] = [];
  let count = 0;

  for (const mob of validMobs) {
    const [koreanName, detail] = await Promise.all([
      fetchMobNameKMS(mob.id),
      fetchMobDetail(mob.id),
    ]);
    const mapIds = detail?.foundAt ?? [];
    const streetNames = mapIds.length > 0 ? await resolveFoundAtStreetNames(mapIds) : [];
    results.push({
      id: mob.id,
      name: mob.name,
      koreanName: koreanName || "",
      level: mob.level,
      isBoss: mob.isBoss,
      foundAt: streetNames,
    });

    count++;
    if (count % 50 === 0) {
      console.log(`  ${count}/${validMobs.length} fetched...`);
      // API rate limit 방지
      await new Promise(r => setTimeout(r, 200));
    }
  }

  // JSON 저장
  const filePath = path.join(dataDir, "mobList.json");
  fs.writeFileSync(filePath, JSON.stringify(results, null, 2));
  console.log(`\n✓ Saved mobList.json (${results.length} mobs)`);
}

generateMobData().catch(console.error);
