import { Box, Typography, TextField } from "@mui/material";
import { useState, useMemo } from "react";
import type { Stats } from "../types/stats";
import { JOBS } from "../types/job";
import mapleWarriorData from "../data/buff/MapleWarrior/MapleWarrior.json";

interface StatTableProps {
  stats?: Stats;
  onStatsChange?: (stats: Stats) => void;
  selectedJob: string;
  mapleWarriorLevel: number;
  buff1Attack: number;
  buff2Attack: number;
  heroEchoEnabled: boolean;
}

export default function StatTable({
  stats,
  onStatsChange,
  selectedJob,
  mapleWarriorLevel,
  buff1Attack,
  buff2Attack,
  heroEchoEnabled,
}: StatTableProps) {
  const [localStats, setLocalStats] = useState<Stats>({
    level: 1,
    pureStr: 4,
    pureDex: 4,
    pureInt: 4,
    pureLuk: 4,
    equipStr: 0,
    equipDex: 0,
    equipInt: 0,
    equipLuk: 0,
    equipAttack: 0,
    buffStr: 0,
    buffDex: 0,
    buffInt: 0,
    buffLuk: 0,
    buffAttack: 0,
  });

  const baseStats = stats || localStats;

  // 현재 직업 정보 가져오기
  const currentJob = JOBS.find((job) => job.engName === selectedJob);
  const mainStatKey = currentJob
    ? (`pure${currentJob.mainStat.charAt(0).toUpperCase() + currentJob.mainStat.slice(1)}` as keyof Stats)
    : null;

  // 총 AP 계산
  const totalAP = 20 + baseStats.level * 5 + (baseStats.level >= 70 ? 5 : 0) + (baseStats.level >= 120 ? 5 : 0);

  // 주스탯을 자동 계산하여 포함한 최종 스탯
  const currentStats = useMemo(() => {
    if (!mainStatKey) return baseStats;

    const otherStats = ["pureStr", "pureDex", "pureInt", "pureLuk"].filter((s) => s !== mainStatKey);
    const otherStatsSum = otherStats.reduce((sum, stat) => sum + (baseStats[stat as keyof Stats] as number), 0);
    const newMainStat = totalAP - otherStatsSum;

    return { ...baseStats, [mainStatKey]: newMainStat };
  }, [baseStats, mainStatKey, totalAP]);

  // 메이플용사 효과 계산
  const mapleWarriorEffect = mapleWarriorData.table.find((item) => item.level === mapleWarriorLevel);
  const mapleWarriorBonus = mapleWarriorEffect ? mapleWarriorEffect.x / 100 : 0;

  // 공격력 계산: (장비공격력 + 버프1 + 버프2) * 영웅의메아리
  const totalBuffAttack = buff1Attack + buff2Attack;
  const heroEchoMultiplier = heroEchoEnabled ? 1.04 : 1;
  const totalAttackBeforeEcho = currentStats.equipAttack + totalBuffAttack;
  const finalAttack = Math.floor(totalAttackBeforeEcho * heroEchoMultiplier);
  const heroEchoBonus = heroEchoEnabled ? Math.floor(totalAttackBeforeEcho * 0.04) : 0;

  const handleLevelChange = (value: string) => {
    const numValue = Math.max(1, parseInt(value) || 1);
    const newBaseStats = { ...baseStats, level: numValue };

    // 주스탯 계산
    if (mainStatKey) {
      const otherStats = ["pureStr", "pureDex", "pureInt", "pureLuk"].filter((s) => s !== mainStatKey);
      const otherStatsSum = otherStats.reduce((sum, stat) => sum + (newBaseStats[stat as keyof Stats] as number), 0);
      const newTotalAP = 20 + numValue * 5 + (numValue >= 70 ? 5 : 0) + (numValue >= 120 ? 5 : 0);
      const newMainStat = newTotalAP - otherStatsSum;

      const newStats = { ...newBaseStats, [mainStatKey]: newMainStat };
      setLocalStats(newStats);
      onStatsChange?.(newStats);
    } else {
      setLocalStats(newBaseStats);
      onStatsChange?.(newBaseStats);
    }
  };

  const handlePureStatChange = (stat: "pureStr" | "pureDex" | "pureInt" | "pureLuk", value: string) => {
    if (!mainStatKey || stat === mainStatKey) return; // 주스탯은 직접 수정 불가

    const numValue = Math.max(4, parseInt(value) || 4);
    const otherStats = ["pureStr", "pureDex", "pureInt", "pureLuk"].filter((s) => s !== mainStatKey && s !== stat);
    const otherStatsSum = otherStats.reduce((sum, s) => sum + (baseStats[s as keyof Stats] as number), 0);
    const newMainStat = totalAP - numValue - otherStatsSum;

    const newStats = { ...baseStats, [stat]: numValue, [mainStatKey]: newMainStat };
    setLocalStats(newStats);
    onStatsChange?.(newStats);
  };

  const statRows = [
    {
      name: "공격력",
      col1: currentStats.equipAttack,
      col2: totalBuffAttack + heroEchoBonus,
      col3: finalAttack,
      isAttack: true,
    },
    {
      name: "힘",
      col1: currentStats.pureStr,
      col2:
        currentStats.equipStr +
        currentStats.buffStr +
        Math.floor((currentStats.pureStr + currentStats.equipStr) * mapleWarriorBonus),
      col3:
        currentStats.pureStr +
        currentStats.equipStr +
        currentStats.buffStr +
        Math.floor((currentStats.pureStr + currentStats.equipStr) * mapleWarriorBonus),
      isAttack: false,
      statKey: "pureStr" as const,
      statType: "str" as const,
    },
    {
      name: "민첩",
      col1: currentStats.pureDex,
      col2:
        currentStats.equipDex +
        currentStats.buffDex +
        Math.floor((currentStats.pureDex + currentStats.equipDex) * mapleWarriorBonus),
      col3:
        currentStats.pureDex +
        currentStats.equipDex +
        currentStats.buffDex +
        Math.floor((currentStats.pureDex + currentStats.equipDex) * mapleWarriorBonus),
      isAttack: false,
      statKey: "pureDex" as const,
      statType: "dex" as const,
    },
    {
      name: "지력",
      col1: currentStats.pureInt,
      col2:
        currentStats.equipInt +
        currentStats.buffInt +
        Math.floor((currentStats.pureInt + currentStats.equipInt) * mapleWarriorBonus),
      col3:
        currentStats.pureInt +
        currentStats.equipInt +
        currentStats.buffInt +
        Math.floor((currentStats.pureInt + currentStats.equipInt) * mapleWarriorBonus),
      isAttack: false,
      statKey: "pureInt" as const,
      statType: "int" as const,
    },
    {
      name: "행운",
      col1: currentStats.pureLuk,
      col2:
        currentStats.equipLuk +
        currentStats.buffLuk +
        Math.floor((currentStats.pureLuk + currentStats.equipLuk) * mapleWarriorBonus),
      col3:
        currentStats.pureLuk +
        currentStats.equipLuk +
        currentStats.buffLuk +
        Math.floor((currentStats.pureLuk + currentStats.equipLuk) * mapleWarriorBonus),
      isAttack: false,
      statKey: "pureLuk" as const,
      statType: "luk" as const,
    },
  ];

  return (
    <Box
      sx={{
        width: 300,
        flex: 1,
        border: "1px solid #ccc",
        borderRadius: 1,
        display: "flex",
        flexDirection: "column",
        bgcolor: "#f5f5f5",
        p: 2,
      }}
    >
      <Box sx={{ mb: 2 }}>
        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              flex: 1,
              display: "grid",
              gridTemplateColumns: "1fr 2fr",
              gap: 0.2,
              alignItems: "center",
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: "bold", fontSize: "0.7rem" }}>
              레벨:
            </Typography>
            <TextField
              type="number"
              value={currentStats.level}
              onChange={(e) => handleLevelChange(e.target.value)}
              size="small"
              inputProps={{ min: 1 }}
              sx={{
                "& .MuiInputBase-input": {
                  p: 0.5,
                  fontSize: "0.75rem",
                  textAlign: "center",
                  bgcolor: "white",
                },
                "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
                  display: "none",
                },
                "& input[type=number]": {
                  MozAppearance: "textfield",
                },
              }}
            />
          </Box>
          <Box
            sx={{
              flex: 1,
              display: "grid",
              gridTemplateColumns: "1fr 2fr",
              gap: 0.2,
              alignItems: "center",
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: "bold", fontSize: "0.7rem" }}>
              스탯합:
            </Typography>
            <Box
              sx={{
                p: 0.5,
                bgcolor: "#f5f5f5",
                border: "1px solid #ddd",
                borderRadius: 1,
                textAlign: "center",
                fontSize: "0.75rem",
                color: "#999",
              }}
            >
              {totalAP}
            </Box>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {statRows.map((row) => {
          const isMainStat = !row.isAttack && currentJob?.mainStat === row.statType;
          const isSubStat = !row.isAttack && currentJob?.subStat === row.statType;

          return (
            <Box
              key={row.name}
              sx={{
                display: "grid",
                gridTemplateColumns: "80px 1fr 1fr 1fr",
                gap: 1,
                alignItems: "center",
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  fontWeight: isMainStat || isSubStat ? "bold" : "normal",
                }}
              >
                {isMainStat ? "* " : ""}
                {row.name}
              </Typography>
              {row.isAttack ? (
                <>
                  <Box
                    sx={{
                      p: 0.5,
                      bgcolor: "#f5f5f5",
                      border: "1px solid #ddd",
                      borderRadius: 1,
                      textAlign: "center",
                      fontSize: "0.875rem",
                      color: "#999",
                    }}
                  >
                    {row.col1}
                  </Box>
                  <Box
                    sx={{
                      p: 0.5,
                      bgcolor: "#f5f5f5",
                      border: "1px solid #ddd",
                      borderRadius: 1,
                      textAlign: "center",
                      fontSize: "0.875rem",
                      color: "#999",
                    }}
                  >
                    {row.col2}
                  </Box>
                  <Box
                    sx={{
                      p: 0.5,
                      bgcolor: "#e3f2fd",
                      border: "1px solid #90caf9",
                      borderRadius: 1,
                      textAlign: "center",
                      fontSize: "0.875rem",
                      fontWeight: "bold",
                    }}
                  >
                    {row.col3}
                  </Box>
                </>
              ) : (
                <>
                  <TextField
                    type="number"
                    value={row.col1}
                    onChange={(e) => handlePureStatChange(row.statKey!, e.target.value)}
                    size="small"
                    inputProps={{ min: 4 }}
                    sx={{
                      "& .MuiInputBase-input": {
                        p: 0.5,
                        fontSize: "0.875rem",
                        textAlign: "center",
                        bgcolor: "white",
                      },
                      "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
                        display: "none",
                      },
                      "& input[type=number]": {
                        MozAppearance: "textfield",
                      },
                    }}
                  />
                  <Box
                    sx={{
                      p: 0.5,
                      bgcolor: "#f5f5f5",
                      border: "1px solid #ddd",
                      borderRadius: 1,
                      textAlign: "center",
                      fontSize: "0.875rem",
                      color: "#999",
                    }}
                  >
                    {row.col2}
                  </Box>
                  <Box
                    sx={{
                      p: 0.5,
                      bgcolor: "#e3f2fd",
                      border: "1px solid #90caf9",
                      borderRadius: 1,
                      textAlign: "center",
                      fontSize: "0.875rem",
                      fontWeight: "bold",
                    }}
                  >
                    {row.col3}
                  </Box>
                </>
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
