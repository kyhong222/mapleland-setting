import { Box, Typography } from "@mui/material";
import type { SpecialSkillData } from "../types/specialSkill";
import { specialSkillsByJob, MAGICIAN_SUBCLASS_SKILLS } from "../types/specialSkill";
import type { MagicianSubClass } from "../types/specialSkill";

interface SpecialSkillSectionProps {
  jobEngName: string | undefined;
  specialSkillLevels: Record<string, number>;
  weaponType: string | undefined;
  magicianSubClass?: string;
  onSkillClick: (skill: SpecialSkillData, currentLevel: number) => void;
}

export default function SpecialSkillSection({
  jobEngName,
  specialSkillLevels,
  weaponType,
  magicianSubClass,
  onSkillClick,
}: SpecialSkillSectionProps) {
  if (!jobEngName) return null;
  const skills = specialSkillsByJob[jobEngName] || [];
  if (skills.length === 0) return null;

  const isMagician = jobEngName === "magician";
  const activeSubClass = (magicianSubClass ?? "썬콜") as MagicianSubClass;
  const activeSkillNames = isMagician
    ? MAGICIAN_SUBCLASS_SKILLS[activeSubClass] ?? []
    : null;

  const filtered = skills.filter((skill) => {
    const meetsRequire = !skill.requireWeaponTypes ||
      (weaponType != null && skill.requireWeaponTypes.includes(weaponType));
    const meetsExclude = !skill.excludeWeaponTypes ||
      (weaponType != null && !skill.excludeWeaponTypes.includes(weaponType));
    if (!meetsRequire || !meetsExclude) return false;
    if (activeSkillNames) return activeSkillNames.includes(skill.englishName);
    return true;
  });

  return filtered.map((skill) => {
    const level = specialSkillLevels[skill.englishName] ?? 0;

    return (
      <Box key={skill.englishName} sx={{ display: "flex", gap: 1 }}>
        <Box
          onClick={() => onSkillClick(skill, specialSkillLevels[skill.englishName] ?? 0)}
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
            cursor: "pointer",
            "&:hover": { opacity: 0.8 },
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
              Lv {level}
            </Typography>
          </Typography>
        </Box>
      </Box>
    );
  });
}
