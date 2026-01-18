import { AppBar, Toolbar, Typography, Select, MenuItem, FormControl } from "@mui/material";
import type { SelectChangeEvent } from "@mui/material";
import { JOBS } from "../types/job";

interface TopAppBarProps {
  selectedJob: string;
  onJobChange: (jobEngName: string) => void;
}

export default function TopAppBar({ selectedJob, onJobChange }: TopAppBarProps) {
  const handleChange = (event: SelectChangeEvent) => {
    onJobChange(event.target.value);
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          메이플랜드 캐릭터 설정
        </Typography>
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
