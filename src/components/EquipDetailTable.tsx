import { Box, Typography } from "@mui/material";
import type { Equipment } from "../types/equipment";
import { EQUIPMENT_LAYOUT } from "../types/equipment";

interface EquipDetailTableProps {
  equipments: Equipment[];
  postItemIcons: Map<number, string>;
  getIconSrc: (equipment: { id?: number; icon?: string }) => string | null;
  isJobMagician: boolean;
  jobName?: string;
}

export default function EquipDetailTable({
  equipments,
  // postItemIcons,
  getIconSrc,
  isJobMagician,
  jobName,
}: EquipDetailTableProps) {
  const slotOrder: string[] = EQUIPMENT_LAYOUT.flat().filter((s) => s !== null);
  const equippedItems = equipments
    .filter((eq) => eq.name)
    .sort((a, b) => slotOrder.indexOf(a.slot) - slotOrder.indexOf(b.slot));

  if (equippedItems.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          장착된 장비가 없습니다
        </Typography>
      </Box>
    );
  }

  const getStatLine = (eq: Equipment) => {
    const parts: string[] = [];
    if (isJobMagician) {
      if (eq.mad) parts.push(`마:${eq.mad}`);
    } else {
      if (eq.attack) parts.push(`공:${eq.attack}`);
    }
    if (eq.str) parts.push(`힘:${eq.str}`);
    if (eq.dex) parts.push(`덱:${eq.dex}`);
    if (eq.int) parts.push(`인:${eq.int}`);
    if (eq.luk) parts.push(`럭:${eq.luk}`);
    if (eq.acc) parts.push(`명:${eq.acc}`);
    if (eq.eva) parts.push(`회:${eq.eva}`);
    return parts.join(" ");
  };

  const weapon = equippedItems.find((eq) => eq.slot === "무기");
  const thiefIncludeStr = jobName === "thief" && weapon?.type === "단검" && (weapon.reqStr || 0) >= 1;

  const getSum = (eq: Equipment): string | null => {
    const showSum = !(eq.slot === "무기" && !isJobMagician);
    if (!showSum) return null;
    let sum = 0;
    if (jobName === "warrior") sum = (eq.str || 0) + (eq.dex || 0) + (eq.acc || 0) + (eq.luk || 0) / 2;
    else if (jobName === "archer") sum = (eq.str || 0) + (eq.dex || 0);
    else if (jobName === "magician") sum = (eq.mad || 0) + (eq.int || 0) + (eq.luk || 0);
    else if (jobName === "thief") sum = (eq.dex || 0) + (eq.luk || 0) + (thiefIncludeStr ? (eq.str || 0) : 0);
    if (sum <= 0) return null;
    return Number.isInteger(sum) ? String(sum) : sum.toFixed(1);
  };

  return (
    <Box sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 1 }}>
      {equippedItems.map((eq) => {
        const iconSrc = getIconSrc(eq);
        const statLine = getStatLine(eq);
        const sum = getSum(eq);

        return (
          <Box
            key={eq.slot}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              p: 1,
              border: "1px solid #e0e0e0",
              borderRadius: 1,
              bgcolor: "white",
            }}
          >
            {/* 아이콘 */}
            <Box
              sx={{
                width: 40,
                height: 40,
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {iconSrc ? (
                <img
                  src={iconSrc}
                  alt={eq.name || ""}
                  style={{ maxWidth: "100%", maxHeight: "100%" }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                <Typography variant="caption">{eq.slot}</Typography>
              )}
            </Box>

            {/* 이름 + 스탯 */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: "bold" }} noWrap>
                  {eq.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  [{eq.slot}]
                </Typography>
              </Box>
              {statLine && (
                <Typography variant="caption" color="text.secondary" noWrap>
                  {statLine}
                </Typography>
              )}
            </Box>

            {/* 합 (오른쪽 끝) */}
            {sum && (
              <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0 }}>
                합:{sum}
              </Typography>
            )}
          </Box>
        );
      })}
    </Box>
  );
}
