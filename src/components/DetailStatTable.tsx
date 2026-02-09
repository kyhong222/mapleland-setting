import { Box, Typography, IconButton } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useCharacter } from "../contexts/CharacterContext";
import mastery1Data from "../data/buff/mastery/mastery1.json";

interface DetailStatTableProps {
  onClose: () => void;
}

export default function DetailStatTable({ onClose }: DetailStatTableProps) {
  const { character, buff1Attack, buff2Attack, masteryAttack, mastery1 } = useCharacter();
  const equipStats = character.getEquipmentStats();
  const finalStats = character.getFinalStats(buff1Attack, buff2Attack, masteryAttack);
  const job = character.getJob();

  // 마스터리1 명중률
  const mastery1Acc = mastery1Data.properties[mastery1]?.acc ?? 0;

  // 명중률: 장비 + 스탯 보정 + 마스터리
  const isArcherOrThief = job?.engName === "archer" || job?.engName === "thief";
  const statAcc = isArcherOrThief
    ? finalStats.totalDex * 0.6 + finalStats.totalLuk * 0.3
    : finalStats.totalDex * 0.8 + finalStats.totalLuk * 0.5;
  const totalAcc = equipStats.acc + statAcc + mastery1Acc;

  const statLines: { label: string; value: number }[] = [
    { label: "물리방어력", value: equipStats.pdef },
    { label: "마법방어력", value: equipStats.mdef },
    { label: "명중률", value: totalAcc },
    { label: "회피율", value: equipStats.eva },
    { label: "이동속도", value: equipStats.speed + 100 },
    { label: "점프력", value: equipStats.jump + 100 },
    { label: "추가 HP", value: equipStats.hp },
    { label: "추가 MP", value: equipStats.mp },
  ];

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
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 1.5,
          borderBottom: "1px solid #ccc",
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          상세 스탯
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ p: 0.5 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* 스탯 목록 */}
      <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
        {statLines.map(({ label, value }) => (
          <Box
            key={label}
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2">{label}</Typography>
            <Typography variant="body2" sx={{ fontWeight: "bold" }}>
              {Number.isInteger(value) ? value : value.toFixed(1)}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
