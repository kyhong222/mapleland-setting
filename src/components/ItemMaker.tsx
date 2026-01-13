import { Box, Divider, Typography, Select, MenuItem, FormControl, TextField, Button } from "@mui/material";
import { useState } from "react";
import { EQUIPMENT_SLOTS, type Equipment } from "../types/equipment";

// 필터 영역 컴포넌트
function FilterSection({ selectedSlot, onSlotChange }: { selectedSlot: string; onSlotChange: (slot: string) => void }) {
  return (
    <Box sx={{ flex: 1, px: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Typography variant="body2" sx={{ fontSize: "0.875rem", fontWeight: "500" }}>
          착용 부위
        </Typography>
        <FormControl size="small" fullWidth>
          <Select
            value={selectedSlot}
            onChange={(e) => onSlotChange(e.target.value)}
            displayEmpty
            sx={{
              fontSize: "0.875rem",
              bgcolor: "white",
            }}
          >
            <MenuItem value="" disabled>
              <em>선택하세요</em>
            </MenuItem>
            {EQUIPMENT_SLOTS.map((slot) => (
              <MenuItem key={slot} value={slot}>
                {slot}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Typography variant="body2" sx={{ fontSize: "0.875rem", fontWeight: "500" }}>
          아이템
        </Typography>
        <FormControl size="small" fullWidth>
          <Select
            value=""
            displayEmpty
            disabled
            sx={{
              fontSize: "0.875rem",
              bgcolor: "white",
            }}
          >
            <MenuItem value="" disabled>
              <em>구현예정</em>
            </MenuItem>
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
}

// 아이템 정보 영역 컴포넌트
function ItemInfoSection({ itemStats }: { itemStats: Equipment | null }) {
  return (
    <Box sx={{ flex: 2, px: 2, display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" sx={{ fontSize: "0.875rem", fontWeight: "bold" }}>
        아이템 정보
      </Typography>
      {itemStats ? (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
          <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
            이름: {itemStats.name || "없음"}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
            공격력: {itemStats.attack || 0}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
            힘: {itemStats.str || 0}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
            민첩: {itemStats.dex || 0}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
            지력: {itemStats.int || 0}
          </Typography>
          <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
            행운: {itemStats.luk || 0}
          </Typography>
        </Box>
      ) : (
        <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "#999" }}>
          아이템을 선택하세요
        </Typography>
      )}
    </Box>
  );
}

// 아이템 수정 영역 컴포넌트
function ItemEditSection({
  itemStats,
  onStatsChange,
  onEquip,
  onSave,
}: {
  itemStats: Equipment | null;
  onStatsChange: (stats: Partial<Equipment>) => void;
  onEquip: () => void;
  onSave: () => void;
}) {
  const handleStatChange = (stat: keyof Equipment, value: string) => {
    const numValue = parseInt(value) || 0;
    onStatsChange({ [stat]: numValue });
  };

  return (
    <Box sx={{ flex: 1, px: 2, display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" sx={{ fontSize: "0.875rem", fontWeight: "bold" }}>
        아이템 수정
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
        <Box sx={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: 1, alignItems: "center" }}>
          <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
            공격력:
          </Typography>
          <TextField
            type="number"
            size="small"
            value={itemStats?.attack || 0}
            onChange={(e) => handleStatChange("attack", e.target.value)}
            sx={{
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
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: 1, alignItems: "center" }}>
          <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
            힘:
          </Typography>
          <TextField
            type="number"
            size="small"
            value={itemStats?.str || 0}
            onChange={(e) => handleStatChange("str", e.target.value)}
            sx={{
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
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: 1, alignItems: "center" }}>
          <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
            민첩:
          </Typography>
          <TextField
            type="number"
            size="small"
            value={itemStats?.dex || 0}
            onChange={(e) => handleStatChange("dex", e.target.value)}
            sx={{
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
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: 1, alignItems: "center" }}>
          <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
            지력:
          </Typography>
          <TextField
            type="number"
            size="small"
            value={itemStats?.int || 0}
            onChange={(e) => handleStatChange("int", e.target.value)}
            sx={{
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
        </Box>
        <Box sx={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: 1, alignItems: "center" }}>
          <Typography variant="body2" sx={{ fontSize: "0.75rem" }}>
            행운:
          </Typography>
          <TextField
            type="number"
            size="small"
            value={itemStats?.luk || 0}
            onChange={(e) => handleStatChange("luk", e.target.value)}
            sx={{
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
        </Box>
      </Box>
      <Divider sx={{ my: 1 }} />
      <Box sx={{ display: "flex", gap: 1 }}>
        <Button
          variant="contained"
          size="small"
          onClick={onEquip}
          sx={{
            flex: 1,
            bgcolor: "#1976d2",
            color: "white",
            fontSize: "0.75rem",
            "&:hover": {
              bgcolor: "#1565c0",
            },
          }}
        >
          장착
        </Button>
        <Button
          variant="contained"
          size="small"
          onClick={onSave}
          sx={{
            flex: 1,
            bgcolor: "#2e7d32",
            color: "white",
            fontSize: "0.75rem",
            "&:hover": {
              bgcolor: "#1b5e20",
            },
          }}
        >
          저장
        </Button>
      </Box>
    </Box>
  );
}

export default function ItemMaker() {
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedItem, setSelectedItem] = useState<Equipment | null>(null);
  const [editedStats, setEditedStats] = useState<Equipment | null>(null);

  // 아이템 선택 시 초기값 설정
  const handleItemSelect = (item: Equipment) => {
    setSelectedItem(item);
    setEditedStats({ ...item });
  };

  // 스탯 변경 핸들러
  const handleStatsChange = (stats: Partial<Equipment>) => {
    if (editedStats) {
      setEditedStats({ ...editedStats, ...stats });
    }
  };

  // 현재 표시할 아이템 스탯 (편집된 값 우선)
  const displayStats = editedStats || selectedItem;

  // 장착 버튼 핸들러
  const handleEquip = () => {
    // TODO: 장비창에 아이템 장착 로직 구현
    console.log("장착된 아이템:", editedStats);
  };

  // 저장 버튼 핸들러
  const handleSave = () => {
    // TODO: 아이템 저장 로직 구현
    console.log("저장된 아이템:", editedStats);
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1136,
        height: 300,
        border: "1px solid #ccc",
        borderRadius: 1,
        display: "flex",
        flexDirection: "column",
        bgcolor: "#f5f5f5",
        margin: "0 auto",
      }}
    >
      {/* 타이틀 */}
      <Typography variant="body2" sx={{ fontWeight: "bold", px: 2, pt: 2, pb: 1 }}>
        아이템 제작
      </Typography>

      {/* 바디 영역 */}
      <Box sx={{ display: "flex", flex: 1, pt: 1 }}>
        <FilterSection selectedSlot={selectedSlot} onSlotChange={setSelectedSlot} />
        <Divider orientation="vertical" flexItem sx={{ my: 2 }} />
        <ItemInfoSection itemStats={displayStats} />
        <Divider orientation="vertical" flexItem sx={{ my: 2 }} />
        <ItemEditSection
          itemStats={displayStats}
          onStatsChange={handleStatsChange}
          onEquip={handleEquip}
          onSave={handleSave}
        />
      </Box>
    </Box>
  );
}
