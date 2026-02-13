import { Box, Button, Typography } from "@mui/material";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { CharacterProvider, useCharacter } from "./contexts/CharacterContext";
import TopAppBar from "./components/TopAppBar";
import StatTable from "./components/StatTable";
import EquipTable from "./components/EquipTable";
import BuffTable from "./components/BuffTable";
import DamageTable from "./components/DamageTable";
import DamageReceivedTable from "./components/DamageReceivedTable";
import Inventory from "./components/Inventory";
import DetailStatTable from "./components/DetailStatTable";
import ItemMakerModal from "./components/ItemMakerModal";
import { JOBS, JOB_COLORS } from "./types/job";
import { useState, useEffect, useRef, useMemo } from "react";
import { migrateFromLegacyStorage, getLastActive, getSlotData } from "./utils/characterStorage";
import "./App.css";

function AppContent() {
  const { character, setJob, loadCharacter, setCurrentSlotIdx, loadSlot } = useCharacter();
  const [selectedCategory, setSelectedCategory] = useState("");
  const [itemMakerOpen, setItemMakerOpen] = useState(false);
  const [itemMakerMode, setItemMakerMode] = useState<"equip" | "inventory">("equip");
  const [middlePanel, setMiddlePanel] = useState<"buff" | "inventory" | "detailStat">("buff");
  const [equipExpanded, setEquipExpanded] = useState(false);
  const initializedRef = useRef(false);

  const currentJob = character.getJob();
  const selectedJob = currentJob?.engName || "";

  // 페이지 로드 시 마이그레이션 + 자동 로드
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    migrateFromLegacyStorage();

    const lastActive = getLastActive();
    if (lastActive) {
      const job = JOBS.find((j) => j.engName === lastActive.jobEngName);
      if (job) {
        setJob(job);
        setCurrentSlotIdx(lastActive.slotIdx);

        const savedData = getSlotData(lastActive.jobEngName, lastActive.slotIdx);
        if (savedData) {
          loadCharacter(savedData);
        }
      }
    }
  }, [setJob, setCurrentSlotIdx, loadCharacter]);

  const handleJobChange = (jobEngName: string) => {
    const job = JOBS.find((j) => j.engName === jobEngName) || null;
    setJob(job);
    // 직업 변경 시 해당 직업의 첫 번째 슬롯 로드
    loadSlot(0);
  };

  const handleOpenItemMakerForSlot = (category: string) => {
    setSelectedCategory(category);
    setItemMakerMode("equip");
    setItemMakerOpen(true);
  };

  const handleOpenItemMakerForInventory = () => {
    setItemMakerMode("inventory");
    setItemMakerOpen(true);
  };

  const handleCloseItemMaker = () => {
    setItemMakerOpen(false);
    setSelectedCategory("");
  };

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <TopAppBar selectedJob={selectedJob} onJobChange={handleJobChange} />

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
                const color = JOB_COLORS[job.engName] || "#1976d2";
                return (
                  <Button
                    key={job.engName}
                    variant="outlined"
                    size="large"
                    onClick={() => handleJobChange(job.engName)}
                    sx={{
                      minWidth: 120,
                      color,
                      borderColor: color,
                      "&:hover": {
                        borderColor: color,
                        backgroundColor: `${color}0A`,
                      },
                    }}
                  >
                    {job.koreanName}
                  </Button>
                );
              })}
            </Box>
          </Box>
        ) : (
          <>
            {/* 직업이 선택된 경우: 테이블들 렌더링 */}
            <Box sx={{ display: "flex", gap: 3, justifyContent: "center", mb: 3 }}>
              {/* 왼쪽: 장비 + 스탯 */}
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <EquipTable onSlotClick={handleOpenItemMakerForSlot} onOpenItemMaker={handleOpenItemMakerForInventory} onOpenInventory={() => setMiddlePanel((v) => v === "inventory" ? "buff" : "inventory")} onExpandedChange={setEquipExpanded} />
                {!equipExpanded && <StatTable onOpenDetailStat={() => setMiddlePanel((v) => v === "detailStat" ? "buff" : "detailStat")} />}
              </Box>

              {/* 중간: 버프 / 인벤토리 / 상세스탯 */}
              {middlePanel === "inventory" ? (
                <Inventory onClose={() => setMiddlePanel("buff")} />
              ) : middlePanel === "detailStat" ? (
                <DetailStatTable onClose={() => setMiddlePanel("buff")} />
              ) : (
                <BuffTable />
              )}

              {/* 오른쪽: 데미지 */}
              {middlePanel === "detailStat" ? <DamageReceivedTable /> : <DamageTable />}
            </Box>
          </>
        )}
      </Box>

      {/* 아이템 메이커 모달 */}
      <ItemMakerModal open={itemMakerOpen} selectedCategory={selectedCategory} onClose={handleCloseItemMaker} mode={itemMakerMode} />
    </Box>
  );
}

function DynamicThemeProvider({ children }: { children: React.ReactNode }) {
  const { character } = useCharacter();
  const currentJob = character.getJob();
  const primaryColor = currentJob ? JOB_COLORS[currentJob.engName] || "#1976d2" : "#1976d2";

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          primary: { main: primaryColor },
        },
      }),
    [primaryColor],
  );

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

function App() {
  return (
    <CharacterProvider>
      <DynamicThemeProvider>
        <AppContent />
      </DynamicThemeProvider>
    </CharacterProvider>
  );
}

export default App;
