import { Box, Typography, Tooltip } from "@mui/material";
import { EQUIPMENT_LAYOUT, type Equipment } from "../types/equipment";

interface EquipTableProps {
  equipments?: Equipment[];
  onUnequip?: (slot: string) => void;
  onSlotClick?: (slot: string) => void;
}

export default function EquipTable({ equipments = [], onUnequip, onSlotClick }: EquipTableProps) {
  const getEquipment = (slot: string | null) => {
    if (!slot) return null;
    return equipments.find((eq) => eq.slot === slot);
  };

  // 상의에 전신이 있는지 확인
  const hasOverall = equipments.some((eq) => eq.slot === "상의");

  return (
    <Box
      sx={{
        width: 300,
        flex: 1,
        border: "1px solid #ccc",
        borderRadius: 1,
        bgcolor: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        p: 2,
      }}
    >
      <Typography variant="body2" sx={{ mb: 1, fontWeight: "bold" }}>
        장비창
      </Typography>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 1,
        }}
      >
        {EQUIPMENT_LAYOUT.flat().map((slot, index) => {
          if (!slot) {
            // 빈칸
            return <Box key={`empty-${index}`} sx={{ aspectRatio: "1/1" }} />;
          }

          const equipment = getEquipment(slot);
          const isEmpty = !equipment || !equipment.name;

          // 하의 슬롯이고 상의에 전신이 있는 경우
          const isBottomDisabled = slot === "하의" && hasOverall;

          // 툴팁 내용 생성
          const tooltipContent = !isEmpty
            ? [
                equipment.name,
                equipment.attack ? `공격력: +${equipment.attack}` : null,
                equipment.str ? `힘: +${equipment.str}` : null,
                equipment.dex ? `민첩: +${equipment.dex}` : null,
                equipment.int ? `지력: +${equipment.int}` : null,
                equipment.luk ? `행운: +${equipment.luk}` : null,
              ]
                .filter(Boolean)
                .join("\n")
            : "";

          return (
            <Tooltip
              key={`${slot}-${equipment?.name || "empty"}`}
              title={<div style={{ whiteSpace: "pre-line" }}>{tooltipContent}</div>}
              disableHoverListener={isEmpty}
              arrow
              placement="top"
              enterDelay={300}
              leaveDelay={0}
              disableInteractive
            >
              <Box
                key={slot}
                onClick={() => {
                  if (isEmpty && onSlotClick) {
                    onSlotClick(slot);
                  }
                }}
                onDoubleClick={(e) => {
                  if (!isEmpty && onUnequip) {
                    onUnequip(slot);
                    // 툴팁을 강제로 닫기 위해 blur 처리
                    (e.currentTarget as HTMLElement).blur();
                  }
                }}
                sx={{
                  aspectRatio: "1/1",
                  border: "1px solid #ddd",
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: isBottomDisabled ? "#FFCDD2" : "white",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                  color: isEmpty ? "#999" : "#000",
                  "&:hover": {
                    bgcolor: isBottomDisabled ? "#FFABAF" : "#f0f0f0",
                    borderColor: "#999",
                  },
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  padding: "2px",
                  textAlign: "center",
                  wordBreak: "break-word",
                }}
              >
                {isEmpty ? slot : equipment.name}
              </Box>
            </Tooltip>
          );
        })}
      </Box>
    </Box>
  );
}
