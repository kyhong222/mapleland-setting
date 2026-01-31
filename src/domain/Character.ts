import type { Equipment, EquipmentSlot } from "../types/equipment";
import type { Item, ItemType } from "../types/item";
import type { Job } from "../types/job";
import type { Stats } from "../types/stats";
import type { Buff, StatsSummary, FinalStats } from "../types/character";
import mapleWarriorData from "../data/buff/MapleWarrior/MapleWarrior.json";

/**
 * Character 도메인 객체
 * 캐릭터의 모든 상태를 관리하는 단일 진실 공급원 (Single Source of Truth)
 */
export class Character {
  // 기본 스탯
  private stats: Stats;
  private job: Job | null;

  // 장비
  private equipments: Map<EquipmentSlot, Equipment>;

  // 버프
  private buffs: Map<string, Buff>;

  constructor() {
    this.stats = {
      level: 10,
      pureStr: 4,
      pureDex: 4,
      pureInt: 4,
      pureLuk: 4,
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
    };

    this.job = null;
    this.equipments = new Map();
    this.buffs = new Map();

    // 기본 버프 초기화
    this.buffs.set("mapleWarrior", {
      id: "mapleWarrior",
      name: "메이플 용사",
      level: 0,
      enabled: false,
    });
    this.buffs.set("buff1", {
      id: "buff1",
      name: "버프1",
      level: 0,
      enabled: false,
    });
    this.buffs.set("buff2", {
      id: "buff2",
      name: "버프2",
      level: 0,
      enabled: false,
    });
    this.buffs.set("heroEcho", {
      id: "heroEcho",
      name: "영웅의 메아리",
      level: 1,
      enabled: false,
    });
  }

  // ============================================================
  // Stats
  // ============================================================

  getStats(): Stats {
    return { ...this.stats };
  }

  getJob(): Job | null {
    return this.job;
  }

  setLevel(level: number): void {
    this.stats.level = Math.max(1, level);
  }

  setJob(job: Job | null): void {
    this.job = job;
  }

  setPureStat(stat: "str" | "dex" | "int" | "luk", value: number): void {
    const key = `pure${stat.charAt(0).toUpperCase() + stat.slice(1)}` as keyof Stats;
    (this.stats[key] as number) = Math.max(4, value);
  }

  // ============================================================
  // Equipments
  // ============================================================

  getEquipments(): Equipment[] {
    return Array.from(this.equipments.values());
  }

  getEquippedItem(slot: EquipmentSlot): Equipment | null {
    return this.equipments.get(slot) || null;
  }

  equip(item: Item): boolean {
    const targetSlot = item.slot === "전신" ? "상의" : item.slot;

    // 전신 장착 시 하의가 있으면 자동 해제
    if (item.slot === "전신" && this.equipments.has("하의")) {
      this.equipments.delete("하의");
    }

    // 하의 장착 시 상의가 있으면 실패 (상의에 전신이 들어있을 수 있으므로)
    if (item.slot === "하의" && this.equipments.has("상의")) {
      return false;
    }

    const equipment: Equipment = {
      id: item.id,
      slot: targetSlot,
      name: item.name,
      type: item.type,
      icon: item.icon,
      attack: item.stats.attack,
      str: item.stats.str,
      dex: item.stats.dex,
      int: item.stats.int,
      luk: item.stats.luk,
      mad: item.stats.mad,
      pdef: item.stats.pdef,
      mdef: item.stats.mdef,
      acc: item.stats.acc,
      eva: item.stats.eva,
      macc: item.stats.macc,
      speed: item.stats.speed,
      jump: item.stats.jump,
      hp: item.stats.hp,
      mp: item.stats.mp,
      attackSpeed: item.stats.attackSpeed,
    };

    this.equipments.set(targetSlot, equipment);
    return true;
  }

  unequip(slot: EquipmentSlot): void {
    this.equipments.delete(slot);
  }

