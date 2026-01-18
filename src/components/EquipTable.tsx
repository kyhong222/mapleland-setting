import { Box, Typography, Tooltip } from "@mui/material";
import { useCharacter } from "../contexts/CharacterContext";
import { EQUIPMENT_LAYOUT } from "../types/equipment";
import type { EquipmentSlot } from "../types/equipment";

export default function EquipTable() {
  const { character, unequipItem } = useCharacter();

  const equipments = character.getEquipments();
  const equipMap = new Map(equipments.map((eq) => [eq.slot, eq]));

  // 하의 슬롯 빨간색 표시 여부 (상의에 전신 장착 시)
  const hasOverall = equipMap.has("상의");

  const handleDoubleClick = (slot: string) => {
    unequipItem(slot as EquipmentSlot);
  };

  const renderSlot = (slotName: string | null) => {
    if (!slotName) {
      return <Box key="empty" sx={{ width: 60, height: 60 }} />;
    }

    const equipment = equipMap.get(slotName);
    const isBottomSlotBlocked = slotName === "하의" && hasOverall;

    return (
      <Tooltip
        key={slotName}
        title={
          equipment
            ? `${equipment.name}\n공: ${equipment.attack || 0} | 힘: ${equipment.str || 0} | 민: ${
                equipment.dex || 0
              } | 지: ${equipment.int || 0} | 럭: ${equipment.luk || 0}`
            : ""
        }
        placement="top"
        disableInteractivePopover
      >
        <Box
          onDoubleClick={() => equipment && handleDoubleClick(slotName)}
          sx={{
            width: 60,
            height: 60,
            border: "1px solid #ccc",
            borderRadius: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: isBottomSlotBlocked ? "#FFCDD2" : equipment ? "white" : "#f5f5f5",
            cursor: equipment ? "pointer" : "default",
            fontSize: "0.75rem",
            textAlign: "center",
            p: 0.5,
            wordBreak: "keep-all",
            "&:hover": equipment
              ? {
                  bgcolor: isBottomSlotBlocked ? "#FFAB91" : "#e3f2fd",
                }
              : {},
          }}
        >
          {equipment ? equipment.name : slotName}
        </Box>
      </Tooltip>
    );
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
        장비
      </Typography>

      {/* 장비 그리드 */}
      <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
        {EQUIPMENT_LAYOUT.map((row, rowIndex) => (
          <Box key={rowIndex} sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
            {row.map((slot) => renderSlot(slot))}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
