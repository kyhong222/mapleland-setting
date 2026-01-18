import { Box, Typography, Select, MenuItem, FormControl, TextField, Button, Divider } from "@mui/material";
import { useState, useMemo } from "react";
import { useCharacter } from "../contexts/CharacterContext";
import { EQUIPMENT_SLOTS } from "../types/equipment";
import type { Item } from "../types/item";

// 아이템 데이터 import
import commonCap from "../data/items/common/cap.json";
import commonEaracc from "../data/items/common/earacc.json";
import commonEyeacc from "../data/items/common/eyeacc.json";
import commonForehead from "../data/items/common/forehead.json";
import commonMantle from "../data/items/common/mantle.json";
import commonMedal from "../data/items/common/medal.json";
import commonPendant from "../data/items/common/pendant.json";
import warriorGloves from "../data/items/warrior/gloves.json";
import warriorOverall from "../data/items/warrior/overall.json";
import warriorShoes from "../data/items/warrior/shoes.json";
import warriorWeapon from "../data/items/warrior/weapon.json";

export default function ItemMaker() {
  const { character, equipItem } = useCharacter();

  const [selectedSlot, setSelectedSlot] = useState("");
  const [selectedItemName, setSelectedItemName] = useState("");
  const [editedStats, setEditedStats] = useState({
    attack: 0,
    str: 0,
    dex: 0,
    int: 0,
    luk: 0,
  });

  const job = character.getJob();

  // 전체 아이템 목록
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
    if (job?.engName === "warrior") {
      jobItems = [
        ...(warriorGloves as Item[]),
        ...(warriorOverall as Item[]),
        ...(warriorShoes as Item[]),
        ...(warriorWeapon as Item[]),
      ];
    }

    return [...commonItems, ...jobItems];
  }, [job]);

  // 선택된 슬롯에 맞는 아이템 필터링
  const availableItems = selectedSlot ? allItems.filter((item) => item.slot === selectedSlot) : [];

  // 선택된 아이템
  const selectedItem = availableItems.find((item) => item.name === selectedItemName);

  // 아이템 선택 시
  const handleItemSelect = (itemName: string) => {
    setSelectedItemName(itemName);
    const item = allItems.find((i) => i.name === itemName);
    if (item) {
      setEditedStats({
        attack: item.stats.attack,
        str: item.stats.str,
        dex: item.stats.dex,
        int: item.stats.int,
        luk: item.stats.luk,
      });
    }
  };

  // 슬롯 변경 시
  const handleSlotChange = (slot: string) => {
    setSelectedSlot(slot);
    setSelectedItemName("");
    setEditedStats({ attack: 0, str: 0, dex: 0, int: 0, luk: 0 });
  };

  // 장착 버튼
  const handleEquip = () => {
    if (!selectedItem) return;

    const itemToEquip: Item = {
      name: selectedItem.name,
      slot: selectedItem.slot,
      type: selectedItem.type,
      stats: editedStats,
    };

    equipItem(itemToEquip);

    // 초기화
    setSelectedSlot("");
    setSelectedItemName("");
    setEditedStats({ attack: 0, str: 0, dex: 0, int: 0, luk: 0 });
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1200,
        height: 250,
        border: "1px solid #ccc",
        borderRadius: 1,
        bgcolor: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
        margin: "0 auto",
      }}
    >
      {/* 타이틀 */}
      <Typography variant="body2" sx={{ fontWeight: "bold", p: 1.5, borderBottom: "1px solid #ccc" }}>
        아이템 장착
      </Typography>

      {/* 바디 */}
      <Box sx={{ display: "flex", flex: 1, p: 2, gap: 2 }}>
        {/* 왼쪽: 필터 */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          <Box>
            <Typography variant="body2" sx={{ fontSize: "0.875rem", fontWeight: "500", mb: 0.5 }}>
              착용 부위
            </Typography>
            <FormControl size="small" fullWidth>
              <Select
                value={selectedSlot}
                onChange={(e) => handleSlotChange(e.target.value)}
                displayEmpty
                sx={{ bgcolor: "white" }}
              >
                <MenuItem value="" disabled>
                  선택하세요
                </MenuItem>
                {EQUIPMENT_SLOTS.map((slot) => (
                  <MenuItem key={slot} value={slot}>
                    {slot}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Box>
            <Typography variant="body2" sx={{ fontSize: "0.875rem", fontWeight: "500", mb: 0.5 }}>
              아이템
            </Typography>
            <FormControl size="small" fullWidth>
              <Select
                value={selectedItemName}
                onChange={(e) => handleItemSelect(e.target.value)}
                displayEmpty
                disabled={!selectedSlot || availableItems.length === 0}
                sx={{ bgcolor: "white" }}
              >
                <MenuItem value="" disabled>
                  {availableItems.length === 0 ? "아이템 없음" : "선택하세요"}
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

        <Divider orientation="vertical" flexItem />

        {/* 중간: 아이템 정보 */}
        <Box sx={{ flex: 2, display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="body2" sx={{ fontSize: "0.875rem", fontWeight: "bold" }}>
            아이템 정보
          </Typography>
          {selectedItem ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
              <Typography variant="body2" sx={{ fontWeight: "bold" }}>
                {selectedItem.name}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "#666" }}>
                타입: {selectedItem.type}
              </Typography>
              <Typography variant="body2" sx={{ fontSize: "0.75rem", color: "#666" }}>
                공격력: {editedStats.attack} / 힘: {editedStats.str} / 민첩: {editedStats.dex} / 지력: {editedStats.int}{" "}
                / 행운: {editedStats.luk}
              </Typography>
            </Box>
          ) : (
            <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Typography variant="body2" sx={{ color: "#999" }}>
                아이템을 선택하세요
              </Typography>
            </Box>
          )}
        </Box>

        <Divider orientation="vertical" flexItem />

        {/* 오른쪽: 스탯 수정 */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}>
          <Typography variant="body2" sx={{ fontSize: "0.875rem", fontWeight: "bold" }}>
            스탯 수정
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
            {["attack", "str", "dex", "int", "luk"].map((stat) => (
              <Box key={stat} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Typography variant="body2" sx={{ fontSize: "0.75rem", minWidth: 50 }}>
                  {stat === "attack"
                    ? "공격력"
                    : stat === "str"
                    ? "힘"
                    : stat === "dex"
                    ? "민첩"
                    : stat === "int"
                    ? "지력"
                    : "행운"}
                  :
                </Typography>
                <TextField
                  type="number"
                  size="small"
                  value={editedStats[stat as keyof typeof editedStats]}
                  onChange={(e) =>
                    setEditedStats((prev) => ({
                      ...prev,
                      [stat]: parseInt(e.target.value) || 0,
                    }))
                  }
                  disabled={!selectedItem}
                  sx={{
                    flex: 1,
                    "& .MuiInputBase-input": {
                      p: 0.5,
                      fontSize: "0.75rem",
                      textAlign: "center",
                      bgcolor: "white",
                    },
                  }}
                />
              </Box>
            ))}
          </Box>

          <Divider sx={{ my: 0.5 }} />

          <Button
            variant="contained"
            size="small"
            onClick={handleEquip}
            disabled={!selectedItem}
            sx={{
              bgcolor: "#1976d2",
              "&:hover": { bgcolor: "#1565c0" },
            }}
          >
            장착
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
