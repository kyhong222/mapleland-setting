import { Box, Divider, Typography, Select, MenuItem, FormControl, TextField, Button } from "@mui/material";
import { useState, useMemo, useEffect, useRef } from "react";
import { EQUIPMENT_SLOTS } from "../types/equipment";
import type { Item } from "../types/item";

// Common items
import commonCap from "../data/items/common/cap.json";
import commonEaracc from "../data/items/common/earacc.json";
import commonEyeacc from "../data/items/common/eyeacc.json";
import commonForehead from "../data/items/common/forehead.json";
import commonMantle from "../data/items/common/mantle.json";
import commonMedal from "../data/items/common/medal.json";
import commonPendant from "../data/items/common/pendant.json";

// Warrior items
import warriorGloves from "../data/items/warrior/gloves.json";
import warriorOverall from "../data/items/warrior/overall.json";
import warriorShoes from "../data/items/warrior/shoes.json";
import warriorWeapon from "../data/items/warrior/weapon.json";

// 필터 영역 컴포넌트
function FilterSection({
  selectedSlot,
  onSlotChange,
  availableItems,
  selectedItemName,
  onItemSelect,
}: {
  selectedSlot: string;
  onSlotChange: (slot: string) => void;
  availableItems: Item[];
  selectedItemName: string;
  onItemSelect: (itemName: string) => void;
}) {
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
            value={selectedItemName}
            onChange={(e) => onItemSelect(e.target.value)}
            displayEmpty
            disabled={!selectedSlot || availableItems.length === 0}
            sx={{
              fontSize: "0.875rem",
              bgcolor: "white",
            }}
          >
            <MenuItem value="" disabled>
              <em>{availableItems.length === 0 ? "아이템 없음" : "선택하세요"}</em>
            </MenuItem>
            {availableItems.map((item) => (
              <MenuItem key={item.name} value={item.name}>
                {item.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
    </Box>
  );
}

// 아이템 정보 영역 컴포넌트
function ItemInfoSection({ item }: { item: Item | null }) {
  return (
    <Box sx={{ flex: 2, px: 2, display: "flex", flexDirection: "column", gap: 1 }}>
      <Typography variant="body2" sx={{ fontSize: "0.875rem", fontWeight: "bold" }}>
        아이템 정보
      </Typography>
      {item ? (
        <Box sx={{ display: "flex", gap: 2 }}>
          {/* 아이콘 영역 */}
          <Box
            sx={{
              width: 60,
              height: 60,
              border: "1px solid #ddd",
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "white",
              flexShrink: 0,
            }}
          >
            {/* 아이콘 자리 */}
          </Box>
          {/* 정보 영역 */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            <Typography variant="body2" sx={{ fontSize: "0.875rem", fontWeight: "bold" }}>
              {item.name}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "#666" }}>
              공격력: {item.stats.attack}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "#666" }}>
              힘: {item.stats.str}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "#666" }}>
              민첩: {item.stats.dex}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "#666" }}>
              지력: {item.stats.int}
            </Typography>
            <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "#666" }}>
              행운: {item.stats.luk}
            </Typography>
          </Box>
        </Box>
      ) : (
        <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Typography variant="body2" sx={{ fontSize: "1rem", color: "#999" }}>
            아이템을 선택하세요
          </Typography>
        </Box>
      )}
    </Box>
  );
}

