import {
  Box,
  Typography,
  Select,
  MenuItem,
  FormControl,
  TextField,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import CheckIcon from "@mui/icons-material/Check";
import { useState, useEffect } from "react";
import { useCharacter } from "../contexts/CharacterContext";
import type { Item, ItemType } from "../types/item";
import type { EquipmentSlot } from "../types/equipment";
import { fetchItemDetails, fetchItemIcon } from "../api/maplestory";

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

// 카테고리에서 아이템 타입으로 매핑
const CATEGORY_TO_TYPE: Record<string, string> = {
  hat: "방어구",
  cape: "방어구",
  top: "방어구",
  glove: "방어구",
  overall: "방어구",
  bottom: "방어구",
  shield: "방어구",
  shoes: "방어구",
  earrings: "방어구",
  faceAccessory: "방어구",
  medal: "방어구",
  eyeDecoration: "방어구",
  pendant: "방어구",
  oneHandedSword: "한손검",
  twoHandedSword: "두손검",
  oneHandedAxe: "한손도끼",
  twoHandedAxe: "두손도끼",
  oneHandedBlunt: "한손둔기",
  twoHandedBlunt: "두손둔기",
  spear: "창",
  polearm: "폴암",
  bow: "활",
  crossbow: "석궁",
  dagger: "단검",
  claw: "아대",
  staff: "스태프",
  wand: "완드",
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
    { key: "bow", name: "활" },
    { key: "crossbow", name: "석궁" },
  ],
  2: [
    { key: "staff", name: "스태프" },
    { key: "wand", name: "완드" },
  ],
  8: [
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

interface ItemMakerModalProps {
  open: boolean;
  selectedCategory?: string;
  onClose: () => void;
}

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

export default function ItemMakerModal({ open, selectedCategory: externalCategory, onClose }: ItemMakerModalProps) {
  const { character, equipItem } = useCharacter();

  // 상태 선언 (모두 컴포넌트 최상위에)
  const [internalCategory, setInternalCategory] = useState<string>("");
  const [selectedWeaponSubCategory, setSelectedWeaponSubCategory] = useState<string>("");
  const [selectedItemId, setSelectedItemId] = useState<number | "">("");
  const [selectedItem, setSelectedItem] = useState<ItemData | null>(null);
  const [categoryItems, setCategoryItems] = useState<ItemData[]>([]);
  const [koreanName, setKoreanName] = useState<string>("");
  const [editedStats, setEditedStats] = useState({
    attack: 0,
    str: 0,
    dex: 0,
    int: 0,
    luk: 0,
    mad: 0,
    pdef: 0,
    mdef: 0,
    acc: 0,
    eva: 0,
  });

  const [editedRequireStats, setEditedRequireStats] = useState({
    level: 0,
    str: 0,
    dex: 0,
    int: 0,
    luk: 0,
  });

  const [itemIcon, setItemIcon] = useState<string>("");
  const [editingStatKey, setEditingStatKey] = useState<string | null>(null);

  const job = character.getJob();
  const jobId = job ? JOB_ID_MAP[job.engName] : null;

  const selectedCategory = internalCategory;

  // 모달 닫기
  const handleClose = () => {
    setInternalCategory("");
    setSelectedWeaponSubCategory("");
    setSelectedItemId("");
    setSelectedItem(null);
    setCategoryItems([]);
    setKoreanName("");
    onClose();
  };

  // externalCategory가 변경되면 internalCategory 업데이트
  useEffect(() => {
    if (externalCategory && externalCategory !== "") {
      setInternalCategory(externalCategory);

      setSelectedWeaponSubCategory("");

      setSelectedItemId("");

      setSelectedItem(null);

      setCategoryItems([]);
    }
  }, [externalCategory, open]);

  // 무기 카테고리 선택 시 초기화
  useEffect(() => {
    if (internalCategory === "weapon") {
      setCategoryItems([]);

      setSelectedItemId("");

      setSelectedItem(null);

      setSelectedWeaponSubCategory("");
    }
  }, [internalCategory]);

  // 카테고리 변경 시 아이템 로드
  useEffect(() => {
    if (!selectedCategory || selectedCategory === "weapon") {
      return;
    }

    const loadItems = async () => {
      const items = await loadItemData(selectedCategory, false);
      let filtered: ItemData[];
      if (jobId) {
        filtered = items.filter((item) => item.reqJob === 0 || item.reqJob === jobId);
      } else {
        filtered = items.filter((item) => item.reqJob === 0);
      }
      filtered.sort((a, b) => a.reqLevel - b.reqLevel);
      setCategoryItems(filtered);
      setSelectedItemId("");
      setSelectedItem(null);
    };

    loadItems();
  }, [selectedCategory, jobId]);

  // 무기 서브카테고리 선택 시 아이템 로드
  useEffect(() => {
    if (!selectedWeaponSubCategory) {
      return;
    }

    const loadItems = async () => {
      const items = await loadItemData(selectedWeaponSubCategory, true);
      let filtered: ItemData[];
      if (jobId) {
        filtered = items.filter((item) => item.reqJob === 0 || item.reqJob === jobId);
      } else {
        filtered = items.filter((item) => item.reqJob === 0);
      }
      filtered.sort((a, b) => a.reqLevel - b.reqLevel);
      setCategoryItems(filtered);
      setSelectedItemId("");
      setSelectedItem(null);
    };

    loadItems();
  }, [selectedWeaponSubCategory, jobId]);

  // 아이템 선택 시 상세 정보 로드
  useEffect(() => {
    if (!selectedItem || selectedItem.id === 0) {
      console.log("No selected item or id is 0");
      return;
    }

    console.log("Loading details for item:", selectedItem);

    const loadDetails = async () => {
      try {
        const details = await fetchItemDetails(selectedItem.id);
        console.log("Fetched details:", details);

        if (details) {
          setKoreanName(selectedItem.koreanName || selectedItem.name);

          // API 응답 구조에 맞게 데이터 추출 (metaInfo에 들어있음)
          const metaInfo = (details as any)?.metaInfo || {};

          const attack = typeof metaInfo.incPAD === "number" ? metaInfo.incPAD : 0;
          const str = typeof metaInfo.incSTR === "number" ? metaInfo.incSTR : 0;
          const dex = typeof metaInfo.incDEX === "number" ? metaInfo.incDEX : 0;
          const int = typeof metaInfo.incINT === "number" ? metaInfo.incINT : 0;
          const luk = typeof metaInfo.incLUK === "number" ? metaInfo.incLUK : 0;
          const mad = typeof metaInfo.incMAD === "number" ? metaInfo.incMAD : 0;
          const pdef = typeof metaInfo.incPDD === "number" ? metaInfo.incPDD : 0;
          const mdef = typeof metaInfo.incMDD === "number" ? metaInfo.incMDD : 0;
          const acc = typeof metaInfo.incACC === "number" ? metaInfo.incACC : 0;
          const eva = typeof metaInfo.incEVA === "number" ? metaInfo.incEVA : 0;

          console.log(
            "Setting stats - attack:",
            attack,
            "str:",
            str,
            "dex:",
            dex,
            "int:",
            int,
            "luk:",
            luk,
            "mad:",
            mad,
            "pdef:",
            pdef,
            "mdef:",
            mdef,
            "acc:",
            acc,
            "eva:",
            eva,
          );

          setEditedStats({
            attack,
            str,
            dex,
            int,
            luk,
            mad,
            pdef,
            mdef,
            acc,
            eva,
          });

          // 착용조건
          const reqLevel = typeof metaInfo.reqLevelEquip === "number" ? metaInfo.reqLevelEquip : 0;
          const reqStr = typeof metaInfo.reqSTR === "number" ? metaInfo.reqSTR : 0;
          const reqDex = typeof metaInfo.reqDEX === "number" ? metaInfo.reqDEX : 0;
          const reqInt = typeof metaInfo.reqINT === "number" ? metaInfo.reqINT : 0;
          const reqLuk = typeof metaInfo.reqLUK === "number" ? metaInfo.reqLUK : 0;

          console.log(
            "Setting require stats - level:",
            reqLevel,
            "str:",
            reqStr,
            "dex:",
            reqDex,
            "int:",
            reqInt,
            "luk:",
            reqLuk,
          );

          setEditedRequireStats({
            level: reqLevel,
            str: reqStr,
            dex: reqDex,
            int: reqInt,
            luk: reqLuk,
          });
        } else {
          console.log("No details returned from API");
        }

        // 아이콘 로드
        try {
          const iconUrl = await fetchItemIcon(selectedItem.id);
          console.log("Fetched icon URL:", iconUrl);
          if (iconUrl) {
            setItemIcon(iconUrl);
          }
        } catch (error) {
          console.error("Failed to fetch item icon:", error);
        }
      } catch (error) {
        console.error("Failed to fetch item details:", error);
      }
    };

    loadDetails();
  }, [selectedItem]);

  // 수정된 스탯으로 아이템 생성
  const handleEquip = () => {
    if (!selectedItem || selectedCategory === "weapon") {
      alert("아이템을 선택해주세요");
      return;
    }

    const item: Item = {
      id: selectedItem.id,
      name: koreanName,
      slot: CATEGORY_TO_SLOT[selectedCategory],
      type: CATEGORY_TO_TYPE[selectedCategory] as ItemType,
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
      },
      requireStats: editedRequireStats,
    };

    const result = equipItem(item);
    if (result) {
      alert("아이템이 장착되었습니다!");
      handleClose();
    } else {
      alert("아이템 장착에 실패했습니다.");
    }
  };

  const handleWeaponEquip = async () => {
    if (!selectedItem) {
      alert("아이템을 선택해주세요");
      return;
    }

    const item: Item = {
      id: selectedItem.id,
      name: koreanName,
      slot: CATEGORY_TO_SLOT[selectedWeaponSubCategory],
      type: CATEGORY_TO_TYPE[selectedWeaponSubCategory] as ItemType,
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
      },
      requireStats: editedRequireStats,
    };

    const result = equipItem(item);
    if (result) {
      alert("무기가 장착되었습니다!");
      handleClose();
    } else {
      alert("무기 장착에 실패했습니다.");
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>아이템 장착</DialogTitle>
      <Divider />
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3, py: 2 }}>
          {/* 카테고리바 (수평 배치) */}
          <Box sx={{ display: "flex", gap: 2, alignItems: "flex-end" }}>
            {/* 카테고리 선택 */}
            <FormControl sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
                카테고리
              </Typography>
              <Select
                value={selectedCategory}
                onChange={(e) => {
                  setInternalCategory(e.target.value);
                  setSelectedWeaponSubCategory("");
                }}
              >
                {CATEGORY_LIST.map((cat) => (
                  <MenuItem key={cat.key} value={cat.key}>
                    {cat.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* 무기 서브카테고리 선택 */}
            <FormControl sx={{ flex: 1 }} disabled={selectedCategory !== "weapon" || !jobId}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: "bold",
                  mb: 1,
                  color: selectedCategory === "weapon" && jobId ? "inherit" : "text.disabled",
                }}
              >
                부 카테고리
              </Typography>
              <Select value={selectedWeaponSubCategory} onChange={(e) => setSelectedWeaponSubCategory(e.target.value)}>
                <MenuItem value="">선택하세요</MenuItem>
                {selectedCategory === "weapon" && jobId
                  ? (WEAPON_SUBCATEGORIES[jobId] || []).map((weapon) => (
                      <MenuItem key={weapon.key} value={weapon.key}>
                        {weapon.name}
                      </MenuItem>
                    ))
                  : null}
              </Select>
            </FormControl>

            {/* 아이템 선택 */}
            <FormControl sx={{ flex: 1 }} disabled={categoryItems.length === 0}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: "bold",
                  mb: 1,
                  color: categoryItems.length > 0 ? "inherit" : "text.disabled",
                }}
              >
                아이템 선택
              </Typography>
              <Select
                value={selectedItemId}
                onChange={(e) => {
                  const itemId = Number(e.target.value);
                  const item = categoryItems.find((i) => i.id === itemId);
                  setSelectedItemId(itemId);
                  if (item) {
                    console.log("Item selected:", item);
                    setSelectedItem(item);
                  }
                }}
              >
                <MenuItem value="">선택하세요</MenuItem>
                {categoryItems.map((item) => (
                  <MenuItem key={item.id} value={item.id}>
                    Lv.{item.reqLevel} {item.koreanName || item.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Divider />

          {/* 아이템 정보 섹션 (좌우 2분할) */}
          {selectedItem && (
            <Box sx={{ display: "flex", gap: 2 }}>
              {/* 왼쪽: 아이템 정보 */}
              <Box sx={{ flex: 1 }}>
                {/* 아이콘 */}
                {itemIcon && (
                  <Box sx={{ mb: 2, textAlign: "center" }}>
                    <img
                      src={itemIcon}
                      alt={koreanName}
                      style={{
                        width: 200,
                        height: 200,
                        objectFit: "contain",
                        border: "2px solid #999",
                        padding: "4px",
                      }}
                    />
                  </Box>
                )}

                <Typography variant="body1" sx={{ fontWeight: "bold", mb: 2 }}>
                  {koreanName} (ID: {selectedItem.id})
                </Typography>

                <Divider sx={{ my: 1 }} />

                {/* 필요 스탯 섹션 (좌우 분할) */}
                <Box sx={{ display: "flex", gap: 2 }}>
                  {/* 왼쪽: 착용조건 */}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
                      착용조건
                    </Typography>

                    {[
                      { key: "level", label: "레벨" },
                      { key: "str", label: "STR" },
                      { key: "dex", label: "DEX" },
                      { key: "int", label: "INT" },
                      { key: "luk", label: "LUK" },
                    ].map((stat) => (
                      <Box key={stat.key} sx={{ display: "flex", gap: 1, mb: 1, alignItems: "center" }}>
                        <Typography sx={{ width: 50, fontSize: "0.85rem" }}>{stat.label}</Typography>
                        <Typography sx={{ flex: 1, fontSize: "0.85rem" }}>
                          {editedRequireStats[stat.key as keyof typeof editedRequireStats]}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  <Divider orientation="vertical" flexItem />

                  {/* 아이템 정보 - 수정 가능 (좌우 2분할) */}
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
                      아이템 정보
                    </Typography>

                    <Box sx={{ display: "flex", gap: 2 }}>
                      {/* 왼쪽: STR, DEX, INT, LUK, 공격력, 마력 */}
                      <Box sx={{ flex: 1 }}>
                        {[
                          { key: "str", label: "STR" },
                          { key: "dex", label: "DEX" },
                          { key: "int", label: "INT" },
                          { key: "luk", label: "LUK" },
                          { key: "attack", label: "공격력" },
                          { key: "mad", label: "마력" },
                        ].map((stat) => (
                          <Box
                            key={stat.key}
                            sx={{
                              display: "flex",
                              gap: 0,
                              mb: 1,
                              alignItems: "center",
                              borderBottom: "1px solid #ccc",
                              pb: 0.5,
                            }}
                          >
                            <Typography sx={{ width: 70, fontSize: "0.85rem" }}>{stat.label}</Typography>
                            {editingStatKey === stat.key ? (
                              <>
                                <TextField
                                  type="number"
                                  size="small"
                                  autoFocus
                                  value={editedStats[stat.key as keyof typeof editedStats] ?? 0}
                                  onChange={(e) =>
                                    setEditedStats({
                                      ...editedStats,
                                      [stat.key]: parseInt(e.target.value) || 0,
                                    })
                                  }
                                  onBlur={() => setEditingStatKey(null)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      setEditingStatKey(null);
                                    }
                                  }}
                                  variant="standard"
                                  sx={{ flex: 1, textAlign: "right" }}
                                  inputProps={{ style: { textAlign: "right" } }}
                                />
                                <IconButton
                                  size="small"
                                  onClick={() => setEditingStatKey(null)}
                                  sx={{ padding: "0px", minWidth: "auto", ml: 1.5 }}
                                >
                                  <CheckIcon sx={{ fontSize: "1rem" }} />
                                </IconButton>
                              </>
                            ) : (
                              <>
                                <Typography sx={{ flex: 1, fontSize: "0.85rem", textAlign: "right" }}>
                                  {editedStats[stat.key as keyof typeof editedStats] ?? 0}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={() => setEditingStatKey(stat.key)}
                                  sx={{ padding: "0px", minWidth: "auto", ml: 1.5 }}
                                >
                                  <EditIcon sx={{ fontSize: "1rem" }} />
                                </IconButton>
                              </>
                            )}
                          </Box>
                        ))}
                      </Box>

                      {/* 오른쪽: 물리방어력, 마법방어력, 명중률, 회피율 */}
                      <Box sx={{ flex: 1 }}>
                        {[
                          { key: "pdef", label: "물리방어력" },
                          { key: "mdef", label: "마법방어력" },
                          { key: "acc", label: "명중률" },
                          { key: "eva", label: "회피율" },
                        ].map((stat) => (
                          <Box
                            key={stat.key}
                            sx={{
                              display: "flex",
                              gap: 0,
                              mb: 1,
                              alignItems: "center",
                              borderBottom: "1px solid #ccc",
                              pb: 0.5,
                            }}
                          >
                            <Typography sx={{ width: 70, fontSize: "0.85rem" }}>{stat.label}</Typography>
                            {editingStatKey === stat.key ? (
                              <>
                                <TextField
                                  type="number"
                                  size="small"
                                  autoFocus
                                  value={editedStats[stat.key as keyof typeof editedStats] ?? 0}
                                  onChange={(e) =>
                                    setEditedStats({
                                      ...editedStats,
                                      [stat.key]: parseInt(e.target.value) || 0,
                                    })
                                  }
                                  onBlur={() => setEditingStatKey(null)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      setEditingStatKey(null);
                                    }
                                  }}
                                  variant="standard"
                                  sx={{ flex: 1, textAlign: "right" }}
                                  inputProps={{ style: { textAlign: "right" } }}
                                />
                                <IconButton
                                  size="small"
                                  onClick={() => setEditingStatKey(null)}
                                  sx={{ padding: "0px", minWidth: "auto", ml: 1.5 }}
                                >
                                  <CheckIcon sx={{ fontSize: "1rem" }} />
                                </IconButton>
                              </>
                            ) : (
                              <>
                                <Typography sx={{ flex: 1, fontSize: "0.85rem", textAlign: "right" }}>
                                  {editedStats[stat.key as keyof typeof editedStats] ?? 0}
                                </Typography>
                                <IconButton
                                  size="small"
                                  onClick={() => setEditingStatKey(stat.key)}
                                  sx={{ padding: "0px", minWidth: "auto", ml: 1.5 }}
                                >
                                  <EditIcon sx={{ fontSize: "1rem" }} />
                                </IconButton>
                              </>
                            )}
                          </Box>
                        ))}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </DialogContent>
      <Divider />
      <DialogActions>
        <Button onClick={handleClose}>취소</Button>
        {selectedCategory === "weapon" ? (
          <Button onClick={handleWeaponEquip} variant="contained" color="primary">
            장착
          </Button>
        ) : (
          <Button onClick={handleEquip} variant="contained" color="primary">
            장착
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
