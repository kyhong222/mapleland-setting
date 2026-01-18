import { Box, Typography, Slider, TextField, Checkbox, FormControlLabel } from "@mui/material";
import { useCharacter } from "../contexts/CharacterContext";

export default function BuffTable() {
  const {
    character,
    setMapleWarriorLevel,
    setBuff1Attack,
    setBuff2Attack,
    setHeroEchoEnabled,
    buff1Attack,
    buff2Attack,
  } = useCharacter();

  const mapleWarrior = character.getBuff("mapleWarrior");
  const heroEcho = character.getBuff("heroEcho");

  const handleMapleWarriorChange = (_event: Event, value: number | number[]) => {
    setMapleWarriorLevel(value as number);
  };

  const mapleWarriorMarks = Array.from({ length: 21 }, (_, i) => ({
    value: i,
    label: i % 5 === 0 ? i.toString() : undefined,
  }));

  return (
    <Box
      sx={{
        width: 400,
        height: 500,
        border: "1px solid #ccc",
        borderRadius: 1,
        bgcolor: "#f5f5f5",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* 타이틀 */}
      <Typography variant="body2" sx={{ fontWeight: "bold", p: 1.5, borderBottom: "1px solid #ccc" }}>
        버프
      </Typography>

      {/* 버프 내용 */}
      <Box sx={{ p: 2, display: "flex", flexDirection: "column", gap: 3 }}>
        {/* 메이플 용사 */}
        <Box>
          <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
            메이플 용사: {mapleWarrior?.level || 0}
          </Typography>
          <Box sx={{ px: 2 }}>
            <Slider
              value={mapleWarrior?.level || 0}
              onChange={handleMapleWarriorChange}
              min={0}
              max={20}
              step={1}
              marks={mapleWarriorMarks}
              valueLabelDisplay="auto"
            />
          </Box>
        </Box>

        {/* 버프 1 */}
        <Box>
          <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
            버프 1 공격력
          </Typography>
          <TextField
            type="number"
            size="small"
            value={buff1Attack}
            onChange={(e) => setBuff1Attack(parseInt(e.target.value) || 0)}
            fullWidth
            sx={{
              "& .MuiInputBase-input": {
                bgcolor: "white",
              },
            }}
          />
        </Box>

        {/* 버프 2 */}
        <Box>
          <Typography variant="body2" sx={{ fontWeight: "bold", mb: 1 }}>
            버프 2 공격력
          </Typography>
          <TextField
            type="number"
            size="small"
            value={buff2Attack}
            onChange={(e) => setBuff2Attack(parseInt(e.target.value) || 0)}
            fullWidth
            sx={{
              "& .MuiInputBase-input": {
                bgcolor: "white",
              },
            }}
          />
        </Box>

        {/* 영웅의 메아리 */}
        <Box>
          <FormControlLabel
            control={
              <Checkbox checked={heroEcho?.enabled || false} onChange={(e) => setHeroEchoEnabled(e.target.checked)} />
            }
            label="영웅의 메아리 (+4%)"
          />
        </Box>
      </Box>
    </Box>
  );
}
