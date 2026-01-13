import { Box, Typography, TextField, Button, Divider } from "@mui/material";
import mapleWarriorData from "../data/buff/MapleWarrior/MapleWarrior.json";

interface BuffTableProps {
  mapleWarriorLevel: number;
  onMapleWarriorLevelChange: (level: number) => void;
}

export default function BuffTable({ mapleWarriorLevel, onMapleWarriorLevelChange }: BuffTableProps) {
  const mapleWarriorEffect = mapleWarriorData.table.find((item) => item.level === mapleWarriorLevel);

  const handleMapleWarriorLevelChange = (newLevel: number) => {
    onMapleWarriorLevelChange(Math.max(0, Math.min(20, newLevel)));
  };

  return (
    <Box
      sx={{
        width: 400,
        height: "100%",
        border: "1px solid #ccc",
        borderRadius: 1,
        display: "flex",
        flexDirection: "column",
        bgcolor: "#f5f5f5",
      }}
    >
      <Box
        sx={{
          flex: 1,
          border: "1px solid #ddd",
          p: 2,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
          메이플 용사
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "60px auto 1fr",
            gap: 2,
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              aspectRatio: "1/1",
              border: "1px solid #ddd",
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "white",
              overflow: "hidden",
            }}
          >
            <img
              src={`data:image/png;base64,${mapleWarriorData.icon}`}
              alt="메이플 용사"
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <Typography variant="body2" sx={{ fontSize: "0.75rem", fontWeight: "bold" }}>
                레벨:
              </Typography>
              <TextField
                type="number"
                size="small"
                value={mapleWarriorLevel}
                onChange={(e) => handleMapleWarriorLevelChange(parseInt(e.target.value) || 0)}
                inputProps={{ min: 0, max: 20 }}
                sx={{
                  width: 50,
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
              <Box sx={{ width: 8 }} />
              <Button
                size="small"
                variant="contained"
                onClick={() => handleMapleWarriorLevelChange(mapleWarriorLevel + 1)}
                disabled={mapleWarriorLevel === 20}
                sx={{
                  minWidth: 24,
                  p: 0.25,
                  fontSize: "0.7rem",
                  bgcolor: mapleWarriorLevel < 20 ? "#f97316" : "#9ca3af",
                  color: "white",
                  fontWeight: "bold",
                  "&:hover": {
                    bgcolor: mapleWarriorLevel < 20 ? "#ea580c" : "#9ca3af",
                  },
                  "&.Mui-disabled": {
                    bgcolor: "#9ca3af",
                    color: "white",
                  },
                }}
              >
                ▲
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={() => handleMapleWarriorLevelChange(mapleWarriorLevel - 1)}
                disabled={mapleWarriorLevel === 0}
                sx={{
                  minWidth: 24,
                  p: 0.25,
                  fontSize: "0.7rem",
                  bgcolor: mapleWarriorLevel > 0 ? "#f97316" : "#9ca3af",
                  color: "white",
                  fontWeight: "bold",
                  "&:hover": {
                    bgcolor: mapleWarriorLevel > 0 ? "#ea580c" : "#9ca3af",
                  },
                  "&.Mui-disabled": {
                    bgcolor: "#9ca3af",
                    color: "white",
                  },
                }}
              >
                ▼
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={() => handleMapleWarriorLevelChange(0)}
                disabled={mapleWarriorLevel === 0}
                sx={{
                  minWidth: 24,
                  p: 0.25,
                  fontSize: "0.7rem",
                  bgcolor: mapleWarriorLevel > 0 ? "#f97316" : "#9ca3af",
                  color: "white",
                  fontWeight: "bold",
                  "&:hover": {
                    bgcolor: mapleWarriorLevel > 0 ? "#ea580c" : "#9ca3af",
                  },
                  "&.Mui-disabled": {
                    bgcolor: "#9ca3af",
                    color: "white",
                  },
                }}
              >
                0
              </Button>
              <Button
                size="small"
                variant="contained"
                onClick={() => handleMapleWarriorLevelChange(20)}
                disabled={mapleWarriorLevel === 20}
                sx={{
                  minWidth: 24,
                  p: 0.25,
                  fontSize: "0.7rem",
                  bgcolor: mapleWarriorLevel < 20 ? "#f97316" : "#9ca3af",
                  color: "white",
                  fontWeight: "bold",
                  "&:hover": {
                    bgcolor: mapleWarriorLevel < 20 ? "#ea580c" : "#9ca3af",
                  },
                  "&.Mui-disabled": {
                    bgcolor: "#9ca3af",
                    color: "white",
                  },
                }}
              >
                M
              </Button>
            </Box>
            <Divider sx={{ my: 1 }} />
            <Typography variant="body2" sx={{ fontSize: "0.875rem", color: "#333", fontWeight: "500" }}>
              {mapleWarriorEffect ? `${mapleWarriorEffect.time}초간 모든 스탯 ${mapleWarriorEffect.x}% 향상` : ""}
            </Typography>
          </Box>
        </Box>
      </Box>
      <Box
        sx={{
          flex: 1,
          border: "1px solid #ddd",
          p: 2,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          버프1
        </Typography>
      </Box>
      <Box
        sx={{
          flex: 1,
          border: "1px solid #ddd",
          p: 2,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          버프2
        </Typography>
      </Box>
      <Box
        sx={{
          flex: 1,
          border: "1px solid #ddd",
          p: 2,
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          버프3
        </Typography>
      </Box>
    </Box>
  );
}
