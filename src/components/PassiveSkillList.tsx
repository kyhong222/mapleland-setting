import { Box, Typography } from "@mui/material";
import type { PassiveSkillData } from "../types/passive";
import { passivesByJob } from "../types/passive";

interface PassiveSkillListProps {
  jobEngName: string | undefined;
  passiveLevels: Record<string, number>;
  secondaryItemType: string | undefined;
  weaponType: string | undefined;
  onPassiveClick: (passive: PassiveSkillData, currentLevel: number) => void;
}

export default function PassiveSkillList({
  jobEngName,
  passiveLevels,
  secondaryItemType,
  weaponType,
  onPassiveClick,
}: PassiveSkillListProps) {
  if (!jobEngName) return null;
  const passives = passivesByJob[jobEngName] || [];

  const filtered = passives.filter((passive) => {
    // 무기 타입 불일치 시 아예 렌더링하지 않음
    if (passive.requireWeaponTypes &&
      (weaponType == null || !passive.requireWeaponTypes.includes(weaponType))) {
      return false;
    }
    return true;
  });

  return filtered.map((passive) => {
    const level = passiveLevels[passive.englishName] ?? 0;

    // requireSecondaryType 체크 (예: 쉴드 마스터리 - 방패 장착 여부)
    const meetsRequirement = !passive.requireSecondaryType ||
      secondaryItemType === passive.requireSecondaryType;

    return (
      <Box key={passive.englishName} sx={{ display: "flex", gap: 1 }}>
        <Box
          onClick={() => {
            onPassiveClick(passive, passiveLevels[passive.englishName] ?? 0);
          }}
          sx={{
            minWidth: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: meetsRequirement ? "#ffffff" : "#f0f0f0",
            borderRadius: 1,
            fontSize: "0.75rem",
            overflow: "hidden",
            cursor: "pointer",
            "&:hover": { opacity: 0.8 },
          }}
        >
          {passive.icon ? (
            <img
              src={`data:image/png;base64,${passive.icon}`}
              alt={passive.koreanName}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                filter: meetsRequirement ? "none" : "grayscale(100%)",
              }}
            />
          ) : (
            passive.koreanName.charAt(0)
          )}
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
            sx={{ fontWeight: "bold", fontSize: "0.75rem", color: meetsRequirement ? "inherit" : "#aaa" }}
          >
            {passive.koreanName}
          </Typography>
          <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
            <Typography
              variant="caption"
              sx={{
                color: meetsRequirement ? "#666" : "#aaa",
                fontSize: "0.7rem",
              }}
            >
              Lv {level}
              {!meetsRequirement && passive.description
                ? ` - ${passive.description}`
                : ""}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  });
}
