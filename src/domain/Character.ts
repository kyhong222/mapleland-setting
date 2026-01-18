import type { Equipment, EquipmentSlot } from "../types/equipment";
import type { Item, ItemType } from "../types/item";
import type { Job } from "../types/job";
import type { Stats } from "../types/stats";
import type { Buff, StatsSummary, FinalStats } from "../types/character";

/**
 * Character 도메인 객체
 * 캐릭터의 모든 상태를 관리하는 단일 진실 공급원
 */
export class Character {
  // 기본 정보
  private stats: Stats;
  private job: Job | null;

  // 장비
  private equipments: Map<EquipmentSlot, Equipment>;

  // 버프
  private buffs: Map<string, Buff>;

  // 인벤토리
  private inventory: Item[];
  private savedItems: Item[];

  constructor() {
    this.stats = {
      level: 1,
      pureStr: 4,
      pureDex: 4,
      pureInt: 4,
      pureLuk: 4,
      equipStr: 0,
      equipDex: 0,
      equipInt: 0,
      equipLuk: 0,
      equipAttack: 0,
      buffStr: 0,
      buffDex: 0,
      buffInt: 0,
      buffLuk: 0,
      buffAttack: 0,
    };

    this.job = null;
    this.equipments = new Map();
    this.buffs = new Map();
    this.inventory = [];
    this.savedItems = [];
  }

  // ============================================================
  // Stats 관련 메서드
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
  // Equipments 관련 메서드
  // ============================================================

  getEquipments(): Map<EquipmentSlot, Equipment> {
    return new Map(this.equipments);
  }

  getEquippedItem(slot: EquipmentSlot): Equipment | null {
    return this.equipments.get(slot) || null;
  }

  /**
   * 장비 장착
   * @returns 장착 성공 여부
   */
  equip(item: Item): boolean {
    // 전신 아이템은 상의 슬롯에 장착
    const targetSlot = item.slot === "전신" ? "상의" : item.slot;

    // 전신 장착 시 하의가 있으면 실패
    if (item.slot === "전신") {
      if (this.equipments.has("하의")) {
        return false;
      }
    }

    // 하의 장착 시 상의(전신 포함)가 있으면 실패
    if (item.slot === "하의") {
      if (this.equipments.has("상의")) {
        return false;
      }
    }

    // 장비 아이템으로 변환
    const equipment: Equipment = {
      slot: targetSlot,
      name: item.name,
      type: item.type,
      attack: item.stats.attack,
      str: item.stats.str,
      dex: item.stats.dex,
      int: item.stats.int,
      luk: item.stats.luk,
    };

    this.equipments.set(targetSlot, equipment);
    return true;
  }

  /**
   * 장비 해제
   */
  unequip(slot: EquipmentSlot): void {
    this.equipments.delete(slot);
  }

  /**
   * 장비로부터 얻은 스탯 합계
   */
  getEquipmentStats(): StatsSummary {
    const stats: StatsSummary = {
      attack: 0,
      str: 0,
      dex: 0,
      int: 0,
      luk: 0,
    };

    for (const item of this.equipments.values()) {
      stats.attack += item.attack || 0;
      stats.str += item.str || 0;
      stats.dex += item.dex || 0;
      stats.int += item.int || 0;
      stats.luk += item.luk || 0;
    }

    return stats;
  }

  /**
   * 장착한 무기 타입
   */
  getWeaponType(): ItemType | null {
    const weapon = this.equipments.get("무기");
    return weapon?.type as ItemType || null;
  }

  // ============================================================
  // Buffs 관련 메서드
  // ============================================================

  getBuffs(): Map<string, Buff> {
    return new Map(this.buffs);
  }

  getBuff(id: string): Buff | null {
    return this.buffs.get(id) || null;
  }

  /**
   * 버프 활성화/비활성화
   */
  setBuffEnabled(id: string, enabled: boolean): void {
    const buff = this.buffs.get(id);
    if (buff) {
      buff.enabled = enabled;
    }
  }

  /**
   * 버프 레벨 설정
   */
  setBuffLevel(id: string, level: number): void {
    const buff = this.buffs.get(id);
    if (buff) {
      buff.level = Math.max(0, level);
    }
  }

