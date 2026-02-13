import { Box, Typography, Tooltip, IconButton } from "@mui/material";
import { Add as AddIcon, OpenInFull as OpenInFullIcon, CloseFullscreen as CloseFullscreenIcon, WebAsset as WebAssetIcon } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useCharacter } from "../contexts/CharacterContext";
import { EQUIPMENT_LAYOUT } from "../types/equipment";
import EquipDetailTable from "./EquipDetailTable";
import type { EquipmentSlot } from "../types/equipment";
import { getPostItemCategoryKey, getPostItemIcon } from "../utils/postItemLoader";
import { equipmentToSaved } from "../utils/equipmentConverter";
import ItemTooltip from "./ItemTooltip";

// 슬롯명을 카테고리 키로 매핑
const SLOT_TO_CATEGORY: Record<string, string> = {
  투구: "hat",
  망토: "cape",
  상의: "top",
  장갑: "glove",
  전신: "overall",
  하의: "bottom",
  보조무기: "shield",
  신발: "shoes",
  귀고리: "earrings",
  얼굴장식: "faceAccessory",
  훈장: "medal",
  눈장식: "eyeDecoration",
  목걸이: "pendant",
  벨트: "belt",
  펫장비: "petAcc",
  무기: "weapon",
};

interface EquipTableProps {
  onSlotClick?: (category: string) => void;
  onOpenItemMaker?: () => void;
  onOpenInventory?: () => void;
  onExpandedChange?: (expanded: boolean) => void;
}

