import { Box, Typography, Tooltip, IconButton } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import { useState, useEffect, useCallback, useRef } from "react";
import { useCharacter } from "../contexts/CharacterContext";
import type { EquipmentSlot, SavedEquipment } from "../types/equipment";
import type { Item } from "../types/item";
import { equipmentToSaved, savedToEquipment } from "../utils/equipmentConverter";
import { INVENTORY_COLS, INVENTORY_ROWS } from "../utils/inventoryStorage";
import { getPostItemCategoryKey, loadPostItemData } from "../utils/postItemLoader";

interface InventoryProps {
  onClose: () => void;
}

export default function Inventory({ onClose }: InventoryProps) {
  const { character, equipItem, inventory, setInventory, removeFromInventory } = useCharacter();
  const [icons, setIcons] = useState<Map<number, string>>(new Map());
  const [names, setNames] = useState<Map<number, string>>(new Map());
  const job = character.getJob();

  // postItem 데이터 로드 (아이콘 + 이름)
  useEffect(() => {
    const load = async () => {
      const newIcons = new Map<number, string>();
      const newNames = new Map<number, string>();
      for (const item of inventory) {
        const catKey = getPostItemCategoryKey(item.slot, item.type);
        if (!catKey) continue;
        const postItems = await loadPostItemData(catKey);
        const postItem = postItems[String(item.id)];
        if (postItem?.icon) newIcons.set(item.id, postItem.icon);
        if (postItem?.koreanName) newNames.set(item.id, postItem.koreanName);
      }
      setIcons(newIcons);
      setNames(newNames);
    };
    load();
  }, [inventory]);

  // 인벤토리 아이템 더블클릭 → 장착
  const handleEquipFromInventory = async (idx: number) => {
    const saved = inventory[idx];
    if (!saved) return;

    const eq = await savedToEquipment(saved);
    const item = {
      id: eq.id,
      name: eq.name || "",
      icon: eq.icon,
      slot: eq.slot as EquipmentSlot,
      type: (eq.type || "방어구") as Item["type"],
      stats: {
        attack: eq.attack || 0,
        str: eq.str || 0,
        dex: eq.dex || 0,
        int: eq.int || 0,
        luk: eq.luk || 0,
        mad: eq.mad || 0,
        pdef: eq.pdef || 0,
        mdef: eq.mdef || 0,
        acc: eq.acc || 0,
        eva: eq.eva || 0,
        ...(eq.attackSpeed != null ? { attackSpeed: eq.attackSpeed } : {}),
      },
      requireStats: {
        level: eq.reqLevel || 0,
        str: eq.reqStr || 0,
        dex: eq.reqDex || 0,
        int: eq.reqInt || 0,
        luk: eq.reqLuk || 0,
      },
    };

    // 해당 슬롯에 이미 장착된 장비가 있으면 인벤토리로 교체
    const currentEquip = character.getEquipments().find((e) => e.slot === eq.slot);
    const next = [...inventory];
    next.splice(idx, 1);
    if (currentEquip && currentEquip.id != null) {
      next.push(equipmentToSaved(currentEquip));
    }

    equipItem(item);
    setInventory(next);
  };

  const handleDelete = useCallback(
    (idx: number) => {
      removeFromInventory(idx);
    },
    [removeFromInventory],
  );

  const lastRightClick = useRef<{ idx: number; time: number }>({ idx: -1, time: 0 });

  const handleRightClick = useCallback(
    (e: React.MouseEvent, idx: number) => {
      e.preventDefault();
      const item = inventory[idx];
      if (!item) return;

      const now = Date.now();
      const last = lastRightClick.current;
      if (last.idx === idx && now - last.time < 400) {
        handleDelete(idx);
        lastRightClick.current = { idx: -1, time: 0 };
      } else {
        lastRightClick.current = { idx, time: now };
      }
    },
    [inventory, handleDelete],
  );

  const getTooltipText = (item: SavedEquipment) => {
    const itemName = names.get(item.id) || item.slot;
    const lines: string[] = [itemName];

    const isJobMagician = job?.engName === "magician";
    if (isJobMagician) {
      if (item.mad) lines.push(`마력: ${item.mad}`);
    } else {
      if (item.attack) lines.push(`공격력: ${item.attack}`);
    }

    if (item.str) lines.push(`STR: ${item.str}`);
    if (item.dex) lines.push(`DEX: ${item.dex}`);
    if (item.int) lines.push(`INT: ${item.int}`);
    if (item.luk) lines.push(`LUK: ${item.luk}`);

    return lines.join("\n");
  };

  const getIconSrc = (id: number) => {
    if (icons.has(id)) return icons.get(id)!;
    return `https://maplestory.io/api/gms/62/item/${id}/icon?resize=5`;
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
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          p: 1.5,
          borderBottom: "1px solid #ccc",
        }}
      >
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          인벤토리
          <Typography component="span" variant="caption" sx={{ ml: 0.5, color: "text.secondary" }}>
            (더블클릭: 장착 / 더블우클릭: 삭제)
          </Typography>
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ p: 0.5 }}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      {/* 4x6 인벤토리 그리드 */}
      <Box sx={{ p: 1.5 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${INVENTORY_COLS}, 1fr)`,
            gap: 0.5,
          }}
        >
          {Array.from({ length: INVENTORY_ROWS * INVENTORY_COLS }).map((_, idx) => {
            const item = inventory[idx] as SavedEquipment | undefined;
            const iconSrc = item ? getIconSrc(item.id) : null;

            return (
              <Tooltip
                key={idx}
                title={item ? getTooltipText(item) : "빈 칸"}
                slotProps={{
                  tooltip: {
                    sx: { whiteSpace: "pre-wrap", wordBreak: "break-word" },
                  },
                }}
              >
                <Box
                  onDoubleClick={() => item && handleEquipFromInventory(idx)}
                  onContextMenu={(e) => handleRightClick(e, idx)}
                  sx={{
                    width: 60,
                    height: 60,
                    border: "1px solid #ccc",
                    borderRadius: 0.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: item ? "white" : "#fafafa",
                    cursor: item ? "pointer" : "default",
                    "&:hover": item
                      ? { bgcolor: "#e3f2fd" }
                      : {},
                  }}
                >
                  {iconSrc ? (
                    <img
                      src={iconSrc}
                      alt=""
                      style={{ maxWidth: "100%", maxHeight: "100%" }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : null}
                </Box>
              </Tooltip>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