  /**
   * 버프 추가
   */
  addBuff(buff: Buff): void {
    this.buffs.set(buff.id, { ...buff });
  }

  /**
   * 버프로부터 얻은 스탯 합계
   * TODO: 실제 버프 계산 로직 구현 필요
   */
  getBuffStats(): StatsSummary {
    // 현재는 외부에서 주입받은 값 사용
    // 추후 버프 데이터 파일과 연동하여 계산
    return {
      attack: 0,
      str: 0,
      dex: 0,
      int: 0,
      luk: 0,
    };
  }

  // ============================================================
  // Inventory 관련 메서드
  // ============================================================

  getInventory(): Item[] {
    return [...this.inventory];
  }

  getSavedItems(): Item[] {
    return [...this.savedItems];
  }

  addToInventory(item: Item): void {
    this.inventory.push({ ...item });
  }

  removeFromInventory(index: number): void {
    this.inventory.splice(index, 1);
  }

  saveItem(item: Item): void {
    this.savedItems.push({ ...item });
  }

  // ============================================================
  // 파생 데이터 계산
  // ============================================================

  /**
   * 메이플용사 보너스 계산
   */
  private getMapleWarriorBonus(): number {
    const mapleWarrior = this.buffs.get("mapleWarrior");
    if (!mapleWarrior || !mapleWarrior.enabled) {
      return 0;
    }

    // TODO: 실제 메이플용사 데이터 파일 참조
    // 현재는 레벨당 1%로 가정
    return mapleWarrior.level / 100;
  }

  /**
   * 최종 스탯 계산 (순수 + 장비 + 버프 + 메이플용사)
   */
  getFinalStats(): FinalStats {
    const equipStats = this.getEquipmentStats();
    const buffStats = this.getBuffStats();
    const mapleWarriorBonus = this.getMapleWarriorBonus();

    // 메이플용사는 순수 스탯에만 적용
    const mapleWarriorStr = Math.floor(this.stats.pureStr * mapleWarriorBonus);
    const mapleWarriorDex = Math.floor(this.stats.pureDex * mapleWarriorBonus);
    const mapleWarriorInt = Math.floor(this.stats.pureInt * mapleWarriorBonus);
    const mapleWarriorLuk = Math.floor(this.stats.pureLuk * mapleWarriorBonus);

    const totalStr = this.stats.pureStr + equipStats.str + buffStats.str + mapleWarriorStr;
    const totalDex = this.stats.pureDex + equipStats.dex + buffStats.dex + mapleWarriorDex;
    const totalInt = this.stats.pureInt + equipStats.int + buffStats.int + mapleWarriorInt;
    const totalLuk = this.stats.pureLuk + equipStats.luk + buffStats.luk + mapleWarriorLuk;

    // 공격력 계산 (장비 + 버프)
    // TODO: 영웅의메아리 효과 적용
    const totalAttack = equipStats.attack + buffStats.attack;

    // 주스탯 / 부스탯 계산
    let mainStat = 0;
    let subStat = 0;

    if (this.stats.job) {
      const mainStatKey = this.stats.job.mainStat;
      const subStatKey = this.stats.job.subStat;

      const statMap = {
        str: totalStr,
        dex: totalDex,
        int: totalInt,
        luk: totalLuk,
      };

      mainStat = statMap[mainStatKey];
      subStat = statMap[subStatKey];
    }

    return {
      totalStr,
      totalDex,
      totalInt,
      totalLuk,
      totalAttack,
      mainStat,
      subStat,
    };
  }

  /**
   * 전체 상태를 JSON으로 직렬화
   */
  toJSON() {
    return {
      stats: this.stats,
      equipments: Array.from(this.equipments.entries()),
      buffs: Array.from(this.buffs.entries()),
      inventory: this.inventory,
      savedItems: this.savedItems,
    };
  }

  /**
   * JSON에서 상태 복원
   */
  fromJSON(data: ReturnType<Character["toJSON"]>) {
    this.stats = data.stats;
    this.equipments = new Map(data.equipments);
    this.buffs = new Map(data.buffs);
    this.inventory = data.inventory;
    this.savedItems = data.savedItems;
  }
}
