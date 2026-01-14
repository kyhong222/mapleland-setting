import { useState, useMemo } from "react";
import { Box } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import TopAppBar from "./components/TopAppBar";
import EquipTable from "./components/EquipTable";
import StatTable from "./components/StatTable";
import BuffTable from "./components/BuffTable";
import DamageTable from "./components/DamageTable";
import ItemMaker from "./components/ItemMaker";
import type { Equipment } from "./types/equipment";
import type { Item, ItemType } from "./types/item";
import type { Stats } from "./types/stats";
import { JOBS } from "./types/job";
import mapleWarriorData from "./data/buff/MapleWarrior/MapleWarrior.json";
import "./App.css";

function App() {
  const [selectedJob, setSelectedJob] = useState("");
  const [mapleWarriorLevel, setMapleWarriorLevel] = useState(0);
  const [buff1Attack, setBuff1Attack] = useState(0);
  const [buff2Attack, setBuff2Attack] = useState(0);
  const [heroEchoEnabled, setHeroEchoEnabled] = useState(false);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [stats, setStats] = useState<Stats>({
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
  });
  const [selectedSlotForItemMaker, setSelectedSlotForItemMaker] = useState<string>();

  // 장비로부터 얻은 스탯 계산 (useMemo 사용)
  const equipStats = useMemo(() => {
    return equipments.reduce(
      (acc, eq) => ({
        equipAttack: acc.equipAttack + (eq.attack || 0),
        equipStr: acc.equipStr + (eq.str || 0),
        equipDex: acc.equipDex + (eq.dex || 0),
        equipInt: acc.equipInt + (eq.int || 0),
        equipLuk: acc.equipLuk + (eq.luk || 0),
      }),
      { equipAttack: 0, equipStr: 0, equipDex: 0, equipInt: 0, equipLuk: 0 }
    );
  }, [equipments]);

  // 장비 스탯과 통합된 최종 스탯
  const finalStats = useMemo(
    () => ({
      ...stats,
      equipAttack: equipStats.equipAttack,
      equipStr: equipStats.equipStr,
      equipDex: equipStats.equipDex,
      equipInt: equipStats.equipInt,
      equipLuk: equipStats.equipLuk,
    }),
    [stats, equipStats]
  );

  const handleJobChange = (event: SelectChangeEvent) => {
    setSelectedJob(event.target.value);
  };

  // 현재 직업 정보
  const currentJob = JOBS.find((job) => job.engName === selectedJob);

  // 메이플용사 보너스 계산
  const mapleWarriorBonus = useMemo(() => {
    const effect = mapleWarriorData.table.find(
      (item: { level: number; x: number }) => item.level === mapleWarriorLevel
    );
    return effect ? effect.x / 100 : 0;
  }, [mapleWarriorLevel]);

  // 총 주스탯 계산
  const mainStat = useMemo(() => {
    if (!currentJob) return 0;
    const mainStatKey = currentJob.mainStat as "str" | "dex" | "int" | "luk";
    const pureStatKey = `pure${mainStatKey.charAt(0).toUpperCase() + mainStatKey.slice(1)}` as keyof Stats;
    const equipStatKey = `equip${mainStatKey.charAt(0).toUpperCase() + mainStatKey.slice(1)}` as keyof Stats;
    const buffStatKey = `buff${mainStatKey.charAt(0).toUpperCase() + mainStatKey.slice(1)}` as keyof Stats;

    const pureStat = (finalStats[pureStatKey] as number) || 0;
    const equipStat = (finalStats[equipStatKey] as number) || 0;
    const buffStat = (finalStats[buffStatKey] as number) || 0;
    const mapleWarriorStat = Math.floor(pureStat * mapleWarriorBonus);

    return pureStat + equipStat + buffStat + mapleWarriorStat;
  }, [currentJob, finalStats, mapleWarriorBonus]);

  // 총 부스탯 계산 (직업별로 정해진 부스탯만 적용)
  const subStat = useMemo(() => {
    if (!currentJob) return 0;

    const subStatKey = currentJob.subStat as "str" | "dex" | "int" | "luk";
    const pureStatKey = `pure${subStatKey.charAt(0).toUpperCase() + subStatKey.slice(1)}` as keyof Stats;
    const equipStatKey = `equip${subStatKey.charAt(0).toUpperCase() + subStatKey.slice(1)}` as keyof Stats;
    const buffStatKey = `buff${subStatKey.charAt(0).toUpperCase() + subStatKey.slice(1)}` as keyof Stats;

    const pureStat = (finalStats[pureStatKey] as number) || 0;
    const equipStat = (finalStats[equipStatKey] as number) || 0;
    const buffStat = (finalStats[buffStatKey] as number) || 0;
    const mapleWarriorStat = Math.floor(pureStat * mapleWarriorBonus);

    return pureStat + equipStat + buffStat + mapleWarriorStat;
  }, [currentJob, finalStats, mapleWarriorBonus]);

  // 장착한 무기 타입
  const weaponType = useMemo(() => {
    const weapon = equipments.find((eq) => eq.slot === "무기");
    return weapon?.type as ItemType | undefined;
  }, [equipments]);

  // 최종 공격력 계산 (장비 + 버프1 + 버프2) * 영웅의메아리
  const totalAttack = useMemo(() => {
    const totalBuffAttack = buff1Attack + buff2Attack;
    const heroEchoMultiplier = heroEchoEnabled ? 1.04 : 1;
    const totalAttackBeforeEcho = finalStats.equipAttack + totalBuffAttack;
    return Math.floor(totalAttackBeforeEcho * heroEchoMultiplier);
  }, [finalStats.equipAttack, buff1Attack, buff2Attack, heroEchoEnabled]);

  // 장착 핸들러: Item을 Equipment로 변환하여 장착
  const handleEquipItem = (item: Item) => {
    // 전신은 상의 슬롯에 장착
    const targetSlot = item.slot === "전신" ? "상의" : item.slot;

    const newEquipment: Equipment = {
      slot: targetSlot,
      name: item.name,
      type: item.type,
      attack: item.stats.attack,
      str: item.stats.str,
      dex: item.stats.dex,
      int: item.stats.int,
      luk: item.stats.luk,
    };

    setEquipments((prev) => {
      // 전신 장착 시 (slot이 "전신"인 경우)
      if (item.slot === "전신") {
        const hasBottom = prev.some((eq) => eq.slot === "하의");
        if (hasBottom) {
          return prev; // 하의가 있으면 전신 장착 불가
        }
        return [...prev.filter((eq) => eq.slot !== "상의" && eq.slot !== "하의"), newEquipment];
      }

      // 하의 장착 시 상의에 전신(slot="전신")이 있으면 장착 불가
      if (item.slot === "하의") {
        const hasOverall = prev.some((eq) => eq.slot === "상의");
        if (hasOverall) {
          return prev; // 상의에 뭔가 있으면(전신 포함) 하의 장착 불가
        }
      }

      // 기존 같은 슬롯 제거 후 새 장비 추가
      return [...prev.filter((eq) => eq.slot !== targetSlot), newEquipment];
    });
  };

  // 장착 해제 핸들러
  const handleUnequipItem = (slot: string) => {
    setEquipments((prev) => prev.filter((eq) => eq.slot !== slot));
  };

  // 빈 슬롯 클릭 핸들러
  const handleSlotClick = (slot: string) => {
    setSelectedSlotForItemMaker(slot);
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <TopAppBar selectedJob={selectedJob} onJobChange={handleJobChange} />

      <Box sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
        {/* TopBox */}
        <Box sx={{ display: "flex", gap: 3, justifyContent: "center", height: 500 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flex: "0 0 300px" }}>
            <EquipTable equipments={equipments} onUnequip={handleUnequipItem} onSlotClick={handleSlotClick} />
            <StatTable
              stats={finalStats}
              onStatsChange={setStats}
              selectedJob={selectedJob}
              mapleWarriorLevel={mapleWarriorLevel}
              buff1Attack={buff1Attack}
              buff2Attack={buff2Attack}
              heroEchoEnabled={heroEchoEnabled}
            />
          </Box>
          <BuffTable
            mapleWarriorLevel={mapleWarriorLevel}
            onMapleWarriorLevelChange={setMapleWarriorLevel}
            onBuff1AttackChange={setBuff1Attack}
            onBuff2AttackChange={setBuff2Attack}
            heroEchoEnabled={heroEchoEnabled}
            onHeroEchoChange={setHeroEchoEnabled}
          />
          <DamageTable statAttack={totalAttack} mainStat={mainStat} subStat={subStat} weaponType={weaponType} />
        </Box>

        {/* BottomBox */}
        <Box sx={{ mt: 3 }}>
          <ItemMaker onEquip={handleEquipItem} selectedJob={selectedJob} initialSlot={selectedSlotForItemMaker} />
        </Box>
      </Box>
    </Box>
  );
}

export default App;
