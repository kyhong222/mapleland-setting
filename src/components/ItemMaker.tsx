import { Box, Typography, Select, MenuItem, FormControl, TextField, Button, Divider } from "@mui/material";
import { useState } from "react";
import { useCharacter } from "../contexts/CharacterContext";
import type { Item } from "../types/item";
import type { EquipmentSlot } from "../types/equipment";
import { fetchItemDetails, fetchItemNameKMS, type MapleStoryItem } from "../api/maplestory";

// 직업별 ID 매핑
const JOB_ID_MAP: Record<string, number> = {
  warrior: 1,
  archer: 4,
  magician: 2,
  thief: 8,
};

// 카테고리에서 EquipmentSlot으로 매핑
const CATEGORY_TO_SLOT: Record<string, EquipmentSlot> = {
  hat: "투구",
  cape: "망토",
  top: "상의",
  glove: "장갑",
  overall: "전신",
  bottom: "하의",
  shield: "보조무기",
  shoes: "신발",
  earrings: "귀고리",
  faceAccessory: "얼굴장식",
  medal: "훈장",
  eyeDecoration: "눈장식",
  pendant: "목걸이",
  oneHandedSword: "무기",
  twoHandedSword: "무기",
  oneHandedAxe: "무기",
  twoHandedAxe: "무기",
  oneHandedBlunt: "무기",
  twoHandedBlunt: "무기",
  spear: "무기",
  polearm: "무기",
  bow: "무기",
  crossbow: "무기",
  dagger: "무기",
  claw: "무기",
  staff: "무기",
  wand: "무기",
};

// 카테고리 목록
const CATEGORY_LIST: Array<{ key: string; name: string }> = [
  { key: "hat", name: "투구" },
  { key: "cape", name: "망토" },
  { key: "top", name: "상의" },
  { key: "glove", name: "장갑" },
  { key: "overall", name: "전신" },
  { key: "bottom", name: "하의" },
  { key: "shield", name: "보조무기" },
  { key: "shoes", name: "신발" },
  { key: "earrings", name: "귀고리" },
  { key: "faceAccessory", name: "얼굴장식" },
  { key: "medal", name: "훈장" },
  { key: "eyeDecoration", name: "눈장식" },
  { key: "pendant", name: "목걸이" },
  { key: "weapon", name: "무기" },
];

// 직업별 무기 서브카테고리
const WEAPON_SUBCATEGORIES: Record<number, Array<{ key: string; name: string }>> = {
  1: [
    // 전사
    { key: "oneHandedSword", name: "한손검" },
    { key: "twoHandedSword", name: "두손검" },
    { key: "oneHandedAxe", name: "한손도끼" },
    { key: "twoHandedAxe", name: "두손도끼" },
    { key: "oneHandedBlunt", name: "한손둔기" },
    { key: "twoHandedBlunt", name: "두손둔기" },
    { key: "spear", name: "창" },
    { key: "polearm", name: "폴암" },
  ],
  4: [
    // 궁수
    { key: "bow", name: "활" },
    { key: "crossbow", name: "석궁" },
  ],
  2: [
    // 마법사
    { key: "staff", name: "스태프" },
    { key: "wand", name: "완드" },
  ],
  8: [
    // 도적
    { key: "dagger", name: "단검" },
    { key: "claw", name: "아대" },
  ],
};

interface ItemData {
  id: number;
  name: string;
  koreanName: string;
  reqJob: number;
  reqLevel: number;
}

// 동적으로 JSON 파일 임포트
async function loadItemData(categoryKey: string, isWeapon: boolean = false): Promise<ItemData[]> {
  try {
    const path = isWeapon ? `../data/items/weapons/${categoryKey}.json` : `../data/items/${categoryKey}.json`;
    const module = await import(path);
    return module.default;
  } catch (error) {
    console.error(`Failed to load ${categoryKey}.json:`, error);
    return [];
  }
}

