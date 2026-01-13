import { Box, Typography } from "@mui/material";
import { EQUIPMENT_LAYOUT, type Equipment } from "../types/equipment";

interface EquipTableProps {
  equipments?: Equipment[];
}

export default function EquipTable({ equipments = [] }: EquipTableProps) {
  const getEquipment = (slot: string | null) => {
    if (!slot) return null;
    return equipments.find((eq) => eq.slot === slot);
  };

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
      <Typography variant="h6" sx={{ mb: 2, textAlign: "center" }}>
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

          return (
            <Box
              key={slot}
              sx={{
                aspectRatio: "1/1",
                border: "1px solid #ddd",
                borderRadius: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "white",
                cursor: "pointer",
                fontSize: "0.75rem",
                color: "#999",
                "&:hover": {
                  bgcolor: "#f0f0f0",
                  borderColor: "#999",
                },
              }}
            >
              {isEmpty ? slot : equipment.icon || slot[0]}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
