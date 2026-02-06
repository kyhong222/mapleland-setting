import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useState, useEffect, useRef, useCallback } from "react";
import { useCharacter } from "../contexts/CharacterContext";
import type { Item, ItemType, PostItemData } from "../types/item";
import type { EquipmentSlot } from "../types/equipment";
import { fetchItemDetails, fetchItemIcon } from "../api/maplestory";
import { loadPostItemData } from "../utils/postItemLoader";

// 직업별 ID 매핑
const JOB_ID_MAP: Record<string, number> = {
  warrior: 1,
  archer: 4,
  magician: 2,
  thief: 8,
  pirate: 16,
};

// 카테고리 정의
const ARMOR_CATEGORIES = [
  { key: "hat", name: "투구", slot: "투구" as EquipmentSlot, type: "방어구" as ItemType },
  { key: "top", name: "상의", slot: "상의" as EquipmentSlot, type: "방어구" as ItemType },
  { key: "bottom", name: "하의", slot: "하의" as EquipmentSlot, type: "방어구" as ItemType },
  { key: "overall", name: "전신", slot: "상의" as EquipmentSlot, type: "전신" as ItemType },
  { key: "glove", name: "장갑", slot: "장갑" as EquipmentSlot, type: "방어구" as ItemType },
  { key: "shoes", name: "신발", slot: "신발" as EquipmentSlot, type: "방어구" as ItemType },
  { key: "cape", name: "망토", slot: "망토" as EquipmentSlot, type: "방어구" as ItemType },
  { key: "earrings", name: "귀고리", slot: "귀고리" as EquipmentSlot, type: "방어구" as ItemType },
  { key: "pendant", name: "목걸이", slot: "목걸이" as EquipmentSlot, type: "방어구" as ItemType },
];

const ACCESSORY_CATEGORIES = [
  { key: "faceAccessory", name: "얼굴장식", slot: "얼굴장식" as EquipmentSlot, type: "방어구" as ItemType },
  { key: "eyeDecoration", name: "눈장식", slot: "눈장식" as EquipmentSlot, type: "방어구" as ItemType },
  { key: "medal", name: "훈장", slot: "훈장" as EquipmentSlot, type: "방어구" as ItemType },
  { key: "belt", name: "벨트", slot: "벨트" as EquipmentSlot, type: "방어구" as ItemType },
];

const WEAPON_CATEGORIES = [
  { key: "weapons/oneHandedSword", name: "한손검", slot: "무기" as EquipmentSlot, type: "한손검" as ItemType, jobs: [1] },
  { key: "weapons/twoHandedSword", name: "두손검", slot: "무기" as EquipmentSlot, type: "두손검" as ItemType, jobs: [1] },
  { key: "weapons/oneHandedAxe", name: "한손도끼", slot: "무기" as EquipmentSlot, type: "한손도끼" as ItemType, jobs: [1] },
  { key: "weapons/twoHandedAxe", name: "두손도끼", slot: "무기" as EquipmentSlot, type: "두손도끼" as ItemType, jobs: [1] },
  { key: "weapons/oneHandedBlunt", name: "한손둔기", slot: "무기" as EquipmentSlot, type: "한손둔기" as ItemType, jobs: [1] },
  { key: "weapons/twoHandedBlunt", name: "두손둔기", slot: "무기" as EquipmentSlot, type: "두손둔기" as ItemType, jobs: [1] },
  { key: "weapons/spear", name: "창", slot: "무기" as EquipmentSlot, type: "창" as ItemType, jobs: [1] },
  { key: "weapons/polearm", name: "폴암", slot: "무기" as EquipmentSlot, type: "폴암" as ItemType, jobs: [1] },
  { key: "weapons/bow", name: "활", slot: "무기" as EquipmentSlot, type: "활" as ItemType, jobs: [4] },
  { key: "weapons/crossbow", name: "석궁", slot: "무기" as EquipmentSlot, type: "석궁" as ItemType, jobs: [4] },
  { key: "weapons/staff", name: "스태프", slot: "무기" as EquipmentSlot, type: "스태프" as ItemType, jobs: [2] },
  { key: "weapons/wand", name: "완드", slot: "무기" as EquipmentSlot, type: "완드" as ItemType, jobs: [2] },
  { key: "weapons/dagger", name: "단검", slot: "무기" as EquipmentSlot, type: "단검" as ItemType, jobs: [8] },
  { key: "weapons/claw", name: "아대", slot: "무기" as EquipmentSlot, type: "아대" as ItemType, jobs: [8] },
];

