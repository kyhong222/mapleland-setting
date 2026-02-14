import {
  Box,
  Typography,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { useState } from "react";
import { useCharacter } from "../contexts/CharacterContext";
import type { DefenseBuffStat } from "../domain/Character";
import ironBodyData from "../data/buff/warrior/ironBody.json";
import magicArmorData from "../data/buff/magician/magicArmor.json";
import ironWillData from "../data/buff/common/ironWill.json";
import blessData from "../data/buff/common/bless.json";
import focusData from "../data/buff/archer/focus.json";
import beholderBuffData from "../data/buff/warrior/beholderBuff.json";
import customData from "../data/buff/custom/custom.json";
import itemBuffsData from "../data/buff/common/itemBuffs.json";

interface BuffOption {
  name: string;
  icon: string;
  value: number;
  job?: string; // 특정 직업 전용 (없으면 공용)
  weaponTypes?: string[]; // 특정 무기 타입 전용
}

const statIcons = customData as Record<string, { icon: string }>;

// 직업별 + 공용 옵션 (job 필드가 없으면 모든 직업에 표시)
const beholderMaxProps = beholderBuffData.properties[beholderBuffData.maxLevel] as Record<string, number>;

// 아이템 버프를 스탯별 배열로 변환
const itemPdefOptions: BuffOption[] = itemBuffsData.filter(i => i.pdef > 0).map(i => ({ name: i.koreanName, icon: i.icon, value: i.pdef }));
const itemMdefOptions: BuffOption[] = itemBuffsData.filter(i => i.mdef > 0).map(i => ({ name: i.koreanName, icon: i.icon, value: i.mdef }));
const itemAccOptions: BuffOption[] = itemBuffsData.filter(i => i.acc > 0).map(i => ({ name: i.koreanName, icon: i.icon, value: i.acc }));
const itemEvaOptions: BuffOption[] = itemBuffsData.filter(i => i.eva > 0).map(i => ({ name: i.koreanName, icon: i.icon, value: i.eva }));

const allPdefOptions: BuffOption[] = [
  { name: ironBodyData.koreanName, icon: ironBodyData.icon, value: (ironBodyData.properties[ironBodyData.maxLevel] as Record<string, number>).pdef, job: "warrior" },
  { name: beholderBuffData.koreanName, icon: beholderBuffData.icon, value: beholderMaxProps.pdef, job: "warrior", weaponTypes: ["창", "폴암"] },
  { name: magicArmorData.koreanName, icon: magicArmorData.icon, value: (magicArmorData.properties[magicArmorData.maxLevel] as Record<string, number>).pdef, job: "magician" },
  { name: ironWillData.koreanName, icon: ironWillData.icon, value: (ironWillData.properties[ironWillData.maxLevel] as Record<string, number>).pdef },
  { name: blessData.koreanName, icon: blessData.icon, value: (blessData.properties[blessData.maxLevel] as Record<string, number>).pdef },
  ...itemPdefOptions,
];

const allMdefOptions: BuffOption[] = [
  { name: beholderBuffData.koreanName, icon: beholderBuffData.icon, value: beholderMaxProps.mdef, job: "warrior", weaponTypes: ["창", "폴암"] },
  { name: ironWillData.koreanName, icon: ironWillData.icon, value: (ironWillData.properties[ironWillData.maxLevel] as Record<string, number>).mdef },
  { name: blessData.koreanName, icon: blessData.icon, value: (blessData.properties[blessData.maxLevel] as Record<string, number>).mdef },
  ...itemMdefOptions,
];

const allAccOptions: BuffOption[] = [
  { name: focusData.koreanName, icon: focusData.icon, value: (focusData.properties[focusData.maxLevel] as Record<string, number>).acc, job: "archer" },
  { name: beholderBuffData.koreanName, icon: beholderBuffData.icon, value: beholderMaxProps.acc, job: "warrior", weaponTypes: ["창", "폴암"] },
  { name: blessData.koreanName, icon: blessData.icon, value: (blessData.properties[blessData.maxLevel] as Record<string, number>).acc },
  ...itemAccOptions,
];

const allEvaOptions: BuffOption[] = [
  { name: focusData.koreanName, icon: focusData.icon, value: (focusData.properties[focusData.maxLevel] as Record<string, number>).eva, job: "archer" },
  { name: beholderBuffData.koreanName, icon: beholderBuffData.icon, value: beholderMaxProps.eva, job: "warrior", weaponTypes: ["창", "폴암"] },
  { name: blessData.koreanName, icon: blessData.icon, value: (blessData.properties[blessData.maxLevel] as Record<string, number>).eva },
  ...itemEvaOptions,
];

const ALL_STAT_OPTIONS: { stat: DefenseBuffStat; label: string; options: BuffOption[] }[] = [
  { stat: "pdef", label: "물방", options: allPdefOptions },
  { stat: "mdef", label: "마방", options: allMdefOptions },
  { stat: "acc", label: "명중", options: allAccOptions },
  { stat: "eva", label: "회피", options: allEvaOptions },
];

function getStatConfig(jobEngName?: string, weaponType?: string) {
  return ALL_STAT_OPTIONS.map(({ stat, label, options }) => ({
    stat,
    label,
    options: options.filter((o) => {
      if (o.job && o.job !== jobEngName) return false;
      if (o.weaponTypes && (!weaponType || !o.weaponTypes.includes(weaponType))) return false;
      return true;
    }),
  }));
}

export default function DefenseBuffSection() {
  const { character, defenseBuffs, setDefenseBuff } = useCharacter();
  const job = character.getJob();
  const weaponType = character.getWeaponType() ?? undefined;
  const statConfig = getStatConfig(job?.engName, weaponType);

  const [openDialogStat, setOpenDialogStat] = useState<DefenseBuffStat | null>(null);

  const dialogConfig = openDialogStat
    ? statConfig.find((c) => c.stat === openDialogStat)
    : null;

  return (
    <>
      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
        추가 버프
      </Typography>
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
        {statConfig.map(({ stat, label }) => {
          const entry = defenseBuffs[stat];
          return (
            <Box key={stat} sx={{ display: "flex", gap: 1 }}>
              <Box
                onClick={() => setOpenDialogStat(stat)}
                sx={{
                  minWidth: 40,
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "transparent",
                  borderRadius: 1,
                  overflow: "hidden",
                  cursor: "pointer",
                  "&:hover": { opacity: 0.8 },
                }}
              >
                {entry.icon && !entry.isManual ? (
                  <img
                    src={`data:image/webp;base64,${entry.icon}`}
                    alt={entry.label}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                ) : (
                  <img
                    src={`data:image/png;base64,${statIcons[stat]?.icon}`}
                    alt="버프 선택"
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                )}
              </Box>
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: 0.5,
                  minWidth: 0,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: "bold",
                    fontSize: "0.75rem",
                    wordBreak: "keep-all",
                  }}
                >
                  {entry.label}
                </Typography>
                <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                  <Typography
                    variant="caption"
                    sx={{ color: "#666", fontSize: "0.7rem" }}
                  >
                    {label}
                  </Typography>
                  <TextField
                    type="number"
                    size="small"
                    value={entry.value}
                    onChange={(e) => {
                      if (entry.isManual) {
                        const value = parseInt(e.target.value) || 0;
                        setDefenseBuff(stat, { value });
                      }
                    }}
                    disabled={!entry.isManual}
                    sx={{
                      width: 40,
                      height: 18,
                      "& .MuiOutlinedInput-root": {
                        height: 18,
                        minHeight: 18,
                      },
                      "& .MuiInputBase-input": {
                        bgcolor: entry.isManual ? "white" : "#f0f0f0",
                        p: "0px 2px",
                        fontSize: "0.65rem",
                        textAlign: "center",
                        lineHeight: 1.4,
                      },
                    }}
                  />
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>

      {/* 추가 버프 선택 다이얼로그 */}
      <Dialog
        open={!!openDialogStat}
        onClose={() => setOpenDialogStat(null)}
        maxWidth="xs"
        fullWidth
      >
        {dialogConfig && openDialogStat && (
          <>
            <DialogTitle sx={{ fontSize: "0.95rem", pb: 1 }}>
              {dialogConfig.label} 버프 선택
            </DialogTitle>
            <DialogContent sx={{ p: 1 }}>
              {/* 직접입력 */}
              <Box
                onClick={() => {
                  setDefenseBuff(openDialogStat, {
                    label: "직접입력",
                    icon: null,
                    isManual: true,
                    value: 0,
                  });
                  setOpenDialogStat(null);
                }}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  p: 1,
                  cursor: "pointer",
                  borderRadius: 1,
                  "&:hover": { bgcolor: "#f0f0f0" },
                }}
              >
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "#fff",
                    borderRadius: 1,
                    overflow: "hidden",
                    border: "1px solid #eee",
                  }}
                >
                  <img
                    src={`data:image/png;base64,${statIcons[openDialogStat]?.icon}`}
                    alt="직접입력"
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                </Box>
                <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
                  직접입력
                </Typography>
              </Box>
              {/* 버프 옵션 */}
              {dialogConfig.options.map((opt) => (
                <Box
                  key={opt.name}
                  onClick={() => {
                    setDefenseBuff(openDialogStat, {
                      label: opt.name,
                      icon: opt.icon || null,
                      isManual: false,
                      value: opt.value,
                    });
                    setOpenDialogStat(null);
                  }}
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    p: 1,
                    cursor: "pointer",
                    borderRadius: 1,
                    "&:hover": { bgcolor: "#f0f0f0" },
                  }}
                >
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "#fff",
                      borderRadius: 1,
                      overflow: "hidden",
                      border: "1px solid #eee",
                    }}
                  >
                    {opt.icon ? (
                      <img
                        src={`data:image/webp;base64,${opt.icon}`}
                        alt={opt.name}
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      />
                    ) : (
                      <img
                        src={`data:image/png;base64,${statIcons[openDialogStat]?.icon}`}
                        alt={opt.name}
                        style={{ width: "100%", height: "100%", objectFit: "contain" }}
                      />
                    )}
                  </Box>
                  <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
                    {opt.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#666", ml: "auto" }}>
                    +{opt.value}
                  </Typography>
                </Box>
              ))}
            </DialogContent>
          </>
        )}
      </Dialog>
    </>
  );
}
