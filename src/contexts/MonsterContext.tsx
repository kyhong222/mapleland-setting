import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { fetchMobDetails, fetchMobIcon } from "../api/maplestory";
import { saveSelectedMobId } from "../utils/characterStorage";

interface MobListEntry {
  id: number;
  name: string;
  koreanName: string;
  level: number;
  isBoss: boolean;
  foundAt: string[];
}

interface MobWzEntry {
  id: number;
  PADamage?: number;
  MADamage?: number;
  acc?: number;
  skills?: Record<string, unknown>;
}

// 모듈 레벨 캐시: 한 번 로드하면 재사용
let mobWzCache: Record<string, MobWzEntry> | null = null;
let mobWzPromise: Promise<Record<string, MobWzEntry>> | null = null;

function loadMobWzData(): Promise<Record<string, MobWzEntry>> {
  if (mobWzCache) return Promise.resolve(mobWzCache);
  if (!mobWzPromise) {
    mobWzPromise = import("../data/mobs/mobWzData.json").then((mod) => {
      mobWzCache = mod.default as Record<string, MobWzEntry>;
      return mobWzCache;
    });
  }
  return mobWzPromise;
}

interface MonsterContextType {
  // 몬스터 정보
  selectedMob: MobListEntry | null;
  mobIcon: string | null;
  monsterATT: number;
  monsterMATT: number;
  monsterACC: number;
  monsterLevel: number;
  monsterHP: number;
  monsterPDD: number;
  monsterMDD: number;
  monsterEVA: number;
  
  // 파워업/매직업
  powerUpEnabled: boolean;
  magicUpEnabled: boolean;
  
  // 모달 상태
  mobModalOpen: boolean;
  selectedSubRegion: string | null;
  mobSearchText: string;
  
  // WZ 데이터
  mobWzData: Record<string, MobWzEntry> | null;
  
  // 액션
  setSelectedMob: (mob: MobListEntry | null) => void;
  handleMobSelect: (mob: MobListEntry | null, jobEngName?: string) => Promise<void>;
  setPowerUpEnabled: (enabled: boolean) => void;
  setMagicUpEnabled: (enabled: boolean) => void;
  setMobModalOpen: (open: boolean) => void;
  setSelectedSubRegion: (region: string | null) => void;
  setMobSearchText: (text: string) => void;
  setMonsterATT: (att: number) => void;
  setMonsterMATT: (matt: number) => void;
  setMonsterACC: (acc: number) => void;
  setMonsterLevel: (level: number) => void;
  setMonsterHP: (hp: number) => void;
  setMonsterPDD: (pdd: number) => void;
  setMonsterMDD: (mdd: number) => void;
  setMonsterEVA: (eva: number) => void;
}

const MonsterContext = createContext<MonsterContextType | undefined>(undefined);

export function MonsterProvider({ children }: { children: ReactNode }) {
  // DamageReceivedTable에서 복사한 상태들
  const [selectedMob, setSelectedMob] = useState<MobListEntry | null>(null);
  const [mobIcon, setMobIcon] = useState<string | null>(null);
  const [monsterATT, setMonsterATT] = useState(630);
  const [monsterMATT, setMonsterMATT] = useState(480);
  const [monsterACC, setMonsterACC] = useState(250);
  const [monsterLevel, setMonsterLevel] = useState(125);
  const [monsterHP, setMonsterHP] = useState(0);
  const [monsterPDD, setMonsterPDD] = useState(0);
  const [monsterMDD, setMonsterMDD] = useState(0);
  const [monsterEVA, setMonsterEVA] = useState(0);
  const [powerUpEnabled, setPowerUpEnabled] = useState(false);
  const [magicUpEnabled, setMagicUpEnabled] = useState(false);
  const [mobModalOpen, setMobModalOpen] = useState(false);
  const [selectedSubRegion, setSelectedSubRegion] = useState<string | null>(null);
  const [mobSearchText, setMobSearchText] = useState("");
  const [mobWzData, setMobWzData] = useState<Record<string, MobWzEntry> | null>(null);

  // WZ 데이터 동적 로드
  useEffect(() => {
    loadMobWzData().then(setMobWzData);
  }, []);

  // DamageReceivedTable의 handleMobSelect 로직 복사
  const handleMobSelect = useCallback(async (mob: MobListEntry | null, jobEngName?: string) => {
    setSelectedMob(mob);
    setMobIcon(null);
    if (!mob) return;

    if (jobEngName) saveSelectedMobId(jobEngName, mob.id);

    // WZ 데이터 동적 로드 후 우선 사용 (ATT/MATT/ACC), 없으면 API 폴백
    const wzData = await loadMobWzData();
    const wzEntry = wzData[String(mob.id)];
    if (wzEntry) {
      if (wzEntry.PADamage !== undefined) setMonsterATT(wzEntry.PADamage);
      if (wzEntry.MADamage !== undefined) setMonsterMATT(wzEntry.MADamage);
      if (wzEntry.acc !== undefined) setMonsterACC(wzEntry.acc);
      setMonsterLevel(mob.level);
    }

    // HP/PDD/MDD/EVA는 WZ에 없으므로 항상 API에서 fetch
    const details = await fetchMobDetails(mob.id);
    if (details) {
      if (!wzEntry) {
        setMonsterATT(details.meta.physicalDamage);
        setMonsterMATT(details.meta.magicDamage);
        setMonsterACC(details.meta.accuracy);
        setMonsterLevel(details.meta.level);
      }
      setMonsterHP(details.meta.maxHP);
      setMonsterPDD(details.meta.physicalDefense);
      setMonsterMDD(details.meta.magicDefense);
      setMonsterEVA(details.meta.evasion);
    }

    const iconUrl = await fetchMobIcon(mob.id);
    if (iconUrl) setMobIcon(iconUrl);
  }, []);

  // 직업 변경 시 저장된 몬스터 자동 로드는 헤더에서 처리

  const contextValue: MonsterContextType = {
    selectedMob,
    mobIcon,
    monsterATT,
    monsterMATT,
    monsterACC,
    monsterLevel,
    monsterHP,
    monsterPDD,
    monsterMDD,
    monsterEVA,
    powerUpEnabled,
    magicUpEnabled,
    mobModalOpen,
    selectedSubRegion,
    mobSearchText,
    mobWzData,
    setSelectedMob,
    handleMobSelect,
    setPowerUpEnabled,
    setMagicUpEnabled,
    setMobModalOpen,
    setSelectedSubRegion,
    setMobSearchText,
    setMonsterATT,
    setMonsterMATT,
    setMonsterACC,
    setMonsterLevel,
    setMonsterHP,
    setMonsterPDD,
    setMonsterMDD,
    setMonsterEVA,
  };

  return (
    <MonsterContext.Provider value={contextValue}>
      {children}
    </MonsterContext.Provider>
  );
}

export function useMonster() {
  const context = useContext(MonsterContext);
  if (!context) throw new Error("useMonster must be used within MonsterProvider");
  return context;
}