// 아이템 수정 영역 컴포넌트
function ItemEditSection({
  item,
  onStatsChange,
  onEquip,
  onSave,
}: {
  item: Item | null;
  onStatsChange: (stat: keyof Item["stats"], value: number) => void;
  onEquip: () => void;
  onSave: () => void;
}) {
  const handleStatChange = (stat: keyof Item["stats"], value: string) => {
    const numValue = parseInt(value) || 0;
    onStatsChange(stat, numValue);
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
            value={item?.stats.attack || 0}
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
            value={item?.stats.str || 0}
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
            value={item?.stats.dex || 0}
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
            value={item?.stats.int || 0}
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
            value={item?.stats.luk || 0}
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

export default function ItemMaker({
  onEquip,
  selectedJob,
  initialSlot,
}: {
  onEquip?: (item: Item) => void;
  selectedJob?: string;
  initialSlot?: string;
}) {
  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedItemName, setSelectedItemName] = useState("");
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [editedItem, setEditedItem] = useState<Item | null>(null);
  const prevInitialSlotRef = useRef<string>();

  // initialSlot이 변경되면 selectedSlot 업데이트
  useEffect(() => {
    if (initialSlot && initialSlot !== prevInitialSlotRef.current) {
      prevInitialSlotRef.current = initialSlot;
      setSelectedSlot(initialSlot);
      setSelectedItemName("");
      setSelectedItem(null);
      setEditedItem(null);
    }
  }, [initialSlot]);

  // 전체 아이템 데이터 - 직업에 따라 동적으로 로드
  const allItems: Item[] = useMemo(() => {
    const commonItems = [
      ...(commonCap as Item[]),
      ...(commonEaracc as Item[]),
      ...(commonEyeacc as Item[]),
      ...(commonForehead as Item[]),
      ...(commonMantle as Item[]),
      ...(commonMedal as Item[]),
      ...(commonPendant as Item[]),
    ];

    let jobItems: Item[] = [];
    if (selectedJob === "warrior") {
      jobItems = [
        ...(warriorGloves as Item[]),
        ...(warriorOverall as Item[]),
        ...(warriorShoes as Item[]),
        ...(warriorWeapon as Item[]),
      ];
    }
    // TODO: 다른 직업 추가 (archer, magician, thief)

    return [...commonItems, ...jobItems];
  }, [selectedJob]);

  // 선택된 슬롯에 따라 필터링된 아이템 목록
  const availableItems = selectedSlot ? allItems.filter((item) => item.slot === selectedSlot) : [];

  // 착용 부위 변경 시
  const handleSlotChange = (slot: string) => {
    setSelectedSlot(slot);
    setSelectedItemName("");
    setSelectedItem(null);
    setEditedItem(null);
  };

  // 아이템 선택 시 초기값 설정
  const handleItemNameSelect = (itemName: string) => {
    setSelectedItemName(itemName);
    const item = allItems.find((i) => i.name === itemName);
    if (item) {
      setSelectedItem(item);
      setEditedItem({ ...item, stats: { ...item.stats } });
    }
  };

  // 스탯 변경 핸들러
  const handleStatsChange = (stat: keyof Item["stats"], value: number) => {
    if (editedItem) {
      setEditedItem({
        ...editedItem,
        stats: {
          ...editedItem.stats,
          [stat]: value,
        },
      });
    }
  };

  // 현재 표시할 아이템 (편집된 값 우선)
  const displayItem = editedItem || selectedItem;

  // 장착 버튼 핸들러
  const handleEquip = () => {
    if (editedItem && onEquip) {
      onEquip(editedItem);
      // 초기화
      setSelectedSlot("");
      setSelectedItemName("");
      setSelectedItem(null);
      setEditedItem(null);
    }
  };

  // 저장 버튼 핸들러
  const handleSave = () => {
    if (editedItem) {
      // localStorage에 저장
      const savedItems = JSON.parse(localStorage.getItem("savedItems") || "[]");
      savedItems.push(editedItem);
      localStorage.setItem("savedItems", JSON.stringify(savedItems));
      console.log("저장된 아이템:", editedItem);
      // 초기화
      setSelectedSlot("");
      setSelectedItemName("");
      setSelectedItem(null);
      setEditedItem(null);
    }
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
        <FilterSection
          selectedSlot={selectedSlot}
          onSlotChange={handleSlotChange}
          availableItems={availableItems}
          selectedItemName={selectedItemName}
          onItemSelect={handleItemNameSelect}
        />
        <Divider orientation="vertical" flexItem sx={{ my: 2 }} />
        <ItemInfoSection item={displayItem} />
        <Divider orientation="vertical" flexItem sx={{ my: 2 }} />
        <ItemEditSection
          item={displayItem}
          onStatsChange={handleStatsChange}
          onEquip={handleEquip}
          onSave={handleSave}
        />
      </Box>
    </Box>
  );
}
