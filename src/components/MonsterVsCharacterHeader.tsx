import { Box, Typography, Button, Dialog, DialogContent, TextField, IconButton, Tooltip, Divider } from "@mui/material";
import { Close as CloseIcon, Search as SearchIcon } from "@mui/icons-material";
import { useCharacter } from "../contexts/CharacterContext";
import { useMonster } from "../contexts/MonsterContext";
import { useMemo, useCallback } from "react";
import mobListData from "../data/mobs/mobList.json";

interface MobListEntry {
  id: number;
  name: string;
  koreanName: string;
  level: number;
  isBoss: boolean;
  foundAt: string[];
}

const mobList = mobListData as unknown as MobListEntry[];

// 지역 카테고리 매핑
const REGION_CATEGORIES: { name: string; regions: string[] }[] = [
  { name: "빅토리아", regions: ["빅토리아 아일랜드", "해외여행: 태국", "뉴 리프 시티", "해외여행: 중국", "샤레니안", "해외여행: 대만", "해외여행: 일본"] },
  { name: "엘나스", regions: ["아쿠아리움", "오르비스", "엘나스", "폐광", "무릉도원", "백초마을"] },
  { name: "루더스 호수", regions: ["아리안트", "루디브리엄", "마가티아", "루디브리엄 파퀘", "지구방위본부", "아랫마을", "시계탑 최하층", "엘린숲"] },
  { name: "리프레", regions: ["리프레"] },
  { name: "시간의 신전", regions: ["시간의 신전"] },
];

// foundAt 기반으로 지역별 그룹 생성
const mobsByRegion = (() => {
  const regionMap = new Map<string, MobListEntry[]>();
  for (const mob of mobList) {
    if (mob.foundAt.length === 0) {
      const arr = regionMap.get("기타") ?? [];
      arr.push(mob);
      regionMap.set("기타", arr);
    } else {
      for (const region of mob.foundAt) {
        const arr = regionMap.get(region) ?? [];
        arr.push(mob);
        regionMap.set(region, arr);
      }
    }
  }
  for (const [, mobs] of regionMap) mobs.sort((a, b) => a.level - b.level);
  return regionMap;
})();

