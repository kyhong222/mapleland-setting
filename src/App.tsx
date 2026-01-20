import { Box } from "@mui/material";
import { CharacterProvider, useCharacter } from "./contexts/CharacterContext";
import TopAppBar from "./components/TopAppBar";
import StatTable from "./components/StatTable";
import EquipTable from "./components/EquipTable";
import BuffTable from "./components/BuffTable";
import DamageTable from "./components/DamageTable";
import ItemMaker from "./components/ItemMaker";
import { JOBS } from "./types/job";
import { useState } from "react";
import "./App.css";

function AppContent() {
  const { character, setJob } = useCharacter();
  const [selectedCategory, setSelectedCategory] = useState("");

  const currentJob = character.getJob();
  const selectedJob = currentJob?.engName || "";

  const handleJobChange = (jobEngName: string) => {
    const job = JOBS.find((j) => j.engName === jobEngName) || null;
    setJob(job);
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <TopAppBar selectedJob={selectedJob} onJobChange={handleJobChange} />

      <Box sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
        {/* 상단: 테이블들 */}
        <Box sx={{ display: "flex", gap: 3, justifyContent: "center", mb: 3 }}>
          {/* 왼쪽: 장비 + 스탯 */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <EquipTable onSlotClick={setSelectedCategory} />
            <StatTable />
          </Box>

          {/* 중간: 버프 */}
          <BuffTable />

          {/* 오른쪽: 데미지 */}
          <DamageTable />
        </Box>

        {/* 하단: 아이템 메이커 */}
        <ItemMaker selectedCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
      </Box>
    </Box>
  );
}

function App() {
  return (
    <CharacterProvider>
      <AppContent />
    </CharacterProvider>
  );
}

export default App;
