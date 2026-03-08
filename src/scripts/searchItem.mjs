/**
 * maplestory.io API로 아이템 검색 스크립트
 * GMS/62 → GMS/200 순서로 폴백
 *
 * Usage:
 *   node src/scripts/searchItem.mjs <검색어>
 *   node src/scripts/searchItem.mjs <아이템ID>
 *   node src/scripts/searchItem.mjs <검색어> --detail
 *   node src/scripts/searchItem.mjs <아이템ID> --detail
 */

const API_BASE = "https://maplestory.io/api";
const VERSIONS = [
  { region: "gms", ver: 62 },
  { region: "gms", ver: 200 },
];

const query = process.argv[2];
const showDetail = process.argv.includes("--detail");

if (!query) {
  console.error("Usage: node src/scripts/searchItem.mjs <검색어 또는 아이템ID> [--detail]");
  process.exit(1);
}

const isIdSearch = /^\d+$/.test(query);
const isKorean = /[가-힣]/.test(query);

function printItemLine(item) {
  const jobs = item.requiredJobs?.join(", ") || "ALL";
  const category = item.typeInfo
    ? `${item.typeInfo.category}${item.typeInfo.subCategory ? " > " + item.typeInfo.subCategory : ""}`
    : "";
  console.log(`  [${item.id}] ${item.name} (Lv.${item.requiredLevel ?? "?"}) - ${jobs} - ${category}`);
}

/** 한글 검색: KMS/284에서 검색 → ID 추출 → GMS 62/200에서 상세 조회 */
async function searchKorean(keyword) {
  let kmsItems = [];
  try {
    const url = `${API_BASE}/kms/284/item?searchFor=${encodeURIComponent(keyword)}`;
    const res = await fetch(url);
    if (res.ok) kmsItems = await res.json();
  } catch { /* ignore */ }

  if (kmsItems.length === 0) {
    console.log(`"${keyword}" 검색 결과 없음 (KMS/284)`);
    return { ids: [] };
  }

  console.log(`\n[KMS/284] "${keyword}" 검색 결과: ${kmsItems.length}건\n`);
  for (const item of kmsItems) {
    printItemLine(item);
  }

  const ids = kmsItems.map(i => i.id);
  console.log("\n--- GMS 상세 정보 ---");
  for (const id of ids.slice(0, 10)) {
    await searchById(id);
  }
  return { ids };
}

/** 영문 검색: GMS 62 → 200 폴백 */
async function searchByName(keyword) {
  for (const { region, ver } of VERSIONS) {
    try {
      const url = `${API_BASE}/${region}/${ver}/item?searchFor=${encodeURIComponent(keyword)}`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const items = await res.json();
      if (items.length > 0) {
        console.log(`\n[${region.toUpperCase()}/${ver}] "${keyword}" 검색 결과: ${items.length}건\n`);
        for (const item of items) {
          printItemLine(item);
        }
        return { items, version: ver };
      }
    } catch {
      continue;
    }
  }
  console.log(`"${keyword}" 검색 결과 없음`);
  return { items: [], version: null };
}

async function searchById(itemId) {
  let found = false;
  for (const { region, ver } of VERSIONS) {
    try {
      const url = `${API_BASE}/${region}/${ver}/item/${itemId}`;
      const res = await fetch(url);
      if (!res.ok) continue;
      const data = await res.json();
      if (data) {
        console.log(`\n[${region.toUpperCase()}/${ver}] 아이템 ID: ${itemId}\n`);
        printDetail(data);
        found = true;
      }
    } catch {
      continue;
    }
  }
  if (!found) console.log(`아이템 ID ${itemId}을 찾을 수 없음`);
}

const JOB_NAMES = { 0: "ALL", 1: "전사", 2: "마법사", 4: "궁수", 8: "도적", "-1": "초보자" };

function printDetail(data) {
  const meta = data.metaInfo || {};
  const desc = data.description || {};
  const type = data.typeInfo || {};

  console.log(`  이름: ${desc.name || "?"}`);
  console.log(`  ID: ${data.id}`);
  if (type.category) {
    const cat = [type.category, type.subCategory].filter(Boolean).join(" > ");
    console.log(`  분류: ${cat}`);
  }
  if (desc.description) console.log(`  설명: ${desc.description}`);
  if (meta.cash) console.log(`  캐시: Yes`);
  console.log(`  필요레벨: ${meta.reqLevel ?? "?"}`);
  const reqStats = [
    meta.reqSTR && `STR ${meta.reqSTR}`,
    meta.reqDEX && `DEX ${meta.reqDEX}`,
    meta.reqINT && `INT ${meta.reqINT}`,
    meta.reqLUK && `LUK ${meta.reqLUK}`,
  ].filter(Boolean);
  if (reqStats.length > 0) console.log(`  필요스탯: ${reqStats.join(", ")}`);
  if (meta.reqJob !== undefined) console.log(`  필요직업: ${JOB_NAMES[meta.reqJob] ?? meta.reqJob}`);

  // 장비 스탯
  const statKeys = [
    ["incSTR", "STR"], ["incDEX", "DEX"], ["incINT", "INT"], ["incLUK", "LUK"],
    ["incPAD", "공격력"], ["incMAD", "마력"], ["incPDD", "물방"], ["incMDD", "마방"],
    ["incACC", "명중"], ["incEVA", "회피"], ["incSpeed", "이속"], ["incJump", "점프"],
    ["incMHP", "HP"], ["incMMP", "MP"],
    ["tuc", "업그레이드"],
  ];
  const statLines = [];
  for (const [key, label] of statKeys) {
    if (meta[key]) statLines.push(`${label} +${meta[key]}`);
  }
  if (statLines.length > 0) {
    console.log(`  스탯: ${statLines.join(", ")}`);
  } else {
    console.log(`  스탯: (없음)`);
  }
}

async function main() {
  if (isIdSearch) {
    await searchById(query);
  } else if (isKorean) {
    await searchKorean(query);
  } else {
    const { items, version } = await searchByName(query);
    if (showDetail && items.length > 0 && version) {
      console.log("\n--- 상세 정보 ---");
      for (const item of items.slice(0, 10)) {
        try {
          const res = await fetch(`${API_BASE}/gms/${version}/item/${item.id}`);
          if (!res.ok) continue;
          const data = await res.json();
          console.log("");
          printDetail(data);
        } catch {
          continue;
        }
      }
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