const SECONDARY_CATEGORIES = [
  { key: "shield", name: "방패", slot: "보조무기" as EquipmentSlot, type: "방패" as ItemType, jobs: [1, 2, 8] },
  { key: "projectiles/arrowAmmo", name: "화살", slot: "보조무기" as EquipmentSlot, type: "화살" as ItemType, jobs: [4] },
  { key: "projectiles/crossbowBoltAmmo", name: "석궁화살", slot: "보조무기" as EquipmentSlot, type: "석궁화살" as ItemType, jobs: [4] },
  { key: "projectiles/thrownAmmo", name: "표창", slot: "보조무기" as EquipmentSlot, type: "표창" as ItemType, jobs: [8] },
];

interface ItemData {
  id: number;
  name: string;
  koreanName: string;
  reqJob: number;
  reqLevel: number;
}

interface CategoryInfo {
  key: string;
  name: string;
  slot: EquipmentSlot;
  type: ItemType;
  jobs?: number[];
}

interface ItemMakerModalProps {
  open: boolean;
  selectedCategory?: string;
  onClose: () => void;
}

// import.meta.glob으로 빌드 시 JSON 파일을 모두 포함
const itemModules = import.meta.glob("../data/items/**/*.json");

async function loadItemData(categoryKey: string): Promise<ItemData[]> {
  try {
    const path = `../data/items/${categoryKey}.json`;
    const loader = itemModules[path];
    if (!loader) {
      console.error(`Module not found for ${categoryKey}.json`);
      return [];
    }
    const module = await loader();
    return (module as { default: ItemData[] }).default;
  } catch (error) {
    console.error(`Failed to load ${categoryKey}.json:`, error);
    return [];
  }
}


