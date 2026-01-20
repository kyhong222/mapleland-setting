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
import { useState, useEffect } from "react";
import { deleteSavedCharacter, type SavedCharacterData } from "../utils/characterStorage";
import { fetchItemIcon } from "../api/maplestory";

interface TopAppBarProps {
  selectedJob: string;
  onJobChange: (jobEngName: string) => void;
}

export default function TopAppBar({ selectedJob, onJobChange }: TopAppBarProps) {
  const { saveCurrentCharacter, loadCharacter, getSavedList } = useCharacter();
  const [savedList, setSavedList] = useState<SavedCharacterData[]>([]);
  const [iconCache, setIconCache] = useState<Map<number, string>>(new Map());

  // 저장 목록 새로고침
  const refreshSavedList = () => {
    const list = getSavedList();
    setSavedList(list);
  };

  // 직업 변경 시 저장 목록 갱신
  useEffect(() => {
    refreshSavedList();
  }, [selectedJob, getSavedList]);

  // 무기 아이콘 로드
  useEffect(() => {
    const loadIcons = async () => {
      const newCache = new Map(iconCache);
      for (const save of savedList) {
        if (save.weaponId && !newCache.has(save.weaponId)) {
          try {
            const iconUrl = await fetchItemIcon(save.weaponId);
            if (iconUrl) {
              newCache.set(save.weaponId, iconUrl);
            }
          } catch (error) {
            console.error(`Failed to load icon for weapon ${save.weaponId}:`, error);
          }
        }
      }
      setIconCache(newCache);
    };

    loadIcons();
  }, [savedList]);

  const handleChange = (event: SelectChangeEvent) => {
    onJobChange(event.target.value);
  };

  const handleSave = () => {
    const saved = saveCurrentCharacter();
    if (saved) {
      refreshSavedList();
      alert("현재 세팅이 저장되었습니다!");
    } else {
      alert("저장 실패: 직업을 선택해주세요.");
    }
  };

  const handleLoad = (save: SavedCharacterData) => {
    loadCharacter(save);
    alert("세팅이 로드되었습니다!");
  };

  const handleDelete = (save: SavedCharacterData, event: React.MouseEvent) => {
    event.stopPropagation();
    if (confirm("이 세팅을 삭제하시겠습니까?")) {
      deleteSavedCharacter(save.jobEngName, save.id);
      refreshSavedList();
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          메이플랜드 캐릭터 설정
        </Typography>

        {/* 저장된 세팅 버튼들 */}
        <Box sx={{ display: "flex", gap: 1, mr: 2 }}>
          {savedList.map((save, index) => {
            const iconUrl = save.weaponId ? iconCache.get(save.weaponId) : null;
            const displayContent = iconUrl ? (
              <img src={iconUrl} alt={`Save ${index + 1}`} style={{ width: 24, height: 24, display: "block" }} />
            ) : (
              <Typography variant="body2">{index + 1}</Typography>
            );

            return (
              <Tooltip key={save.id} title={`Lv.${save.level} (저장: ${new Date(save.timestamp).toLocaleString()})`}>
                <Box sx={{ position: "relative" }}>
                  <IconButton
                    onClick={() => handleLoad(save)}
                    sx={{
                      bgcolor: "rgba(255, 255, 255, 0.1)",
                      "&:hover": {
                        bgcolor: "rgba(255, 255, 255, 0.2)",
                      },
                      width: 40,
                      height: 40,
                    }}
                  >
                    {displayContent}
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => handleDelete(save, e)}
                    sx={{
                      position: "absolute",
                      top: -8,
                      right: -8,
                      bgcolor: "error.main",
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
                </Box>
              </Tooltip>
            );
          })}
        </Box>

        {/* 저장 버튼 */}
        <Button
          variant="contained"
          color="secondary"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          sx={{ mr: 2 }}
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
            {JOBS.map((job) => (
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
