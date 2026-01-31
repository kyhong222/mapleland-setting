import { Box, Typography } from "@mui/material";
import { useMemo } from "react";
import { useCharacter } from "../contexts/CharacterContext";
import mastery1Data from "../data/buff/mastery/mastery1.json";
import mastery2Data from "../data/buff/mastery/mastery2.json";
import type { MasteryProperty, MasterySkill } from "../types/mastery";

const WEAPON_CONSTANTS: Record<string, { min: number; max: number }> = {
  한손검: { min: 4.0, max: 4.0 },
  한손도끼: { min: 3.2, max: 4.4 },
  한손둔기: { min: 3.2, max: 4.4 },
  두손검: { min: 4.6, max: 4.6 },
  두손도끼: { min: 3.4, max: 4.8 },
  두손둔기: { min: 3.4, max: 4.8 },
  창: { min: 3.0, max: 5.0 },
  폴암: { min: 3.0, max: 5.0 },
  활: { min: 3.4, max: 3.4 },
  석궁: { min: 3.6, max: 3.6 },
  단검: { min: 3.6, max: 3.6 },
  아대: { min: 3.6, max: 3.6 },
};

type DamageResult = { min: number; max: number };

const getMastery2SkillByWeaponType = (weaponType: string | null): MasterySkill | null => {
  const mastery2Skills = mastery2Data as MasterySkill[];
  if (weaponType === "활") {
    return mastery2Skills.find((m) => m.koreanName === "보우 엑스퍼트") || null;
  }
  if (weaponType === "석궁") {
    return mastery2Skills.find((m) => m.koreanName === "크로스보우 엑스퍼트") || null;
  }
  if (weaponType === "창" || weaponType === "폴암") {
    return mastery2Skills.find((m) => m.koreanName === "비홀더") || null;
  }
  return null;
};

const getMasteryPercent = (weaponType: string | null, mastery1Level: number, mastery2Level: number): number => {
  const mastery1Prop: MasteryProperty | undefined = mastery1Data.properties?.[mastery1Level];
  const mastery1Value = (mastery1Prop?.mastery ?? 0) + 10;

  const skill = getMastery2SkillByWeaponType(weaponType);
  const prop: MasteryProperty | undefined = skill?.properties[mastery2Level];
  const mastery2Value = prop?.mastery ?? 0;
  
  return mastery1Value + mastery2Value;
};

