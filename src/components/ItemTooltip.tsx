import { Box, Typography } from "@mui/material";

interface ItemTooltipProps {
  name: string;
  slot: string;
  type?: string;
  icon?: string;
  attack?: number;
  str?: number;
  dex?: number;
  int?: number;
  luk?: number;
  mad?: number;
  pdef?: number;
  mdef?: number;
  acc?: number;
  eva?: number;
  speed?: number;
  jump?: number;
  hp?: number;
  mp?: number;
  isJobMagician?: boolean;
}

export default function ItemTooltip({
  name,
  slot,
  icon,
  attack,
  str,
  dex,
  int: intStat,
  luk,
  mad,
  pdef,
  mdef,
  acc,
  eva,
  speed,
  jump,
  hp,
  mp,
  isJobMagician,
}: ItemTooltipProps) {
  const statLines: { label: string; value: number }[] = [];

  if (isJobMagician) {
    if (mad) statLines.push({ label: "마력", value: mad });
  } else {
    if (attack) statLines.push({ label: "공격력", value: attack });
  }

  if (str) statLines.push({ label: "STR", value: str });
  if (dex) statLines.push({ label: "DEX", value: dex });
  if (intStat) statLines.push({ label: "INT", value: intStat });
  if (luk) statLines.push({ label: "LUK", value: luk });
  if (pdef) statLines.push({ label: "물리방어력", value: pdef });
  if (mdef) statLines.push({ label: "마법방어력", value: mdef });
  if (acc) statLines.push({ label: "명중률", value: acc });
  if (eva) statLines.push({ label: "회피율", value: eva });
  // 펫장비만 이동속도와 점프력 표시
  if (slot === "펫장비") {
    if (speed) statLines.push({ label: "이동속도", value: speed });
    if (jump) statLines.push({ label: "점프력", value: jump });
  }
  if (hp) statLines.push({ label: "HP", value: hp });
  if (mp) statLines.push({ label: "MP", value: mp });

  return (
    <Box sx={{ minWidth: 160, p: 0.5 }}>
      {/* 아이템 이름 */}
      <Typography
        variant="body2"
        sx={{ fontWeight: "bold", color: "#FFD700", textAlign: "center", mb: 0.5 }}
      >
        {name}
      </Typography>

      {/* 아이콘 */}
      {icon && (
        <Box sx={{ display: "flex", justifyContent: "center", mb: 0.5 }}>
          <img
            src={icon}
            alt=""
            style={{ maxWidth: 48, maxHeight: 48 }}
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        </Box>
      )}

      {/* 장비분류 */}
      <Typography variant="caption" sx={{ color: "#ccc", display: "block", textAlign: "center", mb: 0.5 }}>
        장비분류: {slot}
      </Typography>
      {/* 착용제한 + 구분선 */}
       {/* <Box sx={{ borderTop: "1px solid #555", mt: 0.5, pt: 0.5 }}> 
      <Typography variant="caption" sx={{ color: "#ccc", display: "block", textAlign: "center", mb: 0.5 }}>
        착용제한
        {Object.entries(requireStats).map(([key, value]) =>
          value ? ` ${key.toUpperCase()}: ${value}` : ""
        ).join(", ") || " 0"}
      </Typography>
       </Box> */}
      {/* 구분선 */}
      {statLines.length > 0 && (
        <Box sx={{ borderTop: "1px solid #555", mt: 0.5, pt: 0.5 }}>
          {statLines.map(({ label, value }) => (
            <Typography key={label} variant="caption" sx={{ display: "block", color: "#fff" }}>
              {label}: +{value}
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  );
}
