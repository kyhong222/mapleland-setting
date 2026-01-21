import { Box, Typography, TextField, Divider } from "@mui/material";
import { useCharacter } from "../contexts/CharacterContext";
import { useMemo } from "react";

export default function StatTable() {
  const { character, setLevel, setPureStat, buff1Attack, buff2Attack, buffMAD, heroEchoEnabled } = useCharacter();

  const stats = character.getStats();
  const job = character.getJob();
  const finalStats = character.getFinalStats(buff1Attack, buff2Attack);
  const equipStats = character.getEquipmentStats();
  const buffStats = character.getBuffStats(buff1Attack, buff2Attack);
  const isJobMagician = job?.engName === "magician";

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
    if (job && job.mainStat === stat) return;
    const numValue = Math.max(4, parseInt(value) || 4);
    setPureStat(stat, numValue);
  };

  const isMainStat = (stat: string) => job?.mainStat === stat;

  // 추가 스탯 계산 (장비 + 버프 + 메이플용사)
  const getAddedStat = (stat: "str" | "dex" | "int" | "luk") => {
    const pureKey = `pure${stat.charAt(0).toUpperCase() + stat.slice(1)}` as keyof typeof stats;
    const totalKey = `total${stat.charAt(0).toUpperCase() + stat.slice(1)}` as keyof typeof finalStats;
    return (finalStats[totalKey] as number) - (calculatedStats[pureKey] as number);
  };

  return (
    <Box
      sx={{
        width: 320,
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
        {/* 레벨 & AP */}
        <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Typography variant="body2" sx={{ minWidth: 50 }}>
              레벨
            </Typography>
            <TextField
              type="number"
              size="small"
              value={stats.level}
              onChange={(e) => handleLevelChange(e.target.value)}
              sx={{
                width: 70,
                "& .MuiInputBase-input": {
                  textAlign: "center",
                  bgcolor: "white",
                  p: 0.5,
                },
              }}
            />
          </Box>
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <Typography variant="body2" sx={{ minWidth: 50 }}>
              AP
            </Typography>
            <TextField
              type="number"
              size="small"
              value={totalAP}
              InputProps={{ readOnly: true }}
              sx={{
                width: 70,
                "& .MuiInputBase-input": {
                  textAlign: "center",
                  bgcolor: "#f0f0f0",
                  p: 0.5,
                },
              }}
            />
          </Box>
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* 힘 */}
        <Box sx={{ display: "grid", gridTemplateColumns: "80px 60px 60px 60px", gap: 1, alignItems: "center" }}>
          <Typography variant="body2" sx={{ fontWeight: isMainStat("str") ? "bold" : "normal" }}>
            힘 (STR)
          </Typography>
          <TextField
            type="number"
            size="small"
            value={calculatedStats.pureStr}
            onChange={(e) => handlePureStatChange("str", e.target.value)}
            disabled={isMainStat("str")}
            sx={{
              "& .MuiInputBase-input": {
                textAlign: "center",
                bgcolor: isMainStat("str") ? "#f0f0f0" : "white",
                p: 0.5,
                fontSize: "0.875rem",
              },
            }}
          />
          <Typography variant="body2" sx={{ textAlign: "center", fontSize: "0.875rem" }}>
            {getAddedStat("str")}
          </Typography>
          <Typography variant="body2" sx={{ textAlign: "center", fontSize: "0.875rem", fontWeight: "bold" }}>
            {finalStats.totalStr}
          </Typography>
        </Box>

        {/* 민첩 */}
        <Box sx={{ display: "grid", gridTemplateColumns: "80px 60px 60px 60px", gap: 1, alignItems: "center" }}>
          <Typography variant="body2" sx={{ fontWeight: isMainStat("dex") ? "bold" : "normal" }}>
            민첩 (DEX)
          </Typography>
          <TextField
            type="number"
            size="small"
            value={calculatedStats.pureDex}
            onChange={(e) => handlePureStatChange("dex", e.target.value)}
            disabled={isMainStat("dex")}
            sx={{
              "& .MuiInputBase-input": {
                textAlign: "center",
                bgcolor: isMainStat("dex") ? "#f0f0f0" : "white",
                p: 0.5,
                fontSize: "0.875rem",
              },
            }}
          />
          <Typography variant="body2" sx={{ textAlign: "center", fontSize: "0.875rem" }}>
            {getAddedStat("dex")}
          </Typography>
          <Typography variant="body2" sx={{ textAlign: "center", fontSize: "0.875rem", fontWeight: "bold" }}>
            {finalStats.totalDex}
          </Typography>
        </Box>

        {/* 지력 */}
        <Box sx={{ display: "grid", gridTemplateColumns: "80px 60px 60px 60px", gap: 1, alignItems: "center" }}>
          <Typography variant="body2" sx={{ fontWeight: isMainStat("int") ? "bold" : "normal" }}>
            지력 (INT)
          </Typography>
          <TextField
            type="number"
            size="small"
            value={calculatedStats.pureInt}
            onChange={(e) => handlePureStatChange("int", e.target.value)}
            disabled={isMainStat("int")}
            sx={{
              "& .MuiInputBase-input": {
                textAlign: "center",
                bgcolor: isMainStat("int") ? "#f0f0f0" : "white",
                p: 0.5,
                fontSize: "0.875rem",
              },
            }}
          />
          <Typography variant="body2" sx={{ textAlign: "center", fontSize: "0.875rem" }}>
            {getAddedStat("int")}
          </Typography>
          <Typography variant="body2" sx={{ textAlign: "center", fontSize: "0.875rem", fontWeight: "bold" }}>
            {finalStats.totalInt}
          </Typography>
        </Box>

        {/* 행운 */}
        <Box sx={{ display: "grid", gridTemplateColumns: "80px 60px 60px 60px", gap: 1, alignItems: "center" }}>
          <Typography variant="body2" sx={{ fontWeight: isMainStat("luk") ? "bold" : "normal" }}>
            행운 (LUK)
          </Typography>
          <TextField
            type="number"
            size="small"
            value={calculatedStats.pureLuk}
            onChange={(e) => handlePureStatChange("luk", e.target.value)}
            disabled={isMainStat("luk")}
            sx={{
              "& .MuiInputBase-input": {
                textAlign: "center",
                bgcolor: isMainStat("luk") ? "#f0f0f0" : "white",
                p: 0.5,
                fontSize: "0.875rem",
              },
            }}
          />
          <Typography variant="body2" sx={{ textAlign: "center", fontSize: "0.875rem" }}>
            {getAddedStat("luk")}
          </Typography>
          <Typography variant="body2" sx={{ textAlign: "center", fontSize: "0.875rem", fontWeight: "bold" }}>
            {finalStats.totalLuk}
          </Typography>
        </Box>

        <Divider sx={{ my: 1 }} />

        {/* 공격력 / 마력 */}
        <Box sx={{ display: "grid", gridTemplateColumns: "80px 60px 60px 60px", gap: 1, alignItems: "center" }}>
          <Typography variant="body2" sx={{ fontWeight: "bold" }}>
            {isJobMagician ? "순수 마력" : "공격력"}
          </Typography>
          {isJobMagician ? (() => {
              const pureMad = (equipStats.mad || 0) + (buffMAD || 0);
              const heroEchoBonus = heroEchoEnabled ? Math.floor(pureMad * 0.04) : 0;
              const buffWithBonus = (buffMAD || 0) + heroEchoBonus;
              const totalMad = (equipStats.mad || 0) + buffWithBonus;
              return (
                <>
                  <Typography variant="body2" sx={{ textAlign: "center", fontSize: "0.875rem" }}>
                    {equipStats.mad}
                  </Typography>
                  <Typography variant="body2" sx={{ textAlign: "center", fontSize: "0.875rem" }}>
                    {buffWithBonus}
                  </Typography>
                  <Typography variant="body2" sx={{ textAlign: "center", fontSize: "0.875rem", fontWeight: "bold" }}>
                    {totalMad}
                  </Typography>
                </>
              );
            })() : (
            <>
              <Typography variant="body2" sx={{ textAlign: "center", fontSize: "0.875rem" }}>
                {equipStats.attack}
              </Typography>
              <Typography variant="body2" sx={{ textAlign: "center", fontSize: "0.875rem" }}>
                {buffStats.attack}
              </Typography>
              <Typography variant="body2" sx={{ textAlign: "center", fontSize: "0.875rem", fontWeight: "bold" }}>
                {finalStats.totalAttack}
              </Typography>
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
}