export default function DamageTable() {
  const { character, buff1Attack, buff2Attack, mastery1, mastery2, masteryAttack } = useCharacter();
  const weaponType = character.getWeaponType();
  const weapon = character.getEquippedItem("무기");
  const masteryPercent = getMasteryPercent(weaponType, mastery1, mastery2);

  const finalStats = character.getFinalStats(buff1Attack, buff2Attack, masteryAttack);
  const weaponConstants = weaponType ? WEAPON_CONSTANTS[weaponType] : null;

  // 도적의 경우 STR과 DEX 모두 부스탯으로 처리
  const adjSubStat = useMemo(() => {
    const job = character.getJob();
    if (job?.koreanName?.includes("도적")) {
      const stats = character.getStats();
      const equipStats = character.getEquipmentStats();
      const str = stats.pureStr + equipStats.str;
      return finalStats.subStat + str;
    }
    return finalStats.subStat;
  }, [character, finalStats]);

  // 모든 데미지 계산식
  const damages = useMemo(() => {
    const results: Record<string, DamageResult | number> = {};
    const job = character.getJob();
    const isMagician = job?.koreanName === "마법사";

    // 마법사의 경우 다른 계산식 사용
    if (isMagician) {
      const MAD = finalStats.totalMAD;
      const INT = finalStats.totalInt;
      const masteryRate = masteryPercent / 100;

      // 마법사: 실질 마법 데미지
      const magicMax = Math.floor((Math.pow(MAD, 2) / 1000 + MAD) / 30 + INT / 200);
      const magicMin = Math.floor((Math.pow(MAD, 2) / 1000 + MAD * 0.9 * masteryRate) / 30 + INT / 200);

      results.magicDamage = {
        min: magicMin,
        max: magicMax,
      };
      results.totalMAD = MAD; // 총 마력 (숫자로 저장)
      return results;
    }

    // 비마법사: 기존 계산식
    if (!weaponConstants || finalStats.totalAttack === 0) {
      return results;
    }

    const masteryRate = masteryPercent / 100;

    // 1. 스탯창 공격력
    results.stat = {
      min: Math.floor(
        ((finalStats.mainStat * weaponConstants.min * 0.9 * masteryRate + adjSubStat) * finalStats.totalAttack) / 100,
      ),
      max: Math.floor(((finalStats.mainStat * weaponConstants.max + adjSubStat) * finalStats.totalAttack) / 100),
    };

    // 2. 최대 공격력
    results.max = {
      min: Math.floor(
        ((finalStats.mainStat * weaponConstants.max * 0.9 * masteryRate + adjSubStat) * finalStats.totalAttack) / 100,
      ),
      max: Math.floor(((finalStats.mainStat * weaponConstants.max + adjSubStat) * finalStats.totalAttack) / 100),
    };

    // 3. 최소 공격력
    results.min = {
      min: Math.floor(
        ((finalStats.mainStat * weaponConstants.min * 0.9 * masteryRate + adjSubStat) * finalStats.totalAttack) / 100,
      ),
      max: Math.floor(((finalStats.mainStat * weaponConstants.min + adjSubStat) * finalStats.totalAttack) / 100),
    };

    // 4. 트스/럭세 실질 공격력
    const stats = character.getStats();
    const equipStats = character.getEquipmentStats();
    const luk = finalStats.mainStat;

    results.treasure = {
      min: Math.floor((luk * 2.5 * finalStats.totalAttack) / 100),
      max: Math.floor((luk * 5 * finalStats.totalAttack) / 100),
    };

    // 5. 베놈 실질 공격력
    const str = stats.pureStr + equipStats.str;
    const dex = stats.pureDex + equipStats.dex;
    const venom = (8.0 * (str + luk) + dex * 2) / 100;
    const venomMax = (18.5 * (str + luk) + dex * 2) / 100;

    results.venom = {
      min: Math.floor((venom * finalStats.totalAttack * 60) / 100),
      max: Math.floor((venomMax * finalStats.totalAttack * 60) / 100),
    };

    // 6. 로어 실질 공격력 (무기상수 4.0 고정)
    results.lore = {
      min: Math.floor(((finalStats.mainStat * 4.0 * 0.9 * masteryRate + adjSubStat) * finalStats.totalAttack) / 100),
      max: Math.floor(((finalStats.mainStat * 4.0 + adjSubStat) * finalStats.totalAttack) / 100),
    };

    return results;
  }, [weaponConstants, finalStats, adjSubStat, masteryPercent, character]);

  const renderDamage = (damage: DamageResult) => (
    <Typography variant="body2" sx={{ fontSize: "1.1rem", textAlign: "center" }}>
      {damage.min.toLocaleString()} ~ {damage.max.toLocaleString()}
    </Typography>
  );

  // 조건 체크
  const job = character.getJob();
  const hasDifferentWeaponConstants = weaponConstants && weaponConstants.min !== weaponConstants.max;
  const isClawWeapon = weaponType === "아대";
  const isThief = job?.koreanName === "도적";
  const isSpear = weaponType === "창" || weaponType === "폴암";

  // 무기별 최대/최소 공격력 라벨
  const getMaxDamageLabel = (): string => {
    if (
      weaponType === "한손도끼" ||
      weaponType === "두손도끼" ||
      weaponType === "한손둔기" ||
      weaponType === "두손둔기"
    ) {
      return "베기 공격력";
    }
    if (weaponType === "창") {
      return "찌르기 공격력(스피어 버스터)";
    }
    if (weaponType === "폴암") {
      return "베기 공격력(드래곤 쓰레셔: 폴암)";
    }
    return "최대 공격력";
  };

  const getMinDamageLabel = (): string => {
    if (
      weaponType === "한손도끼" ||
      weaponType === "두손도끼" ||
      weaponType === "한손둔기" ||
      weaponType === "두손둔기"
    ) {
      return "찌르기 공격력";
    }
    if (weaponType === "창") {
      return "베기 공격력(드래곤 쓰레셔: 창)";
    }
    if (weaponType === "폴암") {
      return "찌르기 공격력(폴암 버스터)";
    }
    return "최소 공격력";
  };

  return (
    <Box
      sx={{
        width: 400,
        bgcolor: "#f5f5f5",
        border: "1px solid #ccc",
        borderRadius: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "auto",
      }}
    >
      {/* 헤더 - 무기 정보 */}
      <Box sx={{ borderBottom: "1px solid #ccc", p: 1.5, bgcolor: "#e3f2fd" }}>
        <Typography variant="body2" sx={{ fontWeight: "bold", mb: 0.5 }}>
          {job?.koreanName === "마법사" ? "마법 계산" : "데미지 계산"}
        </Typography>
        {weapon || job?.koreanName === "마법사" ? (
          <Box>
            {weapon && (
              <Typography variant="caption" sx={{ fontSize: "0.75rem", color: "#666" }}>
                무기: {weapon.name} ({weaponType})
              </Typography>
            )}
            {job?.koreanName === "마법사" ? (
              <>
                <Typography variant="caption" sx={{ fontSize: "0.75rem", color: "#666", display: "block" }}>
                  INT: {finalStats.totalInt} | 마력: {finalStats.totalMAD}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: "0.75rem", color: "#666", display: "block" }}>
                  숙련도: {masteryPercent}%
                </Typography>
              </>
            ) : (
              <>
                <Typography variant="caption" sx={{ fontSize: "0.75rem", color: "#666", display: "block" }}>
                  공격력: {finalStats.totalAttack} | 주스탯: {finalStats.mainStat} | 부스탯: {finalStats.subStat}
                </Typography>
                <Typography variant="caption" sx={{ fontSize: "0.75rem", color: "#666", display: "block" }}>
                  마스터리: {masteryPercent}% | 마력: {finalStats.totalMAD}
                </Typography>
              </>
            )}
          </Box>
        ) : (
          <Typography variant="caption" sx={{ fontSize: "0.75rem", color: "#999" }}>
            무기를 장착하세요
          </Typography>
        )}
      </Box>

      {/* 무기가 없거나 직업이 없으면 안내 메시지 */}
      {(!weapon || !job) && job?.koreanName !== "마법사" && (
        <Box sx={{ p: 3, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography variant="body2" sx={{ color: "#999" }}>
            {!job ? "직업을 먼저 선택하세요" : !weapon ? "무기를 장착하세요" : "무기 타입을 인식할 수 없습니다"}
          </Typography>
        </Box>
      )}

      {/* 데미지 계산 결과 - 마법사 */}
      {job?.koreanName === "마법사" && (
        <>
          {/* 총 마력 */}
          <Box sx={{ borderBottom: "1px solid #ccc", p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              총 마력
            </Typography>
            <Typography variant="body2" sx={{ fontSize: "1.1rem", textAlign: "center" }}>
              {(damages.totalMAD as number).toLocaleString()}
            </Typography>
          </Box>

          {/* 실질 마법 데미지 */}
          {damages.magicDamage && (
            <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                실질 마법 데미지
              </Typography>
              {renderDamage(damages.magicDamage as DamageResult)}
            </Box>
          )}
        </>
      )}

      {/* 데미지 계산 결과 - 비마법사 */}
      {job && job.koreanName !== "마법사" && weapon && weaponConstants && (
        <>
          {/* 스탯창 공격력 - 항상 표시 */}
          {damages.stat && (
            <Box sx={{ borderBottom: "1px solid #ccc", p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                스탯창 공격력
              </Typography>
              {renderDamage(damages.stat as DamageResult)}
            </Box>
          )}

          {/* 최대 공격력 - 최소/최대 무기상수가 다를 때만 표시 */}
          {damages.max && hasDifferentWeaponConstants && (
            <Box sx={{ borderBottom: "1px solid #ccc", p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                {getMaxDamageLabel()}
              </Typography>
              {renderDamage(damages.max as DamageResult)}
            </Box>
          )}

          {/* 최소 공격력 - 최소/최대 무기상수가 다를 때만 표시 */}
          {damages.min && hasDifferentWeaponConstants && (
            <Box sx={{ borderBottom: "1px solid #ccc", p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                {getMinDamageLabel()}
              </Typography>
              {renderDamage(damages.min as DamageResult)}
            </Box>
          )}

          {/* 트스/럭세 실질 공격력 - 아대일 때만 표시 */}
          {damages.treasure && isClawWeapon && (
            <Box sx={{ borderBottom: "1px solid #ccc", p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                트스/럭세 실질 공격력
              </Typography>
              {renderDamage(damages.treasure as DamageResult)}
            </Box>
          )}

          {/* 베놈 실질 공격력 - 도적일 때만 표시 */}
          {damages.venom && isThief && (
            <Box sx={{ borderBottom: "1px solid #ccc", p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                베놈 실질 공격력(베놈 M 기준, 공격력 60 적용)
              </Typography>
              {renderDamage(damages.venom as DamageResult)}
            </Box>
          )}

          {/* 로어 실질 공격력 - 창/폴암일 때만 표시 */}
          {damages.lore && isSpear && (
            <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                로어 실질 공격력
              </Typography>
              {renderDamage(damages.lore as DamageResult)}
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
