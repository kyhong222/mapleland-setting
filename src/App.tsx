import { Box, Button, Typography } from "@mui/material";
import { CharacterProvider, useCharacter } from "./contexts/CharacterContext";
import TopAppBar from "./components/TopAppBar";
import StatTable from "./components/StatTable";
import EquipTable from "./components/EquipTable";
import BuffTable from "./components/BuffTable";
import DamageTable from "./components/DamageTable";
import ItemMakerModal from "./components/ItemMakerModal";
import { JOBS } from "./types/job";
import { useState } from "react";
import "./App.css";

function AppContent() {
  const { character, setJob } = useCharacter();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [itemMakerOpen, setItemMakerOpen] = useState(false);

  const currentJob = character.getJob();
  const selectedJob = currentJob?.engName || "";

  const handleJobChange = (jobEngName: string) => {
    const job = JOBS.find((j) => j.engName === jobEngName) || null;
    setJob(job);
  };

  const handleOpenItemMaker = (category?: string) => {
    if (category) {
      setSelectedCategory(category);
    }
    setItemMakerOpen(true);
  };

  const handleCloseItemMaker = () => {
    setItemMakerOpen(false);
    setSelectedCategory("");
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <TopAppBar selectedJob={selectedJob} onJobChange={handleJobChange} onOpenItemMaker={handleOpenItemMaker} />

      <Box sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
        {/* 직업이 선택되지 않았을 경우: 직업 선택 화면 */}
        {!currentJob ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              flex: 1,
              gap: 3,
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: "bold" }}>
              직업을 선택하세요
            </Typography>
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", justifyContent: "center" }}>
              {JOBS.map((job) => {
                if (job.engName === "warrior") {
                  return (
                    <Button
                      key={job.engName}
                      variant="outlined"
                      size="large"
                      color="error"
                      onClick={() => handleJobChange(job.engName)}
                      sx={{ minWidth: 120 }}
                    >
                      {job.koreanName}
                    </Button>
                  );
                } else if (job.engName === "archer") {
                  return (
                    <Button
                      key={job.engName}
                      variant="outlined"
                      size="large"
                      color="success"
                      onClick={() => handleJobChange(job.engName)}
                      sx={{ minWidth: 120 }}
                    >
                      {job.koreanName}
                    </Button>
                  );
                } else if (job.engName === "magician") {
                  return (
                    <Button
                      key={job.engName}
                      variant="outlined"
                      size="large"
                      onClick={() => handleJobChange(job.engName)}
                      sx={{
                        minWidth: 120,
                        color: "#9c27b0",
                        borderColor: "#9c27b0",
                        "&:hover": {
                          borderColor: "#9c27b0",
                          backgroundColor: "rgba(156, 39, 176, 0.04)",
                        },
                      }}
                    >
                      {job.koreanName}
                    </Button>
                  );
                } else if (job.engName === "thief") {
                  return (
                    <Button
                      key={job.engName}
                      variant="outlined"
                      size="large"
                      onClick={() => handleJobChange(job.engName)}
                      sx={{
                        minWidth: 120,
                        color: "#D81B60",
                        borderColor: "#D81B60",
                        "&:hover": {
                          borderColor: "#D81B60",
                          backgroundColor: "rgba(216, 27, 96, 0.04)",
                        },
                      }}
                    >
                      {job.koreanName}
                    </Button>
                  );
                }
              })}
            </Box>
          </Box>
        ) : (
          <>
            {/* 직업이 선택된 경우: 테이블들 렌더링 */}
            <Box sx={{ display: "flex", gap: 3, justifyContent: "center", mb: 3 }}>
              {/* 왼쪽: 장비 + 스탯 */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <EquipTable onSlotClick={handleOpenItemMaker} />
                <StatTable />
              </Box>

              {/* 중간: 버프 */}
              <BuffTable />

              {/* 오른쪽: 데미지 */}
              <DamageTable />
            </Box>
          </>
        )}
      </Box>

      {/* 아이템 메이커 모달 */}
      <ItemMakerModal open={itemMakerOpen} selectedCategory={selectedCategory} onClose={handleCloseItemMaker} />
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
