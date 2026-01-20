import type { Equipment } from "../types/equipment";

export interface SavedCharacterData {
  id: string;
  timestamp: number;
  jobEngName: string;
  level: number;
  pureStr: number;
  pureDex: number;
  pureInt: number;
  pureLuk: number;
  equipments: Equipment[];
  weaponId?: number; // 무기 아이콘용
  // 버프 정보
  buffs?: {
    mapleWarriorLevel: number;
    buff1Attack: number;
    buff2Attack: number;
    heroEchoEnabled: boolean;
    mastery1: number;
    mastery2: number;
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

const STORAGE_KEY_PREFIX = "mapleland_character_";

/**
 * 직업별 저장된 캐릭터 목록 조회
 */
export function getSavedCharacters(jobEngName: string): SavedCharacterData[] {
  const key = STORAGE_KEY_PREFIX + jobEngName;
  const data = localStorage.getItem(key);
  if (!data) return [];

  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

/**
 * 캐릭터 세팅 저장
 */
export function saveCharacter(data: Omit<SavedCharacterData, "id" | "timestamp">): SavedCharacterData {
  const key = STORAGE_KEY_PREFIX + data.jobEngName;
  const existing = getSavedCharacters(data.jobEngName);

  const newSave: SavedCharacterData = {
    ...data,
    id: `${data.jobEngName}_${Date.now()}`,
    timestamp: Date.now(),
  };

  const updated = [...existing, newSave];
  localStorage.setItem(key, JSON.stringify(updated));

  return newSave;
}

/**
 * 저장된 캐릭터 삭제
 */
export function deleteSavedCharacter(jobEngName: string, id: string): void {
  const key = STORAGE_KEY_PREFIX + jobEngName;
  const existing = getSavedCharacters(jobEngName);
  const filtered = existing.filter((save) => save.id !== id);

  if (filtered.length > 0) {
    localStorage.setItem(key, JSON.stringify(filtered));
  } else {
    localStorage.removeItem(key);
  }
}

/**
 * 전체 저장 목록 조회 (모든 직업)
 */
export function getAllSavedCharacters(): Record<string, SavedCharacterData[]> {
  const result: Record<string, SavedCharacterData[]> = {};

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
      const jobEngName = key.replace(STORAGE_KEY_PREFIX, "");
      result[jobEngName] = getSavedCharacters(jobEngName);
    }
  }

  return result;
}
