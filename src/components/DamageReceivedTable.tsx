import { Box, Typography, TextField, Button, Divider, Dialog, DialogContent, Tooltip, IconButton, CircularProgress } from "@mui/material";
import { Close as CloseIcon, Search as SearchIcon, Info as InfoIcon } from "@mui/icons-material";
import { useState, useMemo, useCallback, useEffect, useRef, type JSX } from "react";
import { useCharacter } from "../contexts/CharacterContext";
import { specialSkillsByJob, MAGICIAN_SUBCLASS_SKILLS } from "../types/specialSkill";
import type { MagicianSubClass } from "../types/specialSkill";
import standardPDDData from "../data/buff/standardPDD.json";
import shieldMasteryData from "../data/passive/warrior/shieldMastery.json";
import thiefShieldMasteryData from "../data/passive/thief/shieldMastery.json";
import nimbleBodyData from "../data/passive/thief/nimbleBody.json";
import { fetchMobDetails, fetchMobIcon } from "../api/maplestory";
import mobListData from "../data/mobs/mobList.json";
import { saveSelectedMobId, getSelectedMobId } from "../utils/characterStorage";

const standardPDD = standardPDDData as Record<string, Record<string, number>>;

interface MobSkillInfo {
  type?: number;
  magic?: number;
  elemAttr?: string;
  PADamage?: number;
  MADamage?: number;
}
interface MobWzEntry {
  id: number;
  PADamage?: number;
  MADamage?: number;
  acc?: number;
  skills?: Record<string, MobSkillInfo>;
}

// 모듈 레벨 캐시: 한 번 로드하면 재사용
let mobWzCache: Record<string, MobWzEntry> | null = null;
let mobWzPromise: Promise<Record<string, MobWzEntry>> | null = null;

function loadMobWzData(): Promise<Record<string, MobWzEntry>> {
  if (mobWzCache) return Promise.resolve(mobWzCache);
  if (!mobWzPromise) {
    mobWzPromise = import("../data/mobs/mobWzData.json").then((mod) => {
      mobWzCache = mod.default as Record<string, MobWzEntry>;
      return mobWzCache;
    });
  }
  return mobWzPromise;
}

interface MobListEntry {
  id: number;
  name: string;
  koreanName: string;
  level: number;
  isBoss: boolean;
  foundAt: string[];
}

const mobList = mobListData as unknown as MobListEntry[];

// 지역 카테고리 매핑
const REGION_CATEGORIES: { name: string; regions: string[] }[] = [
  { name: "빅토리아", regions: ["빅토리아 아일랜드", "해외여행: 태국", "뉴 리프 시티", "해외여행: 중국", "샤레니안", "해외여행: 대만", "해외여행: 일본"] },
  { name: "엘나스", regions: ["아쿠아리움", "오르비스", "엘나스", "폐광", "무릉도원", "백초마을"] },
  { name: "루더스 호수", regions: ["아리안트", "루디브리엄", "마가티아", "루디브리엄 파퀘", "지구방위본부", "아랫마을", "시계탑 최하층", "엘린숲"] },
  { name: "리프레", regions: ["리프레"] },
  { name: "시간의 신전", regions: ["시간의 신전"] },
];

// foundAt 기반으로 지역별 그룹 생성 (한 몹이 여러 지역에 속할 수 있음)
const mobsByRegion = (() => {
  const regionMap = new Map<string, MobListEntry[]>();
  for (const mob of mobList) {
    if (mob.foundAt.length === 0) {
      const arr = regionMap.get("기타") ?? [];
      arr.push(mob);
      regionMap.set("기타", arr);
    } else {
      for (const region of mob.foundAt) {
        const arr = regionMap.get(region) ?? [];
        arr.push(mob);
        regionMap.set(region, arr);
      }
    }
  }
  for (const [, mobs] of regionMap) mobs.sort((a, b) => a.level - b.level);
  return regionMap;
})();

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

const POWER_UP_NORMAL = 1.15;
const POWER_UP_BOSS = 1.3;

const ELEM_LABELS: Record<string, string> = {
  F: "불", I: "얼음", L: "번개", S: "독",
};
const ELEM_TO_DAMAGE_TYPE: Record<string, DamageType> = {
  F: "fire", I: "ice", L: "lightning", S: "poison",
};

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

interface SkillDamageEntry {
  name: string;
  names: string[];
  label: string;
  result: DamageResult;
}

