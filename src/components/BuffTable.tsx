import {
  Box,
  Typography,
  TextField,
  Button,
  Divider,
  Select,
  MenuItem,
  FormControl,
  Radio,
  RadioGroup,
  FormControlLabel,
  styled,
} from "@mui/material";
import { useState, useEffect } from "react";
import mapleWarriorData from "../data/buff/MapleWarrior/MapleWarrior.json";
import herosEchoIcon from "../data/buff/HerosEcho/HerosEcho.png";
import buff1Data from "../data/buff/buff/buff1.json";
import buff2Data from "../data/buff/buff/buff2.json";

const BuffSectionBox = styled(Box)(({ theme }) => ({
  width: 400,
  height: 125,
  padding: theme.spacing(2),
  boxSizing: "border-box",
}));

interface BuffTableProps {
  mapleWarriorLevel: number;
  onMapleWarriorLevelChange: (level: number) => void;
  onBuff1AttackChange: (attack: number) => void;
  onBuff2AttackChange: (attack: number) => void;
  heroEchoEnabled: boolean;
  onHeroEchoChange: (enabled: boolean) => void;
}

// 메이플용사 영역 컴포넌트
function MapleWarriorSection({
  mapleWarriorLevel,
  onLevelChange,
}: {
  mapleWarriorLevel: number;
  onLevelChange: (level: number) => void;
}) {
  const mapleWarriorEffect = mapleWarriorData.table.find((item) => item.level === mapleWarriorLevel);

  const handleMapleWarriorLevelChange = (newLevel: number) => {
    onLevelChange(Math.max(0, Math.min(20, newLevel)));
  };

  return (
    <BuffSectionBox
      sx={{
        borderBottom: "1px solid #e0e0e0",
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
        메이플 용사
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "60px auto 1fr",
          gap: 2,
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            aspectRatio: "1/1",
            border: "1px solid #ddd",
            borderRadius: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "white",
            overflow: "hidden",
          }}
        >
          <img
            src={`data:image/png;base64,${mapleWarriorData.icon}`}
            alt="메이플 용사"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </Box>
        <Divider orientation="vertical" flexItem />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <Typography variant="body2" sx={{ fontSize: "0.75rem", fontWeight: "bold" }}>
              레벨:
            </Typography>
            <TextField
              type="number"
              size="small"
              value={mapleWarriorLevel}
              onChange={(e) => handleMapleWarriorLevelChange(parseInt(e.target.value) || 0)}
              inputProps={{ min: 0, max: 20 }}
              sx={{
                width: 50,
                "& .MuiInputBase-input": {
                  p: 0.5,
                  fontSize: "0.75rem",
                  textAlign: "center",
                  bgcolor: "white",
                },
                "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
                  display: "none",
                },
                "& input[type=number]": {
                  MozAppearance: "textfield",
                },
              }}
            />
            <Box sx={{ width: 8 }} />
            <Button
              size="small"
              variant="contained"
              onClick={() => handleMapleWarriorLevelChange(mapleWarriorLevel + 1)}
              disabled={mapleWarriorLevel === 20}
              sx={{
                minWidth: 24,
                p: 0.25,
                fontSize: "0.7rem",
                bgcolor: mapleWarriorLevel < 20 ? "#f97316" : "#9ca3af",
                color: "white",
                fontWeight: "bold",
                "&:hover": {
                  bgcolor: mapleWarriorLevel < 20 ? "#ea580c" : "#9ca3af",
                },
                "&.Mui-disabled": {
                  bgcolor: "#9ca3af",
                  color: "white",
                },
              }}
            >
              ▲
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={() => handleMapleWarriorLevelChange(mapleWarriorLevel - 1)}
              disabled={mapleWarriorLevel === 0}
              sx={{
                minWidth: 24,
                p: 0.25,
                fontSize: "0.7rem",
                bgcolor: mapleWarriorLevel > 0 ? "#f97316" : "#9ca3af",
                color: "white",
                fontWeight: "bold",
                "&:hover": {
                  bgcolor: mapleWarriorLevel > 0 ? "#ea580c" : "#9ca3af",
                },
                "&.Mui-disabled": {
                  bgcolor: "#9ca3af",
                  color: "white",
                },
              }}
            >
              ▼
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={() => handleMapleWarriorLevelChange(0)}
              disabled={mapleWarriorLevel === 0}
              sx={{
                minWidth: 24,
                p: 0.25,
                fontSize: "0.7rem",
                bgcolor: mapleWarriorLevel > 0 ? "#f97316" : "#9ca3af",
                color: "white",
                fontWeight: "bold",
                "&:hover": {
                  bgcolor: mapleWarriorLevel > 0 ? "#ea580c" : "#9ca3af",
                },
                "&.Mui-disabled": {
                  bgcolor: "#9ca3af",
                  color: "white",
                },
              }}
            >
              0
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={() => handleMapleWarriorLevelChange(20)}
              disabled={mapleWarriorLevel === 20}
              sx={{
                minWidth: 24,
                p: 0.25,
                fontSize: "0.7rem",
                bgcolor: mapleWarriorLevel < 20 ? "#f97316" : "#9ca3af",
                color: "white",
                fontWeight: "bold",
                "&:hover": {
                  bgcolor: mapleWarriorLevel < 20 ? "#ea580c" : "#9ca3af",
                },
                "&.Mui-disabled": {
                  bgcolor: "#9ca3af",
                  color: "white",
                },
              }}
            >
              M
            </Button>
          </Box>
          <Divider sx={{ my: 1 }} />
          <Typography variant="body2" sx={{ fontSize: "0.875rem", color: "#333", fontWeight: "500" }}>
            {mapleWarriorEffect ? `${mapleWarriorEffect.time}초간 모든 스탯 ${mapleWarriorEffect.x}% 향상` : ""}
          </Typography>
        </Box>
      </Box>
    </BuffSectionBox>
  );
}

