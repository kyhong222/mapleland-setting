export interface Job {
  koreanName: string;
  engName: string;
  mainStat: "str" | "dex" | "int" | "luk";
  subStat: "str" | "dex" | "int" | "luk";
}

// 직업별 테마 컬러
export const JOB_COLORS: Record<string, string> = {
  warrior: "#d32f2f",   // 레드
  archer: "#2e7d32",    // 그린
  magician: "#1565c0",  // 블루
  thief: "#212121",     // 블랙
  pirate: "#7b1fa2",    // 퍼플
};

export const JOBS: Job[] = [
  { koreanName: "전사", engName: "warrior", mainStat: "str", subStat: "dex" },
  { koreanName: "궁수", engName: "archer", mainStat: "dex", subStat: "str" },
  { koreanName: "마법사", engName: "magician", mainStat: "int", subStat: "luk" },
  { koreanName: "도적", engName: "thief", mainStat: "luk", subStat: "dex" },
  // { koreanName: "해적", engName: "pirate", mainStat: "str", subStat: "dex" }, // 무기에 따라 동적 결정: 너클=STR/DEX, 건=DEX/STR
];
