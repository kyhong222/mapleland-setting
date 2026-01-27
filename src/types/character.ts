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
  mad: number; // 마력 (필수 속성으로 변경)
  pdef: number; // 물리방어력
  mdef: number; // 마법방어력
  acc: number; // 명중률
  eva: number; // 회피율
  macc: number; // 마법명중률
  speed: number; // 이동속도
  jump: number; // 점프력
  hp: number; // 추가 HP
  mp: number; // 추가 MP
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
  totalMAD: number; // 총 마력 (장비 MAD + Int스탯 기반 마력 + 버프 마력)

  // 주스탯 / 부스탯
  mainStat: number;
  subStat: number;

  // 장비 스탯 (합산만)
  acc: number; // 명중률
  eva: number; // 회피율
  pdef: number; // 물리방어력
  mdef: number; // 마법방어력
  speed: number; // 이동속도
  jump: number; // 점프력
  hp: number; // 추가 HP
  mp: number; // 추가 MP

  // 마법명중률 (마법사 전용, 계산식: int(총INT/10 + 총LUK/10))
  magicAccuracy: number;
}
