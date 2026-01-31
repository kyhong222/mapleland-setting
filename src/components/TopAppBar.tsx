import {
  AppBar,
  Toolbar,
  Typography,
  Select,
  MenuItem,
  FormControl,
  Button,
  IconButton,
  Tooltip,
  Box,
} from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { JOBS } from "../types/job";
import { Save as SaveIcon, Close as CloseIcon } from "@mui/icons-material";
import { useCharacter } from "../contexts/CharacterContext";
import { useState, useEffect, useCallback } from "react";
import { MAX_SLOTS, type SavedCharacterData } from "../utils/characterStorage";
import { fetchItemIcon } from "../api/maplestory";

interface TopAppBarProps {
  selectedJob: string;
  onJobChange: (jobEngName: string) => void;
}

export default function TopAppBar({
  selectedJob,
  onJobChange,
}: TopAppBarProps) {
  const {
    character,
    saveCurrentCharacter,
    loadSlot,
    deleteSlot,
    getSlotSummaries,
    currentSlotIdx,
  } = useCharacter();
  const [slotSummaries, setSlotSummaries] = useState<
    (SavedCharacterData | null)[]
  >(Array(MAX_SLOTS).fill(null));
  const [iconCache, setIconCache] = useState<Map<number, string>>(new Map());

  // 슬롯 요약 새로고침
  const refreshSlots = useCallback(() => {
    setSlotSummaries(getSlotSummaries());
  }, [getSlotSummaries]);

  // 직업 변경 시 슬롯 목록 갱신
  useEffect(() => {
    setSlotSummaries(getSlotSummaries());
    setIconCache(new Map()); // 직업 변경 시 아이콘 캐시 초기화
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedJob]);

  // 무기 아이콘 로드
  useEffect(() => {
    const loadIcons = async () => {
      const newCache = new Map(iconCache);
      let changed = false;
      for (const slot of slotSummaries) {
        if (slot?.weaponId && !newCache.has(slot.weaponId)) {
          try {
            const iconUrl = await fetchItemIcon(slot.weaponId);
            if (iconUrl) {
              newCache.set(slot.weaponId, iconUrl);
              changed = true;
            }
          } catch (error) {
            console.error(
              `Failed to load icon for weapon ${slot.weaponId}:`,
              error,
            );
          }
        }
      }
      if (changed) setIconCache(newCache);
    };

    loadIcons();
  }, [slotSummaries, iconCache]);

  const handleChange = (event: SelectChangeEvent) => {
    onJobChange(event.target.value);
  };

  const handleSave = () => {
    const saved = saveCurrentCharacter();
    if (saved) {
      const job = character.getJob();
      const jobName = job?.koreanName || "직업";
      const slotNumber = currentSlotIdx + 1;
      alert(`${jobName}-${slotNumber}번 슬롯에 저장되었습니다!`);
      refreshSlots();
    } else {
      alert("저장 실패: 직업을 선택해주세요.");
    }
  };

  const handleSlotClick = (slotIdx: number) => {
    loadSlot(slotIdx);
    refreshSlots();
  };

  const handleDelete = (slotIdx: number, event: React.MouseEvent) => {
    event.stopPropagation();
    if (confirm("이 슬롯의 세팅을 삭제하시겠습니까?")) {
      deleteSlot(slotIdx);
      refreshSlots();
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          메이플랜드 아이템 시뮬레이터 - {currentSlotIdx + 1}번 슬롯
        </Typography>

        {/* 5칸 슬롯 버튼 */}
        <Box sx={{ display: "flex", gap: 1, mr: 2 }}>
          {slotSummaries.map((slotData, idx) => {
            const isActive = idx === currentSlotIdx;
            const hasData = slotData !== null;
            const iconUrl = slotData?.weaponId
              ? iconCache.get(slotData.weaponId)
              : null;

            const displayContent = iconUrl ? (
              <img
                src={iconUrl}
                alt={`Slot ${idx + 1}`}
                style={{ width: 24, height: 24, display: "block" }}
              />
            ) : (
              <Typography
                variant="body2"
                sx={{ color: hasData ? "white" : "rgba(255,255,255,0.4)" }}
              >
                {idx + 1}
              </Typography>
            );

            const tooltipTitle = hasData
              ? `슬롯 ${idx + 1}: Lv.${slotData.level} (${new Date(slotData.timestamp).toLocaleString()})`
              : `슬롯 ${idx + 1}: 비어있음`;

            return (
              <Tooltip key={idx} title={tooltipTitle}>
                <Box sx={{ position: "relative" }}>
                  <IconButton
                    onClick={() => handleSlotClick(idx)}
                    sx={{
                      bgcolor: isActive
                        ? "rgba(255, 255, 255, 0.3)"
                        : hasData
                          ? "rgba(255, 255, 255, 0.1)"
                          : "rgba(255, 255, 255, 0.03)",
                      border: isActive
                        ? "2px solid white"
                        : "2px solid transparent",
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.2)",
                      },
                      width: 40,
                      height: 40,
                    }}
                  >
                    {displayContent}
                  </IconButton>
                  {hasData && (
                    <IconButton
                      size="small"
                      onClick={(e) => handleDelete(idx, e)}
                      sx={{
                        position: "absolute",
                        top: -8,
                        right: -8,
                        bgcolor: "error.main",
                        border: "2px solid white",
                        "&:hover": {
                          bgcolor: "error.dark",
                        },
                        width: 20,
                        height: 20,
                        padding: 0,
                      }}
                    >
                      <CloseIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  )}
                </Box>
              </Tooltip>
            );
          })}
        </Box>

        {/* 저장 버튼 */}
        <Button
          variant="outlined"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          sx={{
            mr: 2,
            color: "success.light",
            borderColor: "success.light",
            bgcolor: "white",
            "&:hover": { borderColor: "success.main", bgcolor: "white" },
          }}
          disabled={!selectedJob}
        >
          저장
        </Button>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value={selectedJob}
            onChange={handleChange}
            displayEmpty
            sx={{
              color: "white",
              ".MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255, 255, 255, 0.23)",
              },
              "&:hover .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255, 255, 255, 0.5)",
              },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                borderColor: "white",
              },
              ".MuiSvgIcon-root": {
                color: "white",
              },
            }}
          >
            <MenuItem value="">
              <em>직업 선택</em>
            </MenuItem>
            {JOBS.filter((job) => job.engName !== "pirate").map((job) => (
              <MenuItem key={job.engName} value={job.engName}>
                {job.koreanName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Toolbar>
    </AppBar>
  );
}