export default function ItemMakerModal({ open, selectedCategory, onClose }: ItemMakerModalProps) {
  const { character, equipItem } = useCharacter();
  const theme = useTheme();

  const [selectedCategoryInfo, setSelectedCategoryInfo] = useState<CategoryInfo | null>(null);
  const [categoryItems, setCategoryItems] = useState<ItemData[]>([]);
  const [selectedItem, setSelectedItem] = useState<ItemData | null>(null);
  const [isLoadingCategory, setIsLoadingCategory] = useState(false);
  const [isLoadingItem, setIsLoadingItem] = useState(false);
  const [itemIcon, setItemIcon] = useState<string>("");
  const [koreanName, setKoreanName] = useState<string>("");
  const [categoryPostItems, setCategoryPostItems] = useState<Record<string, PostItemData>>({});

  const [attackSpeed, setAttackSpeed] = useState<number | null>(null);

  const defaultStats = {
    attack: 0, str: 0, dex: 0, int: 0, luk: 0,
    mad: 0, pdef: 0, mdef: 0, acc: 0, eva: 0,
  };

  const [originStats, setOriginStats] = useState({ ...defaultStats });
  const [editedStats, setEditedStats] = useState({ ...defaultStats });

  const [requireStats, setRequireStats] = useState({
    level: 0,
    str: 0,
    dex: 0,
    int: 0,
    luk: 0,
  });

  const prevOpenRef = useRef<boolean>(false);

  const job = character.getJob();
  const jobId = job ? JOB_ID_MAP[job.engName] : null;

  // 모달이 열릴 때 초기화
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      setCategoryItems([]);
      setCategoryPostItems({});
      setSelectedItem(null);
      setItemIcon("");
      setKoreanName("");
      setAttackSpeed(null);
      setOriginStats({ ...defaultStats });
      setEditedStats({ ...defaultStats });
      setRequireStats({ level: 0, str: 0, dex: 0, int: 0, luk: 0 });
    }
    prevOpenRef.current = open;
  }, [open]);

  // 카테고리 선택 시 아이템 로드
  const handleCategoryClick = useCallback(async (category: CategoryInfo) => {
    setSelectedCategoryInfo(category);
    setSelectedItem(null);
    setItemIcon("");
    setIsLoadingCategory(true);

    try {
      const [items, postItems] = await Promise.all([
        loadItemData(category.key),
        loadPostItemData(category.key),
      ]);
      setCategoryPostItems(postItems);
      let filtered: ItemData[];
      if (jobId) {
        filtered = items.filter((item) => item.reqJob === 0 || (item.reqJob & jobId) !== 0);
      } else {
        filtered = items.filter((item) => item.reqJob === 0);
      }
      filtered.sort((a, b) => a.reqLevel - b.reqLevel);
      setCategoryItems(filtered);
    } catch (error) {
      console.error("Failed to load items:", error);
      setCategoryItems([]);
    } finally {
      setIsLoadingCategory(false);
    }
  }, [jobId]);

  // selectedCategory 변경 시 카테고리 및 아이템 로드
  useEffect(() => {
    if (selectedCategory && open) {
      const allCategories = [...ARMOR_CATEGORIES, ...ACCESSORY_CATEGORIES, ...WEAPON_CATEGORIES, ...SECONDARY_CATEGORIES];
      const category = allCategories.find(c => c.key === selectedCategory);
      if (category) {
        // 버튼 상태 업데이트를 위해 selectedCategoryInfo를 먼저 업데이트
        setSelectedCategoryInfo(category);
        setSelectedItem(null);
        setItemIcon("");
        setIsLoadingCategory(true);

        // 아이템 로드
        (async () => {
          try {
            const [items, postItems] = await Promise.all([
              loadItemData(category.key),
              loadPostItemData(category.key),
            ]);
            setCategoryPostItems(postItems);
            let filtered: ItemData[];
            if (jobId) {
              filtered = items.filter((item) => item.reqJob === 0 || (item.reqJob & jobId) !== 0);
            } else {
              filtered = items.filter((item) => item.reqJob === 0);
            }
            filtered.sort((a, b) => a.reqLevel - b.reqLevel);
            setCategoryItems(filtered);
          } catch (error) {
            console.error("Failed to load items:", error);
            setCategoryItems([]);
          } finally {
            setIsLoadingCategory(false);
          }
        })();
      } else {
        setSelectedCategoryInfo(null);
      }
    }
  }, [selectedCategory, open, jobId]);

  // 아이템 클릭 시 상세 정보 로드 (PostItem 우선, 없으면 API 호출)
  const handleItemClick = async (item: ItemData) => {
    setSelectedItem(item);
    setIsLoadingItem(true);
    setItemIcon("");

    try {
      // 1. PostItem 확인
      const categoryKey = selectedCategoryInfo?.key || "";
      const postItems = await loadPostItemData(categoryKey);
      const postItem = postItems[String(item.id)];

      if (postItem) {
        // PostItem이 있으면 API 호출 없이 사용
        setKoreanName(postItem.koreanName || item.koreanName || item.name);
        const stats = { ...defaultStats, ...postItem.stats };
        setOriginStats(stats);
        setEditedStats(stats);
        setRequireStats(postItem.requireStats);
        setAttackSpeed(postItem.stats.attackSpeed ?? null);
        // 커스텀 아이콘이 있으면 바로 적용
        if (postItem.icon) {
          setItemIcon(postItem.icon);
        }
      } else {
        // 2. PostItem이 없으면 API 호출
        const details = await fetchItemDetails(item.id);
        if (details) {
          setKoreanName(item.koreanName || item.name);
          const metaInfo = (details as any)?.metaInfo || {};
          const stats = {
            attack: metaInfo.incPAD || 0,
            str: metaInfo.incSTR || 0,
            dex: metaInfo.incDEX || 0,
            int: metaInfo.incINT || 0,
            luk: metaInfo.incLUK || 0,
            mad: metaInfo.incMAD || 0,
            pdef: metaInfo.incPDD || 0,
            mdef: metaInfo.incMDD || 0,
            acc: metaInfo.incACC || 0,
            eva: metaInfo.incEVA || 0,
          };
          setOriginStats(stats);
          setEditedStats(stats);
          setRequireStats({
            level: metaInfo.reqLevel || item.reqLevel || 0,
            str: metaInfo.reqSTR || 0,
            dex: metaInfo.reqDEX || 0,
            int: metaInfo.reqINT || 0,
            luk: metaInfo.reqLUK || 0,
          });
          setAttackSpeed(metaInfo.attackSpeed ?? null);
        } else {
          setAttackSpeed(null);
        }
      }

      // 아이콘: postItem에 커스텀 아이콘이 없으면 API에서 로드
      if (!postItem?.icon) {
        const iconUrl = await fetchItemIcon(item.id);
        if (iconUrl) setItemIcon(iconUrl);
      }
    } catch (error) {
      console.error("Failed to fetch item details:", error);
    } finally {
      setIsLoadingItem(false);
    }
  };

  // 아이템 장착
  const handleEquip = () => {
    if (!selectedItem || !selectedCategoryInfo) {
      alert("아이템을 선택해주세요");
      return;
    }

    const item: Item = {
      id: selectedItem.id,
      name: koreanName,
      icon: itemIcon || undefined,
      slot: selectedCategoryInfo.slot,
      type: selectedCategoryInfo.type,
      stats: {
        attack: editedStats.attack,
        str: editedStats.str,
        dex: editedStats.dex,
        int: editedStats.int,
        luk: editedStats.luk,
        mad: editedStats.mad,
        pdef: editedStats.pdef,
        mdef: editedStats.mdef,
        acc: editedStats.acc,
        eva: editedStats.eva,
        ...(attackSpeed != null ? { attackSpeed } : {}),
      },
      requireStats: requireStats,
    };

    const result = equipItem(item);
    if (result) {
      onClose();
    } else {
      alert("아이템 장착에 실패했습니다.");
    }
  };

  // 레벨대별로 아이템 그룹화
  const groupItemsByLevel = (items: ItemData[]) => {
    const groups: Record<string, ItemData[]> = {};
    items.forEach((item) => {
      const levelRange = Math.floor(item.reqLevel / 10) * 10;
      const key = `${levelRange}-${levelRange + 9}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    });
    return groups;
  };

  const itemGroups = groupItemsByLevel(categoryItems);

  // 직업에 맞는 무기 카테고리만 필터링
  const filteredWeaponCategories = WEAPON_CATEGORIES.filter(
    (cat) => !cat.jobs || !jobId || cat.jobs.includes(jobId)
  );

  // 직업에 맞는 보조무기 카테고리만 필터링
  const filteredSecondaryCategories = SECONDARY_CATEGORIES.filter(
    (cat) => !cat.jobs || !jobId || cat.jobs.includes(jobId)
  );

  // 카테고리 버튼 렌더링
  const renderCategoryButton = (category: CategoryInfo) => (
    <Button
      key={category.key}
      size="small"
      variant={selectedCategoryInfo?.key === category.key ? "contained" : "outlined"}
      onClick={() => handleCategoryClick(category)}
      sx={{
        minWidth: "auto",
        px: 1.5,
        py: 0.5,
        fontSize: "0.75rem",
      }}
    >
      {category.name}
    </Button>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>아이템 장착</DialogTitle>
      <DialogContent sx={{ pt: 1 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {/* 카테고리 탭 - 방어구 */}
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", alignItems: "center" }}>
            <Typography variant="caption" sx={{ width: 50, color: "#666", fontWeight: "bold" }}>
              방어구
            </Typography>
            {ARMOR_CATEGORIES.map(renderCategoryButton)}
          </Box>

          {/* 카테고리 탭 - 악세사리 */}
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", alignItems: "center" }}>
            <Typography variant="caption" sx={{ width: 50, color: "#666", fontWeight: "bold" }}>
              악세사리
            </Typography>
            {ACCESSORY_CATEGORIES.map(renderCategoryButton)}
          </Box>

          {/* 카테고리 탭 - 무기 */}
          {filteredWeaponCategories.length > 0 && (
            <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", alignItems: "center" }}>
              <Typography variant="caption" sx={{ width: 50, color: "#666", fontWeight: "bold" }}>
                무기
              </Typography>
              {filteredWeaponCategories.map(renderCategoryButton)}
            </Box>
          )}

          {/* 카테고리 탭 - 보조무기 */}
          <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", alignItems: "center" }}>
            <Typography variant="caption" sx={{ width: 50, color: "#666", fontWeight: "bold" }}>
              보조
            </Typography>
            {filteredSecondaryCategories.map(renderCategoryButton)}
          </Box>

          <Divider />

          {/* 아이템 목록 (레벨대별) */}
          <Box sx={{ maxHeight: 300, overflow: "auto" }}>
            {isLoadingCategory ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress size={40} />
              </Box>
            ) : !selectedCategoryInfo ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                카테고리를 선택하세요
              </Typography>
            ) : categoryItems.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", py: 4 }}>
                해당 직업이 착용할 수 있는 아이템이 없습니다
              </Typography>
            ) : (
              Object.entries(itemGroups).map(([levelRange, items]) => {
                const commonItems = items.filter((item) => item.reqJob === 0);
                const jobItems = items.filter((item) => item.reqJob !== 0);

                const renderItemBox = (item: ItemData) => {
                  const postIcon = categoryPostItems[String(item.id)]?.icon;
                  const iconSrc = postIcon || `https://maplestory.io/api/gms/62/item/${item.id}/icon?resize=5`;
                  return (
                    <Box
                      key={item.id}
                      onClick={() => handleItemClick(item)}
                      title={`${item.koreanName || item.name} (Lv.${item.reqLevel})`}
                      sx={{
                        width: 40,
                        height: 40,
                        border: selectedItem?.id === item.id ? `2px solid ${theme.palette.primary.main}` : "1px solid #ddd",
                        borderRadius: 1,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        bgcolor: selectedItem?.id === item.id ? "#e3f2fd" : "white",
                        "&:hover": { bgcolor: "#f5f5f5", borderColor: theme.palette.primary.main },
                      }}
                    >
                      <img
                        src={iconSrc}
                        alt=""
                        style={{ maxWidth: 32, maxHeight: 32 }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                        }}
                      />
                    </Box>
                  );
                };

                return (
                  <Box key={levelRange} sx={{ mb: 1.5 }}>
                    <Typography variant="caption" sx={{ color: "#666", fontWeight: "bold", display: "block", mb: 0.5 }}>
                      Lv.{levelRange}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1 }}>
                      {/* 공용 장비 (왼쪽) */}
                      {commonItems.length > 0 && (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          {commonItems.map(renderItemBox)}
                        </Box>
                      )}

                      {/* 구분선 */}
                      {commonItems.length > 0 && jobItems.length > 0 && (
                        <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
                      )}

                      {/* 직업 장비 (오른쪽) */}
                      {jobItems.length > 0 && (
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          {jobItems.map(renderItemBox)}
                        </Box>
                      )}
                    </Box>
                  </Box>
                );
              })
            )}
          </Box>

          <Divider />

          {/* 선택된 아이템 정보 */}
          {selectedItem && (
            <Box sx={{ display: "flex", gap: 2 }}>
              {/* 아이콘 */}
              <Box
                sx={{
                  width: 80,
                  height: 80,
                  border: "1px solid #ddd",
                  borderRadius: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  bgcolor: "#fafafa",
                  flexShrink: 0,
                }}
              >
                {isLoadingItem ? (
                  <CircularProgress size={30} />
                ) : itemIcon ? (
                  <img src={itemIcon} alt={koreanName} style={{ maxWidth: 64, maxHeight: 64 }} />
                ) : (
                  "?"
                )}
              </Box>

              {/* 아이템 정보 */}
              <Box sx={{ flex: 1 }}>
                <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
                  {koreanName || selectedItem.name} (Lv.{selectedItem.reqLevel})
                </Typography>

                <Box sx={{ display: "flex", gap: 2 }}>
                  {/* 착용 제한 (왼쪽) */}
                  <Box sx={{ flex: 0.8 }}>
                    <Typography variant="caption" sx={{ fontWeight: "bold", color: "#666", mb: 0.5, display: "block" }}>
                      착용 제한
                    </Typography>
                    {[
                      { key: "level", label: "레벨" },
                      { key: "str", label: "STR" },
                      { key: "dex", label: "DEX" },
                      { key: "int", label: "INT" },
                      { key: "luk", label: "LUK" },
                    ].map((stat) => (
                      <Box key={stat.key} sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.3 }}>
                        <Typography sx={{ width: 35, fontSize: "0.7rem", color: "#888" }}>{stat.label}</Typography>
                        <Typography sx={{ fontSize: "0.75rem" }}>
                          {requireStats[stat.key as keyof typeof requireStats]}
                        </Typography>
                      </Box>
                    ))}
                    {attackSpeed != null && (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.3, mt: 0.5 }}>
                        <Typography sx={{ width: 35, fontSize: "0.7rem", color: "#888" }}>공속</Typography>
                        <Typography sx={{ fontSize: "0.75rem" }}>
                          {attackSpeed}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  {/* 스탯 수정 (오른쪽) */}
                  <Box sx={{ flex: 1, borderLeft: "1px solid #eee", pl: 2 }}>
                    {[
                      { key: "str", label: "STR" },
                      { key: "dex", label: "DEX" },
                      { key: "int", label: "INT" },
                      { key: "luk", label: "LUK" },
                      { key: "attack", label: "공격력" },
                      { key: "mad", label: "마력" },
                    ].map((stat) => (
                      <Box key={stat.key} sx={{ display: "flex", alignItems: "center", gap: 0.3, mb: 0.3 }}>
                        <Typography sx={{ width: 45, fontSize: "0.75rem" }}>{stat.label}</Typography>
                        <TextField
                          type="number"
                          size="small"
                          value={editedStats[stat.key as keyof typeof editedStats]}
                          onChange={(e) =>
                            setEditedStats({ ...editedStats, [stat.key]: parseInt(e.target.value) || 0 })
                          }
                          sx={{
                            width: 55,
                            "& .MuiInputBase-input": { textAlign: "right", p: "2px 4px", fontSize: "0.75rem" },
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={() =>
                            setEditedStats({ ...editedStats, [stat.key]: (editedStats[stat.key as keyof typeof editedStats] || 0) + 1 })
                          }
                          sx={{ p: 1, width: 18, height: 18, fontSize: "0.7rem", border: "solid 1px #ccc", fontWeight: "bold" }}
                        >
                          +
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() =>
                            setEditedStats({ ...editedStats, [stat.key]: Math.max(0, (editedStats[stat.key as keyof typeof editedStats] || 0) - 1) })
                          }
                          sx={{ p: 1, width: 18, height: 18, fontSize: "0.7rem", border: "solid 1px #ccc", fontWeight: "bold" }}
                        >
                          -
                        </IconButton>
                      </Box>
                    ))}
                  </Box>

                  {/* 추가 스탯 수정 */}
                  <Box sx={{ flex: 1 }}>
                    {[
                      { key: "pdef", label: "물방" },
                      { key: "mdef", label: "마방" },
                      { key: "acc", label: "명중" },
                      { key: "eva", label: "회피" },
                    ].map((stat) => (
                      <Box key={stat.key} sx={{ display: "flex", alignItems: "center", gap: 0.3, mb: 0.3 }}>
                        <Typography sx={{ width: 45, fontSize: "0.75rem" }}>{stat.label}</Typography>
                        <TextField
                          type="number"
                          size="small"
                          value={editedStats[stat.key as keyof typeof editedStats]}
                          onChange={(e) =>
                            setEditedStats({ ...editedStats, [stat.key]: parseInt(e.target.value) || 0 })
                          }
                          sx={{
                            width: 55,
                            "& .MuiInputBase-input": { textAlign: "right", p: "2px 4px", fontSize: "0.75rem" },
                          }}
                        />
                        <IconButton
                          size="small"
                          onClick={() =>
                            setEditedStats({ ...editedStats, [stat.key]: (editedStats[stat.key as keyof typeof editedStats] || 0) + 1 })
                          }
                          sx={{ p: 1, width: 18, height: 18, fontSize: "0.7rem", border: "solid 1px #ccc", fontWeight: "bold" }}
                        >
                          +
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() =>
                            setEditedStats({ ...editedStats, [stat.key]: Math.max(0, (editedStats[stat.key as keyof typeof editedStats] || 0) - 1) })
                          }
                          sx={{ p: 1, width: 18, height: 18, fontSize: "0.7rem", border: "solid 1px #ccc", fontWeight: "bold" }}
                        >
                          -
                        </IconButton>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>취소</Button>
        <Button onClick={handleEquip} variant="contained" color="primary" disabled={!selectedItem}>
          장착
        </Button>
      </DialogActions>
    </Dialog>
  );
}