export default function ItemMaker() {
  const { character, equipItem } = useCharacter();

  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedWeaponSubCategory, setSelectedWeaponSubCategory] = useState<string>("");
  const [selectedItemId, setSelectedItemId] = useState<number | "">();
  const [selectedItem, setSelectedItem] = useState<ItemData | null>(null);
  const [categoryItems, setCategoryItems] = useState<ItemData[]>([]);
  const [itemDetails, setItemDetails] = useState<MapleStoryItem | null>(null);
  const [itemIcon, setItemIcon] = useState<string>("");
  const [koreanName, setKoreanName] = useState<string>("");
  const [editedStats, setEditedStats] = useState({
    attack: 0,
    str: 0,
    dex: 0,
    int: 0,
    luk: 0,
  });

  const [editedRequireStats, setEditedRequireStats] = useState({
    level: 0,
    str: 0,
    dex: 0,
    int: 0,
    luk: 0,
  });

  const job = character.getJob();
  const jobId = job ? JOB_ID_MAP[job.engName] : null;

  // 카테고리 선택 시 아이템 로드
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setSelectedWeaponSubCategory("");
    setSelectedItemId("");
    setSelectedItem(null);

    if (!category || category === "weapon") {
      setCategoryItems([]);
      return;
    }

    // JSON 파일에서 데이터 로드
    loadItemData(category, false)
      .then((items) => {
        // 현재 직업에 맞는 아이템만 필터링
        let filtered: ItemData[];
        if (jobId) {
          filtered = items.filter((item) => item.reqJob === 0 || item.reqJob === jobId);
        } else {
          // 직업이 선택되지 않은 경우 공용 아이템만
          filtered = items.filter((item) => item.reqJob === 0);
        }
        // reqLevel로 정렬
        filtered.sort((a, b) => a.reqLevel - b.reqLevel);
        setCategoryItems(filtered);
      })
      .catch(console.error);
  };

  // 무기 서브카테고리 선택 시
  const handleWeaponSubCategoryChange = (subCategory: string) => {
    setSelectedWeaponSubCategory(subCategory);
    setSelectedItemId("");
    setSelectedItem(null);

    if (!subCategory) {
      setCategoryItems([]);
      return;
    }

    // JSON 파일에서 데이터 로드
    loadItemData(subCategory, true)
      .then((items) => {
        // 현재 직업에 맞는 아이템만 필터링
        let filtered: ItemData[];
        if (jobId) {
          filtered = items.filter((item) => item.reqJob === 0 || item.reqJob === jobId);
        } else {
          // 직업이 선택되지 않은 경우 공용 아이템만
          filtered = items.filter((item) => item.reqJob === 0);
        }
        // reqLevel로 정렬
        filtered.sort((a, b) => a.reqLevel - b.reqLevel);
        setCategoryItems(filtered);
      })
      .catch(console.error);
  };

  // 아이템 선택 시
  const handleItemSelect = async (itemId: number) => {
    if (!itemId) return;
    setSelectedItemId(itemId);

    const item = categoryItems.find((i) => i.id === itemId);
    if (item) {
      setSelectedItem(item);

      // API에서 상세 정보 가져오기
      try {
        const details = await fetchItemDetails(itemId);
        setItemDetails(details);

        // 아이콘 URL 설정
        if (details?.icon) {
          setItemIcon(details.icon);
        } else {
          setItemIcon(`https://maplestory.io/api/gms/62/item/${itemId}/icon`);
        }

        // 한글 이름 가져오기
        const kName = await fetchItemNameKMS(itemId);
        setKoreanName(kName || item.name);

        // 요구 스텟과 추가 스텟 설정
        const meta = details?.metaInfo;
        setEditedStats({
          attack: meta?.incPAD || 0,
          str: meta?.incSTR || 0,
          dex: meta?.incDEX || 0,
          int: meta?.incINT || 0,
          luk: meta?.incLUK || 0,
        });
        setEditedRequireStats({
          level: meta?.reqLevel || 0,
          str: meta?.reqSTR || 0,
          dex: meta?.reqDEX || 0,
          int: meta?.reqINT || 0,
          luk: meta?.reqLUK || 0,
        });
      } catch (error) {
        console.error("아이템 상세 정보 로드 실패:", error);
      }
    }
  };

  // 장착 버튼
  const handleEquip = () => {
    if (!selectedItem) return;

    const actualCategory = selectedCategory === "weapon" ? selectedWeaponSubCategory : selectedCategory;
    if (!actualCategory) return;

    const slotName = CATEGORY_TO_SLOT[actualCategory];
    const itemToEquip: Item = {
      id: selectedItem.id,
      name: selectedItem.koreanName || selectedItem.name,
      slot: slotName,
      type: "방어구",
      stats: editedStats,
      requireStats: editedRequireStats,
    };

    equipItem(itemToEquip);

    // 초기화
    setSelectedCategory("");
    setSelectedWeaponSubCategory("");
    setSelectedItemId("");
    setSelectedItem(null);
    setEditedStats({ attack: 0, str: 0, dex: 0, int: 0, luk: 0 });
    setEditedRequireStats({ level: 0, str: 0, dex: 0, int: 0, luk: 0 });
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1200,
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
        {!jobId ? (
          <Box sx={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Typography variant="body2" sx={{ color: "#999" }}>
              직업을 먼저 선택하세요
            </Typography>
          </Box>
        ) : (
          <>
            {/* 왼쪽: 필터 */}
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ fontSize: "0.875rem", fontWeight: "500", mb: 0.5 }}>
                  카테고리
                </Typography>
                <FormControl size="small" fullWidth>
                  <Select
                    value={selectedCategory || ""}
                    onChange={(e) => handleCategoryChange(e.target.value as string)}
                    displayEmpty
                    sx={{ bgcolor: "white" }}
                  >
                    <MenuItem value="" disabled>
                      선택하세요
                    </MenuItem>
                    {CATEGORY_LIST.map((category) => (
                      <MenuItem key={category.key} value={category.key}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* 무기 서브카테고리 */}
              {selectedCategory === "weapon" && jobId && WEAPON_SUBCATEGORIES[jobId] && (
                <Box>
                  <Typography variant="body2" sx={{ fontSize: "0.875rem", fontWeight: "500", mb: 0.5 }}>
                    무기 종류
                  </Typography>
                  <FormControl size="small" fullWidth>
                    <Select
                      value={selectedWeaponSubCategory || ""}
                      onChange={(e) => handleWeaponSubCategoryChange(e.target.value as string)}
                      displayEmpty
                      sx={{ bgcolor: "white" }}
                    >
                      <MenuItem value="" disabled>
                        선택하세요
                      </MenuItem>
                      {WEAPON_SUBCATEGORIES[jobId].map((subCat) => (
                        <MenuItem key={subCat.key} value={subCat.key}>
                          {subCat.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              )}

              <Box>
                <Typography variant="body2" sx={{ fontSize: "0.875rem", fontWeight: "500", mb: 0.5 }}>
                  아이템
                </Typography>
                <FormControl size="small" fullWidth>
                  <Select
                    value={selectedItemId ? String(selectedItemId) : ""}
                    onChange={(e) => handleItemSelect(Number(e.target.value))}
                    displayEmpty
                    disabled={
                      !selectedCategory ||
                      (selectedCategory === "weapon" && !selectedWeaponSubCategory) ||
                      categoryItems.length === 0
                    }
                    sx={{ bgcolor: "white" }}
                  >
                    <MenuItem value="" disabled>
                      {!selectedCategory
                        ? "카테고리 선택"
                        : selectedCategory === "weapon" && !selectedWeaponSubCategory
                        ? "무기 종류 선택"
                        : categoryItems.length === 0
                        ? "아이템 없음"
                        : "선택하세요"}
                    </MenuItem>
                    {categoryItems.map((item) => (
                      <MenuItem key={item.id} value={String(item.id)}>
                        Lv.{item.reqLevel} {item.koreanName || item.name}
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
                <Box sx={{ display: "flex", gap: 2, height: "100%" }}>
                  {/* 왼쪽: 아이콘과 이름 */}
                  <Box sx={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                    {itemIcon && (
                      <img
                        src={itemIcon}
                        alt={koreanName || selectedItem.name}
                        style={{ maxWidth: "64px", maxHeight: "64px" }}
                      />
                    )}
                    <Typography variant="body2" sx={{ fontWeight: "bold", textAlign: "center", fontSize: "0.85rem" }}>
                      {koreanName || selectedItem.koreanName || selectedItem.name}
                    </Typography>
                  </Box>

                  {/* 가운데: 착용 정보 */}
                  <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
                    <Typography
                      variant="body2"
                      sx={{ fontSize: "0.75rem", fontWeight: "bold", mb: 0.5, color: "#1976d2" }}
                    >
                      착용 정보
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: "0.7rem", color: "#666" }}>
                      레벨: {itemDetails?.metaInfo?.reqLevel || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: "0.7rem", color: "#666" }}>
                      STR: {itemDetails?.metaInfo?.reqSTR || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: "0.7rem", color: "#666" }}>
                      DEX: {itemDetails?.metaInfo?.reqDEX || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: "0.7rem", color: "#666" }}>
                      INT: {itemDetails?.metaInfo?.reqINT || 0}
                    </Typography>
                    <Typography variant="body2" sx={{ fontSize: "0.7rem", color: "#666" }}>
                      LUK: {itemDetails?.metaInfo?.reqLUK || 0}
                    </Typography>
                  </Box>

                  {/* 오른쪽: 증가 정보 */}
                  <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 0.5 }}>
                    <Typography
                      variant="body2"
                      sx={{ fontSize: "0.75rem", fontWeight: "bold", mb: 0.5, color: "#2e7d32" }}
                    >
                      증가 정보
                    </Typography>
                    {editedStats.attack > 0 && (
                      <Typography variant="body2" sx={{ fontSize: "0.7rem", color: "#666" }}>
                        공격력: +{editedStats.attack}
                      </Typography>
                    )}
                    {itemDetails?.metaInfo?.incMAD ? (
                      <Typography variant="body2" sx={{ fontSize: "0.7rem", color: "#666" }}>
                        마력: +{itemDetails.metaInfo.incMAD}
                      </Typography>
                    ) : null}
                    {editedStats.str > 0 && (
                      <Typography variant="body2" sx={{ fontSize: "0.7rem", color: "#666" }}>
                        STR: +{editedStats.str}
                      </Typography>
                    )}
                    {editedStats.dex > 0 && (
                      <Typography variant="body2" sx={{ fontSize: "0.7rem", color: "#666" }}>
                        DEX: +{editedStats.dex}
                      </Typography>
                    )}
                    {editedStats.int > 0 && (
                      <Typography variant="body2" sx={{ fontSize: "0.7rem", color: "#666" }}>
                        INT: +{editedStats.int}
                      </Typography>
                    )}
                    {editedStats.luk > 0 && (
                      <Typography variant="body2" sx={{ fontSize: "0.7rem", color: "#666" }}>
                        LUK: +{editedStats.luk}
                      </Typography>
                    )}
                    {itemDetails?.metaInfo?.incPDD ? (
                      <Typography variant="body2" sx={{ fontSize: "0.7rem", color: "#666" }}>
                        물리방어: +{itemDetails.metaInfo.incPDD}
                      </Typography>
                    ) : null}
                    {itemDetails?.metaInfo?.incMDD ? (
                      <Typography variant="body2" sx={{ fontSize: "0.7rem", color: "#666" }}>
                        마법방어: +{itemDetails.metaInfo.incMDD}
                      </Typography>
                    ) : null}
                    {itemDetails?.metaInfo?.incACC ? (
                      <Typography variant="body2" sx={{ fontSize: "0.7rem", color: "#666" }}>
                        명중률: +{itemDetails.metaInfo.incACC}
                      </Typography>
                    ) : null}
                    {itemDetails?.metaInfo?.incEVA ? (
                      <Typography variant="body2" sx={{ fontSize: "0.7rem", color: "#666" }}>
                        회피율: +{itemDetails.metaInfo.incEVA}
                      </Typography>
                    ) : null}
                  </Box>
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

              {["attack", "str", "dex", "int", "luk"].map((stat) => (
                <Box key={stat} sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <Typography variant="body2" sx={{ fontSize: "0.75rem", minWidth: "40px" }}>
                    {stat === "attack" ? "공격력" : stat.toUpperCase()}
                  </Typography>
                  <TextField
                    type="number"
                    size="small"
                    value={editedStats[stat as keyof typeof editedStats]}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setEditedStats((prev) => ({
                        ...prev,
                        [stat]: parseInt(e.target.value) || 0,
                      }))
                    }
                    sx={{ flex: 1 }}
                  />
                </Box>
              ))}

              <Button
                variant="contained"
                onClick={handleEquip}
                disabled={!selectedItem}
                sx={{
                  mt: 1,
                  bgcolor: "#1976d2",
                  color: "white",
                  py: 1,
                  "&:hover": { bgcolor: "#1565c0" },
                  "&:disabled": { bgcolor: "#ccc", color: "#666" },
                }}
              >
                장착
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
}
