import { Box, Typography, TextField, Divider, Select, MenuItem } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { useState, useMemo, useCallback } from "react";
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
 * 물리 접촉/물리타입 스킬 데미지 공식 (해외 검증):
 *
 * C (warrior) = STR/2800 + DEX/3200 + INT/7200 + LUK/3200
 * C (others)  = STR/2000 + DEX/2800 + INT/7200 + LUK/3200
 * A = C + 0.28
 *
 * t = ATT² × rand(0.008, 0.0085)
 *
 * D (charLv >= mobLv) = 13/(13 + charLv - mobLv)
 * D (charLv <  mobLv) = 1.3
 *
 * B (PDD >= stdPDD) = C×28/45 + charLv×7/13000 + 0.196
 * B (PDD <  stdPDD) = D × (C + charLv/550 + 0.28)
 *
 * damage = t - PDD×A - (PDD - stdPDD)×B
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
  const C = isWarrior
    ? str / 2800 + dex / 3200 + int / 7200 + luk / 3200
    : str / 2000 + dex / 2800 + int / 7200 + luk / 3200;
  const A = C + 0.28;

  let B: number;
  if (userPDD >= stdPDD) {
    B = C * 28 / 45 + charLevel * 7 / 13000 + 0.196;
  } else {
    const D = charLevel >= mobLevel
      ? 13 / (13 + charLevel - mobLevel)
      : 1.3;
    B = D * (C + charLevel / 550 + 0.28);
  }

  const t_min = monsterATT * monsterATT * 0.008;
  const t_max = monsterATT * monsterATT * 0.0085;
  const defReduction = userPDD * A + (userPDD - stdPDD) * B;
  const minDmg = Math.max(1, Math.floor(t_min - defReduction));
  const maxDmg = Math.max(1, Math.floor(t_max - defReduction));
  return { min: minDmg, max: maxDmg };
}

/**
 * 마법 스킬 피격 데미지 공식 (검증 완료):
 *
 * t = MAD² × rand(0.0075, 0.008)
 * defense = (MDD/4 + STR/28 + DEX/24 + LUK/20) × K
 * K = 1.2 (마법사), K = 1.0 (그 외)
 *
 * damage = t - defense
 */
function calcMagicDamage(
  monsterMATT: number,
  userMDD: number,
  isMagician: boolean,
  str: number,
  dex: number,
  luk: number,
): { min: number; max: number } {
  const K = isMagician ? 1.2 : 1.0;
  const defense = (userMDD / 4 + str / 28 + dex / 24 + luk / 20) * K;

  const t_min = monsterMATT * monsterMATT * 0.0075;
  const t_max = monsterMATT * monsterMATT * 0.008;
  const minDmg = Math.max(1, Math.floor(t_min - defense));
  const maxDmg = Math.max(1, Math.floor(t_max - defense));
  return { min: minDmg, max: maxDmg };
}

// 데미지 타입: touch(접촉), physical(물리스킬), magic(무속성마법), fire, ice, lightning, poison
type DamageType = "touch" | "physical" | "magic" | "fire" | "ice" | "lightning" | "poison";
const ALL_DAMAGE_TYPES: DamageType[] = ["touch", "physical", "magic", "fire", "ice", "lightning", "poison"];

const POWER_UP_MULTIPLIER = [1, 1.15, 1.3] as const;

const SKILL_DAMAGE_TYPES: Record<string, DamageType[]> = {
  "Power Guard": ["touch"],
  "Achilles": ALL_DAMAGE_TYPES,
  "Element Resistance": ["fire", "ice", "lightning", "poison"],
  "Invincible": ["touch", "physical"],
  "Partial Resistance FP": ["fire", "poison"],
  "Partial Resistance IL": ["ice", "lightning"],
};

interface DamageResult {
  min: number; max: number;
  reducedMin: number; reducedMax: number;
  afterPUpMin: number; afterPUpMax: number;
  finalMin: number; finalMax: number;
  hasReduction: boolean;
  hasPowerUp: boolean;
  hasMesoGuard: boolean;
  mesoAbsMin: number; mesoAbsMax: number;
}

/** 피격 데미지 결과 표시 (DamageTable과 동일 디자인) */
function DamageResultSection({ label, result }: { label: string; result: DamageResult }) {
  return (
    <Box sx={{ borderBottom: "1px solid #ccc", p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontSize: "1.1rem", textAlign: "center" }}>
        {result.finalMin.toLocaleString()} ~ {result.finalMax.toLocaleString()}
      </Typography>
    </Box>
  );
}