export default function EquipTable({ onSlotClick, onOpenItemMaker, onOpenInventory, onExpandedChange }: EquipTableProps) {
  const { character, unequipItem, version, addToInventory } = useCharacter();
  const [postItemIcons, setPostItemIcons] = useState<Map<number, string>>(new Map());
  const [expanded, setExpanded] = useState(false);

  const equipments = character.getEquipments();
  const equipMap = new Map(equipments.map((eq) => [eq.slot, eq]));
  const job = character.getJob();
  const jobName = job?.engName;
  const isJobMagician = jobName === "magician";

  // 하의 슬롯 빨간색 표시 여부 (상의에 전신 장착 시)
  const overallEquipment = equipMap.get("상의");
  const hasOverall = overallEquipment?.type === "전신";

  // 보조무기 활성화 여부 및 카테고리 결정
  const weapon = equipMap.get("무기");
  const oneHandedWeapons = ["한손검", "한손도끼", "한손둔기", "단검", "스태프", "완드"];
  const isOneHanded = weapon?.type && oneHandedWeapons.includes(weapon.type);
  const isBow = weapon?.type === "활";
  const isCrossbow = weapon?.type === "석궁";
  const isDagger = weapon?.type === "아대";

  const canEquipSecondaryWeapon = isOneHanded || isBow || isCrossbow || isDagger;
  const isSecondaryWeaponBlocked = !canEquipSecondaryWeapon;

  // postItem 아이콘 로드
  useEffect(() => {
    const loadIcons = async () => {
      const newIcons = new Map<number, string>();
      for (const eq of equipments) {
        if (!eq.id) continue;
        const catKey = getPostItemCategoryKey(eq.slot, eq.type);
        if (!catKey) continue;
        const icon = await getPostItemIcon(catKey, eq.id);
        if (icon) {
          newIcons.set(eq.id, icon);
        }
      }
      setPostItemIcons(newIcons);
    };
    loadIcons();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [version]); // equipments는 character.getEquipments()로 매 렌더 새 배열 → version이 변경 트리거 역할

  const handleDoubleClick = (slot: string) => {
    const eq = equipMap.get(slot);
    if (eq && eq.id != null) {
      addToInventory(equipmentToSaved(eq));
    }
    unequipItem(slot as EquipmentSlot);
  };

  const handleSlotClick = (slotName: string, hasEquipment: boolean) => {
    if (!hasEquipment && onSlotClick) {
      let categoryKey = SLOT_TO_CATEGORY[slotName];
      
      // 보조무기의 경우 장착된 무기에 따라 카테고리 결정
      if (slotName === "보조무기") {
        if (isBow) {
          categoryKey = "arrowAmmo";
        } else if (isCrossbow) {
          categoryKey = "crossbowBoltAmmo";
        } else if (isDagger) {
          categoryKey = "thrownAmmo";
        } else if (isOneHanded) {
          categoryKey = "shield";
        } else {
          categoryKey = "shield"; // 기본값
        }
      }
      
      if (categoryKey) {
        onSlotClick(categoryKey);
      }
    }
  };

  const getIconSrc = (equipment: { id?: number; icon?: string }) => {
    // 1순위: postItem 커스텀 아이콘
    if (equipment.id && postItemIcons.has(equipment.id)) {
      return postItemIcons.get(equipment.id)!;
    }
    // 2순위: equipment에 저장된 유효한 아이콘 (blob URL 제외)
    if (equipment.icon && !equipment.icon.startsWith("blob:")) {
      return equipment.icon;
    }
    // 3순위: API URL 폴백
    if (equipment.id) {
      return `https://maplestory.io/api/gms/62/item/${equipment.id}/icon?resize=5`;
    }
    return null;
  };

  const renderSlot = (slotName: string | null) => {
    if (!slotName) {
      return <Box key="empty" sx={{ width: 60, height: 60 }} />;
    }

    const equipment = equipMap.get(slotName);
    const isBottomSlotBlocked = slotName === "하의" && hasOverall;
    const slotIsSecondaryWeaponBlocked = slotName === "보조무기" && isSecondaryWeaponBlocked;

    const getTooltipContent = () => {
      if (!equipment) {
        if (slotIsSecondaryWeaponBlocked) {
          return "해당 무기 타입에는 보조무기를 장착할 수 없습니다";
        }
        if (isBottomSlotBlocked) {
          return "전신갑옷과 동시에 착용할 수 없습니다";
        }
        return "클릭하여 아이템 선택";
      }

      return (
        <ItemTooltip
          name={equipment.name || ""}
          slot={slotName}
          type={equipment.type}
          icon={getIconSrc(equipment) || undefined}
          attack={equipment.attack}
          str={equipment.str}
          dex={equipment.dex}
          int={equipment.int}
          luk={equipment.luk}
          mad={equipment.mad}
          pdef={equipment.pdef}
          mdef={equipment.mdef}
          acc={equipment.acc}
          eva={equipment.eva}
          speed={equipment.speed}
          jump={equipment.jump}
          hp={equipment.hp}
          mp={equipment.mp}
          isJobMagician={isJobMagician}
        />
      );
    };

    return (
      <Tooltip
        key={slotName}
        title={getTooltipContent()}
        placement="top"
        disableInteractive
        leaveDelay={0}
      >
        <Box
          onClick={() => {
            if (slotIsSecondaryWeaponBlocked || isBottomSlotBlocked) return;
            handleSlotClick(slotName, !!equipment);
          }}
          onDoubleClick={() => {
            if (!equipment) return;
            // blocked 슬롯이라도 장비가 있으면 해제 허용
            handleDoubleClick(slotName);
          }}
          sx={{
            width: 60,
            height: 60,
            border: "1px solid #ccc",
            borderRadius: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            bgcolor: slotIsSecondaryWeaponBlocked || isBottomSlotBlocked ? "#FFCDD2" : equipment ? "white" : "#f5f5f5",
            cursor: (slotIsSecondaryWeaponBlocked || isBottomSlotBlocked) && !equipment ? "not-allowed" : "pointer",
            fontSize: "0.75rem",
            textAlign: "center",
            p: 0.5,
            wordBreak: "keep-all",
            userSelect: "none",
            "&:hover": {
              bgcolor:
                slotIsSecondaryWeaponBlocked || isBottomSlotBlocked ? "#FFAB91" : equipment ? "#e3f2fd" : "#eeeeee",
            },
          }}
        >
          {equipment ? (
            (() => {
              const iconSrc = getIconSrc(equipment);
              return iconSrc ? (
                <img
                  src={iconSrc}
                  alt={equipment.name || ""}
                  style={{ maxWidth: "100%", maxHeight: "100%" }}
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                  }}
                />
              ) : (
                equipment.name
              );
            })()
          ) : (
            slotName
          )}
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
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", p: 1.5, borderBottom: "1px solid #ccc" }}>
        <Typography variant="body2" sx={{ fontWeight: "bold" }}>
          장비
          {!expanded && (
            <Typography
              component="span"
              variant="caption"
              sx={{ ml: 0.5, color: "text.secondary" }}
            >
              (더블클릭으로 인벤토리 이동)
            </Typography>
          )}
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          {onOpenItemMaker && (
            <Tooltip title="아이템 생성">
              <IconButton onClick={onOpenItemMaker} size="small" sx={{ p: 0.5 }}>
                <AddIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onOpenInventory && (
            <Tooltip title="인벤토리">
              <IconButton onClick={onOpenInventory} size="small" sx={{ p: 0.5 }}>
                <WebAssetIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <Tooltip title={expanded ? "축소" : "확대"}>
            <IconButton onClick={() => { const next = !expanded; setExpanded(next); onExpandedChange?.(next); }} size="small" sx={{ p: 0.5 }}>
              {expanded ? <CloseFullscreenIcon fontSize="small" /> : <OpenInFullIcon fontSize="small" />}
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* 장비 그리드 / 상세 뷰 */}
      {expanded ? (
        <EquipDetailTable
          equipments={equipments}
          postItemIcons={postItemIcons}
          getIconSrc={getIconSrc}
          isJobMagician={isJobMagician}
          jobName={jobName}
        />
      ) : (
        <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 1 }}>
          {EQUIPMENT_LAYOUT.map((row, rowIndex) => (
            <Box key={rowIndex} sx={{ display: "flex", gap: 1, justifyContent: "center" }}>
              {row.map((slot) => renderSlot(slot))}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}
