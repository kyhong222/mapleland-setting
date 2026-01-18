import { Box, Typography, TextField } from "@mui/material";
import { useCharacter } from "../contexts/CharacterContext";
import { useMemo } from "react";

export default function StatTable() {
  const { character, setLevel, setPureStat, buff1Attack, buff2Attack } = useCharacter();

  const stats = character.getStats();
  const job = character.getJob();
  const finalStats = character.getFinalStats(buff1Attack, buff2Attack);

  // 총 AP 계산
  const totalAP = useMemo(() => {
    return 20 + stats.level * 5 + (stats.level >= 70 ? 5 : 0) + (stats.level >= 120 ? 5 : 0);
  }, [stats.level]);

  // 주스탯 자동 계산
  const calculatedStats = useMemo(() => {
    if (!job) {
      return stats;
    }

    const mainStatKey = job.mainStat;
    const otherStats = ["str", "dex", "int", "luk"].filter((s) => s !== mainStatKey);
    const otherStatsSum = otherStats.reduce((sum, stat) => {
      const pureKey = `pure${stat.charAt(0).toUpperCase() + stat.slice(1)}` as keyof typeof stats;
      return sum + (stats[pureKey] as number);
    }, 0);

    const mainStatValue = totalAP - otherStatsSum;
    const pureMainKey = `pure${mainStatKey.charAt(0).toUpperCase() + mainStatKey.slice(1)}` as keyof typeof stats;

    return {
      ...stats,
      [pureMainKey]: mainStatValue,
    };
  }, [job, stats, totalAP]);

  const handleLevelChange = (value: string) => {
    const numValue = Math.max(1, parseInt(value) || 1);
    setLevel(numValue);
  };

  const handlePureStatChange = (stat: "str" | "dex" | "int" | "luk", value: string) => {
    if (job && job.mainStat === stat) return; // 주스탯은 수정 불가
    const numValue = Math.max(4, parseInt(value) || 4);
    setPureStat(stat, numValue);
  };

  const isMainStat = (stat: string) => job?.mainStat === stat;

  return (
    <Box
      sx={{
        width: 300,
        border: "1px solid #ccc",
        borderRadius: 1,
        bgcolor: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 타이틀 */}
      <Typography variant="body2" sx={{ fontWeight: "bold", p: 1.5, borderBottom: "1px solid #ccc" }}>
        스탯
      </Typography>

      {/* 스탯 내용 */}
      <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
        {/* 레벨 */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="body2">레벨</Typography>
          <TextField
            type="number"
            size="small"
            value={stats.level}
            onChange={(e) => handleLevelChange(e.target.value)}
            sx={{
              width: 80,
              "& .MuiInputBase-input": {
                textAlign: "right",
                bgcolor: "white",
              },
            }}
          />
        </Box>

        {/* AP */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="body2">AP</Typography>
          <Typography variant="body2">{totalAP}</Typography>
        </Box>

        <Box sx={{ borderTop: "1px solid #ddd", my: 1 }} />

        {/* 힘 */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="body2" sx={{ fontWeight: isMainStat("str") ? "bold" : "normal" }}>
            힘 (STR)
          </Typography>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <TextField
              type="number"
              size="small"
              value={calculatedStats.pureStr}
              onChange={(e) => handlePureStatChange("str", e.target.value)}
              disabled={isMainStat("str")}
              sx={{
                width: 60,
                "& .MuiInputBase-input": {
                  textAlign: "right",
                  bgcolor: isMainStat("str") ? "#f0f0f0" : "white",
                },
              }}
            />
            <Typography variant="body2" sx={{ minWidth: 40, textAlign: "right" }}>
              {finalStats.totalStr}
            </Typography>
          </Box>
        </Box>

        {/* 민첩 */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="body2" sx={{ fontWeight: isMainStat("dex") ? "bold" : "normal" }}>
            민첩 (DEX)
          </Typography>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <TextField
              type="number"
              size="small"
              value={calculatedStats.pureDex}
              onChange={(e) => handlePureStatChange("dex", e.target.value)}
              disabled={isMainStat("dex")}
              sx={{
                width: 60,
                "& .MuiInputBase-input": {
                  textAlign: "right",
                  bgcolor: isMainStat("dex") ? "#f0f0f0" : "white",
                },
              }}
            />
            <Typography variant="body2" sx={{ minWidth: 40, textAlign: "right" }}>
              {finalStats.totalDex}
            </Typography>
          </Box>
        </Box>

        {/* 지력 */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="body2" sx={{ fontWeight: isMainStat("int") ? "bold" : "normal" }}>
            지력 (INT)
          </Typography>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <TextField
              type="number"
              size="small"
              value={calculatedStats.pureInt}
              onChange={(e) => handlePureStatChange("int", e.target.value)}
              disabled={isMainStat("int")}
              sx={{
                width: 60,
                "& .MuiInputBase-input": {
                  textAlign: "right",
                  bgcolor: isMainStat("int") ? "#f0f0f0" : "white",
                },
              }}
            />
            <Typography variant="body2" sx={{ minWidth: 40, textAlign: "right" }}>
              {finalStats.totalInt}
            </Typography>
          </Box>
        </Box>

        {/* 행운 */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="body2" sx={{ fontWeight: isMainStat("luk") ? "bold" : "normal" }}>
            행운 (LUK)
          </Typography>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <TextField
              type="number"
              size="small"
              value={calculatedStats.pureLuk}
              onChange={(e) => handlePureStatChange("luk", e.target.value)}
              disabled={isMainStat("luk")}
              sx={{
                width: 60,
                "& .MuiInputBase-input": {
                  textAlign: "right",
                  bgcolor: isMainStat("luk") ? "#f0f0f0" : "white",
                },
              }}
            />
            <Typography variant="body2" sx={{ minWidth: 40, textAlign: "right" }}>
              {finalStats.totalLuk}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ borderTop: "1px solid #ddd", my: 1 }} />

        {/* 공격력 */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            공격력
          </Typography>
          <Typography variant="body2">{finalStats.totalAttack}</Typography>
        </Box>
      </Box>
    </Box>
  );
}
