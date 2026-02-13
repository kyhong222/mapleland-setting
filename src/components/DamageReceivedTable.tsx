import { Box, Typography, TextField, Divider } from "@mui/material";
import { useState, useMemo } from "react";
import { useCharacter } from "../contexts/CharacterContext";
import { specialSkillsByJob } from "../types/specialSkill";
import standardPDDData from "../data/buff/standardPDD.json";
import shieldMasteryData from "../data/passive/warrior/shieldMastery.json";
import thiefShieldMasteryData from "../data/passive/thief/shieldMastery.json";
import nimbleBodyData from "../data/passive/thief/nimbleBody.json";

const standardPDD = standardPDDData as Record<string, Record<string, number>>;

/** 주어진 레벨 이하의 가장 가까운 키 값을 반환 */
function lookupPDD(jobEngName: string, level: number): number {
  const table = standardPDD[jobEngName];
  if (!table) return 0;
  const levels = Object.keys(table).map(Number).sort((a, b) => a - b);
  let result = 0;
  for (const lv of levels) {
    if (lv <= level) result = table[String(lv)];
    else break;
  }
  return result;
}

/**
 * 물리 피격 데미지 공식 (클라이언트 추출):
 *
 * base (warrior) = floor((LUK+DEX)/4 + INT/9 + STR*2/7)
 * base (others)  = floor(INT/9 + DEX*2/7 + STR*0.4 + LUK/4)
 * mod = base × 0.00125
 *
 * t = pad × rand(pad*0.8, pad*0.85) × 0.01
 *   = pad² × rand(0.008, 0.0085)
 *
 * userPDD >= standardPDD:
 *   fac = base/900 + (charLv/1300 + 0.28) × (userPDD - stdPDD) × 0.7
 * userPDD < standardPDD:
 *   charLv >= mobLv: fac = (charLv/550 + mod + 0.28) × (userPDD - stdPDD) × 13/(13+charLv-mobLv)
 *   charLv <  mobLv: fac = (charLv/550 + mod + 0.28) × (userPDD - stdPDD) × 1.3
 *
 * def = t - fac - (mod + 0.28) × userPDD
 */
function calcPhysicalDamage(
  monsterATT: number,
  userPDD: number,
  stdPDD: number,
  charLevel: number,
  mobLevel: number,
  isWarrior: boolean,
  str: number,
  dex: number,
  int: number,
  luk: number,
): { min: number; max: number } {
  const base = isWarrior
    ? Math.floor((luk + dex) / 4 + int / 9 + str * 2 / 7)
    : Math.floor(int / 9 + dex * 2 / 7 + str * 0.4 + luk / 4);
  const mod = base * 0.00125;

  let fac: number;
  if (userPDD >= stdPDD) {
    fac = base / 900 + (charLevel / 1300 + 0.28) * (userPDD - stdPDD) * 0.7;
  } else {
    const opt = charLevel / 550 + mod + 0.28;
    if (charLevel >= mobLevel) {
      fac = opt * (userPDD - stdPDD) * 13 / (charLevel - mobLevel + 13);
    } else {
      fac = opt * (userPDD - stdPDD) * 1.3;
    }
  }

  const t_min = monsterATT * monsterATT * 0.008;
  const t_max = monsterATT * monsterATT * 0.0085;
  const defReduction = fac + (mod + 0.28) * userPDD;
  const minDmg = Math.max(1, Math.floor(t_min - defReduction));
  const maxDmg = Math.max(1, Math.floor(t_max - defReduction));
  return { min: minDmg, max: maxDmg };
}

