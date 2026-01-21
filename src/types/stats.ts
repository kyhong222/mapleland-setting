export interface Stats {
  // 순수 스탯 (사용자 입력)
  pureStr: number;
  pureDex: number;
  pureInt: number;
  pureLuk: number;

  // 장비로 얻은 스탯
  equipStr: number;
  equipDex: number;
  equipInt: number;
  equipLuk: number;
  equipAttack: number;
  equipMAD: number; // 장비로부터의 마력

  // 버프로 얻은 스탯
  buffStr: number;
  buffDex: number;
  buffInt: number;
  buffLuk: number;
  buffAttack: number;
  buffMAD: number; // 버프로부터의 마력

  // 캐릭터 레벨
  level: number;
}

export const DEFAULT_STATS: Stats = {
  pureStr: 0,
  pureDex: 0,
  pureInt: 0,
  pureLuk: 0,
  equipStr: 0,
  equipDex: 0,
  equipInt: 0,
  equipLuk: 0,
  equipAttack: 0,
  equipMAD: 0,
  buffStr: 0,
  buffDex: 0,
  buffInt: 0,
  buffLuk: 0,
  buffAttack: 0,
  buffMAD: 0,
  level: 1,
};
