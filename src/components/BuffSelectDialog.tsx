import {
  Box,
  Typography,
  TextField,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
} from "@mui/material";
import { useState } from "react";
import { useCharacter } from "../contexts/CharacterContext";
import buff1Data from "../data/buff/buff/buff1.json";
import buff2Data from "../data/buff/buff/buff2.json";

interface BuffData {
  empty: {
    icon: string;
    name: string;
    x: number;
  };
}

export default function BuffSelectDialog() {
  const {
    character,
    setBuff1Attack,
    setBuff2Attack,
    buff1Attack,
    buff2Attack,
    buff1Label,
    setBuff1Label,
    buff1Icon,
    setBuff1Icon,
    buff1IsManual,
    setBuff1IsManual,
    buff2Label,
    setBuff2Label,
    buff2Icon,
    setBuff2Icon,
    buff2IsManual,
    setBuff2IsManual,
    setBuffMAD,
  } = useCharacter();

  const [dialogSlot, setDialogSlot] = useState<"buff1" | "buff2" | null>(null);
  const [buff1MADValue, setBuff1MADValue] = useState(0);
  const [buff2MADValue, setBuff2MADValue] = useState(0);

  const job = character.getJob();
  const isJobMagician = job?.engName === "magician";
  const weaponType = character.getWeaponType();

  const buff1Skills = (isJobMagician
    ? buff1Data.magic_buffs || []
    : buff1Data.attack_buffs || []
  ).filter((skill) => {
    const s = skill as { job?: string; weaponTypes?: string[] };
    if (s.job && s.job !== job?.engName) return false;
    if (s.weaponTypes && (!weaponType || !s.weaponTypes.includes(weaponType))) return false;
    return true;
  });
  const buff2Skills = isJobMagician
    ? buff2Data.magic_buffs || []
    : buff2Data.attack_buffs || [];

  const statLabel = isJobMagician ? "마력" : "공격력";

  const dialogSkills = dialogSlot === "buff1" ? buff1Skills : buff2Skills;
  const dialogEmptyIcon = dialogSlot === "buff1"
    ? (buff1Data as BuffData).empty.icon
    : (buff2Data as BuffData).empty.icon;

  const handleSelectSkill = (skill: { name: string; icon?: string; x?: number } | null) => {
    if (!dialogSlot) return;

    if (skill === null) {
      // 직접입력
      if (dialogSlot === "buff1") {
        setBuff1Label("직접입력");
        setBuff1Icon(null);
        setBuff1IsManual(true);
        setBuff1Attack(0);
      } else {
        setBuff2Label("직접입력");
        setBuff2Icon(null);
        setBuff2IsManual(true);
        setBuff2Attack(0);
      }
    } else {
      const value = skill.x || 0;
      if (dialogSlot === "buff1") {
        setBuff1Label(skill.name);
        setBuff1Attack(value);
        setBuff1Icon(skill.icon || null);
        setBuff1IsManual(false);
        if (isJobMagician) {
          setBuff1MADValue(value);
          setBuffMAD(value + buff2MADValue);
        }
      } else {
        setBuff2Label(skill.name);
        setBuff2Attack(value);
        setBuff2Icon(skill.icon || null);
        setBuff2IsManual(false);
        if (isJobMagician) {
          setBuff2MADValue(value);
          setBuffMAD(buff1MADValue + value);
        }
      }
    }
    setDialogSlot(null);
  };

  return (
    <>
      <Divider sx={{ my: 0 }} />
      <Typography variant="body2" sx={{ fontWeight: "bold" }}>
        {isJobMagician ? "마력 버프" : "공격력 버프"}
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
        {/* 버프 1 */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <Box
            onClick={() => setDialogSlot("buff1")}
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
            {buff1Icon && !buff1IsManual ? (
              <img
                src={`data:image/webp;base64,${buff1Icon}`}
                alt={buff1Label}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            ) : (
              <img
                src={`data:image/png;base64,${(buff1Data as BuffData).empty.icon}`}
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
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {buff1Label}
            </Typography>
            <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
              <Typography
                variant="caption"
                sx={{ color: "#666", fontSize: "0.7rem" }}
              >
                {statLabel}
              </Typography>
              <TextField
                type="number"
                size="small"
                value={buff1Attack}
                onChange={(e) => {
                  if (buff1IsManual) {
                    const value = parseInt(e.target.value) || 0;
                    setBuff1Attack(value);
                    if (isJobMagician) {
                      setBuff1MADValue(value);
                      setBuffMAD(value + buff2MADValue);
                    }
                  }
                }}
                disabled={!buff1IsManual}
                sx={{
                  width: 40,
                  height: 18,
                  "& .MuiOutlinedInput-root": {
                    height: 18,
                    minHeight: 18,
                  },
                  "& .MuiInputBase-input": {
                    bgcolor: buff1IsManual ? "white" : "#f0f0f0",
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

        {/* 버프 2 */}
        <Box sx={{ display: "flex", gap: 1 }}>
          <Box
            onClick={() => setDialogSlot("buff2")}
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
            {buff2Icon && !buff2IsManual ? (
              <img
                src={`data:image/webp;base64,${buff2Icon}`}
                alt={buff2Label}
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            ) : (
              <img
                src={`data:image/png;base64,${(buff2Data as BuffData).empty.icon}`}
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
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {buff2Label}
            </Typography>
            <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
              <Typography
                variant="caption"
                sx={{ color: "#666", fontSize: "0.7rem" }}
              >
                {statLabel}
              </Typography>
              <TextField
                type="number"
                size="small"
                value={buff2Attack}
                onChange={(e) => {
                  if (buff2IsManual) {
                    const value = parseInt(e.target.value) || 0;
                    setBuff2Attack(value);
                    if (isJobMagician) {
                      setBuff2MADValue(value);
                      setBuffMAD(buff1MADValue + value);
                    }
                  }
                }}
                disabled={!buff2IsManual}
                sx={{
                  width: 40,
                  height: 18,
                  "& .MuiOutlinedInput-root": {
                    height: 18,
                    minHeight: 18,
                  },
                  "& .MuiInputBase-input": {
                    bgcolor: buff2IsManual ? "white" : "#f0f0f0",
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
      </Box>

      {/* 버프 선택 다이얼로그 */}
      <Dialog
        open={!!dialogSlot}
        onClose={() => setDialogSlot(null)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontSize: "0.95rem", pb: 1 }}>
          버프 선택
        </DialogTitle>
        <DialogContent sx={{ p: 1 }}>
          {/* 직접입력 */}
          <Box
            onClick={() => handleSelectSkill(null)}
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
                src={`data:image/png;base64,${dialogEmptyIcon}`}
                alt="직접입력"
                style={{ width: "100%", height: "100%", objectFit: "contain" }}
              />
            </Box>
            <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
              직접입력
            </Typography>
          </Box>
          {/* 스킬 옵션 */}
          {dialogSkills?.map((skill) => (
            <Box
              key={skill.name}
              onClick={() => handleSelectSkill(skill)}
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
                {skill.icon ? (
                  <img
                    src={`data:image/webp;base64,${skill.icon}`}
                    alt={skill.name}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                ) : (
                  <img
                    src={`data:image/png;base64,${dialogEmptyIcon}`}
                    alt={skill.name}
                    style={{ width: "100%", height: "100%", objectFit: "contain" }}
                  />
                )}
              </Box>
              <Typography variant="body2" sx={{ fontSize: "0.85rem" }}>
                {skill.name}
              </Typography>
              <Typography variant="caption" sx={{ color: "#666", ml: "auto" }}>
                +{skill.x || 0}
              </Typography>
            </Box>
          ))}
        </DialogContent>
      </Dialog>
    </>
  );
}
