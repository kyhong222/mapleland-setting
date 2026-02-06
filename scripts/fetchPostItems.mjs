/**
 * PreItem → PostItem 변환 스크립트
 *
 * src/data/items/ 의 PreItem JSON을 읽어서
 * API(https://maplestory.io/api/gms/62/item/:id)로 상세 정보를 가져온 뒤
 * src/data/postItems/ 에 PostItem 형식으로 저장한다.
 *
 * 이미 PostItem에 동일 ID가 있으면 스킵.
 *
 * Usage: node scripts/fetchPostItems.mjs
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const ITEMS_DIR = path.join(ROOT, "src", "data", "items");
const POST_ITEMS_DIR = path.join(ROOT, "src", "data", "postItems");

const API_BASE = "https://maplestory.io/api/gms/62/item";
const DELAY_MS = 300; // API 요청 간 딜레이

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * 디렉토리 내 모든 JSON 파일의 상대 경로 목록 반환
 */
function getJsonFiles(dir, base = "") {
  const results = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.join(base, entry.name);
    if (entry.isDirectory()) {
      results.push(...getJsonFiles(path.join(dir, entry.name), rel));
    } else if (entry.name.endsWith(".json")) {
      results.push(rel);
    }
  }
  return results;
}

/**
 * API에서 아이템 상세 정보 fetch
 */
async function fetchItem(id) {
  const url = `${API_BASE}/${id}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} for item ${id}`);
  }
  return res.json();
}

/**
 * API 응답 → PostItemData 변환
 */
function toPostItemData(preItem, apiData) {
  const meta = apiData?.metaInfo || {};
  return {
    koreanName: preItem.koreanName || preItem.name,
    icon: `https://maplestory.io/api/GMS/200/item/${preItem.id}/icon`,
    stats: {
      attack: meta.incPAD || 0,
      str: meta.incSTR || 0,
      dex: meta.incDEX || 0,
      int: meta.incINT || 0,
      luk: meta.incLUK || 0,
      mad: meta.incMAD || 0,
      pdef: meta.incPDD || 0,
      mdef: meta.incMDD || 0,
      acc: meta.incACC || 0,
      eva: meta.incEVA || 0,
      ...(meta.attackSpeed != null ? { attackSpeed: meta.attackSpeed } : {}),
    },
    requireStats: {
      level: meta.reqLevel || preItem.reqLevel || 0,
      str: meta.reqSTR || 0,
      dex: meta.reqDEX || 0,
      int: meta.reqINT || 0,
      luk: meta.reqLUK || 0,
    },
  };
}

async function main() {
  const jsonFiles = getJsonFiles(ITEMS_DIR);
  console.log(`Found ${jsonFiles.length} PreItem files\n`);

  let totalSkipped = 0;
  let totalFetched = 0;
  let totalFailed = 0;

  for (const relPath of jsonFiles) {
    const preItemPath = path.join(ITEMS_DIR, relPath);
    const postItemPath = path.join(POST_ITEMS_DIR, relPath);

    // PreItem 읽기
    const preItems = JSON.parse(fs.readFileSync(preItemPath, "utf-8"));

    // PostItem 읽기 (없으면 빈 객체)
    let postItems = {};
    if (fs.existsSync(postItemPath)) {
      postItems = JSON.parse(fs.readFileSync(postItemPath, "utf-8"));
    }

    // 새로 fetch할 아이템 필터링
    const toFetch = preItems.filter((item) => !postItems[String(item.id)]);
    const skipped = preItems.length - toFetch.length;
    totalSkipped += skipped;

    if (toFetch.length === 0) {
      console.log(`[${relPath}] ${preItems.length} items — all exist, skipping`);
      continue;
    }

    console.log(`[${relPath}] ${preItems.length} items — ${skipped} exist, ${toFetch.length} to fetch`);

    let fetched = 0;
    let failed = 0;

    for (const preItem of toFetch) {
      try {
        const apiData = await fetchItem(preItem.id);
        postItems[String(preItem.id)] = toPostItemData(preItem, apiData);
        fetched++;
        process.stdout.write(`  fetched ${preItem.id} (${preItem.koreanName || preItem.name})\n`);
      } catch (err) {
        failed++;
        process.stdout.write(`  FAILED ${preItem.id}: ${err.message}\n`);
      }
      await sleep(DELAY_MS);
    }

    totalFetched += fetched;
    totalFailed += failed;

    // PostItem 저장
    const postDir = path.dirname(postItemPath);
    if (!fs.existsSync(postDir)) {
      fs.mkdirSync(postDir, { recursive: true });
    }
    fs.writeFileSync(postItemPath, JSON.stringify(postItems, null, 2) + "\n", "utf-8");
    console.log(`  → saved ${Object.keys(postItems).length} items to ${relPath}\n`);
  }

  console.log("\n=== Done ===");
  console.log(`Skipped (already exist): ${totalSkipped}`);
  console.log(`Fetched: ${totalFetched}`);
  console.log(`Failed: ${totalFailed}`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
