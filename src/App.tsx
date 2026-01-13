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

  const handleJobChange = (event: SelectChangeEvent) => {
    setSelectedJob(event.target.value);
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <TopAppBar selectedJob={selectedJob} onJobChange={handleJobChange} />

      <Box sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", gap: 3, justifyContent: "center", height: 500 }}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, flex: "0 0 300px" }}>
            <EquipTable />
            <StatTable selectedJob={selectedJob} mapleWarriorLevel={mapleWarriorLevel} />
          </Box>
          <BuffTable mapleWarriorLevel={mapleWarriorLevel} onMapleWarriorLevelChange={setMapleWarriorLevel} />
          <DamageTable />
        </Box>

        <Box sx={{ mt: 3 }}>
          <ItemMaker />
        </Box>
      </Box>
    </Box>
  );
}

export default App;
