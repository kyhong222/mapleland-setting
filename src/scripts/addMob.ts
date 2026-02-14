import fs from "fs";
import path from "path";

/**
 * mobList.json에 몬스터를 ID로 추가하는 스크립트
 *
 * 사용법:
 *   npx tsx src/scripts/addMob.ts 8140000 8140100 8140200
 *
 * - 여러 ID를 한 번에 입력 가능
 * - 이미 존재하는 ID는 건너뜀
 * - 추가 후 레벨순 정렬하여 저장
 */

const MOB_API_BASE_URL = "https://maplestory.io/api/gms/62/mob";
const MOB_KMS_API_BASE_URL = "https://maplestory.io/api/kms/284/mob";
const MAP_KMS_API_BASE_URL = "https://maplestory.io/api/kms/284/map";

interface MobEntry {
  id: number;
  name: string;
  koreanName: string;
  level: number;
  isBoss: boolean;
  foundAt: string[];
}

async function fetchMobDetail(mobId: number) {
  try {
    const response = await fetch(`${MOB_API_BASE_URL}/${mobId}`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
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

async function fetchMapStreetName(mapId: number): Promise<string | null> {
  try {
    const response = await fetch(`${MAP_KMS_API_BASE_URL}/${mapId}/name`);
    if (!response.ok) return null;
    const data = await response.json();
    return data.streetName || null;
  } catch {
    return null;
  }
}

async function main() {
  const ids = process.argv.slice(2).map(Number).filter(n => !isNaN(n) && n > 0);
  if (ids.length === 0) {
    console.error("사용법: npx tsx src/scripts/addMob.ts <mobId1> [mobId2] ...");
    process.exit(1);
  }

  const filePath = path.join(process.cwd(), "src", "data", "mobs", "mobList.json");
  const mobList: MobEntry[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const existingIds = new Set(mobList.map(m => m.id));

  const newIds = ids.filter(id => {
    if (existingIds.has(id)) {
      console.log(`⏭ ${id} — 이미 존재`);
      return false;
    }
    return true;
  });

  if (newIds.length === 0) {
    console.log("\n추가할 몬스터가 없습니다.");
    return;
  }

  console.log(`\n${newIds.length}개 몬스터 정보 조회 중...\n`);

  for (const mobId of newIds) {
    const [detail, koreanName] = await Promise.all([
      fetchMobDetail(mobId),
      fetchMobNameKMS(mobId),
    ]);

    if (!detail) {
      console.error(`✗ ${mobId} — API에서 찾을 수 없음`);
      continue;
    }

    const mapIds: number[] = detail.foundAt ?? [];
    const streetNames = (await Promise.all(mapIds.map(fetchMapStreetName)))
      .filter((n): n is string => n !== null);
    const uniqueStreetNames = [...new Set(streetNames)];

    const entry: MobEntry = {
      id: mobId,
      name: detail.name || "",
      koreanName: koreanName || "",
      level: detail.meta?.level ?? 0,
      isBoss: detail.meta?.isBoss ?? false,
      foundAt: uniqueStreetNames,
    };

    mobList.push(entry);
    console.log(`✓ ${mobId} — Lv.${entry.level} ${entry.koreanName || entry.name} (${uniqueStreetNames.join(", ") || "출현지 없음"})`);
  }

  // 레벨순 정렬
  mobList.sort((a, b) => a.level - b.level || a.id - b.id);

  fs.writeFileSync(filePath, JSON.stringify(mobList, null, 2));
  console.log(`\n✓ mobList.json 저장 완료 (총 ${mobList.length}개)`);
}

main().catch(console.error);
