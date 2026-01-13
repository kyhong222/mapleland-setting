import { useState } from "react";
import { Box } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import TopAppBar from "./components/TopAppBar";
import EquipTable from "./components/EquipTable";
import StatTable from "./components/StatTable";
import BuffTable from "./components/BuffTable";
import DamageTable from "./components/DamageTable";
import ItemMaker from "./components/ItemMaker";
import "./App.css";

function App() {
  const [selectedJob, setSelectedJob] = useState("");
  const [mapleWarriorLevel, setMapleWarriorLevel] = useState(1);
  const [buff1Attack, setBuff1Attack] = useState(0);
  const [buff2Attack, setBuff2Attack] = useState(0);
  const [heroEchoEnabled, setHeroEchoEnabled] = useState(false);

  const handleJobChange = (event: SelectChangeEvent) => {
    setSelectedJob(event.target.value);
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <TopAppBar selectedJob={selectedJob} onJobChange={handleJobChange} />

      <Box sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
        {/* TopBox */}
        <Box sx={{ display: "flex", gap: 3, justifyContent: "center", height: 500 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flex: "0 0 300px" }}>
            <EquipTable />
            <StatTable
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
          <ItemMaker />
        </Box>
      </Box>
    </Box>
  );
}

export default App;
