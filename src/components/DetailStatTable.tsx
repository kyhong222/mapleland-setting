import { Box, Typography, IconButton } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useCharacter } from "../contexts/CharacterContext";
import mastery1Data from "../data/buff/mastery/mastery1.json";
import shieldMasteryData from "../data/passive/warrior/shieldMastery.json";
import thiefShieldMasteryData from "../data/passive/thief/shieldMastery.json";
import thrustData from "../data/passive/archer/thrust.json";
import amazonBlessingData from "../data/passive/archer/amazonBlessing.json";
import nimbleBodyData from "../data/passive/thief/nimbleBody.json";

interface DetailStatTableProps {
  onClose?: () => void;
}

export default function DetailStatTable({ onClose }: DetailStatTableProps) {
  const { character, mastery1, passiveLevels, defenseBuffs } = useCharacter();
  const equipStats = character.getEquipmentStats();
  const finalStats = character.getFinalStats();
  const job = character.getJob();

  // 마스터리1 명중률
  const mastery1Acc = mastery1Data.properties[mastery1]?.acc ?? 0;

  const isMage = job?.engName === "magician";

  // 패시브 스킬 스탯 계산
  const getPassiveProp = (data: { properties: Record<string, number>[] }, key: string, propName: string) => {
    const level = passiveLevels[key] ?? 0;
    return (data.properties[level] as Record<string, number>)?.[propName] ?? 0;
  };

  const passiveAcc =
    (job?.engName === "archer" ? getPassiveProp(amazonBlessingData, "Amazon's Blessing", "acc") : 0) +
    (job?.engName === "thief" ? getPassiveProp(nimbleBodyData, "Nimble Body", "acc") : 0);

  const passiveEva =
    job?.engName === "thief" ? getPassiveProp(nimbleBodyData, "Nimble Body", "eva") : 0;

  const passiveSpeed =
    job?.engName === "archer" ? getPassiveProp(thrustData, "Thrust", "speed") : 0;

  // 쉴드 마스터리: 방패 장착 시 방패 물리방어력의 n%만큼 추가 (슬롯이 비활성화되면 적용 안 함)
  const secondaryItem = character.getEquippedItem("보조무기");
  const hasShield = secondaryItem?.type === "방패" && !character.isSlotBlocked("보조무기");
  const shieldPdef = hasShield ? (secondaryItem?.pdef ?? 0) : 0;
  const isThiefDagger = job?.engName === "thief" && character.getWeaponType() === "단검";
  const shieldMasterySource = isThiefDagger ? thiefShieldMasteryData : shieldMasteryData;
  const shieldPdefP = hasShield
    ? getPassiveProp(shieldMasterySource, "Shield Mastery", "pdefP")
    : 0;
  const shieldMasteryBonus = Math.floor(shieldPdef * shieldPdefP / 100);

  // 명중률: 장비 + 스탯 보정 + 마스터리 (마법사가 아닌 경우)
  const isArcherOrThief = job?.engName === "archer" || job?.engName === "thief";
  const statAcc = isArcherOrThief
    ? finalStats.totalDex * 0.6 + finalStats.totalLuk * 0.3
    : finalStats.totalDex * 0.8 + finalStats.totalLuk * 0.5;
  const totalAcc = equipStats.acc + statAcc + mastery1Acc + passiveAcc;

  // 마법명중률: 장비 + int(총INT/10) + int(총LUK/10) (마법사 전용)
  const totalMacc = equipStats.macc + finalStats.magicAccuracy;

  // 마법방어력: 장비 + INT
  const totalMdef = equipStats.mdef + finalStats.totalInt;

  // 회피율: 장비 + DEX*0.25 + LUK*0.5
  const totalEva = equipStats.eva + finalStats.totalDex * 0.25 + finalStats.totalLuk * 0.5 + passiveEva;

  const statLines: { label: string; value: number }[] = [
    { label: "물리방어력", value: equipStats.pdef + shieldMasteryBonus + defenseBuffs.pdef.value },
    { label: "마법방어력", value: totalMdef + defenseBuffs.mdef.value },
    isMage
      ? { label: "마법명중률", value: totalMacc }
      : { label: "명중률", value: totalAcc + defenseBuffs.acc.value },
    { label: "회피율", value: totalEva + defenseBuffs.eva.value },
    { label: "이동속도", value: Math.min(equipStats.speed + 100 + passiveSpeed, 140) },
    { label: "점프력", value: Math.min(equipStats.jump + 100, 123) },
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
        {onClose && (
          <IconButton onClick={onClose} size="small" sx={{ p: 0.5 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        )}
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
