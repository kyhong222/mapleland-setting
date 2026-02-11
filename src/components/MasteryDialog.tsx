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
import type { MasteryProperty } from "../types/mastery";
import mastery1Data from "../data/buff/mastery/mastery1.json";
import mastery2Data from "../data/buff/mastery/mastery2.json";

interface MasteryDialogProps {
  mastery1Open: boolean;
  onMastery1Close: () => void;
  tempMastery1Level: number;
  onTempMastery1Change: (level: number) => void;
  mastery2Open: boolean;
  onMastery2Close: () => void;
  tempMastery2Level: number;
  onTempMastery2Change: (level: number) => void;
}

export default function MasteryDialog({
  mastery1Open,
  onMastery1Close,
  tempMastery1Level,
  onTempMastery1Change,
  mastery2Open,
  onMastery2Close,
  tempMastery2Level,
  onTempMastery2Change,
}: MasteryDialogProps) {
  const { character, setMastery1, setMastery2 } = useCharacter();

  return (
    <>
      {/* Mastery 1 Dialog */}
      <Dialog
        open={mastery1Open}
        onClose={onMastery1Close}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>마스터리 레벨 설정</DialogTitle>
        <DialogContent>
          <Box
            sx={{ pt: 2, display: "flex", flexDirection: "column", gap: 2 }}
          >
            <TextField
              type="number"
              label="레벨"
              value={tempMastery1Level}
              onChange={(e) =>
                onTempMastery1Change(
                  Math.min(
                    Math.max(0, parseInt(e.target.value) || 0),
                    mastery1Data.properties.length - 1,
                  ),
                )
              }
              inputProps={{ min: 0, max: mastery1Data.properties.length - 1 }}
              fullWidth
            />
            <Box>
              <Typography variant="body2" color="text.secondary">
                숙련도:{" "}
                {(mastery1Data.properties[tempMastery1Level]?.mastery || 0) +
                  10}
                % (기본 10% + 스킬{" "}
                {mastery1Data.properties[tempMastery1Level]?.mastery || 0}%)
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {(() => {
                const max = mastery1Data.properties.length - 1;
                const levels = [];
                for (let i = 0; i <= max; i += 10) levels.push(i);
                if (levels[levels.length - 1] !== max) levels.push(max);
                return levels;
              })().map((level) => (
                <Button
                  key={level}
                  size="small"
                  variant={
                    tempMastery1Level === level ? "contained" : "outlined"
                  }
                  onClick={() => onTempMastery1Change(level)}
                >
                  Lv {level}
                </Button>
              ))}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onMastery1Close}>취소</Button>
          <Button
            onClick={() => {
              setMastery1(tempMastery1Level);
              onMastery1Close();
            }}
            variant="contained"
          >
            적용
          </Button>
        </DialogActions>
      </Dialog>

      {/* Mastery 2 Dialog */}
      <Dialog
        open={mastery2Open}
        onClose={onMastery2Close}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>추가 마스터리 레벨 설정</DialogTitle>
        <DialogContent>
          {(() => {
            const weaponType = character.getWeaponType();
            let skillData = null;
            if (weaponType === "활") {
              skillData = mastery2Data.find(
                (m) => m.koreanName === "보우 엑스퍼트",
              );
            } else if (weaponType === "석궁") {
              skillData = mastery2Data.find(
                (m) => m.koreanName === "크로스보우 엑스퍼트",
              );
            } else if (weaponType === "창" || weaponType === "폴암") {
              skillData = mastery2Data.find((m) => m.koreanName === "비홀더");
            }

            if (!skillData) return null;

            const maxLevel = skillData.properties.length - 1;

            return (
              <Box
                sx={{
                  pt: 2,
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <TextField
                  type="number"
                  label="레벨"
                  value={tempMastery2Level}
                  onChange={(e) =>
                    onTempMastery2Change(
                      Math.min(
                        Math.max(0, parseInt(e.target.value) || 0),
                        maxLevel,
                      ),
                    )
                  }
                  inputProps={{ min: 0, max: maxLevel }}
                  fullWidth
                />
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    숙련도:{" "}
                    {skillData.properties[tempMastery2Level]?.mastery ?? 0}%
                  </Typography>
                  {(() => {
                    const prop: MasteryProperty | undefined =
                      skillData.properties[tempMastery2Level];
                    const attValue = prop?.att ?? 0;
                    if (attValue > 0) {
                      return (
                        <Typography variant="body2" color="text.secondary">
                          공격력: +{attValue}
                        </Typography>
                      );
                    }
                    return null;
                  })()}
                </Box>
                <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  {(() => {
                    const levels = [];
                    for (let i = 0; i <= maxLevel; i += 10) levels.push(i);
                    if (levels[levels.length - 1] !== maxLevel)
                      levels.push(maxLevel);
                    return levels;
                  })().map((level) => (
                    <Button
                      key={level}
                      size="small"
                      variant={
                        tempMastery2Level === level ? "contained" : "outlined"
                      }
                      onClick={() => onTempMastery2Change(level)}
                    >
                      Lv {level}
                    </Button>
                  ))}
                </Box>
              </Box>
            );
          })()}
        </DialogContent>
        <DialogActions>
          <Button onClick={onMastery2Close}>취소</Button>
          <Button
            onClick={() => {
              setMastery2(tempMastery2Level);
              onMastery2Close();
            }}
            variant="contained"
          >
            적용
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
