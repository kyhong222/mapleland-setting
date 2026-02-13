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

interface MapleWarriorDialogProps {
  open: boolean;
  onClose: () => void;
  tempLevel: number;
  onTempLevelChange: (level: number) => void;
}

const QUICK_LEVELS = [0, 10, 20, 30];

export default function MapleWarriorDialog({
  open,
  onClose,
  tempLevel,
  onTempLevelChange,
}: MapleWarriorDialogProps) {
  const { setMapleWarriorLevel } = useCharacter();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>메이플 용사 레벨 설정</DialogTitle>
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
                Math.min(Math.max(0, parseInt(e.target.value) || 0), 30),
              )
            }
            inputProps={{ min: 0, max: 30 }}
            fullWidth
          />
          <Typography variant="body2" color="text.secondary">
            스탯 {Math.floor((tempLevel + 1) / 2)}% 증가
          </Typography>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {QUICK_LEVELS.map((level) => (
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
            setMapleWarriorLevel(tempLevel);
            onClose();
          }}
          variant="contained"
        >
          적용
        </Button>
      </DialogActions>
    </Dialog>
  );
}
