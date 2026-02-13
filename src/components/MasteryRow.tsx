import { Box, Typography } from "@mui/material";
import mastery1Data from "../data/buff/mastery/mastery1.json";
import mastery2Data from "../data/buff/mastery/mastery2.json";

interface MasteryRowProps {
  weaponType: string | null;
  mastery1: number;
  mastery2: number;
  onMastery1Click: () => void;
  onMastery2Click: () => void;
}

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

export default function MasteryRow({
  weaponType,
  mastery1,
  mastery2,
  onMastery1Click,
  onMastery2Click,
}: MasteryRowProps) {
  // 마스터리 1 데이터
  let weaponKey = getWeaponKey(weaponType);
  if (weaponType === "아대") {
    weaponKey = "javelin";
  }

  const mastery1Icon =
    weaponKey &&
    mastery1Data.icons[weaponKey as keyof typeof mastery1Data.icons]
      ? mastery1Data.icons[weaponKey as keyof typeof mastery1Data.icons]
      : null;
  const mastery1Name =
    weaponKey &&
    mastery1Data.names[weaponKey as keyof typeof mastery1Data.names]
      ? mastery1Data.names[weaponKey as keyof typeof mastery1Data.names]
      : "마스터리";
  const hasMastery1 = !!mastery1Icon;

  // 마스터리 2 데이터
  let mastery2Name = "추가 마스터리";
  let mastery2Icon = "";
  let hasMastery2 = false;

  if (weaponType === "활") {
    const bowExpert = mastery2Data.find(
      (m) => m.koreanName === "보우 엑스퍼트",
    );
    if (bowExpert) {
      mastery2Name = bowExpert.koreanName;
      mastery2Icon = bowExpert.icon;
      hasMastery2 = true;
    }
  } else if (weaponType === "석궁") {
    const crossbowExpert = mastery2Data.find(
      (m) => m.koreanName === "크로스보우 엑스퍼트",
    );
    if (crossbowExpert) {
      mastery2Name = crossbowExpert.koreanName;
      mastery2Icon = crossbowExpert.icon;
      hasMastery2 = true;
    }
  } else if (weaponType === "창" || weaponType === "폴암") {
    const beholder = mastery2Data.find(
      (m) => m.koreanName === "비홀더",
    );
    if (beholder) {
      mastery2Name = beholder.koreanName;
      mastery2Icon = beholder.icon;
      hasMastery2 = true;
    }
  } else if (weaponType) {
    mastery2Name = "추가 마스터리";
    hasMastery2 = false;
  }

  return (
    <>
      {/* 마스터리 1 */}
      {!hasMastery1 ? (
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
      ) : (
        <Box sx={{ display: "flex", gap: 1 }}>
          <Box
            onClick={() => {
              if (weaponType) {
                onMastery1Click();
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
              cursor: weaponType ? "pointer" : "default",
              "&:hover": weaponType
                ? {
                    opacity: 0.8,
                  }
                : {},
            }}
          >
            {mastery1Icon && (
              <img
                src={`data:image/png;base64,${mastery1Icon}`}
                alt={mastery1Name}
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
              {mastery1Name}
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
      )}

      {/* 마스터리 2 */}
      <Box sx={{ display: "flex", gap: 1 }}>
        <Box
          onClick={() => {
            if (hasMastery2) {
              onMastery2Click();
            }
          }}
          sx={{
            minWidth: 40,
            height: 40,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: hasMastery2 ? "#ffffff" : "#f0f0f0",
            borderRadius: 1,
            fontSize: hasMastery2 ? "1.5rem" : "0.75rem",
            overflow: "hidden",
            cursor: hasMastery2 ? "pointer" : "default",
            "&:hover": hasMastery2
              ? {
                  opacity: 0.8,
                }
              : {},
          }}
        >
          {mastery2Icon ? (
            <img
              src={`data:image/png;base64,${mastery2Icon}`}
              alt={mastery2Name}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
              }}
            />
          ) : null}
          {!mastery2Icon && <>-</>}
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
            {mastery2Name}
          </Typography>
          <Box sx={{ display: "flex", gap: 0.5, alignItems: "center" }}>
            {hasMastery2 && (
              <Typography
                variant="caption"
                sx={{ color: "#666", fontSize: "0.7rem" }}
              >
                Lv {mastery2}
              </Typography>
            )}
            {!hasMastery2 && (
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
    </>
  );
}