  getEquipmentStats(): StatsSummary {
    const summary: StatsSummary = {
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
      macc: 0,
      speed: 0,
      jump: 0,
      hp: 0,
      mp: 0,
    };

    for (const item of this.equipments.values()) {
      summary.attack += item.attack || 0;
      summary.str += item.str || 0;
      summary.dex += item.dex || 0;
      summary.int += item.int || 0;
      summary.luk += item.luk || 0;
      summary.mad += item.mad ?? 0;
      summary.pdef += item.pdef ?? 0;
      summary.mdef += item.mdef ?? 0;
      summary.acc += item.acc ?? 0;
      summary.eva += item.eva ?? 0;
      summary.macc += item.macc ?? 0;
      summary.speed += item.speed ?? 0;
      summary.jump += item.jump ?? 0;
      summary.hp += item.hp ?? 0;
      summary.mp += item.mp ?? 0;
    }

    return summary;
  }

  getWeaponType(): ItemType | null {
    const weapon = this.equipments.get("무기");
    return (weapon?.type as ItemType) || null;
  }

  // ============================================================
  // Buffs
  // ============================================================

  getBuffs(): Buff[] {
    return Array.from(this.buffs.values());
  }

  getBuff(id: string): Buff | null {
    return this.buffs.get(id) || null;
  }

  setBuffEnabled(id: string, enabled: boolean): void {
    const buff = this.buffs.get(id);
    if (buff) {
      buff.enabled = enabled;
    }
  }

  setBuffLevel(id: string, level: number): void {
    const buff = this.buffs.get(id);
    if (buff) {
      buff.level = Math.max(0, level);
    }
  }

  getBuffStats(buff1Attack: number, buff2Attack: number, masteryAttack: number): StatsSummary {
    const heroEcho = this.buffs.get("heroEcho");
    const heroEchoMultiplier = heroEcho?.enabled ? 1.04 : 1;

    const equipStats = this.getEquipmentStats();
    const totalBuffAttack = buff1Attack + buff2Attack + masteryAttack;
    const totalAttackBeforeEcho = equipStats.attack + totalBuffAttack;
    const finalAttack = Math.floor(totalAttackBeforeEcho * heroEchoMultiplier);

    return {
      attack: finalAttack - equipStats.attack,
      str: 0,
      dex: 0,
      int: 0,
      luk: 0,
      mad: 0,
      pdef: 0,
      mdef: 0,
      acc: 0,
      eva: 0,
      macc: 0,
      speed: 0,
      jump: 0,
      hp: 0,
      mp: 0,
    };
  }

  // ============================================================
  // 파생 데이터 계산
  // ============================================================

  private getMapleWarriorBonus(): number {
    const mapleWarrior = this.buffs.get("mapleWarrior");
    if (!mapleWarrior || !mapleWarrior.enabled || mapleWarrior.level === 0) {
      return 0;
    }

    // 메이플용사 JSON 데이터에서 x 값 가져오기
    const mapleWarriorTable = (mapleWarriorData as any).table;
    const entry = mapleWarriorTable.find((e: any) => e.level === mapleWarrior.level);
    const xValue = entry?.x ?? 0;

    return xValue / 100;
  }

  /**
   * 마법사 여부 확인
   */
  isMagician(): boolean {
    return this.job?.engName === "magician";
  }

