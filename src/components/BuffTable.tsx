import {
  Box,
  Typography,
  TextField,
  Divider,
  InputAdornment,
  Button,
  Switch,
} from "@mui/material";
import { useState } from "react";
import { useCharacter } from "../contexts/CharacterContext";
import type { PassiveSkillData } from "../types/passive";
import { passivesByJob } from "../types/passive";
import mapleWarriorData from "../data/buff/MapleWarrior/MapleWarrior.json";
import herosEchoData from "../data/buff/HerosEcho/herosecho.json";
import mastery1Data from "../data/buff/mastery/mastery1.json";
import mastery2Data from "../data/buff/mastery/mastery2.json";
import MasteryDialog from "./MasteryDialog";
import BuffSelectDialog from "./BuffSelectDialog";
import PassiveDialog from "./PassiveDialog";

export default function BuffTable() {
  const {
    character,
    setMapleWarriorLevel,
    setHeroEchoEnabled,
    mastery1,
    mastery2,
    passiveLevels,
  } = useCharacter();

  const [mastery1Dialog, setMastery1Dialog] = useState(false);
  const [mastery2Dialog, setMastery2Dialog] = useState(false);
  const [passiveDialogData, setPassiveDialogData] =
    useState<PassiveSkillData | null>(null);
  const [tempMastery1Level, setTempMastery1Level] = useState(0);
  const [tempMastery2Level, setTempMastery2Level] = useState(0);
  const [tempPassiveLevel, setTempPassiveLevel] = useState(0);

  const mapleWarrior = character.getBuff("mapleWarrior");
  const heroEcho = character.getBuff("heroEcho");
  const job = character.getJob();

  const handleMapleWarriorChange = (value: number) => {
    setMapleWarriorLevel(value);
  };

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

        {/* 버프 선택 (버프1, 버프2) */}
        <BuffSelectDialog />

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
            const weaponType = character.getWeaponType();
            let weaponKey = getWeaponKey(weaponType);

            // 도적 아대는 자벨린 마스터리로 표시
            if (weaponType === "아대") {
              weaponKey = "javelin";
            }

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

            const hasSkill = !!iconData;

            if (!hasSkill) {
              return (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Box
                    sx={{
                      minWidth: 40,
                      height: 40,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "#f0f0f0",
                      borderRadius: 1,
                      fontSize: "0.75rem",
                      overflow: "hidden",
                    }}
                  >
                    -
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
                      기본 마스터리
                    </Typography>
                    <Box
                      sx={{ display: "flex", gap: 0.5, alignItems: "center" }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ color: "#666", fontSize: "0.7rem" }}
                      >
                        없음
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              );
            }

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
                      Lv {mastery1}
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
              skillName = "추가 마스터리";
              hasSkill = false;
            }

            return (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Box
                  onClick={() => {
                    if (hasSkill) {
                      setTempMastery2Level(mastery2);
                      setMastery2Dialog(true);
                    }
                  }}
                  sx={{
                    minWidth: 40,
                    height: 40,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: hasSkill ? "#ffffff" : "#f0f0f0",
                    borderRadius: 1,
                    fontSize: hasSkill ? "1.5rem" : "0.75rem",
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
                  {!skillIcon && <>-</>}
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
                        Lv {mastery2}
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

          {/* 패시브 스킬 */}
          {(() => {
            const jobEngName = job?.engName;
            if (!jobEngName) return null;
            const passives = passivesByJob[jobEngName] || [];
            return passives.map((passive) => {
              const level = passiveLevels[passive.englishName] ?? 0;

              // requireSecondaryType 체크 (예: 쉴드 마스터리)
              const secondaryItem = character.getEquippedItem("보조무기");
              const meetsRequirement = !passive.requireSecondaryType ||
                secondaryItem?.type === passive.requireSecondaryType;

              return (
                <Box key={passive.englishName} sx={{ display: "flex", gap: 1 }}>
                  <Box
                    onClick={() => {
                      setTempPassiveLevel(passiveLevels[passive.englishName] ?? 0);
                      setPassiveDialogData(passive);
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
          })()}
        </Box>
      </Box>

      {/* 마스터리 다이얼로그 */}
      <MasteryDialog
        mastery1Open={mastery1Dialog}
        onMastery1Close={() => setMastery1Dialog(false)}
        tempMastery1Level={tempMastery1Level}
        onTempMastery1Change={setTempMastery1Level}
        mastery2Open={mastery2Dialog}
        onMastery2Close={() => setMastery2Dialog(false)}
        tempMastery2Level={tempMastery2Level}
        onTempMastery2Change={setTempMastery2Level}
      />

      {/* 패시브 스킬 다이얼로그 */}
      <PassiveDialog
        passive={passiveDialogData}
        onClose={() => setPassiveDialogData(null)}
        tempLevel={tempPassiveLevel}
        onTempLevelChange={setTempPassiveLevel}
      />
    </Box>
  );
}
