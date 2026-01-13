export interface Job {
  koreanName: string;
  engName: string;
  mainStat: "str" | "dex" | "int" | "luk";
  subStat: "str" | "dex" | "int" | "luk";
}

export const JOBS: Job[] = [
  { koreanName: "전사", engName: "warrior", mainStat: "str", subStat: "dex" },
  { koreanName: "궁수", engName: "archer", mainStat: "dex", subStat: "str" },
  { koreanName: "마법사", engName: "magician", mainStat: "int", subStat: "luk" },
  { koreanName: "도적", engName: "thief", mainStat: "luk", subStat: "dex" },
];
