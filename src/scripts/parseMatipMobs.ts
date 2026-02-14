import fs from "fs";
import path from "path";

/**
 * matip.kr의 몬스터 select HTML을 파싱하여 mobList.json 생성
 *
 * 사용법:
 * 1. matip.kr/nc/ 페이지에서 몬스터 select의 innerHTML을 tools/matip_mobs.html로 저장
 * 2. npx tsx src/scripts/parseMatipMobs.ts
 */

const MOB_API_BASE_URL = "https://maplestory.io/api/gms/62/mob";

interface ParsedMob {
  id: number;
  level: number;
  koreanName: string;
  region: string;
}

interface MobEntry {
  id: number;
  name: string;
  koreanName: string;
  level: number;
  isBoss: boolean;
  foundAt: string[];
}

function parseMatipHTML(html: string): ParsedMob[] {
  const results: ParsedMob[] = [];
  let currentRegion = "";

  // 각 option 태그를 통째로 매칭
  const optionRegex = /<option\s([^>]*)>(.*?)<\/option>/g;
  let match;

  while ((match = optionRegex.exec(html)) !== null) {
    const attrs = match[1];
    const text = match[2].replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

    // disabled 옵션 = 지역 헤더
    if (attrs.includes("disabled")) {
      const regionMatch = text.match(/<b>(.*?)<\/b>/);
      if (regionMatch) {
        currentRegion = regionMatch[1];
      }
      continue;
    }

    // data-image 속성에서 mob ID 추출
    const imageMatch = attrs.match(/data-image="([^"]*)"/);
    if (!imageMatch) continue;
    const mobIdMatch = imageMatch[1].match(/\/mob\/(\d+)\//);
    if (!mobIdMatch) continue;
    const mobId = parseInt(mobIdMatch[1]);

    // 레벨과 이름 추출: "Lv. 1 달팽이"
    const textMatch = text.match(/Lv\.\s*(\d+)\s+(.*)/);
    if (!textMatch) continue;
    const level = parseInt(textMatch[1]);
    const koreanName = textMatch[2].trim();

    results.push({
      id: mobId,
      level,
      koreanName,
      region: currentRegion,
    });
  }

  return results;
}

async function fetchMobName(mobId: number): Promise<string> {
  try {
    const response = await fetch(`${MOB_API_BASE_URL}/${mobId}/name`);
    if (!response.ok) return "";
    const data = await response.json();
    return data.name || "";
  } catch {
    return "";
  }
}

async function fetchMobIsBoss(mobId: number): Promise<boolean> {
  try {
    const response = await fetch(`${MOB_API_BASE_URL}/${mobId}`);
    if (!response.ok) return false;
    const data = await response.json();
    return data.meta?.isBoss ?? false;
  } catch {
    return false;
  }
}

async function main() {
  const htmlPath = path.join(process.cwd(), "tools", "matip_mobs.html");
  if (!fs.existsSync(htmlPath)) {
    console.error("tools/matip_mobs.html 파일이 없습니다.");
    console.error("matip.kr/nc/의 몬스터 select innerHTML을 저장해주세요.");
    process.exit(1);
  }

  const html = fs.readFileSync(htmlPath, "utf-8");
  const parsed = parseMatipHTML(html);
  console.log(`Parsed ${parsed.length} monsters from HTML\n`);

  // 같은 mobId가 여러 지역에 있을 수 있으므로 그룹화
  const mobMap = new Map<number, { koreanName: string; level: number; regions: Set<string> }>();
  for (const mob of parsed) {
    const existing = mobMap.get(mob.id);
    if (existing) {
      existing.regions.add(mob.region);
    } else {
      mobMap.set(mob.id, {
        koreanName: mob.koreanName,
        level: mob.level,
        regions: new Set([mob.region]),
      });
    }
  }

  console.log(`Unique mobs: ${mobMap.size}`);
  console.log("Fetching English names & boss info from GMS API...\n");

  const results: MobEntry[] = [];
  let count = 0;

  for (const [mobId, info] of mobMap) {
    const [name, isBoss] = await Promise.all([
      fetchMobName(mobId),
      fetchMobIsBoss(mobId),
    ]);

    results.push({
      id: mobId,
      name,
      koreanName: info.koreanName,
      level: info.level,
      isBoss,
      foundAt: [...info.regions],
    });

    count++;
    if (count % 20 === 0) {
      console.log(`  ${count}/${mobMap.size} fetched...`);
      await new Promise(r => setTimeout(r, 200));
    }
  }

  // 레벨순 정렬
  results.sort((a, b) => a.level - b.level || a.id - b.id);

  const dataDir = path.join(process.cwd(), "src", "data", "mobs");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const filePath = path.join(dataDir, "mobList.json");
  fs.writeFileSync(filePath, JSON.stringify(results, null, 2));
  console.log(`\n✓ Saved mobList.json (${results.length} mobs)`);
}

main().catch(console.error);
