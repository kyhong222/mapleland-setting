import type { SavedEquipment } from "../types/equipment";

export interface SavedCharacterData {
  timestamp: number;
  level: number;
  pureStr: number;
  pureDex: number;
  pureInt: number;
  pureLuk: number;
  equipments: SavedEquipment[];
  weaponId?: number; // 무기 아이콘용
  // 버프 정보
  buffs?: {
    mapleWarriorLevel: number;
    buff1Attack: number;
    buff2Attack: number;
    heroEchoEnabled: boolean;
    mastery1: number;
    mastery2: number;
    buffMAD?: number; // 버프로부터의 마력
    // buff1 선택 정보
    buff1Label?: string;
    buff1Icon?: string | null;
    buff1IsManual?: boolean;
    // buff2 선택 정보
    buff2Label?: string;
    buff2Icon?: string | null;
    buff2IsManual?: boolean;
  };
}

export interface LastActive {
  jobEngName: string;
  slotIdx: number; // 0-4
}

const SLOT_KEY_PREFIX = "mapleland_slot_";
const LAST_ACTIVE_KEY = "mapleland_last_active";
const MIGRATION_KEY = "mapleland_storage_migrated";
const LEGACY_KEY_PREFIX = "mapleland_character_";
export const MAX_SLOTS = 5;

/**
 * 특정 슬롯의 저장 데이터 조회
 */
export function getSlotData(jobEngName: string, slotIdx: number): SavedCharacterData | null {
  const key = `${SLOT_KEY_PREFIX}${jobEngName}_${slotIdx}`;
  const data = localStorage.getItem(key);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/**
 * 특정 슬롯에 캐릭터 데이터 저장
 */
export function saveSlotData(
  jobEngName: string,
  slotIdx: number,
  data: Omit<SavedCharacterData, "timestamp">
): SavedCharacterData {
  const key = `${SLOT_KEY_PREFIX}${jobEngName}_${slotIdx}`;

  const newSave: SavedCharacterData = {
    ...data,
    timestamp: Date.now(),
  };

  localStorage.setItem(key, JSON.stringify(newSave));
  setLastActive(jobEngName, slotIdx);

  return newSave;
}

/**
 * 특정 슬롯 데이터 삭제
 */
export function deleteSlotData(jobEngName: string, slotIdx: number): void {
  const key = `${SLOT_KEY_PREFIX}${jobEngName}_${slotIdx}`;
  localStorage.removeItem(key);
}

/**
 * 직업별 5개 슬롯 요약 조회
 */
export function getSlotSummaries(jobEngName: string): (SavedCharacterData | null)[] {
  const summaries: (SavedCharacterData | null)[] = [];
  for (let i = 0; i < MAX_SLOTS; i++) {
    summaries.push(getSlotData(jobEngName, i));
  }
  return summaries;
}

/**
 * 마지막 활성 직업-슬롯 쌍 조회
 */
export function getLastActive(): LastActive | null {
  const data = localStorage.getItem(LAST_ACTIVE_KEY);
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

/**
 * 마지막 활성 직업-슬롯 쌍 저장
 */
export function setLastActive(jobEngName: string, slotIdx: number): void {
  localStorage.setItem(LAST_ACTIVE_KEY, JSON.stringify({ jobEngName, slotIdx }));
}

/**
 * 기존 append 기반 저장 데이터를 슬롯 기반으로 마이그레이션
 */
export function migrateFromLegacyStorage(): void {
  if (localStorage.getItem(MIGRATION_KEY)) return;

  let firstJob: string | null = null;

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(LEGACY_KEY_PREFIX)) {
      const jobEngName = key.replace(LEGACY_KEY_PREFIX, "");
      if (!firstJob) firstJob = jobEngName;

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const arr: any[] = JSON.parse(localStorage.getItem(key) || "[]");
        const toMigrate = arr.slice(0, MAX_SLOTS);
        toMigrate.forEach((save, idx) => {
          const { id: _id, jobEngName: _job, ...rest } = save;
          const slotKey = `${SLOT_KEY_PREFIX}${jobEngName}_${idx}`;
          localStorage.setItem(slotKey, JSON.stringify(rest));
        });
      } catch {
        // 파싱 실패 시 무시
      }

      localStorage.removeItem(key);
    }
  }

  if (firstJob) {
    setLastActive(firstJob, 0);
  }

  localStorage.setItem(MIGRATION_KEY, "true");
}
