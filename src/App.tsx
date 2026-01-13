import { useState, useMemo, useEffect } from "react";
import { Box } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import TopAppBar from "./components/TopAppBar";
import EquipTable from "./components/EquipTable";
import StatTable from "./components/StatTable";
import BuffTable from "./components/BuffTable";
import DamageTable from "./components/DamageTable";
import ItemMaker from "./components/ItemMaker";
import type { Equipment } from "./types/equipment";
import type { Item } from "./types/item";
import type { Stats } from "./types/stats";
import "./App.css";

function App() {
  const [selectedJob, setSelectedJob] = useState("");
  const [mapleWarriorLevel, setMapleWarriorLevel] = useState(1);
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

  const handleJobChange = (event: SelectChangeEvent) => {
    setSelectedJob(event.target.value);
  };

  // 장착 핸들러: Item을 Equipment로 변환하여 장착
  const handleEquipItem = (item: Item) => {
    const newEquipment: Equipment = {
      slot: item.slot,
      name: item.name,
      attack: item.stats.attack,
      str: item.stats.str,
      dex: item.stats.dex,
      int: item.stats.int,
      luk: item.stats.luk,
    };

    // 기존 장비에서 같은 슬롯 제거 후 새 장비 추가
    setEquipments((prev) => [...prev.filter((eq) => eq.slot !== item.slot), newEquipment]);
  };

  // 장비로부터 얻은 스탯 계산 및 업데이트
  useEffect(() => {
    const equipStats = equipments.reduce(
      (acc, eq) => ({
        equipAttack: acc.equipAttack + (eq.attack || 0),
        equipStr: acc.equipStr + (eq.str || 0),
        equipDex: acc.equipDex + (eq.dex || 0),
        equipInt: acc.equipInt + (eq.int || 0),
        equipLuk: acc.equipLuk + (eq.luk || 0),
      }),
      { equipAttack: 0, equipStr: 0, equipDex: 0, equipInt: 0, equipLuk: 0 }
    );

    setStats((prev) => ({
      ...prev,
      equipAttack: equipStats.equipAttack,
      equipStr: equipStats.equipStr,
      equipDex: equipStats.equipDex,
      equipInt: equipStats.equipInt,
      equipLuk: equipStats.equipLuk,
    }));
  }, [equipments]);

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <TopAppBar selectedJob={selectedJob} onJobChange={handleJobChange} />

      <Box sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
        {/* TopBox */}
        <Box sx={{ display: "flex", gap: 3, justifyContent: "center", height: 500 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flex: "0 0 300px" }}>
            <EquipTable equipments={equipments} />
            <StatTable
              stats={stats}
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
          <DamageTable />
        </Box>

        {/* BottomBox */}
        <Box sx={{ mt: 3 }}>
          <ItemMaker onEquip={handleEquipItem} />
        </Box>
      </Box>
    </Box>
  );
}

export default App;
