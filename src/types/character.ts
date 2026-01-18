/**
 * 버프 정보
 */
export interface Buff {
  id: string;
  name: string;
  level: number;
  enabled: boolean;
}

/**
 * 장비/버프 스탯 합계
 */
export interface StatsSummary {
  attack: number;
  str: number;
  dex: number;
  int: number;
  luk: number;
}

/**
 * 최종 스탯 (계산된 값)
 */
export interface FinalStats {
  // 총합 스탯 (순수 + 장비 + 버프 + 메이플용사)
  totalStr: number;
  totalDex: number;
  totalInt: number;
  totalLuk: number;
  totalAttack: number;

  // 주스탯 / 부스탯
  mainStat: number;
  subStat: number;
}
