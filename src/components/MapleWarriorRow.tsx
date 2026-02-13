import { Box, Typography } from "@mui/material";
import mapleWarriorData from "../data/buff/MapleWarrior/MapleWarrior.json";
import herosEchoData from "../data/buff/HerosEcho/herosecho.json";

interface MapleWarriorRowProps {
  level: number;
  onMapleWarriorClick: () => void;
  heroEchoEnabled: boolean;
  onHeroEchoToggle: () => void;
}

export default function MapleWarriorRow({
  level,
  onMapleWarriorClick,
  heroEchoEnabled,
  onHeroEchoToggle,
}: MapleWarriorRowProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 1,
        padding: 1.5,
        borderRadius: 1,
        bgcolor: "#f5f5f5",
      }}
    >
      {/* 메이플 용사 */}
      <Box sx={{ display: "flex", gap: 1 }}>
        <Box
          onClick={onMapleWarriorClick}
          sx={{
            minWidth: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#ffffff",
            borderRadius: 1,
            overflow: "hidden",
            cursor: "pointer",
            "&:hover": { opacity: 0.8 },
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
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 0.5,
          }}
        >
          <Typography
            variant="body2"
            sx={{ fontWeight: "bold", fontSize: "0.75rem" }}
          >
            메이플 용사
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "#666", fontSize: "0.7rem" }}
          >
            Lv {level} ({Math.floor((level + 1) / 2)}%)
          </Typography>
        </Box>
      </Box>

      {/* 영웅의 메아리 */}
      <Box sx={{ display: "flex", gap: 1 }}>
        <Box
          onClick={onHeroEchoToggle}
          sx={{
            minWidth: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: heroEchoEnabled ? "#ffffff" : "#f0f0f0",
            borderRadius: 1,
            overflow: "hidden",
            cursor: "pointer",
            "&:hover": { opacity: 0.8 },
          }}
        >
          <img
            src={`data:image/webp;base64,${herosEchoData.icon}`}
            alt="영웅의 메아리"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              filter: heroEchoEnabled ? "none" : "grayscale(100%)",
            }}
          />
        </Box>
        <Box
          sx={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: 0.5,
          }}
        >
          <Typography
            variant="body2"
            sx={{
              fontWeight: "bold",
              fontSize: "0.75rem",
              color: heroEchoEnabled ? "inherit" : "#aaa",
            }}
          >
            영웅의 메아리
          </Typography>
          <Typography
            variant="caption"
            sx={{
              color: heroEchoEnabled ? "#666" : "#aaa",
              fontSize: "0.7rem",
            }}
          >
            {heroEchoEnabled ? "공/마 4% 증가" : "OFF"}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
