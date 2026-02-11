import {
  Box,
  Typography,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useCharacter } from "../contexts/CharacterContext";
import type { PassiveSkillData } from "../types/passive";
import { propLabels } from "../types/passive";

interface PassiveDialogProps {
  passive: PassiveSkillData | null;
  onClose: () => void;
  tempLevel: number;
  onTempLevelChange: (level: number) => void;
}

export default function PassiveDialog({
  passive,
  onClose,
  tempLevel,
  onTempLevelChange,
}: PassiveDialogProps) {
  const { setPassiveLevel } = useCharacter();

  return (
    <Dialog open={!!passive} onClose={onClose} maxWidth="xs" fullWidth>
      {passive && (
        <>
          <DialogTitle>{passive.koreanName} 레벨 설정</DialogTitle>
          <DialogContent>
            <Box
              sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}
            >
              <TextField
                type="number"
                label="레벨"
                value={tempLevel}
                onChange={(e) =>
                  onTempLevelChange(
                    Math.min(
                      Math.max(0, parseInt(e.target.value) || 0),
                      passive.maxLevel,
                    ),
                  )
                }
                inputProps={{ min: 0, max: passive.maxLevel }}
                fullWidth
              />
              <Box>
                {(() => {
                  const props = passive.properties[tempLevel] || {};
                  return Object.entries(props)
                    .filter(([k]) => k !== "level")
                    .map(([k, v]) => (
                      <Typography
                        key={k}
                        variant="body2"
                        color="text.secondary"
                      >
                        {propLabels[k] || k}: +{v}
                        {k.endsWith("P") ? "%" : ""}
                      </Typography>
                    ));
                })()}
              </Box>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {(() => {
                  const max = passive.maxLevel;
                  const levels = [];
                  for (let i = 0; i <= max; i += 10) levels.push(i);
                  if (levels[levels.length - 1] !== max) levels.push(max);
                  return levels;
                })().map((level) => (
                  <Button
                    key={level}
                    size="small"
                    variant={tempLevel === level ? "contained" : "outlined"}
                    onClick={() => onTempLevelChange(level)}
                  >
                    Lv {level}
                  </Button>
                ))}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={onClose}>취소</Button>
            <Button
              onClick={() => {
                if (passive) {
                  setPassiveLevel(passive.englishName, tempLevel);
                }
                onClose();
              }}
              variant="contained"
            >
              적용
            </Button>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}
