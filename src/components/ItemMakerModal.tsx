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
  CircularProgress,
} from "@mui/material";
import { useState, useEffect, useRef } from "react";
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
  thrownAmmo: "보조무기",
  arrowAmmo: "보조무기",
  crossbowBoltAmmo: "보조무기",
};

// 카테고리에서 아이템 타입으로 매핑
const CATEGORY_TO_TYPE: Record<string, string> = {
  hat: "방어구",
  cape: "방어구",
  top: "방어구",
  glove: "방어구",
  overall: "전신",
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
  thrownAmmo: "표창",
  arrowAmmo: "화살",
  crossbowBoltAmmo: "석궁화살",
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

// 투사체 서브카테고리
const PROJECTILE_SUBCATEGORIES: Array<{ key: string; name: string }> = [
  { key: "thrownAmmo", name: "표창" },
  { key: "arrowAmmo", name: "화살" },
  { key: "crossbowBoltAmmo", name: "석궁화살" },
];

// 무기 타입에 따른 보조무기 매핑
const WEAPON_TO_SECONDARY: Record<string, string> = {
  oneHandedSword: "shield",
  twoHandedSword: "shield", // 개선 가능 - 양손 무기일 때 보조무기 불가
  oneHandedAxe: "shield",
  twoHandedAxe: "shield",
  oneHandedBlunt: "shield",
  twoHandedBlunt: "shield",
  spear: "shield",
  polearm: "shield",
  bow: "arrowAmmo",
  crossbow: "crossbowBoltAmmo",
  dagger: "shield",
  claw: "thrownAmmo",
  staff: "shield",
  wand: "shield",
};

// 카테고리별 서브카테고리 매핑
const SECONDARY_CATEGORY_TO_SUBCATEGORY: Record<string, string> = {
  shield: "shield",
  arrowAmmo: "arrowAmmo",
  crossbowBoltAmmo: "crossbowBoltAmmo",
  thrownAmmo: "thrownAmmo",
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

async function loadItemData(
  categoryKey: string,
  isWeapon: boolean = false,
  isProjectile: boolean = false,
): Promise<ItemData[]> {
  try {
    let path: string;
    if (isProjectile) {
      path = `../data/items/projectiles/${categoryKey}.json`;
    } else if (isWeapon) {
      path = `../data/items/weapons/${categoryKey}.json`;
    } else {
      path = `../data/items/${categoryKey}.json`;
    }
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
  const [selectedProjectileSubCategory, setSelectedProjectileSubCategory] = useState<string>("");
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const prevOpenRef = useRef<boolean>(false);

  const job = character.getJob();
  const jobId = job ? JOB_ID_MAP[job.engName] : null;

  const selectedCategory = internalCategory;

  // 현재 장착된 무기 타입 확인
  const equipments = character.getEquipments();
  const weapon = equipments.find((e) => e.slot === "무기");
  const weaponType = weapon?.type;

  // 보조무기 부 카테고리 목록 필터링
  const getSecondaryWeaponOptions = () => {
    const allOptions = [
      { key: "shield", name: "방패" },
      { key: "arrowAmmo", name: "화살" },
      { key: "crossbowBoltAmmo", name: "석궁화살" },
      { key: "thrownAmmo", name: "표창" },
    ];

    if (!weaponType) return allOptions;

    const oneHandedWeapons = ["한손검", "한손도끼", "한손둔기", "단검", "스태프", "완드"];
    
    if (oneHandedWeapons.includes(weaponType)) {
      return allOptions.filter((opt) => opt.key === "shield");
    } else if (weaponType === "활") {
      return allOptions.filter((opt) => opt.key === "arrowAmmo");
    } else if (weaponType === "석궁") {
      return allOptions.filter((opt) => opt.key === "crossbowBoltAmmo");
    } else if (weaponType === "아대") {
      return allOptions.filter((opt) => opt.key === "thrownAmmo");
    }

    return allOptions;
  };

  // 모달 닫기
  const handleClose = () => {
    setInternalCategory("");
    setSelectedWeaponSubCategory("");
    setSelectedProjectileSubCategory("");
    setSelectedItemId("");
    setSelectedItem(null);
    setCategoryItems([]);
    setKoreanName("");
    onClose();
  };

  // 모달이 열릴 때 초기화
  useEffect(() => {
    if (open && !prevOpenRef.current) {
      // 모달이 새로 열릴 때 모든 상태 초기화
      setInternalCategory(externalCategory || "");
      setSelectedWeaponSubCategory("");
      setSelectedProjectileSubCategory("");
      setSelectedItemId("");
      setSelectedItem(null);
      setCategoryItems([]);
      setKoreanName("");
      setEditedStats({
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
      setEditedRequireStats({
        level: 0,
        str: 0,
        dex: 0,
        int: 0,
        luk: 0,
      });
      setItemIcon("");
      setIsLoading(false);
    }
    prevOpenRef.current = open;
  }, [open, externalCategory]);

  // externalCategory가 변경되면 internalCategory 업데이트
  useEffect(() => {
    if (externalCategory && externalCategory !== "" && open) {
      setInternalCategory(externalCategory);
      setSelectedItemId("");
      setSelectedItem(null);
      setCategoryItems([]);
    }
  }, [externalCategory, open]);

  // 보조무기 카테고리가 선택되면 무기에 따라 부 카테고리 자동 설정
  useEffect(() => {
    if (internalCategory === "shield") {
      const equipments = character.getEquipments();
      const equipMap = new Map(equipments.map((eq) => [eq.slot, eq]));
      const weapon = equipMap.get("무기");

      if (weapon) {
        // 무기 타입에 따른 보조무기 부 카테고리 결정
        const weaponTypeMap: Record<string, string> = {
          "한손검": "shield",
          "한손도끼": "shield",
          "한손둔기": "shield",
          "단검": "shield",
          "스태프": "shield",
          "완드": "shield",
          "활": "arrowAmmo",
          "석궁": "crossbowBoltAmmo",
          "아대": "thrownAmmo",
        };

        const subCategory = weapon.type ? weaponTypeMap[weapon.type] : undefined;
        if (subCategory) {
          setSelectedProjectileSubCategory(subCategory);
        } else {
          setSelectedProjectileSubCategory("shield");
        }
      } else {
        setSelectedProjectileSubCategory("shield");
      }
    } else {
      setSelectedWeaponSubCategory("");
      setSelectedProjectileSubCategory("");
    }
  }, [internalCategory, character]);

  // 무기 카테고리 선택 시 초기화
  useEffect(() => {
    if (internalCategory === "weapon") {
      setCategoryItems([]);

      setSelectedItemId("");

      setSelectedItem(null);

      setSelectedWeaponSubCategory("");
    } else if (internalCategory === "projectiles") {
      setCategoryItems([]);

      setSelectedItemId("");

      setSelectedItem(null);

      setSelectedProjectileSubCategory("");
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
      const items = await loadItemData(selectedWeaponSubCategory, true, false);
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

  // 투사체 서브카테고리 선택 시 아이템 로드
  useEffect(() => {
    // internalCategory가 "shield"(보조무기)이고 selectedProjectileSubCategory가 설정되었을 때
    if (internalCategory === "shield" && selectedProjectileSubCategory) {
      const loadItems = async () => {
        // shield는 일반 방어구, 나머지는 투사체
        const isProjectile = selectedProjectileSubCategory !== "shield";
        const items = await loadItemData(selectedProjectileSubCategory, false, isProjectile);
        let filtered: ItemData[];
        if (jobId) {
          filtered = items.filter((item) => item.reqJob === 0 || item.reqJob === jobId);
        } else {
          filtered = items.filter((item) => item.reqJob === 0);
        }
        filtered = filtered.sort((a, b) => a.reqLevel - b.reqLevel);
        setCategoryItems(filtered);
        setSelectedItemId("");
        setSelectedItem(null);
      };

      loadItems();
    } else if (internalCategory !== "shield" && selectedProjectileSubCategory) {
      // 일반 투사체 카테고리일 때
      const loadItems = async () => {
        const items = await loadItemData(selectedProjectileSubCategory, false, true);
        let filtered: ItemData[];
        filtered = items.sort((a, b) => a.reqLevel - b.reqLevel);
        setCategoryItems(filtered);
        setSelectedItemId("");
        setSelectedItem(null);
      };

      loadItems();
    }
  }, [selectedProjectileSubCategory, internalCategory, jobId]);

  // 보조무기 카테고리 선택 시 무기에 따라 자동 설정
  useEffect(() => {
    if (internalCategory !== "shield") {
      return;
    }

    // 현재 장착된 무기 확인
    const equipments = character.getEquipments();
    const weapon = equipments.find((e) => e.slot === "무기");

    if (!weapon || !weapon.type) {
      // 무기가 없으면 보조무기 로드 불가
      setCategoryItems([]);
      setSelectedProjectileSubCategory("");
      return;
    }

    // 무기 타입에 따른 보조무기 결정
    const weaponType = weapon.type;
    const secondaryCategory = WEAPON_TO_SECONDARY[weaponType];

    if (!secondaryCategory) {
      setCategoryItems([]);
      setSelectedProjectileSubCategory("");
      return;
    }

    // 보조무기 서브카테고리 자동 설정
    const subCategory = SECONDARY_CATEGORY_TO_SUBCATEGORY[secondaryCategory];
    setSelectedProjectileSubCategory(subCategory);

    // 아이템 로드
    const loadItems = async () => {
      const isProjectile = secondaryCategory !== "shield";
      const items = await loadItemData(secondaryCategory, secondaryCategory === "shield", isProjectile);
      const filtered = items.sort((a, b) => a.reqLevel - b.reqLevel);
      setCategoryItems(filtered);
      setSelectedItemId("");
      setSelectedItem(null);
    };

    loadItems();
  }, [internalCategory, character]);

  // 아이템 선택 시 상세 정보 로드
  useEffect(() => {
    if (!selectedItem || selectedItem.id === 0) {
      console.log("No selected item or id is 0");
      return;
    }

    console.log("Loading details for item:", selectedItem);

    const loadDetails = async () => {
      setIsLoading(true);
      setItemIcon(""); // 아이콘 초기화

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
      } finally {
        setIsLoading(false);
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
                  const newCategory = e.target.value;
                  // 무기 없이 보조무기 선택 시도 방지
                  if (newCategory === "shield") {
                    const equipments = character.getEquipments();
                    const weapon = equipments.find((e) => e.slot === "무기");
                    if (!weapon) {
                      return;
                    }
                  }
                  setInternalCategory(newCategory);
                  if (newCategory === "weapon") {
                    setSelectedWeaponSubCategory("");
                  } else {
                    setSelectedProjectileSubCategory("");
                  }
                }}
              >
                {CATEGORY_LIST.map((cat) => {
                  // 보조무기 활성화 여부 결정
                  let isDisabled = false;
                  let displayName = cat.name;

                  if (cat.key === "shield") {
                    const equipments = character.getEquipments();
                    const weapon = equipments.find((e) => e.slot === "무기");
                    if (!weapon) {
                      isDisabled = true;
                      displayName = "보조무기(무기 장착 필요)";
                    }
                  }

                  return (
                    <MenuItem key={cat.key} value={cat.key} disabled={isDisabled}>
                      {displayName}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>

            {/* 부 카테고리 선택 */}
            <FormControl sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: "bold",
                  mb: 1,
                  color:
                    selectedCategory === "weapon" && jobId
                      ? "inherit"
                      : selectedCategory === "shield" && selectedProjectileSubCategory
                        ? "inherit"
                        : selectedCategory === "projectiles"
                          ? "inherit"
                          : "text.disabled",
                }}
              >
                부 카테고리
              </Typography>
              <Select
                value={selectedCategory === "shield" ? selectedProjectileSubCategory : selectedWeaponSubCategory}
                onChange={(e) => {
                  if (selectedCategory === "weapon") {
                    setSelectedWeaponSubCategory(e.target.value);
                  } else if (selectedCategory === "shield") {
                    setSelectedProjectileSubCategory(e.target.value);
                  } else if (selectedCategory === "projectiles") {
                    setSelectedProjectileSubCategory(e.target.value);
                  }
                }}
              >
                {(selectedCategory === "weapon" || selectedCategory === "projectiles") && (
                  <MenuItem value="">선택하세요</MenuItem>
                )}

                {/* 무기용 부 카테고리 */}
                {selectedCategory === "weapon" && jobId
                  ? (WEAPON_SUBCATEGORIES[jobId] || []).map((weapon) => (
                      <MenuItem key={weapon.key} value={weapon.key}>
                        {weapon.name}
                      </MenuItem>
                    ))
                  : null}

                {/* 보조무기 옵션 */}
                {selectedCategory === "shield"
                  ? getSecondaryWeaponOptions().map((item) => (
                      <MenuItem key={item.key} value={item.key}>
                        {item.name}
                      </MenuItem>
                    ))
                  : null}

                {/* 투사체용 부 카테고리 */}
                {selectedCategory === "projectiles"
                  ? PROJECTILE_SUBCATEGORIES.map((projectile) => (
                      <MenuItem key={projectile.key} value={projectile.key}>
                        {projectile.name}
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
                <Box sx={{ mb: 2, textAlign: "center" }}>
                  <Box
                    sx={{
                      width: 200,
                      height: 200,
                      border: "2px solid #999",
                      padding: "4px",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      bgcolor: "#fafafa",
                    }}
                  >
                    {isLoading ? (
                      <CircularProgress size={60} />
                    ) : itemIcon ? (
                      <img
                        src={itemIcon}
                        alt={koreanName}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "contain",
                        }}
                      />
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        아이템을 선택하세요
                      </Typography>
                    )}
                  </Box>
                </Box>

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
                              gap: 1,
                              mb: 0.5,
                              alignItems: "center",
                            }}
                          >
                            <Typography sx={{ width: 50, fontSize: "0.85rem" }}>{stat.label}</Typography>
                            <TextField
                              type="number"
                              size="small"
                              value={editedStats[stat.key as keyof typeof editedStats] ?? 0}
                              onChange={(e) =>
                                setEditedStats({
                                  ...editedStats,
                                  [stat.key]: parseInt(e.target.value) || 0,
                                })
                              }
                              sx={{
                                flex: 1,
                                "& .MuiInputBase-input": {
                                  textAlign: "right",
                                  padding: "4px 8px",
                                  fontSize: "0.85rem",
                                },
                              }}
                            />
                          </Box>
                        ))}
                      </Box>

                      {/* 오른쪽: 물리방어력, 마법방어력, 명중률, 회피율 */}
                      <Box sx={{ flex: 1 }}>
                        {[
                          { key: "pdef", label: "물방" },
                          { key: "mdef", label: "마방" },
                          { key: "acc", label: "명중" },
                          { key: "eva", label: "회피" },
                        ].map((stat) => (
                          <Box
                            key={stat.key}
                            sx={{
                              display: "flex",
                              gap: 1,
                              mb: 0.5,
                              alignItems: "center",
                            }}
                          >
                            <Typography sx={{ width: 50, fontSize: "0.85rem" }}>{stat.label}</Typography>
                            <TextField
                              type="number"
                              size="small"
                              value={editedStats[stat.key as keyof typeof editedStats] ?? 0}
                              onChange={(e) =>
                                setEditedStats({
                                  ...editedStats,
                                  [stat.key]: parseInt(e.target.value) || 0,
                                })
                              }
                              sx={{
                                flex: 1,
                                "& .MuiInputBase-input": {
                                  textAlign: "right",
                                  padding: "4px 8px",
                                  fontSize: "0.85rem",
                                },
                              }}
                            />
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