export default function MonsterVsCharacterHeader() {
  const { character } = useCharacter();
  const {
    selectedMob,
    mobIcon,
    powerUpEnabled,
    magicUpEnabled,
    mobModalOpen,
    selectedSubRegion,
    mobSearchText,
    monsterHP,
    monsterPDD,
    monsterMDD,
    monsterEVA,
    monsterACC,
    setPowerUpEnabled,
    setMagicUpEnabled,
    setMobModalOpen,
    setSelectedSubRegion,
    setMobSearchText,
    handleMobSelect,
  } = useMonster();

  const job = character.getJob();
  const stats = character.getStats();
  const jobEngName = job?.engName ?? "";

  // 모달 내 표시할 몬스터 목록
  const filteredModalMobs = useMemo(() => {
    if (mobSearchText) {
      const lower = mobSearchText.toLowerCase();
      return mobList.filter(m =>
        m.koreanName.includes(lower) || m.name.toLowerCase().includes(lower)
      ).slice(0, 50);
    }
    if (selectedSubRegion) {
      return mobsByRegion.get(selectedSubRegion) ?? [];
    }
    return [];
  }, [mobSearchText, selectedSubRegion]);

  const handleMobSelectFromModal = useCallback(async (mob: MobListEntry) => {
    setMobModalOpen(false);
    setMobSearchText("");
    await handleMobSelect(mob, jobEngName);
  }, [handleMobSelect, jobEngName, setMobModalOpen, setMobSearchText]);

  return (
    <>
      <Box sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 4,
        p: 2,
        bgcolor: "#f9f9f9",
        borderRadius: 1,
        border: "1px solid #ddd",
        width: "100%",
        maxWidth: 1400,
        margin: "0 auto",
      }}>
        {/* 좌측: 캐릭터 요약 (레벨만 표시) */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 0.5, flex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: "bold" }}>
            {job?.koreanName ?? "직업 없음"}
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Lv.{stats.level}
          </Typography>
        </Box>

        {/* 중앙: VS */}
        <Typography variant="h3" sx={{ fontWeight: "bold", color: "#999", userSelect: "none" }}>
          VS
        </Typography>

        {/* 우측: 몬스터 선택 및 정보 */}
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 1, flex: 1 }}>
          <Box
            onClick={() => setMobModalOpen(true)}
            sx={{
              display: "flex",
              gap: 2,
              alignItems: "flex-start",
              cursor: "pointer",
              p: 1,
              borderRadius: 1,
              border: "1px solid transparent",
              width: "100%",
              "&:hover": { bgcolor: "#eee", borderColor: "#bbb" },
            }}
          >
            {/* 몬스터 아이콘 (크게) */}
            <Box sx={{ flexShrink: 0 }}>
              {mobIcon ? (
                <img src={mobIcon} alt={selectedMob?.koreanName ?? ""} style={{ width: 120, height: 120, objectFit: "contain" }} />
              ) : (
                <Box sx={{ width: 120, height: 120, bgcolor: "#ddd", display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 1 }}>
                  <SearchIcon sx={{ fontSize: 48, color: "#999" }} />
                </Box>
              )}
            </Box>
            
            {/* 몬스터 정보 (오른쪽 공간 활용) */}
            <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5, flex: 1, justifyContent: "center" }}>
              <Typography variant="h6" sx={{ fontWeight: selectedMob ? "bold" : "normal", mb: 0.5 }}>
                {selectedMob ? `Lv.${selectedMob.level} ${selectedMob.koreanName}` : "몬스터 선택"}
              </Typography>
              {selectedMob && (
                <>
                  <Typography variant="body2" color="text.secondary">
                    HP: {monsterHP.toLocaleString()}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    물리방어력: {monsterPDD} / 마법방어력: {monsterMDD}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    회피율: {monsterEVA} / 명중률: {monsterACC}
                  </Typography>
                </>
              )}
            </Box>
          </Box>
          
          {/* 파워업/매직업 버튼 */}
          <Box sx={{ display: "flex", gap: 1, width: "100%", justifyContent: "flex-start", pl: 1 }}>
            <Button
              size="small"
              variant={powerUpEnabled ? "contained" : "outlined"}
              onClick={() => setPowerUpEnabled(!powerUpEnabled)}
              sx={{ minWidth: 80 }}
            >
              파워업
            </Button>
            <Button
              size="small"
              variant={magicUpEnabled ? "contained" : "outlined"}
              onClick={() => setMagicUpEnabled(!magicUpEnabled)}
              sx={{ minWidth: 80 }}
            >
              매직업
            </Button>
          </Box>
        </Box>
      </Box>

      {/* 몬스터 선택 모달 (DamageReceivedTable에서 복사) */}
      <Dialog open={mobModalOpen} onClose={() => setMobModalOpen(false)} maxWidth="md" fullWidth>
        <DialogContent sx={{ p: 1.5, display: "flex", flexDirection: "column", gap: 1 }}>
          {/* 상단: 검색 + 닫기 */}
          <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
            <TextField
              size="small"
              fullWidth
              placeholder="이름 검색..."
              value={mobSearchText}
              onChange={(e) => { setMobSearchText(e.target.value); setSelectedSubRegion(null); }}
              sx={{
                "& .MuiOutlinedInput-root": { height: 32 },
                "& .MuiInputBase-input": { fontSize: "0.8rem" },
              }}
            />
            <IconButton size="small" onClick={() => setMobModalOpen(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          {/* 지역 필터 — 카테고리별 한 줄씩 */}
          {REGION_CATEGORIES.map((cat) => (
            <Box key={cat.name} sx={{ display: "flex", gap: 0.5, flexWrap: "wrap", alignItems: "center" }}>
              <Typography variant="caption" sx={{ width: 60, flexShrink: 0, color: "#666", fontWeight: "bold", fontSize: "0.7rem" }}>
                {cat.name}
              </Typography>
              {cat.regions.map((region) => (
                <Button
                  key={region}
                  size="small"
                  variant={selectedSubRegion === region ? "contained" : "outlined"}
                  onClick={() => {
                    setSelectedSubRegion(selectedSubRegion === region ? null : region);
                    setMobSearchText("");
                  }}
                  sx={{ minWidth: "auto", px: 1, py: 0.125, fontSize: "0.7rem", textTransform: "none" }}
                >
                  {region}
                </Button>
              ))}
            </Box>
          ))}
          <Divider />
          {/* 몬스터 그리드 */}
          <Box sx={{ maxHeight: 450, overflow: "auto" }}>
            {filteredModalMobs.length > 0 ? (
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {filteredModalMobs.map((mob) => (
                  <Tooltip
                    key={mob.id}
                    title={`Lv.${mob.level} ${mob.koreanName || mob.name}`}
                    arrow
                    placement="top"
                  >
                    <Box
                      onClick={() => handleMobSelectFromModal(mob)}
                      sx={{
                        width: 44, height: 44,
                        border: selectedMob?.id === mob.id ? "2px solid #1976d2" : "1px solid #ddd",
                        borderRadius: 1,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        cursor: "pointer",
                        bgcolor: selectedMob?.id === mob.id ? "#e3f2fd" : "#fff",
                        "&:hover": { bgcolor: "#f0f7ff", borderColor: "#1976d2" },
                        overflow: "hidden",
                        position: "relative",
                        "@keyframes spin": { to: { transform: "rotate(360deg)" } },
                      }}
                    >
                      <Box sx={{
                        position: "absolute",
                        width: 14, height: 14,
                        border: "2px solid #e0e0e0",
                        borderTopColor: "#999",
                        borderRadius: "50%",
                        animation: "spin 0.8s linear infinite",
                      }} />
                      <img
                        src={`https://maplestory.io/api/gms/62/mob/${mob.id}/icon`}
                        alt={mob.koreanName || mob.name}
                        style={{ maxWidth: 40, maxHeight: 40, objectFit: "contain", position: "relative" }}
                        loading="lazy"
                        onLoad={(e) => {
                          const spinner = e.currentTarget.previousElementSibling as HTMLElement;
                          if (spinner) spinner.style.display = "none";
                        }}
                        onError={(e) => {
                          const img = e.currentTarget;
                          if (img.src.includes("/gms/62/")) {
                            img.src = `https://maplestory.io/api/gms/200/mob/${mob.id}/icon`;
                          } else if (img.src.includes("/gms/200/")) {
                            img.src = `https://maplestory.io/api/kms/284/mob/${mob.id}/icon`;
                          }
                        }}
                      />
                    </Box>
                  </Tooltip>
                ))}
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: "#999", textAlign: "center", py: 4 }}>
                {mobSearchText ? "검색 결과가 없습니다" : "지역을 선택하세요"}
              </Typography>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}
