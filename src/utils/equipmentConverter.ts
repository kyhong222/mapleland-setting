import type { Equipment, SavedEquipment } from "../types/equipment";
import { loadPostItemData, getPostItemCategoryKey } from "./postItemLoader";

export function equipmentToSaved(eq: Equipment): SavedEquipment {
  return {
    id: eq.id!,
    slot: eq.slot,
    type: eq.type,
    attack: eq.attack,
    str: eq.str,
    dex: eq.dex,
    int: eq.int,
    luk: eq.luk,
    mad: eq.mad,
    pdef: eq.pdef,
    mdef: eq.mdef,
    acc: eq.acc,
    eva: eq.eva,
    speed: eq.speed,
    jump: eq.jump,
    hp: eq.hp,
    mp: eq.mp,
  };
}

export async function savedToEquipment(saved: SavedEquipment): Promise<Equipment> {
  const categoryKey = getPostItemCategoryKey(saved.slot, saved.type);
  const postItems = categoryKey ? await loadPostItemData(categoryKey) : {};
  const postItem = postItems[String(saved.id)];

  return {
    id: saved.id,
    slot: saved.slot,
    name: postItem?.koreanName ?? null,
    type: saved.type,
    icon: postItem?.icon,
    attack: saved.attack,
    str: saved.str,
    dex: saved.dex,
    int: saved.int,
    luk: saved.luk,
    mad: saved.mad,
    pdef: saved.pdef,
    mdef: saved.mdef,
    acc: saved.acc,
    eva: saved.eva,
    speed: saved.speed,
    jump: saved.jump,
    hp: saved.hp,
    mp: saved.mp,
    attackSpeed: postItem?.stats.attackSpeed,
    reqLevel: postItem?.requireStats.level,
    reqStr: postItem?.requireStats.str,
    reqDex: postItem?.requireStats.dex,
    reqInt: postItem?.requireStats.int,
    reqLuk: postItem?.requireStats.luk,
  };
}
