import { Box, Typography, TextField, IconButton } from "@mui/material";

const MAIN_STATS = [
  { key: "str", label: "STR" },
  { key: "dex", label: "DEX" },
  { key: "int", label: "INT" },
  { key: "luk", label: "LUK" },
  { key: "attack", label: "공격력" },
  { key: "mad", label: "마력" },
];

const SECONDARY_STATS = [
  { key: "pdef", label: "물방" },
  { key: "mdef", label: "마방" },
  { key: "acc", label: "명중" },
  { key: "eva", label: "회피" },
  { key: "speed", label: "이속" },
  { key: "jump", label: "점프" },
  { key: "hp", label: "HP" },
  { key: "mp", label: "MP" },
];

const REQUIRE_STAT_FIELDS = [
  { key: "level", label: "레벨" },
  { key: "str", label: "STR" },
  { key: "dex", label: "DEX" },
  { key: "int", label: "INT" },
  { key: "luk", label: "LUK" },
];

interface StatEditFormProps {
  editedStats: Record<string, number>;
  onChange: (statKey: string, value: number) => void;
  requireStats: { level: number; str: number; dex: number; int: number; luk: number };
  attackSpeed: number | null;
}

export default function StatEditForm({
  editedStats,
  onChange,
  requireStats,
  attackSpeed,
}: StatEditFormProps) {
  const renderStatRow = (stat: { key: string; label: string }) => {
    const value = editedStats[stat.key] || 0;
    return (
      <Box key={stat.key} sx={{ display: "flex", alignItems: "center", gap: 0.3, mb: 0.3 }}>
        <Typography sx={{ width: 45, fontSize: "0.75rem" }}>{stat.label}</Typography>
        <TextField
          type="number"
          size="small"
          value={value}
          onChange={(e) => onChange(stat.key, parseInt(e.target.value) || 0)}
          sx={{
            width: 55,
            "& .MuiInputBase-input": { textAlign: "right", p: "2px 4px", fontSize: "0.75rem" },
          }}
        />
        <IconButton
          size="small"
          onClick={() => onChange(stat.key, value + 1)}
          sx={{ p: 1, width: 18, height: 18, fontSize: "0.7rem", border: "solid 1px #ccc", fontWeight: "bold" }}
        >
          +
        </IconButton>
        <IconButton
          size="small"
          onClick={() => onChange(stat.key, Math.max(0, value - 1))}
          sx={{ p: 1, width: 18, height: 18, fontSize: "0.7rem", border: "solid 1px #ccc", fontWeight: "bold" }}
        >
          -
        </IconButton>
      </Box>
    );
  };

  return (
    <Box sx={{ display: "flex", gap: 2 }}>
      {/* 착용 제한 (왼쪽) */}
      <Box sx={{ flex: 0.8 }}>
        <Typography variant="caption" sx={{ fontWeight: "bold", color: "#666", mb: 0.5, display: "block" }}>
          착용 제한
        </Typography>
        {REQUIRE_STAT_FIELDS.map((stat) => (
          <Box key={stat.key} sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.3 }}>
            <Typography sx={{ width: 35, fontSize: "0.7rem", color: "#888" }}>{stat.label}</Typography>
            <Typography sx={{ fontSize: "0.75rem" }}>
              {requireStats[stat.key as keyof typeof requireStats]}
            </Typography>
          </Box>
        ))}
        {attackSpeed != null && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.3, mt: 0.5 }}>
            <Typography sx={{ width: 35, fontSize: "0.7rem", color: "#888" }}>공속</Typography>
            <Typography sx={{ fontSize: "0.75rem" }}>
              {attackSpeed}
            </Typography>
          </Box>
        )}
      </Box>

      {/* 주요 스탯 수정 */}
      <Box sx={{ flex: 1, borderLeft: "1px solid #eee", pl: 2 }}>
        {MAIN_STATS.map(renderStatRow)}
      </Box>

      {/* 추가 스탯 수정 */}
      <Box sx={{ flex: 1 }}>
        {SECONDARY_STATS.map(renderStatRow)}
      </Box>
    </Box>
  );
}
