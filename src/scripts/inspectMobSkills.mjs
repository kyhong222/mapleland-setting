/**
 * 특정 몬스터의 attack/skill 내부 프로퍼티를 전부 출력하는 디버그 스크립트
 * Usage: node src/scripts/inspectMobSkills.mjs <path-to-mob.wz> <mobId>
 */

import { init, WzFile, WzMapleVersion } from "@tybys/wz";

const wzFilePath = process.argv[2];
const targetId = process.argv[3];
if (!wzFilePath || !targetId) {
  console.error("Usage: node src/scripts/inspectMobSkills.mjs <path-to-mob.wz> <mobId>");
  process.exit(1);
}

function dumpProps(prop, indent = "") {
  const children = prop.wzProperties;
  if (children && children.size > 0) {
    for (const child of children) {
      const val = child.wzValue;
      const hasChildren = child.wzProperties && child.wzProperties.size > 0;
      if (hasChildren) {
        console.log(`${indent}${child.name}/`);
        dumpProps(child, indent + "  ");
      } else {
        console.log(`${indent}${child.name} = ${val}`);
      }
    }
  }
}

async function main() {
  await init();

  const f = new WzFile(wzFilePath, WzMapleVersion.GMS);
  const status = await f.parseWzFile();
  if (status !== 1 || !f.wzDirectory) {
    console.error("Failed to parse WZ file");
    process.exit(1);
  }

  const imgName = `${targetId}.img`;
  const paddedName = `${String(targetId).padStart(7, "0")}.img`;
  const image = f.wzDirectory.getImageByName(imgName) ?? f.wzDirectory.getImageByName(paddedName);
  if (!image) {
    console.error(`Image not found: ${imgName} / ${paddedName}`);
    process.exit(1);
  }

  await image.parseImage();

  // info 출력
  console.log("=== info ===");
  const info = image.getFromPath("info");
  if (info) dumpProps(info);

  // attack/skill 전부 출력
  const props = image.wzProperties;
  if (props) {
    for (const prop of props) {
      if (/^(attack|skill)\d+$/i.test(prop.name)) {
        console.log(`\n=== ${prop.name} ===`);
        dumpProps(prop);
      }
    }
  }

  f.dispose();
}

main().catch((e) => { console.error(e); process.exit(1); });
