import { Box, Typography, Tooltip } from "@mui/material";
import type { SpecialSkillData } from "../types/specialSkill";
import { specialSkillsByJob } from "../types/specialSkill";

const DISABLED_SKILLS = new Set([
  "Element Resistance",
  "Partial Resistance FP",
  "Partial Resistance IL",
]);

interface SpecialSkillSectionProps {
  jobEngName: string | undefined;
  specialSkillLevels: Record<string, number>;
  weaponType: string | undefined;
  onSkillClick: (skill: SpecialSkillData, currentLevel: number) => void;
}

export default function SpecialSkillSection({
  jobEngName,
  specialSkillLevels,
  weaponType,
  onSkillClick,
}: SpecialSkillSectionProps) {
  if (!jobEngName) return null;
  const skills = specialSkillsByJob[jobEngName] || [];
  if (skills.length === 0) return null;

  const filtered = skills.filter((skill) => {
    const meetsRequire = !skill.requireWeaponTypes ||
      (weaponType != null && skill.requireWeaponTypes.includes(weaponType));
    const meetsExclude = !skill.excludeWeaponTypes ||
      (weaponType != null && !skill.excludeWeaponTypes.includes(weaponType));
    return meetsRequire && meetsExclude;
  });

  if (filtered.length === 0) return null;

  return filtered.map((skill) => {
    const level = specialSkillLevels[skill.englishName] ?? 0;
    const isDisabled = DISABLED_SKILLS.has(skill.englishName);

    const content = (
      <Box key={skill.englishName} sx={{ display: "flex", gap: 1, opacity: isDisabled ? 0.4 : 1 }}>
        <Box
          onClick={() => {
            if (!isDisabled) onSkillClick(skill, specialSkillLevels[skill.englishName] ?? 0);
          }}
          sx={{
            minWidth: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "#ffffff",
            borderRadius: 1,
            fontSize: "0.75rem",
            overflow: "hidden",
            cursor: isDisabled ? "not-allowed" : "pointer",
            "&:hover": isDisabled ? {} : { opacity: 0.8 },
          }}
        >
          {skill.icon ? (
            <img
              src={`data:image/png;base64,${skill.icon}`}
              alt={skill.koreanName}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          ) : (
            skill.koreanName.charAt(0)
          )}
        </Box>
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            minWidth: 0,
          }}
        >
          <Typography
            variant="body2"
            sx={{ fontSize: "0.75rem", wordBreak: "keep-all", lineHeight: 1.3 }}
          >
            <Typography component="span" sx={{ fontWeight: "bold", fontSize: "inherit" }}>
              {skill.koreanName}
            </Typography>{" "}
            <Typography component="span" sx={{ color: "#666", fontSize: "0.7rem" }}>
              {isDisabled ? "미구현" : `Lv ${level}`}
            </Typography>
          </Typography>
        </Box>
      </Box>
    );

    if (isDisabled) {
      return (
        <Tooltip key={skill.englishName} title="미구현" arrow placement="top">
          {content}
        </Tooltip>
      );
    }

    return content;
  });
}
