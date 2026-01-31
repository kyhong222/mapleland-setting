import {
  Box,
  Typography,
  TextField,
  Divider,
  InputAdornment,
  Button,
  MenuItem,
  Switch,
  Menu,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useCharacter } from "../contexts/CharacterContext";
import { useState } from "react";
import mapleWarriorData from "../data/buff/MapleWarrior/MapleWarrior.json";
import herosEchoData from "../data/buff/HerosEcho/herosecho.json";
import mastery1Data from "../data/buff/mastery/mastery1.json";
import mastery2Data from "../data/buff/mastery/mastery2.json";
import type { MasteryProperty, MasterySkill } from "../types/mastery";
import buff1Data from "../data/buff/buff/buff1.json";
import buff2Data from "../data/buff/buff/buff2.json";

interface BuffData {
  empty: {
    icon: string;
    name: string;
    x: number;
  };
}

export default function BuffTable() {
  const {
    character,
    setMapleWarriorLevel,
    setBuff1Attack,
    setBuff2Attack,
    setHeroEchoEnabled,
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
    mastery1,
    setMastery1,
    mastery2,
    setMastery2,
    setBuffMAD,
  } = useCharacter();

  const [buff1Menu, setBuff1Menu] = useState<null | HTMLElement>(null);
  const [buff2Menu, setBuff2Menu] = useState<null | HTMLElement>(null);
  const [buff1MADValue, setBuff1MADValue] = useState(0);
  const [buff2MADValue, setBuff2MADValue] = useState(0);
  const [mastery1Dialog, setMastery1Dialog] = useState(false);
  const [mastery2Dialog, setMastery2Dialog] = useState(false);
  const [tempMastery1Level, setTempMastery1Level] = useState(0);
  const [tempMastery2Level, setTempMastery2Level] = useState(0);

  const mapleWarrior = character.getBuff("mapleWarrior");
  const heroEcho = character.getBuff("heroEcho");
  const job = character.getJob();
  const isJobMagician = job?.engName === "magician";

  const handleMapleWarriorChange = (value: number) => {
    setMapleWarriorLevel(value);
  };

  // 직업에 따라 버프 데이터 선택
  const buff1Skills = isJobMagician
    ? buff1Data.magic_buffs || []
    : buff1Data.attack_buffs || [];
  const buff2Skills = isJobMagician
    ? buff2Data.magic_buffs || []
    : buff2Data.attack_buffs || [];

  // 무기 타입을 mastery1.json의 키로 변환
  const getWeaponKey = (weaponType: string | null): string | null => {
    if (!weaponType) return null;
    const keyMap: { [key: string]: string } = {
      한손검: "sword",
      두손검: "sword",
      한손도끼: "axe",
      두손도끼: "axe",
      한손둔기: "mace",
      두손둔기: "mace",
      창: "spear",
      폴암: "polearm",
      활: "bow",
      석궁: "crossbow",
      단검: "dagger",
      아대: "javelin",
    };
    return keyMap[weaponType] || null;
  };

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
      <Typography
        variant="body2"
        sx={{ fontWeight: "bold", p: 1.5, borderBottom: "1px solid #ccc" }}
      >
        버프
      </Typography>

      {/* 버프 섹션 */}
      <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 1.5 }}>
        {/* 메이플 용사 */}
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            padding: 1.5,
            borderRadius: 1,
            bgcolor: "#f5f5f5",
          }}
        >
          {/* 아이콘 */}
          <Box
            sx={{
              minWidth: 50,
              height: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "#f0f0f0",
              borderRadius: 1,
              overflow: "hidden",
            }}
          >
            <img
              src={`data:image/png;base64,${mapleWarriorData.icon}`}
              alt="메이플 용사"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                filter:
                  (mapleWarrior?.level || 0) === 0 ? "grayscale(100%)" : "none",
              }}
            />
          </Box>

          {/* 정보 영역 */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            {/* 제목과 레벨 입력 */}
            <Box
              sx={{
                display: "flex",
                gap: 1,
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: "bold", fontSize: "0.875rem" }}
              >
                메이플 용사
              </Typography>
              <TextField
                type="number"
                size="small"
                value={mapleWarrior?.level || 0}
                onChange={(e) =>
                  handleMapleWarriorChange(parseInt(e.target.value) || 0)
                }
                inputProps={{ min: 0, max: 20 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment
                      position="start"
                      sx={{ fontSize: "0.65rem", userSelect: "none" }}
                    >
                      Lv
                    </InputAdornment>
                  ),
                }}
                sx={{
                  width: 70,
                  "& .MuiInputBase-input": {
                    bgcolor: "white",
                    p: 0.5,
                    textAlign: "center",
                    fontSize: "0.75rem",
                  },
                }}
              />
            </Box>

            <Divider sx={{ my: 0 }} />

            {/* 설명 */}
            <Box
              sx={{
                display: "flex",
                gap: 0.5,
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: "#666", fontSize: "0.75rem" }}
              >
                스탯 {Math.floor(((mapleWarrior?.level || 0) + 1) / 2)}% 증가
              </Typography>
              <Box sx={{ display: "flex", gap: 0.5 }}>
                <Button
                  size="small"
                  variant={mapleWarrior?.level === 0 ? "contained" : "outlined"}
                  onClick={() => handleMapleWarriorChange(0)}
                  sx={{
                    minWidth: 28,
                    height: 28,
                    p: 0,
                    fontSize: "0.65rem",
                  }}
                >
                  0
                </Button>
                <Button
                  size="small"
                  variant={
                    mapleWarrior?.level === 10 ? "contained" : "outlined"
                  }
                  onClick={() => handleMapleWarriorChange(10)}
                  sx={{
                    minWidth: 28,
                    height: 28,
                    p: 0,
                    fontSize: "0.65rem",
                  }}
                >
                  10
                </Button>
                <Button
                  size="small"
                  variant={
                    mapleWarrior?.level === 20 ? "contained" : "outlined"
                  }
                  onClick={() => handleMapleWarriorChange(20)}
                  sx={{
                    minWidth: 28,
                    height: 28,
                    p: 0,
                    fontSize: "0.65rem",
                  }}
                >
                  20
                </Button>
                <Button
                  size="small"
                  variant={
                    mapleWarrior?.level === 30 ? "contained" : "outlined"
                  }
                  onClick={() => handleMapleWarriorChange(30)}
                  sx={{
                    minWidth: 28,
                    height: 28,
                    p: 0,
                    fontSize: "0.65rem",
                  }}
                >
                  30
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>

        {/* 버프 1 */}
        <Divider sx={{ my: 0 }} />
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            padding: 1.5,
            borderRadius: 1,
            bgcolor: "#f5f5f5",
          }}
        >
          {/* 아이콘 */}
          <Box
            sx={{
              minWidth: 50,
              height: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "#ffffff",
              borderRadius: 1,
              overflow: "hidden",
              fontSize: 30,
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

          {/* 정보 영역 */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            {/* 드롭다운 버튼 */}
            <Button
              onClick={(e) => setBuff1Menu(e.currentTarget)}
              size="small"
              sx={{
                width: "100%",
                height: 32,
                fontSize: "0.875rem",
                justifyContent: "flex-start",
                textTransform: "none",
                color: "#333",
                border: "1px solid #ccc",
                backgroundColor: "#fff",
              }}
            >
              {buff1Label}
            </Button>
            <Menu
              anchorEl={buff1Menu}
              open={Boolean(buff1Menu)}
              onClose={() => setBuff1Menu(null)}
            >
              <MenuItem
                onClick={() => {
                  setBuff1Menu(null);
                  setBuff1Label("직접입력");
                  setBuff1Icon(null);
                  setBuff1IsManual(true);
                  setBuff1Attack(0);
                }}
              >
                직접입력
              </MenuItem>
              {buff1Skills?.map((skill) => (
                <MenuItem
                  key={skill.name}
                  onClick={() => {
                    setBuff1Menu(null);
                    setBuff1Label(skill.name);

                    // 공격력 버프와 마법력 버프 모두 x 필드 사용
                    const value = skill.x || 0;
                    setBuff1Attack(value);

                    // 마법사인 경우 마력 업데이트
                    if (isJobMagician) {
                      setBuff1MADValue(value);
                      // buff1과 buff2의 마력을 합산
                      setBuffMAD(value + buff2MADValue);
                    }

                    setBuff1Icon(skill.icon);
                    setBuff1IsManual(false);
                  }}
                >
                  {skill.name}
                </MenuItem>
              ))}
            </Menu>

            {/* 설명 */}
            <Box
              sx={{
                display: "flex",
                gap: 0.5,
                alignItems: "center",
                height: 20,
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: "#666", fontSize: "0.75rem", lineHeight: 1 }}
              >
                {isJobMagician ? "마력" : "공격력"}
              </Typography>
              <TextField
                type="number"
                size="small"
                value={buff1Attack}
                onChange={(e) => {
                  if (buff1IsManual) {
                    const value = parseInt(e.target.value) || 0;
                    setBuff1Attack(value);
                    // 마법사인 경우 마력 업데이트
                    if (isJobMagician) {
                      setBuff1MADValue(value);
                      setBuffMAD(value + buff2MADValue);
                    }
                  }
                }}
                disabled={!buff1IsManual}
                sx={{
                  width: 50,
                  height: 20,
                  "& .MuiOutlinedInput-root": {
                    height: 20,
                    minHeight: 20,
                  },
                  "& .MuiInputBase-input": {
                    bgcolor: buff1IsManual ? "white" : "#f0f0f0",
                    p: "0px 4px",
                    fontSize: "0.75rem",
                    textAlign: "center",
                    lineHeight: 1.4,
                  },
                }}
              />
              <Typography
                variant="caption"
                sx={{ color: "#666", fontSize: "0.75rem", lineHeight: 1 }}
              >
                증가
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* 버프 2 */}
        <Divider sx={{ my: 0 }} />
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            padding: 1.5,
            borderRadius: 1,
            bgcolor: "#f5f5f5",
          }}
        >
          {/* 아이콘 */}
          <Box
            sx={{
              minWidth: 50,
              height: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "#ffffff",
              borderRadius: 1,
              overflow: "hidden",
              fontSize: 30,
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

          {/* 정보 영역 */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            {/* 드롭다운 버튼 */}
            <Button
              onClick={(e) => setBuff2Menu(e.currentTarget)}
              size="small"
              sx={{
                width: "100%",
                height: 32,
                fontSize: "0.875rem",
                justifyContent: "flex-start",
                textTransform: "none",
                color: "#333",
                border: "1px solid #ccc",
                backgroundColor: "#fff",
              }}
            >
              {buff2Label}
            </Button>
            <Menu
              anchorEl={buff2Menu}
              open={Boolean(buff2Menu)}
              onClose={() => setBuff2Menu(null)}
            >
              <MenuItem
                onClick={() => {
                  setBuff2Menu(null);
                  setBuff2Label("직접입력");
                  setBuff2Icon(null);
                  setBuff2IsManual(true);
                  setBuff2Attack(0);
                }}
              >
                직접입력
              </MenuItem>
              {buff2Skills?.map((skill) => (
                <MenuItem
                  key={skill.name}
                  onClick={() => {
                    setBuff2Menu(null);
                    setBuff2Label(skill.name);

                    // 공격력 버프와 마법력 버프 모두 x 필드 사용
                    const value = skill.x || 0;
                    setBuff2Attack(value);

                    // 마법사인 경우 마력 업데이트
                    if (isJobMagician) {
                      setBuff2MADValue(value);
                      // buff1과 buff2의 마력을 합산
                      setBuffMAD(buff1MADValue + value);
                    }

                    setBuff2Icon(skill.icon);
                    setBuff2IsManual(false);
                  }}
                >
                  {skill.name}
                </MenuItem>
              ))}
            </Menu>

            {/* 설명 */}
            <Box
              sx={{
                display: "flex",
                gap: 0.5,
                alignItems: "center",
                height: 20,
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: "#666", fontSize: "0.75rem", lineHeight: 1 }}
              >
                {isJobMagician ? "마력" : "공격력"}
              </Typography>
              <TextField
                type="number"
                size="small"
                value={buff2Attack}
                onChange={(e) => {
                  if (buff2IsManual) {
                    const value = parseInt(e.target.value) || 0;
                    setBuff2Attack(value);
                    // 마법사인 경우 마력 업데이트
                    if (isJobMagician) {
                      setBuff2MADValue(value);
                      setBuffMAD(buff1MADValue + value);
                    }
                  }
                }}
                disabled={!buff2IsManual}
                sx={{
                  width: 50,
                  height: 20,
                  "& .MuiOutlinedInput-root": {
                    height: 20,
                    minHeight: 20,
                  },
                  "& .MuiInputBase-input": {
                    bgcolor: buff2IsManual ? "white" : "#f0f0f0",
                    p: "0px 4px",
                    fontSize: "0.75rem",
                    textAlign: "center",
                    lineHeight: 1.4,
                  },
                }}
              />
              <Typography
                variant="caption"
                sx={{ color: "#666", fontSize: "0.75rem", lineHeight: 1 }}
              >
                증가
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* 영웅의 메아리 */}
        <Divider sx={{ my: 0 }} />
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            padding: 1.5,
            borderRadius: 1,
            bgcolor: "#f5f5f5",
          }}
        >
          {/* 아이콘 */}
          <Box
            sx={{
              minWidth: 50,
              height: 50,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "#f0f0f0",
              borderRadius: 1,
              overflow: "hidden",
            }}
          >
            <img
              src={`data:image/webp;base64,${herosEchoData.icon}`}
              alt="영웅의 메아리"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                filter: !heroEcho?.enabled ? "grayscale(100%)" : "none",
              }}
            />
          </Box>

          {/* 정보 영역 */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: 1,
            }}
          >
            {/* 제목과 스위치 */}
            <Box
              sx={{
                display: "flex",
                gap: 1,
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography
                variant="body2"
                sx={{ fontWeight: "bold", fontSize: "0.875rem" }}
              >
                영웅의 메아리
              </Typography>
              <Switch
                checked={heroEcho?.enabled || false}
                onChange={(e) => setHeroEchoEnabled(e.target.checked)}
                size="small"
                sx={{ m: 0 }}
              />
            </Box>

            <Divider sx={{ my: 0 }} />

            {/* 설명 */}
            <Typography
              variant="caption"
              sx={{ color: "#666", fontSize: "0.75rem" }}
            >
              총 공격력/마력 4% 증가
            </Typography>
          </Box>
        </Box>

        {/* 마스터리 스킬 */}
        <Divider sx={{ my: 0 }} />
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          패시브 스킬
          <Typography
            component="span"
            variant="caption"
            sx={{ ml: 0.5, color: "text.secondary" }}
          >
            (스킬 아이콘을 클릭하여 레벨 조정)
          </Typography>
        </Typography>
        <Box
          sx={{
            padding: 1.5,
            borderRadius: 1,
            bgcolor: "#f5f5f5",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 1,
            minHeight: 70,
          }}
        >
          {/* 스킬 1 - 장착 무기에 따라 변동 */}
          {(() => {
            const weaponKey = getWeaponKey(character.getWeaponType());
            const iconData =
              weaponKey &&
              mastery1Data.icons[weaponKey as keyof typeof mastery1Data.icons]
                ? mastery1Data.icons[
                    weaponKey as keyof typeof mastery1Data.icons
                  ]
                : null;
            const skillName =
              weaponKey &&
              mastery1Data.names[weaponKey as keyof typeof mastery1Data.names]
                ? mastery1Data.names[
                    weaponKey as keyof typeof mastery1Data.names
                  ]
                : "마스터리";

            const mastery1Props = mastery1Data.properties as MasteryProperty[];
            const masteryValue = mastery1Props[mastery1]?.mastery ?? 0;
            const displayMastery = masteryValue + 10; // 기본 10% 추가

            return (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Box
                  onClick={() => {
                    if (character.getWeaponType()) {
                      setTempMastery1Level(mastery1);
                      setMastery1Dialog(true);
                    }
                  }}
                  sx={{
                    minWidth: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "#ffffff",
                    borderRadius: 1,
                    fontSize: "1.5rem",
                    overflow: "hidden",
                    cursor: character.getWeaponType() ? "pointer" : "default",
                    "&:hover": character.getWeaponType()
                      ? {
                          opacity: 0.8,
                        }
                      : {},
                  }}
                >
                  {iconData && (
                    <img
                      src={`data:image/png;base64,${iconData}`}
                      alt={skillName}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
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
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: "bold", fontSize: "0.75rem" }}
                  >
                    {skillName}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                    <Typography
                      variant="caption"
                      sx={{ color: "#666", fontSize: "0.7rem" }}
                    >
                      Lv {mastery1} ({displayMastery}%)
                    </Typography>
                  </Box>
                </Box>
              </Box>
            );
          })()}

          {/* 스킬 2 */}
          {(() => {
            const weaponType = character.getWeaponType();
            let skillName = "추가 마스터리";
            let skillIcon = "";
            let hasSkill = false;

            if (weaponType === "활") {
              const bowExpert = mastery2Data.find(
                (m) => m.koreanName === "보우 엑스퍼트",
              );
              if (bowExpert) {
                skillName = bowExpert.koreanName;
                skillIcon = bowExpert.icon;
                hasSkill = true;
              }
            } else if (weaponType === "석궁") {
              const crossbowExpert = mastery2Data.find(
                (m) => m.koreanName === "크로스보우 엑스퍼트",
              );
              if (crossbowExpert) {
                skillName = crossbowExpert.koreanName;
                skillIcon = crossbowExpert.icon;
                hasSkill = true;
              }
            } else if (weaponType === "창" || weaponType === "폴암") {
              const beholder = mastery2Data.find(
                (m) => m.koreanName === "비홀더",
              );
              if (beholder) {
                skillName = beholder.koreanName;
                skillIcon = beholder.icon;
                hasSkill = true;
              }
            } else if (weaponType) {
              skillName = "없음";
              hasSkill = false;
            }

            let skillData: MasterySkill | null = null;
            if (hasSkill) {
              const skill = (mastery2Data as MasterySkill[]).find(
                (m) => m.koreanName === skillName,
              );
              if (skill) {
                skillData = skill;
              }
            }

            const masteryProp: MasteryProperty | undefined =
              skillData?.properties[mastery2];
            const masteryAttack = masteryProp?.att ?? 0;
            const masteryValue = masteryProp?.mastery ?? 0;

            return (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Box
                  onClick={() => {
                    if (hasSkill && skillData) {
                      const currentMaxLevel = skillData.properties.length - 1;
                      // 현재 레벨이 maxLevel을 초과하면 maxLevel로 설정
                      const validLevel = Math.min(mastery2, currentMaxLevel);
                      setTempMastery2Level(validLevel);
                      setMastery2Dialog(true);
                    }
                  }}
                  sx={{
                    minWidth: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: "#ffffff",
                    borderRadius: 1,
                    fontSize: "1.5rem",
                    overflow: "hidden",
                    cursor: hasSkill ? "pointer" : "default",
                    "&:hover": hasSkill
                      ? {
                          opacity: 0.8,
                        }
                      : {},
                  }}
                >
                  {skillIcon ? (
                    <img
                      src={`data:image/png;base64,${skillIcon}`}
                      alt={skillName}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                      }}
                    />
                  ) : null}
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
                    {skillName}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
                    {hasSkill && (
                      <Typography
                        variant="caption"
                        sx={{ color: "#666", fontSize: "0.7rem" }}
                      >
                        Lv {mastery2} ({masteryValue}%){" "}
                        {masteryAttack > 0 ? `, 공격력 +${masteryAttack}` : ""}
                      </Typography>
                    )}
                    {!hasSkill && (
                      <Typography
                        variant="caption"
                        sx={{ color: "#666", fontSize: "0.7rem" }}
                      >
                        없음
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            );
          })()}
        </Box>
      </Box>

      {/* Mastery 1 Dialog */}
      <Dialog
        open={mastery1Dialog}
        onClose={() => setMastery1Dialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>마스터리 레벨 설정</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              type="number"
              label="레벨"
              value={tempMastery1Level}
              onChange={(e) =>
                setTempMastery1Level(
                  Math.min(
                    Math.max(0, parseInt(e.target.value) || 0),
                    mastery1Data.properties.length - 1,
                  ),
                )
              }
              inputProps={{ min: 0, max: mastery1Data.properties.length - 1 }}
              fullWidth
            />
            <Box>
              <Typography variant="body2" color="text.secondary">
                숙련도:{" "}
                {(mastery1Data.properties[tempMastery1Level]?.mastery || 0) +
                  10}
                % (기본 10% + 스킬{" "}
                {mastery1Data.properties[tempMastery1Level]?.mastery || 0}%)
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {[0, 5, 10, 15, 20].map((level) => (
                <Button
                  key={level}
                  size="small"
                  variant={
                    tempMastery1Level === level ? "contained" : "outlined"
                  }
                  onClick={() => setTempMastery1Level(level)}
                >
                  Lv {level}
                </Button>
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMastery1Dialog(false)}>취소</Button>
          <Button
            onClick={() => {
              setMastery1(tempMastery1Level);
              setMastery1Dialog(false);
            }}
            variant="contained"
          >
            적용
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mastery 2 Dialog */}
      <Dialog
        open={mastery2Dialog}
        onClose={() => setMastery2Dialog(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>추가 마스터리 레벨 설정</DialogTitle>
        <DialogContent>
          {(() => {
            const weaponType = character.getWeaponType();
            let skillData = null;
            if (weaponType === "활") {
              skillData = mastery2Data.find(
                (m) => m.koreanName === "보우 엑스퍼트",
              );
            } else if (weaponType === "석궁") {
              skillData = mastery2Data.find(
                (m) => m.koreanName === "크로스보우 엑스퍼트",
              );
            } else if (weaponType === "창" || weaponType === "폴암") {
              skillData = mastery2Data.find((m) => m.koreanName === "비홀더");
            }

            if (!skillData) return null;

            const maxLevel = skillData.properties.length - 1;

            return (
              <Box
                sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}
              >
                <TextField
                  type="number"
                  label="레벨"
                  value={tempMastery2Level}
                  onChange={(e) =>
                    setTempMastery2Level(
                      Math.min(
                        Math.max(0, parseInt(e.target.value) || 0),
                        maxLevel,
                      ),
                    )
                  }
                  inputProps={{ min: 0, max: maxLevel }}
                  fullWidth
                />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    숙련도: {skillData.properties[tempMastery2Level]?.mastery ?? 0}%
                  </Typography>
                  {(() => {
                    const prop: MasteryProperty | undefined =
                      skillData.properties[tempMastery2Level];
                    const attValue = prop?.att ?? 0;
                    if (attValue > 0) {
                      return (
                        <Typography variant="body2" color="text.secondary">
                          공격력: +{attValue}
                        </Typography>
                      );
                    }
                    return null;
                  })()}
                </Box>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {[
                    0,
                    Math.floor(maxLevel / 3),
                    Math.floor((maxLevel * 2) / 3),
                    maxLevel,
                  ].map((level) => (
                    <Button
                      key={level}
                      size="small"
                      variant={
                        tempMastery2Level === level ? "contained" : "outlined"
                      }
                      onClick={() => setTempMastery2Level(level)}
                    >
                      Lv {level}
                    </Button>
                  ))}
                </Box>
              </Box>
            );
          })()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMastery2Dialog(false)}>취소</Button>
          <Button
            onClick={() => {
              setMastery2(tempMastery2Level);
              setMastery2Dialog(false);
            }}
            variant="contained"
          >
            적용
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