// 버프 슬롯 컴포넌트
function BuffSlot({
  title,
  buffType,
  onBuffTypeChange,
  customAttack,
  onCustomAttackChange,
  buffData,
}: {
  title: string;
  buffType: string;
  onBuffTypeChange: (value: string) => void;
  customAttack: number;
  onCustomAttackChange: (value: number) => void;
  buffData: { skills: { name: string; x: number }[] };
}) {
  const selectedSkill = buffData.skills.find((skill) => skill.name === buffType);

  return (
    <BuffSectionBox
      sx={{
        borderBottom: "1px solid #e0e0e0",
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
        {title}
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "60px auto 1fr",
          gap: 2,
          alignItems: "start",
        }}
      >
        <Box
          sx={{
            aspectRatio: "1/1",
            border: "1px solid #ddd",
            borderRadius: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "white",
            overflow: "hidden",
          }}
        >
          {/* 아이콘 자리 */}
        </Box>
        <Divider orientation="vertical" flexItem />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <FormControl size="small" fullWidth>
            <Select
              value={buffType}
              onChange={(e) => onBuffTypeChange(e.target.value)}
              displayEmpty
              sx={{
                fontSize: "0.75rem",
                bgcolor: "white",
                "& .MuiSelect-select": {
                  py: 0.5,
                },
              }}
            >
              <MenuItem value="" disabled>
                <em>버프 선택</em>
              </MenuItem>
              <MenuItem value="custom">직접 입력</MenuItem>
              {buffData.skills.map((skill) => (
                <MenuItem key={skill.name} value={skill.name}>
                  {skill.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Divider sx={{ my: 0.5 }} />
          {buffType === "custom" ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="body2" sx={{ fontSize: "0.875rem", color: "#333", fontWeight: "500" }}>
                공격력:
              </Typography>
              <TextField
                type="number"
                size="small"
                value={customAttack}
                onChange={(e) => onCustomAttackChange(parseInt(e.target.value) || 0)}
                sx={{
                  width: 60,
                  "& .MuiInputBase-input": {
                    p: 0.5,
                    fontSize: "0.75rem",
                    textAlign: "center",
                    bgcolor: "white",
                  },
                  "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button": {
                    display: "none",
                  },
                  "& input[type=number]": {
                    MozAppearance: "textfield",
                  },
                }}
              />
              <Typography variant="body2" sx={{ fontSize: "0.875rem", color: "#333", fontWeight: "500" }}>
                증가
              </Typography>
            </Box>
          ) : selectedSkill ? (
            <Typography variant="body2" sx={{ fontSize: "0.875rem", color: "#333", fontWeight: "500" }}>
              공격력 {selectedSkill.x} 증가
            </Typography>
          ) : (
            <Typography variant="body2" sx={{ fontSize: "0.875rem", color: "#333", fontWeight: "500" }}>
              {/* 설명 자리 */}
            </Typography>
          )}
        </Box>
      </Box>
    </BuffSectionBox>
  );
}

// 영웅의 메아리 영역 컴포넌트
function HeroEchoSection({ isEnabled, onToggle }: { isEnabled: boolean; onToggle: (enabled: boolean) => void }) {
  return (
    <BuffSectionBox>
      <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
        영웅의 메아리
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "60px auto 1fr",
          gap: 2,
          alignItems: "center",
        }}
      >
        <Box
          sx={{
            aspectRatio: "1/1",
            border: "1px solid #ddd",
            borderRadius: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: "white",
            overflow: "hidden",
          }}
        >
          <img
            src={herosEchoIcon}
            alt="영웅의 메아리"
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </Box>
        <Divider orientation="vertical" flexItem />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <RadioGroup
            row
            value={isEnabled ? "on" : "off"}
            onChange={(e) => onToggle(e.target.value === "on")}
            sx={{ gap: 0.5, minHeight: "auto" }}
          >
            <FormControlLabel
              value="on"
              control={<Radio size="small" sx={{ p: 0.5 }} />}
              label={<Typography sx={{ fontSize: "0.75rem" }}>ON</Typography>}
              sx={{ m: 0, mr: 1 }}
            />
            <FormControlLabel
              value="off"
              control={<Radio size="small" sx={{ p: 0.5 }} />}
              label={<Typography sx={{ fontSize: "0.75rem" }}>OFF</Typography>}
              sx={{ m: 0 }}
            />
          </RadioGroup>
          <Divider sx={{ my: 0.5 }} />
          <Typography variant="body2" sx={{ fontSize: "0.875rem", color: "#333", fontWeight: "500" }}>
            40분 동안 공격력, 마력 4% 증가
          </Typography>
        </Box>
      </Box>
    </BuffSectionBox>
  );
}

export default function BuffTable({
  mapleWarriorLevel,
  onMapleWarriorLevelChange,
  onBuff1AttackChange,
  onBuff2AttackChange,
  heroEchoEnabled,
  onHeroEchoChange,
}: BuffTableProps) {
  const [buff1Type, setBuff1Type] = useState("");
  const [buff1CustomAttack, setBuff1CustomAttack] = useState(0);
  const [buff2Type, setBuff2Type] = useState("");
  const [buff2CustomAttack, setBuff2CustomAttack] = useState(0);

  // 버프1 공격력 계산 및 전달
  useEffect(() => {
    if (buff1Type === "custom") {
      onBuff1AttackChange(buff1CustomAttack);
    } else if (buff1Type) {
      const skill = buff1Data.skills.find((s) => s.name === buff1Type);
      onBuff1AttackChange(skill ? skill.x : 0);
    } else {
      onBuff1AttackChange(0);
    }
  }, [buff1Type, buff1CustomAttack, onBuff1AttackChange]);

  // 버프2 공격력 계산 및 전달
  useEffect(() => {
    if (buff2Type === "custom") {
      onBuff2AttackChange(buff2CustomAttack);
    } else if (buff2Type) {
      const skill = buff2Data.skills.find((s) => s.name === buff2Type);
      onBuff2AttackChange(skill ? skill.x : 0);
    } else {
      onBuff2AttackChange(0);
    }
  }, [buff2Type, buff2CustomAttack, onBuff2AttackChange]);

  return (
    <Box
      sx={{
        width: 400,
        border: "1px solid #ccc",
        borderRadius: 1,
        display: "flex",
        flexDirection: "column",
        bgcolor: "#f5f5f5",
      }}
    >
      <MapleWarriorSection mapleWarriorLevel={mapleWarriorLevel} onLevelChange={onMapleWarriorLevelChange} />
      <BuffSlot
        title="버프1"
        buffType={buff1Type}
        onBuffTypeChange={setBuff1Type}
        customAttack={buff1CustomAttack}
        onCustomAttackChange={setBuff1CustomAttack}
        buffData={buff1Data}
      />
      <BuffSlot
        title="버프2"
        buffType={buff2Type}
        onBuffTypeChange={setBuff2Type}
        customAttack={buff2CustomAttack}
        onCustomAttackChange={setBuff2CustomAttack}
        buffData={buff2Data}
      />
      <HeroEchoSection isEnabled={heroEchoEnabled} onToggle={onHeroEchoChange} />
    </Box>
  );
}
