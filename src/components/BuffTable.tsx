import { Box, Typography, TextField, Divider, InputAdornment, Button, Select, MenuItem, Switch } from "@mui/material";
import { useCharacter } from "../contexts/CharacterContext";
import mapleWarriorData from "../data/buff/MapleWarrior/MapleWarrior.json";
import herosEchoData from "../data/buff/HerosEcho/herosecho.json";
import mastery1Data from "../data/buff/mastery/mastery1.json";
import mastery2Data from "../data/buff/mastery/mastery2.json";
import buff1Data from "../data/buff/buff/buff1.json";
import buff2Data from "../data/buff/buff/buff2.json";

export default function BuffTable() {
  const {
    character,
    setMapleWarriorLevel,
    setBuff1Attack,
    setBuff2Attack,
    setHeroEchoEnabled,
    buff1Attack,
    buff2Attack,
    buff1Type,
    buff2Type,
    setBuff1Type,
    setBuff2Type,
  } = useCharacter();

  const mapleWarrior = character.getBuff("mapleWarrior");
  const heroEcho = character.getBuff("heroEcho");

  const handleMapleWarriorChange = (value: number) => {
    setMapleWarriorLevel(value);
  };

  // 무기 타입을 mastery1.json의 키로 변환
  const getWeaponKey = (weaponType: string | null): string | null => {
    if (!weaponType) return null;
    const keyMap: { [key: string]: string } = {
      검: "sword",
      도끼: "axe",
      둔기: "mace",
      창: "spear",
      폴암: "polearm",
      활: "bow",
      석궁: "crossbow",
      단검: "dagger",
      자벨린: "javelin",
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
      <Typography variant="body2" sx={{ fontWeight: "bold", p: 1.5, borderBottom: "1px solid #ccc" }}>
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
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </Box>

          {/* 정보 영역 */}
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 1 }}>
            {/* 제목과 레벨 입력 */}
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", justifyContent: "space-between" }}>
              <Typography variant="body2" sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>
                메이플 용사
              </Typography>
              <TextField
                type="number"
                size="small"
                value={mapleWarrior?.level || 0}
                onChange={(e) => handleMapleWarriorChange(parseInt(e.target.value) || 0)}
                inputProps={{ min: 0, max: 20 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start" sx={{ fontSize: "0.65rem", userSelect: "none" }}>
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
            <Box sx={{ display: "flex", gap: 0.5, alignItems: "center", justifyContent: "space-between" }}>
              <Typography variant="caption" sx={{ color: "#666", fontSize: "0.75rem" }}>
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
                  variant={mapleWarrior?.level === 10 ? "contained" : "outlined"}
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
                  variant={mapleWarrior?.level === 20 ? "contained" : "outlined"}
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
              bgcolor: buff1Type === "custom" ? "#ffffff" : "#f0f0f0",
              borderRadius: 1,
              overflow: "hidden",
            }}
          >
            {buff1Type !== "custom" &&
              buff1Data.skills &&
              buff1Data.skills.length > 0 &&
              (() => {
                const selectedIndex = parseInt(buff1Type.split("-")[1] || "0");
                return (
                  buff1Data.skills[selectedIndex] && (
                    <img
                      src={`data:image/png;base64,${buff1Data.skills[selectedIndex].icon}`}
                      alt="버프 1"
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  )
                );
              })()}
          </Box>

          {/* 정보 영역 */}
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 1 }}>
            {/* 드롭다운 메뉴 */}
            <Select
              value={buff1Type}
              onChange={(e) => {
                setBuff1Type(e.target.value as "custom" | "preset");
              }}
              size="small"
              sx={{
                width: "100%",
                height: 32,
                fontSize: "0.875rem",
                "& .MuiOutlinedInput-input": {
                  p: 0.75,
                },
              }}
            >
              <MenuItem value="custom">직접 입력</MenuItem>
              {buff1Data.skills &&
                buff1Data.skills.map((skill, index) => (
                  <MenuItem key={index} value={`preset-${index}`}>
                    {skill.name}
                  </MenuItem>
                ))}
            </Select>

            <Divider sx={{ my: 0 }} />

            {/* 설명 */}
            <Box sx={{ display: "flex", gap: 0.5, alignItems: "center", height: 20 }}>
              <Typography variant="caption" sx={{ color: "#666", fontSize: "0.75rem", lineHeight: 1 }}>
                공격력
              </Typography>
              {buff1Type === "custom" ? (
                <TextField
                  type="number"
                  size="small"
                  value={buff1Attack}
                  onChange={(e) => setBuff1Attack(parseInt(e.target.value) || 0)}
                  sx={{
                    width: 50,
                    height: 20,
                    "& .MuiOutlinedInput-root": {
                      height: 20,
                      minHeight: 20,
                    },
                    "& .MuiInputBase-input": {
                      bgcolor: "white",
                      p: "0px 4px",
                      fontSize: "0.75rem",
                      textAlign: "center",
                      lineHeight: 1.4,
                    },
                  }}
                />
              ) : (
                (() => {
                  const selectedIndex = parseInt(buff1Type.split("-")[1] || "0");
                  const selectedSkill = buff1Data.skills?.[selectedIndex];
                  return (
                    <Typography variant="caption" sx={{ color: "#666", fontSize: "0.75rem", fontWeight: "bold", lineHeight: 1 }}>
                      {selectedSkill?.x || 0}
                    </Typography>
                  );
                })()
              )}
              <Typography variant="caption" sx={{ color: "#666", fontSize: "0.75rem", lineHeight: 1 }}>
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
              bgcolor: buff2Type === "custom" ? "#ffffff" : "#f0f0f0",
              borderRadius: 1,
              overflow: "hidden",
            }}
          >
            {buff2Type !== "custom" &&
              buff2Data.skills &&
              buff2Data.skills.length > 0 &&
              (() => {
                const selectedIndex = parseInt(buff2Type.split("-")[1] || "0");
                return (
                  buff2Data.skills[selectedIndex] && (
                    <img
                      src={`data:image/png;base64,${buff2Data.skills[selectedIndex].icon}`}
                      alt="버프 2"
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  )
                );
              })()}
          </Box>

          {/* 정보 영역 */}
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 1 }}>
            {/* 드롭다운 메뉴 */}
            <Select
              value={buff2Type}
              onChange={(e) => {
                setBuff2Type(e.target.value as "custom" | "preset");
              }}
              size="small"
              sx={{
                width: "100%",
                height: 32,
                fontSize: "0.875rem",
                "& .MuiOutlinedInput-input": {
                  p: 0.75,
                },
              }}
            >
              <MenuItem value="custom">직접 입력</MenuItem>
              {buff2Data.skills &&
                buff2Data.skills.map((skill, index) => (
                  <MenuItem key={index} value={`preset-${index}`}>
                    {skill.name}
                  </MenuItem>
                ))}
            </Select>

            <Divider sx={{ my: 0 }} />

            {/* 설명 */}
            <Box sx={{ display: "flex", gap: 0.5, alignItems: "center", height: 20 }}>
              <Typography variant="caption" sx={{ color: "#666", fontSize: "0.75rem", lineHeight: 1 }}>
                공격력
              </Typography>
              {buff2Type === "custom" ? (
                <TextField
                  type="number"
                  size="small"
                  value={buff2Attack}
                  onChange={(e) => setBuff2Attack(parseInt(e.target.value) || 0)}
                  sx={{
                    width: 50,
                    height: 20,
                    "& .MuiOutlinedInput-root": {
                      height: 20,
                      minHeight: 20,
                    },
                    "& .MuiInputBase-input": {
                      bgcolor: "white",
                      p: "0px 4px",
                      fontSize: "0.75rem",
                      textAlign: "center",
                      lineHeight: 1.4,
                    },
                  }}
                />
              ) : (
                (() => {
                  const selectedIndex = parseInt(buff2Type.split("-")[1] || "0");
                  const selectedSkill = buff2Data.skills?.[selectedIndex];
                  return (
                    <Typography variant="caption" sx={{ color: "#666", fontSize: "0.75rem", fontWeight: "bold", lineHeight: 1 }}>
                      {selectedSkill?.x || 0}
                    </Typography>
                  );
                })()
              )}
              <Typography variant="caption" sx={{ color: "#666", fontSize: "0.75rem", lineHeight: 1 }}>
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
              style={{ width: "100%", height: "100%", objectFit: "contain" }}
            />
          </Box>

          {/* 정보 영역 */}
          <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 1 }}>
            {/* 제목과 스위치 */}
            <Box sx={{ display: "flex", gap: 1, alignItems: "center", justifyContent: "space-between" }}>
              <Typography variant="body2" sx={{ fontWeight: "bold", fontSize: "0.875rem" }}>
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
            <Typography variant="caption" sx={{ color: "#666", fontSize: "0.75rem" }}>
              총 공격력/마력 4% 증가
            </Typography>
          </Box>
        </Box>

        {/* 마스터리 스킬 */}
        <Divider sx={{ my: 0 }} />
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
              weaponKey && mastery1Data.icons[weaponKey as keyof typeof mastery1Data.icons]
                ? mastery1Data.icons[weaponKey as keyof typeof mastery1Data.icons]
                : null;
            const skillName =
              weaponKey && mastery1Data.names[weaponKey as keyof typeof mastery1Data.names]
                ? mastery1Data.names[weaponKey as keyof typeof mastery1Data.names]
                : "마스터리";

            return (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Box
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
                  }}
                >
                  {iconData && (
                    <img
                      src={`data:image/png;base64,${iconData}`}
                      alt={skillName}
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  )}
                </Box>
                <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <Typography variant="body2" sx={{ fontWeight: "bold", fontSize: "0.75rem" }}>
                    {skillName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#666", fontSize: "0.65rem" }}>
                    {character.getWeaponType() ? "공격력 증가" : "무기 장착 필요"}
                  </Typography>
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
              const bowExpert = mastery2Data.find((m) => m.koreanName === "보우 엑스퍼트");
              if (bowExpert) {
                skillName = bowExpert.koreanName;
                skillIcon = bowExpert.icon;
                hasSkill = true;
              }
            } else if (weaponType === "석궁") {
              const crossbowExpert = mastery2Data.find((m) => m.koreanName === "크로스보우 엑스퍼트");
              if (crossbowExpert) {
                skillName = crossbowExpert.koreanName;
                skillIcon = crossbowExpert.icon;
                hasSkill = true;
              }
            } else if (weaponType === "창" || weaponType === "폴암") {
              const beholder = mastery2Data.find((m) => m.koreanName === "비홀더");
              if (beholder) {
                skillName = beholder.koreanName;
                skillIcon = beholder.icon;
                hasSkill = true;
              }
            } else if (weaponType) {
              skillName = "없음";
              hasSkill = false;
            }

            return (
              <Box sx={{ display: "flex", gap: 1 }}>
                <Box
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
                  }}
                >
                  {skillIcon ? (
                    <img
                      src={skillIcon}
                      alt={skillName}
                      style={{ width: "100%", height: "100%", objectFit: "contain" }}
                    />
                  ) : null}
                </Box>
                <Box sx={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <Typography variant="body2" sx={{ fontWeight: "bold", fontSize: "0.75rem" }}>
                    {skillName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#666", fontSize: "0.65rem" }}>
                    {!weaponType ? "무기 장착 필요" : hasSkill ? "공격력 증가" : "없음"}
                  </Typography>
                </Box>
              </Box>
            );
          })()}
        </Box>
      </Box>
    </Box>
  );
}
