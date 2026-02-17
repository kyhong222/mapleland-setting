/**
 * mob.wz 파싱 스크립트
 * mobList.json에 있는 몬스터 ID만 추출하여 mobWzData.json 생성
 *
 * Usage: node src/scripts/parseMobWz.mjs <path-to-mob.wz>
 */

import { init, WzFile, WzMapleVersion } from "@tybys/wz";
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const mobListPath = resolve(__dirname, "../data/mobs/mobList.json");
const outputPath = resolve(__dirname, "../data/mobs/mobWzData.json");

const wzFilePath = process.argv[2];
if (!wzFilePath) {
  console.error("Usage: node src/scripts/parseMobWz.mjs <path-to-mob.wz>");
  process.exit(1);
}

/** info 하위의 숫자 프로퍼티를 읽는 헬퍼 */
function readInt(image, path) {
  const prop = image.getFromPath(path);
  if (!prop) return undefined;
  const v = prop.wzValue;
  return typeof v === "number" ? v : undefined;
}

/** 문자열 프로퍼티를 읽는 헬퍼 */
function readStr(image, path) {
  const prop = image.getFromPath(path);
  if (!prop) return undefined;
  const v = prop.wzValue;
  return typeof v === "string" ? v : undefined;
}

async function main() {
  console.log("Initializing WASM...");
  await init();

  const mobList = JSON.parse(readFileSync(mobListPath, "utf-8"));
  const mobIds = mobList.map((m) => m.id);
  console.log(`mobList.json: ${mobIds.length}개 몬스터`);

  console.log(`Opening ${wzFilePath}...`);

  // 버전 후보: EMS(한국 메이플), BMS, GMS, CLASSIC 순서로 시도
  const versions = [
    WzMapleVersion.EMS,
    WzMapleVersion.BMS,
    WzMapleVersion.GMS,
    WzMapleVersion.CLASSIC,
  ];

  let wzFile = null;
  let parseStatus = null;

  // 모든 버전으로 시도하고 이미지 이름이 정상인지 확인
  for (const ver of versions) {
    console.log(`  Trying version ${ver}...`);
    const f = new WzFile(wzFilePath, ver);
    const status = await f.parseWzFile();
    console.log(`    status: ${status}, hasDir: ${!!f.wzDirectory}`);
    if (status === 1 && f.wzDirectory) {
      // 이미지 이름이 숫자.img 패턴인지 확인
      const firstNames = [];
      for (const img of f.wzDirectory.wzImages) {
        firstNames.push(img.name);
        if (firstNames.length >= 5) break;
      }
      console.log(`    sample names: ${firstNames.join(", ")}`);
      const hasValidNames = firstNames.some((n) => /^\d+\.img$/.test(n));
      if (hasValidNames) {
        wzFile = f;
        parseStatus = status;
        console.log(`  => Selected version ${ver} (valid names)`);
        break;
      }
      console.log(`    names look garbled, trying next...`);
    }
    f.dispose();
  }

  if (!wzFile || !wzFile.wzDirectory) {
    console.error(`Failed to parse WZ file with any version.`);
    process.exit(1);
  }

  const dir = wzFile.wzDirectory;

  // 디버그: 디렉토리 내용 출력
  console.log("\n=== Directory contents ===");
  console.log(`Images: ${dir.wzImages.size}`);
  console.log(`SubDirs: ${dir.wzDirectories.size}`);
  let imgCount = 0;
  for (const img of dir.wzImages) {
    if (imgCount < 10) console.log(`  img: ${img.name}`);
    imgCount++;
  }
  if (imgCount > 10) console.log(`  ... and ${imgCount - 10} more images`);
  for (const subDir of dir.wzDirectories) {
    console.log(`  subDir: ${subDir.name} (images: ${subDir.wzImages.size}, dirs: ${subDir.wzDirectories.size})`);
    let subCount = 0;
    for (const img of subDir.wzImages) {
      if (subCount < 5) console.log(`    img: ${img.name}`);
      subCount++;
    }
    if (subCount > 5) console.log(`    ... and ${subCount - 5} more`);
  }
  console.log("========================\n");

  const result = {};
  const skippedIds = [];
  let successCount = 0;
  let failCount = 0;

  for (const mobId of mobIds) {
    // 7자리 패딩 시도 (ex: 100100 → 0100100.img)
    const imgName = `${mobId}.img`;
    const paddedName = `${String(mobId).padStart(7, "0")}.img`;
    const image = dir.getImageByName(imgName) ?? dir.getImageByName(paddedName);
    if (!image) {
      const mobEntry = mobList.find((m) => m.id === mobId);
      skippedIds.push({ id: mobId, koreanName: mobEntry?.koreanName ?? "", name: mobEntry?.name ?? "" });
      console.warn(`  [SKIP] ${mobId} (${mobEntry?.koreanName ?? "?"}) - image not found`);
      failCount++;
      continue;
    }

    await image.parseImage();

    // 기본 info 추출
    const mobData = {
      id: mobId,
      level: readInt(image, "info/level"),
      PADamage: readInt(image, "info/PADamage"),
      MADamage: readInt(image, "info/MADamage"),
      PDDamage: readInt(image, "info/PDDamage"),
      MDDamage: readInt(image, "info/MDDamage"),
      acc: readInt(image, "info/acc"),
      eva: readInt(image, "info/eva"),
      exp: readInt(image, "info/exp"),
      maxHP: readInt(image, "info/maxHP"),
      boss: readInt(image, "info/boss"),
      elemAttr: readStr(image, "info/elemAttr"),
      skills: {},
    };

    // attack/skill 패턴 탐색
    const props = image.wzProperties;
    if (props) {
      for (const prop of props) {
        const name = prop.name;
        // attack1, attack2, skill1, skill2 등
        if (/^(attack|skill)\d+$/i.test(name)) {
          const padDmg = readInt(image, `${name}/info/PADamage`);
          const madDmg = readInt(image, `${name}/info/MADamage`);
          const type = readInt(image, `${name}/info/type`);
          const magic = readInt(image, `${name}/info/magic`);
          const elemAttr = readStr(image, `${name}/info/elemAttr`);
          const conMP = readInt(image, `${name}/info/conMP`);
          const range = readInt(image, `${name}/info/range`);

          if (padDmg !== undefined || madDmg !== undefined || type !== undefined || elemAttr !== undefined) {
            mobData.skills[name] = {};
            if (type !== undefined) mobData.skills[name].type = type;
            if (magic !== undefined) mobData.skills[name].magic = magic;
            if (elemAttr !== undefined) mobData.skills[name].elemAttr = elemAttr;
            if (padDmg !== undefined) mobData.skills[name].PADamage = padDmg;
            if (madDmg !== undefined) mobData.skills[name].MADamage = madDmg;
            if (conMP !== undefined) mobData.skills[name].conMP = conMP;
            if (range !== undefined) mobData.skills[name].range = range;
          }
        }
      }
    }

    // skills가 비어있으면 제거
    if (Object.keys(mobData.skills).length === 0) {
      delete mobData.skills;
    }

    result[mobId] = mobData;
    successCount++;

    if (successCount % 50 === 0) {
      console.log(`  [${successCount}/${mobIds.length}] 처리 중...`);
    }
  }

  writeFileSync(outputPath, JSON.stringify(result, null, 2), "utf-8");

  const skippedPath = resolve(__dirname, "../data/mobs/mobWzSkipped.json");
  writeFileSync(skippedPath, JSON.stringify(skippedIds, null, 2), "utf-8");

  console.log(`\nDone! ${successCount} success, ${failCount} skipped`);
  console.log(`Output: ${outputPath}`);
  if (skippedIds.length > 0) {
    console.log(`Skipped: ${skippedPath}`);
  }

  wzFile.dispose();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