  getFinalStats(buff1Value: number, buff2Value: number, masteryAttack: number): FinalStats {
    const equipStats = this.getEquipmentStats();
    const mapleWarriorBonus = this.getMapleWarriorBonus();
    const heroEcho = this.buffs.get("heroEcho");
    const heroEchoMultiplier = heroEcho?.enabled ? 1.04 : 1;

    // 주스탯 자동 계산 (StatTable과 동일한 로직)
    let pureStr = this.stats.pureStr;
    let pureDex = this.stats.pureDex;
    let pureInt = this.stats.pureInt;
    let pureLuk = this.stats.pureLuk;

    if (this.job) {
      const totalAP = 20 + this.stats.level * 5 + (this.stats.level >= 70 ? 5 : 0) + (this.stats.level >= 120 ? 5 : 0);

      // 해적은 무기에 따라 주스탯이 다름
      let mainStatKey = this.job.mainStat;
      if (this.job.engName === "pirate") {
        const weaponType = this.getWeaponType();
        mainStatKey = weaponType === "건" ? "dex" : "str";
      }

      // 주스탯이 아닌 스탯들의 합계
      const otherStatsSum =
        (mainStatKey !== "str" ? this.stats.pureStr : 0) +
        (mainStatKey !== "dex" ? this.stats.pureDex : 0) +
        (mainStatKey !== "int" ? this.stats.pureInt : 0) +
        (mainStatKey !== "luk" ? this.stats.pureLuk : 0);

      // 주스탯 = 전체 AP - 다른 스탯들의 합
      const mainStatValue = totalAP - otherStatsSum;

      if (mainStatKey === "str") pureStr = mainStatValue;
      else if (mainStatKey === "dex") pureDex = mainStatValue;
      else if (mainStatKey === "int") pureInt = mainStatValue;
      else if (mainStatKey === "luk") pureLuk = mainStatValue;
    }

    // 메이플 용사 버프 스탯 (순스탯의 n%)
    const mapleWarriorStr = Math.floor(pureStr * mapleWarriorBonus);
    const mapleWarriorDex = Math.floor(pureDex * mapleWarriorBonus);
    const mapleWarriorInt = Math.floor(pureInt * mapleWarriorBonus);
    const mapleWarriorLuk = Math.floor(pureLuk * mapleWarriorBonus);

    // 총 어빌리티 = 순수 + 장비 + 메이플용사
    const totalStr = pureStr + equipStats.str + mapleWarriorStr;
    const totalDex = pureDex + equipStats.dex + mapleWarriorDex;
    const totalInt = pureInt + equipStats.int + mapleWarriorInt;
    const totalLuk = pureLuk + equipStats.luk + mapleWarriorLuk;

    // 버프1, 버프2는 마법사면 마력으로, 그 외엔 공격력으로
    const isMage = this.isMagician();
    const buffAttack = isMage ? 0 : buff1Value + buff2Value + masteryAttack;
    const buffMAD = isMage ? buff1Value + buff2Value : 0;

    // 총 공격력 = int((장비공격력 + 버프1 + 버프2) * 영메배율)
    const totalAttack = Math.floor((equipStats.attack + buffAttack) * heroEchoMultiplier);

    // 총 마력 = int((장비마력 + 버프1 + 버프2 + 인트마력) * 영메배율)
    // 인트마력 = 총INT (1:1)
    const totalMAD = Math.floor((equipStats.mad + buffMAD + totalInt) * heroEchoMultiplier);

    // 주스탯 / 부스탯 결정
    let mainStat = 0;
    let subStat = 0;

    if (this.job) {
      const statMap = { str: totalStr, dex: totalDex, int: totalInt, luk: totalLuk };

      if (this.job.engName === "pirate") {
        const weaponType = this.getWeaponType();
        if (weaponType === "건") {
          mainStat = statMap["dex"];
          subStat = statMap["str"];
        } else {
          mainStat = statMap["str"];
          subStat = statMap["dex"];
        }
      } else {
        mainStat = statMap[this.job.mainStat];
        subStat = statMap[this.job.subStat];
      }
    }

    // 마법명중률 = int(총INT/10 + 총LUK/10) (마법사 전용)
    const magicAccuracy = isMage ? Math.floor(totalInt / 10) + Math.floor(totalLuk / 10) : 0;

    return {
      totalStr,
      totalDex,
      totalInt,
      totalLuk,
      totalAttack,
      totalMAD,
      mainStat,
      subStat,
      // 장비 스탯 (합산만)
      acc: equipStats.acc,
      eva: equipStats.eva,
      pdef: equipStats.pdef,
      mdef: equipStats.mdef,
      speed: equipStats.speed,
      jump: equipStats.jump,
      hp: equipStats.hp,
      mp: equipStats.mp,
      // 마법명중률
      magicAccuracy,
    };
  }
}
