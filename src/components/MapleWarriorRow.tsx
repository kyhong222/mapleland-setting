import {
  Box,
  Typography,
  TextField,
  Divider,
  InputAdornment,
  Button,
} from "@mui/material";
import mapleWarriorData from "../data/buff/MapleWarrior/MapleWarrior.json";

interface MapleWarriorRowProps {
  level: number;
  onLevelChange: (level: number) => void;
}

export default function MapleWarriorRow({
  level,
  onLevelChange,
}: MapleWarriorRowProps) {
  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        padding: 1.5,
        borderRadius: 1,
        bgcolor: "#f5f5f5",
      }}
    >
      {/* 아이콘 */}
      <Box
        sx={{
          minWidth: 50,
          height: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "#f0f0f0",
          borderRadius: 1,
          overflow: "hidden",
        }}
      >
        <img
          src={`data:image/png;base64,${mapleWarriorData.icon}`}
          alt="메이플 용사"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            filter: level === 0 ? "grayscale(100%)" : "none",
          }}
        />
      </Box>

      {/* 정보 영역 */}
      <Box
        sx={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 1,
        }}
      >
        {/* 제목과 레벨 입력 */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="body2"
            sx={{ fontWeight: "bold", fontSize: "0.875rem" }}
          >
            메이플 용사
          </Typography>
          <TextField
            type="number"
            size="small"
            value={level}
            onChange={(e) =>
              onLevelChange(parseInt(e.target.value) || 0)
            }
            inputProps={{ min: 0, max: 20 }}
            InputProps={{
              startAdornment: (
                <InputAdornment
                  position="start"
                  sx={{ fontSize: "0.65rem", userSelect: "none" }}
                >
                  Lv
                </InputAdornment>
              ),
            }}
            sx={{
              width: 70,
              "& .MuiInputBase-input": {
                bgcolor: "white",
                p: 0.5,
                textAlign: "center",
                fontSize: "0.75rem",
              },
            }}
          />
        </Box>

        <Divider sx={{ my: 0 }} />

        {/* 설명 */}
        <Box
          sx={{
            display: "flex",
            gap: 0.5,
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: "#666", fontSize: "0.75rem" }}
          >
            스탯 {Math.floor((level + 1) / 2)}% 증가
          </Typography>
          <Box sx={{ display: "flex", gap: 0.5 }}>
            <Button
              size="small"
              variant={level === 0 ? "contained" : "outlined"}
              onClick={() => onLevelChange(0)}
              sx={{
                minWidth: 28,
                height: 28,
                p: 0,
                fontSize: "0.65rem",
              }}
            >
              0
            </Button>
            <Button
              size="small"
              variant={level === 10 ? "contained" : "outlined"}
              onClick={() => onLevelChange(10)}
              sx={{
                minWidth: 28,
                height: 28,
                p: 0,
                fontSize: "0.65rem",
              }}
            >
              10
            </Button>
            <Button
              size="small"
              variant={level === 20 ? "contained" : "outlined"}
              onClick={() => onLevelChange(20)}
              sx={{
                minWidth: 28,
                height: 28,
                p: 0,
                fontSize: "0.65rem",
              }}
            >
              20
            </Button>
            <Button
              size="small"
              variant={level === 30 ? "contained" : "outlined"}
              onClick={() => onLevelChange(30)}
              sx={{
                minWidth: 28,
                height: 28,
                p: 0,
                fontSize: "0.65rem",
              }}
            >
              30
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}
