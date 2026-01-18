import { Box, Typography, Slider } from "@mui/material";
import { useMemo } from "react";
import { useCharacter } from "../contexts/CharacterContext";

const WEAPON_CONSTANTS: Record<string, { min: number; max: number }> = {
  한손검: { min: 4.0, max: 4.0 },
  한손도끼: { min: 3.2, max: 4.4 },
  한손둔기: { min: 3.2, max: 4.4 },
  두손검: { min: 4.6, max: 4.6 },
  두손도끼: { min: 3.4, max: 4.8 },
  두손둔기: { min: 3.4, max: 4.8 },
  창: { min: 3.0, max: 5.0 },
  폴암: { min: 3.0, max: 5.0 },
  활: { min: 3.4, max: 3.4 },
  석궁: { min: 3.6, max: 3.6 },
  단검: { min: 3.6, max: 3.6 },
  아대: { min: 3.6, max: 3.6 },
};

export default function DamageTable() {
  const { character, buff1Attack, buff2Attack, mastery1, mastery2, setMastery1, setMastery2 } = useCharacter();
  const weaponType = character.getWeaponType();
  const mastery = weaponType === "활" || weaponType === "석궁" ? mastery2 : mastery1;

  const finalStats = character.getFinalStats(buff1Attack, buff2Attack);

  const weaponConstants = weaponType ? WEAPON_CONSTANTS[weaponType] : null;

  const damage = useMemo(() => {
    if (!weaponConstants || finalStats.totalAttack === 0) {
      return { min: 0, max: 0 };
    }

    const masteryRate = mastery / 100;
    const minDamage = Math.floor(
      ((finalStats.mainStat * weaponConstants.min * 0.9 * masteryRate + finalStats.subStat) * finalStats.totalAttack) /
        100
    );
    const maxDamage = Math.floor(
      ((finalStats.mainStat * weaponConstants.max + finalStats.subStat) * finalStats.totalAttack) / 100
    );

    return { min: minDamage, max: maxDamage };
  }, [weaponConstants, finalStats, mastery]);

  const masteryMarks = [
    { value: 10, label: "10%" },
    { value: 15 },
    { value: 20 },
    { value: 25 },
    { value: 30 },
    { value: 35 },
    { value: 40 },
    { value: 45 },
    { value: 50 },
    { value: 55 },
    { value: 60, label: "60%" },
    { value: 65 },
    { value: 70 },
    { value: 75 },
    { value: 80, label: "80%" },
    { value: 90, label: "90%" },
  ];

  return (
    <Box
      sx={{
        width: 400,
        height: 500,
        border: "1px solid #ccc",
        borderRadius: 1,
        bgcolor: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 숙련도 */}
      <Box
        sx={{
          flex: 1,
          borderBottom: "1px solid #ccc",
          p: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: "bold", mb: 2 }}>
          숙련도: {mastery}%
        </Typography>
        <Box sx={{ px: 2 }}>
          <Slider
            value={mastery}
            onChange={(_, value) => {
              if (weaponType === "활" || weaponType === "석궁") {
                setMastery2(value as number);
              } else {
                setMastery1(value as number);
              }
            }}
            marks={masteryMarks}
            step={null}
            min={10}
            max={90}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value}%`}
          />
        </Box>
      </Box>

      {/* 스탯창 공격력 */}
      <Box
        sx={{
          flex: 1,
          borderBottom: "1px solid #ccc",
          p: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
          스탯창 공격력
        </Typography>
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography variant="body2" sx={{ fontSize: "1.2rem" }}>
            {damage.min.toLocaleString()} ~ {damage.max.toLocaleString()}
          </Typography>
        </Box>
      </Box>

      {/* 예비 1 */}
      <Box sx={{ flex: 1, borderBottom: "1px solid #ccc", p: 2 }} />

      {/* 예비 2 */}
      <Box sx={{ flex: 1, p: 2 }} />
    </Box>
  );
}