/** 피격 데미지 결과 표시 (DamageTable과 동일 디자인) */
function DamageResultSection({ label, result, infoTooltip, endAdornment, appliedSkills }: {
  label: string; result: DamageResult; infoTooltip?: string; endAdornment?: JSX.Element;
  appliedSkills?: Array<{ name: string; icon: string; level: number }>;
}) {
  return (
    <Box sx={{ borderBottom: "1px solid #ccc", p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          {label}
        </Typography>
        {infoTooltip && (
          <Tooltip title={infoTooltip} arrow placement="top">
            <InfoIcon sx={{ fontSize: 14, color: "#aaa", cursor: "help" }} />
          </Tooltip>
        )}
        {endAdornment}
        {/* 적용된 스킬 아이콘 표시 */}
        {appliedSkills && appliedSkills.length > 0 && (
          <Box sx={{ display: "flex", gap: 0.25, ml: "auto" }}>
            {appliedSkills.map((skill) => (
              <Tooltip key={skill.name} title={`${skill.name} Lv.${skill.level}`} arrow placement="top">
                <Box
                  component="img"
                  src={`data:image/webp;base64,${skill.icon}`}
                  alt={skill.name}
                  sx={{
                    width: 20,
                    height: 20,
                    objectFit: "contain",
                    opacity: 0.85,
                    "&:hover": { opacity: 1 },
                  }}
                />
              </Tooltip>
            ))}
          </Box>
        )}
      </Box>
      <Typography variant="body2" sx={{ fontSize: "1.1rem", textAlign: "center" }}>
        {result.finalMin.toLocaleString()} ~ {result.finalMax.toLocaleString()}
      </Typography>
    </Box>
  );
}

/** 스킬 애니메이션 GIF 툴팁 (key로 mobId-skillName을 전달하여 몬스터 변경 시 상태 초기화) */
function SkillAnimationTooltip({ mobId, skillName }: { mobId: number; skillName: string }) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const animUrl = `https://maplestory.io/api/GMS/62/mob/${mobId}/render/${skillName}`;

  if (error) return null;

  return (
    <Tooltip
      arrow
      placement="right"
      slotProps={{
        tooltip: { sx: { bgcolor: "rgba(30,30,30,0.95)", p: 1, maxWidth: "none" } },
      }}
      title={
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", minWidth: 64, minHeight: 64 }}>
          {!loaded && <CircularProgress size={20} sx={{ color: "#fff" }} />}
          <img
            src={animUrl}
            alt={skillName}
            style={{ maxWidth: 240, maxHeight: 240, display: loaded ? "block" : "none" }}
            onLoad={() => setLoaded(true)}
            onError={(e) => {
              const img = e.currentTarget;
              if (img.src.includes("/GMS/62/")) {
                img.src = `https://maplestory.io/api/GMS/200/mob/${mobId}/render/${skillName}`;
              } else {
                setError(true);
              }
            }}
          />
        </Box>
      }
    >
      <InfoIcon sx={{ fontSize: 14, color: "#aaa", cursor: "help" }} />
    </Tooltip>
  );
}

export default function DamageReceivedTable() {
  const { character, defenseBuffs, specialSkillLevels, passiveLevels, magicianSubClass } = useCharacter();

  const [monsterATT, setMonsterATT] = useState(630);
  const [monsterMATT, setMonsterMATT] = useState(480);
  const [monsterACC, setMonsterACC] = useState(250);
  const [monsterLevel, setMonsterLevel] = useState(125);
  const [powerUpEnabled, setPowerUpEnabled] = useState(false);
  const [magicUpEnabled, setMagicUpEnabled] = useState(false);
  const [selectedMob, setSelectedMob] = useState<MobListEntry | null>(null);
  const [mobIcon, setMobIcon] = useState<string | null>(null);
  const [mobModalOpen, setMobModalOpen] = useState(false);
  const [selectedSubRegion, setSelectedSubRegion] = useState<string | null>(null);
  const [mobSearchText, setMobSearchText] = useState("");
  const [mobWzData, setMobWzData] = useState<Record<string, MobWzEntry> | null>(null);

  // WZ 데이터 동적 로드
  useEffect(() => {
    loadMobWzData().then(setMobWzData);
  }, []);

  const job = character.getJob();
  const jobEngName = job?.engName ?? "";

  const handleMobSelect = useCallback(async (mob: MobListEntry | null, save = true) => {
    setSelectedMob(mob);
    setMobIcon(null);
    if (!mob) return;

    if (save && jobEngName) saveSelectedMobId(jobEngName, mob.id);

    // WZ 데이터 동적 로드 후 우선 사용, 없으면 API 폴백
    const wzData = await loadMobWzData();
    const wzEntry = wzData[String(mob.id)];
    if (wzEntry) {
      if (wzEntry.PADamage !== undefined) setMonsterATT(wzEntry.PADamage);
      if (wzEntry.MADamage !== undefined) setMonsterMATT(wzEntry.MADamage);
      if (wzEntry.acc !== undefined) setMonsterACC(wzEntry.acc);
      setMonsterLevel(mob.level);
    } else {
      const details = await fetchMobDetails(mob.id);
      if (details) {
        setMonsterATT(details.meta.physicalDamage);
        setMonsterMATT(details.meta.magicDamage);
        setMonsterACC(details.meta.accuracy);
        setMonsterLevel(details.meta.level);
      }
    }

    const iconUrl = await fetchMobIcon(mob.id);
    if (iconUrl) setMobIcon(iconUrl);
  }, [jobEngName]);

  const handleMobSelectFromModal = useCallback(async (mob: MobListEntry) => {
    setMobModalOpen(false);
    setMobSearchText("");
    await handleMobSelect(mob);
  }, [handleMobSelect]);

  // 직업 변경 시 저장된 몬스터 로드
  const prevJobRef = useRef(jobEngName);
  useEffect(() => {
    if (!jobEngName) return;
    // 초기 로드 또는 직업 변경 시
    if (prevJobRef.current !== jobEngName || !selectedMob) {
      prevJobRef.current = jobEngName;
      const savedMobId = getSelectedMobId(jobEngName);
      if (savedMobId !== null) {
        const mob = mobList.find(m => m.id === savedMobId);
        if (mob) handleMobSelect(mob, false);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobEngName]);

  // 모달 내 표시할 몬스터 목록
  const filteredModalMobs = useMemo(() => {
    if (mobSearchText) {
      const lower = mobSearchText.toLowerCase();
      return mobList.filter(m =>
        m.koreanName.includes(lower) || m.name.toLowerCase().includes(lower)
      ).slice(0, 50);
    }
    if (selectedSubRegion) {
      return mobsByRegion.get(selectedSubRegion) ?? [];
    }
    return [];
  }, [mobSearchText, selectedSubRegion]);

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
    const results: { name: string; icon: string; level: number; damR: number; types: DamageType[]; halfOnBoss?: boolean }[] = [];
    // 마법사: 선택한 서브직업의 스킬만 적용
    const mageActiveSkills = isMagician
      ? MAGICIAN_SUBCLASS_SKILLS[(magicianSubClass ?? "썬콜") as MagicianSubClass] ?? []
      : null;

    for (const skill of skills) {
      const level = specialSkillLevels[skill.englishName] ?? 0;
      if (level === 0) continue;

      if (skill.excludeWeaponTypes && weaponType && skill.excludeWeaponTypes.includes(weaponType)) continue;
      if (skill.requireWeaponTypes && (!weaponType || !skill.requireWeaponTypes.includes(weaponType))) continue;
      if (mageActiveSkills && !mageActiveSkills.includes(skill.englishName)) continue;

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
          halfOnBoss: (skill as unknown as Record<string, unknown>).halfOnBoss as boolean | undefined,
        });
      }
    }
    return results;
  }, [jobEngName, specialSkillLevels, weaponType, isMagician, magicianSubClass]);

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

  /** 특정 데미지 타입에 적용되는 스킬 목록 반환 (메소가드 제외) */
  const getAppliedSkills = useCallback((dmgType: DamageType) => {
    return activeReductions.filter(r => r.types.includes(dmgType)).map(r => ({
      name: r.name,
      icon: r.icon,
      level: r.level,
    }));
  }, [activeReductions]);

  /** 특정 데미지 타입에 적용되는 스킬 감소 multiplier (메소가드 제외) */
  const getReductionMultiplier = useCallback((dmgType: DamageType) => {
    const isBoss = selectedMob?.isBoss ?? false;
    let multiplier = 1;
    for (const r of activeReductions) {
      if (r.types.includes(dmgType)) {
        const damR = (r.halfOnBoss && isBoss) ? r.damR / 2 : r.damR;
        multiplier *= (1 - damR / 100);
      }
    }
    return multiplier;
  }, [activeReductions, selectedMob?.isBoss]);

  /** 데미지 타입에 따른 PowerUp/MagicUp 배율 (보스: 1.3, 일반: 1.15) */
  const getPowerUpMultiplier = useCallback((dmgType: DamageType) => {
    const isBoss = selectedMob?.isBoss ?? false;
    const mult = isBoss ? POWER_UP_BOSS : POWER_UP_NORMAL;
    if (dmgType === "touch" || dmgType === "physical") return powerUpEnabled ? mult : 1;
    return magicUpEnabled ? mult : 1;
  }, [powerUpEnabled, magicUpEnabled, selectedMob?.isBoss]);

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

  // WZ 데이터 기반 스킬별 데미지 계산
  const skillResults = useMemo((): SkillDamageEntry[] => {
    if (!selectedMob || !mobWzData) return [];
    const wzEntry = mobWzData[String(selectedMob.id)];
    if (!wzEntry?.skills) return [];

    const entries: SkillDamageEntry[] = [];
    const skillKeys = Object.keys(wzEntry.skills).sort((a, b) => {
      const na = parseInt(a.replace(/\D/g, "")) || 0;
      const nb = parseInt(b.replace(/\D/g, "")) || 0;
      return a.replace(/\d/g, "").localeCompare(b.replace(/\d/g, "")) || na - nb;
    });

    for (const key of skillKeys) {
      const sk = wzEntry.skills[key];
      if (sk.magic === 1) {
        const att = wzEntry.MADamage ?? monsterMATT;
        const elemLabel = sk.elemAttr ? ELEM_LABELS[sk.elemAttr] ?? sk.elemAttr : "무";
        const dmgType: DamageType = sk.elemAttr ? (ELEM_TO_DAMAGE_TYPE[sk.elemAttr] ?? "magic") : "magic";
        const base = calcMagicDamage(att, mdef, isMagician, finalStats.totalStr, finalStats.totalDex, finalStats.totalLuk);
        entries.push({ name: key, names: [key], label: `${elemLabel}속성 마법`, result: applyModifiers(base, dmgType) });
      } else {
        // 물리 스킬: 자체 PADamage가 있는 경우만 표시 (없으면 접촉과 동일하거나 비데미지 스킬)
        if (!sk.PADamage) continue;
        const base = calcPhysicalDamage(sk.PADamage, wdef, stdPDD, stats.level, monsterLevel, isWarrior,
          finalStats.totalStr, finalStats.totalDex, finalStats.totalInt, finalStats.totalLuk);
        const elemLabel = sk.elemAttr ? `${ELEM_LABELS[sk.elemAttr] ?? sk.elemAttr}속성 ` : "";
        entries.push({ name: key, names: [key], label: `${elemLabel}물리`, result: applyModifiers(base, "physical") });
      }
    }

    // 동일 label + 동일 결과 중복 제거 (names는 합침)
    const deduped: SkillDamageEntry[] = [];
    for (const entry of entries) {
      const dup = deduped.find(d => d.label === entry.label && d.result.finalMin === entry.result.finalMin && d.result.finalMax === entry.result.finalMax);
      if (dup) {
        dup.names.push(...entry.names);
      } else {
        deduped.push(entry);
      }
    }
    return deduped;
  }, [selectedMob, mobWzData, monsterMATT, monsterLevel, wdef, mdef, stdPDD,
      stats.level, isWarrior, isMagician, finalStats, applyModifiers]);

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

  // 회피율 10당 증가량 (현재 상태에서 회피 10 올렸을 때 최종 회피확률 변화)
  const physEvaPer10 = useMemo(() => {
    if (monsterACC <= 0) return 0;
    const min = isThief ? 5 : 2;
    const max = isThief ? 95 : 80;
    const calcPhys = (eva: number) => {
      const base = Math.min(max, Math.max(min, eva / (4.5 * monsterACC) * 100));
      return totalSpecialEvaP > 0
        ? (1 - (1 - base / 100) * (1 - totalSpecialEvaP / 100)) * 100
        : base;
    };
    return calcPhys(totalEva + 10) - calcPhys(totalEva);
  }, [totalEva, monsterACC, isThief, totalSpecialEvaP]);

  const magicEvaPer10 = useMemo(() => {
    if (monsterACC <= 0 || totalEva <= 0) return 0;
    const min = isThief ? 5 : 2;
    const max = isThief ? 95 : 80;
    const calcMagic = (eva: number) => {
      const base = Math.min(max, Math.max(min, (10 / 9 - monsterACC / (0.9 * eva)) * 100));
      return totalSpecialEvaP > 0
        ? (1 - (1 - base / 100) * (1 - totalSpecialEvaP / 100)) * 100
        : base;
    };
    return calcMagic(totalEva + 10) - calcMagic(totalEva);
  }, [totalEva, monsterACC, isThief, totalSpecialEvaP]);

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
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5, p: 1.5, borderBottom: "1px solid #ccc" }}>
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          피격/회피 계산기
        </Typography>
        <Typography variant="caption" sx={{ ml: 0.5, color: "text.secondary" }}>
          (오차가 있을 수 있습니다.)
        </Typography>
      </Box>

      {/* 상단: 몬스터 정보 */}
      <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 1 }}>
        {/* 몬스터 아이콘 — 클릭으로 모달 열기 */}
        <Box
          onClick={() => setMobModalOpen(true)}
          sx={{
            display: "flex", flexDirection: "column", alignItems: "center",
            cursor: "pointer", py: 1,
            "&:hover": { bgcolor: "#eee" }, borderRadius: 1,
          }}
        >
          {mobIcon ? (
            <img
              src={mobIcon}
              alt={selectedMob?.koreanName ?? ""}
              style={{ width: 96, height: 96, objectFit: "contain" }}
            />
          ) : (
            <Box sx={{
              width: 96, height: 96, bgcolor: "#ddd", borderRadius: 1,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <SearchIcon sx={{ color: "#999" }} />
            </Box>
          )}
          <Typography variant="caption" sx={{ mt: 0.5, color: "#666" }}>
            {selectedMob
              ? `Lv.${selectedMob.level} ${selectedMob.koreanName || selectedMob.name}`
              : "몬스터를 선택하세요"}
          </Typography>
        </Box>
        {/* 파워업 / 매직업 버튼 */}
        <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 1 }}>
          <Button
            size="small"
            variant={powerUpEnabled ? "contained" : "outlined"}
            onClick={() => setPowerUpEnabled(!powerUpEnabled)}
            sx={{ minWidth: 0, px: 1.5, py: 0.25, fontSize: "0.75rem", textTransform: "none" }}
          >
            파워업
          </Button>
          <Button
            size="small"
            variant={magicUpEnabled ? "contained" : "outlined"}
            onClick={() => setMagicUpEnabled(!magicUpEnabled)}
            sx={{ minWidth: 0, px: 1.5, py: 0.25, fontSize: "0.75rem", textTransform: "none" }}
          >
            매직업
          </Button>
          <Tooltip title="파워업과 매직업은 1단계, 2단계가 있으며 각각 최종데미지를 1.15배, 1.3배 증폭시킵니다. 일반몬스터는 1단계, 보스몬스터는 2단계를 시전하는것으로 '추정'됩니다." arrow placement="top">
            <InfoIcon sx={{ fontSize: 14, color: "#aaa", cursor: "help" }} />
          </Tooltip>
        </Box>
      </Box>

      <Divider />

      {/* 피격 데미지 섹션 */}
      <DamageResultSection
        label="접촉 데미지"
        result={physicalResult}
        appliedSkills={getAppliedSkills("touch")}
      />
      {skillResults.map((entry) => {
        // 각 스킬 데미지에 적용된 특수 스킬 찾기
        const dmgType = entry.label.includes("물리") ? "physical" :
                       entry.label.includes("불속성") ? "fire" :
                       entry.label.includes("얼음속성") ? "ice" :
                       entry.label.includes("번개속성") ? "lightning" :
                       entry.label.includes("독속성") ? "poison" : "magic";
        return (
          <DamageResultSection
            key={entry.name}
            label={`스킬 - ${entry.label}`}
            result={entry.result}
            appliedSkills={getAppliedSkills(dmgType)}
            endAdornment={selectedMob ? <>{entry.names.map(name => (
              <SkillAnimationTooltip key={`${selectedMob.id}-${name}`} mobId={selectedMob.id} skillName={name} />
            ))}</> : undefined}
          />
        );
      })}

      {/* 회피확률 */}
      <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          회피확률
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <Typography variant="body2">물리 회피확률</Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
            {monsterACC > 0 && (
              <Typography variant="caption" sx={{ color: physEvaPer10 > 0 ? "success.main" : "text.disabled" }}>
                회피율 10당 {physEvaPer10.toFixed(2)}%
              </Typography>
            )}
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              {combinedPhysEva.toFixed(1)}%
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <Typography variant="body2">마법 회피확률</Typography>
          <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
            {monsterACC > 0 && (
              <Typography variant="caption" sx={{ color: magicEvaPer10 > 0 ? "success.main" : "text.disabled" }}>
                회피율 10당 {magicEvaPer10.toFixed(2)}%
              </Typography>
            )}
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              {combinedMagicEva.toFixed(1)}%
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* 몬스터 선택 모달 */}
      <Dialog open={mobModalOpen} onClose={() => setMobModalOpen(false)} maxWidth="md" fullWidth>
        <DialogContent sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 1 }}>
          {/* 상단: 검색 + 닫기 */}
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <TextField
              size="small"
              fullWidth
              placeholder="이름 검색..."
              value={mobSearchText}
              onChange={(e) => { setMobSearchText(e.target.value); setSelectedSubRegion(null); }}
              sx={{
                "& .MuiOutlinedInput-root": { height: 32 },
                "& .MuiInputBase-input": { fontSize: "0.8rem" },
              }}
            />
            <IconButton size="small" onClick={() => setMobModalOpen(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          {/* 지역 필터 — 카테고리별 한 줄씩 (라벨 + 서브지역 버튼) */}
          {REGION_CATEGORIES.map((cat) => (
            <Box key={cat.name} sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", alignItems: "center" }}>
              <Typography variant="caption" sx={{ width: 60, flexShrink: 0, color: "#666", fontWeight: "bold", fontSize: "0.7rem" }}>
                {cat.name}
              </Typography>
              {cat.regions.map((region) => (
                <Button
                  key={region}
                  size="small"
                  variant={selectedSubRegion === region ? "contained" : "outlined"}
                  onClick={() => {
                    setSelectedSubRegion(selectedSubRegion === region ? null : region);
                    setMobSearchText("");
                  }}
                  sx={{ minWidth: "auto", px: 1, py: 0.125, fontSize: "0.7rem", textTransform: "none" }}
                >
                  {region}
                </Button>
              ))}
            </Box>
          ))}
          <Divider />
          {/* 몬스터 그리드 */}
          <Box sx={{ maxHeight: 450, overflow: "auto" }}>
            {filteredModalMobs.length > 0 ? (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {filteredModalMobs.map((mob) => (
                  <Tooltip
                    key={mob.id}
                    title={`Lv.${mob.level} ${mob.koreanName || mob.name}`}
                    arrow
                    placement="top"
                  >
                    <Box
                      onClick={() => handleMobSelectFromModal(mob)}
                      sx={{
                        width: 44, height: 44,
                        border: selectedMob?.id === mob.id ? "2px solid #1976d2" : "1px solid #ddd",
                        borderRadius: 1,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer",
                        bgcolor: selectedMob?.id === mob.id ? "#e3f2fd" : "#fff",
                        "&:hover": { bgcolor: "#f0f7ff", borderColor: "#1976d2" },
                        overflow: "hidden",
                        position: "relative",
                        "@keyframes spin": { to: { transform: "rotate(360deg)" } },
                      }}
                    >
                      <Box sx={{
                        position: "absolute",
                        width: 14, height: 14,
                        border: "2px solid #e0e0e0",
                        borderTopColor: "#999",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                      }} />
                      <img
                        src={`https://maplestory.io/api/gms/62/mob/${mob.id}/icon`}
                        alt={mob.koreanName || mob.name}
                        style={{ maxWidth: 40, maxHeight: 40, objectFit: "contain", position: "relative" }}
                        loading="lazy"
                        onLoad={(e) => {
                          const spinner = e.currentTarget.previousElementSibling as HTMLElement;
                          if (spinner) spinner.style.display = "none";
                        }}
                        onError={(e) => {
                          const img = e.currentTarget;
                          if (img.src.includes("/gms/62/")) {
                            img.src = `https://maplestory.io/api/gms/200/mob/${mob.id}/icon`;
                          } else if (img.src.includes("/gms/200/")) {
                            img.src = `https://maplestory.io/api/kms/284/mob/${mob.id}/icon`;
                          }
                        }}
                      />
                    </Box>
                  </Tooltip>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: "#999", textAlign: "center", py: 4 }}>
                {mobSearchText ? "검색 결과가 없습니다" : "지역을 선택하세요"}
              </Typography>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
