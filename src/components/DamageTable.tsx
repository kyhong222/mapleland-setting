import { Box, Typography, Slider } from "@mui/material";
import { useState, useMemo } from "react";
import type { ItemType } from "../types/item";

// 무기상수 정의 (최소, 최대)
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

interface DamageTableProps {
  masteryDisabled?: boolean;
  statAttack?: number;
  mainStat?: number; // 총 주스텟
  subStat?: number; // 총 부스텟
  weaponType?: ItemType; // 무기 종류
  showReserve1?: boolean;
  showReserve2?: boolean;
}

export default function DamageTable({
  masteryDisabled = false,
  statAttack = 0,
  mainStat = 0,
  subStat = 0,
  weaponType,
  showReserve1 = false,
  showReserve2 = false,
}: DamageTableProps) {
  const [mastery, setMastery] = useState(60);

  // 무기상수 가져오기
  const weaponConstants = weaponType ? WEAPON_CONSTANTS[weaponType] : null;

  // 스탯창 공격력 최소/최대 데미지 계산
  const statDamage = useMemo(() => {
    if (!weaponConstants || statAttack === 0) {
      return { min: 0, max: 0 };
    }

    const masteryRate = mastery / 100;

    // 최소데미지: (총 주스텟 * 최소 무기상수 * 0.9 * 숙련도 + 총 부스텟) * 공격력 / 100
    const minDamage = Math.floor(((mainStat * weaponConstants.min * 0.9 * masteryRate + subStat) * statAttack) / 100);
    console.log("min", mainStat, weaponConstants.min, masteryRate, subStat, statAttack);
    // 최대데미지: (총 주스텟 * 최대 무기상수 + 총 부스텟) * 공격력 / 100
    const maxDamage = Math.floor(((mainStat * weaponConstants.max + subStat) * statAttack) / 100);
    console.log("max", mainStat, weaponConstants.max, subStat, statAttack);

    return { min: minDamage, max: maxDamage };
  }, [weaponConstants, statAttack, mainStat, subStat, mastery]);

  // 숙련도 마크: 10~60 (5단위), 65~80 (5단위), 90
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

  const handleMasteryChange = (_event: Event, newValue: number | number[]) => {
    setMastery(newValue as number);
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
      {/* 숙련도 영역 */}
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
            onChange={handleMasteryChange}
            marks={masteryMarks}
            step={null}
            min={10}
            max={90}
            valueLabelDisplay="auto"
            valueLabelFormat={(value) => `${value}%`}
            disabled={masteryDisabled}
          />
        </Box>
      </Box>

      {/* 스탯창 공격력 섹션 (항상 표시) */}
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
        <Box
          sx={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="body2" sx={{ fontSize: "1.2rem" }}>
            {statDamage.min.toLocaleString()} ~ {statDamage.max.toLocaleString()}
          </Typography>
        </Box>
      </Box>

      {/* 예비 공격력 섹션 1 */}
      <Box
        sx={{
          flex: 1,
          borderBottom: "1px solid #ccc",
          p: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {showReserve1 && (
          <>
            <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
              예비 공격력 1
            </Typography>
          </>
        )}
      </Box>

      {/* 예비 공격력 섹션 2 */}
      <Box
        sx={{
          flex: 1,
          p: 2,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {showReserve2 && (
          <>
            <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
              예비 공격력 2
            </Typography>
          </>
        )}
      </Box>
    </Box>
  );
}