export default function DamageReceivedTable() {
  const { character, defenseBuffs, specialSkillLevels, passiveLevels } = useCharacter();

  const [monsterATT, setMonsterATT] = useState(630);
  const [monsterMATT, setMonsterMATT] = useState(480);
  const [monsterACC, setMonsterACC] = useState(250);
  const [monsterLevel, setMonsterLevel] = useState(125);
  const [powerUpLevel, setPowerUpLevel] = useState(0);
  const [magicUpLevel, setMagicUpLevel] = useState(0);


  const job = character.getJob();
  const jobEngName = job?.engName ?? "";
  const stats = character.getStats();
  const equipStats = character.getEquipmentStats();
  const finalStats = character.getFinalStats();
  const weaponType = character.getWeaponType();
  const isWarrior = jobEngName === "warrior";
  const isMagician = jobEngName === "magician";
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
  const mdef = equipStats.mdef + finalStats.totalInt + defenseBuffs.mdef.value;

  // 패시브 회피 보너스 (도적: Nimble Body)
  const passiveEva = useMemo(() => {
    if (jobEngName !== "thief") return 0;
    const level = passiveLevels["Nimble Body"] ?? 0;
    return (nimbleBodyData.properties[level] as Record<string, number>)?.eva ?? 0;
  }, [jobEngName, passiveLevels]);

  // 총 회피율
  const totalEva = equipStats.eva + finalStats.totalDex * 0.25 + finalStats.totalLuk * 0.5 + passiveEva + defenseBuffs.eva.value;

  // 적용 중인 데미지 감소 스킬 수집 (메소가드 제외)
  const activeReductions = useMemo(() => {
    const skills = specialSkillsByJob[jobEngName] || [];
    const results: { name: string; icon: string; level: number; damR: number; types: DamageType[] }[] = [];

    for (const skill of skills) {
      const level = specialSkillLevels[skill.englishName] ?? 0;
      if (level === 0) continue;

      if (skill.excludeWeaponTypes && weaponType && skill.excludeWeaponTypes.includes(weaponType)) continue;
      if (skill.requireWeaponTypes && (!weaponType || !skill.requireWeaponTypes.includes(weaponType))) continue;

      const props = skill.properties.find(p => p.level === level) || {};
      const damR = props.damR ?? 0;

      if (damR > 0) {
        const types = SKILL_DAMAGE_TYPES[skill.englishName] ?? ALL_DAMAGE_TYPES;
        results.push({
          name: skill.koreanName,
          icon: skill.icon,
          level,
          damR,
          types,
        });
      }
    }
    return results;
  }, [jobEngName, specialSkillLevels, weaponType]);

  // 메소가드 정보 (별도 처리: powerUp 적용 전 기준으로 50% 흡수)
  const mesoGuardInfo = useMemo(() => {
    const skills = specialSkillsByJob[jobEngName] || [];
    const found = skills.map(skill => {
      const level = specialSkillLevels[skill.englishName] ?? 0;
      if (level === 0) return null;
      if (skill.requireWeaponTypes && (!weaponType || !skill.requireWeaponTypes.includes(weaponType))) return null;
      const props = skill.properties.find(p => p.level === level) || {};
      if ((props.mesoR ?? 0) > 0) return { active: true as const, level, icon: skill.icon, name: skill.koreanName };
      return null;
    }).find(x => x !== null);
    return found ?? { active: false as const, level: 0, icon: "", name: "" };
  }, [jobEngName, specialSkillLevels, weaponType]);

  /** 특정 데미지 타입에 적용되는 스킬 감소 multiplier (메소가드 제외) */
  const getReductionMultiplier = useCallback((dmgType: DamageType) => {
    let multiplier = 1;
    for (const r of activeReductions) {
      if (r.types.includes(dmgType)) multiplier *= (1 - r.damR / 100);
    }
    return multiplier;
  }, [activeReductions]);

  /** 데미지 타입에 따른 PowerUp/MagicUp 배율 */
  const getPowerUpMultiplier = useCallback((dmgType: DamageType) => {
    if (dmgType === "touch" || dmgType === "physical") return POWER_UP_MULTIPLIER[powerUpLevel];
    return POWER_UP_MULTIPLIER[magicUpLevel];
  }, [powerUpLevel, magicUpLevel]);

  /**
   * 데미지 계산 공통 처리:
   * 1. base = 공식 결과
   * 2. reduced = base × 스킬감소 (메소가드 제외)
   * 3. mesoAbs = reduced × 0.5 (메소가드 기준값, powerUp 적용 전)
   * 4. afterPowerUp = reduced × powerUp배율
   * 5. final = afterPowerUp - mesoAbs
   */
  const applyModifiers = useCallback((
    base: { min: number; max: number },
    dmgType: DamageType,
  ) => {
    const skillMult = getReductionMultiplier(dmgType);
    const reducedMin = Math.max(1, Math.floor(base.min * skillMult));
    const reducedMax = Math.max(1, Math.floor(base.max * skillMult));

    const mesoAbs = mesoGuardInfo.active ? 0.5 : 0;
    const mesoAbsMin = Math.floor(reducedMin * mesoAbs);
    const mesoAbsMax = Math.floor(reducedMax * mesoAbs);

    const pUpMult = getPowerUpMultiplier(dmgType);
    const afterPUpMin = Math.floor(reducedMin * pUpMult);
    const afterPUpMax = Math.floor(reducedMax * pUpMult);

    const finalMin = Math.max(1, afterPUpMin - mesoAbsMin);
    const finalMax = Math.max(1, afterPUpMax - mesoAbsMax);

    return {
      min: base.min, max: base.max,
      reducedMin, reducedMax,
      afterPUpMin: afterPUpMin, afterPUpMax: afterPUpMax,
      finalMin, finalMax,
      hasReduction: skillMult < 1,
      hasPowerUp: pUpMult > 1,
      hasMesoGuard: mesoGuardInfo.active,
      mesoAbsMin, mesoAbsMax,
    };
  }, [getReductionMultiplier, getPowerUpMultiplier, mesoGuardInfo.active]);

  // 물리 접촉 데미지
  const physicalResult = useMemo(() => {
    const base = calcPhysicalDamage(
      monsterATT, wdef, stdPDD, stats.level, monsterLevel, isWarrior,
      finalStats.totalStr, finalStats.totalDex, finalStats.totalInt, finalStats.totalLuk,
    );
    return applyModifiers(base, "touch");
  }, [monsterATT, wdef, stdPDD, stats.level, monsterLevel, isWarrior, finalStats, applyModifiers]);

  // 스킬(물리) 피격 데미지
  const physSkillResult = useMemo(() => {
    const base = calcPhysicalDamage(
      monsterMATT, wdef, stdPDD, stats.level, monsterLevel, isWarrior,
      finalStats.totalStr, finalStats.totalDex, finalStats.totalInt, finalStats.totalLuk,
    );
    return applyModifiers(base, "physical");
  }, [monsterMATT, wdef, stdPDD, stats.level, monsterLevel, isWarrior, finalStats, applyModifiers]);

  // 스킬(마법) 피격 데미지
  const magicSkillResult = useMemo(() => {
    const base = calcMagicDamage(
      monsterMATT, mdef, isMagician,
      finalStats.totalStr, finalStats.totalDex, finalStats.totalLuk,
    );
    return applyModifiers(base, "magic");
  }, [monsterMATT, mdef, isMagician, finalStats, applyModifiers]);


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
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography variant="caption" sx={{ color: "#666" }}>
              파워업
            </Typography>
            <Select
              size="small"
              value={powerUpLevel}
              onChange={(e: SelectChangeEvent<number>) => setPowerUpLevel(Number(e.target.value))}
              sx={{
                height: 28, minWidth: 50,
                "& .MuiSelect-select": { p: "4px 8px", fontSize: "0.8rem" },
              }}
            >
              <MenuItem value={0}>-</MenuItem>
              <MenuItem value={1}>1</MenuItem>
              <MenuItem value={2}>2</MenuItem>
            </Select>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography variant="caption" sx={{ color: "#666" }}>
              매직업
            </Typography>
            <Select
              size="small"
              value={magicUpLevel}
              onChange={(e: SelectChangeEvent<number>) => setMagicUpLevel(Number(e.target.value))}
              sx={{
                height: 28, minWidth: 50,
                "& .MuiSelect-select": { p: "4px 8px", fontSize: "0.8rem" },
              }}
            >
              <MenuItem value={0}>-</MenuItem>
              <MenuItem value={1}>1</MenuItem>
              <MenuItem value={2}>2</MenuItem>
            </Select>
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* 피격 데미지 섹션 */}
      <DamageResultSection label="물리 접촉 데미지" result={physicalResult} />
      <DamageResultSection label="스킬(물리) 피격 데미지" result={physSkillResult} />
      <DamageResultSection label="스킬(마법) 피격 데미지" result={magicSkillResult} />

      {/* 회피확률 */}
      <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          회피확률
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="body2">물리 회피확률</Typography>
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            {combinedPhysEva.toFixed(1)}%
          </Typography>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography variant="body2">마법 회피확률</Typography>
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            {combinedMagicEva.toFixed(1)}%
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