export default function DamageReceivedTable() {
  const { character, defenseBuffs, specialSkillLevels, passiveLevels } = useCharacter();

  const [monsterATT, setMonsterATT] = useState(630);
  const [monsterMATT, setMonsterMATT] = useState(480);
  const [monsterACC, setMonsterACC] = useState(250);
  const [monsterLevel, setMonsterLevel] = useState(125);

  const job = character.getJob();
  const jobEngName = job?.engName ?? "";
  const stats = character.getStats();
  const equipStats = character.getEquipmentStats();
  const finalStats = character.getFinalStats();
  const weaponType = character.getWeaponType();
  const isWarrior = jobEngName === "warrior";
  const isThief = jobEngName === "thief";

  // 쉴드 마스터리 PDD 보너스
  const shieldMasteryBonus = useMemo(() => {
    const secondaryItem = character.getEquippedItem("보조무기");
    const hasShield = secondaryItem?.type === "방패" && !character.isSlotBlocked("보조무기");
    if (!hasShield) return 0;
    const shieldPdef = secondaryItem?.pdef ?? 0;
    const isThiefDagger = jobEngName === "thief" && weaponType === "단검";
    const source = isThiefDagger ? thiefShieldMasteryData : shieldMasteryData;
    const level = passiveLevels["Shield Mastery"] ?? 0;
    const pdefP = (source.properties[level] as Record<string, number>)?.pdefP ?? 0;
    return Math.floor(shieldPdef * pdefP / 100);
  }, [character, jobEngName, weaponType, passiveLevels]);

  // userPDD = 스탯창 물방 + 버프 물방 (standardPDD와는 독립)
  const stdPDD = lookupPDD(jobEngName, stats.level);
  const wdef = equipStats.pdef + shieldMasteryBonus + defenseBuffs.pdef.value;

  // 패시브 회피 보너스 (도적: Nimble Body)
  const passiveEva = useMemo(() => {
    if (jobEngName !== "thief") return 0;
    const level = passiveLevels["Nimble Body"] ?? 0;
    return (nimbleBodyData.properties[level] as Record<string, number>)?.eva ?? 0;
  }, [jobEngName, passiveLevels]);

  // 총 회피율
  const totalEva = equipStats.eva + finalStats.totalDex * 0.25 + finalStats.totalLuk * 0.5 + passiveEva + defenseBuffs.eva.value;

  // 적용 중인 데미지 감소 스킬 수집
  const activeReductions = useMemo(() => {
    const skills = specialSkillsByJob[jobEngName] || [];
    const results: { name: string; icon: string; level: number; damR: number; type: "physical" | "magic" }[] = [];

    for (const skill of skills) {
      const level = specialSkillLevels[skill.englishName] ?? 0;
      if (level === 0) continue;

      if (skill.excludeWeaponTypes && weaponType && skill.excludeWeaponTypes.includes(weaponType)) continue;
      if (skill.requireWeaponTypes && (!weaponType || !skill.requireWeaponTypes.includes(weaponType))) continue;

      const props = skill.properties.find(p => p.level === level) || {};
      const damR = props.damR ?? 0;
      const mesoR = props.mesoR ?? 0;

      if (damR > 0) {
        const isMagicOnly = skill.englishName === "Element Resistance" ||
          skill.englishName === "Partial Resistance FP" ||
          skill.englishName === "Partial Resistance IL";
        results.push({
          name: skill.koreanName,
          icon: skill.icon,
          level,
          damR,
          type: isMagicOnly ? "magic" : "physical",
        });
      }
      // 메소가드: 항상 50% 데미지 감소, 물리/마법 양쪽 적용
      if (mesoR > 0) {
        results.push({
          name: skill.koreanName,
          icon: skill.icon,
          level,
          damR: 50,
          type: "physical",
        });
        results.push({
          name: skill.koreanName,
          icon: skill.icon,
          level,
          damR: 50,
          type: "magic",
        });
      }
    }
    return results;
  }, [jobEngName, specialSkillLevels, weaponType]);

  // 물리 피격 데미지 계산 (실제 공식)
  const physicalResult = useMemo(() => {
    const { min, max } = calcPhysicalDamage(
      monsterATT, wdef, stdPDD, stats.level, monsterLevel, isWarrior,
      finalStats.totalStr, finalStats.totalDex, finalStats.totalInt, finalStats.totalLuk,
    );
    let multiplier = 1;
    for (const r of activeReductions) {
      if (r.type === "physical") {
        multiplier *= (1 - r.damR / 100);
      }
    }
    const finalMin = Math.max(1, Math.floor(min * multiplier));
    const finalMax = Math.max(1, Math.floor(max * multiplier));
    return { min, max, finalMin, finalMax, hasReduction: multiplier < 1 };
  }, [monsterATT, wdef, stdPDD, stats.level, monsterLevel, isWarrior, finalStats, activeReductions]);

  // 특수 스킬 추가 회피확률 (페이크 등)
  const specialEvaInfo = useMemo(() => {
    const skills = specialSkillsByJob[jobEngName] || [];
    const results: { name: string; icon: string; level: number; evaP: number }[] = [];
    for (const skill of skills) {
      const level = specialSkillLevels[skill.englishName] ?? 0;
      if (level === 0) continue;
      if (skill.excludeWeaponTypes && weaponType && skill.excludeWeaponTypes.includes(weaponType)) continue;
      if (skill.requireWeaponTypes && (!weaponType || !skill.requireWeaponTypes.includes(weaponType))) continue;
      const props = skill.properties.find(p => p.level === level) || {};
      const evaP = props.evaP ?? 0;
      if (evaP > 0) {
        results.push({ name: skill.koreanName, icon: skill.icon, level, evaP });
      }
    }
    return results;
  }, [jobEngName, specialSkillLevels, weaponType]);

  const totalSpecialEvaP = specialEvaInfo.reduce((sum, r) => sum + r.evaP, 0);

  // 물리 회피확률: totalEva / (4.5 × monsterACC)
  const physicalEvasionRate = useMemo(() => {
    const min = isThief ? 5 : 2;
    const max = isThief ? 95 : 80;
    if (monsterACC <= 0) return max;
    const rate = totalEva / (4.5 * monsterACC) * 100;
    return Math.min(max, Math.max(min, rate));
  }, [totalEva, monsterACC, isThief]);

  // 마법 회피확률: 10/9 - monsterACC / (0.9 × totalEva)
  const magicEvasionRate = useMemo(() => {
    const min = isThief ? 5 : 2;
    const max = isThief ? 95 : 80;
    if (monsterACC <= 0 || totalEva <= 0) return max;
    const rate = (10 / 9 - monsterACC / (0.9 * totalEva)) * 100;
    return Math.min(max, Math.max(min, rate));
  }, [totalEva, monsterACC, isThief]);

  // 페이크 등 별도 독립 회피 판정 적용: 1 - (1 - base) × (1 - evaP)
  const combinedPhysEva = totalSpecialEvaP > 0
    ? (1 - (1 - physicalEvasionRate / 100) * (1 - totalSpecialEvaP / 100)) * 100
    : physicalEvasionRate;
  const combinedMagicEva = totalSpecialEvaP > 0
    ? (1 - (1 - magicEvasionRate / 100) * (1 - totalSpecialEvaP / 100)) * 100
    : magicEvasionRate;

  const physicalReductions = activeReductions.filter((r) => r.type === "physical");

  return (
    <Box
      sx={{
        width: 400,
        border: "1px solid #ccc",
        borderRadius: 1,
        bgcolor: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 타이틀 */}
      <Typography
        variant="body2"
        sx={{ fontWeight: "bold", p: 1.5, borderBottom: "1px solid #ccc" }}
      >
        피격/회피 계산기
      </Typography>

      {/* 상단: 몬스터 정보 (추후 몬스터 선택 UI로 대체) */}
      <Box sx={{ p: 1.5, minHeight: 160, display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: "bold", mb: 0.5 }}>
          몬스터 정보
        </Typography>
        <Box sx={{ display: "flex", gap: 2, pl: 1, flexWrap: "wrap", rowGap: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography variant="caption" sx={{ color: "#666" }}>
              레벨
            </Typography>
            <TextField
              type="number"
              size="small"
              value={monsterLevel}
              onChange={(e) => setMonsterLevel(Math.max(1, parseInt(e.target.value) || 1))}
              sx={{
                width: 60,
                "& .MuiOutlinedInput-root": { height: 28 },
                "& .MuiInputBase-input": {
                  p: "4px 8px",
                  fontSize: "0.8rem",
                  textAlign: "center",
                },
              }}
            />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography variant="caption" sx={{ color: "#666" }}>
              물리ATT
            </Typography>
            <TextField
              type="number"
              size="small"
              value={monsterATT}
              onChange={(e) => setMonsterATT(Math.max(0, parseInt(e.target.value) || 0))}
              sx={{
                width: 70,
                "& .MuiOutlinedInput-root": { height: 28 },
                "& .MuiInputBase-input": {
                  p: "4px 8px",
                  fontSize: "0.8rem",
                  textAlign: "center",
                },
              }}
            />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography variant="caption" sx={{ color: "#666" }}>
              마법ATT
            </Typography>
            <TextField
              type="number"
              size="small"
              value={monsterMATT}
              onChange={(e) => setMonsterMATT(Math.max(0, parseInt(e.target.value) || 0))}
              sx={{
                width: 70,
                "& .MuiOutlinedInput-root": { height: 28 },
                "& .MuiInputBase-input": {
                  p: "4px 8px",
                  fontSize: "0.8rem",
                  textAlign: "center",
                },
              }}
            />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography variant="caption" sx={{ color: "#666" }}>
              명중률
            </Typography>
            <TextField
              type="number"
              size="small"
              value={monsterACC}
              onChange={(e) => setMonsterACC(Math.max(0, parseInt(e.target.value) || 0))}
              sx={{
                width: 70,
                "& .MuiOutlinedInput-root": { height: 28 },
                "& .MuiInputBase-input": {
                  p: "4px 8px",
                  fontSize: "0.8rem",
                  textAlign: "center",
                },
              }}
            />
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* 하단: 물리/마법 피격 + 회피확률 */}
      <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 1.5 }}>
        {/* === 물리 피격 데미지 섹션 === */}
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          물리 접촉 데미지
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, pl: 1 }}>
          {/* 방어력 요약 */}
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="caption" sx={{ color: "#666" }}>
              물리방어력
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: "bold" }}>
              {wdef}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="caption" sx={{ color: "#888", fontSize: "0.65rem", pl: 1 }}>
              장비 {equipStats.pdef} + 쉴드 {shieldMasteryBonus} + 버프 {defenseBuffs.pdef.value}
            </Typography>
          </Box>

          {/* 피격 데미지 */}
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
            <Typography variant="caption" sx={{ ...(!physicalResult.hasReduction ? { fontWeight: "bold", textDecoration: "underline" } : { color: "#666" }) }}>
              피격 데미지
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: "bold", ...(!physicalResult.hasReduction ? { textDecoration: "underline", color: "primary.main" } : {}) }}>
              {physicalResult.min}~{physicalResult.max}
            </Typography>
          </Box>
          {physicalResult.hasReduction && (
            <Box sx={{ display: "flex", justifyContent: "space-between" }}>
              <Typography variant="caption" sx={{ fontWeight: "bold", textDecoration: "underline" }}>
                스킬 감소 후
              </Typography>
              <Typography variant="caption" sx={{ fontWeight: "bold", color: "primary.main", textDecoration: "underline" }}>
                {physicalResult.finalMin}~{physicalResult.finalMax}
              </Typography>
            </Box>
          )}
          {physicalReductions.map((r) => (
            <Box key={r.name} sx={{ display: "flex", alignItems: "center", gap: 0.5, pl: 1 }}>
              {r.icon && (
                <img
                  src={`data:image/png;base64,${r.icon}`}
                  alt={r.name}
                  style={{ width: 16, height: 16, objectFit: "contain" }}
                />
              )}
              <Typography variant="caption" sx={{ color: "#888", fontSize: "0.65rem" }}>
                {r.name} Lv{r.level} (-{r.damR}%)
              </Typography>
            </Box>
          ))}
        </Box>

        <Divider />

        {/* === 회피확률 섹션 === */}
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          회피확률
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, pl: 1 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="caption" sx={{ color: "#666" }}>
              총 회피율
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: "bold" }}>
              {Number.isInteger(totalEva) ? totalEva : totalEva.toFixed(1)}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="caption" sx={{ color: "#888", fontSize: "0.65rem", pl: 1 }}>
              장비 {equipStats.eva} + DEX {(finalStats.totalDex * 0.25).toFixed(1)} + LUK {(finalStats.totalLuk * 0.5).toFixed(1)}
              {passiveEva > 0 ? ` + 패시브 ${passiveEva}` : ""}
              {defenseBuffs.eva.value > 0 ? ` + 버프 ${defenseBuffs.eva.value}` : ""}
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between", mt: 0.5 }}>
            <Typography variant="caption" sx={{ ...(totalSpecialEvaP === 0 ? { fontWeight: "bold", textDecoration: "underline" } : { color: "#666" }) }}>
              물리 회피확률
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: "bold", color: "primary.main", ...(totalSpecialEvaP === 0 ? { textDecoration: "underline" } : {}) }}>
              {physicalEvasionRate.toFixed(1)}%
            </Typography>
          </Box>
          <Box sx={{ display: "flex", justifyContent: "space-between" }}>
            <Typography variant="caption" sx={{ ...(totalSpecialEvaP === 0 ? { fontWeight: "bold", textDecoration: "underline" } : { color: "#666" }) }}>
              마법 회피확률
            </Typography>
            <Typography variant="caption" sx={{ fontWeight: "bold", color: "primary.main", ...(totalSpecialEvaP === 0 ? { textDecoration: "underline" } : {}) }}>
              {magicEvasionRate.toFixed(1)}%
            </Typography>
          </Box>
          {totalSpecialEvaP > 0 && (
            <>
              {specialEvaInfo.map((r) => (
                <Box key={r.name} sx={{ display: "flex", alignItems: "center", gap: 0.5, pl: 1 }}>
                  {r.icon && (
                    <img
                      src={`data:image/png;base64,${r.icon}`}
                      alt={r.name}
                      style={{ width: 16, height: 16, objectFit: "contain" }}
                    />
                  )}
                  <Typography variant="caption" sx={{ color: "#888", fontSize: "0.65rem" }}>
                    {r.name} Lv{r.level} (독립 {r.evaP}%)
                  </Typography>
                </Box>
              ))}
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="caption" sx={{ fontWeight: "bold", textDecoration: "underline" }}>
                  물리 종합 회피확률
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: "bold", color: "primary.main", textDecoration: "underline" }}>
                  {combinedPhysEva.toFixed(1)}%
                </Typography>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography variant="caption" sx={{ fontWeight: "bold", textDecoration: "underline" }}>
                  마법 종합 회피확률
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: "bold", color: "primary.main", textDecoration: "underline" }}>
                  {combinedMagicEva.toFixed(1)}%
                </Typography>
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
